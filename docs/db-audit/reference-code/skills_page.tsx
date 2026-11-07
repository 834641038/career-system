// 技能测评题库页面 - 每个专业10道必备技能题目
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { Card, Button, Typography, Select, Space, Radio, Progress, Result, Modal, Alert } from 'antd'
import { 
  ExperimentOutlined, 
  CheckCircleOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ROUTES } from '@/app/lib/routes'

const { Title, Paragraph } = Typography
const { Option } = Select

// 专业数据（2026-11-07 对齐库内 13 专业池；各专业挂接最接近的题库方向）
const majors = [
  { value: 'computer-science', label: '计算机科学与技术' },
  { value: 'software-engineering', label: '软件工程' },
  { value: 'information-computing', label: '信息与计算科学', base: 'computer-science' },
  { value: 'mathematics', label: '数学与应用数学', base: 'computer-science' },
  { value: 'physics', label: '物理学', base: 'computer-science' },
  { value: 'big-data', label: '大数据管理与应用', base: 'computer-science' },
  { value: 'statistics', label: '统计学', base: 'business-administration' },
  { value: 'accounting', label: '会计学', base: 'business-administration' },
  { value: 'education', label: '教育学', base: 'business-administration' },
  { value: 'archive', label: '档案学', base: 'business-administration' },
  { value: 'info-resource', label: '信息资源管理', base: 'business-administration' },
  { value: 'psychology', label: '心理学', base: 'marketing' },
  { value: 'applied-psychology', label: '应用心理学', base: 'marketing' },
]

