# 示例数据文件

# 1. 学生画像示例数据
SAMPLE_STUDENTS = [
    {
        "student_id": "2024001",
        "basic_info": {
            "name": "张三",
            "major": "数据科学与大数据技术",
            "grade": 2,
            "gpa": 3.6
        },
        "holland_scores": {
            "R": 45,  # 实际型 (Realistic)
            "I": 85,  # 研究型 (Investigative)
            "A": 60,  # 艺术型 (Artistic)
            "S": 50,  # 社会型 (Social)
            "E": 70,  # 企业型 (Enterprising)
            "C": 75   # 常规型 (Conventional)
        },
        "holland_code": "IEC",  # 研究-企业-常规型
        "skills": {
            "programming": {
                "Python": {"level": 4, "certified": True},
                "SQL": {"level": 3, "certified": False},
                "Java": {"level": 2, "certified": False}
            },
            "data_analysis": {
                "机器学习": {"level": 3, "certified": False},
                "数据可视化": {"level": 4, "certified": True},
                "统计分析": {"level": 3, "certified": False}
            },
            "soft_skills": {
                "团队协作": 4,
                "沟通表达": 3,
                "项目管理": 2
            }
        },
        "academic_records": {
            "courses_completed": ["数据结构", "机器学习", "数据库原理"],
            "projects": [
                {
                    "name": "电商用户行为分析",
                    "skills_used": ["Python", "机器学习"],
                    "score": 90
                }
            ],
            "competitions": ["数学建模竞赛-省三等奖"]
        },
        "career_preferences": {
            "preferred_industries": ["互联网", "金融科技", "人工智能"],
            "work_location": ["北京", "上海", "深圳"],
            "company_size": ["大型企业", "独角兽"],
            "work_life_balance": 7  # 1-10分
        },
        "internship_history": [
            {
                "company": "某科技公司",
                "position": "数据分析实习生",
                "duration": 3,  # 月
                "rating": 4.5   # 公司评分
            }
        ]
    },
    {
        "student_id": "2024002",
        "basic_info": {
            "name": "李四",
            "major": "计算机科学与技术",
            "grade": 3,
            "gpa": 3.8
        },
        "holland_scores": {
            "R": 70,
            "I": 80,
            "A": 40,
            "S": 45,
            "E": 60,
            "C": 65
        },
        "holland_code": "IRC",
        "skills": {
            "programming": {
                "Python": {"level": 5, "certified": True},
                "Java": {"level": 4, "certified": True},
                "C++": {"level": 3, "certified": False}
            },
            "data_analysis": {
                "机器学习": {"level": 4, "certified": True},
                "深度学习": {"level": 3, "certified": False}
            },
            "soft_skills": {
                "团队协作": 5,
                "沟通表达": 4,
                "项目管理": 3
            }
        },
        "academic_records": {
            "courses_completed": ["算法设计", "深度学习", "计算机视觉"],
            "projects": [
                {
                    "name": "图像识别系统",
                    "skills_used": ["Python", "深度学习"],
                    "score": 95
                }
            ],
            "competitions": ["ACM竞赛-国家二等奖"]
        },
        "career_preferences": {
            "preferred_industries": ["人工智能", "互联网"],
            "work_location": ["北京", "杭州"],
            "company_size": ["大型企业"],
            "work_life_balance": 6
        },
        "internship_history": []
    }
]

