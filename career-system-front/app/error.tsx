'use client'

import { Button, Result, Typography } from 'antd'
import { BugOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons'
import { useEffect } from 'react'

const { Title, Paragraph } = Typography

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

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
        status="error"
        title="页面加载出错"
        subTitle="抱歉，页面遇到了一些技术问题"
        extra={[
          <Button 
            type="primary" 
            key="reload"
            icon={<ReloadOutlined />}
            onClick={reset}
            size="large"
          >
            重新加载
          </Button>,
          <Button 
            key="home"
            icon={<HomeOutlined />}
            href="/"
            size="large"
          >
            返回首页
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <Title level={4} style={{ color: '#666' }}>
            <BugOutlined style={{ marginRight: '8px' }} />
            错误详情：
          </Title>
          <Paragraph 
            type="danger" 
            style={{ 
              background: '#fff2f0', 
              border: '1px solid #ffccc7', 
              borderRadius: '6px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          >
            {error.message}
          </Paragraph>
          <Paragraph type="secondary" style={{ marginTop: '16px' }}>
            我们的工程师已经收到此错误报告，正在紧急修复中。
            您可以尝试刷新页面或稍后再试。
          </Paragraph>
        </div>
      </Result>
    </div>
  )
}