// 各专业的技能题库 - 每个专业精确10道必备技能题目
const skillQuestionsByMajor = {
  'computer-science': [
    {
      id: 1,
      question: '编程语言掌握程度（如Java、Python、C++等）',
      skillName: 'Python',
      options: [
        { value: 1, label: '完全不会' },
        { value: 2, label: '了解基本语法' },
        { value: 3, label: '能独立完成简单项目' },
        { value: 4, label: '熟练掌握多种语言' },
        { value: 5, label: '专家级别' }
      ],
      category: 'technical'
    },
    {
      id: 2,
      question: '数据结构与算法理解程度',
      skillName: '算法',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能解决常见算法问题' },
        { value: 4, label: '熟练掌握复杂算法' },
        { value: 5, label: '能设计优化算法' }
      ],
      category: 'technical'
    },
    {
      id: 3,
      question: '数据库设计与管理能力',
      skillName: 'SQL',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能设计简单数据库' },
        { value: 4, label: '熟练进行数据库优化' },
        { value: 5, label: '精通数据库架构设计' }
      ],
      category: 'technical'
    },
    {
      id: 4,
      question: '操作系统原理理解程度',
      skillName: 'Linux',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '理解进程内存管理' },
        { value: 4, label: '熟悉系统调优' },
        { value: 5, label: '精通内核开发' }
      ],
      category: 'technical'
    },
    {
      id: 5,
      question: '计算机网络基础知识掌握程度',
      skillName: null,
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本协议' },
        { value: 3, label: '理解TCP/IP模型' },
        { value: 4, label: '熟悉网络安全' },
        { value: 5, label: '精通网络架构设计' }
      ],
      category: 'technical'
    },
    {
      id: 6,
      question: '问题解决和逻辑思维能力',
      skillName: null,
      options: [
        { value: 1, label: '较弱' },
        { value: 2, label: '一般' },
        { value: 3, label: '较好' },
        { value: 4, label: '很强' },
        { value: 5, label: '非常强' }
      ],
      category: 'thinking'
    },
    {
      id: 7,
      question: '学习新技术的能力和速度',
      skillName: null,
      options: [
        { value: 1, label: '学习缓慢' },
        { value: 2, label: '需要较多时间' },
        { value: 3, label: '学习速度适中' },
        { value: 4, label: '学习速度快' },
        { value: 5, label: '能快速掌握新技术' }
      ],
      category: 'learning'
    },
    {
      id: 8,
      question: '团队协作和沟通表达能力',
      skillName: null,
      options: [
        { value: 1, label: '需要改进' },
        { value: 2, label: '一般' },
        { value: 3, label: '良好' },
        { value: 4, label: '很好' },
        { value: 5, label: '优秀' }
      ],
      category: 'soft'
    },
    {
      id: 9,
      question: '英文技术文档阅读能力',
      skillName: '文献检索',
      options: [
        { value: 1, label: '完全不懂' },
        { value: 2, label: '能看懂简单词汇' },
        { value: 3, label: '能理解技术文档' },
        { value: 4, label: '熟练阅读技术资料' },
        { value: 5, label: '能撰写英文技术文档' }
      ],
      category: 'soft'
    },
    {
      id: 10,
      question: '调试和解决技术问题的能力',
      skillName: null,
      options: [
        { value: 1, label: '完全不会' },
        { value: 2, label: '需要他人帮助' },
        { value: 3, label: '能解决常见问题' },
        { value: 4, label: '熟练调试复杂问题' },
        { value: 5, label: '能定位系统级问题' }
      ],
      category: 'technical'
    }
  ],
  'software-engineering': [
    {
      id: 1,
      question: '软件开发生命周期理解程度',
      skillName: null,
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本阶段' },
        { value: 3, label: '能应用到实际项目' },
        { value: 4, label: '熟练管理整个生命周期' },
        { value: 5, label: '精通敏捷开发方法' }
      ],
      category: 'technical'
    },
    {
      id: 2,
      question: '面向对象编程和设计模式掌握程度',
      skillName: 'Java',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能应用常见设计模式' },
        { value: 4, label: '熟练架构设计' },
        { value: 5, label: '精通系统架构' }
      ],
      category: 'technical'
    },
    {
      id: 3,
      question: '软件测试和质量保证能力',
      skillName: null,
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能编写测试用例' },
        { value: 4, label: '熟练自动化测试' },
        { value: 5, label: '精通测试策略设计' }
      ],
      category: 'technical'
    },
    {
      id: 4,
      question: '版本控制系统使用熟练度（Git等）',
      skillName: 'Git',
      options: [
        { value: 1, label: '不会使用' },
        { value: 2, label: '了解基本操作' },
        { value: 3, label: '能进行分支管理' },
        { value: 4, label: '熟练团队协作' },
        { value: 5, label: '精通工作流管理' }
      ],
      category: 'technical'
    },
    {
      id: 5,
      question: '需求分析和系统设计能力',
      skillName: '需求分析',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本流程' },
        { value: 3, label: '能绘制简单设计图' },
        { value: 4, label: '熟练系统架构设计' },
        { value: 5, label: '精通企业级架构' }
      ],
      category: 'technical'
    },
    {
      id: 6,
      question: '项目管理和时间规划能力',
      skillName: '项目管理',
      options: [
        { value: 1, label: '缺乏经验' },
        { value: 2, label: '基本了解' },
        { value: 3, label: '能有效管理小项目' },
        { value: 4, label: '熟练管理复杂项目' },
        { value: 5, label: '精通项目管理' }
      ],
      category: 'management'
    },
    {
      id: 7,
      question: '代码审查和技术文档编写能力',
      skillName: null,
      options: [
        { value: 1, label: '较差' },
        { value: 2, label: '一般' },
        { value: 3, label: '良好' },
        { value: 4, label: '很好' },
        { value: 5, label: '优秀' }
      ],
      category: 'soft'
    },
    {
      id: 8,
      question: '持续集成和部署实践经验',
      skillName: 'Docker',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能配置CI/CD流水线' },
        { value: 4, label: '熟练运维自动化' },
        { value: 5, label: '精通基础设施即代码' }
      ],
      category: 'technical'
    },
    {
      id: 9,
      question: '跨部门沟通协调能力',
      skillName: null,
      options: [
        { value: 1, label: '较差' },
        { value: 2, label: '一般' },
        { value: 3, label: '良好' },
        { value: 4, label: '很好' },
        { value: 5, label: '优秀' }
      ],
      category: 'soft'
    },
    {
      id: 10,
      question: '新技术学习和适应能力',
      skillName: null,
      options: [
        { value: 1, label: '学习缓慢' },
        { value: 2, label: '需要较多时间' },
        { value: 3, label: '学习速度适中' },
        { value: 4, label: '学习速度快' },
        { value: 5, label: '能快速掌握新技术' }
      ],
      category: 'learning'
    }
  ],
  'business-administration': [
    {
      id: 1,
      question: '企业管理理论和实践知识掌握程度',
      skillName: null,
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '理解管理原理' },
        { value: 4, label: '熟悉企业管理实务' },
        { value: 5, label: '精通战略管理' }
      ],
      category: 'management'
    },
    {
      id: 2,
      question: '财务管理和会计基础知识',
      skillName: '财务分析',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能进行基础财务分析' },
        { value: 4, label: '熟练财务规划' },
        { value: 5, label: '精通财务管理' }
      ],
      category: 'technical'
    },
    {
      id: 3,
      question: '市场营销和品牌管理能力',
      skillName: '新媒体运营',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能制定营销策略' },
        { value: 4, label: '熟练市场推广' },
        { value: 5, label: '精通品牌建设' }
      ],
      category: 'management'
    },
    {
      id: 4,
      question: '人力资源管理和团队建设能力',
      skillName: null,
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能进行人员管理' },
        { value: 4, label: '熟练团队建设' },
        { value: 5, label: '精通组织发展' }
      ],
      category: 'management'
    },
    {
      id: 5,
      question: '商业数据分析和决策能力',
      skillName: '数据分析',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能进行基础分析' },
        { value: 4, label: '熟练数据驱动决策' },
        { value: 5, label: '精通商业智能' }
      ],
      category: 'technical'
    },
    {
      id: 6,
      question: '沟通协调和谈判技巧',
      skillName: null,
      options: [
        { value: 1, label: '较差' },
        { value: 2, label: '一般' },
        { value: 3, label: '良好' },
        { value: 4, label: '很好' },
        { value: 5, label: '优秀' }
      ],
      category: 'soft'
    },
    {
      id: 7,
      question: '领导力和团队激励能力',
      skillName: null,
      options: [
        { value: 1, label: '较弱' },
        { value: 2, label: '一般' },
        { value: 3, label: '较好' },
        { value: 4, label: '很强' },
        { value: 5, label: '非常强' }
      ],
      category: 'soft'
    },
    {
      id: 8,
      question: '创新思维和变革管理能力',
      skillName: null,
      options: [
        { value: 1, label: '较少创新' },
        { value: 2, label: '偶尔有新想法' },
        { value: 3, label: '经常提出创新方案' },
        { value: 4, label: '创新能力较强' },
        { value: 5, label: '具有突破性创新思维' }
      ],
      category: 'thinking'
    },
    {
      id: 9,
      question: '风险识别和管控能力',
      skillName: null,
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能识别常见风险' },
        { value: 4, label: '熟练风险管理' },
        { value: 5, label: '精通风险控制' }
      ],
      category: 'management'
    },
    {
      id: 10,
      question: '行业趋势洞察和发展规划能力',
      skillName: '竞争情报',
      options: [
        { value: 1, label: '不太关注' },
        { value: 2, label: '偶尔关注' },
        { value: 3, label: '定期关注' },
        { value: 4, label: '密切关注' },
        { value: 5, label: '引领行业发展' }
      ],
      category: 'industry'
    }
  ],
  'marketing': [
    {
      id: 1,
      question: '市场营销理论和策略制定能力',
      skillName: null,
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能制定营销策略' },
        { value: 4, label: '熟练市场推广' },
        { value: 5, label: '精通品牌建设' }
      ],
      category: 'technical'
    },
    {
      id: 2,
      question: '消费者行为分析和市场调研能力',
      skillName: '用户研究',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能进行基础调研' },
        { value: 4, label: '熟练数据分析' },
        { value: 5, label: '精通消费者洞察' }
      ],
      category: 'technical'
    },
    {
      id: 3,
      question: '数字营销和社交媒体运营能力',
      skillName: '新媒体运营',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能运营基础账号' },
        { value: 4, label: '熟练数字营销' },
        { value: 5, label: '精通全渠道营销' }
      ],
      category: 'technical'
    },
    {
      id: 4,
      question: '品牌建设和传播策划能力',
      skillName: null,
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能进行基础策划' },
        { value: 4, label: '熟练品牌管理' },
        { value: 5, label: '精通品牌战略' }
      ],
      category: 'creative'
    },
    {
      id: 5,
      question: '广告创意和内容制作能力',
      skillName: '文案',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能制作基础内容' },
        { value: 4, label: '熟练创意制作' },
        { value: 5, label: '精通内容营销' }
      ],
      category: 'creative'
    },
    {
      id: 6,
      question: '客户关系管理和维护能力',
      skillName: null,
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能维护基础关系' },
        { value: 4, label: '熟练客户管理' },
        { value: 5, label: '精通客户价值挖掘' }
      ],
      category: 'soft'
    },
    {
      id: 7,
      question: '数据分析和营销效果评估能力',
      skillName: '数据分析',
      options: [
        { value: 1, label: '不了解' },
        { value: 2, label: '了解基本概念' },
        { value: 3, label: '能进行基础分析' },
        { value: 4, label: '熟练数据驱动决策' },
        { value: 5, label: '精通营销ROI分析' }
      ],
      category: 'technical'
    },
    {
      id: 8,
      question: '沟通表达和团队协作能力',
      skillName: null,
      options: [
        { value: 1, label: '较差' },
        { value: 2, label: '一般' },
        { value: 3, label: '良好' },
        { value: 4, label: '很好' },
        { value: 5, label: '优秀' }
      ],
      category: 'soft'
    },
    {
      id: 9,
      question: '创新思维和市场敏感度',
      skillName: null,
      options: [
        { value: 1, label: '较弱' },
        { value: 2, label: '一般' },
        { value: 3, label: '较好' },
        { value: 4, label: '很强' },
        { value: 5, label: '非常强' }
      ],
      category: 'thinking'
    },
    {
      id: 10,
      question: '项目管理和执行力',
      skillName: '项目管理',
      options: [
        { value: 1, label: '缺乏经验' },
        { value: 2, label: '基本了解' },
        { value: 3, label: '能有效管理小项目' },
        { value: 4, label: '熟练管理复杂项目' },
        { value: 5, label: '精通项目管理' }
      ],
      category: 'management'
    }
  ]
}

