# -*- coding: utf-8 -*-
"""
接库可行性探针（只读，不写任何库、不改任何源码）

目的：把 career_recommendation 的真实数据按算法要求的形状组装起来，
      喂给现有的 InternshipRecommendationSystem，验证：
        1) 适配层能不能把「扁平行」拍成「嵌套画像」而不崩
        2) 旧库真实数据能算出什么样的分数分布
        3) 霍兰德缺数据时，35% 权重到底是 0 分还是满分

运行：python _probe_real_data.py
"""
import sys, os, pyodbc

sys.stdout.reconfigure(encoding="utf-8")
CS = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;Trusted_Connection=yes;Connection Timeout=5"
BACKEND = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..",
                       "career-system-back", "backend")
sys.path.insert(0, BACKEND)

from internship_recommender import InternshipRecommendationSystem


def split_multi(v):
    if not v:
        return []
    for sep in ("，", ";", "；", "|"):
        v = v.replace(sep, ",")
    return [x.strip() for x in v.split(",") if x.strip()]


def build_student(cn, student_id):
    cur = cn.cursor()
    cur.execute("""SELECT student_id, student_name, student_major, grade, gpa, user_id
                   FROM students WHERE student_id=?""", (student_id,))
    r = cur.fetchone()
    if not r:
        return None
    sid, name, major, grade, gpa, uid = r

    # 技能：按 category 分组
    cur.execute("""SELECT s.skill_name, s.skill_category, ss.proficiency_level
                   FROM student_skills ss JOIN skills s ON s.skill_id=ss.skill_id
                   WHERE ss.student_id=?""", (sid,))
    skills = {}
    for sn, cat, lv in cur.fetchall():
        skills.setdefault(cat or "其他", {})[sn] = {"level": int(lv or 0), "certified": False}

    # 偏好
    cur.execute("""SELECT preferred_industries, preferred_locations, expected_salary, work_mode_preference
                   FROM student_preferences WHERE student_id=?""", (sid,))
    p = cur.fetchone()
    prefs = {
        "work_location": split_multi(p[1]) if p else [],
        "industry": split_multi(p[0]) if p else [],
        "company_size": [],            # 旧库无此列；算法用 `in []`，必须是列表不能是 None
        "work_life_balance": 5,        # 旧库无此列，用默认
    }

    # 霍兰德：旧库该表 0 行
    cur.execute("""SELECT holland_R, holland_I, holland_A, holland_S, holland_E, holland_C
                   FROM holland_tests WHERE student_id=?""", (sid,))
    h = cur.fetchone()
    holland = {}
    if h:
        holland = dict(zip("RIASEC", [int(x) for x in h]))

    return {
        "student_id": sid,
        "basic_info": {"name": name, "major": major, "grade": grade, "gpa": float(gpa or 0)},
        "holland_scores": holland,     # 必须给键，算法是硬下标
        "holland_code": "".join(sorted(holland, key=holland.get, reverse=True)[:3]) if holland else "",
        "skills": skills,
        "career_preferences": prefs,
        "academic_records": {"projects": []},
        "internship_history": [],
    }


def build_jobs(cn):
    cur = cn.cursor()
    cur.execute("""SELECT j.job_id, j.job_title, j.job_type, j.salary_range,
                          c.company_name, c.company_location, c.company_size, j.company_id
                   FROM jobs j LEFT JOIN companies c ON c.company_id=j.company_id""")
    base = cur.fetchall()
    jobs = []
    for jid, title, jtype, salary, cname, cloc, csize, cid in base:
        cur.execute("""SELECT s.skill_name, jsr.required_level, jsr.requirement_type
                       FROM job_skill_requirements jsr JOIN skills s ON s.skill_id=jsr.skill_id
                       WHERE jsr.job_id=?""", (jid,))
        must, plus = {}, {}
        for sn, lv, rt in cur.fetchall():
            (must if (rt or "").strip() == "必需" else plus)[sn] = int(lv or 0)
        jobs.append({
            "job_id": jid, "company": cname or "", "position": title,
            "location": cloc or "", "company_size": csize or "",
            "holland_match": {},                    # 旧库无此列
            "required_skills": {"必需技能": must, "加分技能": plus},
            "requirements": {},                     # 旧库无 min_gpa / grade_range / preferred_majors
            "job_details": {"salary_range": salary or "", "job_type": jtype or ""},
            "keywords": list(must.keys()),
        })
    return jobs


