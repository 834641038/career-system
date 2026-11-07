"""job_adapter.py —— prod 库 → 推荐算法 的组装层

设计原则
--------
1. **不改原系统任何逻辑**：本文件是纯新增模块，仅被 `sample_data.py` 的两个取数函数
   以 try-import 方式调用；任何异常都向上抛，由调用方回退到原样例数据。
2. **表结构零假设**：所有列名来自实际 prod 库（2026-11-06 核对）。
3. **缺失即降级**：库里没有的字段（min_gpa / grade_range / duration / work_mode）
   用算法默认值，不编造。

关键业务决策（均有数据支撑，见 report/13-第二轮计划.md）
------------------------------------------------------
- 霍兰德码 → holland_match 权重：0.6 / 0.25 / 0.15
  理由：holland_code 是按岗位类别映射的（非真实测评），过度集中于第一码会放大映射误差。
- 技能分级：required_level >= 3（熟练/精通）→ 必需技能；== 2（仅提及）→ 加分技能
  理由：原 requirement_type 全为"必需技能"，若照搬会让加分技能恒空、技能分封顶 70 分。
- 技能父级展开：学生侧展开，PARENT_FOLD = 0.6
  会 Vue 3 级 → 前端有效 1.8 级。既能让会 Vue 的学生命中 88 个"前端"岗（不遗漏），
  又不至于让他误以为已达标（不虚高）。
- location：city "广东 深圳" → "深圳"（算法做精确相等匹配，必须拆市级）
"""

from __future__ import annotations

import logging
import threading

logger = logging.getLogger(__name__)

# ============ 可调常量 ============
PARENT_FOLD = 0.6          # 子技能 → 父技能 的折算系数
HOLLAND_WEIGHTS = (0.6, 0.25, 0.15)   # 一码/二码/三码 权重
REQUIRED_LEVEL_MIN = 3     # >= 此等级算"必需技能"，其余算"加分技能"

# 专业名归一：教育部专业名有多个版本，学生填写的写法与库内 13 专业常不一致。
# 实测：样例学生"数据科学与大数据技术"与库内"大数据管理与应用"无包含关系，
# 导致算法 major_score 恒为保底 60（学业分 30% 权重失效）。
MAJOR_ALIAS = {
    "数据科学与大数据技术": "大数据管理与应用",
    "数据科学": "大数据管理与应用",
    "大数据": "大数据管理与应用",
    "计算机科学": "计算机科学与技术",
    "计算机": "计算机科学与技术",
    "计算机科学与技术": "计算机科学与技术",
    "软件工程": "软件工程",
    "信息管理与信息系统": "信息资源管理",
    "信息管理": "信息资源管理",
    "图书情报": "信息资源管理",
    "图书馆学": "档案学",
    "会计": "会计学",
    "财务管理": "会计学",
    "会计学": "会计学",
    "应用统计": "统计学",
    "统计": "统计学",
    "统计学": "统计学",
    "应用心理": "应用心理学",
    "心理学": "心理学",
    "教育技术": "教育学",
    "教育学": "教育学",
    "数学": "数学与应用数学",
    "信息与计算科学": "信息与计算科学",
    "物理": "物理学",
    "物理学": "物理学",
    "档案": "档案学",
    "档案学": "档案学",
}


def normalize_major(major):
    """把学生填写的专业名归一到库内 13 专业名；不认识的原样返回"""
    if not major:
        return ""
    m = str(major).strip()
    if m in MAJOR_ALIAS:
        return MAJOR_ALIAS[m]
    for k, v in MAJOR_ALIAS.items():     # 兜底：包含关系
        if len(k) >= 2 and k in m:
            return v
    return m
CONN_STR = ("SERVER=localhost;DATABASE=career_system_prod;"
            "UID=app_user;PWD=34rj>sh&2uio3(jk12e;Driver={ODBC Driver 17 for SQL Server}")

# ============ 模块级缓存 ============
_cache = {}
_cache_lock = threading.Lock()
CACHE_TTL = 300            # 秒


