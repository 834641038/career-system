// 注册页面
'use client'

import { useState } from 'react'
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message 
} from 'antd'
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined 
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/app/services/authService'

const { Title, Text } = Typography

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onRegisterFinish = async (values: any) => {
    setLoading(true)
    
    try {
      const result = await authService.register({
        email: values.email,
        password: values.password,
        name: values.name,
        studentId: values.studentId,
        major: values.major
      })
      
      if (result.success) {
        message.success('注册成功！')
        // 注册成功后跳转到登录页面
        router.push('/login')
      } else {
        message.error(result.message || '注册失败')
      }
    } catch (error: any) {
      message.error(error.message || '注册过程中出现错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <Title level={2}>创建账户</Title>
            <Text type="secondary">加入我们的生涯规划平台</Text>
          </div>
          
          <Form
            name="register"
            onFinish={onRegisterFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="姓名" 
                autoComplete="name"
                size="large"
                style={{ fontSize: '16px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="邮箱地址" 
                autoComplete="email"
                size="large"
                style={{ fontSize: '16px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              name="studentId"
              rules={[{ required: true, message: '请输入学号' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="学号" 
                size="large"
                style={{ fontSize: '16px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              name="major"
              rules={[{ required: true, message: '请输入专业' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="专业" 
                size="large"
                style={{ fontSize: '16px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                autoComplete="new-password"
                size="large"
                style={{ fontSize: '16px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认密码"
                size="large"
                style={{ fontSize: '16px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
                style={{ height: '48px', fontSize: '16px' }}
              >
                注册
              </Button>
            </Form.Item>
          </Form>
          
          <div className="auth-footer">
            <Text type="secondary">
              已有账号？{' '}
              <Link href="/login" style={{ color: '#1890ff' }}>
                立即登录
              </Link>
            </Text>
          </div>
        </Card>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
          padding: 20px;
        }
        
        .auth-container {
          width: 100%;
          max-width: 480px;
        }
        
        .auth-card {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 1px solid #f0f0f0;
        }
        
        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .auth-header h2 {
          font-size: 24px;
          font-weight: 500;
          color: #262626;
          margin-bottom: 8px;
        }
        
        .auth-header .ant-typography-secondary {
          font-size: 14px;
          color: #8c8c8c;
        }
        
        .auth-footer {
          text-align: center;
          margin-top: 16px;
        }
        
        :global(.ant-input-affix-wrapper) {
          font-size: 16px;
          height: 48px;
        }
        
        :global(.ant-form-item-label > label) {
          font-size: 14px;
          color: #595959;
        }
      `}</style>
    </div>
  )
}