# 2. 岗位示例数据
SAMPLE_JOBS = [
    {
        "job_id": "J2024001",
        "company": "字节跳动",
        "position": "数据分析实习生",
        "location": "北京",
        "company_size": "大型企业",
        "holland_match": {
            "I": 0.7,  # 研究型权重70%
            "C": 0.2,  # 常规型权重20%
            "E": 0.1   # 企业型权重10%
        },
        "required_skills": {
            "必需技能": {
                "Python": 3,
                "SQL": 3,
                "数据可视化": 3
            },
            "加分技能": {
                "机器学习": 2,
                "大数据处理": 2
            }
        },
        "requirements": {
            "min_gpa": 3.0,
            "preferred_majors": ["数据科学", "统计学", "计算机科学"],
            "grade_range": [2, 3]  # 大二到大三
        },
        "job_details": {
            "salary_range": [150, 250],  # 日薪
            "duration": [3, 6],  # 实习时长（月）
            "work_mode": "混合办公",
            "growth_potential": 8,  # 1-10分
            "work_life_balance": 7
        },
        "keywords": ["用户行为分析", "A/B测试", "数据报表", "业务洞察"]
    },
    {
        "job_id": "J2024002",
        "company": "阿里巴巴",
        "position": "机器学习算法实习生",
        "location": "杭州",
        "company_size": "大型企业",
        "holland_match": {
            "I": 0.8,
            "R": 0.15,
            "E": 0.05
        },
        "required_skills": {
            "必需技能": {
                "Python": 4,
                "机器学习": 3,
                "深度学习": 2
            },
            "加分技能": {
                "计算机视觉": 2,
                "自然语言处理": 2
            }
        },
        "requirements": {
            "min_gpa": 3.5,
            "preferred_majors": ["计算机科学", "人工智能", "数据科学"],
            "grade_range": [2, 4]
        },
        "job_details": {
            "salary_range": [200, 300],
            "duration": [3, 6],
            "work_mode": "现场办公",
            "growth_potential": 9,
            "work_life_balance": 6
        },
        "keywords": ["机器学习", "算法优化", "模型训练"]
    },
    {
        "job_id": "J2024003",
        "company": "腾讯",
        "position": "前端开发实习生",
        "location": "深圳",
        "company_size": "大型企业",
        "holland_match": {
            "A": 0.5,
            "I": 0.3,
            "C": 0.2
        },
        "required_skills": {
            "必需技能": {
                "JavaScript": 3,
                "React": 3,
                "Vue": 2
            },
            "加分技能": {
                "TypeScript": 2,
                "Node.js": 2
            }
        },
        "requirements": {
            "min_gpa": 3.0,
            "preferred_majors": ["计算机科学", "软件工程"],
            "grade_range": [2, 3]
        },
        "job_details": {
            "salary_range": [180, 280],
            "duration": [3, 6],
            "work_mode": "混合办公",
            "growth_potential": 7,
            "work_life_balance": 7
        },
        "keywords": ["前端开发", "用户体验", "Web开发"]
    },
    {
        "job_id": "J2024004",
        "company": "美团",
        "position": "数据产品实习生",
        "location": "北京",
        "company_size": "大型企业",
        "holland_match": {
            "E": 0.5,
            "I": 0.3,
            "C": 0.2
        },
        "required_skills": {
            "必需技能": {
                "Python": 3,
                "SQL": 3,
                "数据分析": 3
            },
            "加分技能": {
                "产品设计": 2,
                "商业分析": 2
            }
        },
        "requirements": {
            "min_gpa": 3.2,
            "preferred_majors": ["数据科学", "商业分析", "信息管理"],
            "grade_range": [2, 4]
        },
        "job_details": {
            "salary_range": [160, 240],
            "duration": [3, 6],
            "work_mode": "现场办公",
            "growth_potential": 8,
            "work_life_balance": 6
        },
        "keywords": ["产品设计", "数据分析", "商业洞察"]
    },
    {
        "job_id": "J2024005",
        "company": "百度",
        "position": "自然语言处理实习生",
        "location": "北京",
        "company_size": "大型企业",
        "holland_match": {
            "I": 0.7,
            "R": 0.2,
            "C": 0.1
        },
        "required_skills": {
            "必需技能": {
                "Python": 4,
                "机器学习": 3,
                "自然语言处理": 2
            },
            "加分技能": {
                "深度学习": 3,
                "TensorFlow": 2
            }
        },
        "requirements": {
            "min_gpa": 3.5,
            "preferred_majors": ["计算机科学", "人工智能", "自然语言处理"],
            "grade_range": [2, 4]
        },
        "job_details": {
            "salary_range": [200, 300],
            "duration": [3, 6],
            "work_mode": "混合办公",
            "growth_potential": 9,
            "work_life_balance": 7
        },
        "keywords": ["NLP", "文本分析", "语言模型"]
    }
]

