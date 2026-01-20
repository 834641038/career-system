//生涯规划页面
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { Card, Button, Typography, Space, Row, Col, Statistic, Progress, List } from 'antd'
import { 
  CalendarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  RiseOutlined,
  PlusCircleOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'

const { Title, Paragraph } = Typography

export default function PlanPage() {
  const router = useRouter()

  // Mock数据
  const plans = [
    { id: 1, title: '计算机专业四年规划', progress: 65, status: '进行中', targetDate: '2027-06-30' },
    { id: 2, title: '前端开发技能提升计划', progress: 40, status: '进行中', targetDate: '2025-12-31' },
    { id: 3, title: '英语六级备考计划', progress: 90, status: '即将完成', targetDate: '2025-06-15' },
  ]

  const recentTasks = [
    { id: 1, title: '完成React项目实战', status: '待完成', deadline: '2025-02-15' },
    { id: 2, title: '复习算法基础知识', status: '进行中', deadline: '2025-01-30' },
    { id: 3, title: '完成英语听力练习', status: '已完成', deadline: '2025-01-20' },
  ]

  return (
    <div className="plan-page">
      <PageHeader
        title="生涯规划"
        subTitle="制定和管理你的生涯规划"
        extra={[
          <Button 
            key="create-plan" 
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => router.push(ROUTES.PLAN_CREATE)}
          >
            创建规划
          </Button>,
          <Button 
            key="dashboard" 
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            返回仪表盘
          </Button>,
        ]}
      />

      <div className="page-content" style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={16}>
            <Card title="我的规划" style={{ marginBottom: 24 }}>
              <List
                dataSource={plans}
                renderItem={plan => (
                  <List.Item 
                    actions={[
                      <Button 
                        type="link" 
                        key={`view-${plan.id}`}
                        onClick={() => router.push(`${ROUTES.PLAN_VIEW}/${plan.id}`)}
                      >
                        查看详情
                      </Button>,
                      <Button 
                        type="link" 
                        key={`edit-${plan.id}`}
                        onClick={() => router.push(`${ROUTES.PLAN_TASKS}/${plan.id}`)}
                      >
                        管理任务
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{plan.title}</span>
                          <span style={{ fontSize: '12px', color: '#888' }}>{plan.status}</span>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginTop: 8 }}>
                            <Progress percent={plan.progress} size="small" />
                          </div>
                          <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>
                            目标日期: {plan.targetDate}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            <Card title="近期任务">
              <List
                dataSource={recentTasks}
                renderItem={task => (
                  <List.Item 
                    actions={[
                      task.status === '待完成' && (
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => {}}
                        >
                          开始任务
                        </Button>
                      ),
                      task.status === '进行中' && (
                        <Button 
                          type="default" 
                          size="small"
                          onClick={() => {}}
                        >
                          继续
                        </Button>
                      )
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{task.title}</span>
                          <span style={{ fontSize: '12px' }}>
                            {task.status === '待完成' ? 
                              <span style={{ color: '#faad14' }}>⚠ {task.status}</span> : 
                              task.status === '进行中' ? 
                                <span style={{ color: '#1890ff' }}>🔄 {task.status}</span> :
                                <span style={{ color: '#52c41a' }}>✓ {task.status}</span>}
                          </span>
                        </div>
                      }
                      description={`截止日期: ${task.deadline}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          
          <Col span={8}>
            <Card title="规划统计">
              <Statistic 
                title="总规划数" 
                value={3} 
                prefix={<CalendarOutlined />}
                style={{ marginBottom: 24 }}
              />
              <Statistic 
                title="进行中" 
                value={2} 
                prefix={<ClockCircleOutlined />}
                style={{ marginBottom: 24 }}
              />
              <Statistic 
                title="已完成" 
                value={1} 
                prefix={<CheckCircleOutlined />}
                style={{ marginBottom: 24 }}
              />
              <Statistic 
                title="平均完成率" 
                value={65} 
                suffix="%"
                prefix={<RiseOutlined />}
              />
            </Card>

            <Card title="操作指南" style={{ marginTop: 24 }}>
              <Paragraph>
                <ul>
                  <li>点击"创建规划"开始制定新的生涯规划</li>
                  <li>为每个规划设定明确的目标和时间节点</li>
                  <li>将大目标分解为可执行的小任务</li>
                  <li>定期检查进度并调整计划</li>
                </ul>
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}