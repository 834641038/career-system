'use client'
import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Tabs, Divider, Space } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'

const { Title, Text } = Typography
const { TabPane } = Tabs

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const router = useRouter()

  const onLoginFinish = (values: any) => {
    setLoading(true)
    
    // 模拟登录API调用
    setTimeout(() => {
      setLoading(false)
      message.success('登录成功！')
      // 跳转到仪表盘
      router.push(ROUTES.DASHBOARD)
    }, 1000)
  }

  const onRegisterFinish = (values: any) => {
    setLoading(true)
    
    setTimeout(() => {
      setLoading(false)
      message.success('注册成功！请登录')
      setActiveTab('login')
    }, 1000)
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <Title level={2}>欢迎回来</Title>
            <Text type="secondary">登录你的生涯规划账户</Text>
          </div>
          
          <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
            <TabPane tab="登录" key="login">
              <Form
                name="login"
                onFinish={onLoginFinish}
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
                    placeholder="请输入邮箱" 
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    block
                    size="large"
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
              
              <div className="login-footer">
                <Link href="/forgot-password">忘记密码？</Link>
                <Text type="secondary">
                  还没有账号？{' '}
                  <a onClick={() => setActiveTab('register')} style={{ color: '#1890ff', cursor: 'pointer' }}>
                    立即注册
                  </a>
                </Text>
              </div>
            </TabPane>

            <TabPane tab="注册" key="register">
              <Form
                name="register"
                onFinish={onRegisterFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="studentId"
                  rules={[{ required: true, message: '请输入学号' }]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="请输入学号" 
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
                    placeholder="请输入邮箱" 
                  />
                </Form.Item>

                <Form.Item
                  name="major"
                  rules={[{ required: true, message: '请输入专业' }]}
                >
                  <Input placeholder="专业（如：计算机科学）" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    block
                    size="large"
                  >
                    注册
                  </Button>
                </Form.Item>
              </Form>
              
              <div className="register-footer">
                <Text type="secondary">
                  已有账号？{' '}
                  <a onClick={() => setActiveTab('login')} style={{ color: '#1890ff', cursor: 'pointer' }}>
                    立即登录
                  </a>
                </Text>
              </div>
            </TabPane>
          </Tabs>

          <Divider>或</Divider>

          <div className="quick-navigation">
            <Text type="secondary">快速导航：</Text>
            <Space wrap style={{ marginTop: 8 }}>
              <Button type="link" onClick={() => router.push(ROUTES.DASHBOARD)}>
                直接体验（访客模式）
              </Button>
              <Button type="link" onClick={() => router.push(ROUTES.FEATURES)}>
                查看功能介绍
              </Button>
              <Button type="link" onClick={() => router.push(ROUTES.DEMO)}>
                观看演示视频
              </Button>
            </Space>
          </div>
        </Card>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
        }
        
        .login-container {
          width: 100%;
          max-width: 480px;
        }
        
        .login-card {
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .login-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
        }
        
        .register-footer {
          text-align: center;
          margin-top: 16px;
        }
        
        .quick-navigation {
          margin-top: 20px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}