# 3. 课程示例数据
SAMPLE_COURSES = [
    {
        "course_id": "C2024001",
        "title": "Python数据分析进阶",
        "platform": "Coursera",
        "provider": "密歇根大学",
        "course_type": "技能提升",
        "difficulty": "中级",
        "duration": 40,  # 小时
        "cost": 299,  # 元
        "skill_improvement": {
            "Python": 1,  # 提升1个等级
            "数据可视化": 1,
            "数据清洗": 1
        },
        "holland_fit": ["I", "C"],
        "prerequisites": {
            "Python": 2,
            "统计学基础": 1
        },
        "rating": 4.7,
        "completion_rate": 0.78,
        "reviews_count": 2340
    },
    {
        "course_id": "C2024002",
        "title": "机器学习实战",
        "platform": "edX",
        "provider": "斯坦福大学",
        "course_type": "技能提升",
        "difficulty": "高级",
        "duration": 60,
        "cost": 399,
        "skill_improvement": {
            "机器学习": 2,
            "Python": 1,
            "数据分析": 1
        },
        "holland_fit": ["I", "R"],
        "prerequisites": {
            "Python": 3,
            "数学基础": 2,
            "统计学基础": 2
        },
        "rating": 4.8,
        "completion_rate": 0.72,
        "reviews_count": 5678
    },
    {
        "course_id": "C2024003",
        "title": "深度学习专项课程",
        "platform": "Coursera",
        "provider": "deeplearning.ai",
        "course_type": "技能提升",
        "difficulty": "高级",
        "duration": 80,
        "cost": 499,
        "skill_improvement": {
            "深度学习": 2,
            "机器学习": 1,
            "Python": 1
        },
        "holland_fit": ["I"],
        "prerequisites": {
            "Python": 4,
            "机器学习": 3,
            "数学基础": 3
        },
        "rating": 4.9,
        "completion_rate": 0.68,
        "reviews_count": 12345
    },
    {
        "course_id": "C2024004",
        "title": "SQL数据库实战",
        "platform": "Udemy",
        "provider": "Jose Portilla",
        "course_type": "技能提升",
        "difficulty": "中级",
        "duration": 30,
        "cost": 199,
        "skill_improvement": {
            "SQL": 2,
            "数据库设计": 1
        },
        "holland_fit": ["C", "I"],
        "prerequisites": {
            "数据库基础": 1
        },
        "rating": 4.6,
        "completion_rate": 0.85,
        "reviews_count": 8901
    },
    {
        "course_id": "C2024005",
        "title": "数据可视化与Tableau",
        "platform": "Coursera",
        "provider": "杜克大学",
        "course_type": "技能提升",
        "difficulty": "初级",
        "duration": 25,
        "cost": 149,
        "skill_improvement": {
            "数据可视化": 2,
            "数据分析": 1
        },
        "holland_fit": ["C", "I", "A"],
        "prerequisites": {},
        "rating": 4.5,
        "completion_rate": 0.88,
        "reviews_count": 4567
    },
    {
        "course_id": "C2024006",
        "title": "大数据处理技术",
        "platform": "edX",
        "provider": "MIT",
        "course_type": "技能提升",
        "difficulty": "高级",
        "duration": 70,
        "cost": 449,
        "skill_improvement": {
            "大数据处理": 2,
            "Python": 1,
            "分布式计算": 1
        },
        "holland_fit": ["I", "R"],
        "prerequisites": {
            "Python": 3,
            "数据结构": 2
        },
        "rating": 4.7,
        "completion_rate": 0.65,
        "reviews_count": 3456
    },
    {
        "course_id": "C2024007",
        "title": "自然语言处理入门",
        "platform": "Coursera",
        "provider": "斯坦福大学",
        "course_type": "技能提升",
        "difficulty": "中级",
        "duration": 50,
        "cost": 349,
        "skill_improvement": {
            "自然语言处理": 2,
            "Python": 1,
            "机器学习": 1
        },
        "holland_fit": ["I"],
        "prerequisites": {
            "Python": 3,
            "机器学习": 2
        },
        "rating": 4.8,
        "completion_rate": 0.70,
        "reviews_count": 6789
    },
    {
        "course_id": "C2024008",
        "title": "商业数据分析",
        "platform": "Coursera",
        "provider": "宾夕法尼亚大学",
        "course_type": "技能提升",
        "difficulty": "中级",
        "duration": 35,
        "cost": 299,
        "skill_improvement": {
            "商业分析": 2,
            "数据分析": 1,
            "Excel": 1
        },
        "holland_fit": ["E", "C", "I"],
        "prerequisites": {
            "统计学基础": 1
        },
        "rating": 4.6,
        "completion_rate": 0.80,
        "reviews_count": 5432
    }
]

