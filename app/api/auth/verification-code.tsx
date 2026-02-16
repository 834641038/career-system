// 发送验证码API路由
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, action } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: '请输入邮箱地址' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 模拟发送验证码（实际项目中这里会调用短信/邮件服务）
    console.log(`发送${action}验证码到: ${email}`)
    console.log('模拟验证码: 123456')

    return NextResponse.json({
      success: true,
      message: '验证码已发送，请查收'
    })

  } catch (error) {
    console.error('发送验证码错误:', error)
    return NextResponse.json(
      { success: false, message: '发送验证码失败' },
      { status: 500 }
    )
  }
}