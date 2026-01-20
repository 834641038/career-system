//学习资源页面
'use client'
import { PageHeader } from '@ant-design/pro-components'
import { Card, Button, Typography, Space, Row, Col, Tabs, Tag, List } from 'antd'
import { 
  BookOutlined, 
  VideoCameraOutlined, 
  FileTextOutlined,
  ToolOutlined,
  LinkOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/routes'

const { Title, Paragraph } = Typography
const { TabPane } = Tabs

export default function ResourcesPage() {
  const router = useRouter()

  // Mock资源数据
  const courses = [
    { id: 1, title: 'React实战开发', description: '从入门到精通React开发的完整课程', category: '前端开发', duration: '20小时', level: '中级' },
    { id: 2, title: 'JavaScript进阶', description: '深入理解JavaScript核心概念和高级特性', category: '编程基础', duration: '15小时', level: '高级' },
    { id: 3, title: 'UI/UX设计原理', description: '用户体验和界面设计的核心原则', category: '设计', duration: '12小时', level: '初级' },
    { id: 4, title: 'Python数据分析', description: '使用Python进行数据分析和可视化', category: '数据分析', duration: '18小时', level: '中级' },
  ]

  const books = [
    { id: 1, title: '《程序员修炼之道》', author: 'Andrew Hunt', category: '编程思维', rating: 4.8 },
    { id: 2, title: '《设计心理学》', author: '唐纳德·诺曼', category: '设计', rating: 4.7 },
    { id: 3, title: '《高效能人士的七个习惯》', author: '史蒂芬·柯维', category: '个人成长', rating: 4.6 },
    { id: 4, title: '《算法导论》', author: 'Thomas H. Cormen', category: '算法', rating: 4.5 },
  ]

  const tools = [
    { id: 1, name: 'Figma', description: '协作式界面设计工具', category: '设计', url: '#' },
    { id: 2, name: 'VSCode', description: '轻量级代码编辑器', category: '开发', url: '#' },
    { id: 3, name: 'Notion', description: '全能型笔记和项目管理工具', category: '效率', url: '#' },
    { id: 4, name: 'Anki', description: '间隔重复记忆软件', category: '学习', url: '#' },
  ]

  return (
    <div className="resources-page">
      <PageHeader
        title="学习资源"
        subTitle="丰富的学习资源助力你的职业发展"
        extra={[
          <Button 
            key="dashboard" 
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            返回仪表盘
          </Button>,
        ]}
      />

      <div className="page-content" style={{ padding: '24px' }}>
        <Tabs defaultActiveKey="courses">
          <TabPane tab="课程" key="courses" icon={<VideoCameraOutlined />}>
            <Row gutter={[24, 24]}>
              {courses.map(course => (
                <Col span={12} key={course.id}>
                  <Card 
                    hoverable
                    style={{ height: '100%' }}
                    onClick={() => {}}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <Title level={4} style={{ margin: 0 }}>{course.title}</Title>
                        <Paragraph type="secondary">{course.description}</Paragraph>
                      </div>
                      <VideoCameraOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                    </div>
                    
                    <div style={{ marginTop: 16 }}>
                      <Tag color="blue">{course.category}</Tag>
                      <Tag color="green">{course.level}</Tag>
                      <Tag icon={<BookOutlined />} color="geekblue">{course.duration}</Tag>
                    </div>
                    
                    <div style={{ marginTop: 16, textAlign: 'right' }}>
                      <Button type="primary" onClick={() => {}}>
                        开始学习
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
          
          <TabPane tab="书籍" key="books" icon={<FileTextOutlined />}>
            <Row gutter={[24, 24]}>
              {books.map(book => (
                <Col span={12} key={book.id}>
                  <Card 
                    hoverable
                    style={{ height: '100%' }}
                    onClick={() => {}}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FileTextOutlined style={{ fontSize: '48px', color: '#52c41a', marginRight: 16 }} />
                      <div>
                        <Title level={4} style={{ margin: 0 }}>{book.title}</Title>
                        <Paragraph type="secondary">作者: {book.author}</Paragraph>
                        <div style={{ marginTop: 8 }}>
                          <Tag color="purple">{book.category}</Tag>
                          <Tag color="gold">⭐ {book.rating}</Tag>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: 16, textAlign: 'right' }}>
                      <Button type="primary" onClick={() => {}}>
                        开始阅读
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
          
          <TabPane tab="工具" key="tools" icon={<ToolOutlined />}>
            <Row gutter={[24, 24]}>
              {tools.map(tool => (
                <Col span={8} key={tool.id}>
                  <Card 
                    hoverable
                    style={{ height: '100%' }}
                  >
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <ToolOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: 16 }} />
                      <Title level={4} style={{ margin: '8px 0' }}>{tool.name}</Title>
                      <Paragraph type="secondary">{tool.description}</Paragraph>
                      
                      <div style={{ marginTop: 16 }}>
                        <Tag color="orange">{tool.category}</Tag>
                      </div>
                      
                      <div style={{ marginTop: 16 }}>
                        <Button 
                          type="primary" 
                          icon={<LinkOutlined />}
                          href={tool.url}
                          target="_blank"
                        >
                          访问工具
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
        </Tabs>
        
        <Card title="推荐学习路径" style={{ marginTop: 24 }}>
          <Paragraph>
            <ul>
              <li><strong>前端开发路径:</strong> HTML/CSS → JavaScript → React/Vue → 实战项目</li>
              <li><strong>后端开发路径:</strong> 计算机基础 → Node.js/Java/Python → 数据库 → API设计</li>
              <li><strong>数据分析路径:</strong> Excel → SQL → Python → Tableau → 机器学习</li>
              <li><strong>UI/UX设计路径:</strong> 设计基础 → Figma → 用户研究 → 交互设计</li>
            </ul>
          </Paragraph>
        </Card>
      </div>
    </div>
  )
}