'use client'

import { Spin, Typography } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

export default function Loading() {
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
      <Spin 
        indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} 
        size="large"
      />
      <Title level={3} style={{ marginTop: '24px', color: '#1890ff' }}>
        正在加载中...
      </Title>
      <Paragraph type="secondary" style={{ marginTop: '8px' }}>
        请稍候，我们正在为您准备内容
      </Paragraph>
      
      {/* 加载进度条 */}
      <div style={{ 
        width: '300px', 
        height: '4px', 
        background: '#f0f0f0', 
        borderRadius: '2px',
        marginTop: '24px',
        overflow: 'hidden'
      }}>
        <div 
          style={{
            width: '60%',
            height: '100%',
            background: 'linear-gradient(90deg, #1890ff, #40a9ff)',
            borderRadius: '2px',
            animation: 'loading 1.5s ease-in-out infinite'
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 60%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}