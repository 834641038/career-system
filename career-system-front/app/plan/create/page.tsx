// 创建技能提升计划页面
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  Row, 
  Col, 
  Alert,
  Spin,
  Typography,
  Divider,
  List,
  Tag,
  Collapse,
  Result
} from 'antd'
import { 
  PlusOutlined,
  RocketOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/app/lib/routes'
import React, { useState } from 'react'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { Panel } = Collapse

interface SkillPlanFormData {
  skillNames: string[]
  currentLevel: string
  targetLevel: string
  gapDescription: string
}

interface LearningTask {
  task_content: string
  duration: string
  resources: string[]
}

interface PlanPhase {
  phase_name: string
  tasks: LearningTask[]
}

interface GeneratedPlan {
  skill_name: string
  plan_phases: PlanPhase[]
}

import LoginRequired, { useLoginGuard } from '@/app/components/LoginRequired'

export default function CreatePlanPage() {
  const { checked, needLogin } = useLoginGuard()
  if (!checked) return null
  if (needLogin) return <LoginRequired pageName="创建规划" />
  return <CreatePlanPageInner />
}

function CreatePlanPageInner() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [generatedPlans, setGeneratedPlans] = useState<GeneratedPlan[]>([])
  const [showResult, setShowResult] = useState(false)

  // 预设技能选项
  const presetSkills = [
    'React开发',
    'Vue.js开发',
    'Node.js后端开发',
    'Python数据分析',
    'Java企业级开发',
    'UI/UX设计',
    '产品运营',
    '数据分析',
    '机器学习',
    '云计算',
    '网络安全',
    '移动端开发',
    '数据库管理',
    '项目管理'
  ]

  // 水平等级选项
  const levelOptions = [
    { value: '入门', label: '入门 (0-1年经验)' },
    { value: '初级', label: '初级 (1-3年经验)' },
    { value: '中级', label: '中级 (3-5年经验)' },
    { value: '高级', label: '高级 (5年以上经验)' }
  ]

  // 模拟AI生成计划的函数
  const generateLearningPlan = async (formData: SkillPlanFormData): Promise<GeneratedPlan[]> => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 根据技能生成相应的学习计划
    return formData.skillNames.map(skillName => ({
      skill_name: skillName,
      plan_phases: [
        {
          phase_name: "基础入门",
          tasks: [
            {
              task_content: "学习核心概念和基础语法",
              duration: "2周（每天2小时）",
              resources: ["官方文档", "菜鸟教程"]
            },
            {
              task_content: "完成基础练习和小项目",
              duration: "1周（每天3小时）",
              resources: ["LeetCode基础题", "GitHub开源项目"]
            },
            {
              task_content: "理解最佳实践和编码规范",
              duration: "1周（每天1小时）",
              resources: ["技术博客", "社区讨论"]
            }
          ]
        },
        {
          phase_name: "进阶提升",
          tasks: [
            {
              task_content: "深入学习高级特性和性能优化",
              duration: "3周（每天2小时）",
              resources: ["官方进阶文档", "技术大会视频"]
            },
            {
              task_content: "参与开源项目贡献代码",
              duration: "2周（每周10小时）",
              resources: ["GitHub开源项目", "开源社区"]
            },
            {
              task_content: "学习相关工具链和生态系统",
              duration: "2周（每天1.5小时）",
              resources: ["npm包管理", "构建工具文档"]
            }
          ]
        },
        {
          phase_name: "项目实战",
          tasks: [
            {
              task_content: "独立完成一个完整项目",
              duration: "4周（每周15小时）",
              resources: ["项目需求文档", "技术选型指南"]
            },
            {
              task_content: "部署上线并进行性能监控",
              duration: "2周（每周8小时）",
              resources: ["云服务平台", "监控工具"]
            },
            {
              task_content: "撰写技术总结和分享经验",
              duration: "1周（每周5小时）",
              resources: ["技术博客平台", "社区分享会"]
            }
          ]
        }
      ]
    }))
  }

  const onFinish = async (values: any) => {
    setLoading(true)
    setShowResult(false)
    
    try {
      const formData: SkillPlanFormData = {
        skillNames: Array.isArray(values.skillNames) ? values.skillNames : [values.skillNames],
        currentLevel: values.currentLevel,
        targetLevel: values.targetLevel,
        gapDescription: values.gapDescription || ''
      }

      const plans = await generateLearningPlan(formData)
      setGeneratedPlans(plans)
      setShowResult(true)
    } catch (error) {
      console.error('生成计划失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    form.resetFields()
    setGeneratedPlans([])
    setShowResult(false)
  }

  return (
    <div className="create-plan-page">
      <PageHeader
        title="创建技能提升计划"
        subTitle="基于你的技能现状，生成个性化学习路线"
        extra={[
          <Button 
            key="back" 
            onClick={() => router.push(ROUTES.PLAN)}
          >
            返回规划列表
          </Button>,
        ]}
      />

      <div className="page-content" style={{ padding: '0 24px 24px 24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Alert
              message="智能学习计划助手"
              description="告诉我们你想提升的技能和当前水平，我们将为你生成详细可执行的学习计划。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          </Col>

          <Col span={showResult ? 12 : 24}>
            <Card title="填写技能信息" style={{ marginBottom: 24 }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  currentLevel: '入门',
                  targetLevel: '初级'
                }}
              >
                <Form.Item
                  name="skillNames"
                  label="选择要提升的技能"
                  rules={[{ required: true, message: '请选择至少一个技能' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="可以选择多个技能"
                    options={presetSkills.map(skill => ({
                      value: skill,
                      label: skill
                    }))}
                    maxTagCount={3}
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="currentLevel"
                      label="当前水平"
                      rules={[{ required: true, message: '请选择当前水平' }]}
                    >
                      <Select placeholder="请选择当前技能水平">
                        {levelOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      name="targetLevel"
                      label="目标水平"
                      rules={[{ required: true, message: '请选择目标水平' }]}
                    >
                      <Select placeholder="请选择期望达到的水平">
                        {levelOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="gapDescription"
                  label="技能差距描述（可选）"
                >
                  <TextArea 
                    placeholder="描述你认为的主要技能差距，如：缺乏项目经验、理论知识薄弱等"
                    rows={4}
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={loading ? <LoadingOutlined /> : <RocketOutlined />}
                    >
                      {loading ? '正在生成计划...' : '生成学习计划'}
                    </Button>
                    <Button onClick={resetForm}>
                      重置表单
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {showResult && (
            <Col span={12}>
              <Card 
                title={
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <span>生成的学习计划</span>
                  </Space>
                }
              >
                {generatedPlans.map((plan, index) => (
                  <div key={index} style={{ marginBottom: 24 }}>
                    <Title level={4} style={{ color: '#1890ff' }}>
                      {plan.skill_name} 学习计划
                    </Title>
                    
                    <Collapse accordion>
                      {plan.plan_phases.map((phase, phaseIndex) => (
                        <Panel 
                          header={
                            <Space>
                              <BookOutlined />
                              <strong>{phase.phase_name}</strong>
                              <Tag color="blue">{phase.tasks.length}个任务</Tag>
                            </Space>
                          } 
                          key={phaseIndex}
                        >
                          <List
                            dataSource={phase.tasks}
                            renderItem={(task, taskIndex) => (
                              <List.Item>
                                <List.Item.Meta
                                  title={
                                    <Space>
                                      <span>任务{taskIndex + 1}:</span>
                                      <Text strong>{task.task_content}</Text>
                                    </Space>
                                  }
                                  description={
                                    <div>
                                      <Space style={{ marginBottom: 8 }}>
                                        <ClockCircleOutlined />
                                        <Text type="secondary">{task.duration}</Text>
                                      </Space>
                                      <div>
                                        <Text strong>推荐资源:</Text>
                                        <div style={{ marginTop: 4 }}>
                                          {task.resources.map((resource, resIndex) => (
                                            <Tag key={resIndex} color="green">
                                              {resource}
                                            </Tag>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        </Panel>
                      ))}
                    </Collapse>
                  </div>
                ))}

                <Divider />
                
                <Space orientation="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    block 
                    icon={<PlusOutlined />}
                    onClick={() => {
                      // 这里可以跳转到保存计划的页面
                      console.log('保存计划到系统')
                    }}
                  >
                    保存到我的规划
                  </Button>
                  <Button 
                    block
                    onClick={resetForm}
                  >
                    重新生成
                  </Button>
                </Space>
              </Card>
            </Col>
          )}
        </Row>
      </div>

      <style jsx>{`
        .create-plan-page {
          min-height: 100vh;
        }
        
        :global(.ant-form-item-label > label) {
          font-weight: 500;
        }
        
        :global(.ant-collapse-header) {
          padding: 12px 16px !important;
        }
        
        :global(.ant-list-item) {
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        :global(.ant-list-item:last-child) {
          border-bottom: none;
        }
      `}</style>
    </div>
  )
}