def _connect():
    import pyodbc
    return pyodbc.connect(CONN_STR, timeout=5)


def _cached(key, loader):
    """带 TTL 的简单缓存，避免每次请求都全表查"""
    import time
    now = time.time()
    with _cache_lock:
        item = _cache.get(key)
        if item and now - item[0] < CACHE_TTL:
            return item[1]
    val = loader()
    with _cache_lock:
        _cache[key] = (now, val)
    return val


# ============ 岗位侧组装 ============

MUNICIPALITIES = {"北京", "上海", "天津", "重庆"}


def _city_to_location(city):
    """'广东 深圳' → '深圳'；'天津 滨海新区' → '天津'；'天津 天津' → '天津'；空 → ''

    直辖市特殊处理：city 两段式里第一段是省/直辖市，第二段对普通省份是地级市、
    对直辖市却是「区」（滨海新区/北辰区/河西区…）。若统一取末段，"天津 滨海新区"
    会变成 location='滨海新区'，前端筛"天津"就漏掉这些岗位（实测漏 145 个）。
    """
    if not city:
        return ""
    parts = str(city).replace("/", " ").split()
    if not parts:
        return ""
    if len(parts) >= 2 and parts[0] in MUNICIPALITIES:
        return parts[0]
    return parts[-1]


def _holland_match(code):
    """'IEC' → {'I': 0.6, 'E': 0.25, 'C': 0.15}

    关键：码为空时返回**均匀分布**而不是空 dict。
    原因是 holland_weighted_distance 的公式 sum(weight*(s-job_score)^2)，
    权重全 0 会让距离恒为 0 → 匹配度 100 分。
    实测该 bug 让 7 个"无霍兰德码"的岗位（储备干部/管培生/必须大专…）全部拿到
    霍兰德满分、挤进推荐 Top5。均匀分布表示"信息缺失，按中性处理"，得 50 分左右。
    """
    UNIFORM = {k: round(1 / 6, 4) for k in "RIASEC"}
    if not code:
        return UNIFORM
    c = str(code).strip().upper()
    if len(c) < 2 or any(ch not in "RIASEC" for ch in c):
        return UNIFORM
    out = {}
    for i, ch in enumerate(c[:3]):
        out[ch] = out.get(ch, 0) + HOLLAND_WEIGHTS[i]
    return out