# 4. 职业发展路径示例数据
CAREER_PATHS_DATABASE = [
    {
        "path_id": "P001",
        "path_name": "数据科学家发展路径",
        "holland_codes": ["I", "C"],
        "stages": [
            {
                "stage": "短期目标（大二下-大三上）",
                "duration": "6-12个月",
                "goals": [
                    "完成2-3个数据分析项目",
                    "掌握Python、SQL、数据可视化",
                    "获得1段数据分析实习经历"
                ],
                "recommended_internships": ["数据分析实习生", "BI分析实习生"],
                "courses": ["C2024001", "C2024004", "C2024005"],
                "milestones": {
                    "技能达标": ["Python>=4", "SQL>=3"],
                    "证书": ["Python数据分析师认证"],
                    "项目": 2
                }
            },
            {
                "stage": "中期规划（大三下-大四上）",
                "duration": "12-18个月",
                "goals": [
                    "深入学习机器学习算法",
                    "参与企业级数据项目",
                    "获得知名企业实习offer"
                ],
                "recommended_internships": ["机器学习实习生", "算法工程师实习生"],
                "courses": ["C2024002", "C2024003"],
                "milestones": {
                    "技能达标": ["机器学习>=4", "深度学习>=3"],
                    "证书": ["数据科学家认证"],
                    "竞赛": ["Kaggle竞赛Top 10%"]
                }
            },
            {
                "stage": "长期愿景（毕业后3-5年）",
                "duration": "3-5年",
                "goals": [
                    "成为资深数据科学家",
                    "主导大型数据项目",
                    "向数据科学管理层发展"
                ],
                "career_options": [
                    "数据科学家",
                    "机器学习工程师",
                    "数据产品经理"
                ],
                "salary_expectation": {
                    "entry": "15-25k/月",
                    "3_years": "25-40k/月",
                    "5_years": "40-60k/月"
                }
            }
        ],
        "success_cases": [
            {
                "alumni_id": "A2020001",
                "current_position": "字节跳动-数据科学家",
                "years_after_graduation": 2,
                "salary": "35k/月",
                "career_satisfaction": 8.5
            }
        ]
    },
    {
        "path_id": "P002",
        "path_name": "算法工程师发展路径",
        "holland_codes": ["I", "R"],
        "stages": [
            {
                "stage": "短期目标（大二下-大三上）",
                "duration": "6-12个月",
                "goals": [
                    "掌握核心算法和数据结构",
                    "完成3-5个算法项目",
                    "参加ACM竞赛"
                ],
                "recommended_internships": ["算法实习生", "软件开发实习生"],
                "courses": ["C2024002", "C2024003"],
                "milestones": {
                    "技能达标": ["算法>=4", "Python>=4"],
                    "竞赛": ["ACM竞赛奖项"],
                    "项目": 3
                }
            },
            {
                "stage": "中期规划（大三下-大四上）",
                "duration": "12-18个月",
                "goals": [
                    "深入机器学习算法",
                    "参与开源项目",
                    "获得知名企业实习offer"
                ],
                "recommended_internships": ["机器学习实习生", "算法工程师实习生"],
                "courses": ["C2024003", "C2024007"],
                "milestones": {
                    "技能达标": ["机器学习>=4", "深度学习>=3"],
                    "开源贡献": ["GitHub stars >= 100"],
                    "实习": ["知名企业实习经历"]
                }
            },
            {
                "stage": "长期愿景（毕业后3-5年）",
                "duration": "3-5年",
                "goals": [
                    "成为高级算法工程师",
                    "主导算法项目",
                    "向技术专家发展"
                ],
                "career_options": [
                    "算法工程师",
                    "机器学习工程师",
                    "技术专家"
                ],
                "salary_expectation": {
                    "entry": "20-30k/月",
                    "3_years": "30-50k/月",
                    "5_years": "50-80k/月"
                }
            }
        ],
        "success_cases": [
            {
                "alumni_id": "A2020002",
                "current_position": "阿里巴巴-算法工程师",
                "years_after_graduation": 3,
                "salary": "45k/月",
                "career_satisfaction": 9.0
            }
        ]
    }
]

