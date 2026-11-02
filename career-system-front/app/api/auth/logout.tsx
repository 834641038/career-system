// 登出API路由
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 在实际应用中，这里会验证JWT token并将其加入黑名单
    // 目前只是简单的成功响应
    
    return NextResponse.json({
      success: true,
      message: '登出成功'
    })

  } catch (error) {
    console.error('登出错误:', error)
    return NextResponse.json(
      { success: false, message: '登出失败' },
      { status: 500 }
    )
  }
}