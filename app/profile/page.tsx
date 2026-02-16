//个人中心
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { Card, Button, Typography, Space, Row, Col, Avatar, Divider, Statistic, List } from 'antd'
import { 
  UserOutlined, 
  EditOutlined, 
  SettingOutlined, 
  TrophyOutlined,
  CalendarOutlined,
  BookOutlined,
  FileTextOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/app/lib/routes'
import Link from 'next/link'

const { Title, Paragraph } = Typography

export default function ProfilePage() {
  const router = useRouter()

  // Mock用户数据
  const userData = {
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: '',
    bio: '计算机科学与技术专业学生，热爱前端开发和UI设计',
    joinDate: '2024-09-01',
    lastLogin: '2025-01-19',
  }

  // Mock统计数据
  const stats = {
    assessmentsCompleted: 5,
    plansCreated: 3,
    daysActive: 128,
    badgesEarned: 8,
  }

  // Mock成就
  const achievements = [
    { id: 1, title: '测评达人', description: '完成5次职业测评', icon: <TrophyOutlined />, date: '2025-01-15' },
    { id: 2, title: '规划先锋', description: '创建3个生涯规划', icon: <CalendarOutlined />, date: '2025-01-10' },
    { id: 3, title: '学习积极分子', description: '连续学习30天', icon: <BookOutlined />, date: '2025-01-05' },
  ]

  // 简历操作卡片
  const resumeActions = [
    {
      key: 'fill',
      title: '填写简历',
      description: '完善您的个人信息和工作经历',
      icon: <PlusOutlined />,
      color: '#1890ff',
      onClick: () => router.push('/profile/resume/edit')
    },
    {
      key: 'view',
      title: '我的简历',
      description: '查看已填写的简历信息',
      icon: <FileTextOutlined />,
      color: '#52c41a',
      onClick: () => {
        // 检查是否有简历数据
        const resumeData = localStorage.getItem('career_resume_data');
        if (resumeData) {
          router.push('/profile/resume/preview');
        } else {
          router.push('/profile/resume/edit');
        }
      }
    },
    {
      key: 'generate',
      title: '生成在线简历',
      description: '创建精美的在线简历展示页',
      icon: <EyeOutlined />,
      color: '#722ed1',
      onClick: () => {
        const resumeData = localStorage.getItem('career_resume_data');
        if (resumeData) {
          router.push('/profile/resume/preview');
        } else {
          router.push('/profile/resume/edit');
        }
      }
    }
  ];

  return (
    <div className="profile-page">
      <PageHeader
        title="个人中心"
        subTitle="管理您的个人信息和查看成就"
        extra={[
          <Button 
            key="settings" 
            icon={<SettingOutlined />}
            onClick={() => router.push(ROUTES.SETTINGS)}
          >
            设置
          </Button>,
          <Button 
            key="edit-profile" 
            type="primary"
            icon={<EditOutlined />}
            onClick={() => router.push(ROUTES.PROFILE_EDIT)}
          >
            编辑资料
          </Button>,
        ]}
      />

      <div className="page-content" style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={8}>
            <Card title="个人信息">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Avatar 
                  size={80} 
                  icon={<UserOutlined />} 
                  style={{ marginBottom: 16, backgroundColor: '#1890ff' }} 
                />
                <Title level={4}>{userData.name}</Title>
                <Paragraph type="secondary">{userData.email}</Paragraph>
                <Paragraph>{userData.bio}</Paragraph>
              </div>
              
              <Divider>账户信息</Divider>
              <div style={{ fontSize: '14px' }}>
                <p><strong>注册日期:</strong> {userData.joinDate}</p>
                <p><strong>最后登录:</strong> {userData.lastLogin}</p>
              </div>
            </Card>
          </Col>
          
          <Col span={16}>
            <Row gutter={[24, 24]}>
              {/* 简历操作区域 */}
              <Col span={24}>
                <Card title="简历管理" extra={
                  <Link href="/profile/resume/edit">
                    <Button type="link">管理简历</Button>
                  </Link>
                }>
                  <Row gutter={16}>
                    {resumeActions.map(action => (
                      <Col span={8} key={action.key}>
                        <Card 
                          hoverable
                          onClick={action.onClick}
                          style={{ 
                            textAlign: 'center',
                            cursor: 'pointer',
                            height: '100%'
                          }}
                        >
                          <div style={{ 
                            fontSize: '32px', 
                            color: action.color,
                            marginBottom: '12px'
                          }}>
                            {action.icon}
                          </div>
                          <Title level={5} style={{ marginBottom: '8px' }}>
                            {action.title}
                          </Title>
                          <Paragraph type="secondary" style={{ fontSize: '12px' }}>
                            {action.description}
                          </Paragraph>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="统计数据">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic 
                        title="测评完成" 
                        value={stats.assessmentsCompleted} 
                        prefix={<TrophyOutlined />}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="规划创建" 
                        value={stats.plansCreated} 
                        prefix={<CalendarOutlined />}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="活跃天数" 
                        value={stats.daysActive} 
                        prefix={<BookOutlined />}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="获得徽章" 
                        value={stats.badgesEarned} 
                        prefix={<TrophyOutlined />}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="我的成就">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {achievements.map(achievement => (
                      <Card 
                        key={achievement.id} 
                        size="small" 
                        style={{ 
                          borderLeft: '4px solid #1890ff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ fontSize: '24px', marginRight: '12px', color: '#1890ff' }}>
                            {achievement.icon}
                          </div>
                          <div>
                            <Title level={5} style={{ margin: 0 }}>{achievement.title}</Title>
                            <Paragraph type="secondary" style={{ margin: '4px 0' }}>
                              {achievement.description}
                            </Paragraph>
                            <div style={{ fontSize: '12px', color: '#888' }}>
                              获得日期: {achievement.date}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="最近活动">
                  <Paragraph>
                    <ul>
                      <li>2025-01-19: 完成了"前端技能提升计划"的本周任务</li>
                      <li>2025-01-18: 更新了个人简介</li>
                      <li>2025-01-17: 创建了新的学习计划</li>
                      <li>2025-01-16: 完成了霍兰德职业兴趣测评</li>
                      <li>2025-01-15: 达成了"测评达人"成就</li>
                    </ul>
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  )
}