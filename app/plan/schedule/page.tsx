//计划安排页面
'use client'
import { useState, useEffect } from 'react'
import { 
  Card, Row, Col, Tabs, Button, Space, Tag, 
  List, Progress, Statistic, Modal, message,
  Input, Select, DatePicker, TimePicker, Alert
} from 'antd'
import { 
  CalendarOutlined, ClockCircleOutlined, 
  PlusOutlined, CheckCircleOutlined,
  EditOutlined, DeleteOutlined,
  EyeOutlined, CalendarFilled,
  ArrowLeftOutlined, ArrowRightOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './schedule.module.css' // 修改为正确的文件名

// 导入服务
import { planService } from '@/lib/services/planService'
import { getWeekId, getWeekRange, formatDateDisplay, formatTimeDisplay } from '@/lib/utils/date'

const { TabPane } = Tabs
const { Option } = Select
const { TextArea } = Input

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

export default function SchedulePage() {
  const [activeView, setActiveView] = useState<'day' | 'week'>('day')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null) // 添加错误状态
  const [dailyPlans, setDailyPlans] = useState<any[]>([])
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: dayjs().format('YYYY-MM-DD'),
    time: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: '学习',
    estimatedDuration: ''
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  const viewParam = searchParams.get('view')

  useEffect(() => {
    const view = viewParam === 'week' ? 'week' : 'day'
    setActiveView(view)
    
    if (view === 'day') {
      loadDailyPlans()
    } else {
      loadWeeklyPlan()
    }
  }, [viewParam])

  const loadDailyPlans = async () => {
    setLoading(true)
    setError(null) // 清除之前的错误
    try {
      console.log('请求日计划数据')
      const response = await planService.getRecentDailyPlans(3)
      console.log('收到日计划响应:', response)
      
      if (response.success && response.data) {
        setDailyPlans(response.data)
        console.log('日计划数据设置成功:', response.data)
      } else {
        const errorMsg = response.error || '获取日计划失败'
        setError(errorMsg)
        message.error(errorMsg)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '加载日计划失败'
      setError(errorMsg)
      console.error('加载日计划异常:', error)
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const loadWeeklyPlan = async () => {
    setLoading(true)
    setError(null) // 清除之前的错误
    try {
      console.log('请求周计划数据')
      const response = await planService.getWeeklyPlan()
      console.log('收到周计划响应:', response)
      
      if (response.success && response.data) {
        setWeeklyPlan(response.data)
        console.log('周计划数据设置成功:', response.data)
      } else {
        const errorMsg = response.error || '获取周计划失败'
        setError(errorMsg)
        message.error(errorMsg)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '加载周计划失败'
      setError(errorMsg)
      console.error('加载周计划异常:', error)
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: string | number) => {
    try {
      const response = await planService.updateTaskStatus(taskId, true)
      if (response.success) {
        message.success('任务已完成')
        if (activeView === 'day') {
          loadDailyPlans()
        } else {
          loadWeeklyPlan()
        }
      } else {
        message.error(response.error || '更新任务失败')
      }
    } catch (error) {
      message.error('更新任务失败')
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      message.warning('请输入任务标题')
      return
    }

    try {
      const taskData = {
        ...newTask,
        estimatedDuration: newTask.estimatedDuration ? parseInt(newTask.estimatedDuration) * 60 : undefined
      }
      
      const response = await planService.createTask(taskData)
      if (response.success) {
        message.success('任务添加成功')
        setIsAddTaskModalOpen(false)
        setNewTask({
          title: '',
          description: '',
          date: dayjs().format('YYYY-MM-DD'),
          time: '',
          priority: 'medium',
          category: '学习',
          estimatedDuration: ''
        })
        
        // 重新加载数据
        if (activeView === 'day') {
          loadDailyPlans()
        } else {
          loadWeeklyPlan()
        }
      } else {
        message.error(response.error || '添加任务失败')
      }
    } catch (error) {
      message.error('添加任务失败')
    }
  }

  const navigateToDate = (date: string) => {
    router.push(`/plan/schedule?date=${date}`)
  }

  const renderDayView = () => (
    <div className={styles.dayView}>
      <div className={styles.viewHeader}>
        <h2>日计划视图</h2>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsAddTaskModalOpen(true)}
          >
            添加任务
          </Button>
        </Space>
      </div>

      {/* 添加错误显示 */}
      {error && (
        <Alert 
          message="加载失败" 
          description={error}
          type="error" 
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        {dailyPlans.map((plan, index) => (
          <Col xs={24} lg={8} key={plan.date}>
            <Card 
              title={
                <div className={styles.dayCardHeader}>
                  <span>{formatDateDisplay(plan.date)}</span>
                  <Tag color={index === 0 ? 'blue' : 'default'}>
                    {index === 0 ? '今天' : index === 1 ? '明天' : index === 2 ? '后天' : ''}
                  </Tag>
                </div>
              }
              extra={
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => navigateToDate(plan.date)}
                >
                  详情
                </Button>
              }
              loading={loading}
            >
              <div className={styles.dayStats}>
                <Progress 
                  percent={plan.progress}
                  size="small"
                  status={plan.progress === 100 ? 'success' : 'active'}
                />
                <div className={styles.dayStatsText}>
                  <span>{plan.completedTasks} / {plan.totalTasks}</span>
                  <span>{plan.progress}%</span>
                </div>
              </div>

              {plan.tasks.length === 0 ? (
                <div className={styles.emptyTasks}>
                  <p>今天没有任务</p>
                  <Button 
                    type="dashed" 
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setNewTask(prev => ({ ...prev, date: plan.date }))
                      setIsAddTaskModalOpen(true)
                    }}
                  >
                    添加任务
                  </Button>
                </div>
              ) : (
                <List
                  dataSource={plan.tasks}
                  renderItem={(task: any) => (
                    <List.Item
                      className={task.completed ? styles.taskCompleted : ''}
                      actions={[
                        task.completed ? (
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        ) : (
                          <Space>
                            <Button 
                              type="text" 
                              size="small"
                              onClick={() => handleCompleteTask(task.id)}
                            >
                              完成
                            </Button>
                          </Space>
                        )
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div 
                            className={styles.priorityDot}
                            style={{ background: getPriorityColor(task.priority) }}
                          />
                        }
                        title={
                          <div className={styles.taskTitle}>
                            {task.completed ? (
                              <del>{task.title}</del>
                            ) : (
                              task.title
                            )}
                          </div>
                        }
                        description={
                          <div className={styles.taskInfo}>
                            {task.time && (
                              <span>
                                <ClockCircleOutlined /> {task.time}
                              </span>
                            )}
                            {task.description && (
                              <span style={{ color: '#666', fontSize: '12px' }}>
                                {task.description}
                              </span>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )

  const renderWeekView = () => (
    <div className={styles.weekView}>
      {/* 添加错误显示 */}
      {error && (
        <Alert 
          message="加载失败" 
          description={error}
          type="error" 
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {weeklyPlan && (
        <>
          <div className={styles.weekHeader}>
            <div className={styles.weekInfo}>
              <h2>第 {weeklyPlan.weekNumber} 周计划</h2>
              <p className={styles.weekDates}>
                {formatDateDisplay(weeklyPlan.startDate)} 至 {formatDateDisplay(weeklyPlan.endDate)}
              </p>
            </div>
            <div className={styles.weekStats}>
              <Statistic 
                title="周进度" 
                value={weeklyPlan.progress} 
                suffix="%"
              />
              <Statistic 
                title="已完成" 
                value={weeklyPlan.completedTasks} 
                suffix={`/${weeklyPlan.totalTasks}`}
              />
              <Statistic 
                title="总时长" 
                value={weeklyPlan.totalHours} 
                suffix="小时"
              />
            </div>
          </div>

          <Card 
            title="本周目标"
            style={{ marginBottom: 16 }}
            loading={loading}
          >
            <p>{weeklyPlan.weeklyGoal}</p>
          </Card>

          <Card 
            title="本周任务"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                size="small"
                onClick={() => setIsAddTaskModalOpen(true)}
              >
                添加周任务
              </Button>
            }
            style={{ marginBottom: 16 }}
            loading={loading}
          >
            {weeklyPlan.tasks.length === 0 ? (
              <div className={styles.emptyTasks}>
                <p>本周没有任务</p>
                <Button 
                  type="dashed" 
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddTaskModalOpen(true)}
                >
                  添加任务
                </Button>
              </div>
            ) : (
              <List
                dataSource={weeklyPlan.tasks}
                renderItem={(task: any) => (
                  <List.Item
                    className={task.completed ? styles.taskCompleted : ''}
                    actions={[
                      task.completed ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <Button 
                          type="link"
                          size="small"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          完成
                        </Button>
                      )
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div 
                          className={styles.priorityDot}
                          style={{ 
                            background: getPriorityColor(task.priority),
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 12
                          }}
                        >
                          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                        </div>
                      }
                      title={
                        <div className={styles.taskTitle}>
                          {task.completed ? (
                            <del>{task.title}</del>
                          ) : (
                            task.title
                          )}
                        </div>
                      }
                      description={
                        <div className={styles.taskInfo}>
                          {task.description && (
                            <p style={{ margin: '4px 0', color: '#666' }}>{task.description}</p>
                          )}
                          {task.isFlexible && (
                            <Tag color="blue" className={styles.smallTag}>灵活安排</Tag>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>

          {weeklyPlan.nextWeekPreview && (
            <Card title="下周预览" loading={loading}>
              <p>{weeklyPlan.nextWeekPreview}</p>
              <div style={{ marginTop: 16 }}>
                <Button 
                  type="dashed"
                  onClick={() => router.push('/plan/schedule?view=week')}
                >
                  查看下周计划
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )

  return (
    <div className={styles.schedulePage}>
      <div className={styles.pageHeader}>
        <h1>
          <CalendarOutlined />
          计划安排
        </h1>
        <p>管理您的每日任务和周度目标</p>
      </div>

      <Card loading={loading}>
        <Tabs
          activeKey={activeView}
          onChange={(key) => {
            setActiveView(key as 'day' | 'week')
            router.push(`/plan/schedule?view=${key}`)
          }}
        >
          <TabPane tab="日计划" key="day">
            {renderDayView()}
          </TabPane>
          <TabPane tab="周计划" key="week">
            {renderWeekView()}
          </TabPane>
        </Tabs>
      </Card>

      {/* 添加任务弹窗 */}
      <Modal
        title="添加新任务"
        open={isAddTaskModalOpen}
        onCancel={() => setIsAddTaskModalOpen(false)}
        onOk={handleAddTask}
        width={600}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>任务标题 *</label>
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              placeholder="请输入任务标题"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>任务描述</label>
            <TextArea
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              placeholder="请输入任务描述（可选）"
              rows={3}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>日期</label>
              <DatePicker
                value={newTask.date ? dayjs(newTask.date) : null}
                onChange={(date) => setNewTask({...newTask, date: date ? date.format('YYYY-MM-DD') : ''})}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>时间</label>
              <TimePicker
                value={newTask.time ? dayjs(newTask.time, 'HH:mm') : null}
                onChange={(time) => setNewTask({...newTask, time: time ? time.format('HH:mm') : ''})}
                format="HH:mm"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>优先级</label>
              <Select
                value={newTask.priority}
                onChange={(value) => setNewTask({...newTask, priority: value})}
                style={{ width: '100%' }}
              >
                <Option value="high">高优先级</Option>
                <Option value="medium">中优先级</Option>
                <Option value="low">低优先级</Option>
              </Select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>分类</label>
              <Select
                value={newTask.category}
                onChange={(value) => setNewTask({...newTask, category: value})}
                style={{ width: '100%' }}
              >
                <Option value="学习">学习</Option>
                <Option value="工作">工作</Option>
                <Option value="生活">生活</Option>
                <Option value="健康">健康</Option>
                <Option value="社交">社交</Option>
                <Option value="其他">其他</Option>
              </Select>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>预计时长（小时）</label>
            <Input
              type="number"
              value={newTask.estimatedDuration}
              onChange={(e) => setNewTask({...newTask, estimatedDuration: e.target.value})}
              placeholder="例如：2（表示2小时）"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}