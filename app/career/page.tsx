//职业探索页面
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { Card, Button, Typography, Space, Tabs } from 'antd'
import { 
  RocketOutlined,
  AimOutlined,
  CompressOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'

const { Title, Paragraph } = Typography

export default function CareerPage() {
  const router = useRouter()

  const tabItems = [
    {
      key: 'explore',
      label: '职业浏览',
      children: (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <AimOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={3}>职业浏览功能</Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              探索300+职业数据库，了解薪资发展、晋升路径
            </Paragraph>
            <Space>
              <Button 
                type="primary" 
                size="large"
                onClick={() => router.push(ROUTES.CAREER_EXPLORE)}
              >
                开始浏览
              </Button>
              <Button 
                size="large"
                onClick={() => router.push(ROUTES.ASSESSMENT)}
              >
                先做测评匹配
              </Button>
            </Space>
          </div>
        </Card>
      )
    },
    {
      key: 'compare',
      label: '职业对比',
      children: (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CompressOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <Title level={3}>职业对比功能</Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              对比不同职业的发展前景、薪资待遇和技能要求
            </Paragraph>
            <Button 
              type="primary" 
              size="large"
              onClick={() => router.push(ROUTES.CAREER_COMPARE)}
            >
              开始对比
            </Button>
          </div>
        </Card>
      )
    }
  ]

  return (
    <div className="career-page">
      <PageHeader
        title="职业探索"
        subTitle="发现适合你的职业发展道路"
        extra={[
          <Button 
            key="dashboard" 
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            返回仪表盘
          </Button>,
          <Button 
            key="assessment" 
            type="primary"
            onClick={() => router.push(ROUTES.ASSESSMENT)}
          >
            先做测评
          </Button>,
        ]}
      />

      <div className="page-content">
        <Tabs defaultActiveKey="explore" items={tabItems} />
        
        {/* 快速链接 */}
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>下一步建议</Title>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            根据你的测评结果，我们建议：
          </Paragraph>
          <Space wrap>
            <Button onClick={() => router.push(ROUTES.PLAN_CREATE)}>
              创建职业发展计划
            </Button>
            <Button onClick={() => router.push(ROUTES.RESOURCES)}>
              查看相关学习资源
            </Button>
            <Button onClick={() => router.push('/resources/courses')}>
              学习相关课程
            </Button>
            <Button onClick={() => router.push('/career/mentor')}>
              寻找行业导师
            </Button>
          </Space>
        </Card>
      </div>

      <style jsx>{`
        .career-page {
          padding: 24px;
        }
        
        .page-content {
          max-width: 1200px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  )
}