# 全局变量，用于兼容旧代码
career_paths_database = CAREER_PATHS_DATABASE
# 兼容命名：将课程目录别名为 COURSE_CATALOG，供旧代码使用
COURSE_CATALOG = SAMPLE_COURSES

# 当前的函数缺少适当的错误处理
def get_student_by_id(student_id):
    """根据学生ID获取学生画像"""
    for student in SAMPLE_STUDENTS:
        if student.get("student_id") == student_id:
            return student
    return None  # 应该考虑抛出异常或者返回标准错误信息


def get_student_profile(student_id):
    """根据学生ID获取学生画像（兼容函数）"""
    return get_student_by_id(student_id)


def get_filtered_jobs(filters):
    """根据筛选条件获取岗位列表"""
    filtered_jobs = []
    for job in SAMPLE_JOBS:
        if 'location' in filters and filters['location']:
            if job.get('location') not in filters['location']:
                continue
        if 'industry' in filters and filters['industry']:
            if job.get('industry') not in filters['industry']:
                continue
        filtered_jobs.append(job)
    return filtered_jobs


def get_jobs_by_ids(job_ids):
    """根据岗位ID列表获取岗位"""
    jobs = []
    for job_id in job_ids:
        for job in SAMPLE_JOBS:
            if job.get('job_id') == job_id:
                jobs.append(job)
                break
    return jobs


def get_course_catalog():
    """获取课程目录"""
    return SAMPLE_COURSES# 示例数据文件
"""
本文件包含大学生职业推荐系统的核心示例数据，包括：
1. 学生画像数据
2. 实习岗位数据
3. 课程数据
4. 职业发展路径数据
以及相关的数据访问函数。
"""

