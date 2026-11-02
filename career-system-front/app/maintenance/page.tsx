'use client'

import { Typography, Progress, Button } from 'antd'
import { ToolOutlined, HomeOutlined, WechatOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'

const { Title, Paragraph } = Typography

export default function Maintenance() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(timer)
          return 95
        }
        return prev + 5
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <ToolOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
        
        <Title level={2} style={{ color: '#1890ff', marginBottom: '16px' }}>
          系统维护中
        </Title>
        
        <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
          为了给您提供更好的服务，我们正在进行系统升级和维护。
          预计完成时间：30分钟
        </Paragraph>

        <div style={{ marginBottom: '24px' }}>
          <Progress 
            percent={progress} 
            status="active" 
            strokeColor="#1890ff"
            format={() => `${progress}%`}
          />
        </div>

        <Paragraph type="secondary" style={{ marginBottom: '32px' }}>
          维护期间部分功能可能暂时不可用，我们正在努力尽快恢复服务。
        </Paragraph>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Button 
            type="primary" 
            icon={<WechatOutlined />}
            size="large"
          >
            联系客服
          </Button>
          <Button 
            icon={<HomeOutlined />}
            size="large"
            onClick={() => window.location.reload()}
          >
            刷新页面
          </Button>
        </div>

        <div style={{ 
          marginTop: '40px', 
          padding: '20px', 
          background: '#f6ffed', 
          borderRadius: '8px',
          border: '1px solid #b7eb8f'
        }}>
          <Paragraph style={{ margin: 0, color: '#52c41a' }}>
            <strong>最新进展：</strong>
            系统核心功能升级完成，正在进行最终测试...
          </Paragraph>
        </div>
      </div>
    </div>
  )
}