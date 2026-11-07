//职业探索页面
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
  Divider,
  Tag,
  Statistic,
  message,
  Empty,
  Modal,
  Descriptions
} from 'antd'
import { 
  RocketOutlined,
  AimOutlined,
  CompressOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
  WarningOutlined,
  StarOutlined,
  ReloadOutlined,
  UserOutlined,
  BankOutlined,
  DollarOutlined,
  LineChartOutlined,
  BulbOutlined,
  RobotOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'
import { aiService, recommendationService } from '@/app/services/recommendationService'
import { useEffect, useState } from 'react'
import styles from './career.module.css'

const { Title, Paragraph } = Typography

import LoginRequired, { useLoginGuard } from '@/app/components/LoginRequired'

export default function CareerPage() {
  const { checked, needLogin } = useLoginGuard()
  if (!checked) return null
  if (needLogin) return <LoginRequired pageName="职业探索结果" />
  return <CareerPageInner />
}

function CareerPageInner() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [careerPaths, setCareerPaths] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('recommendations')
  const [error, setError] = useState<string | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedCareer, setSelectedCareer] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiReason, setAiReason] = useState('')

  // 加载职业路径推荐数据
  useEffect(() => {
    loadCareerPathRecommendations()
  }, [])

  const loadCareerPathRecommendations = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 从localStorage获取用户信息
      const token = localStorage.getItem('token')
      if (!token) {
        message.info('当前未登录，已加载演示数据。登录后可查看后端最新职业路径推荐。')
        loadMockData()
        return
      }

      // 调用后端API获取推荐
      const response = await recommendationService.getCareerPathRecommendations(undefined, 10)
      
      if (response.success && response.data) {
        setCareerPaths(response.data)
        message.success(`成功加载 ${response.data.length} 条职业路径推荐`)
      } else {
        throw new Error(response.error || '获取职业路径推荐失败')
      }
    } catch (error: any) {
      console.error('加载职业路径失败:', error)
      setError(error.message)
      // 使用mock数据作为备选
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    const mockPaths = [
      {
        path_id: 'path_001',
        path_name: '前端开发工程师',
        fit_score: 85.5,
        path_details: {
          description: '专注于用户界面开发，使用现代前端技术栈构建优秀的 Web 应用体验',
          holland_codes: ['I', 'A', 'S'],
          average_salary: '15K-25K/月',
          growth_potential: '高',
          typical_companies: ['阿里巴巴', '腾讯', '字节跳动', '百度'],
          required_education: '本科及以上'
        },
        personalized_plan: {
          immediate_steps: [
            '深入学习 React/Vue 框架核心原理',
            '完成 3 个完整的前端项目作品集',
            '掌握前端性能优化技巧'
          ]
        },
        short_reason: '与你的霍兰德代码 IAS 高度匹配，且技能匹配度达 85%'
      },
      {
        path_id: 'path_002',
        path_name: '数据分析师',
        fit_score: 78.2,
        path_details: {
          description: '通过数据分析为企业决策提供数据支持，挖掘业务价值',
          holland_codes: ['I', 'C', 'S'],
          average_salary: '12K-20K/月',
          growth_potential: '中高',
          typical_companies: ['金融公司', '电商平台', '咨询公司'],
          required_education: '本科及以上'
        },
        personalized_plan: {
          immediate_steps: [
            '掌握 Python 数据分析库 (Pandas,Numpy)',
            '学习 SQL 数据库查询优化',
            '完成商业分析案例实践'
          ]
        },
        short_reason: '符合你的兴趣类型，行业发展前景良好'
      },
      {
        path_id: 'path_003',
        path_name: '产品经理',
        fit_score: 72.8,
        path_details: {
          description: '负责产品规划、需求分析和项目管理，连接用户需求与技术实现',
          holland_codes: ['E', 'S', 'C'],
          average_salary: '18K-30K/月',
          growth_potential: '高',
          typical_companies: ['互联网公司', '科技创业公司', '传统企业数字化部门'],
          required_education: '本科及以上'
        },
        personalized_plan: {
          immediate_steps: [
            '学习产品设计方法论',
            '掌握 Axure、Figma 等原型工具',
            '参与实际产品项目'
          ]
        },
        short_reason: '发挥你的沟通优势，薪资增长空间大'
      },
      {
        path_id: 'path_004',
        path_name: '人工智能工程师',
        fit_score: 68.5,
        path_details: {
          description: '从事机器学习、深度学习算法研发，推动 AI 技术在各领域的应用',
          holland_codes: ['I', 'R', 'C'],
          average_salary: '20K-40K/月',
          growth_potential: '很高',
          typical_companies: ['头部 AI 公司', '科研院所', '大型互联网企业'],
          required_education: '硕士及以上'
        },
        personalized_plan: {
          immediate_steps: [
            '深入学习机器学习理论基础',
            '掌握 TensorFlow/PyTorch 框架',
            '完成 AI 项目实战'
          ]
        },
        short_reason: '前沿技术领域，长期发展潜力巨大'
      }
    ]
    setCareerPaths(mockPaths)
  }
   // 添加职业浏览数据
  const careerCategories = [
    {
      category: '技术类',
      careers: [
        {
          id: 'tech_001',
          name: '软件工程师',
          description: '设计、开发和维护软件应用程序的专业人员',
          avg_salary: '12K-25K/月',
          education_req: '本科及以上',
          skills: ['编程语言', '算法', '系统设计', '数据库'],
          companies: ['互联网公司', '软件公司', '金融科技'],
          growth_potential: '高',
          holland_codes: ['I', 'R']
        },
        {
          id: 'tech_002',
          name: '数据科学家',
          description: '运用统计学、数学和计算机技能分析复杂数据的专业人员',
          avg_salary: '18K-35K/月',
          education_req: '硕士及以上',
          skills: ['机器学习', '统计学', 'Python/R', '大数据处理'],
          companies: ['科技公司', '咨询公司', '金融企业'],
          growth_potential: '很高',
          holland_codes: ['I', 'C']
        },
        {
          id: 'tech_003',
          name: '网络安全专家',
          description: '保护组织的数字资产免受网络攻击和安全威胁',
          avg_salary: '15K-30K/月',
          education_req: '本科及以上',
          skills: ['安全协议', '漏洞分析', '加密技术', '风险评估'],
          companies: ['网络安全公司', '金融机构', '政府机构'],
          growth_potential: '高',
          holland_codes: ['I', 'C']
        },
        {
          id: 'tech_004',
          name: 'DevOps工程师',
          description: '负责软件开发、测试和运维流程的自动化与集成',
          avg_salary: '16K-32K/月',
          education_req: '本科及以上',
          skills: ['CI/CD', '容器技术', '云平台', '脚本编程'],
          companies: ['云计算公司', '互联网企业', '科技公司'],
          growth_potential: '高',
          holland_codes: ['I', 'R']
        }
      ]
    },
    {
      category: '商业类',
      careers: [
        {
          id: 'biz_001',
          name: '市场营销经理',
          description: '负责制定和实施公司的市场推广策略',
          avg_salary: '10K-25K/月',
          education_req: '本科及以上',
          skills: ['市场分析', '品牌管理', '数字营销', '客户关系'],
          companies: ['消费品公司', '广告公司', '咨询公司'],
          growth_potential: '中高',
          holland_codes: ['E', 'S']
        },
        {
          id: 'biz_002',
          name: '财务分析师',
          description: '评估投资机会，分析财务数据，为决策提供支持',
          avg_salary: '10K-20K/月',
          education_req: '本科及以上',
          skills: ['财务建模', '数据分析', '投资评估', '风险管理'],
          companies: ['银行', '证券公司', '会计师事务所'],
          growth_potential: '中',
          holland_codes: ['C', 'I']
        },
        {
          id: 'biz_003',
          name: '人力资源专员',
          description: '负责招聘、培训、员工关系和绩效管理等工作',
          avg_salary: '8K-18K/月',
          education_req: '本科及以上',
          skills: ['招聘', '培训', '绩效管理', '沟通技巧'],
          companies: ['各类企业', '人力资源公司', '咨询公司'],
          growth_potential: '中',
          holland_codes: ['S', 'E']
        },
        {
          id: 'biz_004',
          name: '管理咨询师',
          description: '为企业提供战略、运营和管理方面的咨询服务',
          avg_salary: '15K-35K/月',
          education_req: '硕士及以上',
          skills: ['战略规划', '数据分析', '问题解决', '沟通表达'],
          companies: ['咨询公司', '四大会计师事务所', '专业咨询机构'],
          growth_potential: '高',
          holland_codes: ['I', 'E']
        }
      ]
    },
    {
      category: '创意类',
      careers: [
        {
          id: 'creative_001',
          name: 'UI/UX设计师',
          description: '设计用户界面和用户体验，提升产品的易用性和美观性',
          avg_salary: '12K-25K/月',
          education_req: '专科及以上',
          skills: ['用户研究', '原型设计', '视觉设计', '交互设计'],
          companies: ['互联网公司', '设计工作室', '广告公司'],
          growth_potential: '中高',
          holland_codes: ['A', 'S']
        },
        {
          id: 'creative_002',
          name: '平面设计师',
          description: '通过视觉元素传达信息，创造视觉设计方案',
          avg_salary: '8K-18K/月',
          education_req: '专科及以上',
          skills: ['Adobe套件', '排版设计', '色彩理论', '品牌设计'],
          companies: ['广告公司', '设计公司', '媒体机构'],
          growth_potential: '中',
          holland_codes: ['A', 'S']
        },
        {
          id: 'creative_003',
          name: '产品经理',
          description: '负责产品规划、需求分析和项目管理，连接用户需求与技术实现',
          avg_salary: '18K-35K/月',
          education_req: '本科及以上',
          skills: ['需求分析', '项目管理', '数据分析', '用户研究'],
          companies: ['互联网公司', '科技创业公司', '传统企业'],
          growth_potential: '高',
          holland_codes: ['E', 'S', 'C']
        },
        {
          id: 'creative_004',
          name: '内容创作者',
          description: '创作文字、视频、音频等内容，传播信息和价值观',
          avg_salary: '8K-20K/月',
          education_req: '本科及以上',
          skills: ['写作', '视频制作', '社交媒体', '创意策划'],
          companies: ['媒体公司', 'MCN机构', '自媒体'],
          growth_potential: '中高',
          holland_codes: ['A', 'S']
        }
      ]
    },
    {
      category: '教育类',
      careers: [
        {
          id: 'edu_001',
          name: '大学教授',
          description: '从事高等教育教学和学术研究工作',
          avg_salary: '15K-40K/月',
          education_req: '博士及以上',
          skills: ['学科专业知识', '教学法', '科研能力', '学术写作'],
          companies: ['高等院校', '科研院所', '教育机构'],
          growth_potential: '高',
          holland_codes: ['I', 'S']
        },
        {
          id: 'edu_002',
          name: '中学教师',
          description: '负责中学生的学科教学和成长指导',
          avg_salary: '6K-15K/月',
          education_req: '本科及以上',
          skills: ['学科知识', '教学技巧', '学生管理', '沟通能力'],
          companies: ['公立学校', '私立学校', '培训机构'],
          growth_potential: '中',
          holland_codes: ['S', 'C']
        },
        {
          id: 'edu_003',
          name: '培训师',
          description: '为企业和个人提供专业技能培训和发展指导',
          avg_salary: '10K-25K/月',
          education_req: '本科及以上',
          skills: ['培训设计', '演讲技巧', '课程开发', '成人学习理论'],
          companies: ['培训机构', '企业大学', '咨询公司'],
          growth_potential: '中高',
          holland_codes: ['S', 'E']
        },
        {
          id: 'edu_004',
          name: '教育顾问',
          description: '为学生提供升学、留学和职业规划咨询服务',
          avg_salary: '12K-25K/月',
          education_req: '本科及以上',
          skills: ['教育政策', '升学指导', '留学规划', '心理咨询'],
          companies: ['留学中介', '教育咨询公司', '国际学校'],
          growth_potential: '中高',
          holland_codes: ['S', 'C']
        }
      ]
    }
  ];

  const getHollandDescription = (codes: string[]) => {
    const descriptions: Record<string, string> = {
      'R': '现实型 - 喜欢使用工具、机器，需要基本操作技能的工作',
      'I': '研究型 - 喜欢思考、研究，需要动脑筋的工作',
      'A': '艺术型 - 喜欢创造、表现，需要想象力和创造力的工作',
      'S': '社会型 - 喜欢与人打交道，需要人际交往能力的工作',
      'E': '企业型 - 喜欢领导、管理，需要说服他人能力的工作',
      'C': '常规型 - 喜欢有秩序、规则明确的工作'
    }
    return codes.map(code => descriptions[code] || code).join('; ')
  }

  const getMatchLevel = (score: number) => {
    if (score >= 80) return { text: '强烈推荐', color: 'red' }
    if (score >= 70) return { text: '推荐', color: 'orange' }
    if (score >= 60) return { text: '一般匹配', color: 'blue' }
    return { text: '较低匹配', color: 'gray' }
  }

  const generateAIReason = async (career: any) => {
    setAiLoading(true)
    try {
      const prompt = `请为以下职业推荐生成详细的推荐理由：
        
职业名称：${career.path_name}
匹配度：${career.fit_score}%
霍兰德代码：${career.path_details?.holland_codes?.join(',')}
平均薪资：${career.path_details?.average_salary}
发展前景：${career.path_details?.growth_potential}
学历要求：${career.path_details?.required_education}
典型雇主：${career.path_details?.typical_companies?.join(',')}

请从以下几个方面分析：
1. 为什么这个职业适合该学生（结合霍兰德代码和兴趣匹配）
2. 职业发展优势和前景
3. 薪资水平和增长空间
4. 需要重点提升的技能
5. 具体的发展建议

请用中文回答，语气专业且鼓励性。`

      const response = await aiService.chat(prompt, [])
      
      if (response.success && response.data) {
        setAiReason(response.data.reply)
      } else {
        throw new Error(response.error || 'AI 服务失败')
      }
    } catch (err: any) {
      console.error('生成 AI 推荐理由失败:', err)
      setAiReason(err?.message || '暂时无法生成详细分析，请稍后重试。')
      message.error(err?.message || 'AI 服务暂时不可用')
    } finally {
      setAiLoading(false)
    }
  }

  const handleShowDetail = (career: any) => {
    setSelectedCareer(career)
    setDetailModalVisible(true)
    setAiReason('')
    generateAIReason(career)
  }

  const renderCareerPathCard = (path: any) => {
    const matchLevel = getMatchLevel(path.fit_score)
    
    return (
      <Card 
        key={path.path_id}
        hoverable
        className={styles.cardMargin}
        actions={[
          <Button 
            type="primary" 
            size="small"
            onClick={() => router.push(`${ROUTES.PLAN_CREATE}?career=${path.path_id}`)}
          >
            制定规划
          </Button>,
          <Button 
            size="small"
            onClick={() => handleShowDetail(path)}
          >
            详情
          </Button>
        ]}
      >
        <Card.Meta
          title={
            <Space>
              <span>{path.path_name}</span>
              <Tag color={matchLevel.color}>{matchLevel.text}</Tag>
              <Tag color="gold">
                <StarOutlined /> {(path.fit_score || 0).toFixed(1)}%
              </Tag>
            </Space>
          }
          description={
            <Space orientation="vertical" style={{ width: '100%' }}>
              <Paragraph ellipsis={{ rows: 2 }}>{path.path_details?.description}</Paragraph>
              
              <Space wrap>
                <Tag icon={<DollarOutlined />}>{path.path_details?.average_salary || '面议'}</Tag>
                <Tag icon={<LineChartOutlined />}>{path.path_details?.growth_potential || '良好'}</Tag>
                <Tag icon={<BankOutlined />}>{path.path_details?.required_education || '不限'}</Tag>
              </Space>
              
              <div>
                <strong>霍兰德类型:</strong>
                <Space wrap style={{ marginTop: 8 }}>
                  {path.path_details?.holland_codes?.map((code: string, idx: number) => (
                    <Tag key={idx} color="blue">{code}</Tag>
                  ))}
                </Space>
                <div className={styles.smallText}>
                  {getHollandDescription(path.path_details?.holland_codes || [])}
                </div>
              </div>
              
              {path.path_details?.typical_companies && (
                <div>
                  <strong>典型雇主:</strong>
                  <div className={styles.marginTop}>
                    {path.path_details.typical_companies.slice(0, 3).map((company: string, idx: number) => (
                      <Tag key={idx} color="green">{company}</Tag>
                    ))}
                  </div>
                </div>
              )}
              
              {path.personalized_plan?.immediate_steps && (
                <div>
                  <strong>发展建议:</strong>
                  <ul className={styles.suggestionList}>
                    {path.personalized_plan.immediate_steps.slice(0, 2).map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {path.short_reason && (
                <div className={styles.reasonBox}>
                  <div className={styles.reasonTitle}>
                    <BulbOutlined /> 推荐理由
                  </div>
                  <div className={styles.reasonContent}>{path.short_reason}</div>
                </div>
              )}
            </Space>
          }
        />
      </Card>
    )
  }


  const renderCareerCard = (career: any) => (
    <Card
      key={career.id}
      hoverable
      className={styles.browseCard}
      onClick={() => message.info(`即将跳转到${career.name}详情页`)}
    >
      <Card.Meta
        title={
          <Space>
            <span>{career.name}</span>
            <Tag color="blue">{career.avg_salary}</Tag>
          </Space>
        }
        description={
          <Space orientation="vertical" style={{ width: '100%' }}>
            <Paragraph ellipsis={{ rows: 2 }}>{career.description}</Paragraph>
            <Divider style={{ margin: '12px 0' }} />
            <div>
              <div className={styles.detailRow}>
                <strong>学历要求:</strong> {career.education_req}
              </div>
              <div className={styles.detailRow}>
                <strong>发展前景:</strong> {career.growth_potential}
              </div>
            </div>
            <div className={styles.detailSection}>
              <strong>核心技能:</strong>
              <div className={styles.skillTags}>
                {career.skills.slice(0, 4).map((skill: string, idx: number) => (
                  <Tag key={idx} color="default">{skill}</Tag>
                ))}
              </div>
            </div>
            <div className={styles.detailSection}>
              <strong>典型雇主:</strong>
              <div className={styles.companyTags}>
                {career.companies.slice(0, 3).map((company: string, idx: number) => (
                  <Tag key={idx} color="green">{company}</Tag>
                ))}
              </div>
            </div>
            <div className={styles.detailSection}>
              <strong>霍兰德代码:</strong>
              <Space wrap style={{ marginTop: 4 }}>
                {career.holland_codes.map((code: string, idx: number) => (
                  <Tag key={idx} color="geekblue">{code}</Tag>
                ))}
              </Space>
            </div>
          </Space>
        }
      />
    </Card>
  );

  const renderCareerCategory = (category: any) => (
    <div key={category.category}>
      <Title level={4} className={styles.categoryTitle}>
        {category.category}
      </Title>
      <Row gutter={[24, 24]}>
        {category.careers.map((career: any) => (
          <Col key={career.id} xs={24} sm={12} md={12} lg={6}>
            {renderCareerCard(career)}
          </Col>
        ))}
      </Row>
    </div>
  );

  return (
    <div className={styles.careerPage}>
      <PageHeader
        title="职业探索"
        subTitle="发现适合你的职业发展方向"
        extra={[
          <Button 
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={loadCareerPathRecommendations}
            loading={loading}
          >
            刷新推荐
          </Button>,
          <Button 
            key="assessment"
            type="primary"
            onClick={() => router.push(ROUTES.ASSESSMENT)}
          >
            重新测评
          </Button>
        ]}
      />

      {error && (
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          className={styles.alertMargin}
        />
      )}

      <div className={styles.pageContent}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'recommendations',
              label: (
                <span>
                  <RocketOutlined />
                  智能推荐
                </span>
              ),
              children: (
                <div>
                  {loading ? (
                    <div className={styles.centerContent}>
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                      <div className={styles.loadingText}>正在分析你的职业匹配度...</div>
                    </div>
                  ) : careerPaths.length > 0 ? (
                    <div>
                      <Row gutter={[24, 24]}>
                        <Col span={24}>
                          <Card title="推荐统计" className={styles.cardMargin}>
                            <Row gutter={16}>
                              <Col span={6}>
                                <Statistic 
                                  title="总推荐数" 
                                  value={careerPaths.length} 
                                  prefix={<RocketOutlined />}
                                />
                              </Col>
                              <Col span={6}>
                                <Statistic 
                                  title="强烈推荐" 
                                  value={careerPaths.filter(p => p.fit_score >= 80).length} 
                                  prefix={<StarOutlined />}
                                  styles={{ content: {  color: '#ff4d4f'  } }}
                                />
                              </Col>
                              <Col span={6}>
                                <Statistic 
                                  title="高薪职位" 
                                  value={careerPaths.filter(p => {
                                    const salary = p.path_details?.average_salary || ''
                                    return salary.includes('20K') || salary.includes('25K') || salary.includes('30K')
                                  }).length} 
                                  prefix={<DollarOutlined />}
                                />
                              </Col>
                              <Col span={6}>
                                <Statistic 
                                  title="平均匹配度" 
                                  value={Math.round(careerPaths.reduce((sum, p) => sum + (p.fit_score || 0), 0) / careerPaths.length)} 
                                  suffix="%"
                                  prefix={<AimOutlined />}
                                />
                              </Col>
                            </Row>
                          </Card>
                        </Col>
                        
                        <Col span={24}>
                          <div className={styles.listContainer}>
                            <Title level={4}>
                              <Space>
                                <AimOutlined />
                                为你推荐的职业路径
                              </Space>
                            </Title>
                            <Row gutter={[24, 24]}>
                              {careerPaths
                                .sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0))
                                .map(path => (
                                  <Col key={path.path_id} span={12}>
                                    {renderCareerPathCard(path)}
                                  </Col>
                                ))
                              }
                            </Row>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="暂无职业推荐数据"
                    >
                      <Space>
                        <Button 
                          type="primary"
                          onClick={() => router.push(ROUTES.ASSESSMENT)}
                        >
                          开始职业测评
                        </Button>
                        <Button 
                          onClick={loadMockData}
                        >
                          查看示例数据
                        </Button>
                      </Space>
                    </Empty>
                  )}
                </div>
              )
            },
            {
              key: 'explore',
              label: (
                <span>
                  <CompressOutlined />
                  职业浏览
                </span>
              ),
              children: (
                <div className={styles.exploreContainer}>
                  <Title level={3} className={styles.exploreTitle}>
                    <Space>
                      <CompressOutlined />
                      浏览热门职业
                    </Space>
                  </Title>
                  <Paragraph className={styles.exploreSubtitle}>
                    探索不同领域的职业发展机会，了解各行业的职位要求和发展前景
                  </Paragraph>
                  
                  <div className={styles.searchControls}>
                    <Space wrap>
                      <Tag color="blue">技术类</Tag>
                      <Tag color="green">商业类</Tag>
                      <Tag color="orange">创意类</Tag>
                      <Tag color="purple">教育类</Tag>
                      <Tag color="magenta">医疗类</Tag>
                      <Tag color="volcano">公共服务</Tag>
                    </Space>
                  </div>
                  
                  <Divider />
                  
                  <div className={styles.categoriesContainer}>
                    {careerCategories.map(renderCareerCategory)}
                  </div>
                </div>
              )
            },
            {
              key: 'compare',
              label: (
                <span>
                  <ArrowRightOutlined />
                  职业对比
                </span>
              ),
              children: (
                <div className={styles.centerContent}>
                  <Title level={3}>职业对比功能开发中</Title>
                  <Paragraph>
                    在这里你可以对比不同职业的特点、薪资、发展前景等信息。
                  </Paragraph>
                  <Button 
                    type="primary"
                    onClick={() => setActiveTab('recommendations')}
                  >
                    返回推荐页面
                  </Button>
                </div>
              )
            }
          ]}
        />
      </div>
       {/* 详情对话框 */}
      <Modal
        title={
          <Space>
            <span>{selectedCareer?.path_name || '职业详情'}</span>
            <Tag color={selectedCareer ? getMatchLevel(selectedCareer.fit_score).color : ''}>
              {selectedCareer ? getMatchLevel(selectedCareer.fit_score).text : ''}
            </Tag>
            <Tag color="gold">
              <StarOutlined /> {selectedCareer ? (selectedCareer.fit_score || 0).toFixed(1) : 0}%
            </Tag>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="plan"
            type="primary"
            onClick={() => {
              setDetailModalVisible(false)
              router.push(`${ROUTES.PLAN_CREATE}?career=${selectedCareer?.path_id}`)
            }}
          >
            制定规划
          </Button>
        ]}
        width={800}
      >
        {selectedCareer && (
          <Space orientation="vertical" style={{ width: '100%' }} size="large">
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="职业名称">{selectedCareer.path_name}</Descriptions.Item>
              <Descriptions.Item label="匹配度">
                <Tag color="gold"><StarOutlined /> {selectedCareer.fit_score.toFixed(1)}%</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="平均薪资" span={2}>
                <DollarOutlined /> {selectedCareer.path_details?.average_salary || '面议'}
              </Descriptions.Item>
              <Descriptions.Item label="发展前景" span={2}>
                <LineChartOutlined /> {selectedCareer.path_details?.growth_potential || '良好'}
              </Descriptions.Item>
              <Descriptions.Item label="学历要求" span={2}>
                <BankOutlined /> {selectedCareer.path_details?.required_education || '不限'}
              </Descriptions.Item>
              <Descriptions.Item label="霍兰德代码" span={2}>
                <Space wrap>
                  {selectedCareer.path_details?.holland_codes?.map((code: string, idx: number) => (
                    <Tag key={idx} color="blue">{code}</Tag>
                  ))}
                </Space>
                <div className={styles.smallText} style={{ marginTop: 8 }}>
                  {getHollandDescription(selectedCareer.path_details?.holland_codes || [])}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="典型雇主" span={2}>
                <Space wrap>
                  {selectedCareer.path_details?.typical_companies?.map((company: string, idx: number) => (
                    <Tag key={idx} color="green">{company}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <Title level={4}>
                <Space>
                  <RobotOutlined />
                  AI 详细推荐理由
                </Space>
              </Title>
              {aiLoading ? (
                <div className={styles.aiLoading}>
                  <Spin tip="AI 正在分析中..." />
                </div>
              ) : (
                <div className={styles.aiReason}>
                  <Paragraph className={styles.aiReasonContent}>
                    {aiReason || '暂无 AI 分析结果'}
                  </Paragraph>
                </div>
              )}
            </div>

            {selectedCareer.personalized_plan?.immediate_steps && (
              <>
                <Divider />
                <div>
                  <Title level={4}>发展建议</Title>
                  <ul className={styles.suggestionList}>
                    {selectedCareer.personalized_plan.immediate_steps.map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </Space>
        )}
      </Modal>
    </div>
  )
}
