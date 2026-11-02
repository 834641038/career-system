// 注册API路由
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, studentId, major, verificationCode } = body

    // 验证必填字段
    if (!email || !password || !name || !studentId || !major || !verificationCode) {
      return NextResponse.json(
        { success: false, message: '请填写所有必填信息' },
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

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '密码至少6位' },
        { status: 400 }
      )
    }

    // 模拟验证码验证
    if (verificationCode !== '123456') {
      return NextResponse.json(
        { success: false, message: '验证码错误' },
        { status: 400 }
      )
    }

    // 模拟检查邮箱是否已存在
    if (email === 'existing@example.com') {
      return NextResponse.json(
        { success: false, message: '该邮箱已被注册' },
        { status: 409 }
      )
    }

    // 模拟创建用户
    const newUser = {
      id: 'new-' + Date.now(),
      email,
      name,
      avatar: ''
    }

    const token = 'mock-register-token-' + Date.now()

    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: newUser,
      token
    })

  } catch (error) {
    console.error('注册错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    )
  }
}