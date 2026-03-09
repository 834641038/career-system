// 学习资源页面
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { 
  Card, 
  Button, 
  Typography, 
  Space, 
  Tabs, 
  Row, 
  Col, 
  List,
  Spin,
  Alert,
  Tag,
  Progress,
  Input,
  Divider,
  Modal,
  message
} from 'antd'
import { 
  BookOutlined,
  SearchOutlined,
  LoadingOutlined,
  FireOutlined,
  StarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CodeOutlined,
  DesktopOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  GithubOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/app/lib/routes'
import { useEffect, useState } from 'react'
import { planService } from '@/lib/services/planService'
import styles from './resources.module.css'

const { Title, Paragraph } = Typography
const { Search } = Input

// 模拟课程数据
const mockCourses = [
  {
    course_id: 'C001',
    title: 'React 高级编程与性能优化',
    provider: '慕课网',
    duration: '18 小时',
    difficulty: '高级',
    skills_covered: ['React Hooks', '性能优化', '状态管理'],
    relevance_score: 95,
    description: '深入讲解 React 高级特性，掌握性能优化技巧，提升开发效率',
    price: '￥299',
    rating: 4.9
  },
  {
    course_id: 'C002',
    title: 'TypeScript 从入门到精通',
    provider: '极客时间',
    duration: '24 小时',
    difficulty: '中级',
    skills_covered: ['TypeScript', '类型系统', '工程化'],
    relevance_score: 92,
    description: '系统学习 TypeScript，掌握类型编程和大型项目开发技巧',
    price: '￥199',
    rating: 4.8
  },
  {
    course_id: 'C003',
    title: 'Node.js 全栈开发实战',
    provider: '拉勾教育',
    duration: '32 小时',
    difficulty: '中级',
    skills_covered: ['Node.js', 'Express', 'MongoDB'],
    relevance_score: 88,
    description: '从零开始构建全栈应用，掌握后端开发核心技能',
    price: '￥399',
    rating: 4.7
  },
  {
    course_id: 'C004',
    title: '算法与数据结构精讲',
    provider: '力扣',
    duration: '40 小时',
    difficulty: '高级',
    skills_covered: ['算法', '数据结构', '面试技巧'],
    relevance_score: 90,
    description: '大厂面试官亲自讲解，攻克算法难题，提升面试通过率',
    price: '￥599',
    rating: 4.9
  },
  {
    course_id: 'C005',
    title: 'CSS3 动画与响应式设计',
    provider: 'B 站学院',
    duration: '12 小时',
    difficulty: '初级',
    skills_covered: ['CSS3', '动画', '响应式'],
    relevance_score: 85,
    description: '掌握现代 CSS 技术，打造炫酷的网页效果和移动端适配',
    price: '免费',
    rating: 4.6
  },
  {
    course_id: 'C006',
    title: 'Vue3 + Vite 项目开发实战',
    provider: '慕课网',
    duration: '20 小时',
    difficulty: '中级',
    skills_covered: ['Vue3', 'Vite', '组件开发'],
    relevance_score: 87,
    description: '学习 Vue3 最新特性，使用 Vite 构建高效前端项目',
    price: '￥259',
    rating: 4.7
  },
  {
    course_id: 'C007',
    title: 'Git 版本控制与团队协作',
    provider: '极客时间',
    duration: '8 小时',
    difficulty: '初级',
    skills_covered: ['Git', '版本控制', '团队协作'],
    relevance_score: 82,
    description: '掌握 Git 核心命令，提升团队协作效率和代码管理能力',
    price: '￥99',
    rating: 4.5
  },
  {
    course_id: 'C008',
    title: '前端工程化与自动化部署',
    provider: '拉勾教育',
    duration: '16 小时',
    difficulty: '高级',
    skills_covered: ['Webpack', 'CI/CD', 'DevOps'],
    relevance_score: 89,
    description: '构建现代化前端工程体系，实现自动化构建和部署',
    price: '￥349',
    rating: 4.8
  }
]

// 模拟技能缺口数据
const mockSkillGaps = [
  {
    skill: 'React 性能优化',
    current_level: 60,
    required_level: 90,
    gap: 30,
    priority: 'high' as const,
    recommended_courses: ['C001']
  },
  {
    skill: 'TypeScript 高级类型',
    current_level: 50,
    required_level: 85,
    gap: 35,
    priority: 'high' as const,
    recommended_courses: ['C002']
  },
  {
    skill: 'Node.js 后端开发',
    current_level: 40,
    required_level: 80,
    gap: 40,
    priority: 'medium' as const,
    recommended_courses: ['C003']
  },
  {
    skill: '算法与数据结构',
    current_level: 65,
    required_level: 85,
    gap: 20,
    priority: 'medium' as const,
    recommended_courses: ['C004']
  },
  {
    skill: '前端工程化',
    current_level: 55,
    required_level: 75,
    gap: 20,
    priority: 'low' as const,
    recommended_courses: ['C008']
  }
]

// 模拟学习资料数据
const mockLearningMaterials = [
  {
    id: 'B001',
    title: '《JavaScript 高级程序设计（第 4 版）》',
    author: 'Nicholas C. Zakas',
    category: '前端基础',
    description: '前端开发经典红宝书，全面讲解 JavaScript 核心概念和高级特性',
    cover: '📕',
    rating: 4.9,
    pages: 576
  },
  {
    id: 'B002',
    title: '《深入浅出 React 和 Redux》',
    author: '程墨寒',
    category: '框架进阶',
    description: '深入理解 React 架构设计思想和 Redux 状态管理方案',
    cover: '📘',
    rating: 4.7,
    pages: 428
  },
  {
    id: 'B003',
    title: '《TypeScript 编程（第 2 版）》',
    author: 'Boris Cherny',
    category: '类型系统',
    description: '全面掌握 TypeScript 类型系统和高级编程技巧',
    cover: '📗',
    rating: 4.8,
    pages: 512
  },
  {
    id: 'B004',
    title: '《算法导论（第 3 版）》',
    author: 'Thomas H. Cormen',
    category: '算法基础',
    description: '算法领域经典教材，适合系统性学习和参考查阅',
    cover: '📙',
    rating: 4.9,
    pages: 1312
  },
  {
    id: 'B005',
    title: '《高性能 JavaScript》',
    author: 'Nicholas C. Zakas',
    category: '性能优化',
    description: '专注于 JavaScript 性能优化的实践指南',
    cover: '📔',
    rating: 4.6,
    pages: 234
  },
  {
    id: 'B006',
    title: '《前端架构设计》',
    author: 'Harry Roberts',
    category: '架构设计',
    description: '学习如何设计和维护大型前端项目的架构',
    cover: '📓',
    rating: 4.7,
    pages: 368
  }
]

// 模拟常用软件数据
const mockSoftwareTools = [
  {
    id: 'S001',
    name: 'Visual Studio Code',
    icon: <CodeOutlined />,
    description: '微软推出的免费开源代码编辑器，支持多种编程语言和丰富的插件生态系统，是前端开发的首选工具',
    category: '开发工具',
    officialWebsite: 'https://code.visualstudio.com/',
    features: ['智能代码补全', 'Git 集成', '丰富插件', '跨平台'],
    popular: true
  },
  {
    id: 'S002',
    name: 'WebStorm',
    icon: <DesktopOutlined />,
    description: 'JetBrains 出品的专业 JavaScript 和 TypeScript IDE，提供强大的代码分析、重构和调试功能',
    category: 'IDE',
    officialWebsite: 'https://www.jetbrains.com/webstorm/',
    features: ['智能导航', '代码重构', '内置终端', '版本控制'],
    popular: true
  },
  {
    id: 'S003',
    name: 'Node.js',
    icon: <CloudServerOutlined />,
    description: '基于 Chrome V8 引擎的 JavaScript 运行时环境，使 JavaScript 能够运行在服务器端，用于构建高性能后端应用',
    category: '运行时环境',
    officialWebsite: 'https://nodejs.org/',
    features: ['异步非阻塞', 'npm 包管理', '跨平台', '高性能'],
    popular: true
  },
  {
    id: 'S004',
    name: 'MongoDB',
    icon: <DatabaseOutlined />,
    description: '流行的 NoSQL 数据库，采用文档存储模型，灵活的模式设计适合快速迭代和敏捷开发',
    category: '数据库',
    officialWebsite: 'https://www.mongodb.com/',
    features: ['文档存储', '水平扩展', '高可用性', '灵活查询'],
    popular: false
  },
  {
    id: 'S005',
    name: 'Postman',
    icon: <ApiOutlined />,
    description: '强大的 API 开发和测试工具，支持请求构建、自动化测试、文档生成和团队协作',
    category: 'API 工具',
    officialWebsite: 'https://www.postman.com/',
    features: ['API 测试', '自动化', '文档生成', '团队协作'],
    popular: true
  },
  {
    id: 'S006',
    name: 'Git',
    icon: <GithubOutlined />,
    description: '分布式版本控制系统，用于跟踪代码变更、协作开发和版本管理，是现代软件开发的必备工具',
    category: '版本控制',
    officialWebsite: 'https://git-scm.com/',
    features: ['分布式管理', '分支管理', '代码追溯', '团队协作'],
    popular: true
  },
  {
    id: 'S007',
    name: 'Docker',
    icon: <CloudServerOutlined />,
    description: '容器化平台，将应用及其依赖打包到轻量级容器中，实现一次构建、到处运行',
    category: '容器技术',
    officialWebsite: 'https://www.docker.com/',
    features: ['容器隔离', '环境一致', '快速部署', '资源高效'],
    popular: false
  },
  {
    id: 'S008',
    name: 'Figma',
    icon: <DesktopOutlined />,
    description: '基于云端的协作设计工具，支持 UI/UX 设计、原型制作和设计系统管理，适合团队协作',
    category: '设计工具',
    officialWebsite: 'https://www.figma.com/',
    features: ['实时协作', '组件库', '原型设计', '设计系统'],
    popular: true
  }
]

export default function ResourcesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('courses')
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [skillGaps, setSkillGaps] = useState<any[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [materials] = useState<any[]>(mockLearningMaterials)
  const [softwareTools] = useState<any[]>(mockSoftwareTools)
  const [videoModalVisible, setVideoModalVisible] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [learnModalVisible, setLearnModalVisible] = useState(false)
  const [bookModalVisible, setBookModalVisible] = useState(false)
  const [selectedBook, setSelectedBook] = useState<any>(null)

  // 加载推荐课程
  useEffect(() => {
    if (activeTab === 'courses') {
      loadRecommendedCourses()
    }
  }, [activeTab])

  const loadRecommendedCourses = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCourses(mockCourses)
      setSkillGaps(mockSkillGaps)
    } catch (err: any) {
      setError(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      setCourses(mockCourses)
      return
    }
    
    setLoading(true)
    setSearchKeyword(value)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const filtered = mockCourses.filter(course => 
        course.title.toLowerCase().includes(value.toLowerCase()) ||
        course.skills_covered.some((skill: string) => 
          skill.toLowerCase().includes(value.toLowerCase())
        )
      )
      
      setCourses(filtered)
    } catch (err: any) {
      setError(err.message || '搜索失败')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (course: any) => {
    setSelectedCourse(course)
    setVideoModalVisible(true)
  }

  const handleStartLearning = (course: any) => {
    setSelectedCourse(course)
    setLearnModalVisible(true)
  }

  const handleAddToPlan = async (period: 'short' | 'long') => {
    if (!selectedCourse) return

    try {
      const taskData = {
        title: `学习：${selectedCourse.title}`,
        description: selectedCourse.description,
        category: 'course',
        priority: selectedCourse.relevance_score > 90 ? 'high' : 'medium',
        completed: false,
        period: period,
        courseId: selectedCourse.course_id,
        provider: selectedCourse.provider,
        duration: selectedCourse.duration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = await planService.createTask(taskData)
      
      if (result.success) {
        message.success(`已成功添加到${period === 'short' ? '近期任务' : '我的规划'}！`)
        setLearnModalVisible(false)
        setSelectedCourse(null)
      } else {
        message.error(result.error || '添加失败')
      }
    } catch (error: any) {
      message.error('添加失败，请重试')
    }
  }

  const getMockVideoLinks = (course: any) => {
    const mockLinks = [
      { title: '第 1 章：课程介绍与环境搭建', url: 'https://www.bilibili.com/video/BV1xx411c7mD', duration: '15:30' },
      { title: '第 2 章：核心概念详解', url: 'https://www.bilibili.com/video/BV1xx411c7mD', duration: '45:20' },
      { title: '第 3 章：实战项目演示', url: 'https://www.bilibili.com/video/BV1xx411c7mD', duration: '62:15' },
      { title: '第 4 章：高级技巧与最佳实践', url: 'https://www.bilibili.com/video/BV1xx411c7mD', duration: '38:45' },
      { title: '第 5 章：项目部署与总结', url: 'https://www.bilibili.com/video/BV1xx411c7mD', duration: '28:10' }
    ]
    return mockLinks
  }

  const handleViewBookDetails = (book: any) => {
    setSelectedBook(book)
    setBookModalVisible(true)
  }

  const getBookChapterPreview = (book: any) => {
    const chapterPreviews: Record<string, string[]> = {
      'B001': [
        '第 1 章 JavaScript 简介',
        '第 2 章 词法结构',
        '第 3 章 类型、值和变量',
        '第 4 章 表达式和运算符',
        '第 5 章 语句'
      ],
      'B002': [
        '第 1 章 React 和 Redux 概述',
        '第 2 章 React 基础',
        '第 3 章 Redux 核心概念',
        '第 4 章 React Router',
        '第 5 章 中间件'
      ],
      'B003': [
        '第 1 章 TypeScript 入门',
        '第 2 章 类型系统基础',
        '第 3 章 接口和类型别名',
        '第 4 章 泛型',
        '第 5 章 高级类型'
      ],
      'B004': [
        '第 1 章 算法在计算中的作用',
        '第 2 章 算法基础',
        '第 3 章 分治法',
        '第 4 章 概率分析和随机化算法',
        '第 5 章 堆排序'
      ],
      'B005': [
        '第 1 章 加载和执行',
        '第 2 章 DOM 编程',
        '第 3 章 事件',
        '第 4 章 选择器引擎',
        '第 5 章 动画与性能'
      ],
      'B006': [
        '第 1 章 什么是架构',
        '第 2 章 组件设计原则',
        '第 3 章 CSS 架构',
        '第 4 章 JavaScript 架构',
        '第 5 章 测试策略'
      ]
    }
    return chapterPreviews[book.id] || ['目录加载中...']
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'blue'
    }
  }

  const tabItems = [
    {
      key: 'courses',
      label: '推荐课程',
      children: (
        <div>
          {skillGaps.length > 0 && (
            <Card 
              title={
                <Space>
                  <FireOutlined />
                  您的技能缺口分析
                </Space>
              }
              className={styles.skillGapCard}
            >
              <Row gutter={[16, 16]}>
                {skillGaps.map((gap: any, index: number) => (
                  <Col xs={24} md={12} lg={8} key={index}>
                    <Card size="small">
                      <div className={styles.skillGapTitle}>
                        <strong>{gap.skill}</strong>
                        <Tag 
                          color={getPriorityColor(gap.priority)} 
                          className={styles.tagWithMargin}
                        >
                          {gap.priority === 'high' ? '高优先级' : 
                           gap.priority === 'medium' ? '中优先级' : '低优先级'}
                        </Tag>
                      </div>
                      <div className={styles.skillGapTitle}>
                        <Space size="small">
                          <span>当前：{gap.current_level}</span>
                          <span>→</span>
                          <span>要求：{gap.required_level}</span>
                        </Space>
                      </div>
                      <Progress 
                        percent={Math.round((gap.current_level / gap.required_level) * 100)}
                        status={gap.gap > 30 ? 'exception' : 'normal'}
                        size="small"
                      />
                      <div className={styles.skillGapProgress}>
                        缺口：{gap.gap}分
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          <Card 
            title={
              <Space>
                <BookOutlined />
                个性化课程推荐
              </Space>
            }
            extra={
              <Button 
                type="link" 
                onClick={loadRecommendedCourses}
                disabled={loading}
              >
                刷新推荐
              </Button>
            }
          >
            {error && (
              <Alert 
                message={error} 
                type="warning" 
                showIcon 
                className={styles.alertMessage}
              />
            )}
            
            {loading ? (
              <div className={styles.centerContent}>
                <Spin indicator={<LoadingOutlined spin />} />
                <div className={styles.loadingText}>正在为您推荐合适的课程...</div>
              </div>
            ) : courses.length > 0 ? (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
                dataSource={courses}
                renderItem={(course: any) => (
                  <List.Item>
                    <Card 
                      hoverable
                      className={styles.cardHover}
                      cover={
                        <div className={styles.courseCover}>
                          {course.provider}
                        </div>
                      }
                      actions={[
                        <Button 
                          key="view"
                          type="default" 
                          size="small"
                          block
                          icon={<PlayCircleOutlined />}
                          onClick={() => handleViewDetails(course)}
                        >
                          查看详情
                        </Button>,
                        <Button 
                          key="start"
                          type="primary" 
                          size="small"
                          block
                          icon={<CalendarOutlined />}
                          onClick={() => handleStartLearning(course)}
                        >
                          开始学习
                        </Button>
                      ]}
                    >
                      <Card.Meta
                        title={
                          <div>
                            {course.title}
                            {course.relevance_score > 80 && (
                              <Tag color="red" className={styles.highRecommendationTag}>高度推荐</Tag>
                            )}
                          </div>
                        }
                        description={
                          <div className={styles.courseDescription}>
                            <div className={styles.courseMetaSection}>
                              <Space size="small">
                                <StarOutlined />
                                <span>{course.rating || '4.5'}</span>
                                <ClockCircleOutlined />
                                <span>{course.duration}</span>
                              </Space>
                            </div>
                            <div className={styles.courseMetaSection}>
                              <Tag>{course.difficulty}</Tag>
                              {course.price && <Tag color="green">{course.price}</Tag>}
                            </div>
                            <div className={styles.courseDescriptionText}>
                              {course.description}
                            </div>
                            {course.skills_covered && course.skills_covered.length > 0 && (
                              <div className={styles.courseSkillsSection}>
                                <div className={styles.courseSkillsLabel}>
                                  涵盖技能:
                                </div>
                                <div>
                                  {course.skills_covered.slice(0, 3).map((skill: string, idx: number) => (
                                    <Tag key={idx} className={styles.skillTag}>{skill}</Tag>
                                  ))}
                                  {course.skills_covered.length > 3 && (
                                    <Tag className={styles.skillTag}>+{course.skills_covered.length - 3}更多</Tag>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <div className={styles.centerContent}>
                <BookOutlined className={styles.emptyStateIcon} />
                <Title level={4}>暂无推荐课程</Title>
                <Paragraph type="secondary">
                  完善您的职业偏好设置，获取更精准的课程推荐
                </Paragraph>
                <Space>
                  <Button 
                    type="primary"
                    onClick={() => router.push(ROUTES.ASSESSMENT)}
                  >
                    做职业测评
                  </Button>
                  <Button 
                    onClick={loadRecommendedCourses}
                  >
                    重新获取推荐
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        </div>
      )
    },
    {
      key: 'books',
      label: '学习资料',
      children: (
        <Card>
          <div className={styles.materialsGrid}>
            <Row gutter={[24, 24]}>
              {materials.map((material) => (
                <Col xs={24} sm={12} lg={8} key={material.id}>
                  <Card 
                    hoverable
                    className={styles.materialCard}
                    cover={
                      <div className={styles.bookCover}>
                        <div className={styles.bookCoverEmoji}>{material.cover}</div>
                      </div>
                    }
                    actions={[
                      <Button 
                        key="preview"
                        type="primary" 
                        size="small"
                        block
                        onClick={() => handleViewBookDetails(material)}
                      >
                        查看详情
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div className={styles.materialTitle}>
                          {material.title}
                        </div>
                      }
                      description={
                        <div className={styles.materialDescription}>
                          <div className={styles.materialMeta}>
                            <Space size="small">
                              <UserOutlined />
                              <span>{material.author}</span>
                            </Space>
                          </div>
                          <div className={styles.materialMeta}>
                            <Tag>{material.category}</Tag>
                            <Tag color="blue">{material.pages}页</Tag>
                          </div>
                          <div className={styles.materialMeta}>
                            <Space size="small">
                              <StarOutlined />
                              <span>{material.rating}</span>
                            </Space>
                          </div>
                          <div className={styles.materialDescText}>
                            {material.description}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Card>
      )
    },
    {
      key: 'tools',
      label: '实用工具',
      children: (
        <Card>
          <div className={styles.toolsGrid}>
            <Row gutter={[24, 24]}>
              {softwareTools.map((tool) => (
                <Col xs={24} sm={12} lg={8} key={tool.id}>
                  <Card 
                    hoverable
                    className={styles.toolCard}
                  >
                    <div className={styles.toolHeader}>
                      <div className={styles.toolIcon}>{tool.icon}</div>
                      {tool.popular && (
                        <Tag color="red" className={styles.toolPopularTag}>热门</Tag>
                      )}
                    </div>
                    <div className={styles.toolCategory}>
                      <Tag color="purple">{tool.category}</Tag>
                    </div>
                    <Title level={4} className={styles.toolTitle}>
                      {tool.name}
                    </Title>
                    <Paragraph 
                      type="secondary" 
                      className={styles.toolDescription}
                      ellipsis={{ rows: 3 }}
                    >
                      {tool.description}
                    </Paragraph>
                    <Divider className={styles.toolDivider} />
                    <div className={styles.toolFeatures}>
                      {tool.features.map((feature: string, idx: number) => (
                        <Tag key={idx} color="blue" className={styles.toolFeatureTag}>
                          {feature}
                        </Tag>
                      ))}
                    </div>
                    <div className={styles.toolAction}>
                      <Button 
                        type="primary" 
                        block
                        icon={<LinkOutlined />}
                        onClick={() => window.open(tool.officialWebsite, '_blank')}
                      >
                        了解详情
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            
            <Card className={styles.moreResourcesCard}>
              <div className={styles.moreResourcesContent}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Title level={4} style={{ marginBottom: 8 }}>
                      💡 发现更多开发工具
                    </Title>
                    <Paragraph type="secondary">
                      除了以上推荐的软件，还有众多优秀的开发工具可以帮助您提升效率
                    </Paragraph>
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col>
                      <Tag 
                        color="green" 
                        className={styles.resourceTag}
                        onClick={() => window.open('https://github.com/topics/developer-tools', '_blank')}
                        style={{ cursor: 'pointer' }}
                      >
                        GitHub 热门工具
                      </Tag>
                    </Col>
                    <Col>
                      <Tag 
                        color="cyan" 
                        className={styles.resourceTag}
                        onClick={() => window.open('https://producthunt.com', '_blank')}
                        style={{ cursor: 'pointer' }}
                      >
                        Product Hunt
                      </Tag>
                    </Col>
                    <Col>
                      <Tag 
                        color="orange" 
                        className={styles.resourceTag}
                        onClick={() => window.open('https://alternative.to', '_blank')}
                        style={{ cursor: 'pointer' }}
                      >
                        替代方案搜索
                      </Tag>
                    </Col>
                  </Row>
                </Space>
              </div>
            </Card>
          </div>
        </Card>
      )
    }
  ]

  return (
    <div className={styles.resourcesPage}>
      <PageHeader
        title="学习资源中心"
        subTitle="获取个性化的学习推荐和职业发展资源"
        extra={[
          <Search
            key="search"
            placeholder="搜索课程或技能..."
            onSearch={handleSearch}
            className={styles.searchBox}
            enterButton
          />,
          <Button 
            key="dashboard" 
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            返回仪表盘
          </Button>,
        ]}
      />

      <div className={styles.pageContent}>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems} 
        />
      </div>

      {/* 课程视频链接弹窗 */}
      <Modal
        title={
          <Space>
            <PlayCircleOutlined />
            <span>{selectedCourse?.title}</span>
          </Space>
        }
        open={videoModalVisible}
        onCancel={() => {
          setVideoModalVisible(false)
          setSelectedCourse(null)
        }}
        footer={[
          <Button 
            key="close"
            onClick={() => {
              setVideoModalVisible(false)
              setSelectedCourse(null)
            }}
          >
            关闭
          </Button>,
          <Button 
            key="start"
            type="primary"
            icon={<CalendarOutlined />}
            onClick={() => {
              setVideoModalVisible(false)
              setLearnModalVisible(true)
            }}
          >
            开始学习
          </Button>
        ]}
        width={800}
      >
        {selectedCourse && (
          <div>
            <div className={styles.videoModalSection}>
              <Title level={5}>课程信息</Title>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <strong>提供商：</strong>{selectedCourse.provider}
                </div>
                <div>
                  <strong>难度等级：</strong>
                  <Tag>{selectedCourse.difficulty}</Tag>
                </div>
                <div>
                  <strong>课程时长：</strong>{selectedCourse.duration}
                </div>
                <div>
                  <strong>课程价格：</strong>
                  <Tag color="green">{selectedCourse.price}</Tag>
                </div>
                <div>
                  <strong>课程评分：</strong>
                  <StarOutlined /> {selectedCourse.rating}
                </div>
                <div>
                  <strong>相关度：</strong>
                  <Progress 
                    percent={selectedCourse.relevance_score} 
                    size="small"
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    status="active"
                  />
                </div>
              </Space>
            </div>

            <Divider />

            <div className={styles.videoModalSection}>
              <Title level={5}>课程简介</Title>
              <Paragraph>{selectedCourse.description}</Paragraph>
            </div>

            <Divider />

            <div className={styles.videoModalSection}>
              <Title level={5}>推荐学习视频</Title>
              <List
                dataSource={getMockVideoLinks(selectedCourse)}
                renderItem={(item: any, index: number) => (
                  <List.Item
                    actions={[
                      <Button 
                        key="play"
                        type="link"
                        icon={<PlayCircleOutlined />}
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        立即观看
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={`${index + 1}. ${item.title}`}
                      description={
                        <Space>
                          <ClockCircleOutlined />
                          <span>{item.duration}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>

            {selectedCourse.skills_covered && selectedCourse.skills_covered.length > 0 && (
              <>
                <Divider />
                <div className={styles.videoModalSection}>
                  <Title level={5}>涵盖技能</Title>
                  <Space wrap>
                    {selectedCourse.skills_covered.map((skill: string, idx: number) => (
                      <Tag key={idx} color="blue">{skill}</Tag>
                    ))}
                  </Space>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 开始学习弹窗 */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>开始学习：{selectedCourse?.title}</span>
          </Space>
        }
        open={learnModalVisible}
        onCancel={() => {
          setLearnModalVisible(false)
          setSelectedCourse(null)
        }}
        footer={null}
      >
        <div className={styles.learnModalContent}>
          <Paragraph>
            选择您希望的学习周期，课程将自动添加到您的生涯规划中
          </Paragraph>
          
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} md={12}>
              <Card 
                hoverable
                className={styles.periodCard}
                onClick={() => handleAddToPlan('short')}
                style={{ 
                  borderColor: '#1890ff',
                  borderWidth: 2,
                  cursor: 'pointer'
                }}
              >
                <div className={styles.periodCardContent}>
                  <CheckCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                  <Title level={4}>短期学习</Title>
                  <Paragraph type="secondary">
                    适合快速入门或集中学习
                  </Paragraph>
                  <div className={styles.periodDescription}>
                    • 添加到近期任务
                    <br />
                    • 建议 1-2 周内完成
                    <br />
                    • 每天投入 1-2 小时
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card 
                hoverable
                className={styles.periodCard}
                onClick={() => handleAddToPlan('long')}
                style={{ 
                  borderColor: '#52c41a',
                  borderWidth: 2,
                  cursor: 'pointer'
                }}
              >
                <div className={styles.periodCardContent}>
                  <CalendarOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                  <Title level={4}>长期学习</Title>
                  <Paragraph type="secondary">
                    适合系统性深度学习
                  </Paragraph>
                  <div className={styles.periodDescription}>
                    • 添加到我的规划
                    <br />
                    • 建议 1-3 个月内完成
                    <br />
                    • 灵活安排学习时间
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Divider />

          <div className={styles.learnModalTips}>
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              💡 温馨提示：您可以随时在生涯规划页面查看和调整学习计划
            </Paragraph>
          </div>
        </div>
      </Modal>

      {/* 书籍详情弹窗 */}
      <Modal
        title={
          <Space>
            <span style={{ fontSize: 32 }}>{selectedBook?.cover}</span>
            <span>{selectedBook?.title}</span>
          </Space>
        }
        open={bookModalVisible}
        onCancel={() => {
          setBookModalVisible(false)
          setSelectedBook(null)
        }}
        footer={[
          <Button 
            key="close"
            onClick={() => {
              setBookModalVisible(false)
              setSelectedBook(null)
            }}
          >
            关闭
          </Button>,
          <Button 
            key="add"
            type="primary"
            icon={<BookOutlined />}
            onClick={() => {
              message.success('已添加到我的书架')
              setBookModalVisible(false)
              setSelectedBook(null)
            }}
          >
            加入书架
          </Button>
        ]}
        width={800}
      >
        {selectedBook && (
          <div>
            <div className={styles.bookModalSection}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <div className={styles.bookCoverLarge}>
                    <div className={styles.bookCoverEmojiLarge}>{selectedBook.cover}</div>
                  </div>
                </Col>
                <Col xs={24} md={16}>
                  <div className={styles.bookInfoSection}>
                    <Title level={4} style={{ marginBottom: 16 }}>
                      {selectedBook.title}
                    </Title>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div className={styles.bookInfoItem}>
                        <UserOutlined /> <strong>作者：</strong>{selectedBook.author}
                      </div>
                      <div className={styles.bookInfoItem}>
                        <BookOutlined /> <strong>分类：</strong>
                        <Tag color="blue" style={{ marginLeft: 8 }}>{selectedBook.category}</Tag>
                      </div>
                      <div className={styles.bookInfoItem}>
                        <ClockCircleOutlined /> <strong>页数：</strong>{selectedBook.pages}页
                      </div>
                      <div className={styles.bookInfoItem}>
                        <StarOutlined /> <strong>评分：</strong>
                        <span style={{ color: '#faad14', fontWeight: 600 }}>{selectedBook.rating}</span>
                      </div>
                    </Space>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className={styles.bookModalSection}>
              <Title level={5}>📖 内容简介</Title>
              <Paragraph className={styles.bookDescription}>
                {selectedBook.description}
              </Paragraph>
            </div>

            <Divider />

            <div className={styles.bookModalSection}>
              <Title level={5}>📑 目录预览</Title>
              <List
                dataSource={getBookChapterPreview(selectedBook)}
                renderItem={(chapter: string, index: number) => (
                  <List.Item className={styles.chapterItem}>
                    <Space>
                      <div className={styles.chapterNumber}>{index + 1}</div>
                      <span>{chapter}</span>
                    </Space>
                  </List.Item>
                )}
              />
            </div>

            <Divider />

            <div className={styles.bookModalSection}>
              <Title level={5}>💡 推荐阅读人群</Title>
              <Space wrap>
                {selectedBook.category === '前端基础' && (
                  <>
                    <Tag color="green">前端初学者</Tag>
                    <Tag color="blue">JavaScript 开发者</Tag>
                    <Tag color="cyan">转行人员</Tag>
                  </>
                )}
                {selectedBook.category === '框架进阶' && (
                  <>
                    <Tag color="orange">React 开发者</Tag>
                    <Tag color="purple">前端工程师</Tag>
                    <Tag color="red">架构师</Tag>
                  </>
                )}
                {selectedBook.category === '类型系统' && (
                  <>
                    <Tag color="blue">TypeScript 用户</Tag>
                    <Tag color="cyan">大型项目开发者</Tag>
                    <Tag color="green">代码质量追求者</Tag>
                  </>
                )}
                {selectedBook.category === '算法基础' && (
                  <>
                    <Tag color="red">面试准备者</Tag>
                    <Tag color="orange">计算机专业学生</Tag>
                    <Tag color="purple">算法爱好者</Tag>
                  </>
                )}
                {selectedBook.category === '性能优化' && (
                  <>
                    <Tag color="gold">性能优化师</Tag>
                    <Tag color="blue">资深前端开发</Tag>
                    <Tag color="green">技术负责人</Tag>
                  </>
                )}
                {selectedBook.category === '架构设计' && (
                  <>
                    <Tag color="purple">技术架构师</Tag>
                    <Tag color="red">Tech Lead</Tag>
                    <Tag color="orange">高级工程师</Tag>
                  </>
                )}
              </Space>
            </div>

            <Divider />

            <div className={styles.bookModalSection}>
              <Title level={5}>🎯 学习建议</Title>
              <div className={styles.learningTips}>
                <Paragraph>
                  • 建议按章节顺序阅读，每章配合实际代码练习
                  <br />
                  • 重点章节可做笔记，便于后续复习查阅
                  <br />
                  • 完成每章的练习题，巩固所学知识
                  <br />
                  • 加入读书群或论坛，与其他读者交流讨论
                </Paragraph>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}