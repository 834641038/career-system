'use client'

import { Button, Result, Typography } from 'antd'
import { DatabaseOutlined, HomeOutlined, ReloadOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const { Title, Paragraph } = Typography

export default function ServerError() {
  const router = useRouter()

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
        status="500"
        title="500"
        subTitle="服务器内部错误"
        extra={[
          <Button 
            type="primary" 
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => router.refresh()}
            size="large"
          >
            刷新页面
          </Button>,
          <Button 
            key="home"
            icon={<HomeOutlined />}
            onClick={() => router.push('/')}
            size="large"
          >
            返回首页
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <Title level={4} style={{ color: '#666' }}>
            <DatabaseOutlined style={{ marginRight: '8px' }} />
            服务器暂时无法响应请求
          </Title>
          <Paragraph type="secondary">
            我们的技术团队已经收到此问题通知，正在紧急处理中。<br/>
            请您稍后再试，或联系客服获取帮助。
          </Paragraph>
          <div style={{ 
            marginTop: '24px', 
            padding: '16px', 
            background: '#fffbe6', 
            borderRadius: '6px',
            border: '1px solid #ffe58f'
          }}>
            <Paragraph style={{ margin: 0, fontSize: '12px', color: '#d48806' }}>
              <strong>提示：</strong>如果问题持续存在，请截图保存错误信息并联系技术支持。
            </Paragraph>
          </div>
        </div>
      </Result>
    </div>
  )
}