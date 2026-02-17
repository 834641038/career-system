"""
数据可视化演示
包含5种可视化图表：
1. 霍兰德雷达图
2. 技能对比图
3. 匹配度分解图
4. 技能缺口优先级图
5. 职业路径时间线
"""

import matplotlib.pyplot as plt
import numpy as np
import matplotlib.font_manager as fm
from sample_data import SAMPLE_STUDENTS, SAMPLE_JOBS, SAMPLE_COURSES
from internship_recommender import InternshipRecommendationSystem
from course_recommender import analyze_skill_gap

# 设置中文字体支持
plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False


def visualize_holland_radar(student):
    """
    霍兰德雷达图
    展示学生在六个霍兰德维度上的得分分布
    """
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection='polar'))
    
    # 霍兰德类型标签
    holland_types = ['R(实际型)', 'I(研究型)', 'A(艺术型)', 'S(社会型)', 'E(企业型)', 'C(常规型)']
    scores = [student['holland_scores'][t[0]] for t in ['R', 'I', 'A', 'S', 'E', 'C']]
    
    # 闭合图形
    angles = np.linspace(0, 2 * np.pi, len(holland_types), endpoint=False).tolist()
    scores += scores[:1]
    angles += angles[:1]
    
    # 绘制雷达图
    ax.plot(angles, scores, 'o-', linewidth=2, color='#2E86AB')
    ax.fill(angles, scores, alpha=0.25, color='#2E86AB')
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(holland_types)
    ax.set_ylim(0, 100)
    ax.set_title(f'{student["basic_info"]["name"]}的霍兰德职业兴趣雷达图', fontsize=14, pad=20)
    
    # 添加网格
    ax.grid(True)
    
    plt.tight_layout()
    return fig


def visualize_skill_comparison(student):
    """
    技能对比图
    展示学生的技能掌握情况
    参数:
        student (dict): 包含学生信息的字典，其中包含技能数据
    返回:
        matplotlib.figure.Figure: 包含技能对比图的图形对象
    """
    # 提取技能数据
    # 创建一个空字典用于存储所有技能及其对应等级
    all_skills = {}
    # 遍历学生的技能分类
    for category, skills in student['skills'].items():
        # 检查技能是否为字典类型
        if isinstance(skills, dict):
            # 遍历每个分类下的具体技能
            for skill, info in skills.items():
                # 检查技能信息是否为字典类型
                if isinstance(info, dict):
                    # 从字典中获取技能等级，默认为0
                    level = info.get('level', 0)
                else:
                    # 如果技能信息不是字典，则直接使用该值作为等级
                    level = info
                # 将技能和对应等级添加到总技能字典中
                all_skills[skill] = level
    
    # 按技能等级排序，取前10个
    # 对技能按等级降序排序并取前10个
    sorted_skills = sorted(all_skills.items(), key=lambda x: x[1], reverse=True)[:10]
    # 提取技能名称列表
    skill_names = [item[0] for item in sorted_skills]
    # 提取技能等级列表
    skill_levels = [item[1] for item in sorted_skills]
    
    # 创建柱状图
    # 创建一个新的图形和坐标轴对象，设置图形大小
    fig, ax = plt.subplots(figsize=(10, 6))
    # 创建柱状图，设置颜色为红色
    bars = ax.bar(range(len(skill_names)), skill_levels, color='#F24236')
    
    # 设置样式
    # 设置x轴标签
    ax.set_xlabel('技能名称')
    # 设置y轴标签
    ax.set_ylabel('技能等级 (1-5)')
    # 设置图表标题，使用学生姓名
    ax.set_title(f'{student["basic_info"]["name"]}的技能掌握情况', fontsize=14)
    # 设置x轴刻度位置
    ax.set_xticks(range(len(skill_names)))
    # 设置x轴刻度标签，并旋转45度以避免重叠
    ax.set_xticklabels(skill_names, rotation=45, ha='right')
    # 设置y轴范围
    ax.set_ylim(0, 5)
    
    # 在柱子上显示数值
    # 遍历每个柱子和对应的等级
    for i, (bar, level) in enumerate(zip(bars, skill_levels)):
        # 在柱子上方添加数值标签
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, 
                str(level), ha='center', va='bottom')
    
    # 调整布局以防止标签被截断
    plt.tight_layout()
    # 返回图形对象
    return fig


