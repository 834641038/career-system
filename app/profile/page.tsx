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
  PlusOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  BankOutlined,
  UsergroupAddOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TrophyFilled
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/app/lib/routes'
import Link from 'next/link'
import React from 'react';

const { Title, Paragraph } = Typography

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  date: string;
  type: string;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
}

interface AcademicBackground {
  university: string;
  college: string;
  major: string;
  degree: string;
  gpa: string;
  ranking: string;
  enrollmentYear: string;
  expectedGraduation: string;
  academicAchievements: string[];
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  gender: string;
  birthday: string;
  location: string;
  hometown: string;
  bio: string;
  joinDate: string;
  lastLogin: string;
}

interface ActivityStats {
  assessmentsCompleted: number;
  plansCreated: number;
  daysActive: number;
  badgesEarned: number;
  coursesCompleted: number;
  projectsContributed: number;
}

interface UserData {
  personalInfo: PersonalInfo;
  academicBackground: AcademicBackground;
  activityStats: ActivityStats;
  achievements: Achievement[];
  recentActivities: Activity[];
}

export default function ProfilePage() {
  const router = useRouter()

  // 从localStorage获取用户数据，如果没有则使用默认数据
  const storedData = localStorage.getItem('complete_user_profile');
  const userData: UserData = storedData ? JSON.parse(storedData) : {
    personalInfo: {
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13987654321',
      gender: 'male',
      birthday: '2005-08-20',
      location: '湖南省长沙市',
      hometown: '湖北省武汉市',
      bio: '计算机科学与技术专业学生，热爱前端开发和UI设计',
      joinDate: '2024-09-01',
      lastLogin: '2025-01-19',
    },
    academicBackground: {
      university: '中南大学',
      college: '信息科学与工程学院',
      major: '数据科学与大数据技术',
      degree: 'bachelor',
      gpa: '3.6/4.0',
      ranking: '专业前20%',
      enrollmentYear: '2023',
      expectedGraduation: '2027-06',
      academicAchievements: [
        '校级三好学生（2024年）',
        '数学建模竞赛省级二等奖（2024年）',
        '大数据分析挑战赛校级一等奖（2024年）',
        '校级奖学金获得者（2023-2024学年）'
      ]
    },
    activityStats: {
      assessmentsCompleted: 5,
      plansCreated: 3,
      daysActive: 98,
      badgesEarned: 8,
      coursesCompleted: 10,
      projectsContributed: 2
    },
    achievements: [
      { id: 1, title: '测评达人', description: '完成5次职业测评', icon: <TrophyOutlined />, date: '2025-02-18', type: 'assessment' },
      { id: 2, title: '学习新星', description: '完成10门数据分析课程', icon: <BookOutlined />, date: '2025-02-10', type: 'learning' },
      { id: 3, title: '项目能手', description: '参与2个实战数据分析项目', icon: <BookOutlined />, date: '2025-01-25', type: 'projects' },
      { id: 4, title: '实习先锋', description: '完成金融科技公司数据分析实习', icon: <TrophyOutlined />, date: '2024-09-30', type: 'internship' }
    ],
    recentActivities: [
      { id: 1, type: 'resume_update', description: '更新了实习经历和项目经验', timestamp: '2025-02-20T10:15:00Z' },
      { id: 2, type: 'course_learn', description: '学习\'高级数据分析与挖掘\'课程至80%进度', timestamp: '2025-02-18T16:30:00Z' },
      { id: 3, type: 'assessment_complete', description: '完成金融行业职业匹配测评', timestamp: '2025-02-15T09:45:00Z' },
      { id: 4, type: 'plan_create', description: '创建了\'2025年数据分析技能提升计划\'', timestamp: '2025-02-10T14:20:00Z' }
    ]
  }

  // 获取个人基础信息
  const personalInfo = userData.personalInfo
  const academicBackground = userData.academicBackground
  const stats = userData.activityStats
  const achievements = userData.achievements
  const recentActivities = userData.recentActivities

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
                <Title level={4}>{personalInfo.name}</Title>
                <Paragraph type="secondary">{personalInfo.email}</Paragraph>
                <Paragraph>{personalInfo.bio}</Paragraph>
              </div>
              
              <Divider>联系信息</Divider>
              <div style={{ fontSize: '14px', lineHeight: '2' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div><MailOutlined style={{ marginRight: '8px' }} />{personalInfo.email}</div>
                  <div><PhoneOutlined style={{ marginRight: '8px' }} />{personalInfo.phone}</div>
                  <div><HomeOutlined style={{ marginRight: '8px' }} />{personalInfo.location}</div>
                  <div><EnvironmentOutlined style={{ marginRight: '8px' }} />{personalInfo.hometown}</div>
                  <div><ClockCircleOutlined style={{ marginRight: '8px' }} />{personalInfo.birthday}</div>
                </Space>
              </div>
              
              <Divider>账户信息</Divider>
              <div style={{ fontSize: '14px', lineHeight: '2' }}>
                <p><strong>注册日期:</strong> {personalInfo.joinDate}</p>
                <p><strong>最后登录:</strong> {personalInfo.lastLogin}</p>
              </div>
            </Card>
            
            <Card title="学术背景" style={{ marginTop: 24 }}>
              <div style={{ fontSize: '14px', lineHeight: '2' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div><BankOutlined style={{ marginRight: '8px' }} />{academicBackground.university}</div>
                  <div><UsergroupAddOutlined style={{ marginRight: '8px' }} />{academicBackground.college}</div>
                  <div><IdcardOutlined style={{ marginRight: '8px' }} />{academicBackground.major}</div>
                  <div><strong>GPA:</strong> {academicBackground.gpa}</div>
                  <div><strong>排名:</strong> {academicBackground.ranking}</div>
                  <div><strong>入学年份:</strong> {academicBackground.enrollmentYear}</div>
                  <div><strong>预计毕业:</strong> {academicBackground.expectedGraduation}</div>
                </Space>
                
                <Divider>学术荣誉</Divider>
                <ul style={{ paddingLeft: 20 }}>
                  {academicBackground.academicAchievements.map((achievement: string, index: number) => (
                    <li key={index} style={{ marginBottom: 8 }}>{achievement}</li>
                  ))}
                </ul>
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
                    <Col span={4}>
                      <Statistic 
                        title="测评完成" 
                        value={stats.assessmentsCompleted} 
                        prefix={<TrophyOutlined />}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic 
                        title="规划创建" 
                        value={stats.plansCreated} 
                        prefix={<CalendarOutlined />}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic 
                        title="活跃天数" 
                        value={stats.daysActive} 
                        prefix={<BookOutlined />}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic 
                        title="获得徽章" 
                        value={stats.badgesEarned} 
                        prefix={<TrophyFilled />}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic 
                        title="课程完成" 
                        value={stats.coursesCompleted} 
                        prefix={<BookOutlined />}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic 
                        title="项目参与" 
                        value={stats.projectsContributed} 
                        prefix={<BookOutlined />}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="我的成就">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {achievements.map((achievement: Achievement) => (
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
                  <List
                    dataSource={recentActivities}
                    renderItem={(activity: Activity) => (
                      <List.Item>
                        <List.Item.Meta
                          title={activity.description}
                          description={`时间: ${new Date(activity.timestamp).toLocaleString('zh-CN')}`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  )
}