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
  Select,
  Divider
} from 'antd'
import { 
  BookOutlined,
  SearchOutlined,
  LoadingOutlined,
  FireOutlined,
  StarOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'
import { learningService } from '@/app/services/learningService'
import { useEffect, useState } from 'react'
import styles from './resources.module.css'

const { Title, Paragraph } = Typography
const { Search } = Input
const { Option } = Select

export default function ResourcesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('courses')
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [skillGaps, setSkillGaps] = useState<any[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [error, setError] = useState<string | null>(null)

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
      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录以获取个性化推荐')
        setLoading(false)
        return
      }

      // 获取用户感兴趣的职业（可以从用户档案中获取）
      const targetJobs = ['J2024001', 'J2024002'] // 示例职业ID
      
      const response = await learningService.getRecommendedCourses(targetJobs, 8)

      if (response.success && response.data) {
        setCourses(response.data.courses)
        setSkillGaps(response.data.skill_gaps)
      } else {
        setError(response.error || '获取推荐失败')
      }
    } catch (err: any) {
      setError(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (value: string) => {
    if (!value.trim()) return
    
    setLoading(true)
    setSearchKeyword(value)
    
    try {
      const response = await learningService.searchCourses(value)
      if (response.success && response.data) {
        setCourses(response.data)
      }
    } catch (err: any) {
      setError(err.message || '搜索失败')
    } finally {
      setLoading(false)
    }
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
          {/* 技能缺口分析 */}
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
                          <span>当前: {gap.current_level}</span>
                          <span>→</span>
                          <span>要求: {gap.required_level}</span>
                        </Space>
                      </div>
                      <Progress 
                        percent={Math.round((gap.current_level / gap.required_level) * 100)}
                        status={gap.gap > 30 ? 'exception' : 'normal'}
                        size="small"
                      />
                      <div className={styles.skillGapProgress}>
                        缺口: {gap.gap}分
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {/* 课程推荐列表 */}
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
                          type="primary" 
                          size="small"
                          block
                          onClick={() => router.push(`/course/${course.course_id}`)}
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
          <div className={styles.centerContent}>
            <BookOutlined className={styles.bookIcon} />
            <Title level={3}>学习资料库</Title>
            <Paragraph type="secondary" className={styles.paragraphSecondary}>
              精选的学习资料和参考书籍
            </Paragraph>
            <Button 
              type="primary" 
              size="large"
              onClick={() => router.push('/resources/library')}
            >
              浏览资料库
            </Button>
          </div>
        </Card>
      )
    },
    {
      key: 'tools',
      label: '实用工具',
      children: (
        <Card>
          <div className={styles.centerContent}>
            <UserOutlined className={styles.userIcon} />
            <Title level={3}>职业发展工具</Title>
            <Paragraph type="secondary" className={styles.paragraphSecondary}>
              提升职业技能的实用工具和资源
            </Paragraph>
            <Space>
              <Button 
                size="large"
                onClick={() => router.push('/resources/resume-builder')}
              >
                简历制作
              </Button>
              <Button 
                size="large"
                onClick={() => router.push('/resources/interview-practice')}
              >
                面试练习
              </Button>
            </Space>
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
    </div>
  )
}