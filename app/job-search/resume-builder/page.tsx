// 简历构建页面
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { Card, Button, Typography, Space, Form, Input, Select, DatePicker, Upload, Table, message, Row, Col } from 'antd'
import { 
  UploadOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EditOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'
import { useState } from 'react'

const { Title, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

interface EducationItem {
  id: number;
  school: string;
  major: string;
  degree: string;
  startDate: any;
  endDate: any;
  gpa: string;
}

interface WorkExperienceItem {
  id: number;
  company: string;
  position: string;
  startDate: any;
  endDate: any;
  description: string;
}

interface SkillItem {
  id: number;
  name: string;
  level: string;
  category: string;
}

interface PersonalInfo {
  [key: string]: any;
}

interface ResumeSections {
  personalInfo: PersonalInfo;
  education: EducationItem[];
  workExperience: WorkExperienceItem[];
  skills: SkillItem[];
  projects: any[];
  achievements: any[];
}

export default function ResumeBuilderPage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [resumeSections, setResumeSections] = useState<ResumeSections>({
    personalInfo: {},
    education: [],
    workExperience: [],
    skills: [],
    projects: [],
    achievements: []
  })

  // 添加教育经历
  const addEducation = () => {
    const newEducation: EducationItem = {
      id: Date.now(),
      school: '',
      major: '',
      degree: '',
      startDate: null,
      endDate: null,
      gpa: ''
    }
    setResumeSections(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }))
  }

  // 添加工作经历
  const addWorkExperience = () => {
    const newWorkExp: WorkExperienceItem = {
      id: Date.now(),
      company: '',
      position: '',
      startDate: null,
      endDate: null,
      description: ''
    }
    setResumeSections(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newWorkExp]
    }))
  }

  // 添加技能
  const addSkill = () => {
    const newSkill: SkillItem = {
      id: Date.now(),
      name: '',
      level: '',
      category: ''
    }
    setResumeSections(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }))
  }

  // 删除项目
  const removeItem = (section: keyof ResumeSections, id: number) => {
    setResumeSections(prev => ({
      ...prev,
      [section]: prev[section].filter((item: any) => item.id !== id)
    }))
  }

  // 处理输入变化
  const handleInputChange = (section: keyof ResumeSections, id: number, field: string, value: any) => {
    setResumeSections(prev => ({
      ...prev,
      [section]: prev[section].map((item: any) => {
        if (item.id === id) {
          return { ...item, [field]: value }
        }
        return item
      })
    }))
  }

  // 保存简历
  const saveResume = () => {
    console.log('保存简历:', resumeSections)
    message.success('简历已保存')
  }

  // 预览简历
  const previewResume = () => {
    message.info('正在生成简历预览...')
    // 这里可以跳转到预览页面或打开模态框显示预览
  }

  // 导出简历
  const exportResume = () => {
    message.info('正在导出简历...')
    // 实现简历导出功能
  }

  return (
    <div className="resume-builder-page">
      <PageHeader
        title="简历构建器"
        subTitle="创建专业的求职简历，展示你的技能和经历"
        extra={[
          <Button 
            key="back-jobsearch" 
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            返回仪表盘
          </Button>,
          <Button 
            key="preview" 
            onClick={previewResume}
          >
            预览简历
          </Button>,
          <Button 
            key="export" 
            type="primary"
            onClick={exportResume}
          >
            导出简历
          </Button>,
        ]}
      />

      <div className="page-content" style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={18}>
            {/* 个人信息部分 */}
            <Card title="个人信息" style={{ marginBottom: 24 }}>
              <Form layout="vertical" form={form}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="姓名">
                      <Input 
                        placeholder="请输入姓名" 
                        prefix={<UserOutlined />}
                        onChange={(e) => handleInputChange('personalInfo', 0, 'name', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="联系方式">
                      <Input 
                        placeholder="请输入电话号码" 
                        prefix={<PhoneOutlined />}
                        onChange={(e) => handleInputChange('personalInfo', 0, 'phone', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="邮箱地址">
                  <Input 
                    placeholder="请输入邮箱地址" 
                    prefix={<MailOutlined />}
                    onChange={(e) => handleInputChange('personalInfo', 0, 'email', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="个人简介">
                  <TextArea 
                    rows={4} 
                    placeholder="简要介绍自己，包括职业目标和个人特点" 
                    onChange={(e) => handleInputChange('personalInfo', 0, 'summary', e.target.value)}
                  />
                </Form.Item>
              </Form>
            </Card>

            {/* 教育经历部分 */}
            <Card 
              title="教育经历" 
              style={{ marginBottom: 24 }}
              extra={
                <Button icon={<PlusOutlined />} onClick={addEducation}>
                  添加教育经历
                </Button>
              }
            >
              {resumeSections.education.map((edu: EducationItem) => (
                <Card 
                  key={edu.id} 
                  type="inner" 
                  style={{ marginBottom: 16 }}
                  extra={
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem('education', edu.id)}
                    />
                  }
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="学校名称">
                        <Input 
                          placeholder="如：某某大学" 
                          value={edu.school}
                          onChange={(e) => handleInputChange('education', edu.id, 'school', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="专业名称">
                        <Input 
                          placeholder="如：计算机科学与技术" 
                          value={edu.major}
                          onChange={(e) => handleInputChange('education', edu.id, 'major', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="学历">
                        <Select
                          placeholder="选择学历"
                          value={edu.degree}
                          onChange={(value) => handleInputChange('education', edu.id, 'degree', value)}
                        >
                          <Option value="bachelor">本科</Option>
                          <Option value="master">硕士</Option>
                          <Option value="phd">博士</Option>
                          <Option value="other">其他</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="GPA">
                        <Input 
                          placeholder="如：3.8/4.0" 
                          value={edu.gpa}
                          onChange={(e) => handleInputChange('education', edu.id, 'gpa', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="开始日期">
                        <DatePicker 
                          style={{ width: '100%' }}
                          value={edu.startDate}
                          onChange={(date) => handleInputChange('education', edu.id, 'startDate', date)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="结束日期">
                        <DatePicker 
                          style={{ width: '100%' }}
                          value={edu.endDate}
                          onChange={(date) => handleInputChange('education', edu.id, 'endDate', date)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Card>

            {/* 工作经历部分 */}
            <Card 
              title="工作/实习经历" 
              style={{ marginBottom: 24 }}
              extra={
                <Button icon={<PlusOutlined />} onClick={addWorkExperience}>
                  添加经历
                </Button>
              }
            >
              {resumeSections.workExperience.map((exp: WorkExperienceItem) => (
                <Card 
                  key={exp.id} 
                  type="inner" 
                  style={{ marginBottom: 16 }}
                  extra={
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem('workExperience', exp.id)}
                    />
                  }
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="公司名称">
                        <Input 
                          placeholder="公司全称" 
                          value={exp.company}
                          onChange={(e) => handleInputChange('workExperience', exp.id, 'company', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="职位名称">
                        <Input 
                          placeholder="担任的职位" 
                          value={exp.position}
                          onChange={(e) => handleInputChange('workExperience', exp.id, 'position', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="开始日期">
                        <DatePicker 
                          style={{ width: '100%' }}
                          value={exp.startDate}
                          onChange={(date) => handleInputChange('workExperience', exp.id, 'startDate', date)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="结束日期">
                        <DatePicker 
                          style={{ width: '100%' }}
                          value={exp.endDate}
                          onChange={(date) => handleInputChange('workExperience', exp.id, 'endDate', date)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="工作描述">
                    <TextArea 
                      rows={4} 
                      placeholder="描述你的职责和成就" 
                      value={exp.description}
                      onChange={(e) => handleInputChange('workExperience', exp.id, 'description', e.target.value)}
                    />
                  </Form.Item>
                </Card>
              ))}
            </Card>

            {/* 技能部分 */}
            <Card 
              title="技能" 
              style={{ marginBottom: 24 }}
              extra={
                <Button icon={<PlusOutlined />} onClick={addSkill}>
                  添加技能
                </Button>
              }
            >
              {resumeSections.skills.map((skill: SkillItem) => (
                <Card 
                  key={skill.id} 
                  type="inner" 
                  style={{ marginBottom: 16 }}
                  extra={
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem('skills', skill.id)}
                    />
                  }
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="技能名称">
                        <Input 
                          placeholder="如：JavaScript" 
                          value={skill.name}
                          onChange={(e) => handleInputChange('skills', skill.id, 'name', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="熟练程度">
                        <Select
                          placeholder="选择熟练程度"
                          value={skill.level}
                          onChange={(value) => handleInputChange('skills', skill.id, 'level', value)}
                        >
                          <Option value="beginner">初级</Option>
                          <Option value="intermediate">中级</Option>
                          <Option value="advanced">高级</Option>
                          <Option value="expert">专家</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="分类">
                        <Input 
                          placeholder="如：编程语言、工具等" 
                          value={skill.category}
                          onChange={(e) => handleInputChange('skills', skill.id, 'category', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Card>
          </Col>

          <Col xs={24} lg={6}>
            {/* 操作面板 */}
            <Card title="操作面板" style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" size="large" block onClick={saveResume}>
                  保存简历
                </Button>
                <Button size="large" block onClick={previewResume}>
                  预览简历
                </Button>
                <Button size="large" block onClick={exportResume}>
                  导出PDF
                </Button>
                <Button size="large" block>
                  使用模板
                </Button>
              </Space>
            </Card>

            {/* 简历提示 */}
            <Card title="简历小贴士">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                  • 简历长度最好控制在1-2页
                </Typography.Text>
                <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                  • 使用动词开头描述工作经历
                </Typography.Text>
                <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                  • 量化你的成就（如提高了XX%效率）
                </Typography.Text>
                <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                  • 根据应聘岗位调整重点
                </Typography.Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}