def main():
    cn = pyodbc.connect(CS)
    cur = cn.cursor()
    cur.execute("USE [career_recommendation]")
    cur.execute("SELECT student_id FROM students ORDER BY student_id")
    sids = [r[0] for r in cur.fetchall()]
    jobs = build_jobs(cn)
    print(f"真实数据：学生 {len(sids)} 个，岗位 {len(jobs)} 个\n")

    rec = InternshipRecommendationSystem()
    rows = []
    for sid in sids:
        s = build_student(cn, sid)
        out = rec.recommend_internships(s, jobs, top_n=3)
        if out:
            rows.append((sid, s["basic_info"]["name"], s["basic_info"]["major"], out))
    cn.close()

    print("=" * 84)
    print("每个学生的 Top1（霍兰德两端都无数据）")
    print("=" * 84)
    print(f'{"学生":<10}{"姓名":<8}{"Top1 岗位":<24}{"总分":>7}{"兴趣":>7}{"技能":>7}{"学业":>7}{"偏好":>7}')
    for sid, name, major, out in rows:
        t = out[0]; b = t["score_breakdown"]
        print(f'{str(sid):<10}{name:<8}{t["position"][:20]:<24}{t["match_score"]:>7.1f}'
              f'{b["holland_score"]:>7.1f}{b["skill_score"]:>7.1f}{b["academic_score"]:>7.1f}{b["preference_score"]:>7.1f}')

    # 分数分布与区分度
    all_scores = [x["match_score"] for _, _, _, out in rows for x in out]
    top1 = [out[0]["match_score"] for _, _, _, out in rows]
    holland_all = [x["score_breakdown"]["holland_score"] for _, _, _, out in rows for x in out]
    print("\n" + "=" * 84)
    print("分布统计")
    print("=" * 84)
    print(f"  所有推荐项 {len(all_scores)} 个：min={min(all_scores):.2f} max={max(all_scores):.2f} "
          f"均值={sum(all_scores)/len(all_scores):.2f}")
    print(f"  每个学生 Top1：min={min(top1):.2f} max={max(top1):.2f} 极差={max(top1)-min(top1):.2f}")
    print(f"  霍兰德项：min={min(holland_all):.2f} max={max(holland_all):.2f} "
          f"→ {'全部为满分，无区分度' if min(holland_all) == max(holland_all) else '有区分'}")

    # 同一学生对不同岗位的区分度
    if rows:
        sid, name, major, out = rows[0]
        cn2 = pyodbc.connect(CS); cur2 = cn2.cursor(); cur2.execute("USE [career_recommendation]")
        allrec = rec.recommend_internships(build_student(cn2, sid), build_jobs(cn2), top_n=99)
        cn2.close()
        print(f"\n  学生 {name}({sid}) 的 23 个岗位分数区间："
              f"{allrec[-1]['match_score']:.1f} ~ {allrec[0]['match_score']:.1f}，"
              f"极差 {allrec[0]['match_score']-allrec[-1]['match_score']:.1f}")
        print("  前 3 与后 3：")
        for x in allrec[:3] + allrec[-3:]:
            b = x["score_breakdown"]
            print(f'    {x["match_score"]:>6.1f}  {x["position"][:24]:<26}'
                  f'技能{b["skill_score"]:>6.1f} 学业{b["academic_score"]:>6.1f} 偏好{b["preference_score"]:>6.1f}')


if __name__ == "__main__":
    main()