def visualize_match_breakdown(student, job_recommendations):
    """
    匹配度分解图
    展示学生与推荐岗位的各项匹配度得分
    参数:
        student: 包含学生基本信息的字典
        job_recommendations: 推荐岗位列表，每个岗位包含匹配度分解信息
    返回:
        matplotlib.figure.Figure: 包含匹配度分解图的图形对象
    """
    if not job_recommendations:
        return None
    
    # 取前3个推荐岗位
    top_jobs = job_recommendations[:3]
    
    # 创建图形和坐标轴
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # 提取各项得分
    companies = [job['company'] + '-' + job['position'][:10] + '...' for job in top_jobs]  # 岗位名称（公司-职位）
    holland_scores = [job['score_breakdown']['holland_score'] for job in top_jobs]  # 霍兰德匹配得分
    skill_scores = [job['score_breakdown']['skill_score'] for job in top_jobs]  # 技能匹配得分
    academic_scores = [job['score_breakdown']['academic_score'] for job in top_jobs]  # 学业匹配得分
    preference_scores = [job['score_breakdown']['preference_score'] for job in top_jobs]  # 偏好匹配得分
    
    # 创建堆积柱状图
    x = np.arange(len(companies))  # x轴位置
    width = 0.35  # 柱状图宽度
    
    # 绘制霍兰德匹配柱状图
    ax.bar(x, holland_scores, width, label='霍兰德匹配', color='#2E86AB')
    # 绘制技能匹配柱状图（在霍兰德匹配之上）
    ax.bar(x, skill_scores, width, bottom=holland_scores, label='技能匹配', color='#F24236')
    # 计算技能匹配的底部位置
    bottom_skills = [h+s for h, s in zip(holland_scores, skill_scores)]
    # 绘制学业匹配柱状图（在技能匹配之上）
    ax.bar(x, academic_scores, width, bottom=bottom_skills, label='学业匹配', color='#00FF00')
    # 计算学业匹配的底部位置
    bottom_academic = [b+a for b, a in zip(bottom_skills, academic_scores)]
    # 绘制偏好匹配柱状图（在学业匹配之上）
    ax.bar(x, preference_scores, width, bottom=bottom_academic, label='偏好匹配', color='#FFA500')
    
    # 设置样式
    ax.set_xlabel('岗位')
    ax.set_ylabel('匹配度得分')
    ax.set_title(f'{student["basic_info"]["name"]}的岗位匹配度分解图', fontsize=14)
    ax.set_xticks(x)
    ax.set_xticklabels(companies, rotation=45, ha='right')
    ax.legend()
    
    # 添加总分标注
    total_scores = [job['match_score'] for job in top_jobs]
    for i, score in enumerate(total_scores):
        ax.text(i, score + 5, f'{score:.1f}分', ha='center', va='bottom')
    
    plt.tight_layout()
    return fig


def visualize_skill_gaps(skill_gaps):
    """
    技能缺口优先级图
    展示技能缺口及其优先级排序
    """
    if not skill_gaps:
        return None
    
    # 取前10个技能缺口
    top_gaps = skill_gaps[:10]
    
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # 提取数据
    skills = [gap['skill'] for gap in top_gaps]
    priorities = [gap['priority'] for gap in top_gaps]
    gaps = [gap['gap'] for gap in top_gaps]
    
    # 创建横向柱状图
    y_pos = np.arange(len(skills))
    bars = ax.barh(y_pos, priorities, color='#2E86AB')
    
    # 设置样式
    ax.set_yticks(y_pos)
    ax.set_yticklabels(skills)
    ax.set_xlabel('优先级得分')
    ax.set_title('技能缺口优先级排序', fontsize=14)
    
    # 在柱子末端显示优先级和技能差距
    for i, (bar, priority, gap) in enumerate(zip(bars, priorities, gaps)):
        ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2, 
                f'{priority:.1f}(差{gap}级)', ha='left', va='center')
    
    plt.tight_layout()
    return fig


