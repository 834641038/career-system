//密码找回页面
'use client'

import { useState } from 'react'
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message, 
  Steps,
  Result
} from 'antd'
import { 
  MailOutlined, 
  LockOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { authService } from '@/app/services/authService'
import VerificationCode from '@/app/components/VerificationCode'

const { Title, Text, Paragraph } = Typography

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const router = useRouter()

  const steps = [
    {
      title: '验证身份',
      description: '输入邮箱地址'
    },
    {
      title: '验证邮箱',
      description: '输入验证码'
    },
    {
      title: '重置密码',
      description: '设置新密码'
    }
  ]

  const handleEmailSubmit = async (values: any) => {
    setLoading(true)
    try {
      const result = await authService.forgotPassword(values.email)
      if (result.success) {
        setEmail(values.email)
        setCurrentStep(1)
        message.success('验证码已发送至您的邮箱')
      } else {
        message.error(result.message || '发送重置邮件失败')
      }
    } catch (error: any) {
      message.error(error.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSubmit = async (values: any) => {
    // 验证码验证逻辑
    setCurrentStep(2)
  }

  const handlePasswordReset = async (values: any) => {
    setLoading(true)
    try {
      // 这里需要从URL获取token或者通过其他方式传递
      const result = await authService.resetPassword('temp-token', values.newPassword)
      if (result.success) {
        message.success('密码重置成功')
        router.push('/login')
      } else {
        message.error(result.message || '密码重置失败')
      }
    } catch (error: any) {
      message.error(error.message || '密码重置失败')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            name="forgot-password-email"
            onFinish={handleEmailSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="请输入注册邮箱" 
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
              >
                发送验证码
              </Button>
            </Form.Item>
          </Form>
        )
      
      case 1:
        return (
          <Form
            name="forgot-password-verify"
            onFinish={handleVerificationSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="verificationCode"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <VerificationCode 
                emailField="email"
                action="reset"
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
              >
                验证邮箱
              </Button>
            </Form.Item>
          </Form>
        )
      
      case 2:
        return (
          <Form
            name="forgot-password-reset"
            onFinish={handlePasswordReset}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6位字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入新密码"
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请确认新密码"
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
              >
                重置密码
              </Button>
            </Form.Item>
          </Form>
        )
      
      default:
        return null
    }
  }

  if (currentStep === 3) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px'
      }}>
        <Result
          status="success"
          title="密码重置成功"
          subTitle="您的密码已成功重置，请使用新密码登录"
          extra={[
            <Button 
              type="primary" 
              key="login"
              onClick={() => router.push('/login')}
            >
              立即登录
            </Button>
          ]}
        />
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Title level={2}>找回密码</Title>
            <Text type="secondary">通过以下步骤重置您的账户密码</Text>
          </div>
          
          <Steps 
            current={currentStep} 
            items={steps}
            style={{ marginBottom: '30px' }}
          />
          
          {renderStepContent()}
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button 
              type="link" 
              onClick={() => router.push('/login')}
            >
              返回登录
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}