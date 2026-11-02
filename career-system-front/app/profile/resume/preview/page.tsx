// 简历预览页面
'use client'
import { useState, useEffect } from 'react'
import { 
  PageContainer 
} from '@ant-design/pro-components'
import { 
  Card, 
  Button, 
  Typography, 
  Row, 
  Col,
  Space,
  Tag,
  Divider,
  Empty,
  Descriptions
} from 'antd'
import { 
  EditOutlined,
  PrinterOutlined,
  DownloadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BankOutlined,
  CalendarOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { ResumeData, RESUME_STORAGE_KEY } from '@/lib/types/resume'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

export default function ResumePreviewPage() {
  const router = useRouter()
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载简历数据
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem(RESUME_STORAGE_KEY)
        if (savedData) {
          const data: ResumeData = JSON.parse(savedData)
          setResumeData(data)
        }
      } catch (error) {
        console.error('加载简历数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // 编辑简历
  const handleEdit = () => {
    router.push('/profile/resume/edit')
  }

  // 打印简历
  const handlePrint = () => {
    window.print()
  }

  // 下载简历（PDF格式）
  const handleDownload = () => {
    // 这里可以集成PDF生成库，如jspdf
    alert('下载功能待实现')
  }

  if (loading) {
    return (
      <PageContainer title="简历预览" loading={true}>
        <div className="text-center py-12">
          <Text>正在加载简历数据...</Text>
        </div>
      </PageContainer>
    )
  }

  if (!resumeData) {
    return (
      <PageContainer title="简历预览">
        <Empty description="暂无简历数据">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => router.push('/profile/resume/edit')}
          >
            去填写简历
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const { 
    basicInfo, 
    jobIntention, 
    educationExperiences, 
    workExperiences, 
    projectExperiences, 
    skills, 
    certificates, 
    selfEvaluation 
  } = resumeData

  return (
    <PageContainer
      title="在线简历"
      subTitle="您的个人简历展示"
      extra={[
        <Button 
          key="edit" 
          icon={<EditOutlined />}
          onClick={handleEdit}
        >
          编辑简历
        </Button>,
        <Button 
          key="print" 
          icon={<PrinterOutlined />}
          onClick={handlePrint}
        >
          打印
        </Button>,
        <Button 
          key="download" 
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
        >
          下载PDF
        </Button>
      ]}
    >
      {/* 简历主体内容 - 适配打印样式 */}
      <div className="resume-preview max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none">
        {/* 头部信息 */}
        <div className="resume-header bg-linear-to-r from-blue-600 to-indigo-700 text-white p-8 print:bg-gray-800">
          <Row gutter={24} align="middle">
            <Col>
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center print:w-16 print:h-16">
                <UserOutlined className="text-blue-600 text-3xl print:text-2xl" />
              </div>
            </Col>
            <Col flex="1">
              <Title level={2} className="text-white mb-2 print:text-black print:text-xl">
                {basicInfo.name}
              </Title>
              <div className="space-y-1 print:text-sm">
                <div className="flex items-center">
                  <MailOutlined className="mr-2" />
                  <Text className="text-white print:text-black">{basicInfo.email}</Text>
                </div>
                <div className="flex items-center">
                  <PhoneOutlined className="mr-2" />
                  <Text className="text-white print:text-black">{basicInfo.phone}</Text>
                </div>
                <div className="flex items-center">
                  <EnvironmentOutlined className="mr-2" />
                  <Text className="text-white print:text-black">{basicInfo.location}</Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <div className="resume-content p-8 print:p-6">
          {/* 求职意向 */}
          <section className="mb-8 print:mb-6">
            <Title level={3} className="border-l-4 border-blue-500 pl-3 mb-4 print:text-lg print:mb-3">
              求职意向
            </Title>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="期望职位">{jobIntention.position}</Descriptions.Item>
              <Descriptions.Item label="期望行业">{jobIntention.industry}</Descriptions.Item>
              <Descriptions.Item label="期望薪资">{jobIntention.salaryExpectation}</Descriptions.Item>
              <Descriptions.Item label="工作地点">{jobIntention.workLocation}</Descriptions.Item>
              <Descriptions.Item label="工作性质">
                {{
                  'full-time': '全职',
                  'part-time': '兼职',
                  'internship': '实习',
                  'freelance': '自由职业'
                }[jobIntention.employmentType]}
              </Descriptions.Item>
            </Descriptions>
          </section>

          <Divider className="print:hidden" />

          {/* 教育经历 */}
          {educationExperiences && educationExperiences.length > 0 && (
            <section className="mb-8 print:mb-6">
              <Title level={3} className="border-l-4 border-green-500 pl-3 mb-4 print:text-lg print:mb-3">
                教育经历
              </Title>
              <div className="space-y-4">
                {educationExperiences.map((edu, index) => (
                  <Card 
                    key={index} 
                    size="small" 
                    className="border-l-4 border-green-400 print:border-l-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Title level={4} className="mb-1 print:text-base">
                          {edu.school}
                        </Title>
                        <Text type="secondary" className="print:text-sm">
                          {edu.major} | {{
                            'associate': '专科',
                            'bachelor': '本科',
                            'master': '硕士',
                            'doctor': '博士'
                          }[edu.degree]}
                        </Text>
                      </div>
                      <Tag icon={<CalendarOutlined />} color="green">
                        {edu.startDate} - {edu.endDate}
                      </Tag>
                    </div>
                    {edu.gpa && (
                      <Paragraph className="mb-2 print:text-sm">
                        <strong>成绩：</strong>{edu.gpa}
                      </Paragraph>
                    )}
                    {edu.description && (
                      <Paragraph className="print:text-sm">{edu.description}</Paragraph>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          <Divider className="print:hidden" />

          {/* 工作经历 */}
          {workExperiences && workExperiences.length > 0 && (
            <section className="mb-8 print:mb-6">
              <Title level={3} className="border-l-4 border-purple-500 pl-3 mb-4 print:text-lg print:mb-3">
                工作经历
              </Title>
              <div className="space-y-4">
                {workExperiences.map((work, index) => (
                  <Card 
                    key={index} 
                    size="small" 
                    className="border-l-4 border-purple-400 print:border-l-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Title level={4} className="mb-1 print:text-base">
                          {work.company}
                        </Title>
                        <Text type="secondary" className="print:text-sm">
                          {work.position}
                        </Text>
                      </div>
                      <Tag 
                        icon={<BankOutlined />} 
                        color={work.isCurrent ? "blue" : "purple"}
                      >
                        {work.startDate} - {work.isCurrent ? '至今' : work.endDate}
                        {work.isCurrent && ' (在职)'}
                      </Tag>
                    </div>
                    <Paragraph className="print:text-sm">{work.description}</Paragraph>
                    {work.achievements && work.achievements.length > 0 && (
                      <div className="mt-3">
                        <Text strong className="print:text-sm">主要成就：</Text>
                        <ul className="mt-1 space-y-1 print:text-sm">
                          {work.achievements.map((achievement, achIndex) => (
                            <li key={achIndex} className="ml-4">• {achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          <Divider className="print:hidden" />

          {/* 项目经验 */}
          {projectExperiences && projectExperiences.length > 0 && (
            <section className="mb-8 print:mb-6">
              <Title level={3} className="border-l-4 border-orange-500 pl-3 mb-4 print:text-lg print:mb-3">
                项目经验
              </Title>
              <div className="space-y-4">
                {projectExperiences.map((project, index) => (
                  <Card 
                    key={index} 
                    size="small" 
                    className="border-l-4 border-orange-400 print:border-l-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Title level={4} className="mb-1 print:text-base">
                          {project.projectName}
                        </Title>
                        <Text type="secondary" className="print:text-sm">
                          担任角色：{project.role}
                        </Text>
                      </div>
                      <Tag 
                        icon={<TrophyOutlined />} 
                        color={project.isCurrent ? "blue" : "orange"}
                      >
                        {project.startDate} - {project.isCurrent ? '进行中' : project.endDate}
                      </Tag>
                    </div>
                    <Paragraph className="print:text-sm">{project.description}</Paragraph>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="mt-3">
                        <Text strong className="print:text-sm">使用技术：</Text>
                        <div className="mt-1">
                          {project.technologies.map((tech, techIndex) => (
                            <Tag key={techIndex} className="mr-2 mb-1 print:text-xs">
                              {tech}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                    {project.link && (
                      <Paragraph className="mt-2 print:text-sm">
                        <strong>项目链接：</strong>
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {project.link}
                        </a>
                      </Paragraph>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          <Divider className="print:hidden" />

          {/* 技能证书 */}
          {(skills && skills.length > 0) || (certificates && certificates.length > 0) && (
            <section className="mb-8 print:mb-6">
              <Title level={3} className="border-l-4 border-red-500 pl-3 mb-4 print:text-lg print:mb-3">
                技能证书
              </Title>
              <Row gutter={[16, 16]}>
                {skills && skills.length > 0 && (
                  <Col span={12}>
                    <Card title="专业技能" size="small">
                      <div className="space-y-2">
                        {skills.map((skill, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="print:text-sm">{skill.name}</span>
                            <Tag 
                              color={{
                                'basic': 'default',
                                'proficient': 'blue',
                                'expert': 'green'
                              }[skill.level]}
                              className="print:text-xs"
                            >
                              {{
                                'basic': '基础',
                                'proficient': '熟练',
                                'expert': '精通'
                              }[skill.level]}
                            </Tag>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>
                )}
                
                {certificates && certificates.length > 0 && (
                  <Col span={12}>
                    <Card title="获得证书" size="small">
                      <div className="space-y-2">
                        {certificates.map((cert, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="print:text-sm">{cert.name}</span>
                            {cert.score && (
                              <Tag color="gold" className="print:text-xs">
                                {cert.score}
                              </Tag>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>
                )}
              </Row>
            </section>
          )}

          <Divider className="print:hidden" />

          {/* 自我评价 */}
          {selfEvaluation && selfEvaluation.content && (
            <section className="mb-8 print:mb-6">
              <Title level={3} className="border-l-4 border-indigo-500 pl-3 mb-4 print:text-lg print:mb-3">
                自我评价
              </Title>
              <Card size="small" className="border-l-4 border-indigo-400 print:border-l-2">
                <Paragraph className="print:text-sm whitespace-pre-line">
                  {selfEvaluation.content}
                </Paragraph>
              </Card>
            </section>
          )}
        </div>

        {/* 底部操作栏（仅在屏幕上显示） */}
        {!window.matchMedia('print').matches && (
          <div className="resume-footer bg-gray-50 p-6 text-center border-t">
            <Space size="large">
              <Button 
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                继续编辑
              </Button>
              <Button 
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                打印简历
              </Button>
              <Button 
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                下载PDF
              </Button>
            </Space>
          </div>
        )}
      </div>
    </PageContainer>
  )
}