def _load_jobs_from_db():
    """一次性把 jobs + companies + industry + skills 关系读进内存（结果被缓存）"""
    conn = _connect()
    try:
        cur = conn.cursor()

        # 技能要求：job_id -> [{'name','level','parent'}]
        cur.execute("""
            SELECT r.job_id, s.skill_name, r.required_level, s.parent_skill_id
            FROM job_skill_requirements r
            JOIN skills s ON r.skill_id = s.skill_id
        """)
        skill_map = {}
        for jid, name, lv, pid in cur.fetchall():
            skill_map.setdefault(jid, []).append((name, int(lv or 2), pid))

        # 父技能 id -> name
        cur.execute("SELECT skill_id, skill_name FROM skills WHERE parent_skill_id IS NULL")
        id2name = {r[0]: r[1] for r in cur.fetchall()}

        # 岗位主表
        cur.execute("""
            SELECT j.job_id, j.job_title, j.city, c.company_name, c.company_size,
                   j.holland_code, j.major_names, j.salary_min_k, j.salary_max_k,
                   j.salary_range, j.education_requirement, j.job_type,
                   i.industry_name, j.job_description
            FROM jobs j
            LEFT JOIN companies c ON j.company_id = c.company_id
            LEFT JOIN industry i ON j.industry_id = i.industry_id
        """)
        rows = cur.fetchall()
    finally:
        conn.close()

    jobs = []
    for (jid, title, city, cname, csize, hcode, majors,
         smin, smax, srange, edu, jtype, ind, jd) in rows:

        # ---- 技能分档 ----
        # 数据实况：job_skill_requirements 1160 条中 level>=3 仅 93 条，
        # 730 个有技能的岗位里 648 个（88.8%）只有 level=2（JD 仅提及）。
        # 若严格按 level 分档，这 648 个岗位"必需技能"为空 → 算法给 required_score=100，
        # 技能维度整体失去区分度。故补偿：必需为空时，把 level 最高的前 2 个升为必需。
        req, bonus = {}, {}
        for name, lv, pid in skill_map.get(jid, []):
            if lv >= REQUIRED_LEVEL_MIN:
                req[name] = max(req.get(name, 0), lv)
            else:
                bonus[name] = max(bonus.get(name, 0), lv)
        if not req and bonus:
            top = sorted(bonus.items(), key=lambda x: -x[1])[:2]
            for name, lv in top:
                req[name] = lv
                bonus.pop(name, None)

        # ---- 霍兰德 ----
        hm = _holland_match(hcode)

        # ---- 专业 ----
        majors_list = [m.strip() for m in str(majors or "").split("|") if m.strip()]

        # ---- 地点 ----
        loc = _city_to_location(city)

        jobs.append({
            "job_id": jid,
            "company": cname or "",
            "position": title or "",
            "location": loc,
            "company_size": csize or "",
            "holland_match": hm,
            "required_skills": {"必需技能": req, "加分技能": bonus},
            "requirements": {
                "min_gpa": 0,               # 库内无此数据，用算法默认（不设门槛）
                "preferred_majors": majors_list,
                "grade_range": [0, 4],      # 库内无此数据，用算法默认（全年级）
            },
            "job_details": {
                "location": loc,            # ← 修复原断链：算法从 job_details 读 location
                "company_size": csize or "",
                "salary_range": [float(smin), float(smax)] if smin is not None and smax is not None else None,
                "salary_text": srange or "",
                "work_life_balance": 7,     # 库内无此数据，用算法默认
                "growth_potential": 7,
                "industry": ind or "",
                "education": edu or "",
                "job_type": jtype or "",
            },
            "keywords": [],                     # 留给后续从 JD 抽
            "description": jd or "",
            # 信息完整度 0-3（霍兰德/专业/技能 各有几项）。用于剔除"三无岗位"：
            # 实测 7 个岗位三项全无（储备干部/管培生/"必须大专 银行本部 可入编 双休"），
            # 推荐给学生毫无依据，默认不参与推荐。
            "_info_score": int(bool(hcode and str(hcode).strip()))
                           + int(bool(majors_list)) + int(bool(req)),
        })
    logger.info("[adapter] 从 prod 库装载 %d 个岗位", len(jobs))
    return jobs


def get_all_jobs():
    return _cached("jobs", _load_jobs_from_db)


def _match_location(job, wanted):
    """location 筛选：双向包含，兼容 '深圳' / '广东 深圳' / '深圳 深圳' 三种前端写法

    注意：必须先排除空地点。Python 里 '' in '天津' 为 True，
    若不判空，233 个无城市岗位会被任何地点筛选命中（实测 bug）。
    """
    if not wanted:
        return True
    loc = job.get("location", "")
    if not loc:
        return False                      # 无地点信息的岗位不参与地点筛选
    for w in wanted:
        w = str(w).strip()
        if not w:
            continue
        if w == loc:
            return True
        if len(w) >= 2 and w in loc:      # '广东 深圳' 含 '深圳'
            return True
        tail = w.split()[-1] if w.split() else w
        if tail and len(tail) >= 2 and tail in loc:
            return True
    return False


def adapter_get_filtered_jobs(filters):
    """替代 sample_data.get_filtered_jobs"""
    filters = filters or {}
    jobs = get_all_jobs()

    # 默认剔除"三无岗位"（无霍兰德 + 无专业 + 无技能 = 推荐无任何依据）。
    # 传 filters['include_incomplete']=True 可关闭此过滤（用于数据核查场景）。
    min_info = 0 if filters.get("include_incomplete") else 1

    out = []
    for j in jobs:
        if j.get("_info_score", 0) < min_info:
            continue
        if not _match_location(j, filters.get("location")):
            continue
        if filters.get("industry"):
            if j["job_details"]["industry"] not in filters["industry"]:
                continue
        if filters.get("company_size"):
            if j.get("company_size") not in filters["company_size"]:
                continue
        if filters.get("major"):
            majors = j["requirements"]["preferred_majors"]
            if not any(any(m in mm or mm in m for mm in majors) for m in filters["major"]):
                continue
        if filters.get("job_type"):
            if j["job_details"]["job_type"] not in filters["job_type"]:
                continue
        out.append(j)

    logger.info("[adapter] 筛选后岗位 %d / %d（filters=%s）", len(out), len(jobs), filters)
    return out