def visualize_career_timeline(student):
    """
    职业路径时间线
    展示基于学生情况的建议职业发展路径
    """
    # 创建一个12x6大小的图形和坐标轴
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # 构造示例职业发展路径，包含时间点、事件和描述
    timeline_events = [
        {'time': '大一', 'event': '专业基础课程学习', 'desc': '打好数理基础'},
        {'time': '大二', 'event': '参与项目实践', 'desc': '参加竞赛和项目'},
        {'time': '大二暑假', 'event': '第一次实习', 'desc': '寻找相关领域实习机会'},
        {'time': '大三', 'event': '技能深化', 'desc': '深入学习核心技术'},
        {'time': '大三暑假', 'event': '第二次实习', 'desc': '争取知名企业实习'},
        {'time': '大四', 'event': '求职准备', 'desc': '完善简历，准备面试'}
    ]
    
    # 时间轴位置
    times = [event['time'] for event in timeline_events]
    positions = range(len(times))
    
    # 绘制时间轴
    ax.hlines(y=0, xmin=0, xmax=len(positions)-1, color='gray', linewidth=2)
    
    # 绘制事件点
    ax.scatter(positions, [0]*len(positions), s=100, color='#2E86AB', zorder=3)
    
    # 添加事件标签
    for i, (pos, event) in enumerate(zip(positions, timeline_events)):
        ax.annotate(f"{event['time']}\n{event['event']}", 
                   xy=(pos, 0), 
                   xytext=(pos, 0.1 if i % 2 == 0 else -0.2),
                   ha='center',
                   fontsize=9,
                   arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))
        ax.annotate(event['desc'], 
                   xy=(pos, 0), 
                   xytext=(pos, -0.3 if i % 2 == 0 else -0.4),
                   ha='center',
                   fontsize=8,
                   color='gray')
    
    # 设置样式
    ax.set_xlim(-0.5, len(positions)-0.5)
    ax.set_ylim(-0.5, 0.5)
    ax.set_title(f'{student["basic_info"]["name"]}建议职业发展时间线', fontsize=14)
    ax.axis('off')
    
    plt.tight_layout()
    return fig


def main():
    """主函数：运行所有可视化演示"""
    print("大学生职业推荐系统 - 数据可视化演示")
    print("=" * 50)
    
    # 选择第一个学生作为示例
    student = SAMPLE_STUDENTS[0]
    print(f"正在为 {student['basic_info']['name']} 生成可视化图表...")
    
    # 创建可视化图表
    visualizations = []
    
    # 1. 霍兰德雷达图
    print("1. 生成霍兰德雷达图...")
    fig1 = visualize_holland_radar(student)
    visualizations.append(("霍兰德雷达图", fig1))
    
    # 2. 技能对比图
    print("2. 生成技能对比图...")
    fig2 = visualize_skill_comparison(student)
    visualizations.append(("技能对比图", fig2))
    
    # 3. 匹配度分解图
    print("3. 生成匹配度分解图...")
    recommender = InternshipRecommendationSystem()
    job_recommendations = recommender.recommend_internships(student, SAMPLE_JOBS, top_n=5)
    fig3 = visualize_match_breakdown(student, job_recommendations)
    if fig3:
        visualizations.append(("匹配度分解图", fig3))
    
    # 4. 技能缺口优先级图
    print("4. 生成技能缺口优先级图...")
    skill_gaps = analyze_skill_gap(student, SAMPLE_JOBS[:3])
    fig4 = visualize_skill_gaps(skill_gaps)
    if fig4:
        visualizations.append(("技能缺口优先级图", fig4))
    
    # 5. 职业路径时间线
    print("5. 生成职业路径时间线...")
    fig5 = visualize_career_timeline(student)
    visualizations.append(("职业路径时间线", fig5))
    
    # 显示所有图表
    print(f"\n生成完成！共创建了 {len(visualizations)} 个可视化图表。")
    print("请关闭当前图表窗口以查看下一个图表。")
    
    for name, fig in visualizations:
        print(f"\n显示: {name}")
        plt.show()
    
    print("\n所有可视化演示已完成！")


if __name__ == "__main__":
    main()