# 1. 学生画像示例数据
SAMPLE_STUDENTS = [
    {
        # 学生唯一标识符
        "student_id": "2024001",
        # 基本信息模块：包含学生的基础信息
        "basic_info": {
            "name": "张三",
            "major": "数据科学与大数据技术",
            "grade": 2,  # 大学年级
            "gpa": 3.6   # 平均绩点
        },
        # Holland职业兴趣测试得分（0-100分）
        "holland_scores": {
            "R": 45,  # 实际型 (Realistic) - 喜欢具体、实际的工作
            "I": 85,  # 研究型 (Investigative) - 喜欢分析、研究
            "A": 60,  # 艺术型 (Artistic) - 喜欢创造性工作
            "S": 50,  # 社会型 (Social) - 喜欢帮助他人
            "E": 70,  # 企业型 (Enterprising) - 喜欢领导、管理
            "C": 75   # 常规型 (Conventional) - 喜欢有条理的工作
        },
        # Holland职业兴趣类型代码（按得分排序的前三位）
        "holland_code": "IEC",  # 研究-企业-常规型
        # 技能评估模块：包含各类技能的掌握程度（1-5级）
        "skills": {
            # 编程技能
            "programming": {
                "Python": {"level": 4, "certified": True},  # level: 技能等级, certified: 是否有认证
                "SQL": {"level": 3, "certified": False},
                "Java": {"level": 2, "certified": False}
            },
            # 数据分析技能
            "data_analysis": {
                "机器学习": {"level": 3, "certified": False},
                "数据可视化": {"level": 4, "certified": True},
                "统计分析": {"level": 3, "certified": False}
            },
            # 软技能
            "soft_skills": {
                "团队协作": 4,  # 1-5分
                "沟通表达": 3,
                "项目管理": 2
            }
        },
        # 学术记录模块
        "academic_records": {
            # 已完成课程
            "courses_completed": ["数据结构", "机器学习", "数据库原理"],
            # 项目经历
            "projects": [
                {
                    "name": "电商用户行为分析",
                    "skills_used": ["Python", "机器学习"],  # 项目使用的主要技能
                    "score": 90  # 项目评分
                }
            ],
            # 竞赛经历
            "competitions": ["数学建模竞赛-省三等奖"]
        },
        # 职业偏好模块
        "career_preferences": {
            "preferred_industries": ["互联网", "金融科技", "人工智能"],
            "work_location": ["北京", "上海", "深圳"],
            "company_size": ["大型企业", "独角兽"],
            "work_life_balance": 7  # 工作生活平衡评分（1-10分）
        },
        # 实习经历模块
        "internship_history": [
            {
                "company": "某科技公司",
                "position": "数据分析实习生",
                "duration": 3,  # 实习时长（月）
                "rating": 4.5   # 公司评分（1-5分）
            }
        ]
    },
    # 第二个学生示例数据...
]

# 2. 岗位示例数据
SAMPLE_JOBS = [
    {
        # 岗位唯一标识符
        "job_id": "J2024001",
        # 基本信息模块
        "company": "字节跳动",
        "position": "数据分析实习生",
        "location": "北京",
        "company_size": "大型企业",
        # Holland职业匹配度权重
        "holland_match": {
            "I": 0.7,  # 研究型权重70%
            "C": 0.2,  # 常规型权重20%
            "E": 0.1   # 企业型权重10%
        },
        # 技能要求模块
        "required_skills": {
            "必需技能": {
                "Python": 3,  # 技能名称: 要求等级（1-5级）
                "SQL": 3,
                "数据可视化": 3
            },
            "加分技能": {
                "机器学习": 2,
                "大数据处理": 2
            }
        },
        # 任职要求模块
        "requirements": {
            "min_gpa": 3.0,  # 最低GPA要求
            "preferred_majors": ["数据科学", "统计学", "计算机科学"],
            "grade_range": [2, 3]  # 适合年级范围
        },
        # 岗位详情模块
        "job_details": {
            "salary_range": [150, 250],  # 日薪范围（元）
            "duration": [3, 6],         # 实习时长范围（月）
            "work_mode": "混合办公",    # 工作模式
            "growth_potential": 8,      # 成长潜力评分（1-10分）
            "work_life_balance": 7      # 工作生活平衡评分（1-10分）
        },
        # 岗位关键词
        "keywords": ["用户行为分析", "A/B测试", "数据报表", "业务洞察"]
    },
    # 更多岗位示例...
]

