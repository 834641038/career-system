// 用户数据管理服务
import { CompleteUserData, USER_STORAGE_KEYS } from '../types/user';
import { ResumeData } from '../types/resume';

// 完整的用户个人信息数据集
const completeUserData: CompleteUserData = {
  // 认证信息
  auth: {
    id: "user_2024001",
    email: "zhangwei_csu@csu.edu.cn",
    name: "张伟",
    studentId: "2021001234",
    major: "计算机科学与技术",
    university: "中南大学",
    enrollmentYear: "2021",
    graduationYear: "2025"
  },

  // 基础个人信息
  personalInfo: {
    name: "张伟",
    englishName: "Zhang Wei",
    email: "zhangwei_csu@csu.edu.cn",
    phone: "13812345678",
    gender: "male",
    birthday: "2002-03-15",
    location: "湖南省长沙市",
    hometown: "湖南省长沙市",
    avatar: "/avatars/zhangwei.jpg",
    bio: "中南大学计算机科学与技术专业大四学生，热爱前端开发和人工智能技术，具备扎实的编程基础和良好的团队协作能力。",
    joinDate: "2024-09-01",
    lastLogin: "2025-01-19",
    accountStatus: "active"
  },

  // 学术背景
  academicBackground: {
    university: "中南大学",
    college: "计算机学院",
    major: "计算机科学与技术",
    degree: "bachelor",
    gpa: "3.7/4.0",
    ranking: "专业前15%",
    enrollmentYear: "2021",
    expectedGraduation: "2025-06",
    academicAchievements: [
      "国家奖学金获得者（2023年）",
      "校级优秀学生干部",
      "ACM程序设计竞赛银奖",
      "大学生创新创业训练计划项目负责人"
    ]
  },

  // 技能评估数据
  skillAssessment: {
    technicalSkills: {
      programmingLanguages: [
        { name: "JavaScript", level: "expert", proficiency: 90 },
        { name: "Python", level: "proficient", proficiency: 85 },
        { name: "Java", level: "proficient", proficiency: 80 },
        { name: "TypeScript", level: "proficient", proficiency: 85 },
        { name: "C++", level: "basic", proficiency: 70 }
      ],
      frontend: [
        { name: "React", level: "expert", proficiency: 90 },
        { name: "Vue.js", level: "proficient", proficiency: 80 },
        { name: "HTML/CSS", level: "expert", proficiency: 95 },
        { name: "Next.js", level: "proficient", proficiency: 85 },
        { name: "Tailwind CSS", level: "proficient", proficiency: 85 }
      ],
      backend: [
        { name: "Node.js", level: "proficient", proficiency: 80 },
        { name: "Express", level: "proficient", proficiency: 75 },
        { name: "MySQL", level: "proficient", proficiency: 75 },
        { name: "MongoDB", level: "basic", proficiency: 70 }
      ],
      tools: [
        { name: "Git", level: "proficient", proficiency: 85 },
        { name: "Docker", level: "basic", proficiency: 65 },
        { name: "Webpack", level: "proficient", proficiency: 80 },
        { name: "Figma", level: "basic", proficiency: 70 }
      ]
    },
    softSkills: {
      communication: 85,
      teamwork: 90,
      problemSolving: 88,
      leadership: 75,
      adaptability: 82,
      timeManagement: 80
    }
  },

  // 职业测评结果
  careerAssessment: {
    hollandCode: {
      primary: "IRE", // Investigative-Realistic-Enterprising
      scores: {
        realistic: 75,
        investigative: 85,
        artistic: 60,
        social: 70,
        enterprising: 80,
        conventional: 65
      },
      recommendedCareers: [
        "软件工程师",
        "数据分析师",
        "产品经理",
        "系统架构师",
        "技术顾问"
      ]
    },
    valuesAssessment: {
      topValues: [
        { name: "成就感", score: 90, rank: 1 },
        { name: "创新性", score: 85, rank: 2 },
        { name: "稳定性", score: 80, rank: 3 },
        { name: "自主性", score: 78, rank: 4 },
        { name: "社会贡献", score: 75, rank: 5 }
      ]
    },
    interestAreas: [
      "Web开发",
      "人工智能",
      "数据分析",
      "产品设计",
      "技术管理"
    ]
  },

  // 简历数据（引用已存在的ResumeData类型）
  resume: {
    basicInfo: {
      name: "张伟",
      email: "zhangwei_csu@csu.edu.cn",
      phone: "13812345678",
      gender: "male",
      birthday: "2002-03-15",
      location: "湖南省长沙市",
      avatar: "/avatars/zhangwei.jpg"
    },
    jobIntention: {
      position: "前端开发工程师",
      industry: "互联网/IT",
      salaryExpectation: "12K-18K",
      workLocation: "深圳/杭州/长沙",
      employmentType: "full-time"
    },
    educationExperiences: [
      {
        id: "edu_001",
        school: "中南大学",
        major: "计算机科学与技术",
        degree: "bachelor",
        startDate: "2021-09",
        endDate: "2025-06",
        gpa: "3.7/4.0",
        description: "主修课程：数据结构与算法、操作系统、计算机网络、数据库原理、软件工程等。参与多个校企合作项目，获得国家奖学金。"
      }
    ],
    workExperiences: [
      {
        id: "work_001",
        company: "腾讯科技(深圳)有限公司",
        position: "前端开发实习生",
        startDate: "2024-07",
        endDate: "2024-09",
        isCurrent: false,
        description: "参与微信小程序开发项目，负责用户界面设计和交互功能实现。使用React和TypeScript进行组件开发，优化页面性能提升30%。",
        achievements: [
          "独立完成3个核心功能模块开发",
          "优化首屏加载速度30%",
          "获得部门优秀实习生称号"
        ]
      },
      {
        id: "work_002",
        company: "阿里巴巴集团",
        position: "前端开发实习生",
        startDate: "2024-03",
        endDate: "2024-06",
        isCurrent: false,
        description: "参与淘宝商家后台系统重构项目，使用Vue3和Element Plus进行组件开发。负责商品管理模块的前端实现和性能优化。",
        achievements: [
          "重构商品列表页面，提升用户体验",
          "实现复杂表单验证逻辑",
          "协助团队完成项目按时上线"
        ]
      }
    ],
    projectExperiences: [
      {
        id: "proj_001",
        projectName: "大学生生涯规划系统",
        role: "前端负责人",
        startDate: "2024-01",
        endDate: "2024-05",
        isCurrent: false,
        description: "基于Next.js和Ant Design开发的生涯规划平台，包含职业测评、简历管理、学习路径规划等功能模块。采用微前端架构，支持多团队协作开发。",
        technologies: ["Next.js", "React", "TypeScript", "Ant Design", "Tailwind CSS"],
        link: "https://github.com/zhangwei/career-planning-system"
      },
      {
        id: "proj_002",
        projectName: "智能代码评审助手",
        role: "全栈开发者",
        startDate: "2023-09",
        endDate: "2023-12",
        isCurrent: false,
        description: "基于AI的代码质量检测工具，使用机器学习算法分析代码规范性和潜在bug。后端采用Python Flask，前端使用React构建可视化界面。",
        technologies: ["Python", "Flask", "React", "TensorFlow", "Docker"],
        link: "https://github.com/zhangwei/code-review-ai"
      }
    ],
    skills: [
      { id: "skill_001", name: "JavaScript", level: "expert" },
      { id: "skill_002", name: "React", level: "expert" },
      { id: "skill_003", name: "TypeScript", level: "proficient" },
      { id: "skill_004", name: "Node.js", level: "proficient" },
      { id: "skill_005", name: "Python", level: "proficient" },
      { id: "skill_006", name: "Git", level: "proficient" },
      { id: "skill_007", name: "MySQL", level: "proficient" }
    ],
    certificates: [
      { id: "cert_001", name: "阿里云ACA认证", level: "proficient", score: "85分" },
      { id: "cert_002", name: "计算机二级证书", level: "proficient", score: "优秀" }
    ],
    selfEvaluation: {
      content: "作为一名计算机专业的学生，我具备扎实的编程基础和丰富的项目实践经验。在腾讯和阿里的实习经历让我深入了解了大型互联网公司的开发流程和技术栈。我热爱技术创新，善于解决复杂问题，具有良好的沟通能力和团队协作精神。希望能在贵公司发挥自己的技术专长，为企业创造价值的同时实现个人成长。"
    },
    updatedAt: "2025-01-19T14:30:00Z"
  },

  // 学习发展数据
  learningDevelopment: {
    currentCourses: [
      {
        id: "course_001",
        name: "高级算法设计与分析",
        platform: "Coursera",
        progress: 75,
        startDate: "2025-01-01",
        endDate: "2025-03-01"
      }
    ],
    completedCourses: [
      {
        id: "course_002",
        name: "React高级开发",
        platform: "极客时间",
        completionDate: "2024-12-15",
        certificate: true
      },
      {
        id: "course_003",
        name: "系统设计面试指南",
        platform: "LeetCode",
        completionDate: "2024-11-30",
        certificate: true
      }
    ],
    skillGoals: [
      {
        skill: "系统架构设计",
        targetLevel: "expert",
        currentLevel: "proficient",
        deadline: "2025-12-31"
      }
    ]
  },

  // 活跃度统计
  activityStats: {
    assessmentsCompleted: 8,
    plansCreated: 5,
    daysActive: 156,
    badgesEarned: 12,
    coursesCompleted: 15,
    projectsContributed: 8,
    lastActivity: "2025-01-19T14:30:00Z"
  },

  // 成就徽章
  achievements: [
    {
      id: 1,
      title: "测评达人",
      description: "完成8次职业测评",
      icon: "TrophyOutlined",
      date: "2025-01-15",
      type: "assessment"
    },
    {
      id: 2,
      title: "规划先锋",
      description: "创建5个生涯规划",
      icon: "CalendarOutlined",
      date: "2025-01-10",
      type: "planning"
    },
    {
      id: 3,
      title: "学习标兵",
      description: "连续学习60天",
      icon: "BookOutlined",
      date: "2025-01-05",
      type: "learning"
    },
    {
      id: 4,
      title: "项目专家",
      description: "参与8个项目开发",
      icon: "CodeOutlined",
      date: "2024-12-20",
      type: "projects"
    }
  ],

  // 最近活动记录
  recentActivities: [
    {
      id: 1,
      type: "resume_update",
      description: "更新了个人简历信息",
      timestamp: "2025-01-19T14:30:00Z"
    },
    {
      id: 2,
      type: "course_complete",
      description: "完成了'React高级开发'课程学习",
      timestamp: "2025-01-18T20:15:00Z"
    },
    {
      id: 3,
      type: "assessment_complete",
      description: "完成了职业技能测评",
      timestamp: "2025-01-17T16:45:00Z"
    },
    {
      id: 4,
      type: "plan_create",
      description: "创建了'2025年春季求职计划'",
      timestamp: "2025-01-16T10:30:00Z"
    }
  ]
};

