/**
 * 应用路由配置
 * 定义所有页面的路由路径和名称
 */
export const ROUTES = {
  // 首页
  HOME: '/',
  
  // 用户相关
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_RESUME_EDIT: '/profile/resume/edit',    // 新增：简历填写页面
  PROFILE_RESUME_PREVIEW: '/profile/resume/preview', // 新增：简历预览页面
  SETTINGS: '/setting',
  
  // 核心功能
  DASHBOARD: '/dashboard',
  ASSESSMENT: '/assessment',
  ASSESSMENT_START: '/assessment/start',
  ASSESSMENT_HISTORY: '/assessment/history',
  ASSESSMENT_RESULT: '/assessment/result',
  ASSESSMENT_HOLLAND: '/assessment/holland', // 霍兰德测评路由
  ASSESSMENT_SKILLS: '/assessment/skills', // 技能测评路由
  ASSESSMENT_VALUES: '/assessment/values', // 职业价值观测评路由
  
  CAREER: '/career',
  CAREER_EXPLORE: '/career/explore',
  CAREER_DETAIL: '/career/detail',
  CAREER_COMPARE: '/career/compare',
  
  PLAN: '/plan',
  PLAN_CREATE: '/plan/create',
  PLAN_VIEW: '/plan/view',
  PLAN_TASKS: '/plan/tasks',
  
  // 学习资源
  RESOURCES: '/resources',
  RESOURCES_COURSES: '/resources/courses',
  RESOURCES_BOOKS: '/resources/books',
  RESOURCES_TOOLS: '/resources/tools',
  
  // 其他页面
  ABOUT: '/about',
  HELP: '/help',
  CONTACT: '/contact',
  DEMO: '/demo',
  FEATURES: '/features',
  PRIVACY: '/privacy',
  SITEMAP: '/sitemap',
}

// 导出路由键类型
export type RouteKey = keyof typeof ROUTES

/**
 * 导航菜单配置
 */
export const NAV_MENU = [
  {
    key: 'home',
    label: '首页',
    path: ROUTES.HOME,
    icon: 'HomeOutlined',
  },
  {
    key: 'dashboard',
    label: '仪表盘',
    path: ROUTES.DASHBOARD,
    icon: 'DashboardOutlined',
  },
  {
    key: 'assessment',
    label: '智能测评',
    path: ROUTES.ASSESSMENT,
    icon: 'ExperimentOutlined',
    children: [
      {
        key: 'assessment-start',
        label: '开始测评',
        path: ROUTES.ASSESSMENT_START,
      },
      {
        key: 'assessment-holland',
        label: '霍兰德测评',
        path: ROUTES.ASSESSMENT_HOLLAND,
      },
      {
        key: 'assessment-skills',
        label: '技能测评',
        path: ROUTES.ASSESSMENT_SKILLS,
      },
      {
        key: 'assessment-values',
        label: '价值观测评',
        path: ROUTES.ASSESSMENT_VALUES,
      },
      {
        key: 'assessment-history',
        label: '测评记录',
        path: ROUTES.ASSESSMENT_HISTORY,
      },
    ],
  },
  {
    key: 'career',
    label: '职业探索',
    path: ROUTES.CAREER,
    icon: 'RocketOutlined',
    children: [
      {
        key: 'career-explore',
        label: '浏览职业',
        path: ROUTES.CAREER_EXPLORE,
      },
      {
        key: 'career-compare',
        label: '职业对比',
        path: ROUTES.CAREER_COMPARE,
      },
    ],
  },
  {
    key: 'plan',
    label: '生涯规划',
    path: ROUTES.PLAN,
    icon: 'CalendarOutlined',
    children: [
      {
        key: 'plan-create',
        label: '创建规划',
        path: ROUTES.PLAN_CREATE,
      },
      {
        key: 'plan-view',
        label: '查看规划',
        path: ROUTES.PLAN_VIEW,
      },
      {
        key: 'plan-tasks',
        label: '任务管理',
        path: ROUTES.PLAN_TASKS,
      },
    ],
  },
  {
    key: 'resources',
    label: '学习资源',
    path: ROUTES.RESOURCES,
    icon: 'BookOutlined',
  },
  {
    key: 'profile',
    label: '个人中心',
    path: ROUTES.PROFILE,
    icon: 'UserOutlined',
  },
]