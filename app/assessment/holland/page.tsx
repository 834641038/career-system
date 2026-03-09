'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Button, 
  Progress, 
  Radio, 
  Space, 
  Typography, 
  Steps,
  Result,
  Modal
} from 'antd'
import { 
  LeftOutlined, 
  RightOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { useRouter, useSearchParams } from 'next/navigation'
import { ROUTES } from '@/app/lib/routes'

const { Title, Text, Paragraph } = Typography
const { Group: RadioGroup } = Radio

const hollandQuestions = [
  {
    id: 1,
    question: "我喜欢修理自行车或电器",
    options: [
      { value: 1, label: "非常不符合", score: { realistic: 2 } },
      { value: 2, label: "比较不符合", score: { realistic: 1 } },
      { value: 3, label: "不确定", score: { realistic: 0 } },
      { value: 4, label: "比较符合", score: { realistic: 1 } },
      { value: 5, label: "非常符合", score: { realistic: 2 } }
    ]
  },
  {
    id: 2,
    question: "我喜欢研究科学问题和技术原理",
    options: [
      { value: 1, label: "非常不符合", score: { investigative: 2 } },
      { value: 2, label: "比较不符合", score: { investigative: 1 } },
      { value: 3, label: "不确定", score: { investigative: 0 } },
      { value: 4, label: "比较符合", score: { investigative: 1 } },
      { value: 5, label: "非常符合", score: { investigative: 2 } }
    ]
  },
  {
    id: 3,
    question: "我喜欢创作音乐、绘画或其他艺术作品",
    options: [
      { value: 1, label: "非常不符合", score: { artistic: 2 } },
      { value: 2, label: "比较不符合", score: { artistic: 1 } },
      { value: 3, label: "不确定", score: { artistic: 0 } },
      { value: 4, label: "比较符合", score: { artistic: 1 } },
      { value: 5, label: "非常符合", score: { artistic: 2 } }
    ]
  },
  {
    id: 4,
    question: "我喜欢帮助他人解决困难和问题",
    options: [
      { value: 1, label: "非常不符合", score: { social: 2 } },
      { value: 2, label: "比较不符合", score: { social: 1 } },
      { value: 3, label: "不确定", score: { social: 0 } },
      { value: 4, label: "比较符合", score: { social: 1 } },
      { value: 5, label: "非常符合", score: { social: 2 } }
    ]
  },
  {
    id: 5,
    question: "我喜欢说服别人接受我的观点",
    options: [
      { value: 1, label: "非常不符合", score: { enterprising: 2 } },
      { value: 2, label: "比较不符合", score: { enterprising: 1 } },
      { value: 3, label: "不确定", score: { enterprising: 0 } },
      { value: 4, label: "比较符合", score: { enterprising: 1 } },
      { value: 5, label: "非常符合", score: { enterprising: 2 } }
    ]
  },
  {
    id: 6,
    question: "我喜欢按照规则和程序办事",
    options: [
      { value: 1, label: "非常不符合", score: { conventional: 2 } },
      { value: 2, label: "比较不符合", score: { conventional: 1 } },
      { value: 3, label: "不确定", score: { conventional: 0 } },
      { value: 4, label: "比较符合", score: { conventional: 1 } },
      { value: 5, label: "非常符合", score: { conventional: 2 } }
    ]
  }
]

const generateMoreQuestions = () => {
  const additionalQuestions = [
    "我喜欢使用工具制作东西",
    "我对机械装置很感兴趣",
    "我喜欢户外工作",
    "我喜欢动手实验",
    "我喜欢分析数据和信息",
    "我对科学研究很感兴趣",
    "我喜欢解决复杂的数学问题",
    "我喜欢探索未知领域",
    "我喜欢设计美观的东西",
    "我对色彩搭配很敏感",
    "我喜欢自由创作",
    "我对美学有独特见解",
    "我喜欢与人交流沟通",
    "我善于倾听他人的想法",
    "我喜欢团队合作",
    "我关心社会问题",
    "我喜欢制定计划和策略",
    "我对商业运作很感兴趣",
    "我喜欢承担领导责任",
    "我善于影响他人",
    "我喜欢处理文件和数据",
    "我对细节很关注",
    "我喜欢按部就班地工作",
    "我做事很有条理性"
  ]

  const questionTypes = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional']
  
  return additionalQuestions.map((questionText, index) => ({
    id: index + 7,
    question: questionText,
    options: [
      { value: 1, label: "非常不符合", score: { [questionTypes[index % 6]]: 2 } },
      { value: 2, label: "比较不符合", score: { [questionTypes[index % 6]]: 1 } },
      { value: 3, label: "不确定", score: { [questionTypes[index % 6]]: 0 } },
      { value: 4, label: "比较符合", score: { [questionTypes[index % 6]]: 1 } },
      { value: 5, label: "非常符合", score: { [questionTypes[index % 6]]: 2 } }
    ]
  }))
}

const allQuestions = [...hollandQuestions, ...generateMoreQuestions()]

export default function HollandAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{[key: number]: number}>({})
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(20 * 60)
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [version, setVersion] = useState<'simple' | 'full'>('full')
  const [questions, setQuestions] = useState<typeof allQuestions>([])

  useEffect(() => {
    const versionParam = searchParams.get('version')
    const selectedVersion = versionParam === 'simple' ? 'simple' : 'full'
    setVersion(selectedVersion)
    
    if (selectedVersion === 'simple') {
      setQuestions(allQuestions.slice(0, 10))
      setTimeLeft(10 * 60)
    } else {
      setQuestions(allQuestions)
      setTimeLeft(20 * 60)
    }
    setCurrentQuestion(0)
    setAnswers({})
    setShowResult(false)
    setResultData(null)
    setIsTimeUp(false)
  }, [searchParams])

  useEffect(() => {
    if (timeLeft > 0 && !showResult && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult && questions.length > 0) {
      setIsTimeUp(true)
      handleSubmit()
    }
  }, [timeLeft, showResult, questions])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (value: number) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    })
  }

  const calculateResult = () => {
    const scores = {
      realistic: 0,
      investigative: 0,
      artistic: 0,
      social: 0,
      enterprising: 0,
      conventional: 0
    }

    Object.entries(answers).forEach(([questionIndex, answerValue]) => {
      const question = allQuestions[parseInt(questionIndex)]
      if (question) {
        const selectedOption = question.options.find(opt => opt.value === answerValue)
        if (selectedOption) {
          Object.entries(selectedOption.score).forEach(([type, score]) => {
            scores[type as keyof typeof scores] += score as number
          })
        }
      }
    })

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
    const percentages = Object.entries(scores).map(([type, score]) => ({
      type,
      score,
      percentage: totalScore > 0 ? Math.round((score / totalScore) * 100) : 0
    })).sort((a, b) => b.percentage - a.percentage)

    return {
      scores,
      percentages,
      dominantTypes: percentages.slice(0, 3)
    }
  }

  const handleSubmit = () => {
    if (!questions.length) return
    
    if (Object.keys(answers).length < questions.length) {
      Modal.confirm({
        title: '还有未完成的题目',
        content: `您还有${questions.length - Object.keys(answers).length}道题目未作答，确定要提交吗？`,
        onOk: () => {
          const result = calculateResult()
          setResultData(result)
          setShowResult(true)
        }
      })
    } else {
      const result = calculateResult()
      setResultData(result)
      setShowResult(true)
    }
  }

  const handleRetake = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResult(false)
    setResultData(null)
    setTimeLeft(version === 'simple' ? 10 * 60 : 20 * 60)
    setIsTimeUp(false)
  }

  const handleGoHome = () => {
    router.push(ROUTES.ASSESSMENT)
  }

  if (!questions.length) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>加载中...</p>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  if (showResult && resultData) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Card>
          <Result
            status="success"
            title="霍兰德职业兴趣测评完成！"
            subTitle="根据您的选择，我们为您分析了职业兴趣倾向"
            extra={[
              <Button type="primary" key="retake" onClick={handleRetake}>
                重新测评
              </Button>,
              <Button key="home" onClick={handleGoHome}>
                返回测评中心
              </Button>
            ]}
          />

          <div style={{ marginTop: '24px' }}>
            <Title level={4}>您的职业兴趣类型排名：</Title>
            {resultData.dominantTypes.map((item: any, index: number) => (
              <Card 
                key={item.type} 
                style={{ marginBottom: '16px', borderLeft: `4px solid ${index === 0 ? '#1890ff' : '#52c41a'}` }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: '16px' }}>
                      {index === 0 ? '主要类型' : `次要类型${index}`}：{getTypeName(item.type)}
                    </Text>
                    <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                      {item.percentage}%
                    </Text>
                  </div>
                  <Progress percent={item.percentage} showInfo={false} />
                  <Paragraph type="secondary">
                    {getTypeDescription(item.type)}
                  </Paragraph>
                </Space>
              </Card>
            ))}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Space>
              <Button type="primary" onClick={handleRetake}>
                重新测评
              </Button>
              <Button onClick={handleGoHome}>
                返回测评中心
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <ClockCircleOutlined style={{ color: isTimeUp ? '#ff4d4f' : '#1890ff' }} />
            <Text strong style={{ color: isTimeUp ? '#ff4d4f' : '#1890ff' }}>
              剩余时间：{formatTime(timeLeft)}
            </Text>
            <Text type="secondary" style={{ marginLeft: 16 }}>
              {version === 'simple' ? '简单版' : '详细版'}
            </Text>
          </Space>
          <Space>
            <BarChartOutlined />
            <Text>进度：{currentQuestion + 1}/{questions.length}</Text>
          </Space>
        </div>
        <Progress 
          percent={Math.round(((currentQuestion + 1) / questions.length) * 100)} 
          showInfo={false}
          style={{ marginTop: '8px' }}
        />
      </Card>

      <Card>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={3}>
            题目 {currentQuestion + 1} / {questions.length}
          </Title>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <Title level={4} style={{ textAlign: 'center', marginBottom: '24px' }}>
            {currentQ.question}
          </Title>
        </div>

        <RadioGroup 
          onChange={(e) => handleAnswerSelect(e.target.value)}
          value={answers[currentQuestion]}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {currentQ.options.map((option) => (
              <Card 
                key={option.value}
                hoverable
                style={{
                  cursor: 'pointer',
                  border: answers[currentQuestion] === option.value ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  backgroundColor: answers[currentQuestion] === option.value ? '#e6f7ff' : 'white'
                }}
                onClick={() => handleAnswerSelect(option.value)}
              >
                <Radio value={option.value}>{option.label}</Radio>
              </Card>
            ))}
          </Space>
        </RadioGroup>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Button 
            disabled={currentQuestion === 0}
            icon={<LeftOutlined />}
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
          >
            上一题
          </Button>
          
          {currentQuestion === questions.length - 1 ? (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />}
              onClick={handleSubmit}
              disabled={!answers[currentQuestion]}
            >
              提交测评
            </Button>
          ) : (
            <Button 
              type="primary" 
              icon={<RightOutlined />}
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[currentQuestion]}
            >
              下一题
            </Button>
          )}
        </div>
      </Card>

      <Modal
        title="时间即将到期"
        open={timeLeft <= 60 && timeLeft > 0 && !isTimeUp}
        closable={false}
        footer={[
          <Button key="continue" type="primary" onClick={() => {}}>
            继续答题
          </Button>
        ]}
      >
        <p>您还剩最后 1 分钟，请尽快完成答题。</p>
      </Modal>
    </div>
  )
}

