// 简历填写页面
'use client'
import { useState, useEffect } from 'react'
import { 
  PageContainer,
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
  ProFormTextArea,
  ProFormGroup,
  ProFormList,
  ProFormItem,
  ProFormSwitch
} from '@ant-design/pro-components'
import { 
  Card, 
  Button, 
  Typography, 
  message, 
  Row, 
  Col,
  Space,
  Upload,
  Modal
} from 'antd'
import { 
  SaveOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BankOutlined,
  TrophyOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { 
  ResumeData, 
  ResumeBasicInfo, 
  JobIntention, 
  EducationExperience,
  WorkExperience,
  ProjectExperience,
  SkillCertificate,
  SelfEvaluation,
  RESUME_STORAGE_KEY
} from '@/lib/types/resume'

import { completeUserData } from '@/lib/services/userService';
import { StorageManager } from '@/lib/utils/storage';


const { Title } = Typography

export default function ResumeEditPage() {
  const router = useRouter()
  const [form] = ProForm.useForm()
  const [loading, setLoading] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)

  // 初始化表单数据
  useEffect(() => {
    const savedData = localStorage.getItem(RESUME_STORAGE_KEY)
    if (savedData) {
      try {
        const resumeData: ResumeData = JSON.parse(savedData)
        // 将日期字符串转换为dayjs对象
        const formData = {
          ...resumeData,
          basicInfo: {
            ...resumeData.basicInfo,
            birthday: resumeData.basicInfo.birthday ? dayjs(resumeData.basicInfo.birthday) : null
          },
          educationExperiences: resumeData.educationExperiences.map(edu => ({
            ...edu,
            startDate: edu.startDate ? dayjs(edu.startDate) : null,
            endDate: edu.endDate ? dayjs(edu.endDate) : null
          })),
          workExperiences: resumeData.workExperiences.map(work => ({
            ...work,
            startDate: work.startDate ? dayjs(work.startDate) : null,
            endDate: work.isCurrent ? null : (work.endDate ? dayjs(work.endDate) : null)
          })),
          projectExperiences: resumeData.projectExperiences.map(project => ({
            ...project,
            startDate: project.startDate ? dayjs(project.startDate) : null,
            endDate: project.isCurrent ? null : (project.endDate ? dayjs(project.endDate) : null)
          }))
        }
        form.setFieldsValue(formData)
      } catch (error) {
        console.error('解析简历数据失败:', error)
      }
    }
  }, [form])

  // 保存草稿
  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields()
      const resumeData: ResumeData = {
        ...values,
        // 转换日期对象为字符串
        basicInfo: {
          ...values.basicInfo,
          birthday: values.basicInfo.birthday ? values.basicInfo.birthday.format('YYYY-MM-DD') : ''
        },
        educationExperiences: values.educationExperiences?.map((edu: any) => ({
          ...edu,
          startDate: edu.startDate ? edu.startDate.format('YYYY-MM') : '',
          endDate: edu.endDate ? edu.endDate.format('YYYY-MM') : ''
        })) || [],
        workExperiences: values.workExperiences?.map((work: any) => ({
          ...work,
          startDate: work.startDate ? work.startDate.format('YYYY-MM') : '',
          endDate: work.isCurrent ? '' : (work.endDate ? work.endDate.format('YYYY-MM') : '')
        })) || [],
        projectExperiences: values.projectExperiences?.map((project: any) => ({
          ...project,
          startDate: project.startDate ? project.startDate.format('YYYY-MM') : '',
          endDate: project.isCurrent ? '' : (project.endDate ? project.endDate.format('YYYY-MM') : '')
        })) || [],
        updatedAt: new Date().toISOString()
      }
      
      localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resumeData))
      message.success('简历草稿保存成功')
    } catch (error) {
      message.error('表单验证失败，请检查输入内容')
    }
  }

  // 提交简历
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields()
      const resumeData: ResumeData = {
        ...values,
        basicInfo: {
          ...values.basicInfo,
          birthday: values.basicInfo.birthday ? values.basicInfo.birthday.format('YYYY-MM-DD') : ''
        },
        educationExperiences: values.educationExperiences?.map((edu: any) => ({
          ...edu,
          startDate: edu.startDate ? edu.startDate.format('YYYY-MM') : '',
          endDate: edu.endDate ? edu.endDate.format('YYYY-MM') : ''
        })) || [],
        workExperiences: values.workExperiences?.map((work: any) => ({
          ...work,
          startDate: work.startDate ? work.startDate.format('YYYY-MM') : '',
          endDate: work.isCurrent ? '' : (work.endDate ? work.endDate.format('YYYY-MM') : '')
        })) || [],
        projectExperiences: values.projectExperiences?.map((project: any) => ({
          ...project,
          startDate: project.startDate ? project.startDate.format('YYYY-MM') : '',
          endDate: project.isCurrent ? '' : (project.endDate ? project.endDate.format('YYYY-MM') : '')
        })) || [],
        updatedAt: new Date().toISOString()
      }
      
      localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resumeData))
      message.success('简历提交成功')
      router.push('/profile/resume/preview')
    } catch (error) {
      message.error('表单验证失败，请检查输入内容')
    } finally {
      setLoading(false)
    }
  }

  // 预览简历
  const handlePreview = async () => {
    try {
      await form.validateFields()
      setPreviewVisible(true)
    } catch (error) {
      message.warning('请先完善必填信息再进行预览')
    }
  }

  // 添加教育经历
  const handleAddEducation = () => {
    const educationList = form.getFieldValue('educationExperiences') || []
    form.setFieldValue('educationExperiences', [...educationList, {
      id: Date.now().toString(),
      school: '',
      major: '',
      degree: undefined,
      startDate: null,
      endDate: null,
      gpa: '',
      description: ''
    }])
    message.success('已添加新的教育经历')
  }

  // 添加技能
  const handleAddSkill = () => {
    const skills = form.getFieldValue('skills') || []
    form.setFieldValue('skills', [...skills, {
      id: Date.now().toString(),
      name: '',
      level: undefined
    }])
    message.success('已添加新技能')
  }

  // 添加工作经历
  const handleAddWorkExperience = () => {
    const workList = form.getFieldValue('workExperiences') || []
    form.setFieldValue('workExperiences', [...workList, { 
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: null,
      endDate: null,
      isCurrent: false,
      description: '',
      achievements: []
    }])
    message.success('已添加新的工作经历')
  }

  // 添加项目经验
  const handleAddProjectExperience = () => {
    const projectList = form.getFieldValue('projectExperiences') || []
    form.setFieldValue('projectExperiences', [...projectList, { 
      id: Date.now().toString(),
      projectName: '',
      role: '',
      startDate: null,
      endDate: null,
      isCurrent: false,
      description: '',
      technologies: [],
      link: ''
    }])
    message.success('已添加新的项目经验')
  }

  // 删除教育经历
  const handleRemoveEducation = (index: number) => {
    const educationList = form.getFieldValue('educationExperiences') || []
    const newList = educationList.filter((_: any, i: number) => i !== index)
    form.setFieldValue('educationExperiences', newList)
    message.info('已删除该教育经历')
  }

  // 删除技能
  const handleRemoveSkill = (index: number) => {
    const skills = form.getFieldValue('skills') || []
    const newSkills = skills.filter((_: any, i: number) => i !== index)
    form.setFieldValue('skills', newSkills)
    message.info('已删除该技能')
  }

  // 删除工作经历
  const handleRemoveWorkExperience = (index: number) => {
    const workList = form.getFieldValue('workExperiences') || []
    const newList = workList.filter((_: any, i: number) => i !== index)
    form.setFieldValue('workExperiences', newList)
    message.info('已删除该工作经历')
  }

  // 删除项目经验
  const handleRemoveProjectExperience = (index: number) => {
    const projectList = form.getFieldValue('projectExperiences') || []
    const newList = projectList.filter((_: any, i: number) => i !== index)
    form.setFieldValue('projectExperiences', newList)
    message.info('已删除该项目经验')
  }

  // 处理在职状态切换
  const handleWorkCurrentChange = (index: number, checked: boolean) => {
    form.setFieldsValue({
      workExperiences: form.getFieldValue('workExperiences').map((item: any, i: number) => 
        i === index ? { ...item, isCurrent: checked, endDate: checked ? null : item.endDate } : item
      )
    })
  }

  // 处理项目进行中状态切换
  const handleProjectCurrentChange = (index: number, checked: boolean) => {
    form.setFieldsValue({
      projectExperiences: form.getFieldValue('projectExperiences').map((item: any, i: number) => 
        i === index ? { ...item, isCurrent: checked, endDate: checked ? null : item.endDate } : item
      )
    })
  }

  return (
    <PageContainer
      title="简历填写"
      subTitle="完善您的个人信息，创建专业的在线简历"
      extra={[
        <Button 
          key="save" 
          icon={<SaveOutlined />}
          onClick={handleSaveDraft}
        >
          暂存
        </Button>,
        <Button 
          key="preview" 
          icon={<EyeOutlined />}
          onClick={handlePreview}
        >
          预览
        </Button>
      ]}
    >
      <ProForm
        form={form}
        submitter={false}
        layout="vertical"
        autoFocusFirstInput
      >
        <Row gutter={[24, 24]}>
          {/* 基本信息 */}
          <Col span={24}>
            <Card title="基本信息" bordered={false}>
              <ProFormGroup>
                <ProFormText
                  name={['basicInfo', 'name']}
                  label="姓名"
                  placeholder="请输入真实姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                  fieldProps={{
                    prefix: <UserOutlined />,
                    size: 'large'
                  }}
                />
                <ProFormText
                  name={['basicInfo', 'email']}
                  label="邮箱"
                  placeholder="请输入邮箱地址"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '邮箱格式不正确' }
                  ]}
                  fieldProps={{
                    prefix: <MailOutlined />,
                    size: 'large'
                  }}
                />
              </ProFormGroup>
              
              <ProFormGroup>
                <ProFormText
                  name={['basicInfo', 'phone']}
                  label="手机号码"
                  placeholder="请输入手机号码"
                  rules={[
                    { required: true, message: '请输入手机号码' },
                    { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确' }
                  ]}
                  fieldProps={{
                    prefix: <PhoneOutlined />,
                    size: 'large'
                  }}
                />
                <ProFormSelect
                  name={['basicInfo', 'gender']}
                  label="性别"
                  options={[
                    { label: '男', value: 'male' },
                    { label: '女', value: 'female' },
                    { label: '其他', value: 'other' }
                  ]}
                  placeholder="请选择性别"
                  rules={[{ required: true, message: '请选择性别' }]}
                />
              </ProFormGroup>
              
              <ProFormDatePicker
                name={['basicInfo', 'birthday']}
                label="出生日期"
                placeholder="请选择出生日期"
                rules={[{ required: true, message: '请选择出生日期' }]}
                fieldProps={{
                  size: 'large',
                  format: 'YYYY-MM-DD'
                }}
              />
              
              <ProFormText
                name={['basicInfo', 'location']}
                label="所在城市"
                placeholder="请输入所在城市"
                rules={[{ required: true, message: '请输入所在城市' }]}
                fieldProps={{
                  prefix: <EnvironmentOutlined />,
                  size: 'large'
                }}
              />
            </Card>
          </Col>

          {/* 求职意向 */}
          <Col span={24}>
            <Card title="求职意向" bordered={false}>
              <ProFormGroup>
                <ProFormText
                  name={['jobIntention', 'position']}
                  label="期望职位"
                  placeholder="如：前端开发工程师"
                  rules={[{ required: true, message: '请输入期望职位' }]}
                />
                <ProFormText
                  name={['jobIntention', 'industry']}
                  label="期望行业"
                  placeholder="如：互联网/IT"
                  rules={[{ required: true, message: '请输入期望行业' }]}
                />
              </ProFormGroup>
              
              <ProFormGroup>
                <ProFormText
                  name={['jobIntention', 'salaryExpectation']}
                  label="期望薪资"
                  placeholder="如：10K-15K"
                  rules={[{ required: true, message: '请输入期望薪资' }]}
                />
                <ProFormText
                  name={['jobIntention', 'workLocation']}
                  label="工作地点"
                  placeholder="如：北京"
                  rules={[{ required: true, message: '请输入工作地点' }]}
                />
              </ProFormGroup>
              
              <ProFormSelect
                name={['jobIntention', 'employmentType']}
                label="工作性质"
                options={[
                  { label: '全职', value: 'full-time' },
                  { label: '兼职', value: 'part-time' },
                  { label: '实习', value: 'internship' },
                  { label: '自由职业', value: 'freelance' }
                ]}
                placeholder="请选择工作性质"
                rules={[{ required: true, message: '请选择工作性质' }]}
              />
            </Card>
          </Col>

          {/* 教育经历 */}
          <Col span={24}>
            <Card 
              title="教育经历" 
              bordered={false}
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddEducation}
                >
                  添加教育经历
                </Button>
              }
            >
              <ProFormList
                name="educationExperiences"
                creatorRecord={{}} // 默认空对象
                creatorButtonProps={false} // 隐藏默认添加按钮
              >
                {(meta, index) => (
                  <Card 
                    size="small" 
                    title={`教育经历 ${index + 1}`}
                    extra={
                      <Button 
                        icon={<DeleteOutlined />} 
                        danger
                        onClick={() => handleRemoveEducation(index)}
                      >
                        删除
                      </Button>
                    }
                    style={{ marginBottom: 16 }}
                  >
                    <ProFormGroup>
                      <ProFormText
                        name="school"
                        label="学校名称"
                        placeholder="请输入学校名称"
                        rules={[{ required: true, message: '请输入学校名称' }]}
                      />
                      <ProFormText
                        name="major"
                        label="专业"
                        placeholder="请输入专业名称"
                        rules={[{ required: true, message: '请输入专业名称' }]}
                      />
                    </ProFormGroup>
                    
                    <ProFormGroup>
                      <ProFormSelect
                        name="degree"
                        label="学历"
                        options={[
                          { label: '专科', value: 'associate' },
                          { label: '本科', value: 'bachelor' },
                          { label: '硕士', value: 'master' },
                          { label: '博士', value: 'doctor' }
                        ]}
                        placeholder="请选择学历"
                        rules={[{ required: true, message: '请选择学历' }]}
                      />
                      <ProFormText
                        name="gpa"
                        label="GPA/成绩"
                        placeholder="如：3.8/4.0 或 专业前10%"
                      />
                    </ProFormGroup>
                    
                    <ProFormGroup>
                      <ProFormDatePicker
                        name="startDate"
                        label="入学时间"
                        placeholder="请选择入学时间"
                        rules={[{ required: true, message: '请选择入学时间' }]}
                        fieldProps={{
                          picker: 'month',
                          format: 'YYYY-MM'
                        }}
                      />
                      <ProFormDatePicker
                        name="endDate"
                        label="毕业时间"
                        placeholder="请选择毕业时间"
                        rules={[{ required: true, message: '请选择毕业时间' }]}
                        fieldProps={{
                          picker: 'month',
                          format: 'YYYY-MM'
                        }}
                      />
                    </ProFormGroup>
                    
                    <ProFormTextArea
                      name="description"
                      label="在校经历描述"
                      placeholder="描述在校期间的学习成果、获奖情况等"
                      fieldProps={{
                        autoSize: { minRows: 3, maxRows: 6 }
                      }}
                    />
                  </Card>
                )}
              </ProFormList>
            </Card>
          </Col>

          {/* 工作/实习经历 */}
          <Col span={24}>
            <Card 
              title="工作/实习经历" 
              bordered={false}
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddWorkExperience}
                >
                  添加工作经历
                </Button>
              }
            >
              <ProFormList
                name="workExperiences"
                creatorRecord={{ isCurrent: false }}
                creatorButtonProps={false}
              >
                {(meta, index) => (
                  <Card 
                    size="small" 
                    title={`工作经历 ${index + 1}`}
                    extra={
                      <Button 
                        icon={<DeleteOutlined />} 
                        danger
                        onClick={() => handleRemoveWorkExperience(index)}
                      >
                        删除
                      </Button>
                    }
                    style={{ marginBottom: 16 }}
                  >
                    <ProFormGroup>
                      <ProFormText
                        name="company"
                        label="公司名称"
                        placeholder="请输入公司名称"
                        rules={[{ required: true, message: '请输入公司名称' }]}
                        fieldProps={{
                          prefix: <BankOutlined />
                        }}
                      />
                      <ProFormText
                        name="position"
                        label="职位"
                        placeholder="请输入职位名称"
                        rules={[{ required: true, message: '请输入职位名称' }]}
                      />
                    </ProFormGroup>
                    
                    <ProFormGroup>
                      <ProFormDatePicker
                        name="startDate"
                        label="入职时间"
                        placeholder="请选择入职时间"
                        rules={[{ required: true, message: '请选择入职时间' }]}
                        fieldProps={{
                          picker: 'month',
                          format: 'YYYY-MM'
                        }}
                      />
                      <ProFormDatePicker
                        name="endDate"
                        label="离职时间"
                        placeholder="请选择离职时间"
                        fieldProps={{
                          picker: 'month',
                          format: 'YYYY-MM'
                        }}
                        disabled={(form.getFieldValue(['workExperiences', index, 'isCurrent']))}
                      />
                    </ProFormGroup>
                    
                    <ProForm.Item
                      name="isCurrent"
                      label="是否在职"
                      valuePropName="checked"
                    >
                      <ProFormSwitch 
                        fieldProps={{
                          onChange: (checked) => handleWorkCurrentChange(index, checked)
                        }}
                      />
                    </ProForm.Item>
                    
                    <ProFormTextArea
                      name="description"
                      label="工作描述"
                      placeholder="详细描述工作职责和内容"
                      rules={[{ required: true, message: '请输入工作描述' }]}
                      fieldProps={{
                        autoSize: { minRows: 4, maxRows: 8 }
                      }}
                    />
                    
                    <ProFormList
                      name="achievements"
                      label="主要成就"
                      creatorButtonProps={{
                        creatorButtonText: '添加成就'
                      }}
                    >
                      <ProFormText placeholder="如：带领团队完成XX项目，提升效率30%" />
                    </ProFormList>
                  </Card>
                )}
              </ProFormList>
            </Card>
          </Col>

          {/* 项目经验 */}
          <Col span={24}>
            <Card 
              title="项目经验" 
              bordered={false}
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddProjectExperience}
                >
                  添加项目经验
                </Button>
              }
            >
              <ProFormList
                name="projectExperiences"
                creatorRecord={{ isCurrent: false }}
                creatorButtonProps={false}
              >
                {(meta, index) => (
                  <Card 
                    size="small" 
                    title={`项目经验 ${index + 1}`}
                    extra={
                      <Button 
                        icon={<DeleteOutlined />} 
                        danger
                        onClick={() => handleRemoveProjectExperience(index)}
                      >
                        删除
                      </Button>
                    }
                    style={{ marginBottom: 16 }}
                  >
                    <ProFormGroup>
                      <ProFormText
                        name="projectName"
                        label="项目名称"
                        placeholder="请输入项目名称"
                        rules={[{ required: true, message: '请输入项目名称' }]}
                      />
                      <ProFormText
                        name="role"
                        label="担任角色"
                        placeholder="如：前端负责人"
                        rules={[{ required: true, message: '请输入担任角色' }]}
                      />
                    </ProFormGroup>
                    
                    <ProFormGroup>
                      <ProFormDatePicker
                        name="startDate"
                        label="开始时间"
                        placeholder="请选择开始时间"
                        rules={[{ required: true, message: '请选择开始时间' }]}
                        fieldProps={{
                          picker: 'month',
                          format: 'YYYY-MM'
                        }}
                      />
                      <ProFormDatePicker
                        name="endDate"
                        label="结束时间"
                        placeholder="请选择结束时间"
                        fieldProps={{
                          picker: 'month',
                          format: 'YYYY-MM'
                        }}
                        disabled={(form.getFieldValue(['projectExperiences', index, 'isCurrent']))}
                      />
                    </ProFormGroup>
                    
                    <ProForm.Item
                      name="isCurrent"
                      label="是否进行中"
                      valuePropName="checked"
                    >
                      <ProFormSwitch 
                        fieldProps={{
                          onChange: (checked) => handleProjectCurrentChange(index, checked)
                        }}
                      />
                    </ProForm.Item>
                    
                    <ProFormTextArea
                      name="description"
                      label="项目描述"
                      placeholder="详细描述项目背景、目标和技术方案"
                      rules={[{ required: true, message: '请输入项目描述' }]}
                      fieldProps={{
                        autoSize: { minRows: 4, maxRows: 8 }
                      }}
                    />
                    
                    <ProFormList
                      name="technologies"
                      label="使用技术"
                      creatorButtonProps={{
                        creatorButtonText: '添加技术'
                      }}
                    >
                      <ProFormText placeholder="如：React, TypeScript, Node.js" />
                    </ProFormList>
                    
                    <ProFormText
                      name="link"
                      label="项目链接"
                      placeholder="如：GitHub地址或项目演示链接"
                    />
                  </Card>
                )}
              </ProFormList>
            </Card>
          </Col>

          {/* 技能证书 */}
          <Col span={24}>
            <Card 
              title="技能证书" 
              bordered={false}
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddSkill}
                >
                  添加技能
                </Button>
              }
            >
              <ProFormList
                name="skills"
                creatorRecord={{}}
                creatorButtonProps={false}
              >
                {(meta, index) => (
                  <Card 
                    size="small" 
                    title={`技能 ${index + 1}`}
                    extra={
                      <Button 
                        icon={<DeleteOutlined />} 
                        danger
                        onClick={() => handleRemoveSkill(index)}
                      >
                        删除
                      </Button>
                    }
                    style={{ marginBottom: 16 }}
                  >
                    <ProFormGroup>
                      <ProFormText
                        name="name"
                        label="技能名称"
                        placeholder="如：JavaScript"
                        rules={[{ required: true, message: '请输入技能名称' }]}
                      />
                      <ProFormSelect
                        name="level"
                        label="掌握程度"
                        options={[
                          { label: '基础', value: 'basic' },
                          { label: '熟练', value: 'proficient' },
                          { label: '精通', value: 'expert' }
                        ]}
                        placeholder="请选择掌握程度"
                        rules={[{ required: true, message: '请选择掌握程度' }]}
                      />
                    </ProFormGroup>
                  </Card>
                )}
              </ProFormList>
            </Card>
          </Col>

          {/* 自我评价 */}
          <Col span={24}>
            <Card title="自我评价" bordered={false}>
              <ProFormTextArea
                name={['selfEvaluation', 'content']}
                placeholder="请简要介绍您的专业能力、性格特点和职业规划"
                rules={[{ required: true, message: '请输入自我评价' }]}
                fieldProps={{
                  autoSize: { minRows: 6, maxRows: 12 },
                  showCount: { formatter: ({ count, maxLength }) => `${count}/${maxLength}` },
                  maxLength: 500
                }}
              />
            </Card>
          </Col>

          {/* 操作按钮 */}
          <Col span={24}>
            <div className="text-center py-6">
              <Space size="large">
                <Button 
                  size="large" 
                  onClick={() => router.back()}
                >
                  取消
                </Button>
                <Button 
                  size="large" 
                  icon={<SaveOutlined />}
                  onClick={handleSaveDraft}
                >
                  暂存
                </Button>
                <Button 
                  size="large" 
                  type="primary" 
                  icon={<TrophyOutlined />}
                  loading={loading}
                  onClick={handleSubmit}
                >
                  提交简历
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </ProForm>

      {/* 预览模态框 */}
      <Modal
        title="简历预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            onClick={() => {
              setPreviewVisible(false)
              router.push('/profile/resume/edit')
            }}
          >
            继续编辑
          </Button>
        ]}
        width={800}
      >
        <div className="text-center p-4">
          <Title level={4}>简历预览功能</Title>
          <p>点击"继续编辑"按钮可以完善简历信息，完成后将生成完整的在线简历。</p>
        </div>
      </Modal>
    </PageContainer>
  )
}