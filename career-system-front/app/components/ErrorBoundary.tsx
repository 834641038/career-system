//布局文件集成导航栏和全局样式
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import Navigation from '@/app/components/Navigation'
import ErrorBoundary from '@/app/components/ErrorBoundary'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '大学生生涯规划系统',
  description: '一站式大学生生涯规划平台 - 智能测评·职业规划·成长追踪',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
                borderRadius: 6,
              },
            }}
          >
            <ErrorBoundary>
              <Navigation>{children}</Navigation>
            </ErrorBoundary>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}