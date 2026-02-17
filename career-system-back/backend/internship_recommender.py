#实习岗位推荐系统
from sample_data import *
import numpy as np

# 简单实现 cosine_similarity，以避免外部依赖 scikit-learn
def cosine_similarity(a, b):
    a = np.asarray(a)
    b = np.asarray(b)
    # 支持 1-D 或 2-D 输入，返回与 sklearn 相同的 2-D 结果
    if a.ndim == 1:
        a = a.reshape(1, -1)
    if b.ndim == 1:
        b = b.reshape(1, -1)
    # 逐行计算余弦相似度（这里输入通常是两条向量）
    result = np.zeros((a.shape[0], b.shape[0]), dtype=float)
    for i in range(a.shape[0]):
        for j in range(b.shape[0]):
            ai = a[i]
            bj = b[j]
            denom = (np.linalg.norm(ai) * np.linalg.norm(bj))
            if denom == 0:
                result[i, j] = 0.0
            else:
                result[i, j] = float(np.dot(ai, bj) / denom)
    return result


def holland_match_score(student_holland, job_holland):
    """
    计算学生与岗位的霍兰德类型匹配度（使用余弦相似度）
    
    Args:
        student_holland: dict, 学生的六维霍兰德得分 {'R': 45, 'I': 85, ...}
        job_holland: dict, 岗位的霍兰德权重 {'I': 0.7, 'C': 0.2, 'E': 0.1}
    
    Returns:
        float: 匹配度得分 (0-100)
    """
    # 将字典转为向量（按RIASEC顺序）
    holland_types = ['R', 'I', 'A', 'S', 'E', 'C']
    
    student_vector = np.array([student_holland.get(t, 0) for t in holland_types])
    
    # 岗位向量：将权重转换为100分制
    job_vector = np.zeros(6)
    for t, weight in job_holland.items():
        idx = holland_types.index(t)
        job_vector[idx] = weight * 100
    
    # 计算余弦相似度
    similarity = cosine_similarity(
        student_vector.reshape(1, -1),
        job_vector.reshape(1, -1)
    )[0][0]
    
    # 转换为0-100分
    return similarity * 100


def holland_weighted_distance(student_holland, job_holland):
    """
    使用加权欧氏距离计算匹配度
    距离越小，匹配度越高
    """
    holland_types = ['R', 'I', 'A', 'S', 'E', 'C']
    
    distance = 0
    for t in holland_types:
        student_score = student_holland.get(t, 0)
        job_weight = job_holland.get(t, 0)
        job_score = job_weight * 100
        
        # 加权距离
        distance += job_weight * (student_score - job_score) ** 2
    
    distance = np.sqrt(distance)
    
    # 转换为匹配度得分（距离越小，得分越高）
    max_distance = 100  # 理论最大距离
    match_score = (1 - distance / max_distance) * 100
    
    return max(0, match_score)


def skill_match_score(student_skills, job_requirements):
    """
    计算技能匹配度
    
    Args:
        student_skills: dict, 学生技能及等级
        job_requirements: dict, 岗位技能要求
            {
                '必需技能': {'Python': 3, 'SQL': 3},
                '加分技能': {'机器学习': 2}
            }
    
    Returns:
        float: 技能匹配度得分 (0-100)
    """
    # 必需技能匹配部分
    required = job_requirements.get('必需技能', {})  # 获取必需技能要求
    required_score = 0  # 初始化必需技能得分
    required_weight = 0.7  # 必需技能权重
    
    # 遍历所有必需技能
    for skill, required_level in required.items():
        # 获取学生技能等级
        student_level = 0
        if skill in student_skills:
            # 处理技能等级可能是字典的情况
            if isinstance(student_skills[skill], dict):
                student_level = student_skills[skill].get('level', 0)
            else:
                student_level = student_skills[skill]
        
        # 计算技能得分
        if student_level >= required_level:
            # 满足要求得满分，超过要求额外加分
            required_score += 1 + 0.1 * (student_level - required_level)
        else:
            # 未达到要求，按比例计分
            required_score += student_level / required_level * 0.6 if required_level > 0 else 0
    
    # 计算必需技能平均分
    if len(required) > 0:
        required_score = (required_score / len(required)) * 100
    else:
        required_score = 100  # 如果没有必需技能要求，则得满分
    
    # 加分技能匹配部分
    bonus = job_requirements.get('加分技能', {})  # 获取加分技能要求
    bonus_score = 0  # 初始化加分技能得分
    bonus_weight = 0.3  # 加分技能权重
    
    # 遍历所有加分技能
    for skill, required_level in bonus.items():
        student_level = 0
        if skill in student_skills:
            # 处理技能等级可能是字典的情况
            if isinstance(student_skills[skill], dict):
                student_level = student_skills[skill].get('level', 0)
            else:
                student_level = student_skills[skill]
        
        # 计算加分技能得分
        if student_level >= required_level:
            bonus_score += 1
    
    # 计算加分技能平均分
    if len(bonus) > 0:
        bonus_score = (bonus_score / len(bonus)) * 100
    else:
        bonus_score = 0  # 如果没有加分技能要求，则得0分
    
    # 综合得分
    total_score = required_score * required_weight + bonus_score * bonus_weight
    
    return min(100, total_score)