def adapter_get_jobs_by_ids(job_ids):
    """替代 sample_data.get_jobs_by_ids"""
    want = {str(x) for x in (job_ids or [])}
    return [j for j in get_all_jobs() if str(j["job_id"]) in want]


# ============ 课程侧组装（2026-11-07）============

def _parse_obj(text):
    """把列里的 JSON 字符串安全转 dict，失败返回 {}"""
    import json as _json
    if not text:
        return {}
    try:
        v = _json.loads(text)
        return v if isinstance(v, dict) else {}
    except Exception:
        return {}


def _load_courses_from_db():
    cur = _connect().cursor()
    cur.execute("""
        SELECT resource_id, title, platform, provider, course_type, difficulty,
               duration_min, cost, skill_improvement, prerequisites, holland_fit,
               rating, completion_rate, reviews_count
        FROM learning_resource
    """)
    by_id = {}
    order = []
    for (rid, title, platform, provider, ctype, diff, dmin, cost,
         simp, prereq, hfit, rating, crate, reviews) in cur.fetchall():
        improvement = {str(k): int(v) for k, v in _parse_obj(simp).items()
                       if isinstance(v, (int, float)) and v}
        prereq_map = {str(k): int(v) for k, v in _parse_obj(prereq).items()
                      if isinstance(v, (int, float)) and v}
        course = {
            "course_id": str(rid),
            "title": title or "",
            "platform": platform or "",
            "provider": provider or "",
            "course_type": ctype or "技能提升",
            "difficulty": diff or "中级",
            "duration": round((dmin or 0) / 60.0, 1),   # 分钟 → 小时，与样例口径一致
            "cost": float(cost or 0),
            "skill_improvement": improvement,
            "holland_fit": list(hfit) if hfit and hfit != "None" else [],
            "prerequisites": prereq_map,
            "rating": float(rating) if rating is not None else 0,
            "completion_rate": float(crate) if crate is not None else 0,
            "reviews_count": int(reviews) if reviews is not None else 0,
        }
        by_id[str(rid)] = course
        order.append(str(rid))
    # 叠加 learning_resource_skill 的标准化技能关联（skill 列名 → 提升等级）
    cur.execute("""
        SELECT r.resource_id, s.skill_name, r.improve_level
        FROM learning_resource_skill r
        JOIN skills s ON r.skill_id = s.skill_id
    """)
    for rid, sname, lvl in cur.fetchall():
        c = by_id.get(str(rid))
        if c is None or not sname:
            continue
        lv = int(lvl or 2)
        old = c["skill_improvement"].get(sname, 0)
        if lv > old:
            c["skill_improvement"][sname] = lv
    return [by_id[i] for i in order]


def adapter_get_course_catalog():
    """替代 sample_data.get_course_catalog"""
    return _cached("courses", _load_courses_from_db)


# ============ 学生侧组装 ============

def _expand_parent_skills(skills_flat, parent_map):
    """
    学生技能向上展开：会 Vue 3 级 → 前端 1.8 级
    parent_map: {子技能名: 父技能名}
    返回新的 skill->level 字典（不覆盖已有的更高值）
    """
    out = dict(skills_flat)
    for child, parent in parent_map.items():
        if child in skills_flat and parent not in out:
            out[parent] = round(float(skills_flat[child]) * PARENT_FOLD, 2)
    return out


