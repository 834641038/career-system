// 学习资源页面（前端模拟数据）
'use client'
import { PageHeader } from '@ant-design/pro-components'
import {
  Card,
  Button,
  Typography,
  Tabs,
  Row,
  Col,
  Modal,
  Space,
  Tag,
  Rate,
  Progress
} from 'antd'
import {
  BookOutlined,
  ReadOutlined,
  ToolOutlined,
  StarOutlined,
  ClockCircleOutlined,
  TagOutlined,
  CheckCircleOutlined,
  CrownOutlined
} from '@ant-design/icons'
import { useState } from 'react'
import styles from './resources.module.css'

const { Title, Paragraph, Text } = Typography

// 推荐课程数据 - 丰富了更多细节
const mockCourses = [
  {
    id: 'C001',
    name: '前端开发入门：React + TypeScript',
    description: '通过项目实战掌握 React 和 TypeScript 的核心概念与最佳实践。课程包含 12 个实战项目，从零开始构建企业级应用。',
    website: 'https://www.coursera.org/specializations/react',
    difficulty: '中级',
    duration: '8 周',
    rating: 4.8,
    enrolled: '12.5k',
    tags: ['React', 'TypeScript', '前端开发'],
    features: ['实战项目', '代码评审', '职业指导']
  },
  {
    id: 'C002',
    name: '数据结构与算法基础',
    description: '系统学习常见数据结构（数组、链表、栈、队列、树、图等）和经典算法（排序、搜索、动态规划等），掌握面试高频题解题思路。',
    website: 'https://www.edx.org/course/data-structures-algorithms',
    difficulty: '高级',
    duration: '6 周',
    rating: 4.7,
    enrolled: '23.8k',
    tags: ['算法', '面试准备', '计算机基础'],
    features: ['LeetCode 专题', '模拟面试', '代码优化']
  },
  {
    id: 'C003',
    name: '职业发展与软技能提升',
    description: '提升沟通、时间管理、团队协作、演讲表达等关键软技能，助力职场发展。包含简历优化、面试技巧和职场情商培养。',
    website: 'https://www.udemy.com/course/soft-skills-career-development/',
    difficulty: '初级',
    duration: '4 周',
    rating: 4.6,
    enrolled: '8.2k',
    tags: ['软技能', '职业发展', '职场沟通'],
    features: ['1对1辅导', '实战练习', '职业规划']
  },
  {
    id: 'C004',
    name: 'Python 全栈开发实战',
    description: '从 Python 基础到 Django/Flask 后端开发，再到前端技术栈，全面掌握全栈开发技能。包含 3 个完整项目开发流程。',
    website: 'https://www.coursera.org/specializations/python',
    difficulty: '中级',
    duration: '10 周',
    rating: 4.9,
    enrolled: '15.3k',
    tags: ['Python', '全栈开发', 'Django'],
    features: ['项目实战', '代码审查', '就业推荐']
  },
  {
    id: 'C005',
    name: 'UI/UX 设计入门与实战',
    description: '掌握设计原则、用户研究、线框图绘制、原型设计和用户测试全流程。使用 Figma 进行实战项目，打造专业作品集。',
    website: 'https://www.udacity.com/course/ui-ux-design--nd578',
    difficulty: '初级',
    duration: '6 周',
    rating: 4.5,
    enrolled: '6.7k',
    tags: ['UI设计', 'UX设计', 'Figma'],
    features: ['作品集指导', '行业专家评审', '设计规范']
  },
  {
    id: 'C006',
    name: '数据分析与可视化实战',
    description: '使用 Python (Pandas, NumPy, Matplotlib, Seaborn) 进行数据分析与可视化，掌握数据清洗、分析和呈现全流程。',
    website: 'https://www.coursera.org/specializations/data-visualization',
    difficulty: '中级',
    duration: '7 周',
    rating: 4.7,
    enrolled: '9.4k',
    tags: ['数据分析', 'Python', '数据可视化'],
    features: ['真实数据集', '项目实战', '行业案例']
  }
]

