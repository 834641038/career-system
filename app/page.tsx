'use client'
import { Button, Card, Row, Col, Typography, Layout, Space, Avatar } from 'antd'
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
  AimOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import Link from 'next/link'

const { Title, Paragraph } = Typography
const { Header, Content, Footer } = Layout

export default function Home() {
  const router = useRouter()
  
  // 功能卡片数据 - 每个卡片都添加真实的页面链接
  const features = [
    {
      icon: <SearchOutlined className={styles.featureIcon} />,
      title: '智能测评',
      description: '霍兰德职业兴趣、技能评估、价值观分析',
      color: '#1890ff',
      link: '/assessment', // 指向测评页面
      buttonText: '开始测评',
      buttonIcon: <ExperimentOutlined />
    },
    {
      icon: <RocketOutlined className={styles.featureIcon} />,
      title: '职业探索',
      description: '300+职业数据库、薪资发展、晋升路径',
      color: '#52c41a',
      link: '/career', // 指向职业探索页面
      buttonText: '探索职业',
      buttonIcon: <AimOutlined />
    },
    {
      icon: <CalendarOutlined className={styles.featureIcon} />,
      title: '生涯规划',
      description: '大学四年规划、月度目标、每日任务',
      color: '#722ed1',
      link: '/plan', // 指向规划页面
      buttonText: '创建规划',
      buttonIcon: <CalendarOutlined />
    },
    {
      icon: <BarChartOutlined className={styles.featureIcon} />,
      title: '成长追踪',
      description: '学习进度、技能成长、成就系统',
      color: '#fa8c16',
      link: '/dashboard', // 指向仪表盘页面
      buttonText: '查看统计',
      buttonIcon: <BarChartOutlined />
    }
  ]

  // 快速访问链接
  const quickLinks = [
    { text: '我的规划', link: '/plan', icon: <CalendarOutlined /> },
    { text: '学习资源', link: '/resources', icon: <BookOutlined /> },
    { text: '个人中心', link: '/profile', icon: <UserOutlined /> },
    { text: '测评记录', link: '/assessment/history', icon: <CheckCircleOutlined /> },
  ]

  // 处理按钮点击
  const handleFeatureClick = (link: string) => {
    router.push(link)
  }

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.headerContainer}>
          {/* Logo 链接到首页 */}
          <Link href="/" className={styles.logo}>
            <RocketOutlined />
            <span>UniCareer</span>
          </Link>
          
          <div className={styles.spacer}></div>
          
          {/* 导航菜单 - 使用 Link 组件 */}
          <Space size="large" className={styles.navMenu}>
            <Link href="/" className={styles.navLink}>首页</Link>
            <Link href="/features" className={styles.navLink}>功能</Link>
            <Link href="/dashboard" className={styles.navLink}>仪表盘</Link>
            <Link href="/about" className={styles.navLink}>关于</Link>
            
            {/* 用户相关操作 */}
            <div className={styles.authButtons}>
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
            </div>
          </Space>
        </div>
      </Header>

      <Content>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <Title level={1} className={styles.heroTitle}>
              一站式大学生生涯规划系统
            </Title>
            <Paragraph className={styles.heroSubtitle}>
              从测评到规划，从学习到就业，AI驱动的个性化生涯规划平台
            </Paragraph>
            
            <Space size="large" className={styles.heroButtons}>
              <Button 
                type="primary" 
                size="large" 
                icon={<RocketOutlined />}
                onClick={() => router.push('/register')}
                className={styles.primaryCTA}
              >
                立即开始
              </Button>
              
              <Button 
                size="large" 
                className={styles.secondaryCTA}
                onClick={() => router.push('/demo')}
              >
                <Link href="/demo" style={{ color: 'inherit' }}>
                  查看演示
                </Link>
              </Button>
              
              <Button 
                size="large" 
                className={styles.ghostCTA}
                onClick={() => router.push('/dashboard')}
              >
                直接体验仪表盘
              </Button>
            </Space>
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

        {/* 核心功能区域 - 每个卡片都可点击 */}
        <div className={styles.featuresSection}>
          <div className={styles.sectionContainer}>
            <Title level={2} className={styles.sectionTitle}>
              核心功能
            </Title>
            <Paragraph className={styles.sectionSubtitle}>
              点击下方功能卡片，立即体验对应的功能模块
            </Paragraph>
            
            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card 
                    hoverable 
                    className={styles.featureCard}
                    onClick={() => handleFeatureClick(feature.link)}
                    style={{ 
                      borderTop: `4px solid ${feature.color}`,
                      cursor: 'pointer'
                    }}
                  >
                    <div className={styles.featureCardContent}>
                      <div 
                        className={styles.featureIconWrapper}
                        style={{ backgroundColor: `${feature.color}15` }}
                      >
                        <div style={{ color: feature.color }}>
                          {feature.icon}
                        </div>
                      </div>
                      
                      <Title level={4} className={styles.featureTitle}>
                        {feature.title}
                      </Title>
                      
                      <Paragraph type="secondary" className={styles.featureDescription}>
                        {feature.description}
                      </Paragraph>
                      
                      <Button 
                        type="primary" 
                        style={{ 
                          backgroundColor: feature.color,
                          borderColor: feature.color
                        }}
                        icon={feature.buttonIcon}
                        block
                        onClick={(e) => {
                          e.stopPropagation() // 防止冒泡
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

        {/* 使用流程 - 步骤也可点击 */}
        <div className={styles.processSection}>
          <div className={styles.sectionContainer}>
            <Title level={2} className={styles.sectionTitle}>
              三步完成生涯规划
            </Title>
            
            <Row gutter={[48, 24]} align="middle">
              <Col xs={24} md={8}>
                <div 
                  className={styles.processStep}
                  onClick={() => router.push('/assessment')}
                  style={{ cursor: 'pointer' }}
                >
                  <Avatar 
                    size={80} 
                    className={styles.processAvatar}
                    style={{ 
                      backgroundColor: '#1890ff',
                      cursor: 'pointer'
                    }}
                    icon={<SearchOutlined />}
                  />
                  <Title level={3} className={styles.processTitle}>
                    <Link href="/assessment" className={styles.processLink}>
                      1. 智能测评
                    </Link>
                  </Title>
                  <Paragraph className={styles.processDescription}>
                    完成科学测评，了解自己的兴趣、能力和价值观
                  </Paragraph>
                  <Button type="link" onClick={() => router.push('/assessment')}>
                    开始测评 →
                  </Button>
                </div>
              </Col>
              
              <Col xs={24} md={8}>
                <div 
                  className={styles.processStep}
                  onClick={() => router.push('/career')}
                  style={{ cursor: 'pointer' }}
                >
                  <Avatar 
                    size={80} 
                    className={styles.processAvatar}
                    style={{ 
                      backgroundColor: '#52c41a',
                      cursor: 'pointer'
                    }}
                    icon={<TeamOutlined />}
                  />
                  <Title level={3} className={styles.processTitle}>
                    <Link href="/career" className={styles.processLink}>
                      2. 职业探索
                    </Link>
                  </Title>
                  <Paragraph className={styles.processDescription}>
                    基于测评结果，匹配适合的职业发展方向
                  </Paragraph>
                  <Button type="link" onClick={() => router.push('/career')}>
                    探索职业 →
                  </Button>
                </div>
              </Col>
              
              <Col xs={24} md={8}>
                <div 
                  className={styles.processStep}
                  onClick={() => router.push('/plan')}
                  style={{ cursor: 'pointer' }}
                >
                  <Avatar 
                    size={80} 
                    className={styles.processAvatar}
                    style={{ 
                      backgroundColor: '#722ed1',
                      cursor: 'pointer'
                    }}
                    icon={<CalendarOutlined />}
                  />
                  <Title level={3} className={styles.processTitle}>
                    <Link href="/plan" className={styles.processLink}>
                      3. 制定规划
                    </Link>
                  </Title>
                  <Paragraph className={styles.processDescription}>
                    创建个性化的大学四年生涯规划
                  </Paragraph>
                  <Button type="link" onClick={() => router.push('/plan')}>
                    创建规划 →
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* 页脚导航 */}
        <Footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <div className={styles.footerLogo}>
                  <Link href="/">
                    <RocketOutlined />
                    <span>UniCareer</span>
                  </Link>
                </div>
                <Paragraph className={styles.footerDescription}>
                  一站式大学生生涯规划平台
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
                        智能测评
                      </Link>
                      <Link href="/career" className={styles.footerLink}>
                        职业探索
                      </Link>
                      <Link href="/plan" className={styles.footerLink}>
                        生涯规划
                      </Link>
                      <Link href="/dashboard" className={styles.footerLink}>
                        成长追踪
                      </Link>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={8}>
                    <Title level={4} className={styles.footerSectionTitle}>
                      用户中心
                    </Title>
                    <div className={styles.footerLinks}>
                      <Link href="/profile" className={styles.footerLink}>
                        个人中心
                      </Link>
                      <Link href="/dashboard" className={styles.footerLink}>
                        我的仪表盘
                      </Link>
                      <Link href="/resources" className={styles.footerLink}>
                        学习资源
                      </Link>
                      <Link href="/settings" className={styles.footerLink}>
                        系统设置
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
                      <Link href="/privacy" className={styles.footerLink}>
                        隐私政策
                      </Link>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            
            <div className={styles.footerBottom}>
              <div className={styles.copyright}>
                © 2026 大学生生涯规划系统. 版权所有.
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