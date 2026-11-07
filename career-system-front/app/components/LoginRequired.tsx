// 未登录时的页面占位 + 登录引导弹窗
'use client'

import { useEffect, useState } from 'react'
import { Button, Modal, Space, Typography } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useAuthState } from '@/app/lib/useAuthState'

const { Title, Text } = Typography

/** 页面顶部调用：返回是否需要登录守卫 */
export function useLoginGuard() {
  const { checked, isAuthenticated } = useAuthState()
  return { checked, isAuthenticated, needLogin: checked && !isAuthenticated }
}

export default function LoginRequired({ pageName }: { pageName?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [])

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
      }}
    >
      <LockOutlined style={{ fontSize: 56, color: '#bfbfbf', marginBottom: 24 }} />
      <Title level={3} style={{ marginBottom: 8 }}>
        登录后查看{pageName || '个人数据'}
      </Title>
      <Text type="secondary" style={{ marginBottom: 24 }}>
        登录后可同步你的测评结果、生涯规划和学习记录
      </Text>
      <Space>
        <Button type="primary" size="large" onClick={() => router.push('/login')}>
          立即登录
        </Button>
        <Button size="large" onClick={() => router.push('/register')}>
          免费注册
        </Button>
      </Space>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        width={420}
        maskClosable={false}
      >
        <div style={{ textAlign: 'center', padding: '16px 8px 8px' }}>
          <LockOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={4} style={{ marginBottom: 8 }}>
            需要先登录
          </Title>
          <Text type="secondary">
            该页面展示的是你的个人数据，登录或注册后即可查看
          </Text>
          <Space
            direction="vertical"
            size="middle"
            style={{ marginTop: 24, width: '100%' }}
          >
            <Button type="primary" block size="large" onClick={() => router.push('/login')}>
              去登录
            </Button>
            <Button block size="large" onClick={() => router.push('/register')}>
              没有账号？免费注册
            </Button>
            <Button type="text" block onClick={() => setOpen(false)}>
              稍后再说
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  )
}
