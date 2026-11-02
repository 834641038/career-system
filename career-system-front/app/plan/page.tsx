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
  Tag, 
  Select, 
  Alert,
  Dropdown,
  MenuProps,
  Progress,
  Timeline,
  Modal,
  Spin,
  message,
  Table,
  Checkbox
} from 'antd'
import { 
  CalendarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  RiseOutlined,
  PlusCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  LoadingOutlined,
  RocketOutlined,
  StarOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { Pie, Column } from '@ant-design/charts'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/app/lib/routes'
import React, { useState, useMemo, useEffect } from 'react'
import { careerService } from '@/app/services/careerService'

import { recommendationService } from '@/app/services/recommendationService'
import styles from './plan.module.css'

const { Title, Paragraph } = Typography
const { Option } = Select


export default function PlanPage() {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [careerPaths, setCareerPaths] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCareerModal, setShowCareerModal] = useState(false)
  const [selectedPath, setSelectedPath] = useState<any>(null)
  // 新增状态用于详情和任务管理弹窗
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showTaskManagementModal, setShowTaskManagementModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  // 加载职业路径推荐
  useEffect(() => {
    loadCareerPathRecommendations()
  }, [])

  const loadCareerPathRecommendations = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        message.warning('请先登录以获取个性化推荐')
        return
      }

      // 使用后端服务获取职业路径推荐
      
    const response = await recommendationService.getCareerPathRecommendations(undefined, 5)

      
      if (response.success && response.data) {
        // 格式化后端返回的数据以匹配前端预期格式
        const formattedPaths = response.data.map((path: any) => ({
          path_id: path.path_id,
          path_name: path.path_name,
          fit_score: path.fit_score || path.fitScore || 0,
          path_details: {
            description: path.path_details?.description || path.description || '暂无描述',
            holland_codes: path.path_details?.holland_codes || path.hollandCodes || [],
            average_salary: path.path_details?.average_salary || path.averageSalary || path.salary_range || '面议',
            growth_potential: path.path_details?.growth_potential || path.growthPotential || path.prospects || '良好',
            typical_companies: path.path_details?.typical_companies || path.typicalCompanies || path.companies || [],
            required_education: path.path_details?.required_education || path.requiredEducation || path.education_requirement || '本科及以上'
          },
          personalized_plan: path.personalized_plan || path.personalizedPlan || {
            immediate_steps: [],
            short_term_goals: [],
            long_term_vision: '',
            timeline: '2-3年'
          },
          steps: path.personalized_plan?.stages?.map((stage: any) => ({
            step_id: stage.step_id || stage.stage_id || stage.id || stage.stage || stage.title,
            title: stage.title || stage.stage || '发展阶段',
            duration: stage.duration || stage.timeframe || stage.duration_estimate || '6个月',
            required_skills: stage.required_skills || stage.skills_required || stage.skills || [],
            typical_companies: stage.typical_companies || stage.companies || [],
            salary_range: stage.salary_range || stage.estimated_salary || stage.pay_range || '面议',
            description: stage.description || stage.details || ''
          })) || []
        }))
        
        setCareerPaths(formattedPaths)
        message.success(`成功加载 ${formattedPaths.length} 条职业路径推荐`)
      } else {
        throw new Error(response.error || '获取职业路径推荐失败')
      }
    } catch (error: any) {
      console.error('加载职业路径失败:', error)
      message.error(error.message || '加载职业路径推荐失败')
      // 使用mock数据作为备选
      loadMockCareerPaths()
    } finally {
      setLoading(false)
    }
  }

  // Mock数据作为备选方案 - 只保留前端开发工程师
  const loadMockCareerPaths = () => {
    const mockPaths = [
      {
        path_id: 'path_001',
        path_name: '前端开发工程师',
        fit_score: 85.5,
        path_details: {
          description: '专注于用户界面开发，使用现代前端技术栈构建优秀的Web应用体验',
          holland_codes: ['I', 'A', 'S'],
          average_salary: '15K-25K/月',
          growth_potential: '高',
          typical_companies: ['阿里巴巴', '腾讯', '字节跳动', '百度'],
          required_education: '本科及以上'
        },
        personalized_plan: {
          immediate_steps: [
            '深入学习React/Vue框架核心原理',
            '完成3个完整的前端项目作品集',
            '掌握前端性能优化技巧'
          ],
          short_term_goals: [
            '获得初级前端开发岗位',
            '参与大型项目开发经验积累'
          ],
          long_term_vision: '成为资深前端架构师，主导技术选型和团队建设',
          timeline: '2-3年'
        },
        steps: [
          {
            step_id: 'step_001',
            title: '基础技能巩固',
            duration: '3个月',
            required_skills: ['HTML/CSS', 'JavaScript基础', 'Git版本控制'],
            typical_companies: ['初创公司', '外包公司'],
            salary_range: '8K-12K'
          },
          {
            step_id: 'step_002',
            title: '框架深入学习',
            duration: '6个月',
            required_skills: ['React/Vue', 'Webpack', '前端工程化'],
            typical_companies: ['互联网公司', '科技企业'],
            salary_range: '12K-18K'
          }
        ]
      }
    ]
    setCareerPaths(mockPaths)
  }

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

  // 查看职业路径详情
  const viewPathDetail = async (path: any) => {
    setSelectedPath(path)
    setShowCareerModal(true)
  }

  // 保存职业规划
  const saveCareerPlan = async (path: any) => {
    try {
      const planData = {
        title: `职业规划: ${path.path_name}`,
        type: '职业',
        priority: '高',
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 一年后
        krs: path.personalized_plan?.immediate_steps || [],
        careerPathId: path.path_id
      }

      const response = await careerService.saveCareerPlan(planData)
      if (response.success) {
        message.success('职业规划保存成功！')
        // 重新加载规划数据
        loadCareerPathRecommendations()
        router.push(ROUTES.PLAN_TASKS)
      } else {
        throw new Error(response.error)
      }
    } catch (error: any) {
      message.error(error.message || '保存职业规划失败')
    }
  }

  // 显示规划详情
  const showPlanDetail = (plan: any) => {
    setSelectedPlan(plan)
    setShowDetailModal(true)
  }

  // 显示任务管理
  const showTaskManagement = (plan: any) => {
    setSelectedPlan(plan)
    setShowTaskManagementModal(true)
  }

  // 更新任务状态
  const updateTaskStatus = (taskId: number, newStatus: string) => {
    // 在实际应用中，这里会调用API更新任务状态
    console.log(`更新任务 ${taskId} 的状态为: ${newStatus}`)
    message.success('任务状态已更新')
  }

  // 更新任务优先级
  const updateTaskPriority = (taskId: number, newPriority: string) => {
    // 在实际应用中，这里会调用API更新任务优先级
    console.log(`更新任务 ${taskId} 的优先级为: ${newPriority}`)
    message.success('任务优先级已更新')
  }

  // 删除任务
  const deleteTask = (taskId: number) => {
    // 在实际应用中，这里会调用API删除任务
    console.log(`删除任务 ${taskId}`)
    message.success('任务已删除')
  }

  return (
    <div className={styles.planPage}>
      <PageHeader
        title="生涯规划"
        subTitle="制定和管理你的生涯规划"
        extra={[
          <Button 
            key="refresh" 
            icon={<ReloadOutlined />}
            onClick={loadCareerPathRecommendations}
            loading={loading}
          >
            刷新推荐
          </Button>,
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
          className={styles.alertMargin}
        />
      )}

      <div className={styles.pageContent}>
        <Row gutter={[24, 24]}>
          <Col span={16}>
            {/* 职业发展路径推荐 */}
            <Card 
              title={
                <Space>
                  <RocketOutlined />
                  智能职业发展推荐
                  {loading && <Spin size="small" />}
                </Space>
              }
              extra={
                <Space>
                  <Button 
                    type="link" 
                    onClick={() => router.push('/career')}
                  >
                    更多职业探索
                  </Button>
                  <Button 
                    type="primary"
                    size="small"
                    onClick={loadCareerPathRecommendations}
                    icon={<ReloadOutlined />}
                  >
                    刷新
                  </Button>
                </Space>
              }
              className={styles.cardMargin}
            >
              {loading ? (
                <div className={styles.centerContent}>
                  <Spin indicator={<LoadingOutlined className={styles.loadingSpinner} spin />} />
                  <div className={styles.loadingText}>正在分析您的职业发展方向...</div>
                </div>
              ) : careerPaths.length > 0 ? (
                <List
                  dataSource={careerPaths.slice(0, 3)}
                  renderItem={(path: any) => (
                    <List.Item key={path.path_id}>
                      <List.Item.Meta
                        title={
                          <Space>
                            <span>{path.path_name}</span>
                            <Tag color="gold">
                              <StarOutlined /> 匹配度: {(path.fit_score || 0).toFixed(1)}%
                            </Tag>
                            {path.fit_score > 80 && <Tag color="red">强烈推荐</Tag>}
                            {path.fit_score > 70 && path.fit_score <= 80 && <Tag color="orange">推荐</Tag>}
                          </Space>
                        }
                        description={
                          <div>
                            <div className={styles.marginBottom}>
                              <Space size="small">
                                <span>薪资范围: {path.path_details?.average_salary || '面议'}</span>
                                <span>•</span>
                                <span>发展前景: {path.path_details?.growth_potential || '良好'}</span>
                                <span>•</span>
                                <span>学历要求: {path.path_details?.required_education || '不限'}</span>
                              </Space>
                            </div>
                            <div className={styles.marginBottom}>
                              {path.path_details?.holland_codes?.map((code: string, idx: number) => (
                                <Tag key={idx} color="blue">{code}</Tag>
                              ))}
                              {path.path_details?.typical_companies?.slice(0, 3).map((company: string, idx: number) => (
                                <Tag key={idx} color="green">{company}</Tag>
                              ))}
                            </div>
                            <div className={styles.smallText}>
                              {path.path_details?.description?.substring(0, 100)}...
                            </div>
                            {path.personalized_plan?.immediate_steps && (
                              <div className={styles.marginTop}>
                                <strong>近期建议:</strong>
                                <ul className={styles.keyResultsList}>
                                  {path.personalized_plan.immediate_steps.slice(0, 2).map((step: string, idx: number) => (
                                    <li key={idx}>{step}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        }
                      />
                      <Space>
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => saveCareerPlan(path)}
                        >
                          制定计划
                        </Button>
                        <Button 
                          size="small"
                          onClick={() => viewPathDetail(path)}
                        >
                          详情
                        </Button>
                        <Button 
                          size="small"
                          onClick={() => router.push('/career')}
                        >
                          职业探索
                        </Button>
                      </Space>
                    </List.Item>
                  )}
                />
              ) : (
                <div className={styles.centerContent}>
                  <RocketOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 16 }} />
                  <Paragraph type="secondary">
                    完成职业测评后，将为您推荐个性化的职业发展路径
                  </Paragraph>
                  <Space>
                    <Button 
                      type="primary"
                      onClick={() => router.push(ROUTES.ASSESSMENT)}
                    >
                      开始职业测评
                    </Button>
                    <Button 
                      onClick={loadMockCareerPaths}
                    >
                      查看示例路径
                    </Button>
                    <Button 
                      type="primary"
                      danger
                      onClick={() => router.push('/career')}
                    >
                      职业探索
                    </Button>
                  </Space>
                </div>
              )}
            </Card>

            {/* 我的规划 */}
            <Card 
              title={
                <div className={styles.flexBetween}>
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
              className={styles.cardMargin}
            >
              <List
                dataSource={filteredPlans}
                renderItem={plan => (
                  <List.Item key={plan.id}
                    actions={[
                      <Button 
                        type="link" 
                        key={`view-${plan.id}`}
                        onClick={() => showPlanDetail(plan)}
                      >
                        查看详情
                      </Button>,
                      <Button 
                        type="link" 
                        key={`edit-${plan.id}`}
                        onClick={() => showTaskManagement(plan)}
                      >
                        管理任务
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div className={styles.flexBetween}>
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
                          <div className={styles.marginTop}>
                            <Progress percent={plan.progress} size="small" />
                          </div>
                          <div className={styles.grayText}>
                            目标日期: {plan.targetDate}
                          </div>
                          {plan.krs && plan.krs.length > 0 && (
                            <div className={styles.marginTop}>
                              <strong>关键成果:</strong>
                              <ul className={styles.keyResultsList}>
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
                <div className={styles.flexBetween}>
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
                  <List.Item key={task.id}
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
                        <div className={styles.flexBetween}>
                          <Space>
                            <span>{task.title}</span>
                            <Tag color={getPriorityColor(task.priority)}>优先级:{task.priority}</Tag>
                            {getStatusTag(task.status, task.isUrgent, task.isOverdue)}
                          </Space>
                        </div>
                      }
                      description={
                        <div>
                          <div className={styles.grayText}>
                            截止日期: {task.deadline}
                          </div>
                          {task.completionStandard && (
                            <div className={styles.marginTop}>
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
            <Card title="规划统计" className={styles.cardMargin}>
              <div className={styles.marginBottom}>
                <Title level={5}>规划状态分布</Title>
                <Pie
                  data={planStatusData}
                  angleField='value'
                  colorField='type'
                  radius={0.8}
                  label={{
                    // G2 v5 兼容写法（旧的 type:'outer'/content 在 v5 已失效）
                    text: (data: any) => `${data.type}: ${data.value}%`,
                    position: 'outside',
                  }}
                  interactions={[
                    {
                      type: 'element-active',
                    },
                  ]}
                  height={200}
                />
              </div>
              
              <div className={styles.marginBottom}>
                <Title level={5}>各类规划平均进度</Title>
                <Column
                  data={planTypeData}
                  xField='type'
                  yField='value'
                  color={['#1890ff']}
                  height={150}
                  yAxis={{
                    label: {
                      formatter: (v: string | number) => `${v}%`,
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
                    styles={{ content: {  color: '#ff4d4f'  } }}
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

      {/* 职业发展路径详情模态框 */}
      <Modal
        title="职业发展路径详情"
        open={showCareerModal}
        onCancel={() => setShowCareerModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowCareerModal(false)}>
            关闭
          </Button>,
          selectedPath && (
            <Button 
              key="save" 
              type="primary"
              onClick={() => {
                saveCareerPlan(selectedPath)
                setShowCareerModal(false)
              }}
            >
              制定此规划
            </Button>
          ),
          <Button 
            key="explore" 
            onClick={() => router.push('/career')}
          >
            职业探索
          </Button>
        ]}
        width={800}
      >
        {loading ? (
          <div className={styles.modalContent}>
            <Spin indicator={<LoadingOutlined className={styles.loadingSpinner} spin />} />
            <div>正在加载详细信息...</div>
          </div>
        ) : selectedPath ? (
          <div>
            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={3}>{selectedPath.path_name}</Title>
                <Space>
                  <Tag color="gold" style={{ fontSize: '16px', padding: '4px 12px' }}>
                    <StarOutlined /> 匹配度: {(selectedPath.fit_score || 0).toFixed(1)}%
                  </Tag>
                  {selectedPath.fit_score > 80 && <Tag color="red">强烈推荐</Tag>}
                </Space>
              </div>

              <Card size="small" title="基本信息">
                <Row gutter={16}>
                  <Col span={12}>
                    <strong>薪资范围:</strong> {selectedPath.path_details?.average_salary || '面议'}
                  </Col>
                  <Col span={12}>
                    <strong>发展前景:</strong> {selectedPath.path_details?.growth_potential || '良好'}
                  </Col>
                  <Col span={12}>
                    <strong>学历要求:</strong> {selectedPath.path_details?.required_education || '不限'}
                  </Col>
                  <Col span={12}>
                    <strong>典型雇主:</strong> {selectedPath.path_details?.typical_companies?.join(', ') || '无'}
                  </Col>
                </Row>
              </Card>

              <Card size="small" title="职业描述">
                <Paragraph>{selectedPath.path_details?.description}</Paragraph>
              </Card>

              {selectedPath.personalized_plan && (
                <>
                  <Card size="small" title="个性化发展计划">
                    <Space orientation="vertical" style={{ width: '100%' }}>
                      <div>
                        <strong>近期建议 (0-6个月):</strong>
                        <ul>
                          {selectedPath.personalized_plan.immediate_steps?.map((step: string, idx: number) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>短期目标 (6个月-2年):</strong>
                        <ul>
                          {selectedPath.personalized_plan.short_term_goals?.map((goal: string, idx: number) => (
                            <li key={idx}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>长期愿景 (2-5年):</strong>
                        <Paragraph>{selectedPath.personalized_plan.long_term_vision}</Paragraph>
                      </div>
                      <div>
                        <strong>预计时间线:</strong> {selectedPath.personalized_plan.timeline}
                      </div>
                    </Space>
                  </Card>
                </>
              )}

              {selectedPath.steps && selectedPath.steps.length > 0 && (
                <Card size="small" title="发展路径阶段">
                  <Timeline>
                    {selectedPath.steps.map((step: any, index: number) => (
                      <Timeline.Item key={step.step_id} color={index === 0 ? 'green' : 'blue'}>
                        <Space orientation="vertical">
                          <div>
                            <strong>{step.title}</strong> ({step.duration})
                          </div>
                          <div>技能要求: {step.required_skills?.join(', ') || '基础技能'}</div>
                          <div>薪资范围: {step.salary_range}</div>
                          <div>典型雇主: {step.typical_companies?.join(', ') || '各类企业'}</div>
                        </Space>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              )}
            </Space>
          </div>
        ) : (
          <div className={styles.centerContent}>
            <Paragraph>请选择一个职业路径查看详情</Paragraph>
          </div>
        )}
      </Modal>

      {/* 规划详情模态框 */}
      <Modal
        title="规划详情"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close-detail" onClick={() => setShowDetailModal(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedPlan ? (
          <div>
            <Title level={3}>{selectedPlan.title}</Title>
            <div className={styles.planDetails}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="类型" value={selectedPlan.type} />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="优先级" 
                    value={selectedPlan.priority} 
                    styles={{ content: {  color: getPriorityColor(selectedPlan.priority)  } }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="状态" 
                    value={selectedPlan.status} 
                  />
                </Col>
              </Row>
              
              <div className={styles.marginTop}>
                <Title level={5}>完成进度</Title>
                <Progress percent={selectedPlan.progress} size="small" />
              </div>
              
              <div className={styles.marginTop}>
                <Title level={5}>目标日期</Title>
                <Paragraph>{selectedPlan.targetDate}</Paragraph>
              </div>
              
              {selectedPlan.krs && selectedPlan.krs.length > 0 && (
                <div className={styles.marginTop}>
                  <Title level={5}>关键成果</Title>
                  <List
                    dataSource={selectedPlan.krs}
                    renderItem={(kr: string, index: number) => (
                      <List.Item>
                        <Checkbox>{kr}</Checkbox>
                      </List.Item>
                    )}
                  />
                </div>
              )}
              
              <div className={styles.marginTop}>
                <Title level={5}>阶段性任务</Title>
                <List
                  dataSource={recentTasks.filter((task: any) => task.title.includes(selectedPlan.title.split(':')[0]))}
                  renderItem={(task: any) => (
                    <List.Item>
                      <Checkbox checked={task.status === '已完成'}>
                        {task.title}
                      </Checkbox>
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.centerContent}>
            <Paragraph>请选择一个规划查看详情</Paragraph>
          </div>
        )}
      </Modal>

      {/* 任务管理模态框 */}
      <Modal
        title="任务管理"
        open={showTaskManagementModal}
        onCancel={() => setShowTaskManagementModal(false)}
        footer={[
          <Button key="close-task-mgmt" onClick={() => setShowTaskManagementModal(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedPlan ? (
          <div>
            <Title level={3}>{selectedPlan.title} - 任务管理</Title>
            
            <div className={styles.taskManagement}>
              <Table 
                columns={[
                  {
                    title: '任务名称',
                    dataIndex: 'title',
                    key: 'title',
                  },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    render: (text: string, record: any) => getStatusTag(text, record.isUrgent, record.isOverdue)
                  },
                  {
                    title: '优先级',
                    dataIndex: 'priority',
                    key: 'priority',
                    render: (priority: string) => (
                      <Tag color={getPriorityColor(priority)}>优先级: {priority}</Tag>
                    )
                  },
                  {
                    title: '截止日期',
                    dataIndex: 'deadline',
                    key: 'deadline',
                  },
                  {
                    title: '操作',
                    key: 'action',
                    render: (_, record: any) => (
                      <Space size="middle">
                        <Button 
                          size="small"
                          onClick={() => updateTaskStatus(record.id, record.status === '已完成' ? '待完成' : '已完成')}
                        >
                          {record.status === '已完成' ? '取消完成' : '标记完成'}
                        </Button>
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'priority-high',
                                label: '设为高优先级',
                                onClick: () => updateTaskPriority(record.id, '高')
                              },
                              {
                                key: 'priority-medium',
                                label: '设为中优先级',
                                onClick: () => updateTaskPriority(record.id, '中')
                              },
                              {
                                key: 'priority-low',
                                label: '设为低优先级',
                                onClick: () => updateTaskPriority(record.id, '低')
                              },
                              {
                                key: 'delete',
                                label: '删除任务',
                                danger: true,
                                onClick: () => deleteTask(record.id)
                              }
                            ]
                          }}
                          trigger={['click']}
                        >
                          <Button size="small">更多操作</Button>
                        </Dropdown>
                      </Space>
                    ),
                  },
                ]}
                dataSource={recentTasks.filter((task: any) => task.title.includes(selectedPlan.title.split(':')[0]))}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </div>
          </div>
        ) : (
          <div className={styles.centerContent}>
            <Paragraph>请选择一个规划进行任务管理</Paragraph>
          </div>
        )}
      </Modal>
    </div>
  )
}