// 学习资料数据 - 丰富了更多细节
const mockMaterials = [
  {
    id: 'B001',
    name: '《算法导论（原书第3版）》',
    description: '经典算法教材，涵盖算法设计与分析的核心思想与技巧。被全球多所顶尖大学用作教材，是算法学习的权威参考书。',
    website: 'https://www.amazon.com/Introduction-Algorithms-3rd-Edition/dp/0262033844',
    type: '电子书',
    level: '高级',
    difficulty: 4,
    tags: ['算法', '计算机科学', '经典教材'],
    features: ['详细证明', '丰富习题', '算法伪代码']
  },
  {
    id: 'B002',
    name: '《JavaScript 高级程序设计》',
    description: '深入理解 JavaScript 语言机制与浏览器中的高级用法。第4版全面覆盖 ES6+ 新特性，是前端开发者必读经典。',
    website: 'https://www.amazon.com/JavaScript-Definitive-Guide-Activate-Guides/dp/1491952024',
    type: '电子书',
    level: '中级',
    difficulty: 3,
    tags: ['JavaScript', '前端开发', 'Web开发'],
    features: ['实战示例', '新特性详解', '浏览器兼容性']
  },
  {
    id: 'B003',
    name: '《深入理解计算机系统》',
    description: '从系统层面理解计算机原理，提升底层思维能力。涵盖程序结构、内存管理、并发编程等核心概念。',
    website: 'https://www.amazon.com/Computer-Systems-Programmers-Perspective-3rd/dp/1484283622',
    type: '电子书',
    level: '高级',
    difficulty: 5,
    tags: ['计算机系统', '操作系统', '计算机组成'],
    features: ['实践项目', '系统视角', '性能优化']
  },
  {
    id: 'B004',
    name: 'React 官方文档',
    description: 'React 官方最新文档，包含详细的概念解释、API 参考和最佳实践指南。持续更新，是学习 React 的第一手资料。',
    website: 'https://react.dev/',
    type: '在线文档',
    level: '初级到高级',
    difficulty: 3,
    tags: ['React', '前端框架', '官方文档'],
    features: ['交互式示例', '渐进式学习', '最新特性']
  },
  {
    id: 'B005',
    name: 'TypeScript Handbook',
    description: 'TypeScript 官方手册，全面介绍 TypeScript 的类型系统、高级用法和与 JavaScript 的区别。适合从入门到精通。',
    website: 'https://www.typescriptlang.org/docs/',
    type: '在线文档',
    level: '中级',
    difficulty: 3,
    tags: ['TypeScript', '类型系统', '前端开发'],
    features: ['详细示例', '迁移指南', '类型推断详解']
  },
  {
    id: 'B006',
    name: 'Google 技术写作指南',
    description: 'Google 工程师编写的技术写作指南，涵盖技术文档、API 文档、设计文档等的写作规范和最佳实践。',
    website: 'https://developers.google.com/tech-writing',
    type: '在线资源',
    level: '初级',
    difficulty: 2,
    tags: ['技术写作', '文档', '沟通'],
    features: ['实用模板', '写作技巧', '案例分析']
  }
]

