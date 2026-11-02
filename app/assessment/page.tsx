//智能测评页面

'use client'

import React, { useState } from 'react'
import { 
  Button, 
  Row, 
  Col, 
  Typography,
  Card,
  Space,
  Steps,
  List,
  Tag,
  Modal,
  Radio
} from 'antd'
import { 
  CheckCircleOutlined,
  SelectOutlined,
  EditOutlined,
  FileTextOutlined,
  EyeOutlined,
  RocketOutlined,
  BookOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './assessment.module.css'

const { Title, Paragraph, Text } = Typography

type AssessmentType = 'holland' | 'skills' | 'values'
type HollandVersion = 'simple' | 'full'

interface AssessmentInfo {
  key: AssessmentType
  title: string
  subtitle: string
  borderColor: string
  buttonColor: string
  questionCount: number
  duration: string
  route: string
  isRecommended?: boolean
}

interface AssessmentRecord {
  id: string
  type: AssessmentType
  name: string
  completedAt: string
  score: number
  status: 'completed' | 'in_progress' | 'not_started'
}

interface HollandVersionOption {
  version: HollandVersion
  title: string
  questions: number
  duration: string
  description: string
  recommended?: boolean
}

const ROUTES = {
  DASHBOARD: '/dashboard',
  ASSESSMENT_HOLLAND: '/assessment/holland',
  ASSESSMENT_SKILLS: '/assessment/skills',
  ASSESSMENT_VALUES: '/assessment/values',
  ASSESSMENT_HISTORY: '/assessment/history',
  CAREER: '/career',
  PLAN_CREATE: '/plan/create',
  RESOURCES: '/resources',
} as const

const hollandVersions: HollandVersionOption[] = [
  {
    version: 'simple',
    title: '简单版',
    questions: 10,
    duration: '5-8 分钟',
    description: '快速了解你的职业兴趣倾向，适合时间有限的情况'
  },
  {
    version: 'full',
    title: '完整版',
    questions: 30,
    duration: '15-20 分钟',
    description: '全面评估你的职业兴趣类型，结果更加准确详细',
    recommended: true
  }
]

const assessmentTypes: AssessmentInfo[] = [
  {
    key: 'holland',
    title: '霍兰德职业兴趣测评',
    subtitle: '基于霍兰德理论，评估你的职业兴趣类型',
    borderColor: '#165DFF',
    buttonColor: '#165DFF',
    questionCount: 30,
    duration: '15-20 分钟',
    route: ROUTES.ASSESSMENT_HOLLAND,
  },
  {
    key: 'skills',
    title: '技能能力评估',
    subtitle: '评估你在各个技能领域的掌握程度',
    borderColor: '#52C41A',
    buttonColor: '#52C41A',
    questionCount: 20,
    duration: '10-15 分钟',
    route: ROUTES.ASSESSMENT_SKILLS,
    isRecommended: true,
  },
  {
    key: 'values',
    title: '职业价值观测评',
    subtitle: '了解你的职业价值观和追求',
    borderColor: '#722ED1',
    buttonColor: '#722ED1',
    questionCount: 24,
    duration: '10-15 分钟',
    route: ROUTES.ASSESSMENT_VALUES,
  }
]

const processSteps = [
  {
    title: '选择测评类型',
    description: '根据你的需求选择合适的测评',
    icon: <SelectOutlined />,
  },
  {
    title: '回答问题',
    description: '认真回答每道测评题目',
    icon: <EditOutlined />,
  },
  {
    title: '生成报告',
    description: '系统自动生成详细分析报告',
    icon: <FileTextOutlined />,
  },
  {
    title: '查看建议',
    description: '获取个性化的发展建议',
    icon: <EyeOutlined />,
  },
]

// 修改：时间改为 2026 年，ID 与详情页对应
const mockRecords: AssessmentRecord[] = [
  {
    id: 'AS001',
    type: 'holland',
    name: '霍兰德职业兴趣测评',
    completedAt: '2026-01-15 14:30',
    score: 85,
    status: 'completed'
  },
  {
    id: 'AS002',
    type: 'skills',
    name: '技能能力评估（计算机科学与技术）',
    completedAt: '2026-01-14 10:20',
    score: 78,
    status: 'completed'
  },
  {
    id: 'AS003',
    type: 'values',
    name: '职业价值观测评',
    completedAt: '2026-01-13 16:45',
    score: 92,
    status: 'completed'
  }
]

const nextStepsSuggestions = [
  { label: '探索匹配的职业', route: ROUTES.CAREER },
  { label: '创建生涯规划', route: ROUTES.PLAN_CREATE },
  { label: '返回仪表盘', route: ROUTES.DASHBOARD },
  { label: '查看学习资源', route: ROUTES.RESOURCES },
]

export default function AssessmentCenterPage() {
  const router = useRouter()
  const [isHollandModalOpen, setIsHollandModalOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<HollandVersion>('full')

  const handleStartAssessment = (type: AssessmentInfo) => {
    if (type.key === 'holland') {
      setIsHollandModalOpen(true)
    } else {
      router.push(type.route)
    }
  }

  const handleHollandStart = () => {
    const versionParam = selectedVersion === 'simple' ? '?version=simple' : ''
    router.push(`${ROUTES.ASSESSMENT_HOLLAND}${versionParam}`)
    setIsHollandModalOpen(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeaderWrapper}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <Title level={2} className={styles.mainTitle}>
              <RocketOutlined className={styles.titleIcon} />
              智能测评中心
            </Title>
            <Paragraph className={styles.subTitle}>
              通过科学测评了解自己的职业倾向
            </Paragraph>
          </div>
          <Space className={styles.headerActions}>
            <Button onClick={() => router.push(ROUTES.ASSESSMENT_HISTORY)}>
              测评记录
            </Button>
            <Button 
              type="primary"
              onClick={() => router.push(ROUTES.DASHBOARD)}
            >
              返回仪表盘
            </Button>
          </Space>
        </div>
      </div>

      <div className={styles.content}>
        <Card className={styles.sectionCard}>
          <Title level={4} className={styles.cardTitle}>
            <SelectOutlined className={styles.cardTitleIcon} />
            测评流程
          </Title>
          <div className={styles.stepsContainer}>
            <Steps current={0} items={processSteps} responsive={true} />
          </div>
        </Card>

        <Card className={styles.sectionCard}>
          <Title level={4} className={styles.cardTitle}>
            <BookOutlined className={styles.cardTitleIcon} />
            测评类型
          </Title>
          <Row gutter={[16, 16]} className={styles.cardsRow}>
            {assessmentTypes.map((type) => (
              <Col xs={24} sm={12} lg={8} key={type.key}>
                <Card 
                  className={styles.assessmentCard}
                  style={{ borderLeft: `4px solid ${type.borderColor}` }}
                  hoverable
                >
                  {type.isRecommended && (
                    <div className={styles.recommendedTag}>
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        推荐
                      </Tag>
                    </div>
                  )}
                  
                  <div className={styles.cardContent}>
                    <Title level={5} className={styles.cardTitleSmall} style={{ color: type.borderColor }}>
                      {type.title}
                    </Title>
                    
                    <Paragraph type="secondary" className={styles.cardSubtitle}>
                      {type.subtitle}
                    </Paragraph>
                    
                    <div className={styles.cardInfo}>
                      <Space split={<span className={styles.divider}>|</span>}>
                        <span className={styles.infoText}>题数：{type.questionCount}</span>
                        <span className={styles.infoText}>时间：{type.duration}</span>
                      </Space>
                    </div>
                    
                    <Button 
                      type="primary" 
                      size="large"
                      block
                      className={styles.cardButton}
                      style={{ backgroundColor: type.borderColor }}
                      onClick={() => handleStartAssessment(type)}
                    >
                      → 开始测评
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <Card className={styles.sectionCard}>
          <div className={styles.recordsHeader}>
            <Title level={4} className={styles.cardTitle}>
              <ClockCircleOutlined className={styles.cardTitleIcon} />
              近期测评记录
            </Title>
            <Link href="/assessment/history" className={styles.viewAllLink}>
              查看全部 →
            </Link>
          </div>
          
          <List
            dataSource={mockRecords}
            renderItem={(item) => (
              <List.Item className={styles.listItem}>
                <div className={styles.recordContent}>
                  <Text strong className={styles.recordName}>{item.name}</Text>
                  <Space size="large" className={styles.recordMeta}>
                    <Text type="secondary">{item.completedAt}</Text>
                    <Text>
                      得分：<span className={styles.score}>{item.score}</span>
                    </Text>
                    {/* 修改：跳转到对应的测评记录详情页 */}
                    <Link href={`/assessment/history/${item.id}`} className={styles.reportLink}>
                      查看报告
                    </Link>
                  </Space>
                </div>
              </List.Item>
            )}
          />
        </Card>

        <Card className={styles.sectionCard}>
          <Title level={4} className={styles.cardTitle}>
            <RocketOutlined className={styles.cardTitleIcon} />
            下一步建议
          </Title>
          <Space wrap className={styles.nextStepsButtons}>
            {nextStepsSuggestions.map((item) => (
              <Button 
                key={item.label}
                size="large"
                className={styles.nextStepButton}
                onClick={() => router.push(item.route)}
              >
                {item.label}
              </Button>
            ))}
          </Space>
        </Card>
      </div>

      <Modal
        title={
          <Space>
            <BookOutlined style={{ color: '#165DFF' }} />
            选择测评版本
          </Space>
        }
        open={isHollandModalOpen}
        onCancel={() => setIsHollandModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsHollandModalOpen(false)}>
            取消
          </Button>,
          <Button key="start" type="primary" onClick={handleHollandStart}>
            开始测评
          </Button>
        ]}
        width={600}
      >
        <div className={styles.versionModalContent}>
          <Paragraph type="secondary" style={{ marginBottom: 24 }}>
            请根据您的时间选择合适的测评版本
          </Paragraph>
          
          <Radio.Group 
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className={styles.versionRadioGroup}
          >
            <Space orientation="vertical" style={{ width: '100%' }} size="large">
              {hollandVersions.map((option) => (
                <Card 
                  key={option.version}
                  className={`${styles.versionCard} ${selectedVersion === option.version ? styles.versionCardSelected : ''}`}
                  onClick={() => setSelectedVersion(option.version)}
                  hoverable
                >
                  <div className={styles.versionCardHeader}>
                    <div className={styles.versionCardTitle}>
                      <Radio value={option.version} className={styles.versionRadio}>
                        <Title level={5} style={{ margin: 0 }}>{option.title}</Title>
                      </Radio>
                      {option.recommended && (
                        <Tag color="green" className={styles.recommendedBadge}>
                          推荐
                        </Tag>
                      )}
                    </div>
                    <div className={styles.versionCardMeta}>
                      <Space split={<span className={styles.metaDivider}>|</span>}>
                        <span className={styles.metaText}>
                          <strong>{option.questions}</strong> 道题
                        </span>
                        <span className={styles.metaText}>
                          <strong>{option.duration}</strong>
                        </span>
                      </Space>
                    </div>
                  </div>
                  <Paragraph type="secondary" className={styles.versionCardDescription}>
                    {option.description}
                  </Paragraph>
                </Card>
              ))}
            </Space>
          </Radio.Group>
        </div>
      </Modal>
    </div>
  )
}