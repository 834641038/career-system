// 文件路径：d:\career-system\career-system-front\app\assessment\history\[id]\page.tsx
//测评报告模拟数据
'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Descriptions, 
  Tag, 
  Progress,
  Divider,
  Timeline,
  Alert,
  Row,
  Col
} from 'antd'
import { 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  BookOutlined,
  StarOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import styles from './page.module.css'

const { Title, Text, Paragraph } = Typography

// 模拟测评详细数据（与 page.tsx 的 ID 对应）
const mockAssessmentDetails: {[key: string]: any} = {
  'AS001': {
    id: 'AS001',
    title: '霍兰德职业兴趣测评',
    type: 'holland',
    date: '2026-01-15',
    score: 85,
    duration: '25 分钟',
    status: 'completed',
    category: '职业发展',
    description: '全面评估您的职业兴趣倾向，包括现实型、研究型、艺术型等多个维度',
    result: {
      dominantTypes: [
        { type: 'investigative', percentage: 35, name: '研究型 (I)' },
        { type: 'artistic', percentage: 28, name: '艺术型 (A)' },
        { type: 'social', percentage: 20, name: '社会型 (S)' }
      ],
      description: '您具有强烈的研究精神和创新能力，喜欢探索未知领域，适合从事科学研究、技术开发等工作。'
    },
    recommendations: [
      '建议关注技术类岗位',
      '适合从事创新性工作',
      '推荐参与项目管理'
    ]
  },
  'AS002': {
    id: 'AS002',
    title: '技能能力评估（计算机科学与技术）',
    type: 'skills',
    date: '2026-01-14',
    score: 78,
    duration: '35 分钟',
    status: 'completed',
    category: '专业技能',
    major: '计算机科学与技术',
    description: '评估您在编程、沟通、团队协作等方面的技能水平',
    result: {
      categories: [
        { name: '技术能力', score: 82, level: '优秀' },
        { name: '思维能力', score: 75, level: '良好' },
        { name: '软技能', score: 76, level: '良好' }
      ]
    },
    recommendations: [
      '加强编程实践',
      '提升沟通表达能力',
      '参与团队项目'
    ]
  },
  'AS003': {
    id: 'AS003',
    title: '职业价值观测评',
    type: 'values',
    date: '2026-01-13',
    score: 92,
    duration: '30 分钟',
    status: 'completed',
    category: '职业规划',
    description: '了解您对工作环境、薪酬待遇、发展空间等方面的价值取向',
    result: {
      dimensions: [
        { name: '成就导向', score: 90 },
        { name: '创新挑战', score: 88 },
        { name: '社会贡献', score: 85 }
      ],
      topValues: ['个人成长', '创新突破', '社会影响']
    },
    recommendations: [
      '选择有挑战性的工作',
      '注重工作与生活的平衡',
      '关注个人长期发展'
    ]
  }
}

export default function AssessmentHistoryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const record = mockAssessmentDetails[id]

  if (!record) {
    return (
      <div className={styles.container}>
        <Card>
          <Alert
            message="记录不存在"
            description="未找到对应的测评记录"
            type="error"
            showIcon
          />
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/assessment/history')}
            style={{ marginTop: 24 }}
          >
            返回列表
          </Button>
        </Card>
      </div>
    )
  }

  const getStatusTag = (status: string) => {
    const statusMap: {[key: string]: any} = {
      completed: { color: 'green', text: '已完成' },
      pending: { color: 'orange', text: '待完成' },
      reviewing: { color: 'blue', text: '评阅中' }
    }
    const config = statusMap[status] || { color: 'default', text: status }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/assessment/history')}
        >
          返回
        </Button>
      </div>

      <Card className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <Title level={2} className={styles.resultTitle}>
            <TrophyOutlined className={styles.titleIcon} />
            测评报告
          </Title>
          <div className={styles.resultMeta}>
            <Row gutter={[16, 16]}>
              <Col>
                <Text type="secondary">测评时间</Text>
                <div><CalendarOutlined /> {dayjs(record.date).format('YYYY 年 MM 月 DD 日')}</div>
              </Col>
              <Col>
                <Text type="secondary">用时</Text>
                <div><ClockCircleOutlined /> {record.duration}</div>
              </Col>
              <Col>
                <Text type="secondary">状态</Text>
                <div>{getStatusTag(record.status)}</div>
              </Col>
              {record.score && (
                <Col>
                  <Text type="secondary">得分</Text>
                  <div><StarOutlined style={{ color: '#faad14' }} /> <strong>{record.score}分</strong></div>
                </Col>
              )}
            </Row>
          </div>
        </div>

        <Divider />

        <Descriptions column={2} bordered size="middle">
          <Descriptions.Item label="测评编号">{record.id}</Descriptions.Item>
          <Descriptions.Item label="测评名称">{record.title}</Descriptions.Item>
          <Descriptions.Item label="测评类型">
            <Tag color="blue">{record.type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="所属分类">{record.category}</Descriptions.Item>
          <Descriptions.Item label="测评描述" span={2}>
            {record.description}
          </Descriptions.Item>
        </Descriptions>

        {record.status === 'completed' && record.result && (
          <>
            <Divider />

            <div className={styles.scoreSection}>
              <Title level={4}>综合得分</Title>
              <div className={styles.scoreDisplay}>
                <Progress
                  type="circle"
                  percent={record.score}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  format={(percent) => `${percent}分`}
                  width={180}
                />
                <div className={styles.scoreInfo}>
                  <Paragraph>
                    您在本次测评中表现{record.score >= 90 ? '优秀' : record.score >= 80 ? '良好' : '一般'}。
                  </Paragraph>
                </div>
              </div>
            </div>

            {record.type === 'holland' && (
              <div className={styles.resultSection}>
                <Title level={4}>
                  <BookOutlined /> 霍兰德职业兴趣类型
                </Title>
                <Alert
                  message={record.result.description}
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
                
                <div className={styles.hollandTypes}>
                  {record.result.dominantTypes.map((item: any, index: number) => (
                    <Card 
                      key={item.type}
                      className={styles.typeCard}
                      style={{ 
                        borderLeft: `4px solid ${index === 0 ? '#1890ff' : '#52c41a'}`
                      }}
                    >
                      <div className={styles.typeCardHeader}>
                        <Text strong style={{ fontSize: 16 }}>
                          {index === 0 ? '主要类型' : `次要类型${index}`}：{item.name}
                        </Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                          {item.percentage}%
                        </Text>
                      </div>
                      <Progress percent={item.percentage} showInfo={false} />
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {record.type === 'skills' && (
              <div className={styles.resultSection}>
                <Title level={4}>
                  <BookOutlined /> 技能维度分析
                </Title>
                <div className={styles.skillsList}>
                  {record.result.categories.map((cat: any, idx: number) => (
                    <Card key={idx} className={styles.skillCard}>
                      <div className={styles.skillHeader}>
                        <Text strong>{cat.name}</Text>
                        <Tag color={cat.score >= 80 ? 'green' : 'blue'}>{cat.level}</Tag>
                      </div>
                      <Progress 
                        percent={cat.score} 
                        showInfo={false}
                        strokeColor={cat.score >= 80 ? '#52c41a' : '#1890ff'}
                      />
                      <div className={styles.skillScore}>{cat.score}分</div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {record.type === 'values' && (
              <div className={styles.resultSection}>
                <Title level={4}>
                  <BookOutlined /> 职业价值观维度
                </Title>
                <div className={styles.valuesList}>
                  {record.result.dimensions.map((dim: any, idx: number) => (
                    <Card key={idx} className={styles.valueCard}>
                      <div className={styles.valueHeader}>
                        <Text strong>{dim.name}</Text>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1' }}>
                          {dim.score}分
                        </Text>
                      </div>
                      <Progress 
                        percent={dim.score} 
                        showInfo={false}
                        strokeColor="#722ed1"
                      />
                    </Card>
                  ))}
                </div>
                {record.result.topValues && (
                  <div className={styles.topValues}>
                    <Text strong>核心价值观：</Text>
                    <Space style={{ marginTop: 8 }}>
                      {record.result.topValues.map((value: string, idx: number) => (
                        <Tag key={idx} color="purple" style={{ fontSize: 14 }}>
                          {value}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}
              </div>
            )}

            {record.recommendations && record.recommendations.length > 0 && (
              <>
                <Divider />
                <div className={styles.recommendationsSection}>
                  <Title level={4}>
                    <CheckCircleOutlined /> 发展建议
                  </Title>
                  <Timeline
                    items={record.recommendations.map((rec: string, idx: number) => ({
                      children: <Paragraph key={idx}>{rec}</Paragraph>,
                      color: 'green',
                    }))}
                  />
                </div>
              </>
            )}
          </>
        )}

        <div className={styles.actionButtons}>
          <Space>
            <Button 
              type="primary" 
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/assessment')}
            >
              返回测评中心
            </Button>
            <Button onClick={() => window.print()}>
              打印报告
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}