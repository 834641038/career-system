'use client'
import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Progress, List, Button, Timeline, Tag, Avatar, Space, Modal, message } from 'antd'
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
  ExperimentFilled,
  PlusOutlined
} from '@ant-design/icons'
import { Line, Pie } from '@ant-design/charts'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import styles from './dashboard.module.css'

// 导入服务
import { planService } from '@/lib/services/planService'
// 2026-11-07 新增：真实数据岗位推荐
import { recommendationService } from '@/app/services/recommendationService'
import { formatTimeDisplay, formatDateDisplay } from '@/lib/utils/date'
import { DailyPlan, DailyTask } from '@/lib/types/plan'

// 任务优先级工具函数
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

// 任务接口
interface Task {
  id: number | string;
  title: string;
  date: string;
  time?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  category: string;
  description?: string;
  estimatedDuration?: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [planStats, setPlanStats] = useState<any>(null)
  // 2026-11-07 新增：岗位推荐（真实库数据）
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    date: dayjs().format('YYYY-MM-DD'),
    time: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: '学习',
    description: ''
  })
  const router = useRouter()

  // Mock数据 - 保留原有结构
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
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    // 2026-11-07 新增：加载真实岗位推荐（不传 studentId，后端按登录用户解析）
    setJobsLoading(true)
    recommendationService.getInternshipRecommendations(undefined, {}, 5)
      .then(resp => {
        if (resp.success && resp.data) setRecommendedJobs(resp.data as any[])
      })
      .catch(() => {})
      .finally(() => setJobsLoading(false))
    try {
      // 加载数据（分别等待以保持类型信息）
      const dailyResponse = await planService.getRecentDailyPlans(3)
      const statsResponse = await planService.getPlanStats()

      if (dailyResponse.success && dailyResponse.data) {
        // 合并所有任务并按日期排序
        const allTasks: Task[] = [];
        dailyResponse.data.forEach((plan: DailyPlan) => {
          plan.tasks.forEach((task: DailyTask) => {
            allTasks.push({
              id: task.id,
              title: task.title,
              date: task.date,
              time: task.time,
              priority: task.priority,
              completed: task.completed,
              category: task.category,
              description: task.description,
              estimatedDuration: task.estimatedDuration
            });
          });
        });
        
        // 按日期和时间排序
        allTasks.sort((a, b) => {
          if (a.date === b.date) {
            return (a.time || '').localeCompare(b.time || '');
          }
          return a.date.localeCompare(b.date);
        });
        
        setRecentTasks(allTasks);
      }

      if (statsResponse.success && statsResponse.data) {
        setPlanStats(statsResponse.data);
        // 更新仪表盘统计数据
        setDashboardData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            todayTasks: {
              completed: statsResponse.data!.daily.completed,
              total: statsResponse.data!.daily.total,
              progress: statsResponse.data!.daily.progress
            },
            weeklyProgress: statsResponse.data!.weekly.progress,
            streakDays: statsResponse.data!.streakDays,
            studyHours: statsResponse.data!.weeklyStudyHours
          }
        }));
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 800)
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  const completeTask = async (taskId: number | string) => {
    try {
      const response = await planService.updateTaskStatus(taskId, true)
      if (response.success) {
        message.success('任务已完成')
        // 更新本地状态
        setRecentTasks(prev => 
          prev.map(task => 
            task.id === taskId ? { ...task, completed: true } : task
          )
        )
        setIsTaskModalOpen(false)
        setSelectedTask(null)
        // 重新加载数据
        loadData()
      } else {
        message.error(response.error || '更新任务失败')
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      message.warning('请输入任务标题')
      return
    }

    try {
      const response = await planService.createTask(newTask)
      if (response.success) {
        message.success('任务添加成功')
        setIsAddTaskModalOpen(false)
        setNewTask({
          title: '',
          date: dayjs().format('YYYY-MM-DD'),
          time: '',
          priority: 'medium',
          category: '学习',
          description: ''
        })
        // 重新加载数据
        loadData()
      } else {
        message.error(response.error || '添加任务失败')
      }
    } catch (error) {
      message.error('添加任务失败')
    }
  }

  // 修改导航函数
const navigateToSchedule = (view: 'day' | 'week' = 'day') => {
  router.push(`/plan/schedule${view === 'week' ? '?view=week' : ''}`)
}

const navigateToTodayPlan = () => {
  router.push(`/plan/schedule?date=${dayjs().format('YYYY-MM-DD')}`)
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
      // G2 v5 兼容写法：text 回调 + position 控制标签位置（旧的 type:'outer'/content 写法在 v5 中已失效）
      text: (data: any) => `${data.name}: ${data.level}%`,
      position: 'outside',
    },
    height: 200,
    color: ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#f759ab'],
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
            <Button 
              type="primary" 
              icon={<RocketOutlined />}
              onClick={navigateToTodayPlan}
            >
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
              styles={{ content: { color: '#52c41a' } }}
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
              styles={{ content: { color: '#1890ff' } }}
            />
            <div className={styles.statCardSubtitle}>
              {planStats ? `已完成 ${planStats.weekly.completed}/${planStats.weekly.total} 项任务` : '加载中...'}
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
              styles={{ content: { color: '#fa8c16' } }}
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
              styles={{ content: { color: '#722ed1' } }}
            />
            <div className={styles.statCardSubtitle}>
              {planStats ? `本周累计 ${planStats.weeklyStudyHours.toFixed(1)} 小时` : '加载中...'}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 2026-11-07 新增：真实数据岗位推荐 */}
      <Card
        loading={jobsLoading}
        title={
          <span>
            <RocketOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            为你推荐的岗位
            <Tag color="blue" style={{ marginLeft: 8 }}>基于测评与真实招聘数据</Tag>
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        {recommendedJobs.length > 0 ? (
          <List
            dataSource={recommendedJobs}
            renderItem={(item: any) => {
              const job = item.job_details || {}
              const sb = item.score_breakdown || {}
              return (
                <List.Item
                  actions={[
                    <span key="score" style={{ fontWeight: 600, color: '#1890ff' }}>
                      匹配 {Math.round(item.match_score || 0)} 分
                    </span>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#1890ff' }} icon={<RocketOutlined />} />}
                    title={
                      <Space>
                        <a>{item.position}</a>
                        <Tag>{item.company}</Tag>
                        {job.salary_text && <Tag color="orange">{job.salary_text}</Tag>}
                        {job.location && <Tag>{job.location}</Tag>}
                      </Space>
                    }
                    description={
                      <Space size={4} wrap>
                        {(item.reasons || []).slice(0, 2).map((r: string, i: number) => (
                          <Tag key={i} color="green">{r}</Tag>
                        ))}
                        {sb.holland_score != null && <span style={{ color: '#999' }}>岗位 {sb.holland_score != null ? '兴趣匹配 ' + Math.round(sb.holland_score) : ''}</span>}
                        {sb.skill_score != null && <span style={{ color: '#999' }}>技能 {Math.round(sb.skill_score)}</span>}
                      </Space>
                    }
                  />
                </List.Item>
              )
            }}
          />
        ) : (
          <List
            dataSource={[1]}
            renderItem={() => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title="暂无推荐结果"
                  description="完成霍兰德与技能测评后，这里将展示基于真实招聘数据的个性化岗位推荐"
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 主要内容和图表 */}
      <Row gutter={[16, 16]}>
        {/* 左侧列 */}
        <Col xs={24} lg={16}>
          {/* 近期任务 */}
          <Card 
            title={
              <span>
                <CalendarOutlined style={{ marginRight: 8 }} />
                近期任务（3天）
              </span>
            }
            style={{ marginBottom: 16 }}
            extra={
              <Space>
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => setIsAddTaskModalOpen(true)}
                  icon={<PlusOutlined />}
                >
                  添加任务
                </Button>
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => navigateToSchedule()}
                >
                  查看全部
                </Button>
              </Space>
            }
            loading={loading}
          >
            {recentTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#999' }}>
                近期没有任务，快去添加吧！
              </div>
            ) : (
              recentTasks.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className={`${item.completed ? styles.taskCompleted : ''} ${styles.taskItem}`}
                  style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(5,5,5,0.06)' }}
                >
                  <Avatar
                    size="small"
                    style={{ background: getPriorityColor(item.priority), fontSize: '12px', flexShrink: 0 }}
                  >
                    {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0, marginLeft: 16 }}>
                    <div className={styles.taskItemContent}>
                      <span>{item.title}</span>
                      <Tag color="blue">{item.category}</Tag>
                    </div>
                    <div className={styles.taskItemDescription}>
                      <span style={{ color: '#666' }}>
                        <ClockCircleOutlined className={styles.taskItemTimeIcon} />
                        {formatTimeDisplay(item.time, item.date)}
                        {item.estimatedDuration && (
                          <span style={{ marginLeft: 8, color: '#999' }}>
                            （约{Math.ceil(item.estimatedDuration / 60)}小时）
                          </span>
                        )}
                      </span>
                      <Tag color={getPriorityColor(item.priority)}> {getPriorityText(item.priority)}</Tag>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {item.completed ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>已完成</Tag>
                    ) : (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleTaskClick(item)}
                      >
                        开始
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
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
            <Timeline
              items={dashboardData.timeline.map((item) => ({
                color: item.color,
                icon: item.icon,
                content: (
                  <>
                    <div className={styles.timelineItemTime}>{item.time}</div>
                    <div>{item.content}</div>
                  </>
                ),
              }))}
            />
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
            {dashboardData.recentAchievements.map((item, index) => (
              <div
                key={index}
                style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: index < dashboardData.recentAchievements.length - 1 ? '1px solid rgba(5,5,5,0.06)' : 'none' }}
              >
                <Avatar style={{ background: item.color, flexShrink: 0 }} icon={item.icon} />
                <div style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
                  <div>{item.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ color: '#999', fontSize: 12 }}>{item.date}</span>
                    <Tag color="success">已获得</Tag>
                  </div>
                </div>
              </div>
            ))}
          </Card>

          {/* 快速行动 */}
          <Card title="快速行动" loading={loading}>
            <Space orientation="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<RocketOutlined />}
                block
                size="large"
                onClick={navigateToTodayPlan}
              >
                开始今日计划
              </Button>
              <Button 
                icon={<CalendarOutlined />}
                block
                size="large"
                onClick={() => navigateToSchedule('day')}
              >
                查看日计划
              </Button>
              <Button 
                icon={<CalendarFilled />}
                block
                size="large"
                onClick={() => navigateToSchedule('week')}
              >
                查看周计划
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
            {selectedTask.description && (
              <p style={{ margin: '8px 0', color: '#666' }}>{selectedTask.description}</p>
            )}
            <p><strong>时间：</strong>{formatTimeDisplay(selectedTask.time, selectedTask.date)}</p>
            <p><strong>日期：</strong>{formatDateDisplay(selectedTask.date)}</p>
            <p><strong>类别：</strong>{selectedTask.category}</p>
            <p><strong>优先级：</strong>{getPriorityText(selectedTask.priority)}</p>
            {selectedTask.estimatedDuration && (
              <p><strong>预计时长：</strong>{Math.ceil(selectedTask.estimatedDuration / 60)}小时</p>
            )}
            <p><strong>状态：</strong>
              <Tag color={selectedTask.completed ? 'success' : 'default'}>
                {selectedTask.completed ? '已完成' : '未完成'}
              </Tag>
            </p>
          </div>
        )}
      </Modal>

      {/* 添加任务弹窗 */}
      <Modal
        title="添加新任务"
        open={isAddTaskModalOpen}
        onCancel={() => setIsAddTaskModalOpen(false)}
        onOk={handleAddTask}
        width={500}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="newtask-title" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>任务标题 *</label>
            <input
              id="newtask-title"
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              placeholder="请输入任务标题"
              title="任务标题"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                fontSize: 14
              }}
            />
          </div>
          
          <div>
            <label htmlFor="newtask-desc" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>任务描述</label>
            <textarea
              id="newtask-desc"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              placeholder="请输入任务描述（可选）"
              title="任务描述"
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                fontSize: 14,
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="newtask-date" style={{ display: 'Block', marginBottom: 8, fontWeight: 500 }}>日期</label>
              <input
                id="newtask-date"
                type="date"
                value={newTask.date}
                onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                placeholder="选择日期"
                title="日期"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label htmlFor="newtask-time" style={{ display: 'Block', marginBottom: 8, fontWeight: 500 }}>时间</label>
              <input
                id="newtask-time"
                type="time"
                value={newTask.time}
                onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                placeholder="选择时间"
                title="时间"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="newtask-priority" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>优先级</label>
              <select
                id="newtask-priority"
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                title="优先级"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  fontSize: 14,
                  background: 'white'
                }}
              >
                <option value="high">高优先级</option>
                <option value="medium">中优先级</option>
                <option value="low">低优先级</option>
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label htmlFor="newtask-category" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>分类</label>
              <select
                id="newtask-category"
                value={newTask.category}
                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                title="分类"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  fontSize: 14,
                  background: 'white'
                }}
              >
                <option value="学习">学习</option>
                <option value="工作">工作</option>
                <option value="生活">生活</option>
                <option value="健康">健康</option>
                <option value="社交">社交</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}