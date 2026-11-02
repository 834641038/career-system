'use client'

import { Button, Result, Typography } from 'antd'
import { HomeOutlined, LeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const { Title, Paragraph } = Typography

export default function NotFound() {
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
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在"
        extra={[
          <Button 
            type="primary" 
            key="home"
            icon={<HomeOutlined />}
            onClick={() => router.push('/')}
            size="large"
          >
            返回首页
          </Button>,
          <Button 
            key="back"
            icon={<LeftOutlined />}
            onClick={() => router.back()}
            size="large"
          >
            返回上一页
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <Title level={4} style={{ color: '#666' }}>
            可能的原因：
          </Title>
          <Paragraph type="secondary">
            • 页面已被删除或移动<br/>
            • 输入的网址不正确<br/>
            • 链接已过期
          </Paragraph>
          <Paragraph style={{ marginTop: '24px' }}>
            如果您认为这是系统错误，请联系我们的技术支持团队。
          </Paragraph>
        </div>
      </Result>
    </div>
  )
}