def academic_match_score(student_profile, job_requirements):
    """
    计算学业表现匹配度
    """
    score = 0
    
    # GPA匹配（40%权重）
    student_gpa = student_profile['basic_info']['gpa']
    min_gpa = job_requirements.get('min_gpa', 0)
    
    if min_gpa > 0:
        if student_gpa >= min_gpa:
            gpa_score = min(100, (student_gpa / 4.0) * 100)
        else:
            gpa_score = (student_gpa / min_gpa) * 60  # 未达标打折
    else:
        gpa_score = (student_gpa / 4.0) * 100
    
    score += gpa_score * 0.4
    
    # 年级匹配（30%权重）
    student_grade = student_profile['basic_info']['grade']
    grade_range = job_requirements.get('grade_range', [0, 4])
    
    if grade_range[0] <= student_grade <= grade_range[1]:
        grade_score = 100
    else:
        grade_score = 50  # 年级不匹配减分
    
    score += grade_score * 0.3
    
    # 专业匹配（30%权重）
    student_major = student_profile['basic_info']['major']
    preferred_majors = job_requirements.get('preferred_majors', [])
    
    # 使用关键词匹配
    major_score = 0
    for preferred in preferred_majors:
        if preferred in student_major or student_major in preferred:
            major_score = 100
            break
    else:
        major_score = 60  # 专业不完全匹配
    
    score += major_score * 0.3
    
    return score


def preference_match_score(student_preferences, job_details):
    """
    计算学生偏好与岗位的匹配度
    Args:
        student_preferences (dict): 学生的偏好设置，包含工作地点、公司规模、工作生活平衡等
        job_details (dict): 岗位详细信息，包含地点、公司规模、行业、工作生活平衡等
    Returns:
        float: 匹配度得分，范围在0-100之间
    """
    score = 0  # 初始化总分为0
    
    # 地点偏好（35%权重）
    job_location = job_details.get('location', '')  # 获取岗位地点，若不存在则为空字符串
    if job_location in student_preferences.get('work_location', []):  # 检查岗位地点是否在学生偏好地点中
        location_score = 100  # 完全匹配
    else:
        location_score = 40  # 部分匹配
    score += location_score * 0.35  # 按权重计算地点得分并加入总分
    
    # 公司规模偏好（25%权重）
    company_size = job_details.get('company_size', '')  # 获取公司规模，若不存在则为空字符串
    if company_size in student_preferences.get('company_size', []):  # 检查公司规模是否在学生偏好中
        size_score = 100  # 完全匹配
    else:
        size_score = 60  # 部分匹配
    score += size_score * 0.25  # 按权重计算公司规模得分并加入总分
    
    # 行业偏好（25%权重）
    # 需要从岗位所属行业判断
    industry_score = 70  # 默认中等匹配
    score += industry_score * 0.25  # 按权重计算行业得分并加入总分
    
    # 工作生活平衡（15%权重）
    wlb_preference = student_preferences.get('work_life_balance', 5)  # 获取学生对工作生活平衡的偏好，默认为5
    # 假设根据公司和岗位评估WLB得分
    job_wlb = job_details.get('work_life_balance', 7)  # 从历史数据或公司评价获取岗位工作生活平衡得分，默认为7
    wlb_score = max(0, 100 - abs(wlb_preference - job_wlb) * 10)  # 计算工作生活平衡匹配得分，最小为0
    score += wlb_score * 0.15  # 按权重计算工作生活平衡得分并加入总分
    
    return score  # 返回最终匹配度得分