export default function SkillsAssessmentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'major-selection' | 'assessment' | 'result'>('major-selection')
  const [selectedMajor, setSelectedMajor] = useState<string>('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{[key: number]: number}>({})
  const [showResultModal, setShowResultModal] = useState(false)

  // 获取当前专业的题目
  const getCurrentQuestions = () => {
    const majorInfo = majors.find(m => m.value === selectedMajor)
    const bankKey = (majorInfo && (majorInfo as any).base) || selectedMajor
    const questions = skillQuestionsByMajor[bankKey as keyof typeof skillQuestionsByMajor] || []
    // 确保每个专业都有10道题目
    if (questions.length !== 10) {
      console.warn(`警告: 专业 ${selectedMajor} 的题目数量不是10道`)
    }
    return questions
  }

  const currentQuestions = getCurrentQuestions()
  const currentQuestion = currentQuestions[currentQuestionIndex]

  // 计算进度
  const progress = currentQuestions.length > 0 
    ? Math.round(((currentQuestionIndex) / currentQuestions.length) * 100) 
    : 0

  // 处理专业选择
  const handleMajorSelect = (value: string) => {
    setSelectedMajor(value)
  }

  // 处理答案选择
  const handleAnswerSelect = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }


  // 2026-11-07 新增：技能自评落库（skillName 命中 skills 表的才提交，静默）
  const saveSkillsToBackend = () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const items = currentQuestions
        .filter(q => (q as any).skillName)
        .map(q => ({ name: (q as any).skillName, level: answers[q.id] }))
        .filter(i => i.level != null)
      if (!items.length) return
      fetch('http://localhost:5000/api/assessment/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ items })
      }).then(resp => resp.json()).then(d => {
        if (d.success) {
          Modal.success({ title: '技能自评已保存', content: d.message || ('已保存 ' + d.saved + ' 项') })
        }
      }).catch(e => console.warn('保存技能自评失败', e))
    } catch (e) {
      console.warn('保存技能自评失败', e)
    }
  }

  // 下一题
  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // 完成测评（必须答完10道题）
      if (Object.keys(answers).length === 10) {
        saveSkillsToBackend()
        setShowResultModal(true)
      } else {
        // 弹窗提醒用户必须答完所有题目
        Modal.warning({
          title: '请完成所有题目',
          content: '您需要回答完全部10道题目才能提交测评',
          okText: '继续答题'
        })
      }
    }
  }

  // 上一题
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  // 开始测评
  const handleStartAssessment = () => {
    if (selectedMajor) {
      setCurrentStep('assessment')
      setCurrentQuestionIndex(0)
      setAnswers({})
    }
  }

  // 完成测评并查看结果
  const handleFinish = () => {
    setCurrentStep('result')
    setShowResultModal(false)
  }

  // 重新测评
  const handleRetest = () => {
    setCurrentStep('major-selection')
    setSelectedMajor('')
    setCurrentQuestionIndex(0)
    setAnswers({})
  }

  // 计算技能得分
  const calculateScores = () => {
    const scores: {[key: string]: number} = {}
    const categoryCount: {[key: string]: number} = {}
    
    Object.keys(answers).forEach(questionId => {
      const question = currentQuestions.find(q => q.id === parseInt(questionId))
      if (question && answers[parseInt(questionId)]) {
        const category = question.category
        if (!scores[category]) {
          scores[category] = 0
          categoryCount[category] = 0
        }
        scores[category] += answers[parseInt(questionId)]
        categoryCount[category] += 1
      }
    })
    
    // 计算平均分并转换为百分制
    Object.keys(scores).forEach(category => {
      scores[category] = Math.round((scores[category] / categoryCount[category]) * 20) // 5分制转100分制
    })
    
    return scores
  }

  const scores = calculateScores()

  // 渲染专业选择步骤
  if (currentStep === 'major-selection') {
    return (
      <div className="skills-assessment-page">
        <PageHeader
          title="技能能力评估"
          subTitle="通过专业针对性测评了解您的技能水平"
          onBack={() => router.push(ROUTES.ASSESSMENT)}
        />
        
        <div className="page-content" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <ExperimentOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 24 }} />
              <Title level={3}>请选择您的专业</Title>
              <Paragraph type="secondary" style={{ marginBottom: 32 }}>
                我们将根据您的专业提供10道必备技能评估题目
              </Paragraph>
              
              <Alert 
                message="测评说明" 
                description="您需要回答完全部10道题目才能完成测评，请认真作答每一道题。" 
                type="info" 
                showIcon 
                style={{ marginBottom: 24 }}
              />
              
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <Select
                  showSearch
                  placeholder="请选择您的专业"
                  optionFilterProp="children"
                  onChange={handleMajorSelect}
                  value={selectedMajor}
                  style={{ width: '100%', marginBottom: 24 }}
                  size="large"
                >
                  {majors.map(major => (
                    <Option key={major.value} value={major.value}>
                      {major.label}
                    </Option>
                  ))}
                </Select>
                
                <Button
                  type="primary"
                  size="large"
                  block
                  disabled={!selectedMajor}
                  onClick={handleStartAssessment}
                  icon={<ExperimentOutlined />}
                >
                  开始技能测评（10题必答）
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // 渲染测评步骤
  if (currentStep === 'assessment') {
    return (
      <div className="skills-assessment-page">
        <PageHeader
          title="技能能力评估"
          subTitle={`第 ${currentQuestionIndex + 1} 题 / 共 10 题（必须全部答完）`}
          onBack={() => setCurrentStep('major-selection')}
        />
        
        <div className="page-content" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          {/* 进度条和提醒 */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ marginRight: 16 }}>进度:</span>
              <Progress percent={progress} style={{ flex: 1 }} />
              <span style={{ marginLeft: 16, color: '#1890ff' }}>
                {currentQuestionIndex + 1}/10
              </span>
            </div>
            <Alert 
              message="重要提醒" 
              description="请务必回答完全部10道题目才能提交测评，未答完的题目无法提交。" 
              type="warning" 
              showIcon 
              style={{ marginTop: 16 }}
            />
          </Card>

          {/* 题目内容 */}
          <Card>
            <Title level={4} style={{ marginBottom: 24 }}>
              {currentQuestion?.question}
            </Title>
            
            <Radio.Group
              onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
              value={answers[currentQuestion?.id] || 0}
              style={{ width: '100%' }}
            >
              <Space orientation="vertical" style={{ width: '100%' }}>
                {currentQuestion?.options.map(option => (
                  <Radio 
                    key={option.value} 
                    value={option.value}
                    style={{ 
                      padding: '12px 16px', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: 6,
                      width: '100%',
                      marginBottom: 8
                    }}
                  >
                    {option.label}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>

            {/* 导航按钮 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: 32,
              paddingTop: 24,
              borderTop: '1px solid #f0f0f0'
            }}>
              <Button 
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                icon={<ArrowLeftOutlined />}
              >
                上一题
              </Button>
              
              <Button 
                type="primary"
                onClick={handleNext}
                disabled={!answers[currentQuestion?.id]}
                icon={currentQuestionIndex === 9 ? <CheckCircleOutlined /> : undefined}
              >
                {currentQuestionIndex === 9 ? '完成测评' : '下一题'}
              </Button>
            </div>
          </Card>
        </div>

        {/* 结果模态框 */}
        <Modal
          title="测评完成确认"
          open={showResultModal}
          onOk={handleFinish}
          onCancel={() => setShowResultModal(false)}
          okText="查看详细结果"
          cancelText="再检查一下"
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <TrophyOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>恭喜完成技能测评！</Title>
            <Paragraph type="secondary">
              您已经完成了所有10道专业技能题目，现在可以查看详细的分析结果。
            </Paragraph>
          </div>
        </Modal>
      </div>
    )
  }

  // 渲染结果步骤
  if (currentStep === 'result') {
    return (
      <div className="skills-assessment-page">
        <PageHeader
          title="技能评估结果"
          subTitle="您的技能水平分析报告"
          extra={[
            <Button key="retest" onClick={handleRetest}>
              重新测评
            </Button>,
            <Button 
              key="dashboard" 
              type="primary"
              onClick={() => router.push(ROUTES.DASHBOARD)}
            >
              返回仪表盘
            </Button>
          ]}
        />
        
        <div className="page-content" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          <Result
            status="success"
            title="技能测评完成"
            subTitle="基于您的回答，我们为您生成了详细的技能分析报告"
            extra={[
              <Button 
                type="primary" 
                key="create-plan"
                onClick={() => router.push(ROUTES.PLAN_CREATE)}
              >
                创建技能提升计划
              </Button>,
              <Button 
                key="view-resources"
                onClick={() => router.push(ROUTES.RESOURCES)}
              >
                查看学习资源
              </Button>
            ]}
          />

          {/* 技能得分卡片 */}
          <div style={{ marginTop: 24 }}>
            <Title level={4} style={{ marginBottom: 24 }}>各项技能得分</Title>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              {Object.entries(scores).map(([category, score]) => (
                <Card key={category} size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 8 }}>
                      {category === 'technical' && '专业技术'}
                      {category === 'soft' && '软技能'}
                      {category === 'thinking' && '思维能力'}
                      {category === 'learning' && '学习能力'}
                      {category === 'management' && '管理能力'}
                      {category === 'creative' && '创意思维'}
                      {category === 'industry' && '行业认知'}
                    </div>
                    <Progress 
                      type="circle" 
                      percent={score} 
                      width={80}
                      strokeColor={
                        score >= 80 ? '#52c41a' : 
                        score >= 60 ? '#1890ff' : 
                        score >= 40 ? '#faad14' : '#ff4d4f'
                      }
                    />
                    <div style={{ marginTop: 8, fontSize: '14px', color: '#666' }}>
                      {score >= 80 ? '优秀' : 
                       score >= 60 ? '良好' : 
                       score >= 40 ? '一般' : '需要提升'}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 建议区域 */}
          <Card title="个性化建议" style={{ marginTop: 24 }}>
            <Space orientation="vertical" style={{ width: '100%' }}>
              <Paragraph>
                <strong>优势领域：</strong>
                {Object.entries(scores)
                  .filter(([_, score]) => score >= 70)
                  .map(([category]) => (
                    <span key={category}>
                      {category === 'technical' && '专业技术 '}
                      {category === 'soft' && '软技能 '}
                      {category === 'thinking' && '思维能力 '}
                      {category === 'learning' && '学习能力 '}
                      {category === 'management' && '管理能力 '}
                      {category === 'creative' && '创意思维 '}
                      {category === 'industry' && '行业认知 '}
                    </span>
                  ))}
              </Paragraph>
              
              <Paragraph>
                <strong>待提升领域：</strong>
                {Object.entries(scores)
                  .filter(([_, score]) => score < 60)
                  .map(([category]) => (
                    <span key={category}>
                      {category === 'technical' && '专业技术 '}
                      {category === 'soft' && '软技能 '}
                      {category === 'thinking' && '思维能力 '}
                      {category === 'learning' && '学习能力 '}
                      {category === 'management' && '管理能力 '}
                      {category === 'creative' && '创意思维 '}
                      {category === 'industry' && '行业认知 '}
                    </span>
                  ))}
              </Paragraph>
              
              <Paragraph type="secondary">
                建议您重点关注得分较低的技能领域，制定相应的学习计划来全面提升自己的能力。
              </Paragraph>
            </Space>
          </Card>
        </div>
      </div>
    )
  }

  return null
}