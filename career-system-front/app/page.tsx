//首页
'use client'
import { Button, Card, Row, Col, Typography, Layout, Space, Avatar, Divider, Tag } from 'antd'
import { 
  RocketOutlined, 
  SearchOutlined, 
  CalendarOutlined, 
  BarChartOutlined,
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ExperimentOutlined,
  AimOutlined,
  CheckCircleFilled,
  ScheduleOutlined,
  LineChartOutlined,
  RobotOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import Link from 'next/link'
import { useAuthState } from '@/app/lib/useAuthState'

const { Title, Paragraph } = Typography
const { Header, Content, Footer } = Layout

export default function Home() {
  const router = useRouter()
  const { user, checked, isAuthenticated } = useAuthState()
  
  // 核心三端闭环
  const coreFeatures = [
    {
      icon: <SearchOutlined style={{ fontSize: 28 }} />,
      title: '职业探索',
      subtitle: '霍兰德兴趣测评',
      description: '科学评估职业兴趣类型，匹配最佳发展方向',
      color: '#1890ff',
      link: '/assessment',
      buttonText: '开始测评',
      highlights: ['科学测评', '职业匹配', '详细报告']
    },
    {
      icon: <AimOutlined style={{ fontSize: 28 }} />,
      title: '学期规划',
      subtitle: '制定可执行的学期目标',
      description: '基于测评结果，创建个性化的学期发展计划',
      color: '#52c41a',
      link: '/plan',
      buttonText: '创建规划',
      highlights: ['学期目标', '月度分解', '灵活调整']
    },
    {
      icon: <BookOutlined style={{ fontSize: 28 }} />,
      title: '课程资源',
      subtitle: '匹配精准的学习路径',
      description: '根据规划结果，推荐相关课程和学习资源',
      color: '#722ed1',
      link: '/resources',
      buttonText: '查看资源',
      highlights: ['课程推荐', '学习路径', '实践项目']
    }
  ]

  // 创新亮点
  const innovations = [
    {
      icon: <ScheduleOutlined />,
      title: '目标拆解',
      description: '将学期目标细化为每日可执行任务',
      color: '#fa8c16',
      link: '/plan/schedule',
      tag: '创新'
    },
    {
      icon: <CheckCircleFilled />,
      title: '执行追踪',
      description: '实时追踪学习进度，确保目标落地',
      color: '#13c2c2',
      link: '/dashboard',
      tag: '精准'
    },
    {
      icon: <LineChartOutlined />,
      title: '动态调整',
      description: '根据进展智能调整后续计划',
      color: '#f759ab',
      link: '/dashboard',
      tag: '智能'
    }
  ]

  // 快速访问链接
  const quickLinks = [
    { text: '霍兰德测评', link: '/assessment', icon: <ExperimentOutlined /> },
    { text: '学期规划', link: '/plan', icon: <CalendarOutlined /> },
    { text: '学习资源', link: '/resources', icon: <BookOutlined /> },
    { text: '进度追踪', link: '/dashboard', icon: <BarChartOutlined /> },
  ]

  // 使用流程
  const processSteps = [
    {
      step: 1,
      title: '探索自我',
      description: '完成霍兰德测评，了解职业兴趣',
      icon: <SearchOutlined />,
      link: '/assessment',
      color: '#1890ff'
    },
    {
      step: 2,
      title: '制定规划',
      description: '创建学期、月度、每周学习目标',
      icon: <CalendarOutlined />,
      link: '/plan',
      color: '#52c41a'
    },
    {
      step: 3,
      title: '执行追踪',
      description: '每日执行任务，追踪学习进展',
      icon: <CheckCircleFilled />,
      link: '/dashboard',
      color: '#722ed1'
    }
  ]

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.headerContainer}>
          <Link href="/" className={styles.logo}>
            <RocketOutlined />
            <span>职海航图</span>
          </Link>
          
          <div className={styles.spacer}></div>
          
          <Space size="large" className={styles.navMenu}>
            <Link href="/" className={styles.navLink}>首页</Link>
            <Link href="/features" className={styles.navLink}>功能</Link>
            <Link href="/dashboard" className={styles.navLink}>仪表盘</Link>
            <Link href="/ai-advisor" className={styles.navLink}>
              <RobotOutlined /> AI顾问
            </Link>
            <Link href="/about" className={styles.navLink}>关于</Link>
            
            <div className={styles.authButtons}>
              {checked && isAuthenticated && user ? (
                <span
                  className={styles.welcomeText}
                  onClick={() => router.push('/profile')}
                  title="进入个人中心"
                >
                  欢迎使用，{user.name}！
                </span>
              ) : (
                <>
                  <Button 
                    type="link" 
                    className={styles.loginBtn}
                    onClick={() => router.push('/login')}
                  >
                    登录
                  </Button>
                  <Button 
                    type="primary" 
                    className={styles.registerBtn}
                    onClick={() => router.push('/register')}
                  >
                    免费注册
                  </Button>
                </>
              )}
            </div>
          </Space>
        </div>
      </Header>

      <Content>
        {/* Hero Section - 优化表述 */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <Title level={1} className={styles.heroTitle}>
              科学的大学生涯规划系统
            </Title>
            <Title level={3} className={styles.heroSubtitle}>
              基于霍兰德理论，打造<span style={{ color: '#ffd666', fontWeight: 600 }}>探索→规划→执行</span>的完整闭环
            </Title>
            
            <Paragraph className={styles.heroDescription}>
              从职业兴趣测评到学期规划，再到每日任务执行，一站式解决大学生生涯发展困惑
            </Paragraph>
            
            <Space size="large" className={styles.heroButtons}>
              <Button 
                type="primary" 
                size="large" 
                icon={<RocketOutlined />}
                onClick={() => router.push('/assessment')}
                className={styles.primaryCTA}
              >
                免费开始测评
              </Button>
              
              <Button 
                size="large" 
                icon={<RobotOutlined />}
                className={styles.secondaryCTA}
                onClick={() => router.push('/ai-advisor')}
              >
                AI 职业顾问
              </Button>
              
              <Button 
                size="large" 
                className={styles.secondaryCTA}
                onClick={() => router.push('/dashboard')}
              >
                直接体验仪表盘
              </Button>
            </Space>
          </div>
        </div>

        {/* 核心三端闭环 */}
        <div className={styles.coreFeaturesSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <Title level={2} className={styles.sectionTitle}>
                科学的三端闭环体系
              </Title>
              <Paragraph className={styles.sectionSubtitle}>
                探索职业方向 → 制定学期规划 → 匹配学习资源
              </Paragraph>
            </div>
            
            <Row gutter={[24, 24]}>
              {coreFeatures.map((feature, index) => (
                <Col xs={24} md={8} key={index}>
                  <Card 
                    hoverable 
                    className={styles.coreFeatureCard}
                    onClick={() => router.push(feature.link)}
                    style={{ 
                      borderTop: `4px solid ${feature.color}`,
                      cursor: 'pointer',
                      height: '100%'
                    }}
                  >
                    <div className={styles.coreFeatureContent}>
                      <div 
                        className={styles.coreFeatureIconWrapper}
                        style={{ backgroundColor: `${feature.color}15` }}
                      >
                        <div style={{ color: feature.color }}>
                          {feature.icon}
                        </div>
                      </div>
                      
                      <Title level={3} className={styles.coreFeatureTitle}>
                        {feature.title}
                      </Title>
                      
                      <div className={styles.coreFeatureSubtitle}>
                        {feature.subtitle}
                      </div>
                      
                      <Paragraph className={styles.coreFeatureDescription}>
                        {feature.description}
                      </Paragraph>
                      
                      <div className={styles.highlights}>
                        {feature.highlights.map((highlight, i) => (
                          <Tag 
                            key={i} 
                            className={styles.highlightTag}
                            style={{ 
                              backgroundColor: `${feature.color}10`,
                              borderColor: feature.color,
                              color: feature.color
                            }}
                          >
                            {highlight}
                          </Tag>
                        ))}
                      </div>
                      
                      <Button 
                        type="primary" 
                        style={{ 
                          backgroundColor: feature.color,
                          borderColor: feature.color,
                          marginTop: 16
                        }}
                        block
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(feature.link)
                        }}
                      >
                        {feature.buttonText}
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* 快速访问区域 */}
        <div className={styles.quickAccessSection}>
          <div className={styles.sectionContainer}>
            <Title level={3} className={styles.sectionTitle}>
              快速访问
            </Title>
            <Row gutter={[16, 16]}>
              {quickLinks.map((link, index) => (
                <Col xs={12} sm={6} key={index}>
                  <Card 
                    hoverable 
                    className={styles.quickLinkCard}
                    onClick={() => router.push(link.link)}
                  >
                    <div className={styles.quickLinkIcon}>
                      {link.icon}
                    </div>
                    <div className={styles.quickLinkText}>
                      {link.text}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* 创新亮点 */}
        <div className={styles.innovationsSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <Title level={2} className={styles.sectionTitle}>
                我们的创新特色
              </Title>
              <Paragraph className={styles.sectionSubtitle}>
                让规划不止于计划，真正落实到每日执行
              </Paragraph>
            </div>
            
            <Row gutter={[24, 24]}>
              {innovations.map((item, index) => (
                <Col xs={24} md={8} key={index}>
                  <Card 
                    hoverable
                    className={styles.innovationCard}
                    onClick={() => router.push(item.link)}
                  >
                    <div className={styles.innovationHeader}>
                      <div 
                        className={styles.innovationIcon}
                        style={{ 
                          backgroundColor: `${item.color}15`,
                          color: item.color
                        }}
                      >
                        {item.icon}
                      </div>
                      <Tag color={item.color} className={styles.innovationTag}>
                        {item.tag}
                      </Tag>
                    </div>
                    
                    <Title level={4} className={styles.innovationTitle}>
                      {item.title}
                    </Title>
                    
                    <Paragraph className={styles.innovationDescription}>
                      {item.description}
                    </Paragraph>
                    
                    <Button 
                      type="link" 
                      className={styles.innovationLink}
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(item.link)
                      }}
                    >
                      了解详情 →
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* 使用流程 */}
        <div className={styles.processSection}>
          <div className={styles.sectionContainer}>
            <Title level={2} className={styles.sectionTitle}>
              三步完成生涯规划
            </Title>
            
            <Row gutter={[48, 24]} align="middle">
              {processSteps.map((step, index) => (
                <Col xs={24} md={8} key={index}>
                  <div 
                    className={styles.processStep}
                    onClick={() => router.push(step.link)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.stepHeader}>
                      <Avatar 
                        size={80} 
                        className={styles.processAvatar}
                        style={{ 
                          backgroundColor: step.color,
                          cursor: 'pointer'
                        }}
                        icon={step.icon}
                      />
                      <div className={styles.stepNumber}>
                        {step.step}
                      </div>
                    </div>
                    
                    <Title level={3} className={styles.processTitle}>
                      {step.title}
                    </Title>
                    
                    <Paragraph className={styles.processDescription}>
                      {step.description}
                    </Paragraph>
                    
                    <Button 
                      type="link" 
                      onClick={() => router.push(step.link)}
                      className={styles.processLink}
                    >
                      开始{step.step === 1 ? '测评' : step.step === 2 ? '规划' : '体验'} →
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* 系统优势 */}
        <div className={styles.advantagesSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <Title level={2} className={styles.sectionTitle}>
                为什么选择我们
              </Title>
            </div>
            
            <Row gutter={[24, 24]}>
              <Col xs={24} md={6}>
                <div className={styles.advantageItem}>
                  <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
                  <span className={styles.advantageText}>基于霍兰德科学理论</span>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div className={styles.advantageItem}>
                  <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
                  <span className={styles.advantageText}>学期到每日的完整闭环</span>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div className={styles.advantageItem}>
                  <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
                  <span className={styles.advantageText}>个性化规划与资源匹配</span>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div className={styles.advantageItem}>
                  <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
                  <span className={styles.advantageText}>数据驱动的进度追踪</span>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* 页脚 */}
        <Footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <div className={styles.footerLogo}>
                  <Link href="/">
                    <RocketOutlined />
                    <span>职海航图</span>
                  </Link>
                </div>
                <Paragraph className={styles.footerDescription}>
                  科学的大学生涯规划与发展平台
                </Paragraph>
              </Col>
              
              <Col xs={24} md={16}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={8}>
                    <Title level={4} className={styles.footerSectionTitle}>
                      核心功能
                    </Title>
                    <div className={styles.footerLinks}>
                      <Link href="/assessment" className={styles.footerLink}>
                        霍兰德测评
                      </Link>
                      <Link href="/career" className={styles.footerLink}>
                        职业探索
                      </Link>
                      <Link href="/plan" className={styles.footerLink}>
                        学期规划
                      </Link>
                      <Link href="/dashboard" className={styles.footerLink}>
                        进度追踪
                      </Link>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={8}>
                    <Title level={4} className={styles.footerSectionTitle}>
                      创新特色
                    </Title>
                    <div className={styles.footerLinks}>
                      <Link href="/plan/schedule" className={styles.footerLink}>
                        目标拆解
                      </Link>
                      <Link href="/dashboard" className={styles.footerLink}>
                        执行追踪
                      </Link>
                      <Link href="/plan" className={styles.footerLink}>
                        动态调整
                      </Link>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={8}>
                    <Title level={4} className={styles.footerSectionTitle}>
                      帮助支持
                    </Title>
                    <div className={styles.footerLinks}>
                      <Link href="/help" className={styles.footerLink}>
                        帮助中心
                      </Link>
                      <Link href="/contact" className={styles.footerLink}>
                        联系我们
                      </Link>
                      <Link href="/about" className={styles.footerLink}>
                        关于我们
                      </Link>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            
            <div className={styles.footerBottom}>
              <div className={styles.copyright}>
                © 2026 大学生生涯规划系统。版权所有.
              </div>
              <div className={styles.footerMeta}>
                <span>版本 1.0.0</span>
                <span>|</span>
                <Link href="/sitemap">网站地图</Link>
              </div>
            </div>
          </div>
        </Footer>
      </Content>
    </Layout>
  )
}