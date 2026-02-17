"""
完整推荐系统演示
展示从学生画像到推荐结果的完整流程
"""

# -*- coding: utf-8 -*-
import sys
import os
import io

# 设置标准输出编码为UTF-8，解决Windows下emoji显示问题
if sys.platform == 'win32':
    try:
        # 尝试设置控制台编码为UTF-8
        os.system('chcp 65001 >nul 2>&1')
    except:
        pass
    # 使用io.TextIOWrapper包装标准输出和标准错误
    try:
        if hasattr(sys.stdout, 'buffer'):
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace', line_buffering=True)
        if hasattr(sys.stderr, 'buffer'):
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace', line_buffering=True)
    except:
        pass
from internship_recommender import InternshipRecommendationSystem
from course_recommender import CourseRecommendationSystem, analyze_skill_gap
from sample_data import (
    SAMPLE_STUDENTS, SAMPLE_JOBS, SAMPLE_COURSES,
    get_student_by_id, CAREER_PATHS_DATABASE
)


def print_section_header(title):
    """打印节标题"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def demo_student_profile(student):
    """展示学生画像"""
    print_section_header("学生画像分析")
    
    print(f"\n基本信息:")
    print(f"  姓名: {student['basic_info']['name']}")
    print(f"  专业: {student['basic_info']['major']}")
    print(f"  年级: 大{student['basic_info']['grade']}")
    print(f"  GPA: {student['basic_info']['gpa']}")
    
    print(f"\n霍兰德职业兴趣类型: {student['holland_code']}")
    print(f"  各维度得分:")
    for code, score in student['holland_scores'].items():
        bar = "█" * int(score / 5)
        print(f"  {code}型: {bar} {score}分")
    
    print(f"\n技能水平:")
    all_skills = {}
    for category, skills in student['skills'].items():
        if isinstance(skills, dict):
            for skill, info in skills.items():
                if isinstance(info, dict):
                    level = info.get('level', 0)
                else:
                    level = info
                all_skills[skill] = level
    
    # 按等级排序
    sorted_skills = sorted(all_skills.items(), key=lambda x: x[1], reverse=True)
    for skill, level in sorted_skills[:8]:
        stars = "⭐" * level
        print(f"  {skill}: {stars} (Lv{level})")
    
    print(f"\n职业偏好:")
    print(f"  期望地点: {', '.join(student['career_preferences']['work_location'])}")
    print(f"  公司类型: {', '.join(student['career_preferences']['company_size'])}")
    print(f"  工作生活平衡: {student['career_preferences']['work_life_balance']}/10")


def demo_internship_recommendation(student, jobs):
    """演示实习岗位推荐"""
    print_section_header("实习岗位智能推荐")
    
    # 创建推荐系统
    recommender = InternshipRecommendationSystem()
    
    # 生成推荐
    recommendations = recommender.recommend_internships(
        student, jobs, top_n=5, min_score=70
    )
    
    print(f"\n为您找到 {len(recommendations)} 个匹配的实习岗位:\n")
    
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec['company']} - {rec['position']}")
        print(f"   📍 地点: {rec['location']}")
        print(f"   💯 综合匹配度: {rec['match_score']:.2f}分")
        
        # 详细得分
        scores = rec['score_breakdown']
        print(f"   📊 得分详情:")
        print(f"      • 霍兰德匹配: {scores['holland_score']:.1f}分")
        print(f"      • 技能匹配: {scores['skill_score']:.1f}分")
        print(f"      • 学业匹配: {scores['academic_score']:.1f}分")
        print(f"      • 偏好匹配: {scores['preference_score']:.1f}分")
        
        # 推荐理由
        print(f"   ✨ 推荐理由:")
        for reason in rec['reasons']:
            print(f"      • {reason}")
        
        # 岗位信息
        details = rec['job_details']
        print(f"   💰 薪资: {details['salary_range'][0]}-{details['salary_range'][1]}元/天")
        print(f"   📅 实习时长: {details['duration'][0]}-{details['duration'][1]}个月")
        print()


def demo_skill_gap_analysis(student, target_jobs):
    """演示技能缺口分析"""
    print_section_header("技能缺口分析")
    
    # 分析技能缺口
    skill_gaps = analyze_skill_gap(student, target_jobs)
    
    print(f"\n基于 {len(target_jobs)} 个目标岗位分析，发现以下技能提升空间:\n")
    
    for i, gap in enumerate(skill_gaps[:5], 1):
        urgency_emoji = "🔴" if gap.get('urgency') == 'high' else "🟡" if gap.get('urgency') == 'medium' else "🟢"
        type_text = "[必需]" if gap.get('is_required') else "[加分]"
        
        print(f"{i}. {urgency_emoji} {gap['skill']} {type_text}")
        print(f"   当前水平: Lv{gap['current_level']} → 目标水平: Lv{gap['target_level']}")
        print(f"   技能差距: {gap['gap']}级")
        print(f"   需求频率: {gap['frequency']}个岗位要求此技能")
        print(f"   优先级得分: {gap['priority']:.1f}")
        print()
    
    return skill_gaps


def demo_course_recommendation(student, skill_gaps, courses):
    """演示课程推荐"""
    print_section_header("个性化课程推荐")
    
    # 创建课程推荐系统
    course_recommender = CourseRecommendationSystem()
    
    # 推荐课程
    recommendations = course_recommender.recommend_courses(
        student, skill_gaps, courses, top_n=5
    )
    
    print(f"\n为您推荐以下 {len(recommendations)} 门课程:\n")
    
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec['title']}")
        print(f"   🎓 平台: {rec['platform']} | 提供方: {rec['provider']}")
        print(f"   📈 推荐指数: {rec['score']:.2f}分")
        
        details = rec.get('course_details', {})
        print(f"   📊 课程信息:")
        print(f"      • 难度: {details.get('difficulty', '未知')}")
        print(f"      • 时长: {details.get('duration', 0)}小时")
        print(f"      • 费用: ¥{details.get('cost', 0)}")
        print(f"      • 评分: {details.get('rating', 0)}⭐")
        
        print(f"   ✨ 推荐理由:")
        for reason in rec.get('reasons', [])[:3]:
            print(f"      • {reason}")
        
        lp = rec.get('learning_path', {})
        print(f"   📅 学习计划:")
        print(f"      • {lp.get('completion_time', '未知时间')}")
        print(f"      • {lp.get('weekly_commitment', '未知')}")
        print()


def demo_learning_roadmap(student, skill_gaps, courses):
    """演示学习路线图"""
    print_section_header("完整学习路线图")
    
    course_recommender = CourseRecommendationSystem()
    roadmap = course_recommender.generate_learning_roadmap(
        student, skill_gaps, courses
    )
    
    print("\n根据您的技能缺口，为您规划了分阶段学习路线:\n")
    
    phases = roadmap.get('phases', [])
    for i, phase in enumerate(phases, 1):
        priority_emoji = "🔴" if phase.get('priority') == 'high' else "🟡" if phase.get('priority') == 'medium' else "🟢"
        
        print(f"{priority_emoji} {phase.get('phase_name', '阶段')}")
        print(f"   ⏱️  预计时长: {phase.get('duration', '未知')}")
        print(f"   🎯 学习目标: {', '.join(phase.get('goals', []))}")
        print(f"   📚 推荐课程:")
        
        for j, course in enumerate(phase.get('courses', []), 1):
            print(f"      {j}. {course.get('title', '未知课程')} (推荐指数: {course.get('score', 0):.1f}分)")
        print()


def main():
    """主函数：运行完整演示"""
    print("\n" + "🎯" * 35)
    print("  大学生就业方向智能推荐系统 - 完整演示")
    print("🎯" * 35)
    
    # 选择学生
    student = SAMPLE_STUDENTS[0]  # 使用第一个示例学生
    
    # 1. 展示学生画像
    demo_student_profile(student)
    
    # 2. 实习岗位推荐
    demo_internship_recommendation(student, SAMPLE_JOBS)
    
    # 3. 技能缺口分析
    target_jobs = SAMPLE_JOBS[:3]  # 选择前3个岗位作为目标
    skill_gaps = demo_skill_gap_analysis(student, target_jobs)
    
    # 4. 课程推荐
    demo_course_recommendation(student, skill_gaps, SAMPLE_COURSES)
    
    # 5. 学习路线图
    demo_learning_roadmap(student, skill_gaps, SAMPLE_COURSES)
    
    # 总结
    print_section_header("演示总结")
    print("""
本次演示展示了推荐系统的核心功能:

✅ 1. 学生画像分析
   - 霍兰德职业兴趣测评
   - 技能水平评估
   - 职业偏好分析

✅ 2. 实习岗位智能推荐
   - 多维度匹配算法(霍兰德+技能+学业+偏好)
   - 详细的推荐理由说明
   - 个性化匹配度评分

✅ 3. 技能缺口分析
   - 识别技能短板
   - 优先级排序
   - 紧急程度评估

✅ 4. 课程推荐
   - 基于缺口的精准推荐
   - 个性化学习计划
   - 课程质量评估

✅ 5. 学习路线图
   - 分阶段规划
   - 循序渐进的学习路径
   - 明确的学习目标

系统特点:
• 数据驱动的科学推荐
• 个性化的职业规划
• 可视化的分析结果
• 可操作的具体建议

适用场景:
• 大一新生: 职业兴趣测评与专业选择
• 大二大三: 实习岗位推荐与技能提升
• 大三大四: 就业规划与职业发展

""")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n程序已被用户中断")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ 程序运行出错: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)