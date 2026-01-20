//面试准备页面
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { Card, Button, Typography, Space, Tabs, List, Tag, Collapse, Input, message, Row, Col, Statistic } from 'antd'
import { 
  BookOutlined, 
  TrophyOutlined, 
  RiseOutlined, 
  CheckCircleOutlined,
  BulbOutlined,
  CalendarOutlined,
  TeamOutlined,
  StarOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'
import { useState } from 'react'

const { Title, Paragraph } = Typography
const { Panel } = Collapse
const { TextArea } = Input

export default function InterviewPrepPage() {
  const router = useRouter()
  const [practiceAnswers, setPracticeAnswers] = useState<{[key: string]: string}>({})
  const [activeTab, setActiveTab] = useState('common')

  // 常见面试问题
  const commonQuestions = [
    { id: 1, question: '请简单介绍一下你自己', category: '自我介绍', difficulty: '简单' },
    { id: 2, question: '为什么想要申请这个职位？', category: '动机类', difficulty: '中等' },
    { id: 3, question: '你最大的优点是什么？', category: '个人特质', difficulty: '中等' },
    { id: 4, question: '你最大的缺点是什么？', category: '个人特质', difficulty: '困难' },
    { id: 5, question: '为什么离开上一家公司？', category: '离职原因', difficulty: '中等' },
    { id: 6, question: '谈谈你的职业规划', category: '规划类', difficulty: '中等' },
    { id: 7, question: '你如何处理工作压力？', category: '情境类', difficulty: '中等' },
    { id: 8, question: '描述一次你解决难题的经历', category: '行为类', difficulty: '困难' },
  ]

  // 技术面试问题
  const techQuestions = [
    { id: 1, question: '解释一下面向对象编程的核心概念', category: '编程基础', difficulty: '中等' },
    { id: 2, question: '什么是闭包？请举例说明', category: 'JavaScript', difficulty: '中等' },
    { id: 3, question: '描述一下React的生命周期方法', category: 'React', difficulty: '困难' },
    { id: 4, question: '解释一下HTTP和HTTPS的区别', category: '网络', difficulty: '中等' },
    { id: 5, question: '什么是数据库索引？它的优缺点是什么？', category: '数据库', difficulty: '困难' },
    { id: 6, question: '谈谈你对微服务架构的理解', category: '架构', difficulty: '困难' },
  ]

  // 行为面试问题
  const behavioralQuestions = [
    { id: 1, question: '描述一次你在团队中遇到冲突的经历，你是如何解决的？', category: '团队合作', difficulty: '困难' },
    { id: 2, question: '讲述一次你失败的经历，以及从中学到了什么', category: '挫折应对', difficulty: '困难' },
    { id: 3, question: '描述一次你领导一个项目或任务的经历', category: '领导力', difficulty: '困难' },
    { id: 4, question: '你如何处理多个紧急任务同时出现的情况？', category: '时间管理', difficulty: '中等' },
    { id: 5, question: '描述一次你提出创新想法并成功实施的经历', category: '创新能力', difficulty: '困难' },
  ]

  // 获取对应的问题列表
  const getQuestionList = () => {
    switch(activeTab) {
      case 'tech': return techQuestions
      case 'behavioral': return behavioralQuestions
      default: return commonQuestions
    }
  }

  // 处理答案输入
  const handleAnswerChange = (questionId: number, value: string) => {
    setPracticeAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  // 保存答案
  const saveAnswer = (questionId: number) => {
    message.success('答案已保存')
  }

  // 模拟面试
  const startMockInterview = () => {
    message.info('开始模拟面试，请准备好回答常见问题')
    // 这里可以集成语音识别或其他功能
  }

  // 准备清单
  const prepChecklist = [
    { id: 1, item: '研究公司背景和文化', completed: false },
    { id: 2, item: '准备常见问题的标准答案', completed: false },
    { id: 3, item: '整理个人项目和经历', completed: false },
    { id: 4, item: '准备提问面试官的问题', completed: false },
    { id: 5, item: '检查着装和形象', completed: false },
    { id: 6, item: '规划路线和提前到达时间', completed: false },
  ]

  const items = [
    {
      key: 'common',
      label: '常见问题',
      children: (
        <List
          dataSource={getQuestionList()}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="practice" type="primary" size="small">练习回答</Button>,
                <Button key="save" size="small" onClick={() => saveAnswer(item.id)}>保存答案</Button>
              ]}
            >
              <List.Item.Meta
                title={item.question}
                description={
                  <Space>
                    <Tag color={item.difficulty === '困难' ? 'red' : item.difficulty === '中等' ? 'orange' : 'green'}>
                      {item.difficulty}
                    </Tag>
                    <Tag color="blue">{item.category}</Tag>
                  </Space>
                }
              />
              <div style={{ width: '60%', marginTop: '16px' }}>
                <TextArea
                  rows={4}
                  placeholder="在这里写下你的答案..."
                  value={practiceAnswers[item.id] || ''}
                  onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                />
              </div>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'tech',
      label: '技术问题',
      children: (
        <List
          dataSource={getQuestionList()}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="practice" type="primary" size="small">练习回答</Button>,
                <Button key="save" size="small" onClick={() => saveAnswer(item.id)}>保存答案</Button>
              ]}
            >
              <List.Item.Meta
                title={item.question}
                description={
                  <Space>
                    <Tag color={item.difficulty === '困难' ? 'red' : item.difficulty === '中等' ? 'orange' : 'green'}>
                      {item.difficulty}
                    </Tag>
                    <Tag color="blue">{item.category}</Tag>
                  </Space>
                }
              />
              <div style={{ width: '60%', marginTop: '16px' }}>
                <TextArea
                  rows={4}
                  placeholder="在这里写下你的答案..."
                  value={practiceAnswers[item.id] || ''}
                  onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                />
              </div>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'behavioral',
      label: '行为问题',
      children: (
        <List
          dataSource={getQuestionList()}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="practice" type="primary" size="small">练习回答</Button>,
                <Button key="save" size="small" onClick={() => saveAnswer(item.id)}>保存答案</Button>
              ]}
            >
              <List.Item.Meta
                title={item.question}
                description={
                  <Space>
                    <Tag color={item.difficulty === '困难' ? 'red' : item.difficulty === '中等' ? 'orange' : 'green'}>
                      {item.difficulty}
                    </Tag>
                    <Tag color="blue">{item.category}</Tag>
                  </Space>
                }
              />
              <div style={{ width: '60%', marginTop: '16px' }}>
                <TextArea
                  rows={4}
                  placeholder="在这里写下你的答案..."
                  value={practiceAnswers[item.id] || ''}
                  onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                />
              </div>
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <div className="interview-prep-page">
      <PageHeader
        title="面试准备中心"
        subTitle="全方位准备面试，提高成功率"
        extra={[
          <Button 
            key="back-jobsearch" 
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            返回仪表盘
          </Button>,
          <Button 
            key="mock-interview" 
            type="primary"
            onClick={startMockInterview}
          >
            开始模拟面试
          </Button>,
        ]}
      />

      <div className="page-content" style={{ padding: '24px' }}>
        {/* 面试准备统计卡片 */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="已练习问题数"
                value={commonQuestions.length + techQuestions.length + behavioralQuestions.length}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="准备清单完成度"
                value={4}
                suffix="/ 6"
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="模拟面试次数"
                value={3}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="信心指数"
                value={85}
                suffix="%"
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={18}>
            {/* 面试问题练习 */}
            <Card title="面试问题练习" style={{ marginBottom: 24 }}>
              <Tabs 
                defaultActiveKey="common" 
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
              />
            </Card>

            {/* 面试技巧 */}
            <Card title="面试技巧与建议">
              <Collapse accordion>
                <Panel header="自我介绍技巧" key="1">
                  <Paragraph>
                    <ul>
                      <li>控制在1-3分钟内，突出与职位相关的经验和技能</li>
                      <li>按照"过去-现在-未来"的结构：过去的经历→现在的角色→未来的期望</li>
                      <li>准备2分钟和1分钟两个版本的自我介绍</li>
                      <li>强调你能为公司带来的价值，而非仅仅谈论自己的经历</li>
                    </ul>
                  </Paragraph>
                </Panel>
                <Panel header="回答困难问题的策略" key="2">
                  <Paragraph>
                    <ul>
                      <li>使用STAR法则回答行为问题：Situation（情境）、Task（任务）、Action（行动）、Result（结果）</li>
                      <li>对于缺点问题，选择真实的缺点但要说明改进措施</li>
                      <li>对于薪资期望问题，先了解市场行情，给出范围而非具体数字</li>
                      <li>遇到不懂的技术问题，诚实承认但展示学习能力</li>
                    </ul>
                  </Paragraph>
                </Panel>
                <Panel header="面试后的跟进" key="3">
                  <Paragraph>
                    <ul>
                      <li>面试结束后24小时内发送感谢邮件</li>
                      <li>重申对职位的兴趣，并补充面试中未充分表达的信息</li>
                      <li>如果长时间未收到回复，可以礼貌地询问进展</li>
                      <li>无论结果如何，都将其作为经验积累</li>
                    </ul>
                  </Paragraph>
                </Panel>
              </Collapse>
            </Card>
          </Col>

          <Col xs={24} lg={6}>
            {/* 面试准备清单 */}
            <Card title="面试准备清单" style={{ marginBottom: 24 }}>
              <List
                dataSource={prepChecklist}
                renderItem={(item) => (
                  <List.Item>
                    <Checkbox checked={item.completed}>{item.item}</Checkbox>
                  </List.Item>
                )}
              />
            </Card>

            {/* 面试倒计时 */}
            <Card title="面试倒计时" style={{ marginBottom: 24 }}>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>5 天</div>
                <div style={{ marginTop: '8px' }}>下一场面试</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>2023年6月15日</div>
              </div>
            </Card>

            {/* 推荐学习资源 */}
            <Card title="推荐学习资源">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Button icon={<BulbOutlined />} block>面试常见问题解析</Button>
                <Button icon={<CalendarOutlined />} block>面试时间管理技巧</Button>
                <Button icon={<RiseOutlined />} block>技术面试专项训练</Button>
                <Button icon={<TeamOutlined />} block>模拟面试练习</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

// Checkbox组件需要单独引入，这里临时定义一个简单的实现
const Checkbox = ({ checked, children }: { checked: boolean, children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span style={{ 
      display: 'inline-block', 
      width: '16px', 
      height: '16px', 
      border: '1px solid #d9d9d9', 
      borderRadius: '2px', 
      marginRight: '8px',
      backgroundColor: checked ? '#1890ff' : 'white',
      position: 'relative'
    }}>
      {checked && (
        <span style={{ 
          position: 'absolute', 
          left: '4px', 
          top: '1px', 
          color: 'white', 
          fontSize: '10px' 
        }}>✓</span>
      )}
    </span>
    <span>{children}</span>
  </div>
)