// 实用工具数据 - 丰富了更多细节
const mockTools = [
  {
    id: 'T001',
    name: 'VS Code',
    description: '一款轻量且可扩展的代码编辑器，拥有丰富的插件生态。支持几乎所有主流编程语言，是开发者的首选工具。',
    website: 'https://code.visualstudio.com/',
    category: '代码编辑器',
    isFree: true,
    difficulty: 2,
    tags: ['编辑器', '跨平台', '插件丰富'],
    features: ['智能提示', '调试工具', 'Git 集成']
  },
  {
    id: 'T002',
    name: 'Figma',
    description: '在线设计工具，适合界面原型设计与团队协作。实时协作功能强大，是 UI/UX 设计师的首选工具。',
    website: 'https://www.figma.com/',
    category: '设计工具',
    isFree: true,
    difficulty: 3,
    tags: ['UI设计', '原型设计', '团队协作'],
    features: ['实时协作', '设计系统', '交互原型']
  },
  {
    id: 'T003',
    name: 'Notion',
    description: '知识管理与团队协作工具，可用于整理学习笔记、项目计划和个人知识库。高度可定制，支持多种内容类型。',
    website: 'https://www.notion.so/',
    category: '知识管理',
    isFree: true,
    difficulty: 2,
    tags: ['笔记', '任务管理', '知识库'],
    features: ['模板库', '数据库功能', '多平台同步']
  },
  {
    id: 'T004',
    name: 'GitHub',
    description: '代码托管和版本控制平台，全球最大的开源社区。支持 Git 工作流，是开发者协作和展示作品的重要平台。',
    website: 'https://github.com/',
    category: '代码托管',
    isFree: true,
    difficulty: 3,
    tags: ['Git', '开源', '协作'],
    features: ['Issue跟踪', 'Pull Request', 'CI/CD集成']
  },
  {
    id: 'T005',
    name: 'Postman',
    description: 'API 开发与测试工具，支持创建、测试和文档化 API。团队协作功能强大，是前后端开发的必备工具。',
    website: 'https://www.postman.com/',
    category: 'API工具',
    isFree: true,
    difficulty: 2,
    tags: ['API测试', '开发工具', '协作'],
    features: ['自动化测试', 'Mock Server', '文档生成']
  },
  {
    id: 'T006',
    name: 'Docker',
    description: '容器化平台，帮助开发者构建、共享和运行应用程序。解决"在我机器上能运行"的问题，实现环境一致性。',
    website: 'https://www.docker.com/',
    category: '开发环境',
    isFree: true,
    difficulty: 4,
    tags: ['容器化', 'DevOps', '环境管理'],
    features: ['镜像管理', '容器编排', '跨平台支持']
  }
]

type ResourceItem = {
  id: string
  name: string
  description: string
  website: string
  [key: string]: any
}

