//生涯规划页面
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { 
  Card, 
  Button, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  List, 
  Badge, 
  Tag, 
  Select, 
  Alert,
  Dropdown,
  MenuProps,
  Progress
} from 'antd'
import { 
  CalendarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  RiseOutlined,
  PlusCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  MoreOutlined
} from '@ant-design/icons'
import { Pie, Column } from '@ant-design/charts'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'
import dayjs from 'dayjs'
import React, { useState, useMemo } from 'react'


const { Title, Paragraph } = Typography
const { Option } = Select

export default function PlanPage() {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  // Mock数据 - 增强版
  const plans = [
    { 
      id: 1, 
      title: '计算机专业四年规划', 
      progress: 65, 
      status: '进行中', 
      targetDate: '2027-06-30',
      type: '学业',
      priority: '高',
      krs: ['GPA达到3.5以上', '完成3个大型项目'],
      isUrgent: false,
      isOverdue: false
    },
    { 
      id: 2, 
      title: '前端开发技能提升计划', 
      progress: 40, 
      status: '进行中', 
      targetDate: '2025-02-10',
      type: '技能',
      priority: '高',
      krs: ['掌握React全家桶', '完成2个项目作品'],
      isUrgent: true,
      isOverdue: false
    },
    { 
      id: 3, 
      title: '英语六级备考计划', 
      progress: 90, 
      status: '即将完成', 
      targetDate: '2025-01-25',
      type: '技能',
      priority: '中',
      krs: ['词汇量达到6000+', '模拟考试90分以上'],
      isUrgent: true,
      isOverdue: false
    },
    { 
      id: 4, 
      title: '暑期实习申请计划', 
      progress: 20, 
      status: '进行中', 
      targetDate: '2025-01-15',
      type: '职业',
      priority: '高',
      krs: ['投递20份简历', '获得3个面试机会'],
      isUrgent: true,
      isOverdue: true
    },
  ]

  const recentTasks = [
    { 
      id: 1, 
      title: '完成React项目实战', 
      status: '待完成', 
      deadline: '2025-02-15',
      priority: '高',
      completionStandard: '完成3个React实战项目，每个项目包含完整的CRUD功能',
      isUrgent: false,
      isOverdue: false
    },
    { 
      id: 2, 
      title: '复习算法基础知识', 
      status: '进行中', 
      deadline: '2025-01-30',
      priority: '高',
      completionStandard: '刷完LeetCode前200道题目，掌握常见算法',
      isUrgent: true,
      isOverdue: false
    },
    { 
      id: 3, 
      title: '完成英语听力练习', 
      status: '已完成', 
      deadline: '2025-01-20',
      priority: '中',
      completionStandard: '每天练习30分钟，连续打卡30天',
      isUrgent: true,
      isOverdue: false
    },
    { 
      id: 4, 
      title: '准备面试自我介绍', 
      status: '待完成', 
      deadline: '2025-01-10',
      priority: '高',
      completionStandard: '准备3个不同版本的自我介绍，每个2分钟内',
      isUrgent: true,
      isOverdue: true
    },
  ]

  // 计算提醒信息
  const alertInfo = useMemo(() => {
    const urgentPlans = plans.filter(plan => plan.isUrgent && !plan.isOverdue)
    const overduePlans = plans.filter(plan => plan.isOverdue)
    const urgentTasks = recentTasks.filter(task => task.isUrgent && !task.isOverdue)
    const overdueTasks = recentTasks.filter(task => task.isOverdue)
    
    return {
      urgentPlans,
      overduePlans,
      urgentTasks,
      overdueTasks,
      totalCount: urgentPlans.length + overduePlans.length + urgentTasks.length + overdueTasks.length
    }
  }, [plans, recentTasks])

  // 图表数据
  const planStatusData = [
    { type: '进行中', value: plans.filter(p => p.status === '进行中').length },
    { type: '即将完成', value: plans.filter(p => p.status === '即将完成').length },
    { type: '已完成', value: plans.filter(p => p.status === '已完成').length },
    { type: '逾期', value: plans.filter(p => p.isOverdue).length },
  ]

  const planTypeData = [
    { type: '学业', value: plans.filter(p => p.type === '学业').reduce((sum, p) => sum + p.progress, 0) / plans.filter(p => p.type === '学业').length || 0 },
    { type: '职业', value: plans.filter(p => p.type === '职业').reduce((sum, p) => sum + p.progress, 0) / plans.filter(p => p.type === '职业').length || 0 },
    { type: '技能', value: plans.filter(p => p.type === '技能').reduce((sum, p) => sum + p.progress, 0) / plans.filter(p => p.type === '技能').length || 0 },
    { type: '生活', value: plans.filter(p => p.type === '生活').reduce((sum, p) => sum + p.progress, 0) / plans.filter(p => p.type === '生活').length || 0 },
  ].filter(item => item.value > 0)

  // 筛选后的数据
  const filteredPlans = plans.filter(plan => {
    const statusMatch = filterStatus === 'all' || plan.status === filterStatus
    const priorityMatch = filterPriority === 'all' || plan.priority === filterPriority
    return statusMatch && priorityMatch
  })

  const filteredTasks = recentTasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority
    return statusMatch && priorityMatch
  })

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case '高': return 'red'
      case '中': return 'orange'
      case '低': return 'green'
      default: return 'blue'
    }
  }

  // 获取状态标签
  const getStatusTag = (status: string, isUrgent: boolean, isOverdue: boolean) => {
    if (isOverdue) {
      return <Tag color="error" icon={<ExclamationCircleOutlined />}>已逾期</Tag>
    }
    if (isUrgent) {
      return <Tag color="warning" icon={<WarningOutlined />}>即将截止</Tag>
    }
    switch(status) {
      case '进行中': return <Tag color="processing">进行中</Tag>
      case '即将完成': return <Tag color="success">即将完成</Tag>
      case '已完成': return <Tag color="success">已完成</Tag>
      case '待完成': return <Tag color="default">待完成</Tag>
      default: return <Tag>{status}</Tag>
    }
  }

  // 推荐模板下拉菜单
  const templateMenuItems: MenuProps['items'] = [
    {
      key: 'academic',
      label: '学业规划模板',
      onClick: () => router.push(`${ROUTES.PLAN_CREATE}?template=academic`)
    },
    {
      key: 'career',
      label: '职业发展模板',
      onClick: () => router.push(`${ROUTES.PLAN_CREATE}?template=career`)
    },
    {
      key: 'skill',
      label: '技能提升模板',
      onClick: () => router.push(`${ROUTES.PLAN_CREATE}?template=skill`)
    },
    {
      key: 'life',
      label: '生活规划模板',
      onClick: () => router.push(`${ROUTES.PLAN_CREATE}?template=life`)
    }
  ]

  return (
    <div className="plan-page">
      <PageHeader
        title="生涯规划"
        subTitle="制定和管理你的生涯规划"
        extra={[
          <Dropdown key="templates" menu={{ items: templateMenuItems }} trigger={['hover']}>
            <Button 
              type="primary"
              icon={<PlusCircleOutlined />}
            >
              创建规划
            </Button>
          </Dropdown>,
          <Button 
            key="dashboard" 
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            返回仪表盘
          </Button>,
        ]}
      />

      {/* 提醒通知栏 */}
      {alertInfo.totalCount > 0 && (
        <Alert
          message={
            <div>
              <Space>
                {alertInfo.overduePlans.length > 0 && (
                  <span><ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> {alertInfo.overduePlans.length}个规划已逾期</span>
                )}
                {alertInfo.urgentPlans.length > 0 && (
                  <span><WarningOutlined style={{ color: '#faad14' }} /> {alertInfo.urgentPlans.length}个规划即将截止</span>
                )}
                {alertInfo.overdueTasks.length > 0 && (
                  <span><ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> {alertInfo.overdueTasks.length}个任务已逾期</span>
                )}
                {alertInfo.urgentTasks.length > 0 && (
                  <span><WarningOutlined style={{ color: '#faad14' }} /> {alertInfo.urgentTasks.length}个任务即将截止</span>
                )}
              </Space>
            </div>
          }
          type="warning"
          showIcon
          style={{ margin: '0 24px 24px 24px' }}
        />
      )}

      <div className="page-content" style={{ padding: '0 24px 24px 24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={16}>
            {/* 我的规划 */}
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>我的规划</span>
                  <Space>
                    <Select 
                      value={filterStatus} 
                      onChange={setFilterStatus} 
                      style={{ width: 120 }}
                      size="small"
                    >
                      <Option value="all">全部状态</Option>
                      <Option value="进行中">进行中</Option>
                      <Option value="即将完成">即将完成</Option>
                      <Option value="已完成">已完成</Option>
                    </Select>
                    <Select 
                      value={filterPriority} 
                      onChange={setFilterPriority} 
                      style={{ width: 120 }}
                      size="small"
                    >
                      <Option value="all">全部优先级</Option>
                      <Option value="高">高优先级</Option>
                      <Option value="中">中优先级</Option>
                      <Option value="低">低优先级</Option>
                    </Select>
                  </Space>
                </div>
              }
              style={{ marginBottom: 24 }}
            >
              <List
                dataSource={filteredPlans}
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <span>{plan.title}</span>
                            <Tag color={getPriorityColor(plan.priority)}>优先级:{plan.priority}</Tag>
                            <Tag>{plan.type}</Tag>
                            {getStatusTag(plan.status, plan.isUrgent, plan.isOverdue)}
                          </Space>
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
                          {plan.krs && plan.krs.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <strong>关键成果:</strong>
                              <ul style={{ margin: '4px 0 0 20px', fontSize: '12px' }}>
                                {plan.krs.slice(0, 2).map((kr, index) => (
                                  <li key={index}>{kr}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* 近期任务 */}
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>近期任务</span>
                  <Space>
                    <Select 
                      value={filterStatus} 
                      onChange={setFilterStatus} 
                      style={{ width: 120 }}
                      size="small"
                    >
                      <Option value="all">全部状态</Option>
                      <Option value="待完成">待完成</Option>
                      <Option value="进行中">进行中</Option>
                      <Option value="已完成">已完成</Option>
                    </Select>
                    <Select 
                      value={filterPriority} 
                      onChange={setFilterPriority} 
                      style={{ width: 120 }}
                      size="small"
                    >
                      <Option value="all">全部优先级</Option>
                      <Option value="高">高优先级</Option>
                      <Option value="中">中优先级</Option>
                      <Option value="低">低优先级</Option>
                    </Select>
                  </Space>
                </div>
              }
            >
              <List
                dataSource={filteredTasks}
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
                      ),
                      <Dropdown 
                        key="more"
                        menu={{ 
                          items: [
                            { key: 'complete', label: '标记完成' },
                            { key: 'delay', label: '延期' },
                            { key: 'delete', label: '删除' },
                          ]
                        }}
                        trigger={['click']}
                      >
                        <Button type="text" size="small" icon={<MoreOutlined />} />
                      </Dropdown>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <span>{task.title}</span>
                            <Tag color={getPriorityColor(task.priority)}>优先级:{task.priority}</Tag>
                            {getStatusTag(task.status, task.isUrgent, task.isOverdue)}
                          </Space>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            截止日期: {task.deadline}
                          </div>
                          {task.completionStandard && (
                            <div style={{ marginTop: 4, fontSize: '12px' }}>
                              <strong>完成标准:</strong> {task.completionStandard}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          
          <Col span={8}>
            {/* 规划统计图表 */}
            <Card title="规划统计" style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>规划状态分布</Title>
                <Pie
                  data={planStatusData}
                  angleField='value'
                  colorField='type'
                  radius={0.8}
                  label={{
                    type: 'outer',
                    content: '{name}: {percentage}',
                  }}
                  interactions={[
                    {
                      type: 'element-active',
                    },
                  ]}
                  height={200}
                />
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>各类规划平均进度</Title>
                <Column
                  data={planTypeData}
                  xField='type'
                  yField='value'
                  color={['#1890ff']}
                  height={150}
                  yAxis={{
                    label: {
                      formatter: (v: string | number) => `${v}%`, // 将数值转换为百分比格式
                    },
                  }}
                />
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Statistic 
                    title="总规划数" 
                    value={plans.length} 
                    prefix={<CalendarOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="进行中" 
                    value={plans.filter(p => p.status === '进行中').length} 
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="已完成" 
                    value={plans.filter(p => p.status === '已完成').length} 
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="逾期数" 
                    value={plans.filter(p => p.isOverdue).length} 
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
                <Col span={24}>
                  <Statistic 
                    title="平均完成率" 
                    value={Math.round(plans.reduce((sum, p) => sum + p.progress, 0) / plans.length)} 
                    suffix="%"
                    prefix={<RiseOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            {/* 操作指南 */}
            <Card title="操作指南">
              <Paragraph>
                <ul>
                  <li>点击"创建规划"开始制定新的生涯规划</li>
                  <li>为每个规划设定明确的目标和时间节点</li>
                  <li>将大目标分解为可执行的小任务</li>
                  <li>定期检查进度并调整计划</li>
                  <li>关注预警提醒，及时处理紧急事项</li>
                </ul>
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      <style jsx>{`
        .plan-page {
          min-height: 100vh;
        }
        
        :global(.ant-alert-warning) {
          border: 1px solid #ffe58f;
          background-color: #fffbe6;
        }
        
        :global(.ant-list-item) {
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        :global(.ant-list-item:last-child) {
          border-bottom: none;
        }
        
        :global(.ant-progress-small) {
          font-size: 12px;
        }
      `}</style>
    </div>
  )
}