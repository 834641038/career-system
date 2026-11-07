// 职业价值观测评页面
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
  Modal,
  Alert
} from 'antd'
import { 
  LeftOutlined, 
  RightOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { useRouter, useSearchParams } from 'next/navigation'
import { ROUTES } from '@/app/lib/routes'

const { Title, Text, Paragraph } = Typography
const { Group: RadioGroup } = Radio

// 职业价值观测评题目数据
const valuesQuestions = [
  {
    id: 1,
    question: "在工作中，我最看重的是能够充分发挥自己的专业能力",
    dimension: "成就导向",
    options: [
      { value: 1, label: "非常不符合" },
      { value: 2, label: "比较不符合" },
      { value: 3, label: "不确定" },
      { value: 4, label: "比较符合" },
      { value: 5, label: "非常符合" }
    ]
  },
  {
    id: 2,
    question: "我希望工作能够给我带来稳定的收入和福利保障",
    dimension: "安全稳定",
    options: [
      { value: 1, label: "非常不符合" },
      { value: 2, label: "比较不符合" },
      { value: 3, label: "不确定" },
      { value: 4, label: "比较符合" },
      { value: 5, label: "非常符合" }
    ]
  },
  {
    id: 3,
    question: "我希望能够通过工作为社会做出贡献，帮助他人",
    dimension: "社会贡献",
    options: [
      { value: 1, label: "非常不符合" },
      { value: 2, label: "比较不符合" },
      { value: 3, label: "不确定" },
      { value: 4, label: "比较符合" },
      { value: 5, label: "非常符合" }
    ]
  },
  {
    id: 4,
    question: "我希望在工作中能够不断创新，挑战传统做法",
    dimension: "创新挑战",
    options: [
      { value: 1, label: "非常不符合" },
      { value: 2, label: "比较不符合" },
      { value: 3, label: "不确定" },
      { value: 4, label: "比较符合" },
      { value: 5, label: "非常符合" }
    ]
  },
  {
    id: 5,
    question: "我重视工作与生活的平衡，不希望工作占用太多个人时间",
    dimension: "工作生活平衡",
    options: [
      { value: 1, label: "非常不符合" },
      { value: 2, label: "比较不符合" },
      { value: 3, label: "不确定" },
      { value: 4, label: "比较符合" },
      { value: 5, label: "非常符合" }
    ]
  },
  {
    id: 6,
    question: "我希望在工作中能够获得领导职位，拥有决策权",
    dimension: "权力地位",
    options: [
      { value: 1, label: "非常不符合" },
      { value: 2, label: "比较不符合" },
      { value: 3, label: "不确定" },
      { value: 4, label: "比较符合" },
      { value: 5, label: "非常符合" }
    ]
  }
]

// 扩展更多题目以达到30题
const generateMoreQuestions = () => {
  const additionalQuestions = [
    // 成就导向类
    "我希望在专业领域成为专家或权威人士",
    "我享受完成具有挑战性工作任务的成就感",
    "我希望通过工作证明自己的能力和价值",
    
    // 安全稳定类
    "我更倾向于选择发展前景稳定的行业和公司",
    "相比高薪，我更看重工作的稳定性",
    "我希望有完善的社保和医疗保障",
    
    // 社会贡献类
    "我希望从事能够改善他人生活质量的工作",
    "我愿意为了公共利益而牺牲个人利益",
    "我希望工作能够体现社会责任感",
    
    // 创新挑战类
    "我喜欢尝试新的工作方法和解决方案",
    "我渴望在快速变化的环境中工作",
    "我希望参与开创性的项目和事业",
    
    // 工作生活平衡类
    "我认为充足的休息和个人时间很重要",
    "我不愿意为了工作而经常加班或出差",
    "我希望有足够的时间陪伴家人和朋友",
    
    // 权力地位类
    "我渴望在组织中有影响力和话语权",
    "我希望能够指导和培养下属",
    "我希望通过工作获得社会认可和声望"
  ]

  const dimensions = ['成就导向', '安全稳定', '社会贡献', '创新挑战', '工作生活平衡', '权力地位']
  
  return additionalQuestions.map((questionText, index) => ({
    id: index + 7,
    question: questionText,
    dimension: dimensions[index % 6],
    options: [
      { value: 1, label: "非常不符合" },
      { value: 2, label: "比较不符合" },
      { value: 3, label: "不确定" },
      { value: 4, label: "比较符合" },
      { value: 5, label: "非常符合" }
    ]
  }))
}

// 合并所有题目
const allQuestions = [...valuesQuestions, ...generateMoreQuestions()]

export default function ValuesAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{[key: number]: number}>({})
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15分钟倒计时
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  // 倒计时效果
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      setIsTimeUp(true)
      handleSubmit()
    }
  }, [timeLeft, showResult])

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 处理答案选择
  const handleAnswerSelect = (value: number) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    })
    setShowWarning(false)
  }

  // 计算测评结果
  const calculateResult = () => {
    // 按维度统计得分
    const dimensionScores: {[key: string]: number[]} = {
      '成就导向': [],
      '安全稳定': [],
      '社会贡献': [],
      '创新挑战': [],
      '工作生活平衡': [],
      '权力地位': []
    }

    // 收集各维度得分
        Object.entries(answers).forEach(([questionIndex, score]) => {
      const questionId = parseInt(questionIndex)
      const question = allQuestions.find(q => q.id === questionId + 1)
      if (question) {
        dimensionScores[question.dimension].push(score)
      }
    })

    // 计算各维度平均分
    const finalScores: {[key: string]: number} = {}
    Object.keys(dimensionScores).forEach(dimension => {
      const scores = dimensionScores[dimension]
      if (scores.length > 0) {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
        finalScores[dimension] = Math.round(average * 20) // 转换为百分制
      } else {
        finalScores[dimension] = 0
      }
    })

    // 找出最高分的维度
    const sortedDimensions = Object.entries(finalScores)
      .sort(([,a], [,b]) => b - a)
      .map(([dimension, score]) => ({ dimension, score }))

    return {
      scores: finalScores,
      ranking: sortedDimensions,
      dominantValue: sortedDimensions[0]?.dimension || '',
      dominantScore: sortedDimensions[0]?.score || 0
    }
  }

  // 提交测评
  const handleSubmit = () => {
    if (Object.keys(answers).length < allQuestions.length) {
      setShowWarning(true)
      return
    }
    
    const result = calculateResult()
    setResultData(result)
    setShowResult(true)
    saveValuesToBackend(result.scores)
  }


  // 2026-11-07 新增：价值观结果落库（静默，失败不阻断结果展示）
  const saveValuesToBackend = async (scores: {[key: string]: number}) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const resp = await fetch('http://localhost:5000/api/assessment/values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ scores })
      })
      const d = await resp.json()
      if (d.success) {
        Modal.success({ title: '测评结果已保存', content: '结果将用于职业路径推荐' })
      }
    } catch (e) {
      console.warn('保存价值观结果失败', e)
    }
  }

  // 重新测评
  const handleRetake = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResult(false)
    setResultData(null)
    setTimeLeft(15 * 60)
    setIsTimeUp(false)
  }

  // 返回测评中心
  const handleBackToCenter = () => {
    router.push(ROUTES.ASSESSMENT)
  }

  // 渲染题目页面
  const renderQuestionPage = () => {
    const question = allQuestions[currentQuestion]
    const progress = ((currentQuestion + 1) / allQuestions.length) * 100
    
    return (
      <div className="values-assessment">
        {/* 顶部信息栏 */}
        <div className="assessment-header">
          <div className="timer-section">
            <ClockCircleOutlined style={{ marginRight: 8, color: timeLeft < 300 ? '#ff4d4f' : '#1890ff' }} />
            <Text strong style={{ color: timeLeft < 300 ? '#ff4d4f' : 'inherit' }}>
              剩余时间: {formatTime(timeLeft)}
            </Text>
          </div>
          
          <div className="progress-section">
            <Text type="secondary">第 {currentQuestion + 1} 题 / 共 {allQuestions.length} 题</Text>
            <Progress 
              percent={progress} 
              showInfo={false} 
              strokeColor="#1890ff"
              style={{ width: 200, marginLeft: 16 }}
            />
          </div>
        </div>

        {/* 题目卡片 */}
        <Card className="question-card">
          <div className="question-content">
            <div className="question-number">
              <Text type="secondary">Q{currentQuestion + 1}</Text>
            </div>
            <Title level={3} className="question-text">
              {question.question}
            </Title>
            
            <div className="dimension-tag">
              <Text type="secondary">维度: {question.dimension}</Text>
            </div>
          </div>

          <RadioGroup 
            onChange={(e) => handleAnswerSelect(e.target.value)}
            value={answers[currentQuestion]}
            size="large"
            className="options-group"
          >
            <Space orientation="vertical" style={{ width: '100%' }}>
              {question.options.map((option) => (
                <Radio 
                  key={option.value} 
                  value={option.value}
                  className="option-radio"
                >
                  {option.label}
                </Radio>
              ))}
            </Space>
          </RadioGroup>
        </Card>

        {/* 操作按钮 */}
        <div className="navigation-buttons">
          <Button 
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
            icon={<LeftOutlined />}
          >
            上一题
          </Button>
          
          {currentQuestion < allQuestions.length - 1 ? (
            <Button 
              type="primary"
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[currentQuestion]}
              icon={<RightOutlined />}
            >
              下一题
            </Button>
          ) : (
            <Button 
              type="primary"
              onClick={handleSubmit}
              disabled={!answers[currentQuestion]}
              icon={<CheckCircleOutlined />}
            >
              提交测评
            </Button>
          )}
        </div>

        {showWarning && (
          <Alert
            message="请完成所有题目后再提交"
            description={`您还有 ${allQuestions.length - Object.keys(answers).length} 道题目未完成`}
            type="warning"
            showIcon
            closable
            onClose={() => setShowWarning(false)}
            style={{ marginTop: 16 }}
          />
        )}

        <style jsx>{`
          .values-assessment {
            padding: 24px;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .assessment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding: 16px;
            background: #f5f5f5;
            border-radius: 8px;
          }
          
          .question-card {
            margin-bottom: 24px;
          }
          
          .question-content {
            text-align: center;
            margin-bottom: 32px;
          }
          
          .question-number {
            margin-bottom: 16px;
          }
          
          .question-text {
            margin-bottom: 16px !important;
            line-height: 1.6;
          }
          
          .dimension-tag {
            display: inline-block;
            padding: 4px 12px;
            background: #e6f7ff;
            border-radius: 16px;
            border: 1px solid #91d5ff;
          }
          
          .options-group {
            width: 100%;
          }
          
          .option-radio {
            padding: 12px 16px;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            margin-bottom: 8px;
            transition: all 0.3s;
          }
          
          .option-radio:hover {
            border-color: #1890ff;
          }
          
          .navigation-buttons {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          @media (max-width: 768px) {
            .values-assessment {
              padding: 16px;
            }
            
            .assessment-header {
              flex-direction: column;
              gap: 12px;
              text-align: center;
            }
            
            .navigation-buttons {
              flex-direction: column;
              gap: 12px;
            }
            
            .navigation-buttons button {
              width: 100%;
            }
          }
        `}</style>
      </div>
    )
  }

  // 渲染结果页面
  const renderResultPage = () => {
    if (!resultData) return null

    const { scores, ranking, dominantValue, dominantScore } = resultData

    return (
      <div className="result-page">
        <Result
          status="success"
          title="职业价值观测评完成！"
          subTitle="以下是您的职业价值观分析结果"
          extra={[
            <Button 
              type="primary" 
              key="retake"
              onClick={handleRetake}
            >
              重新测评
            </Button>,
            <Button 
              key="back" 
              onClick={handleBackToCenter}
            >
              返回测评中心
            </Button>
          ]}
        />

        <Card title="核心价值观排名" style={{ marginBottom: 24 }}>
          <div className="ranking-list">
            {ranking.map((item: any, index: number) => (
              <div key={item.dimension} className="ranking-item">
                <div className="ranking-info">
                  <div className="ranking-position">
                    <Text strong style={{ fontSize: '18px', color: index < 3 ? '#1890ff' : '#666' }}>
                      {index + 1}
                    </Text>
                  </div>
                  <div className="dimension-details">
                    <Text strong>{item.dimension}</Text>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${item.score}%`, backgroundColor: index < 3 ? '#1890ff' : '#d9d9d9' }}
                      />
                    </div>
                  </div>
                </div>
                <Text strong style={{ fontSize: '18px', color: index < 3 ? '#1890ff' : '#666' }}>
                  {item.score}分
                </Text>
              </div>
            ))}
          </div>
        </Card>

                <Card title="详细分析" style={{ marginBottom: 24 }}>
          <div className="analysis-grid">
            {Object.entries(scores).map(([dimension, score]) => (
              <div key={dimension} className="analysis-item">
                <Text strong>{dimension}</Text>
                <Progress 
                  percent={score as number} 
                  showInfo={false}
                  strokeColor="#1890ff"
                />
                <Text type="secondary">{(score as number)}分</Text>
              </div>
            ))}
          </div>
        </Card>

        <Card title="发展建议">
          <div className="recommendation">
            <Title level={4}>您的主导价值观：{dominantValue}</Title>
            <Paragraph>
              您的职业价值观以"{dominantValue}"为主导，得分为{dominantScore}分。
              这表明您在职业选择和发展中最看重这一方面。
            </Paragraph>
            
            <div className="suggestions">
              <Text strong>建议：</Text>
              <ul>
                <li>在求职时重点关注符合您核心价值观的工作机会</li>
                <li>在职业发展中保持对核心价值观的坚持</li>
                <li>定期反思和调整职业方向，确保与价值观一致</li>
              </ul>
            </div>
          </div>
        </Card>

        <style jsx>{`
          .result-page {
            padding: 24px;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .ranking-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          .ranking-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            border: 1px solid #d9d9d9;
            border-radius: 8px;
            background: #fafafa;
          }
          
          .ranking-info {
            display: flex;
            align-items: center;
            gap: 16px;
            flex: 1;
          }
          
          .ranking-position {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .dimension-details {
            flex: 1;
          }
          
          .score-bar {
            width: 200px;
            height: 8px;
            background: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
          }
          
          .score-fill {
            height: 100%;
            transition: width 0.5s ease;
          }
          
          .analysis-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
          }
          
          .analysis-item {
            text-align: center;
            padding: 16px;
            border: 1px solid #d9d9d9;
            border-radius: 8px;
          }
          
          .recommendation {
            line-height: 1.6;
          }
          
          .suggestions ul {
            margin: 16px 0;
            padding-left: 20px;
          }
          
          .suggestions li {
            margin-bottom: 8px;
          }
          
          @media (max-width: 768px) {
            .result-page {
              padding: 16px;
            }
            
            .analysis-grid {
              grid-template-columns: 1fr;
            }
            
            .score-bar {
              width: 120px;
            }
          }
        `}</style>
      </div>
    )
  }

  // 如果时间到了自动提交
  if (isTimeUp) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <Result
          status="warning"
          title="时间已到"
          subTitle="测评时间已结束，正在为您生成结果..."
        />
      </div>
    )
  }

  return showResult ? renderResultPage() : renderQuestionPage()
}