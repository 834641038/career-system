// 登录API路由
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, verificationCode, rememberMe } = body

    // 模拟验证逻辑
    if (!email || (!password && !verificationCode)) {
      return NextResponse.json(
        { success: false, message: '请输入邮箱和密码或验证码' },
        { status: 400 }
      )
    }

    // 模拟用户数据验证
    if (email === 'test@example.com' && password === '123456') {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: '测试用户',
        avatar: ''
      }

      const token = 'mock-jwt-token-' + Date.now()

      return NextResponse.json({
        success: true,
        message: '登录成功',
        user,
        token
      })
    }

    // 模拟验证码登录
    if (email && verificationCode === '123456') {
      const user = {
        id: '2',
        email,
        name: '验证码用户',
        avatar: ''
      }

      const token = 'mock-verification-token-' + Date.now()

      return NextResponse.json({
        success: true,
        message: '验证码登录成功',
        user,
        token
      })
    }

    return NextResponse.json(
      { success: false, message: '邮箱或密码错误' },
      { status: 401 }
    )

  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    )
  }
}