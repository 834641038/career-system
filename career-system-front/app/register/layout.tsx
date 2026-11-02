//注册页面布局文件
//注册页面布局文件
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import { AuthProvider } from '@/app/context/AuthContext'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '注册 - 大学生生涯规划系统',
  description: '创建您的生涯规划账户',
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
                borderRadius: 6,
              },
            }}
          >
            <AuthProvider>
              <div style={{ 
                width: '100vw', 
                height: '100vh', 
                backgroundColor: '#ffffff',
                margin: 0,
                padding: 0
              }}>
                {children}
              </div>
            </AuthProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}