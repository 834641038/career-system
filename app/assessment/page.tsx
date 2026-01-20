// 测评页面
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { Card, Row, Col, Button, Typography, Steps, Space } from 'antd'
import { 
  ExperimentOutlined, 
  RocketOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  HistoryOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'

const { Title, Paragraph } = Typography

export default function AssessmentPage() {
  const router = useRouter()
  
  const assessmentTypes = [
    {
      id: 1,
      title: '霍兰德职业兴趣测评',
      description: '基于霍兰德理论，评估你的职业兴趣类型',
      questions: 60,
      time: '15-20分钟',
      icon: <ExperimentOutlined style={{ fontSize: 32 }} />,
      color: '#1890ff'
    },
    {
      id: 2,
      title: '技能能力评估',
      description: '评估你在各个技能领域的掌握程度',
      questions: 40,
      time: '10-15分钟',
      icon: <CheckCircleOutlined style={{ fontSize: 32 }} />,
      color: '#52c41a'
    },
    {
      id: 3,
      title: '职业价值观测评',
      description: '了解你的职业价值观和追求',
      questions: 30,
      time: '8-10分钟',
      icon: <RocketOutlined style={{ fontSize: 32 }} />,
      color: '#722ed1'
    },
  ]

  const recentAssessments = [
    { id: 1, title: '霍兰德测评', date: '2024-03-15', score: 85 },
    { id: 2, title: '技能评估', date: '2024-03-10', score: 72 },
    { id: 3, title: '价值观测评', date: '2024-03-05', score: 90 },
  ]

  return (
    <div className="assessment-page">
      <PageHeader
        title="智能测评中心"
        subTitle="通过科学测评了解自己的职业倾向"
        extra={[
          <Button 
            key="history" 
            icon={<HistoryOutlined />}
            onClick={() => router.push(ROUTES.ASSESSMENT_HISTORY)}
          >
            测评记录
          </Button>,
          <Button 
            key="dashboard" 
            type="primary"
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            返回仪表盘
          </Button>,
        ]}
      />

      <div className="page-content">
        {/* 测评步骤 */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>测评流程</Title>
            <Steps 
    current={0} 
    size="small"
    items={[
      {
        title: '选择测评类型',
        description: '选择适合你的测评'
      },
      {
        title: '回答问题', 
        description: '认真回答所有问题'
      },
      {
        title: '生成报告',
        description: '获取个性化分析报告'
      },
      {
        title: '查看建议',
        description: '获得职业发展建议'
      }
    ]}
  />
        </Card>

        {/* 测评类型选择 */}
        <Card style={{ marginBottom: 24 }}>
          <div className="section-header">
            <Title level={4}>选择测评类型</Title>
            <Paragraph type="secondary">
              选择适合你的测评类型，开始了解自己
            </Paragraph>
          </div>
          
          <Row gutter={[24, 24]}>
            {assessmentTypes.map((type) => (
              <Col xs={24} md={8} key={type.id}>
                <Card 
                  hoverable 
                  style={{ 
                    textAlign: 'center',
                    borderTop: `4px solid ${type.color}`,
                    height: '100%'
                  }}
                  onClick={() => router.push(`${ROUTES.ASSESSMENT_START}?type=${type.id}`)}
                >
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: 32,
                    background: `${type.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <div style={{ color: type.color }}>
                      {type.icon}
                    </div>
                  </div>
                  
                  <Title level={4}>{type.title}</Title>
                  <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                    {type.description}
                  </Paragraph>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: 16,
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    <span>题目: {type.questions}</span>
                    <span>时间: {type.time}</span>
                  </div>
                  
                  <Button 
                    type="primary" 
                    block 
                    icon={<ArrowRightOutlined />}
                    style={{ background: type.color, borderColor: type.color }}
                  >
                    开始测评
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 近期测评记录 */}
        <Card>
          <div className="section-header">
            <Title level={4}>近期测评记录</Title>
            <Button 
              type="link" 
              onClick={() => router.push(ROUTES.ASSESSMENT_HISTORY)}
            >
              查看全部
            </Button>
          </div>
          
          {recentAssessments.length > 0 ? (
            <Row gutter={[16, 16]}>
              {recentAssessments.map((assessment) => (
                <Col xs={24} key={assessment.id}>
                  <Card size="small">
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <div>
                        <strong>{assessment.title}</strong>
                        <div style={{ color: '#666', fontSize: '14px' }}>
                          测评日期: {assessment.date}
                        </div>
                      </div>
                      <div>
                        <span style={{ 
                          padding: '4px 12px', 
                          background: '#f6ffed', 
                          borderRadius: 4,
                          color: '#52c41a',
                          fontWeight: 'bold'
                        }}>
                          得分: {assessment.score}
                        </span>
                        <Button 
                          type="link" 
                          style={{ marginLeft: 8 }}
                          onClick={() => router.push(`${ROUTES.ASSESSMENT_RESULT}?id=${assessment.id}`)}
                        >
                          查看报告
                        </Button>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Paragraph type="secondary">暂无测评记录，开始你的第一次测评吧！</Paragraph>
              <Button 
                type="primary" 
                onClick={() => router.push(ROUTES.ASSESSMENT_START)}
              >
                开始第一次测评
              </Button>
            </div>
          )}
        </Card>

        {/* 快速导航 */}
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>下一步建议</Title>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            完成测评后，你可以：
          </Paragraph>
          <Space wrap>
            <Button 
              type="primary" 
              onClick={() => router.push(ROUTES.CAREER)}
            >
              探索匹配的职业
            </Button>
            <Button 
              onClick={() => router.push(ROUTES.PLAN_CREATE)}
            >
              创建生涯规划
            </Button>
            <Button 
              onClick={() => router.push(ROUTES.DASHBOARD)}
            >
              返回仪表盘
            </Button>
            <Button 
              onClick={() => router.push(ROUTES.RESOURCES)}
            >
              查看学习资源
            </Button>
          </Space>
        </Card>
      </div>

      <style jsx>{`
        .assessment-page {
          padding: 24px;
        }
        
        .page-content {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        
        @media (max-width: 768px) {
          .assessment-page {
            padding: 12px;
          }
          
          .section-header {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  )
}