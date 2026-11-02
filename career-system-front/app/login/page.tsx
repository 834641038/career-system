// 登录页面
'use client'

import { useState } from 'react'
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message, 
  Checkbox
} from 'antd'
import { 
  LockOutlined, 
  MailOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/app/services/authService'

const { Title, Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const onLoginFinish = async (values: any) => {
    setLoading(true)
    
    try {
      const result = await authService.login({
        email: values.email,
        password: values.password,
        rememberMe: values.remember
      })
      
      if (result.success) {
        message.success('登录成功！')
        // 存储用户信息
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user))
        }
        router.push('/dashboard')
      } else {
        message.error(result.message || '登录失败')
      }
    } catch (error: any) {
      message.error(error.message || '登录过程中出现错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <Title level={2}>欢迎回来</Title>
            <Text type="secondary">登录你的生涯规划账户</Text>
          </div>
          
          <Form
            name="login"
            onFinish={onLoginFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱/用户名' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="邮箱地址或用户名" 
                autoComplete="username"
                size="large"
                className="large-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                autoComplete="current-password"
                size="large"
                className="large-input"
              />
            </Form.Item>

            <Form.Item>
              <div className="form-row">
                <Checkbox 
                  name="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  记住我
                </Checkbox>
                <Link href="/forgot-password" className="auth-link">
                  忘记密码？
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
                className="primary-btn"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-footer">
          <Text type="secondary">
              还没有账号？{' '}
              <Link href="/register" className="auth-link">
                立即注册
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
        
        .auth-link {
          color: #1890ff;
          font-size: 14px;
        }
        
        :global(.ant-input-affix-wrapper) {
          font-size: 16px;
          height: 48px;
        }
        
        :global(.ant-form-item-label > label) {
          font-size: 14px;
          color: #595959;
        }
        
        :global(.ant-checkbox-wrapper) {
          font-size: 14px;
          color: #595959;
        }

        /* 新增的类样式以替换内联样式 */
        .large-input {
          font-size: 16px;
          height: 48px;
        }

        .form-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .primary-btn {
          height: 48px;
          font-size: 16px;
        }
      `}</style>
    </div>
  )
}