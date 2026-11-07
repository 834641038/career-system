//霍兰德测评页面

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Button, 
  Progress, 
  Radio, 
  Space, 
  Typography, 
  Result,
  Modal,
  message
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
import { assessmentService } from '@/lib/services/assessmentService'

const { Title, Text, Paragraph } = Typography
const { Group: RadioGroup } = Radio

// 基础题库（前 6 题）
const baseQuestions = [
  {
    id: 1,
    question: "我喜欢修理自行车或电器",
    type: 'realistic',
    options: [
      { value: 1, label: "非常不符合", score: 2 },
      { value: 2, label: "比较不符合", score: 1 },
      { value: 3, label: "不确定", score: 0 },
      { value: 4, label: "比较符合", score: 1 },
      { value: 5, label: "非常符合", score: 2 }
    ]
  },
  {
    id: 2,
    question: "我喜欢研究科学问题和技术原理",
    type: 'investigative',
    options: [
      { value: 1, label: "非常不符合", score: 2 },
      { value: 2, label: "比较不符合", score: 1 },
      { value: 3, label: "不确定", score: 0 },
      { value: 4, label: "比较符合", score: 1 },
      { value: 5, label: "非常符合", score: 2 }
    ]
  },
  {
    id: 3,
    question: "我喜欢创作音乐、绘画或其他艺术作品",
    type: 'artistic',
    options: [
      { value: 1, label: "非常不符合", score: 2 },
      { value: 2, label: "比较不符合", score: 1 },
      { value: 3, label: "不确定", score: 0 },
      { value: 4, label: "比较符合", score: 1 },
      { value: 5, label: "非常符合", score: 2 }
    ]
  },
  {
    id: 4,
    question: "我喜欢帮助他人解决困难和问题",
    type: 'social',
    options: [
      { value: 1, label: "非常不符合", score: 2 },
      { value: 2, label: "比较不符合", score: 1 },
      { value: 3, label: "不确定", score: 0 },
      { value: 4, label: "比较符合", score: 1 },
      { value: 5, label: "非常符合", score: 2 }
    ]
  },
  {
    id: 5,
    question: "我喜欢说服别人接受我的观点",
    type: 'enterprising',
    options: [
      { value: 1, label: "非常不符合", score: 2 },
      { value: 2, label: "比较不符合", score: 1 },
      { value: 3, label: "不确定", score: 0 },
      { value: 4, label: "比较符合", score: 1 },
      { value: 5, label: "非常符合", score: 2 }
    ]
  },
  {
    id: 6,
    question: "我喜欢按照规则和程序办事",
    type: 'conventional',
    options: [
      { value: 1, label: "非常不符合", score: 2 },
      { value: 2, label: "比较不符合", score: 1 },
      { value: 3, label: "不确定", score: 0 },
      { value: 4, label: "比较符合", score: 1 },
      { value: 5, label: "非常符合", score: 2 }
    ]
  }
]

// 扩展题目（用于完整版）
const extendedQuestions = [
  { question: "我喜欢使用工具制作东西", type: 'realistic' },
  { question: "我对机械装置很感兴趣", type: 'realistic' },
  { question: "我喜欢户外工作", type: 'realistic' },
  { question: "我喜欢动手实验", type: 'realistic' },
  
  { question: "我喜欢分析数据和信息", type: 'investigative' },
  { question: "我对科学研究很感兴趣", type: 'investigative' },
  { question: "我喜欢解决复杂的数学问题", type: 'investigative' },
  { question: "我喜欢探索未知领域", type: 'investigative' },
  
  { question: "我喜欢设计美观的东西", type: 'artistic' },
  { question: "我对色彩搭配很敏感", type: 'artistic' },
  { question: "我喜欢自由创作", type: 'artistic' },
  { question: "我对美学有独特见解", type: 'artistic' },
  
  { question: "我喜欢与人交流沟通", type: 'social' },
  { question: "我善于倾听他人的想法", type: 'social' },
  { question: "我喜欢团队合作", type: 'social' },
  { question: "我关心社会问题", type: 'social' },
  
  { question: "我喜欢制定计划和策略", type: 'enterprising' },
  { question: "我对商业运作很感兴趣", type: 'enterprising' },
  { question: "我喜欢承担领导责任", type: 'enterprising' },
  { question: "我善于影响他人", type: 'enterprising' },
  
  { question: "我喜欢处理文件和数据", type: 'conventional' },
  { question: "我对细节很关注", type: 'conventional' },
  { question: "我喜欢按部就班地工作", type: 'conventional' },
  { question: "我做事很有条理性", type: 'conventional' }
]

