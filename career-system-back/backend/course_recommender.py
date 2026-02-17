#课程推荐系统模块
from sample_data import *


def analyze_skill_gap(student, target_jobs):
    """
    分析学生当前技能与目标岗位的差距
    
    Args:
        student: 学生画像，包含学生的技能信息
        target_jobs: 学生感兴趣的岗位列表，每个岗位包含所需技能信息
    
    Returns:
        list: 技能缺口分析结果，按优先级排序的技能缺口列表
    """
    # 收集目标岗位所需技能，统计每个技能的最高要求和出现频率
    required_skills = {}
    
    # 遍历所有目标岗位，提取技能要求
    for job in target_jobs:
        job_skills = job.get('required_skills', {})
        for skill_type, skills in job_skills.items():
            # 处理技能字典
            if isinstance(skills, dict):
                for skill, level in skills.items():
                    # 如果技能尚未被记录，则初始化其信息
                    if skill not in required_skills:
                        required_skills[skill] = {'max_level': level, 'frequency': 1, 'is_required': (skill_type == '必需技能')}
                    else:
                        required_skills[skill]['max_level'] = max(
                            required_skills[skill]['max_level'], level
                        )
                        required_skills[skill]['frequency'] += 1
                        if skill_type == '必需技能':
                            required_skills[skill]['is_required'] = True
    
    # 分析技能差距
    skill_gaps = []
    
    all_student_skills = {}
    for category in student.get('skills', {}).values():
        if isinstance(category, dict):
            all_student_skills.update(category)
    
    for skill, info in required_skills.items():
        current_level = 0
        if skill in all_student_skills:
            if isinstance(all_student_skills[skill], dict):
                current_level = all_student_skills[skill].get('level', 0)
            else:
                current_level = all_student_skills[skill]
        
        gap = info['max_level'] - current_level
        
        if gap > 0:
            # 计算优先级（差距越大、出现频率越高，优先级越高）
            # 必需技能权重更高
            priority_multiplier = 1.5 if info['is_required'] else 1.0
            priority = gap * info['frequency'] * priority_multiplier
            
            # 确定紧急程度
            if gap >= 2 and info['frequency'] >= 3:
                urgency = 'high'
            elif gap >= 1:
                urgency = 'medium'
            else:
                urgency = 'low'
            
            skill_gaps.append({
                'skill': skill,
                'current_level': current_level,
                'target_level': info['max_level'],
                'gap': gap,
                'frequency': info['frequency'],
                'priority': priority,
                'is_required': info['is_required'],
                'urgency': urgency
            })
    
    # 按优先级排序
    skill_gaps.sort(key=lambda x: x['priority'], reverse=True)
    
    return skill_gaps


