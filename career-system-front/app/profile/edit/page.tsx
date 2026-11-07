// app/profile/edit/page.tsx
// 编辑用户的个人信息
'use client'
import { useState } from 'react'
import { 
  Card, 
  Button, 
  Typography, 
  Form, 
  Input, 
  Upload, 
  message, 
  Row, 
  Col,
  Avatar,
  Select,
  DatePicker
} from 'antd'
import { 
  UserOutlined, 
  EditOutlined, 
  UploadOutlined,
  ArrowLeftOutlined 
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/app/lib/routes'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

import LoginRequired, { useLoginGuard } from '@/app/components/LoginRequired'

export default function EditProfilePage() {
  const { checked, needLogin } = useLoginGuard()
  if (!checked) return null
  if (needLogin) return <LoginRequired pageName="个人资料编辑" />
  return <EditProfilePageInner />
}

function EditProfilePageInner() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')

  // 模拟当前用户数据
  const currentUserData = {
    name: '张三',
    email: 'zhangsan@example.com',
    bio: '计算机科学与技术专业学生，热爱前端开发和UI设计',
    phone: '138-0013-8000',
    location: '北京市',
    gender: 'male',
    birthday: '2000-01-15',
    university: '北京大学',
    major: '计算机科学与技术',
    grade: '大三'
  }

  const handleSave = async (values: any) => {
    setLoading(true)
    try {
      // 这里应该是实际的API调用
      console.log('保存的数据:', values)
      await new Promise(resolve => setTimeout(resolve, 1000))
      message.success('个人信息更新成功')
      router.push(ROUTES.PROFILE)
    } catch (error) {
      message.error('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      // 模拟上传成功
      setAvatarUrl('https://example.com/new-avatar.jpg')
      message.success('头像上传成功')
    }
  }

  const uploadProps = {
    name: 'avatar',
    action: '/api/upload',
    showUploadList: false,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('只能上传图片文件')
        return false
      }
      return true
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          返回个人中心
        </Button>
        <Title level={2}>编辑个人信息</Title>
        <Text type="secondary">更新您的个人资料和偏好设置</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={currentUserData}
        onFinish={handleSave}
      >
        <Row gutter={[24, 16]}>
          {/* 头像上传 */}
          <Col span={24}>
            <Card title="头像设置">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />}
                  src={avatarUrl || null}
                  style={{ marginBottom: 16, backgroundColor: '#1890ff' }}
                />
                <div>
                  <Upload {...uploadProps} onChange={handleAvatarChange}>
                    <Button icon={<UploadOutlined />}>更换头像</Button>
                  </Upload>
                  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                    支持 JPG、PNG 格式，大小不超过 2MB
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* 基本信息 */}
          <Col span={24}>
            <Card title="基本信息">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="姓名"
                    rules={[{ required: true, message: '请输入姓名' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '邮箱格式不正确' }
                    ]}
                  >
                    <Input placeholder="请输入邮箱" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="bio" label="个人简介">
                <TextArea 
                  rows={4} 
                  placeholder="介绍一下你自己..."
                  maxLength={200}
                  showCount
                />
              </Form.Item>
            </Card>
          </Col>

          {/* 联系信息 */}
          <Col span={24}>
            <Card title="联系信息">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="phone" label="手机号码">
                    <Input placeholder="请输入手机号码" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="location" label="所在地区">
                    <Input placeholder="请输入所在地区" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 教育信息 */}
          <Col span={24}>
            <Card title="教育信息">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="university" label="学校">
                    <Input placeholder="请输入学校名称" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="major" label="专业">
                    <Input placeholder="请输入专业" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="grade" label="年级">
                    <Select placeholder="请选择年级">
                      <Option value="freshman">大一</Option>
                      <Option value="sophomore">大二</Option>
                      <Option value="junior">大三</Option>
                      <Option value="senior">大四</Option>
                      <Option value="graduate">研究生</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 操作按钮 */}
          <Col span={24}>
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<EditOutlined />}
                size="large"
                style={{ marginRight: 16 }}
              >
                保存更改
              </Button>
              <Button 
                onClick={() => router.back()}
                size="large"
              >
                取消
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  )
}