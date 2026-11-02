//验证码组件
'use client'

import { useState, useRef } from 'react'
import { Input, Button, Space, message } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { authService } from '@/app/services/authService'

interface VerificationCodeProps {
  emailField: string
  action: 'login' | 'register' | 'reset'
  onCodeSent?: (email: string) => void
}

export default function VerificationCode({ 
  emailField, 
  action,
  onCodeSent 
}: VerificationCodeProps) {
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const formRef = useRef<any>(null)

  const startCountdown = () => {
    setCountdown(60)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const sendVerificationCode = async () => {
    try {
      setLoading(true)
      
      // 获取表单中的邮箱值
      const form = formRef.current?.getFieldValue ? formRef.current : 
                   (typeof document !== 'undefined' ? 
                     document.querySelector('form') : null)
      
      let email = ''
      if (form && form.getFieldValue) {
        email = form.getFieldValue(emailField)
      } else if (form) {
        const emailInput = form.querySelector(`input[name="${emailField}"]`)
        email = emailInput?.value || ''
      }

      if (!email) {
        message.error('请先输入邮箱地址')
        return
      }

      const result = await authService.sendVerificationCode(email, action)
      
      if (result.success) {
        message.success('验证码已发送至您的邮箱')
        startCountdown()
        onCodeSent?.(email)
      } else {
        message.error(result.message || '发送验证码失败')
      }
    } catch (error: any) {
      message.error(error.message || '发送验证码时出现错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input 
        placeholder="请输入验证码"
        maxLength={6}
      />
      <Button 
        type="primary"
        icon={<SendOutlined />}
        onClick={sendVerificationCode}
        loading={loading}
        disabled={countdown > 0}
      >
        {countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
      </Button>
    </Space.Compact>
  )
}