//第三方登录组件
'use client'

import { Button, Space, Divider } from 'antd'
import { 
  WechatOutlined, 
  QqOutlined, 
  GoogleOutlined,
  GithubOutlined
} from '@ant-design/icons'
import { message } from 'antd'
import { authService } from '@/app/services/authService'

export default function SocialLogin() {
  const handleSocialLogin = async (provider: string) => {
    try {
      const result = await authService.socialLogin(provider)
      
      if (result.success) {
        message.success(`${provider}登录成功`)
        // 处理登录成功后的跳转
        window.location.href = '/dashboard'
      } else {
        message.error(result.message || `${provider}登录失败`)
      }
    } catch (error: any) {
      message.error(error.message || `${provider}登录过程中出现错误`)
    }
  }

  return (
    <>
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <Space size="large">
          <Button
            icon={<WechatOutlined />}
            onClick={() => handleSocialLogin('wechat')}
            shape="circle"
            size="large"
          />
          <Button
            icon={<QqOutlined />}
            onClick={() => handleSocialLogin('qq')}
            shape="circle"
            size="large"
          />
          <Button
            icon={<GoogleOutlined />}
            onClick={() => handleSocialLogin('google')}
            shape="circle"
            size="large"
          />
          <Button
            icon={<GithubOutlined />}
            onClick={() => handleSocialLogin('github')}
            shape="circle"
            size="large"
          />
        </Space>
      </div>
      
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#888', margin: '8px 0' }}>
        或使用第三方账号登录
      </div>
    </>
  )
}