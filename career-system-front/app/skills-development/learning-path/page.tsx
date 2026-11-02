//学习路径页面
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { Card, Button, Typography, Space, Steps, Timeline, Tag, Row, Col, Statistic, Badge } from 'antd'
import { 
  BookOutlined, 
  SolutionOutlined, 
  FlagOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'

const { Title, Paragraph } = Typography

export default function LearningPathPage() {
  const router = useRouter()

  // Mock数据 - 学习路径步骤
  const learningSteps = [
    { id: 1, title: '基础入门', description: '掌握基本概念和工具', duration: '2周', completed: true },
    { id: 2, title: '进阶知识', description: '深入学习核心技能', duration: '4周', completed: true },
    { id: 3, title: '实践项目', description: '通过项目巩固知识', duration: '6周', completed: false },
    { id: 4, title: '高级技巧', description: '掌握高级技能和最佳实践', duration: '3周', completed: false },
    { id: 5, title: '综合应用', description: '综合运用所学知识解决实际问题', duration: '3周', completed: false },
  ]

  // Mock数据 - 推荐学习资源
  const recommendedResources = [
    { id: 1, title: 'React官方教程', type: '教程', level: '初级', duration: '8小时', progress: 100 },
    { id: 2, title: 'TypeScript入门指南', type: '课程', level: '初级', duration: '12小时', progress: 60 },
    { id: 3, title: '前端工程化实践', type: '课程', level: '中级', duration: '15小时', progress: 0 },
    { id: 4, title: '设计模式详解', type: '书籍', level: '高级', duration: '20小时', progress: 0 },
  ]

  // Mock数据 - 学习里程碑
  const milestones = [
    { id: 1, date: '2025-01-15', title: '完成HTML/CSS基础学习', status: 'finish' },
    { id: 2, date: '2025-02-01', title: '完成JavaScript基础学习', status: 'finish' },
    { id: 3, date: '2025-02-20', title: '完成React入门项目', status: 'process' },
    { id: 4, date: '2025-03-15', title: '完成TypeScript学习', status: 'wait' },
    { id: 5, date: '2025-04-01', title: '完成综合项目', status: 'wait' },
  ]

  return (
    <div className="learning-path-page">
      <PageHeader
        title="学习路径"
        subTitle="个性化的技能学习路径规划，助你高效提升"
        extra={[
          <Button 
            key="back-dashboard" 
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            返回仪表盘
          </Button>,
          <Button 
            key="my-skills" 
            onClick={() => router.push('/skills-development/skill-assessment')}
          >
            我的技能
          </Button>,
          <Button 
            key="customize" 
            type="primary"
            onClick={() => alert('自定义学习路径功能正在开发中')}
          >
            自定义路径
          </Button>,
        ]}
      />

      <div className="page-content" style={{ padding: '24px' }}>
        {/* 统计卡片区域 */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总学习时长"
                value={48}
                suffix="小时"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已完成步骤"
                value={2}
                suffix="/ 5"
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="当前进度"
                value={40}
                suffix="%"
                prefix={<SolutionOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="预计完成时间"
                value={8}
                suffix="周"
                prefix={<FlagOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 学习路径步骤 */}
        <Card title="学习路径步骤" style={{ marginBottom: 24 }}>
          <Steps 
            current={2} 
            orientation="vertical" 
            size="small"
            items={learningSteps.map((step, index) => ({
              key: index,
              title: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{step.title}</span>
                  <Tag color={step.completed ? 'green' : 'blue'}>
                    {step.duration}
                  </Tag>
                </div>
              ),
              description: step.description,
              status: step.completed ? 'finish' : index === 2 ? 'process' : 'wait',
              icon: step.completed ? <CheckCircleOutlined /> : null
            }))}
          />
        </Card>

        {/* 学习里程碑 */}
        <Card title="学习里程碑" style={{ marginBottom: 24 }}>
          <Timeline mode="left">
            {milestones.map(milestone => (
              <Timeline.Item 
                key={milestone.id} 
                dot={milestone.status === 'finish' ? <CheckCircleOutlined style={{ fontSize: '16px' }} /> : null}
                color={milestone.status === 'finish' ? 'green' : milestone.status === 'process' ? 'blue' : 'gray'}
              >
                <div>
                  <div><strong>{milestone.title}</strong></div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{milestone.date}</div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>

        {/* 推荐学习资源 */}
        <Card title="推荐学习资源" style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {recommendedResources.map(resource => (
              <Card 
                key={resource.id} 
                hoverable
                style={{ width: '100%' }}
                cover={
                  <div style={{ padding: '16px', backgroundColor: '#f0f2f5', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                  </div>
                }
              >
                <Card.Meta
                  title={resource.title}
                  description={
                    <div style={{ marginTop: '8px' }}>
                      <Tag color="blue">{resource.type}</Tag>
                      <Tag color="gold">{resource.level}</Tag>
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>预计耗时: {resource.duration}</div>
                    </div>
                  }
                />
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>进度:</span>
                    <Badge status={resource.progress === 100 ? 'success' : resource.progress > 0 ? 'processing' : 'default'} text={`${resource.progress}%`} />
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${resource.progress}%`, 
                        backgroundColor: resource.progress === 100 ? '#52c41a' : '#1890ff',
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </div>
                </div>
                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                  <Button size="small" type={resource.progress === 100 ? 'default' : 'primary'}>
                    {resource.progress === 100 ? '复习' : resource.progress > 0 ? '继续学习' : '开始学习'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* 下一步建议 */}
        <Card title="下一步建议">
          <Space orientation="vertical" style={{ width: '100%' }}>
            <Title level={4}>根据您的学习进度，我们建议：</Title>
            <Paragraph type="secondary">
              1. 专注于当前正在进行的学习步骤：完成React入门项目
            </Paragraph>
            <Paragraph type="secondary">
              2. 合理安排学习时间，每天至少投入1-2小时
            </Paragraph>
            <Paragraph type="secondary">
              3. 结合实践项目加深对知识点的理解
            </Paragraph>
            <Space style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                size="large"
                onClick={() => alert('开始学习功能正在开发中')}
              >
                开始学习
              </Button>
              <Button 
                size="large"
                onClick={() => router.push(ROUTES.RESOURCES)}
              >
                查看更多资源
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    </div>
  )
}