// 生成完整题目列表
const generateQuestions = (version: 'simple' | 'full') => {
  if (version === 'simple') {
    // 简单版：每种类型选 1-2 题，共 10 题
    return [
      ...baseQuestions.slice(0, 6),
      ...extendedQuestions.slice(0, 4).map((q, i) => ({
        id: i + 7,
        question: q.question,
        type: q.type,
        options: [
          { value: 1, label: "非常不符合", score: 2 },
          { value: 2, label: "比较不符合", score: 1 },
          { value: 3, label: "不确定", score: 0 },
          { value: 4, label: "比较符合", score: 1 },
          { value: 5, label: "非常符合", score: 2 }
        ]
      }))
    ]
  } else {
    // 完整版：30 题
    return [
      ...baseQuestions,
      ...extendedQuestions.map((q, i) => ({
        id: i + 7,
        question: q.question,
        type: q.type,
        options: [
          { value: 1, label: "非常不符合", score: 2 },
          { value: 2, label: "比较不符合", score: 1 },
          { value: 3, label: "不确定", score: 0 },
          { value: 4, label: "比较符合", score: 1 },
          { value: 5, label: "非常符合", score: 2 }
        ]
      }))
    ]
  }
}

export default function HollandAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const version = (searchParams.get('version') as 'simple' | 'full') || 'full'
  
  const questions = generateQuestions(version)
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{[key: number]: number}>({})
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(version === 'simple' ? 8 * 60 : 20 * 60)
  const [isTimeUp, setIsTimeUp] = useState(false)

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      setIsTimeUp(true)
      handleSubmit()
    }
  }, [timeLeft, showResult])

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
    const scores: {[key: string]: number} = {
      realistic: 0,
      investigative: 0,
      artistic: 0,
      social: 0,
      enterprising: 0,
      conventional: 0
    }

    Object.entries(answers).forEach(([questionIndex, answerValue]) => {
      const question = questions[parseInt(questionIndex)]
      if (question) {
        const selectedOption = question.options.find(opt => opt.value === answerValue)
        if (selectedOption) {
          scores[question.type] += selectedOption.score
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

  // 把原始得分按各维度满分归一化为百分制，便于入库与展示
  const normalizeHollandScores = (rawScores: {[key: string]: number}) => {
    const maxByType: {[key: string]: number} = {}
    questions.forEach(q => { maxByType[q.type] = (maxByType[q.type] || 0) + 2 })
    const normalized: {[key: string]: number} = {}
    Object.keys(rawScores).forEach(type => {
      const max = maxByType[type] || 0
      normalized[type] = max > 0 ? Math.max(0, Math.round((rawScores[type] / max) * 100)) : 0
    })
    return normalized
  }

  // 落库：把六维得分保存到后端（失败不影响查看结果）
  const finishAssessment = async (result: any) => {
    setResultData(result)
    setShowResult(true)
    const res = await assessmentService.saveHolland(normalizeHollandScores(result.scores))
    if (res.success) {
      message.success('测评结果已保存')
    } else {
      message.warning('测评已完成，但结果未保存：' + (res.error || ''))
    }
  }

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      Modal.confirm({
        title: '还有未完成的题目',
        content: `您还有${questions.length - Object.keys(answers).length}道题目未作答，确定要提交吗？`,
        onOk: () => {
          finishAssessment(calculateResult())
        }
      })
    } else {
      finishAssessment(calculateResult())
    }
  }

  const handleRetake = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResult(false)
    setResultData(null)
    setTimeLeft(version === 'simple' ? 8 * 60 : 20 * 60)
    setIsTimeUp(false)
  }

  const handleGoHome = () => {
    router.push(ROUTES.ASSESSMENT)
  }

  if (showResult && resultData) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Card>
          <Result
            status="success"
            title="霍兰德职业兴趣测评完成！"
            subTitle={`根据您的选择，我们为您分析了职业兴趣倾向（${version === 'simple' ? '简单版' : '完整版'}）`}
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
                <Space orientation="vertical" style={{ width: '100%' }}>
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
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <ClockCircleOutlined style={{ color: isTimeUp ? '#ff4d4f' : '#1890ff' }} />
            <Text strong style={{ color: isTimeUp ? '#ff4d4f' : '#1890ff' }}>
              剩余时间：{formatTime(timeLeft)}
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
          <Space orientation="vertical" style={{ width: '100%' }}>
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