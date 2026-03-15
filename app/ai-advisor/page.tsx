//AI顾问页面
'use client'
import { useState, useRef, useEffect } from 'react'
import { PageHeader } from '@ant-design/pro-components'
import { 
  Card, 
  Input, 
  Button, 
  List, 
  Typography, 
  Space, 
  Avatar, 
  Spin, 
  Alert,
  message,
  Divider,
  Tag,
  Row,
  Col
} from 'antd'
import { 
  SendOutlined, 
  RobotOutlined, 
  UserOutlined,
  DeleteOutlined,
  BulbOutlined,
  BookOutlined,
  TagOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { aiService } from '@/app/services/recommendationService'
import styles from './ai-advisor.module.css'

const { Title, Paragraph } = Typography
const { TextArea } = Input

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface QuickQuestion {
  icon: any
  text: string
  question: string
  color: string
}

export default function AIAdvisorPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickQuestions: QuickQuestion[] = [
    {
      icon: BulbOutlined,
      text: '职业规划',
      question: '我应该如何规划我的职业发展路径？',
      color: 'blue'
    },
    {
      icon: BookOutlined,
      text: '技能提升',
      question: '我想提升编程技能，应该学习哪些技术？',
      color: 'green'
    },
    {
      icon: TagOutlined,
      text: '求职建议',
      question: '应届生找工作需要注意什么？',
      color: 'orange'
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)
    setError(null)

    try {
      const context = messages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      const response = await aiService.chat(content, context)

       if (response.success && response.data) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.reply,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
        message.success('AI 回复已生成')
      } else {
        throw new Error(response.error || 'AI service failed')
      }
    } catch (err: any) {
      console.error('AI 对话失败:', err)
      setError(err.message)
      message.error('AI 服务暂时不可用')
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err.message || 'Unknown error'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue)
    }
  }

  const handleQuickQuestion = (question: string) => {
    sendMessage(question)
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
    message.success('对话已清空')
  }

  const getPersonalizedAdvice = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录以获取个性化建议')
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const response = await aiService.getCareerAdvice('请根据我的个人情况，给我一些职业发展建议。')
      
      if (response.success && response.data) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.data.reply,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
        message.success('个性化建议已生成')
      } else {
        throw new Error(response.error || '获取建议失败')
      }
    } catch (err: any) {
      console.error('获取个性化建议失败:', err)
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.aiAdvisorPage}>
      <PageHeader
        title="AI 职业顾问"
        subTitle="基于通义千问大模型的职业规划助手"
        extra={[
          <Button
            key="clear"
            icon={<DeleteOutlined />}
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            清空对话
          </Button>,
          <Button
            key="personalized"
            type="primary"
            icon={<UserOutlined />}
            onClick={getPersonalizedAdvice}
          >
            获取个性化建议
          </Button>
        ]}
      />

      <div className={styles.pageContent}>
        <Row gutter={[24, 24]}>
          <Col span={6}>
            <Card title="常见问题" className={styles.sidebarCard}>
              <Space orientation="vertical" style={{ width: '100%' }}>
                {quickQuestions.map((item, index) => (
                  <Button
                    key={index}
                    icon={<item.icon />}
                    block
                    onClick={() => handleQuickQuestion(item.question)}
                    className={styles.quickQuestionBtn}
                  >
                    <Space>
                      <Tag color={item.color}>{item.text}</Tag>
                    </Space>
                  </Button>
                ))}
              </Space>
              
              <Divider />
              
              <div className={styles.tipsSection}>
                <Title level={5}>💡 使用提示</Title>
                <Paragraph className={styles.smallText}>
                  • 提出具体的问题获得更好的建议<br/>
                  • 可以追问更多细节<br/>
                  • 结合个人情况描述更准确<br/>
                  • 支持多轮对话上下文
                </Paragraph>
              </div>
            </Card>
          </Col>

          <Col span={18}>
            <Card className={styles.chatCard}>
              <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <div className={styles.emptyState}>
                    <RobotOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                    <Title level={3} style={{ marginTop: 16 }}>
                      您好！我是您的 AI 职业顾问
                    </Title>
                    <Paragraph style={{ maxWidth: 500, margin: '0 auto' }}>
                      我可以为您提供职业规划、技能提升、求职面试等方面的专业建议。<br/>
                      请点击左侧的快捷问题，或直接在下方的输入框中输入您的问题。
                    </Paragraph>
                  </div>
                ) : (
                  <List
                    itemLayout="horizontal"
                    dataSource={messages}
                    renderItem={(msg) => (
                      <List.Item className={`${styles.messageItem} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
                        <List.Item.Meta
                          avatar={
                            msg.role === 'user' ? (
                              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
                            ) : (
                              <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
                            )
                          }
                          title={
                            <Space>
                              <span>{msg.role === 'user' ? '您' : 'AI 顾问'}</span>
                              <Tag color={msg.role === 'user' ? 'green' : 'blue'}>
                                {msg.timestamp.toLocaleTimeString()}
                              </Tag>
                            </Space>
                          }
                          description={
                            <div className={styles.messageContent}>
                              {msg.content}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
                
                {loading && (
                  <div className={styles.loadingState}>
                    <Spin tip="AI 正在思考中..." />
                  </div>
                )}
                
                {error && (
                  <Alert
                    message="错误"
                    description={error}
                    type="error"
                    showIcon
                    className={styles.errorAlert}
                  />
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.inputArea}>
                <TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="请输入您的职业问题...（Shift+Enter 换行）"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={loading}
                />
                <div className={styles.inputActions}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSend}
                      loading={loading}
                      disabled={!inputValue.trim()}
                      size="large"
                    >
                      发送
                    </Button>
                    <Button
                      onClick={clearChat}
                      disabled={messages.length === 0}
                    >
                      清空
                    </Button>
                  </Space>
                  <div className={styles.charCount}>
                    字数：{inputValue.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}