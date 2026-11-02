// 职业数据
export const occupations = [
  {
    id: 1,
    name: '前端开发工程师',
    category: '互联网',
    description: '负责网站和移动端界面开发',
    salary: { entry: '8-15k', junior: '15-25k', senior: '25-40k', expert: '40-60k' },
    requirements: ['HTML/CSS', 'JavaScript', 'React/Vue', 'TypeScript', 'Node.js'],
    growthPath: ['初级工程师', '中级工程师', '高级工程师', '技术专家', '架构师'],
    matchScore: 85
  },
  // 添加更多职业...
]

// 测评问题
export const assessmentQuestions = [
  {
    id: 1,
    type: 'interest',
    question: '你喜欢独自工作还是团队合作？',
    options: ['独自工作', '偏向独自', '都可以', '偏向团队', '团队合作']
  },
  // 更多问题...
]

// 规划模板
export const planTemplates = [
  {
    id: 1,
    name: '前端开发工程师成长计划',
    duration: '4年',
    yearlyGoals: {
      '大一': ['学习HTML/CSS基础', '掌握JavaScript', '了解计算机基础'],
      '大二': ['学习React框架', '参与项目实践', '学习算法'],
      // 更多...
    }
  }
]