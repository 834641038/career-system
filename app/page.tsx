'use client'
import { Button, Card, Row, Col, Typography, Layout, Space, Avatar } from 'antd'
import { 
  RocketOutlined, 
  SearchOutlined, 
  CalendarOutlined, 
  BarChartOutlined,
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const { Title, Paragraph } = Typography
const { Header, Content, Footer } = Layout

export default function Home() {
  const router = useRouter()
  
  const features = [
    {
      icon: <SearchOutlined className={styles.featureIcon} />,
      title: '智能测评',
      description: '霍兰德职业兴趣、技能评估、价值观分析',
      color: '#1890ff',
      link: '/assessment',
      colorClass: 'blue'
    },
    {
      icon: <RocketOutlined className={styles.featureIcon} />,
      title: '职业探索',
      description: '300+职业数据库、薪资发展、晋升路径',
      color: '#52c41a',
      link: '/career',
      colorClass: 'green'
    },
    {
      icon: <CalendarOutlined className={styles.featureIcon} />,
      title: '生涯规划',
      description: '大学四年规划、月度目标、每日任务',
      color: '#722ed1',
      link: '/plan',
      colorClass: 'purple'
    },
    {
      icon: <BarChartOutlined className={styles.featureIcon} />,
      title: '成长追踪',
      description: '学习进度、技能成长、成就系统',
      color: '#fa8c16',
      link: '/dashboard',
      colorClass: 'orange'
    }
  ]

  const stats = [
    { label: '注册用户', value: '10,000+' },
    { label: '职业数据', value: '300+' },
    { label: '测评完成', value: '50,000+' },
    { label: '规划创建', value: '8,000+' },
  ]

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logo}>
            <RocketOutlined />
            <span>UniCareer</span>
          </div>
          <div className={styles.spacer}></div>
          <Space size="large">
            <Button type="link" onClick={() => router.push('/')}>首页</Button>
            <Button type="link" onClick={() => router.push('/features')}>功能</Button>
            <Button type="link" onClick={() => router.push('/about')}>关于</Button>
            <Button type="primary" onClick={() => router.push('/login')}>开始使用</Button>
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
            <Space size="large">
              <Button 
                type="primary" 
                size="large" 
                icon={<RocketOutlined />}
                onClick={() => router.push('/register')}
              >
                免费开始
              </Button>
              <Button 
                size="large" 
                className={styles.heroSecondaryBtn}
                onClick={() => router.push('/demo')}
              >
                查看演示
              </Button>
            </Space>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsSection}>
          <div className={styles.statsContainer}>
            <Row gutter={[24, 24]}>
              {stats.map((stat, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <div className={styles.statItem}>
                    <Title level={2} className={styles.statValue}>
                      {stat.value}
                    </Title>
                    <Paragraph type="secondary" className={styles.statLabel}>
                      {stat.label}
                    </Paragraph>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* Features */}
        <div className={styles.featuresSection}>
          <Title level={2} className={styles.sectionTitle}>
            核心功能
          </Title>
          <Paragraph className={styles.sectionSubtitle}>
            为大学生量身定制的四大核心模块，覆盖生涯规划全流程
          </Paragraph>
          
          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card 
                  hoverable 
                  className={`${styles.featureCard} ${styles[`featureCard${feature.colorClass}`]}`}
                  onClick={() => router.push(feature.link)}
                >
                  <div className={`${styles.featureIconWrapper} ${styles[`featureIconWrapper${feature.colorClass}`]}`}>
                    <div className={`${styles.featureIconBg} ${styles[`featureIconBg${feature.colorClass}`]}`}>
                      <div className={styles.featureIconColor}>
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                  <Title level={4} className={styles.featureTitle}>
                    {feature.title}
                  </Title>
                  <Paragraph type="secondary" className={styles.featureDescription}>
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* How it works */}
        <div className={styles.howItWorksSection}>
          <div className={styles.sectionContainer}>
            <Title level={2} className={styles.sectionTitle}>
              使用流程
            </Title>
            
            <Row gutter={[48, 24]} align="middle">
              <Col xs={24} md={8}>
                <div className={styles.processStep}>
                  <Avatar 
                    size={80} 
                    className={styles.processAvatar}
                    style={{ backgroundColor: '#1890ff' }}
                    icon={<SearchOutlined />}
                  />
                  <Title level={3} className={styles.processTitle}>1. 智能测评</Title>
                  <Paragraph className={styles.processDescription}>
                    完成科学测评，了解自己的兴趣、能力和价值观
                  </Paragraph>
                </div>
              </Col>
              
              <Col xs={24} md={8}>
                <div className={styles.processStep}>
                  <Avatar 
                    size={80} 
                    className={styles.processAvatar}
                    style={{ backgroundColor: '#52c41a' }}
                    icon={<TeamOutlined />}
                  />
                  <Title level={3} className={styles.processTitle}>2. 职业匹配</Title>
                  <Paragraph className={styles.processDescription}>
                    基于测评结果，匹配适合的职业发展方向
                  </Paragraph>
                </div>
              </Col>
              
              <Col xs={24} md={8}>
                <div className={styles.processStep}>
                  <Avatar 
                    size={80} 
                    className={styles.processAvatar}
                    style={{ backgroundColor: '#722ed1' }}
                    icon={<CalendarOutlined />}
                  />
                  <Title level={3} className={styles.processTitle}>3. 制定规划</Title>
                  <Paragraph className={styles.processDescription}>
                    创建个性化的大学四年生涯规划
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <Title level={2} className={styles.ctaTitle}>现在就开始规划你的大学生涯</Title>
            <Paragraph className={styles.ctaSubtitle}>
              加入10,000+大学生，开启科学的生涯规划之旅
            </Paragraph>
            <Space size="large">
              <Button 
                type="primary" 
                size="large"
                onClick={() => router.push('/register')}
              >
                免费注册
              </Button>
              <Button 
                size="large"
                onClick={() => router.push('/login')}
              >
                已有账号登录
              </Button>
            </Space>
          </div>
        </div>
      </Content>

      <Footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className={styles.footerLogo}>
                <RocketOutlined />
                <span>UniCareer</span>
              </div>
              <Paragraph className={styles.footerDescription}>
                一站式大学生生涯规划平台
              </Paragraph>
            </Col>
            
            <Col xs={24} md={16}>
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={8}>
                  <Title level={4} className={styles.footerSectionTitle}>
                    产品
                  </Title>
                  <div className={styles.footerLinks}>
                    <Button type="link" className={styles.footerLink}>
                      功能特色
                    </Button>
                    <Button type="link" className={styles.footerLink}>
                      定价
                    </Button>
                    <Button type="link" className={styles.footerLink}>
                      更新日志
                    </Button>
                  </div>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Title level={4} className={styles.footerSectionTitle}>
                    资源
                  </Title>
                  <div className={styles.footerLinks}>
                    <Button type="link" className={styles.footerLink}>
                      帮助文档
                    </Button>
                    <Button type="link" className={styles.footerLink}>
                      博客
                    </Button>
                    <Button type="link" className={styles.footerLink}>
                      社区
                    </Button>
                  </div>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Title level={4} className={styles.footerSectionTitle}>
                    联系
                  </Title>
                  <div className={styles.footerLinks}>
                    <Button type="link" className={styles.footerLink}>
                      关于我们
                    </Button>
                    <Button type="link" className={styles.footerLink}>
                      联系我们
                    </Button>
                    <Button type="link" className={styles.footerLink}>
                      加入我们
                    </Button>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
          
          <div className={styles.footerBottom}>
            © 2026 大学生生涯规划系统. 版权所有.
          </div>
        </div>
      </Footer>
    </Layout>
  )
}