class InternshipRecommendationSystem:
    """实习岗位推荐系统"""
    
    def __init__(self, alpha=0.35, beta=0.30, gamma=0.20, delta=0.15):
        self.alpha = alpha  # 霍兰德权重
        self.beta = beta    # 技能权重
        self.gamma = gamma  # 学业权重
        self.delta = delta  # 偏好权重
    
    def calculate_match_score(self, student, job):
        """计算综合匹配度"""
        
        # 1. 霍兰德匹配度
        holland_score = holland_weighted_distance(
            student['holland_scores'],
            job.get('holland_match', {})
        )
        
        # 2. 技能匹配度
        # 合并所有技能类别
        all_skills = {}
        for category, skills in student.get('skills', {}).items():
            if isinstance(skills, dict):
                all_skills.update(skills)
        
        skill_score = skill_match_score(
            all_skills,
            job.get('required_skills', {})
        )
        
        # 3. 学业匹配度
        academic_score = academic_match_score(
            student,
            job.get('requirements', {})
        )
        
        # 4. 偏好匹配度
        preference_score = preference_match_score(
            student.get('career_preferences', {}),
            job.get('job_details', {})
        )
        
        # 综合得分
        total_score = (
            self.alpha * holland_score +
            self.beta * skill_score +
            self.gamma * academic_score +
            self.delta * preference_score
        )
        
        return {
            'total_score': total_score,
            'holland_score': holland_score,
            'skill_score': skill_score,
            'academic_score': academic_score,
            'preference_score': preference_score
        }
    
    def recommend_internships(self, student, job_list, top_n=10, min_score=0):
        """
        为学生推荐实习岗位
        
        Returns:
            list: 推荐岗位列表，按匹配度降序排列
        """
        recommendations = []
        
        for job in job_list:
            scores = self.calculate_match_score(student, job)
            
            if scores['total_score'] >= min_score:
                recommendations.append({
                    'job_id': job.get('job_id', ''),
                    'company': job.get('company', ''),
                    'position': job.get('position', ''),
                    'location': job.get('location', ''),
                    'match_score': scores['total_score'],
                    'score_breakdown': scores,
                    'reasons': self._generate_match_reasons(scores, student, job),
                    'job_details': job.get('job_details', {})
                })
        
        # 按匹配度排序
        recommendations.sort(key=lambda x: x['match_score'], reverse=True)
        
        return recommendations[:top_n]
    
    def _generate_match_reasons(self, scores, student, job):
        """生成推荐理由"""
        reasons = []
        
        # 根据各项得分生成推荐理由
        if scores['holland_score'] >= 80:
            holland_code = student.get('holland_code', '')
            reasons.append(f"您的职业兴趣类型({holland_code})与该岗位高度匹配")
        
        if scores['skill_score'] >= 80:
            reasons.append("您的技能完全满足岗位要求")
        elif scores['skill_score'] >= 60:
            reasons.append("您的核心技能基本满足要求")
        
        if scores['academic_score'] >= 85:
            reasons.append("您的学业表现优秀")
        
        if scores['preference_score'] >= 75:
            reasons.append("岗位地点和公司类型符合您的偏好")
        
        return reasons


if __name__ == "__main__":
    # 测试代码
    from sample_data import SAMPLE_STUDENTS, SAMPLE_JOBS
    
    recommender = InternshipRecommendationSystem()
    if SAMPLE_STUDENTS and SAMPLE_JOBS:
        recommendations = recommender.recommend_internships(
            SAMPLE_STUDENTS[0], SAMPLE_JOBS, top_n=5
        )
        
        for i, rec in enumerate(recommendations, 1):
            print(f"\n{i}. {rec['company']} - {rec['position']}")
            print(f"   匹配度: {rec['match_score']:.2f}分")
            print(f"   推荐理由: {', '.join(rec['reasons'])}")