type ResourceCategory = 'courses' | 'materials' | 'tools'

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<ResourceCategory>('courses')
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('courses')

  const openDetailModal = (category: ResourceCategory, item: ResourceItem) => {
    setSelectedCategory(category)
    setSelectedItem(item)
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setSelectedItem(null)
  }

  const renderCards = (category: ResourceCategory, data: ResourceItem[]) => (
    <Row gutter={[16, 16]}>
      {data.map((item) => (
        <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            className={styles.cardHover}
            title={item.name}
            extra={category === 'courses' && (
              <div className={styles.rating}>
                <Rate disabled allowHalf value={item.rating} />
                <span className={styles.ratingCount}>{item.rating}</span>
              </div>
            )}
            actions={[
              <Button type="link" onClick={() => openDetailModal(category, item)}>
                查看详情
              </Button>,
            ]}
          >
            <Paragraph className={styles.cardDescription} ellipsis={{ rows: 3 }}>
              {item.description}
            </Paragraph>
            
            {category === 'courses' && (
              <div className={styles.courseMeta}>
                <div className={styles.metaItem}>
                  <TagOutlined /> {item.difficulty}
                </div>
                <div className={styles.metaItem}>
                  <ClockCircleOutlined /> {item.duration}
                </div>
                <div className={styles.metaItem}>
                  <CheckCircleOutlined /> {item.enrolled}人已学习
                </div>
              </div>
            )}
            
            {category === 'materials' && (
              <div className={styles.materialMeta}>
                <Tag color="blue">{item.type}</Tag>
                <Tag color="purple">难度 {item.difficulty}/5</Tag>
                <div className={styles.difficulty}>
                  <Text>难度：</Text>
                  <Progress 
                    percent={item.difficulty * 20} 
                    showInfo={false} 
                    size="small" 
                    status="active" 
                  />
                </div>
              </div>
            )}
            
            {category === 'tools' && (
              <div className={styles.toolMeta}>
                <Tag color={item.isFree ? 'green' : 'gold'}>{item.isFree ? '免费' : '付费'}</Tag>
                <Tag color="blue">{item.category}</Tag>
                <div className={styles.difficulty}>
                  <Text>上手难度：</Text>
                  <Progress 
                    percent={item.difficulty * 20} 
                    showInfo={false} 
                    size="small" 
                    status="active" 
                  />
                </div>
              </div>
            )}
            
            <div className={styles.tags}>
              {item.tags.map((tag: string, index: number) => (
                <Tag key={index} color="blue" className={styles.tag}>
                  {tag}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  )

  const tabs = [
    {
      key: 'courses',
      label: '推荐课程',
      content: renderCards('courses', mockCourses),
      icon: <BookOutlined />,
    },
    {
      key: 'materials',
      label: '学习资料',
      content: renderCards('materials', mockMaterials),
      icon: <ReadOutlined />,
    },
    {
      key: 'tools',
      label: '实用工具',
      content: renderCards('tools', mockTools),
      icon: <ToolOutlined />,
    },
  ]

  const modalTitle = selectedItem ? selectedItem.name : ''
  const modalDescription = selectedItem ? selectedItem.description : ''
  const modalLink = selectedItem ? selectedItem.website : ''
  const modalLinkLabel = selectedCategory === 'tools' ? '官方网站' : '推荐网站'

  return (
    <div className={styles.resourcesPage}>
      <PageHeader
        title="学习资源中心"
        subTitle="课程、资料与工具一站式推荐"
      />

      <div className={styles.pageContent}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ResourceCategory)}
          items={tabs.map((tab) => ({
            key: tab.key,
            label: (
              <span>
                {tab.icon}
                <span style={{ marginLeft: 8 }}>{tab.label}</span>
              </span>
            ),
            children: tab.content,
          }))}
        />
      </div>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            关闭
          </Button>,
          <Button
            key="visit"
            type="primary"
            onClick={() => window.open(modalLink, '_blank')}
            disabled={!modalLink}
          >
            前往{modalLinkLabel}
          </Button>,
        ]}
      >
        <Paragraph>{modalDescription}</Paragraph>
        
        {selectedCategory === 'courses' && selectedItem && (
          <div className={styles.modalDetails}>
            <Paragraph>
              <strong>难度级别：</strong> {selectedItem.difficulty}
            </Paragraph>
            <Paragraph>
              <strong>预计学习时间：</strong> {selectedItem.duration}
            </Paragraph>
            <Paragraph>
              <strong>学习人数：</strong> {selectedItem.enrolled}
            </Paragraph>
            <Paragraph>
              <strong>评分：</strong>
              <Rate disabled value={selectedItem.rating} />
              <span className={styles.modalRating}>{selectedItem.rating} / 5</span>
            </Paragraph>
          </div>
        )}
        
        {selectedCategory === 'materials' && selectedItem && (
          <div className={styles.modalDetails}>
            <Paragraph>
              <strong>资料类型：</strong> {selectedItem.type}
            </Paragraph>
            <Paragraph>
              <strong>适合阶段：</strong> {selectedItem.level}
            </Paragraph>
            <Paragraph>
              <strong>难度：</strong>
              <Rate disabled value={selectedItem.difficulty} />
            </Paragraph>
          </div>
        )}
        
        {selectedCategory === 'tools' && selectedItem && (
          <div className={styles.modalDetails}>
            <Paragraph>
              <strong>工具类别：</strong> {selectedItem.category}
            </Paragraph>
            <Paragraph>
              <strong>是否免费：</strong> {selectedItem.isFree ? '是' : '否'}
            </Paragraph>
            <Paragraph>
              <strong>上手难度：</strong>
              <Rate disabled value={selectedItem.difficulty} />
            </Paragraph>
          </div>
        )}
        
        {selectedItem && selectedItem.features && (
          <div className={styles.features}>
            <Paragraph strong>主要特点：</Paragraph>
            <ul className={styles.featuresList}>
              {selectedItem.features.map((feature: string, index: number) => (
                <li key={index}>
                  <CheckCircleOutlined className={styles.featureIcon} /> {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {modalLink && (
          <Paragraph>
            <strong>{modalLinkLabel}：</strong>
            <a href={modalLink} target="_blank" rel="noreferrer">
              {modalLink}
            </a>
          </Paragraph>
        )}
      </Modal>
    </div>
  )
}