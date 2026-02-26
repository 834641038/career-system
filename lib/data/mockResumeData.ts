// 张三简历模拟数据
const zhangsanResumeData = {
  // 基础认证信息
  auth: {
    id: "2024001",
    email: "zhangsan_ds@csu.edu.cn",
    name: "张三",
    studentId: "2023005678",
    major: "数据科学与大数据技术",
    university: "中南大学",
    enrollmentYear: "2023",
    graduationYear: "2027"
  },

  // 基础个人信息
  personalInfo: {
    name: "张三",
    englishName: "Zhang San",
    email: "zhangsan_ds@csu.edu.cn",
    phone: "13987654321",
    gender: "male",
    birthday: "2005-08-20",
    location: "湖南省长沙市",
    hometown: "湖北省武汉市",
    avatar: "/avatars/zhangsan.jpg",
    bio: "中南大学数据科学与大数据技术专业大二学生，专注于数据分析与机器学习方向，具备扎实的Python编程和数据处理能力，参与多项校内数据分析项目，拥有金融科技领域实习经历，目标成为数据分析师/算法工程师。",
    joinDate: "2024-09-01",
    lastLogin: "2025-02-20",
    accountStatus: "active"
  },

  // 学术背景
  academicBackground: {
    university: "中南大学",
    college: "信息科学与工程学院",
    major: "数据科学与大数据技术",
    degree: "bachelor",
    gpa: "3.6/4.0",
    ranking: "专业前20%",
    enrollmentYear: "2023",
    expectedGraduation: "2027-06",
    academicAchievements: [
      "校级三好学生（2024年）",
      "数学建模竞赛省级二等奖（2024年）",
      "大数据分析挑战赛校级一等奖（2024年）",
      "校级奖学金获得者（2023-2024学年）"
    ]
  },

  // 技能评估数据
  skillAssessment: {
    technicalSkills: {
      programmingLanguages: [
        { name: "Python", level: "proficient", proficiency: 85 },
        { name: "SQL", level: "proficient", proficiency: 80 },
        { name: "Java", level: "basic", proficiency: 70 },
        { name: "R", level: "basic", proficiency: 65 },
        { name: "JavaScript", level: "basic", proficiency: 60 }
      ],
      dataAnalysis: [
        { name: "机器学习", level: "proficient", proficiency: 80 },
        { name: "数据可视化", level: "proficient", proficiency: 85 },
        { name: "数据清洗", level: "expert", proficiency: 90 },
        { name: "统计分析", level: "proficient", proficiency: 78 },
        { name: "深度学习", level: "basic", proficiency: 65 }
      ],
      tools: [
        { name: "MySQL", level: "proficient", proficiency: 80 },
        { name: "Pandas", level: "expert", proficiency: 90 },
        { name: "Matplotlib/Seaborn", level: "expert", proficiency: 88 },
        { name: "Scikit-learn", level: "proficient", proficiency: 82 },
        { name: "Tableau", level: "basic", proficiency: 70 }
      ]
    },
    softSkills: {
      communication: 80,
      teamwork: 85,
      problemSolving: 78,
      leadership: 70,
      adaptability: 82,
      timeManagement: 75
    }
  },

  // 职业测评结果
  careerAssessment: {
    hollandCode: {
      primary: "ICE", // Investigative-Conventional-Enterprising
      scores: {
        realistic: 60,
        investigative: 85,
        artistic: 55,
        social: 65,
        enterprising: 70,
        conventional: 75
      },
      recommendedCareers: [
        "数据分析师",
        "金融数据工程师",
        "AI训练师",
        "商业智能分析师",
        "量化分析师"
      ]
    },
    valuesAssessment: {
      topValues: [
        { name: "技术成长", score: 88, rank: 1 },
        { name: "创新性", score: 82, rank: 2 },
        { name: "稳定性", score: 78, rank: 3 },
        { name: "薪资回报", score: 75, rank: 4 },
        { name: "社会价值", score: 70, rank: 5 }
      ]
    },
    interestAreas: [
      "数据分析",
      "金融科技",
      "人工智能",
      "商业智能",
      "量化分析"
    ]
  },

  // 简历核心数据
  resume: {
    basicInfo: {
      name: "张三",
      email: "zhangsan_ds@csu.edu.cn",
      phone: "13987654321",
      gender: "male",
      birthday: "2005-08-20",
      location: "湖南省长沙市",
      avatar: "/avatars/zhangsan.jpg"
    },
    jobIntention: {
      position: "数据分析师/数据分析实习生",
      industry: "互联网/金融科技/人工智能",
      salaryExpectation: "5K-8K（实习）/10K-15K（全职）",
      workLocation: "长沙/武汉/上海",
      employmentType: "internship" // 优先实习
    },
    educationExperiences: [
      {
        id: "edu_001",
        school: "中南大学",
        major: "数据科学与大数据技术",
        degree: "bachelor",
        startDate: "2023-09",
        endDate: "2027-06",
        gpa: "3.6/4.0",
        description: "主修课程：数据结构、Python编程、数据库原理、统计学、机器学习、大数据处理技术、数据可视化、金融数据分析等。专业排名前20%，多次获得校级奖学金。"
      }
    ],
    workExperiences: [
      {
        id: "work_001",
        company: "某头部金融科技公司（长沙）",
        position: "数据分析实习生",
        startDate: "2024-07",
        endDate: "2024-09",
        isCurrent: false,
        description: "协助数据团队完成用户行为数据分析、金融产品交易数据清洗与可视化工作，使用Python（Pandas/Numpy）处理千万级数据，制作日报/周报可视化报表，支撑业务决策。",
        achievements: [
          "独立完成用户留存率分析模型，优化后留存率提升5%",
          "制作10+份可视化报表，覆盖交易、用户、产品三大维度",
          "参与反欺诈数据模型的特征工程，筛选有效特征20+个"
        ]
      }
    ],
    projectExperiences: [
      {
        id: "proj_001",
        projectName: "校园消费数据分析平台",
        role: "核心开发者",
        startDate: "2024-03",
        endDate: "2024-06",
        isCurrent: false,
        description: "基于Python+Flask+MySQL开发的校园消费数据分析平台，爬取校园一卡通消费数据，通过统计分析和机器学习预测消费趋势，为学校食堂运营提供决策支持。",
        technologies: ["Python", "Pandas", "Matplotlib", "MySQL", "Flask"],
        link: "https://github.com/zhangsan/campus-consume-analysis"
      },
      {
        id: "proj_002",
        projectName: "电商用户画像构建与推荐系统",
        role: "开发者",
        startDate: "2024-09",
        endDate: "2024-12",
        isCurrent: false,
        description: "基于公开电商数据集，使用K-means聚类构建用户画像，结合协同过滤算法实现商品推荐，最终推荐准确率达75%，使用Streamlit制作可视化展示界面。",
        technologies: ["Python", "Scikit-learn", "Pandas", "Streamlit"],
        link: "https://github.com/zhangsan/e-commerce-recommendation"
      }
    ],
    skills: [
      { id: "skill_001", name: "Python", level: "proficient" },
      { id: "skill_002", name: "SQL", level: "proficient" },
      { id: "skill_003", name: "数据可视化", level: "proficient" },
      { id: "skill_004", name: "机器学习", level: "proficient" },
      { id: "skill_005", name: "数据清洗", level: "expert" },
      { id: "skill_006", name: "Pandas", level: "expert" },
      { id: "skill_007", name: "MySQL", level: "proficient" }
    ],
    certificates: [
      { id: "cert_001", name: "Python工程师认证（中级）", level: "proficient", score: "88分" },
      { id: "cert_002", name: "全国计算机等级考试三级（数据库技术）", level: "proficient", score: "良好" }
    ],
    selfEvaluation: {
      content: "作为数据科学与大数据技术专业的大二学生，我具备扎实的数据分析基础和Python编程能力，拥有金融科技公司数据分析实习经历，熟悉数据清洗、可视化、机器学习等核心技能。在校期间参与多个数据分析项目，具备良好的逻辑思维和团队协作能力，能够快速上手数据分析相关工作。我对金融科技和互联网行业的数据分析岗位有浓厚兴趣，希望通过实习积累实战经验，为未来从事数据相关工作打下坚实基础。"
    },
    updatedAt: "2025-02-20T10:15:00Z"
  },

  // 学习发展数据
  learningDevelopment: {
    currentCourses: [
      {
        id: "course_001",
        name: "高级数据分析与挖掘",
        platform: "Coursera",
        progress: 80,
        startDate: "2025-01-10",
        endDate: "2025-04-10"
      }
    ],
    completedCourses: [
      {
        id: "course_002",
        name: "Python数据分析实战",
        platform: "网易云课堂",
        completionDate: "2024-11-20",
        certificate: true
      },
      {
        id: "course_003",
        name: "金融数据分析入门",
        platform: "学堂在线",
        completionDate: "2024-10-15",
        certificate: true
      }
    ],
    skillGoals: [
      {
        skill: "深度学习应用",
        targetLevel: "proficient",
        currentLevel: "basic",
        deadline: "2025-12-31"
      },
      {
        skill: "Tableau可视化",
        targetLevel: "proficient",
        currentLevel: "basic",
        deadline: "2025-06-30"
      }
    ]
  },

  // 活跃度统计
  activityStats: {
    assessmentsCompleted: 5,
    plansCreated: 3,
    daysActive: 98,
    badgesEarned: 8,
    coursesCompleted: 10,
    projectsContributed: 2,
    lastActivity: "2025-02-20T10:15:00Z"
  },

  // 成就徽章
  achievements: [
    {
      id: 1,
      title: "数据达人",
      description: "完成5次数据相关职业测评",
      icon: "DatabaseOutlined",
      date: "2025-02-18",
      type: "assessment"
    },
    {
      id: 2,
      title: "学习新星",
      description: "完成10门数据分析课程",
      icon: "BookOutlined",
      date: "2025-02-10",
      type: "learning"
    },
    {
      id: 3,
      title: "项目能手",
      description: "参与2个实战数据分析项目",
      icon: "CodeOutlined",
      date: "2025-01-25",
      type: "projects"
    },
    {
      id: 4,
      title: "实习先锋",
      description: "完成金融科技公司数据分析实习",
      icon: "BriefcaseOutlined",
      date: "2024-09-30",
      type: "internship"
    }
  ],

  // 最近活动记录
  recentActivities: [
    {
      id: 1,
      type: "resume_update",
      description: "更新了实习经历和项目经验",
      timestamp: "2025-02-20T10:15:00Z"
    },
    {
      id: 2,
      type: "course_learn",
      description: "学习'高级数据分析与挖掘'课程至80%进度",
      timestamp: "2025-02-18T16:30:00Z"
    },
    {
      id: 3,
      type: "assessment_complete",
      description: "完成金融行业职业匹配测评",
      timestamp: "2025-02-15T09:45:00Z"
    },
    {
      id: 4,
      type: "plan_create",
      description: "创建了'2025年数据分析技能提升计划'",
      timestamp: "2025-02-10T14:20:00Z"
    }
  ]
};

// 数据存储/加载函数（与张伟数据的函数逻辑一致）
function saveZhangsanDataToStorage() {
  localStorage.setItem('user', JSON.stringify(zhangsanResumeData.auth));
  localStorage.setItem('token', 'mock_jwt_token_' + Date.now());
  localStorage.setItem('career_resume_data', JSON.stringify(zhangsanResumeData.resume));
  localStorage.setItem('complete_user_profile', JSON.stringify(zhangsanResumeData));
  console.log('张三数据已保存到localStorage');
}

function loadZhangsanDataFromStorage() {
  const user = localStorage.getItem('user');
  const resume = localStorage.getItem('career_resume_data');
  const completeProfile = localStorage.getItem('complete_user_profile');
  
  return {
    auth: user ? JSON.parse(user) : null,
    resume: resume ? JSON.parse(resume) : null,
    completeProfile: completeProfile ? JSON.parse(completeProfile) : null
  };
}