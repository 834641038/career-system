// d:\career-system\app\register\page.tsx
'use client'
import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Tabs, Divider, Space } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'

const { Title, Text } = Typography
const { TabPane } = Tabs

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onRegisterFinish = (values: any) => {
    setLoading(true)
    
    setTimeout(() => {
      setLoading(false)
      message.success('注册成功！请登录')
      // 跳转到登录页面
      router.push(ROUTES.LOGIN)
    }, 1000)
  }

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

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <Title level={2}>创建账户</Title>
            <Text type="secondary">加入我们的生涯规划平台</Text>
          </div>
          
          <Tabs activeKey="register" centered>
            <TabPane tab="注册" key="register">
              <Form
                name="register"
                onFinish={onRegisterFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="请输入用户名" 
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="邮箱"
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
                  label="密码"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请再次输入密码"
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
              
              <div className="login-footer">
                <Text type="secondary">
                  已有账号？{' '}
                  <Link href="/login" style={{ color: '#1890ff' }}>
                    立即登录
                  </Link>
                </Text>
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}