class UserService {
  // 保存用户数据到localStorage
  static saveUserData(): void {
    try {
      // 保存认证信息
      localStorage.setItem(USER_STORAGE_KEYS.AUTH, JSON.stringify(completeUserData.auth));
      localStorage.setItem(USER_STORAGE_KEYS.TOKEN, 'mock_jwt_token_' + Date.now());
      
      // 保存简历数据
      localStorage.setItem(USER_STORAGE_KEYS.RESUME, JSON.stringify(completeUserData.resume));
      
      // 保存完整用户数据（可选）
      localStorage.setItem(USER_STORAGE_KEYS.COMPLETE_PROFILE, JSON.stringify(completeUserData));
      
      console.log('用户数据已保存到localStorage');
    } catch (error) {
      console.error('保存用户数据失败:', error);
    }
  }

  // 从localStorage加载用户数据
  static loadUserData(): {
    auth: any;
    resume: ResumeData | null;
    completeProfile: CompleteUserData | null;
  } {
    try {
      const auth = localStorage.getItem(USER_STORAGE_KEYS.AUTH);
      const resume = localStorage.getItem(USER_STORAGE_KEYS.RESUME);
      const completeProfile = localStorage.getItem(USER_STORAGE_KEYS.COMPLETE_PROFILE);
      
      return {
        auth: auth ? JSON.parse(auth) : null,
        resume: resume ? JSON.parse(resume) : null,
        completeProfile: completeProfile ? JSON.parse(completeProfile) : null
      };
    } catch (error) {
      console.error('加载用户数据失败:', error);
      return {
        auth: null,
        resume: null,
        completeProfile: null
      };
    }
  }