class CourseRecommendationSystem:
    """课程推荐系统"""
    
    def recommend_courses(self, student, skill_gaps, course_catalog, top_n=5):
        """
        基于技能缺口推荐课程
        
        Args:
            student: 学生画像
            skill_gaps: 技能缺口列表
            course_catalog: 课程目录
            top_n: 推荐课程数量
        
        Returns:
            list: 推荐课程列表
        """
        recommendations = []
        
        for course in course_catalog:
            score = self._calculate_course_score(student, course, skill_gaps)
            
            if score > 0:
                recommendations.append({
                    'course_id': course.get('course_id', ''),
                    'title': course.get('title', ''),
                    'platform': course.get('platform', ''),
                    'provider': course.get('provider', ''),
                    'score': score,
                    'reasons': self._generate_course_reasons(course, skill_gaps),
                    'learning_path': self._generate_learning_path(course, student),
                    'course_details': {
                        'difficulty': course.get('difficulty', ''),
                        'duration': course.get('duration', 0),
                        'cost': course.get('cost', 0),
                        'rating': course.get('rating', 0)
                    }
                })
        
        # 排序并返回
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:top_n]
    
    def _calculate_course_score(self, student, course, skill_gaps):
        """计算课程推荐分数"""
        score = 0
        
        # 1. 技能相关性（50%权重）
        skill_relevance = 0
        course_improvements = course.get('skill_improvement', {})
        for skill, improvement in course_improvements.items():
            for gap in skill_gaps:
                if gap['skill'] == skill:
                    # 优先级越高，得分越高
                    skill_relevance += gap['priority'] * improvement * 10
                    break
        
        score += skill_relevance * 0.5
        
        # 2. 霍兰德匹配度（20%权重）
        holland_match = 0
        student_codes = student.get('holland_code', '')
        if isinstance(student_codes, str):
            student_top_codes = list(student_codes)
        else:
            student_top_codes = student_codes
        
        course_fit = course.get('holland_fit', [])
        matched = sum(1 for code in student_top_codes if code in course_fit)
        if len(student_top_codes) > 0:
            holland_match = (matched / len(student_top_codes)) * 100
        else:
            holland_match = 50  # 默认中等匹配
        
        score += holland_match * 0.2
        
        # 3. 前置条件满足度（15%权重）
        prerequisite_met = self._check_prerequisites(student, course)
        score += prerequisite_met * 0.15
        
        # 4. 课程质量（15%权重）
        rating = course.get('rating', 0)
        completion_rate = course.get('completion_rate', 0)
        quality_score = (
            (rating / 5.0) * 50 +  # 评分
            completion_rate * 50   # 完成率
        )
        score += quality_score * 0.15
        
        return score
    
    def _check_prerequisites(self, student, course):
        """检查前置条件"""
        prerequisites = course.get('prerequisites', {})
        if not prerequisites:
            return 100
        
        met_count = 0
        total_count = len(prerequisites)
        
        all_student_skills = {}
        for category in student.get('skills', {}).values():
            if isinstance(category, dict):
                all_student_skills.update(category)
        
        for skill, required_level in prerequisites.items():
            current_level = 0
            if skill in all_student_skills:
                if isinstance(all_student_skills[skill], dict):
                    current_level = all_student_skills[skill].get('level', 0)
                else:
                    current_level = all_student_skills[skill]
            
            if current_level >= required_level:
                met_count += 1
        
        return (met_count / total_count) * 100 if total_count > 0 else 100
    
    def _generate_course_reasons(self, course, skill_gaps):
        """生成推荐理由"""
        reasons = []
        
        # 找出该课程可以填补的技能缺口
        course_improvements = course.get('skill_improvement', {})
        for skill in course_improvements.keys():
            for gap in skill_gaps[:3]:  # 只看前3个优先级最高的
                if gap['skill'] == skill:
                    reasons.append(f"提升您的{skill}技能（当前Lv{gap['current_level']} → 目标Lv{gap['target_level']}）")
                    break
        
        rating = course.get('rating', 0)
        if rating >= 4.5:
            reasons.append(f"高质量课程（评分{rating}⭐）")
        
        completion_rate = course.get('completion_rate', 0)
        if completion_rate >= 0.75:
            reasons.append(f"完成率高（{completion_rate*100:.0f}%学员完成学习）")
        
        return reasons
    
    def _generate_learning_path(self, course, student):
        """生成学习路径建议"""
        duration = course.get('duration', 0)
        return {
            'estimated_duration': f"{duration}小时",
            'weekly_commitment': "建议每周学习5-8小时",
            'completion_time': f"预计{max(4, duration // 10)}-{max(6, duration // 7)}周完成",
            'next_steps': "完成后建议进行项目实践"
        }
    
    def generate_learning_roadmap(self, student, skill_gaps, courses):
        """
        生成完整学习路线图
        
        Args:
            student: 学生信息对象，包含学生的背景、能力等数据
            skill_gaps: 技能差距列表，每个元素是一个字典，包含技能和紧急程度等信息
            courses: 可选课程列表，每个元素是一个课程信息字典
        Returns:
            dict: 学习路线图，包含不同阶段的学习目标和推荐课程
        """
        # 按优先级分组：将技能差距分为高、中、低三个优先级
        high_priority = [gap for gap in skill_gaps if gap['urgency'] == 'high']  # 高优先级技能差距
        medium_priority = [gap for gap in skill_gaps if gap['urgency'] == 'medium']  # 中优先级技能差距
        low_priority = [gap for gap in skill_gaps if gap['urgency'] == 'low']  # 低优先级技能差距
        
        phases = []  # 初始化阶段列表，用于存储各个学习阶段的信息
        
        # 紧急阶段：处理高优先级技能差距
        if high_priority:
            phase_courses = []  # 初始化阶段课程列表
            for gap in high_priority[:3]:  # 只处理前3个高优先级技能差距
                for course in courses:  # 遍历所有课程，寻找能弥补技能差距的课程
                    if gap['skill'] in course.get('skill_improvement', {}):  # 检查课程是否能提升目标技能
                        if course not in phase_courses:  # 避免重复添加同一课程
                            score = self._calculate_course_score(student, course, [gap])  # 计算课程匹配分数
                            phase_courses.append({
                                'title': course.get('title', ''),  # 课程标题
                                'score': score  # 课程匹配分数
                            })
                        break
            
            phases.append({
                'phase_name': '紧急提升阶段',  # 阶段名称
                'priority': 'high',  # 优先级
                'duration': '1-2个月',  # 预计持续时间
                'goals': [f"快速提升{gap['skill']}技能" for gap in high_priority[:3]],
                'courses': sorted(phase_courses, key=lambda x: x['score'], reverse=True)[:3]
            })
        
        # 中期阶段
        if medium_priority:
            phase_courses = []
            for gap in medium_priority[:5]:
                for course in courses:
                    if gap['skill'] in course.get('skill_improvement', {}):
                        if course not in phase_courses:
                            score = self._calculate_course_score(student, course, [gap])
                            phase_courses.append({
                                'title': course.get('title', ''),
                                'score': score
                            })
                        break
            
            phases.append({
                'phase_name': '中期强化阶段',
                'priority': 'medium',
                'duration': '3-6个月',
                'goals': [f"系统学习{gap['skill']}技能" for gap in medium_priority[:3]],
                'courses': sorted(phase_courses, key=lambda x: x['score'], reverse=True)[:5]
            })
        
        # 长期阶段
        if low_priority:
            phases.append({
                'phase_name': '长期发展阶段',
                'priority': 'low',
                'duration': '6-12个月',
                'goals': [f"深入学习{gap['skill']}技能" for gap in low_priority[:3]],
                'courses': []
            })
        
        return {
            'phases': phases
        }


if __name__ == "__main__":
    # 测试代码
    from sample_data import SAMPLE_STUDENTS, SAMPLE_JOBS, SAMPLE_COURSES
    
    course_recommender = CourseRecommendationSystem()
    if SAMPLE_STUDENTS and SAMPLE_JOBS and SAMPLE_COURSES:
        skill_gaps = analyze_skill_gap(SAMPLE_STUDENTS[0], SAMPLE_JOBS[:3])
        course_recommendations = course_recommender.recommend_courses(
            SAMPLE_STUDENTS[0], skill_gaps, SAMPLE_COURSES, top_n=5
        )
        
        for i, rec in enumerate(course_recommendations, 1):
            print(f"\n{i}. {rec['title']} ({rec['platform']})")
            print(f"   推荐指数: {rec['score']:.2f}分")
            print(f"   学习时长: {rec['learning_path']['estimated_duration']}")
            print(f"   推荐理由: {' | '.join(rec['reasons'])}")