//技能评估页面
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { Card, Button, Typography, Space, Table, Tag, Progress, Row, Col, Statistic } from 'antd'
import { 
  UserOutlined, 
  TrophyOutlined, 
  RiseOutlined, 
  CheckCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'

const { Title, Paragraph } = Typography

export default function SkillAssessmentPage() {
  const router = useRouter()

  // Mock数据 - 技能评估结果
  const skillData = [
    { id: 1, name: '编程能力', category: '技术技能', level: 75, maxLevel: 100, growthPotential: 85 },
    { id: 2, name: '沟通表达', category: '软技能', level: 80, maxLevel: 100, growthPotential: 90 },
    { id: 3, name: '团队协作', category: '软技能', level: 85, maxLevel: 100, growthPotential: 88 },
    { id: 4, name: '项目管理', category: '管理技能', level: 60, maxLevel: 100, growthPotential: 75 },
    { id: 5, name: '数据分析', category: '技术技能', level: 70, maxLevel: 100, growthPotential: 80 },
    { id: 6, name: '创新思维', category: '思维能力', level: 78, maxLevel: 100, growthPotential: 85 },
  ]

  // Mock数据 - 技能差距分析
  const skillGapData = [
    { id: 1, skill: 'React开发', current: 60, required: 85, gap: 25 },
    { id: 2, skill: 'UI/UX设计', current: 40, required: 70, gap: 30 },
    { id: 3, skill: '产品思维', current: 55, required: 75, gap: 20 },
    { id: 4, skill: '数据分析', current: 70, required: 80, gap: 10 },
  ]

  // 表格列定义
  const columns = [
    {
      title: '技能名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={
          category === '技术技能' ? 'blue' : 
          category === '软技能' ? 'green' : 
          category === '管理技能' ? 'orange' : 'purple'
        }>
          {category}
        </Tag>
      ),
    },
    {
      title: '当前水平',
      key: 'level',
      render: (record: any) => (
        <div>
          <div>{record.level}%</div>
          <Progress percent={record.level} size="small" />
        </div>
      ),
    },
    {
      title: '成长潜力',
      key: 'growthPotential',
      render: (record: any) => (
        <div>
          <div>{record.growthPotential}%</div>
          <Progress percent={record.growthPotential} size="small" strokeColor="#52c41a" />
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: any) => (
        <Space size="middle">
          <Button size="small" type="link">查看详情</Button>
          <Button size="small" type="link">制定提升计划</Button>
        </Space>
      ),
    },
  ]

  const gapColumns = [
    {
      title: '技能名称',
      dataIndex: 'skill',
      key: 'skill',
    },
    {
      title: '当前水平',
      dataIndex: 'current',
      key: 'current',
      render: (current: number) => <span>{current}%</span>,
    },
    {
      title: '目标水平',
      dataIndex: 'required',
      key: 'required',
      render: (required: number) => <span>{required}%</span>,
    },
    {
      title: '差距',
      dataIndex: 'gap',
      key: 'gap',
      render: (gap: number) => (
        <Tag color={gap > 20 ? 'red' : gap > 10 ? 'orange' : 'green'}>
          {gap}%
        </Tag>
      ),
    },
    {
      title: '建议',
      key: 'action',
      render: () => (
        <Button size="small" type="primary">推荐学习资源</Button>
      ),
    },
  ]

  return (
    <div className="skill-assessment-page">
      <PageHeader
        title="技能评估"
        subTitle="全面评估你的技能水平，发现优势与短板"
        extra={[
          <Button 
            key="back-dashboard" 
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            返回仪表盘
          </Button>,
          <Button 
            key="retest" 
            onClick={() => router.push(ROUTES.ASSESSMENT)}
          >
            重新评估
          </Button>,
          <Button 
            key="export" 
            type="primary"
            onClick={() => alert('导出功能正在开发中')}
          >
            导出报告
          </Button>,
        ]}
      />

      <div className="page-content" style={{ padding: '24px' }}>
        {/* 统计卡片区域 */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="技能总数"
                value={skillData.length}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均技能水平"
                value={Math.round(skillData.reduce((sum, skill) => sum + skill.level, 0) / skillData.length)}
                suffix="%"
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="最高技能水平"
                value={Math.max(...skillData.map(skill => skill.level))}
                suffix="%"
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均成长潜力"
                value={Math.round(skillData.reduce((sum, skill) => sum + skill.growthPotential, 0) / skillData.length)}
                suffix="%"
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 技能详情表格 */}
        <Card title="技能详情" style={{ marginBottom: 24 }}>
          <Table 
            columns={columns} 
            dataSource={skillData} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* 技能差距分析 */}
        <Card title="技能差距分析" style={{ marginBottom: 24 }}>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            与目标职位要求的技能差距分析，红色表示差距较大，绿色表示差距较小
          </Paragraph>
          <Table 
            columns={gapColumns} 
            dataSource={skillGapData} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* 下一步建议 */}
        <Card title="下一步建议">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>根据您的技能评估结果，我们建议：</Title>
            <Paragraph type="secondary">
              1. 重点关注差距较大的技能领域，制定专门的学习计划
            </Paragraph>
            <Paragraph type="secondary">
              2. 利用推荐的学习资源提升相关技能
            </Paragraph>
            <Paragraph type="secondary">
              3. 参加实践项目以巩固已掌握的技能
            </Paragraph>
            <Space style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                size="large"
                onClick={() => router.push(ROUTES.PLAN_CREATE)}
              >
                创建技能提升计划
              </Button>
              <Button 
                size="large"
                onClick={() => router.push(ROUTES.RESOURCES)}
              >
                查看学习资源
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    </div>
  )
}