//仪表盘页面
'use client'
import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Progress, List, Button, Timeline, Tag, Avatar, Space, Modal } from 'antd'
import { 
  DashboardOutlined,
  CalendarOutlined, 
  CheckCircleOutlined, 
  RocketOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  UserOutlined,
  StarOutlined,
  FireOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  CalendarFilled,
  BookFilled,
  ExperimentFilled
} from '@ant-design/icons'
import { Line, Pie } from '@ant-design/charts'
import dayjs from 'dayjs'
import styles from './dashboard.module.css'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  // Mock数据
  const [dashboardData, setDashboardData] = useState({
    stats: {
      todayTasks: { completed: 4, total: 10, progress: 40 },
      weeklyProgress: 75,
      skillsMastered: 12,
      studyHours: 36,
      streakDays: 7,
      certification: 3
    },
    tasks: [
      { id: 1, title: '完成React Hooks学习', time: '今天 14:00', completed: true, priority: 'high', category: '学习' },
      { id: 2, title: '英语六级听力练习', time: '今天 16:00', completed: true, priority: 'medium', category: '语言' },
      { id: 3, title: '职业兴趣测评', time: '今天 18:00', completed: false, priority: 'high', category: '测评' },
      { id: 4, title: '更新个人简历', time: '明天 10:00', completed: false, priority: 'high', category: '求职' },
      { id: 5, title: '算法题练习（动态规划）', time: '明天 14:00', completed: false, priority: 'medium', category: '算法' },
    ],
    skills: [
      { name: '前端开发', level: 65, target: 80, color: '#1890ff', trend: 'up' },
      { name: '算法能力', level: 80, target: 90, color: '#52c41a', trend: 'up' },
      { name: '英语水平', level: 40, target: 60, color: '#722ed1', trend: 'steady' },
      { name: '项目管理', level: 30, target: 50, color: '#fa8c16', trend: 'up' },
      { name: '数据分析', level: 25, target: 60, color: '#f759ab', trend: 'steady' },
    ],
    timeline: [
      { time: '08:30', content: '晨间阅读 - 《刻意练习》', color: 'green', icon: <BookFilled /> },
      { time: '10:00', content: 'React源码学习', color: 'blue', icon: <ExperimentFilled /> },
      { time: '14:00', content: '英语听力练习', color: 'purple', icon: <BookFilled /> },
      { time: '16:00', content: '项目小组会议', color: 'red', icon: <TeamOutlined /> },
      { time: '19:00', content: '算法题练习', color: 'orange', icon: <RiseOutlined /> },
    ],
    weeklyStudy: [
      { day: '周一', hours: 6.5 },
      { day: '周二', hours: 5 },
      { day: '周三', hours: 7.2 },
      { day: '周四', hours: 4.5 },
      { day: '周五', hours: 6 },
      { day: '周六', hours: 8.5 },
      { day: '周日', hours: 3 },
    ],
    recentAchievements: [
      { id: 1, title: '连续学习7天', icon: <FireOutlined />, date: '今天', color: '#ff4d4f' },
      { id: 2, title: '完成前端入门课程', icon: <TrophyOutlined />, date: '昨天', color: '#fa8c16' },
      { id: 3, title: '算法题100题', icon: <RiseOutlined />, date: '3天前', color: '#52c41a' },
      { id: 4, title: '英语单词500个', icon: <StarOutlined />, date: '5天前', color: '#1890ff' },
    ]
  })

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setLoading(false)
    }, 800)
  }, [])

  const handleTaskClick = (task: any) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  const completeTask = (taskId: number) => {
    setDashboardData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      ),
      stats: {
        ...prev.stats,
        todayTasks: {
          ...prev.stats.todayTasks,
          completed: prev.stats.todayTasks.completed + 1
        }
      }
    }))
    setIsTaskModalOpen(false)
  }

  // 学习时间图表配置
  const studyChartConfig = {
    data: dashboardData.weeklyStudy,
    xField: 'day',
    yField: 'hours',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    color: '#1890ff',
    smooth: true,
    height: 200,
  }

  // 技能分布饼图
  const skillChartConfig = {
    data: dashboardData.skills,
    angleField: 'level',
    colorField: 'name',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    height: 200,
    color: ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#f759ab'],
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#ff4d4f'
      case 'medium': return '#fa8c16'
      case 'low': return '#52c41a'
      default: return '#d9d9d9'
    }
  }

  const getPriorityText = (priority: string) => {
    switch(priority) {
      case 'high': return '高优先级'
      case 'medium': return '中优先级'
      case 'low': return '低优先级'
      default: return '普通'
    }
  }

  return (
    <div className={styles.dashboardPage}>
      {/* 页面标题和欢迎语 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContainer}>
          <h1 className={styles.headerTitle}>
            <DashboardOutlined className={styles.headerTitleIcon} />
            个人仪表盘
          </h1>
          <div className={styles.headerActions}>
            <Tag icon={<FireOutlined />} color="red">
              连续打卡 {dashboardData.stats.streakDays} 天
            </Tag>
            <Button type="primary" icon={<RocketOutlined />}>
              开始今日计划
            </Button>
          </div>
        </div>
        <p className={styles.welcomeText}>
          欢迎回来，<span className={styles.welcomeTextBold}>张三同学</span>！今天是 {dayjs().format('YYYY年MM月DD日')}，你有 {dashboardData.stats.todayTasks.total - dashboardData.stats.todayTasks.completed} 个任务待完成
        </p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className={styles.statCard}>
            <Statistic 
              title="今日任务" 
              value={dashboardData.stats.todayTasks.completed} 
              suffix={`/${dashboardData.stats.todayTasks.total}`}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={dashboardData.stats.todayTasks.progress} 
              size="small" 
              strokeColor="#52c41a"
              className={styles.statCardProgress}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className={styles.statCard}>
            <Statistic 
              title="本周进度" 
              value={dashboardData.stats.weeklyProgress} 
              suffix="%"
              prefix={<RiseOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className={styles.statCardSubtitle}>
              已完成 35/48 项任务
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className={styles.statCard}>
            <Statistic 
              title="技能掌握" 
              value={dashboardData.stats.skillsMastered} 
              suffix="项"
              prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div className={styles.statCardSubtitle}>
              总计 20 项技能
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className={styles.statCard}>
            <Statistic 
              title="学习时长" 
              value={dashboardData.stats.studyHours} 
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div className={styles.statCardSubtitle}>
              本周累计 41.7 小时
            </div>
          </Card>
        </Col>
      </Row>

      {/* 主要内容和图表 */}
      <Row gutter={[16, 16]}>
        {/* 左侧列 */}
        <Col xs={24} lg={16}>
          {/* 今日待办 */}
          <Card 
            title={
              <span>
                <CalendarOutlined style={{ marginRight: 8 }} />
                今日待办
              </span>
            }
            style={{ marginBottom: 16 }}
            extra={
              <Button type="link" size="small">
                查看全部
              </Button>
            }
            loading={loading}
          >
            <List
              dataSource={dashboardData.tasks}
              renderItem={(item) => (
                <List.Item
                  className={`${item.completed ? styles.taskCompleted : ''} ${styles.taskItem}`}
                  actions={[
                    item.completed ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>已完成</Tag>
                    ) : (
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => handleTaskClick(item)}
                      >
                        开始
                      </Button>
                    )
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size="small" 
                        style={{ 
                          background: getPriorityColor(item.priority),
                          fontSize: '12px'
                        }}
                      >
                        {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                      </Avatar>
                    }
                    title={
                      <div className={styles.taskItemContent}>
                        <span>{item.title}</span>
                        <Tag color="blue">{item.category}</Tag>
                      </div>
                    }
                    description={
                      <div className={styles.taskItemDescription}>
                        <span style={{ color: '#666' }}>
                          <ClockCircleOutlined className={styles.taskItemTimeIcon} />
                          {item.time}
                        </span>
                        <Tag color={getPriorityColor(item.priority)}> {getPriorityText(item.priority)}</Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* 技能成长 */}
          <Card 
            title={
              <span>
                <RiseOutlined style={{ marginRight: 8 }} />
                技能成长
              </span>
            }
            loading={loading}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                {dashboardData.skills.map((skill, index) => (
                  <div key={index} className={styles.skillItem}>
                    <div className={styles.skillHeader}>
                      <span>{skill.name}</span>
                      <span className={styles.skillLevel} style={{ color: skill.color }}>
                        {skill.level}%
                        {skill.trend === 'up' && ' ↗'}
                        {skill.trend === 'down' && ' ↘'}
                      </span>
                    </div>
                    <Progress 
                      percent={skill.level} 
                      strokeColor={skill.color}
                      size="small"
                      format={(percent) => `${percent}%`}
                    />
                    <div className={styles.skillTarget}>
                      目标: {skill.target}%
                    </div>
                  </div>
                ))}
              </Col>
              <Col xs={24} md={12}>
                <Pie {...skillChartConfig} />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 右侧列 */}
        <Col xs={24} lg={8}>
          {/* 今日时间线 */}
          <Card 
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                今日时间线
              </span>
            }
            style={{ marginBottom: 16 }}
            loading={loading}
          >
            <Timeline>
              {dashboardData.timeline.map((item, index) => (
                <Timeline.Item 
                  key={index} 
                  color={item.color}
                  dot={item.icon}
                >
                  <div className={styles.timelineItemTime}>{item.time}</div>
                  <div>{item.content}</div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>

          {/* 学习时间统计 */}
          <Card 
            title={
              <span>
                <BookOutlined style={{ marginRight: 8 }} />
                学习时间统计
              </span>
            }
            style={{ marginBottom: 16 }}
            loading={loading}
          >
            <Line {...studyChartConfig} />
          </Card>

          {/* 近期成就 */}
          <Card 
            title={
              <span>
                <TrophyOutlined style={{ marginRight: 8 }} />
                近期成就
              </span>
            }
            loading={loading}
          >
            <List
              dataSource={dashboardData.recentAchievements}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ background: item.color }}
                        icon={item.icon}
                      />
                    }
                    title={item.title}
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.date}</span>
                        <Tag color="success">已获得</Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* 快速行动 */}
          <Card title="快速行动" loading={loading}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<RocketOutlined />}
                block
                size="large"
              >
                开始今日计划
              </Button>
              <Button 
                icon={<CalendarOutlined />}
                block
                size="large"
              >
                查看周计划
              </Button>
              <Button 
                icon={<TeamOutlined />}
                block
                size="large"
              >
                学习小组
              </Button>
              <Button 
                icon={<BookOutlined />}
                block
                size="large"
              >
                学习资源
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 任务详情弹窗 */}
      <Modal
        title="任务详情"
        open={isTaskModalOpen}
        onCancel={() => setIsTaskModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsTaskModalOpen(false)}>
            取消
          </Button>,
          selectedTask && !selectedTask.completed && (
            <Button 
              key="complete" 
              type="primary" 
              onClick={() => completeTask(selectedTask.id)}
            >
              标记完成
            </Button>
          ),
        ]}
      >
        {selectedTask && (
          <div>
            <h3>{selectedTask.title}</h3>
            <p>时间：{selectedTask.time}</p>
            <p>类别：{selectedTask.category}</p>
            <p>优先级：{getPriorityText(selectedTask.priority)}</p>
            <p>状态：{selectedTask.completed ? '已完成' : '未完成'}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}