  // 获取当前用户信息
  static getCurrentUser(): any {
    try {
      const user = localStorage.getItem(USER_STORAGE_KEYS.AUTH);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  }

  // 获取完整用户档案
  static getUserProfile(): CompleteUserData | null {
    try {
      const profile = localStorage.getItem(USER_STORAGE_KEYS.COMPLETE_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('获取用户档案失败:', error);
      return null;
    }
  }

  // 更新特定字段的数据
  static updateUserData(field: keyof CompleteUserData, data: any): void {
    try {
      const profile = this.getUserProfile();
      if (profile) {
        profile[field] = data;
        localStorage.setItem(USER_STORAGE_KEYS.COMPLETE_PROFILE, JSON.stringify(profile));
        
        // 如果更新的是认证或简历信息，也要同步更新对应的单独存储
        if (field === 'auth') {
          localStorage.setItem(USER_STORAGE_KEYS.AUTH, JSON.stringify(data));
        } else if (field === 'resume') {
          localStorage.setItem(USER_STORAGE_KEYS.RESUME, JSON.stringify(data));
        }
        
        console.log(`用户数据字段 ${field} 已更新`);
      }
    } catch (error) {
      console.error('更新用户数据失败:', error);
    }
  }

  // 清除所有用户数据
  static clearUserData(): void {
    Object.values(USER_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('用户数据已清除');
  }

  // 初始化模拟数据（用于开发测试）
  static initializeMockData(): void {
    this.saveUserData();
    console.log('模拟用户数据初始化完成');
  }

  // 检查用户是否已登录
  static isAuthenticated(): boolean {
    const token = localStorage.getItem(USER_STORAGE_KEYS.TOKEN);
    const user = this.getCurrentUser();
    return !!(token && user);
  }
}

export { UserService, completeUserData };