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
  SETTINGS: '/settings',
  
  // 核心功能
  DASHBOARD: '/dashboard',
  ASSESSMENT: '/assessment',
  ASSESSMENT_START: '/assessment/start',
  ASSESSMENT_HISTORY: '/assessment/history',
  ASSESSMENT_RESULT: '/assessment/result',
  
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