const getTypeName = (type: string) => {
  const typeNames: {[key: string]: string} = {
    realistic: '现实型 (R)',
    investigative: '研究型 (I)',
    artistic: '艺术型 (A)',
    social: '社会型 (S)',
    enterprising: '企业型 (E)',
    conventional: '常规型 (C)'
  }
  return typeNames[type] || type
}

const getTypeDescription = (type: string) => {
  const descriptions: {[key: string]: string} = {
    realistic: '喜欢使用工具、机器，需要基本操作技能的工作。要求具备机械方面才能、体力或从事与物件、机器、工具、运动器材、植物、动物相关的职业有兴趣，具有相应能力。',
    investigative: '喜欢研究性质的工作，如科学研究、工程设计等。要求具备思考、推理、分析问题的能力，重视科学和逻辑。',
    artistic: '喜欢创造性的活动，如艺术创作、设计、写作等。要求具备艺术方面的才能和创造力，重视美感和个性表达。',
    social: '喜欢与人打交道，如教育、咨询、服务等工作。要求具备人际交往能力，重视合作和社会责任感。',
    enterprising: '喜欢领导和影响他人，如销售、管理、创业等。要求具备领导能力和说服力，重视权力和成就。',
    conventional: '喜欢按规则办事，如会计、文秘、数据分析等。要求具备组织和执行能力，重视秩序和准确性。'
  }
  return descriptions[type] || ''
}