# 3. 课程示例数据
SAMPLE_COURSES = [
    {
        # 课程唯一标识符
        "course_id": "C2024001",
        # 基本信息模块
        "title": "Python数据分析进阶",
        "platform": "Coursera",  # 授课平台
        "provider": "密歇根大学", # 课程提供方
        "course_type": "技能提升",
        "difficulty": "中级",     # 课程难度
        "duration": 40,          # 课程时长（小时）
        "cost": 299,             # 课程费用（元）
        # 技能提升效果模块
        "skill_improvement": {
            "Python": 1,         # 技能名称: 提升等级
            "数据可视化": 1,
            "数据清洗": 1
        },
        # 适合的Holland职业类型
        "holland_fit": ["I", "C"],
        # 前置要求模块
        "prerequisites": {
            "Python": 2,         # 技能名称: 最低要求等级
            "统计学基础": 1
        },
        # 课程评价模块
        "rating": 4.7,           # 课程评分（1-5分）
        "completion_rate": 0.78, # 完成率
        "reviews_count": 2340    # 评价数量
    },
    # 更多课程示例...
]

# 4. 职业发展路径示例数据
CAREER_PATHS_DATABASE = [
    {
        # 路径唯一标识符
        "path_id": "P001",
        "path_name": "数据科学家发展路径",
        # 适合的Holland职业类型
        "holland_codes": ["I", "C"],
        # 发展阶段模块
        "stages": [
            {
                # 短期目标阶段
                "stage": "短期目标（大二下-大三上）",
                "duration": "6-12个月",
                # 阶段目标
                "goals": [
                    "完成2-3个数据分析项目",
                    "掌握Python、SQL、数据可视化",
                    "获得1段数据分析实习经历"
                ],
                # 推荐实习岗位
                "recommended_internships": ["数据分析实习生", "BI分析实习生"],
                # 推荐课程
                "courses": ["C2024001", "C2024004", "C2024005"],
                # 里程碑要求
                "milestones": {
                    "技能达标": ["Python>=4", "SQL>=3"],
                    "证书": ["Python数据分析师认证"],
                    "项目": 2  # 项目数量要求
                }
            },
            # 中期和长期阶段...
        ],
        # 成功案例模块
        "success_cases": [
            {
                "alumni_id": "A2020001",
                "current_position": "字节跳动-数据科学家",
                "years_after_graduation": 2,
                "salary": "35k/月",
                "career_satisfaction": 8.5  # 职业满意度评分（1-10分）
            }
        ]
    },
    # 更多职业发展路径...
]

# 全局变量，用于兼容旧代码
career_paths_database = CAREER_PATHS_DATABASE

# 数据访问函数
def get_student_by_id(student_id):
    """
    根据学生ID获取学生画像
    Args:
        student_id: 学生ID字符串
    Returns:
        dict: 学生画像数据，未找到返回None
    """
    for student in SAMPLE_STUDENTS:
        if student.get("student_id") == student_id:
            return student
    return None  # TODO: 考虑抛出异常或返回标准错误信息

def get_student_profile(student_id):
    """
    根据学生ID获取学生画像（兼容函数）
    Args:
        student_id: 学生ID字符串
    Returns:
        dict: 学生画像数据
    """
    return get_student_by_id(student_id)

def get_filtered_jobs(filters):
    """
    根据筛选条件获取岗位列表
    Args:
        filters: 筛选条件字典，支持location和industry筛选
    Returns:
        list: 符合条件的岗位列表
    """
    filtered_jobs = []
    for job in SAMPLE_JOBS:
        # 地点筛选
        if 'location' in filters and filters['location']:
            if job.get('location') not in filters['location']:
                continue
        # 行业筛选
        if 'industry' in filters and filters['industry']:
            if job.get('industry') not in filters['industry']:
                continue
        filtered_jobs.append(job)
    return filtered_jobs

def get_jobs_by_ids(job_ids):
    """
    根据岗位ID列表获取岗位
    Args:
        job_ids: 岗位ID列表
    Returns:
        list: 岗位数据列表
    """
    jobs = []
    for job_id in job_ids:
        for job in SAMPLE_JOBS:
                        if job.get('job_id') == job_id:
                            jobs.append(job)
                            break
                
    return jobs

def get_course_catalog():
    """
    获取课程目录
    Returns:
        list: 所有课程数据列表
    """
    return SAMPLE_COURSES