def _load_parent_map():
    conn = _connect()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT c.skill_name, p.skill_name
            FROM skills c JOIN skills p ON c.parent_skill_id = p.skill_id
        """)
        return {r[0]: r[1] for r in cur.fetchall()}
    finally:
        conn.close()


def adapter_get_student_profile(student_id):
    """
    从 prod 库组装学生画像。库内无该学生时返回 None，由调用方回退到样例数据。
    返回结构与 SAMPLE_STUDENTS[i] 完全一致。
    """
    conn = _connect()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT student_id, student_name, student_major, grade, gpa, university
            FROM students WHERE CAST(student_id AS nvarchar(50)) = ?
        """, str(student_id))
        row = cur.fetchone()
        if not row:
            return None
        sid, name, major, grade, gpa, univ = row

        # 霍兰德（列名为 holland_R/I/A/S/E/C，2026-11-07 修正与 prod 库一致）
        cur.execute("""
            SELECT holland_R, holland_I, holland_A, holland_S, holland_E, holland_C
            FROM holland_test_results WHERE student_id = ?
            ORDER BY holland_test_time DESC
        """, sid)
        h = cur.fetchone()
        holland_scores, holland_code = {}, ""
        if h:
            keys = ["R", "I", "A", "S", "E", "C"]
            holland_scores = {k: float(v or 0) for k, v in zip(keys, h)}
            ordered = sorted(holland_scores.items(), key=lambda x: -x[1])
            holland_code = "".join(k for k, _ in ordered[:3])

        # 技能
        cur.execute("""
            SELECT s.skill_name, ss.proficiency_level
            FROM student_skills ss JOIN skills s ON ss.skill_id = s.skill_id
            WHERE ss.student_id = ?
        """, sid)
        flat = {n: int(lv or 0) for n, lv in cur.fetchall()}

        # 偏好（列名为 preferred_industries/preferred_locations/expected_salary/work_mode_preference，
        # 2026-11-07 修正与 prod 库一致；company_size 库中无此列，置空走算法默认）
        cur.execute("""
            SELECT preferred_industries, preferred_locations, expected_salary, work_mode_preference
            FROM student_preferences WHERE student_id = ?
        """, sid)
        p = cur.fetchone()
        prefs = {
            "preferred_industries": [x.strip() for x in str(p[0] or "").split(",") if x.strip()] if p else [],
            "work_location": [x.strip() for x in str(p[1] or "").split(",") if x.strip()] if p else [],
            "company_size": [],
            "work_life_balance": 5,
            "expected_salary": str(p[2]) if p else "",
            "work_mode_preference": str(p[3]) if p else "",
        }
    finally:
        conn.close()

    # 父级展开（学生侧）
    try:
        flat = _expand_parent_skills(flat, _cached("parent_map", _load_parent_map))
    except Exception as e:
        logger.warning("[adapter] 父级展开失败，跳过: %s", e)

    return {
        "student_id": str(sid),
        "basic_info": {
            "name": name or "",
            "major": normalize_major(major),
            "major_raw": major or "",
            "grade": int(grade or 1),
            "gpa": float(gpa or 0),
        },
        "holland_scores": holland_scores,
        "holland_code": holland_code,
        "skills": {"adapter": flat},
        "academic_records": {"courses_completed": [], "projects": [], "competitions": []},
        "career_preferences": prefs,
        "internship_history": [],
    }


# ============ 自检 ============

if __name__ == "__main__":
    import json
    jobs = get_all_jobs()
    print(f"岗位 {len(jobs)} 条")
    j = jobs[0]
    print(json.dumps({k: (v if k != "description" else str(v)[:60]) for k, v in j.items()},
                     ensure_ascii=False, indent=1)[:1200])
    print("\n有霍兰德匹配的:", sum(1 for x in jobs if x["holland_match"]))
    print("有必需技能的:", sum(1 for x in jobs if x["required_skills"]["必需技能"]))
    print("有加分技能的:", sum(1 for x in jobs if x["required_skills"]["加分技能"]))
    print("有专业的:", sum(1 for x in jobs if x["requirements"]["preferred_majors"]))
    print("有地点的:", sum(1 for x in jobs if x["job_details"]["location"]))
