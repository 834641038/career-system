//测评记录
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Space, 
  Tag, 
  Button, 
  Input, 
  Select, 
  DatePicker, 
  Row, 
  Col,
  Typography,
  Statistic,
  Divider,
  Badge,
  Modal,
  Descriptions,
  Empty
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { assessmentService } from '@/lib/services/assessmentService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 测评记录数据类型定义
interface AssessmentRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  score: number;
  duration: string;
  status: 'completed' | 'pending' | 'reviewing';
  category: string;
  description: string;
  recommendations: string[];
}

// 模拟测评记录数据
const mockAssessmentRecords: AssessmentRecord[] = [
  {
    id: 'AS001',
    title: '职业兴趣测评',
    type: '兴趣测评',
    date: '2024-01-15',
    score: 85,
    duration: '25分钟',
    status: 'completed',
    category: '职业发展',
    description: '全面评估您的职业兴趣倾向，包括现实型、研究型、艺术型等多个维度',
    recommendations: ['建议关注技术类岗位', '适合从事创新性工作', '推荐参与项目管理']
  },
  {
    id: 'AS002',
    title: '技能水平评估',
    type: '技能测评',
    date: '2024-01-20',
    score: 72,
    duration: '35分钟',
    status: 'completed',
    category: '专业技能',
    description: '评估您在编程、沟通、团队协作等方面的技能水平',
    recommendations: ['加强编程实践', '提升沟通表达能力', '参与团队项目']
  },
  {
    id: 'AS003',
    title: '性格特质分析',
    type: '性格测评',
    date: '2024-01-25',
    score: 90,
    duration: '20分钟',
    status: 'reviewing',
    category: '个人发展',
    description: '深入分析您的性格特征，帮助您更好地了解自己',
    recommendations: ['发挥领导优势', '注意情绪管理', '培养决策能力']
  },
  {
    id: 'AS004',
    title: '职业价值观测试',
    type: '价值观测评',
    date: '2024-02-01',
    score: 78,
    duration: '30分钟',
    status: 'pending',
    category: '职业规划',
    description: '了解您对工作环境、薪酬待遇、发展空间等方面的价值取向',
    recommendations: []
  }
];

// 把后端三类测评记录转成表格行（holland / values / skills）
const buildRecordsFromApi = (data: any): AssessmentRecord[] => {
  const records: AssessmentRecord[] = [];
  const fmt = (t: any) => (t ? dayjs(t).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
  const avg = (nums: number[]) => {
    const valid = nums.filter(n => typeof n === 'number' && n > 0);
    return valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
  };

  (data?.holland || []).forEach((row: any) => {
    const dims = [
      { key: '现实型(R)', v: row.holland_R },
      { key: '研究型(I)', v: row.holland_I },
      { key: '艺术型(A)', v: row.holland_A },
      { key: '社会型(S)', v: row.holland_S },
      { key: '企业型(E)', v: row.holland_E },
      { key: '常规型(C)', v: row.holland_C },
    ].sort((a, b) => (b.v || 0) - (a.v || 0));
    records.push({
      id: 'HO' + String(row.holland_test_id).padStart(4, '0'),
      title: '霍兰德职业兴趣测评',
      type: '兴趣测评',
      date: fmt(row.holland_test_time),
      score: avg(dims.map(d => Number(d.v) || 0) ),
      duration: '20分钟',
      status: 'completed',
      category: '职业发展',
      description: `六维得分：${dims.map(d => `${d.key}${d.v || 0}`).join(' / ')}`,
      recommendations: dims.slice(0, 2).map(d => `推荐关注${d.key.replace(/\(.\)/, '')}相关岗位`),
    });
  });

  (data?.values || []).forEach((row: any) => {
    const dims = [
      { key: '社会贡献', v: row.social_contribution },
      { key: '成就导向', v: row.achievement_oriented },
      { key: '安全稳定', v: row.safe_stable },
      { key: '工作生活平衡', v: row.work_life_balance },
      { key: '权力地位', v: row.power_status },
      { key: '创新挑战', v: row.innovation_challenge },
    ].sort((a, b) => (b.v || 0) - (a.v || 0));
    records.push({
      id: 'VA' + String(row.value_id).padStart(4, '0'),
      title: '职业价值观测评',
      type: '价值观测评',
      date: fmt(row.value_test_time),
      score: avg(dims.map(d => Number(d.v) || 0)),
      duration: '15分钟',
      status: 'completed',
      category: '职业规划',
      description: `最看重：${dims[0]?.key || '-'}（${dims[0]?.v || 0}分）`,
      recommendations: dims.slice(0, 2).map(d => `${d.key}倾向明显，可优先考虑匹配该特质的岗位`),
    });
  });

  (data?.skills || []).forEach((row: any) => {
    records.push({
      id: 'SK' + String(row.assessment_id).padStart(4, '0'),
      title: '技能维度测评',
      type: '技能测评',
      date: fmt(row.assess_time),
      score: Number(row.overall) || 0,
      duration: '10分钟',
      status: 'completed',
      category: '专业技能',
      description: `专业技术 ${row.technical || 0} / 思维能力 ${row.thinking || 0} / 学习能力 ${row.learning || 0} / 软技能 ${row.soft || 0}`,
      recommendations: [],
    });
  });

  // 按日期倒序
  return records.sort((a, b) => (a.date < b.date ? 1 : -1));
};

import LoginRequired, { useLoginGuard } from '@/app/components/LoginRequired'

export default function AssessmentHistoryPage() {
  const { checked, needLogin } = useLoginGuard()
  if (!checked) return null
  if (needLogin) return <LoginRequired pageName="测评记录" />
  return <AssessmentHistoryPageInner />
}

function AssessmentHistoryPageInner() {
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AssessmentRecord[]>([]);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AssessmentRecord | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 从后端加载真实测评记录；接口异常时回退到示例数据
  useEffect(() => {
    let mounted = true
    assessmentService.getHistory().then(res => {
      if (!mounted) return
      if (res.success) {
        setRecords(buildRecordsFromApi(res.data))
      } else {
        setRecords(mockAssessmentRecords)
      }
    }).catch(() => {
      if (mounted) setRecords(mockAssessmentRecords)
    })
    return () => { mounted = false }
  }, [])

  // 统计数据
  const completedCount = records.filter(r => r.status === 'completed').length;
  const pendingCount = records.filter(r => r.status === 'pending').length;
  const averageScore = records.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.score, 0) / completedCount || 0;

  // 过滤函数
  useEffect(() => {
    let filtered = [...records];
    
    // 文本搜索
    if (searchText) {
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(searchText.toLowerCase()) ||
        record.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // 类型过滤
    if (typeFilter) {
      filtered = filtered.filter(record => record.type === typeFilter);
    }
    
    // 状态过滤
    if (statusFilter) {
      filtered = filtered.filter(record => record.status === statusFilter);
    }
    
    // 日期范围过滤
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(record => {
        const recordDate = dayjs(record.date);
        return recordDate.isAfter(startDate) && recordDate.isBefore(endDate);
      });
    }
    
    setFilteredRecords(filtered);
  }, [records, searchText, typeFilter, statusFilter, dateRange]);

  // 处理日期范围变化的函数
  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };

  // 表格列定义
  const columns: ColumnsType<AssessmentRecord> = [
    {
      title: '测评编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '测评名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      )
    },
    {
      title: '测评时间',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (text) => (
        <Space>
          <CalendarOutlined />
          {dayjs(text).format('YYYY-MM-DD')}
        </Space>
      )
    },
    {
      title: '用时',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (text) => (
        <Space>
          <ClockCircleOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (score, record) => (
        record.status === 'completed' ? (
          <Space>
            <StarOutlined style={{ color: '#faad14' }} />
            <Text strong>{score}分</Text>
          </Space>
        ) : (
          <Text disabled>--</Text>
        )
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
          pending: { color: 'warning', text: '待完成', icon: <ExclamationCircleOutlined /> },
          reviewing: { color: 'processing', text: '评审中', icon: <CheckCircleOutlined /> }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return (
          <Badge 
            status={statusInfo.color as any} 
            text={<Space>{statusInfo.icon}{statusInfo.text}</Space>} 
          />
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => {
              setSelectedRecord(record);
              setIsModalVisible(true);
            }}
          >
            查看详情
          </Button>
        </Space>
      )
    }
  ];

  // 获取状态筛选选项
  const getStatusOptions = () => {
    const statusCounts = records.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return [
      { value: '', label: '全部状态' },
      { value: 'completed', label: `已完成 (${statusCounts.completed || 0})` },
      { value: 'pending', label: `待完成 (${statusCounts.pending || 0})` },
      { value: 'reviewing', label: `评审中 (${statusCounts.reviewing || 0})` }
    ];
  };

  // 获取类型筛选选项
  const getTypeOptions = () => {
    const typeCounts = records.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const uniqueTypes = Array.from(new Set(records.map(r => r.type)));
    return [
      { value: '', label: '全部类型' },
      ...uniqueTypes.map(type => ({
        value: type,
        label: `${type} (${typeCounts[type] || 0})`
      }))
    ];
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <Title level={2} style={{ marginBottom: '24px' }}>
        <Space>
          <FilterOutlined />
          测评记录
        </Space>
      </Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="已完成测评"
              value={completedCount}
              prefix={<CheckCircleOutlined />}
              styles={{ content: {  color: '#52c41a'  } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="待完成测评"
              value={pendingCount}
              prefix={<ExclamationCircleOutlined />}
              styles={{ content: {  color: '#faad14'  } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="平均得分"
              value={averageScore.toFixed(1)}
              prefix={<StarOutlined />}
              suffix="分"
              precision={1}
              styles={{ content: {  color: '#1890ff'  } }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* 筛选区域 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input
              placeholder="搜索测评名称或描述"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="测评类型"
              value={typeFilter}
              onChange={setTypeFilter}
              options={getTypeOptions()}
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="测评状态"
              value={statusFilter}
              onChange={setStatusFilter}
              options={getStatusOptions()}
            />
          </Col>
          <Col span={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col span={4}>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => {
                // 这里可以实现导出功能
                console.log('导出测评记录');
              }}
            >
              导出记录
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 测评记录表格 */}
      <Card>
        {filteredRecords.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredRecords}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
          />
        ) : (
          <Empty
            description="暂无符合条件的测评记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="测评详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="测评编号">{selectedRecord.id}</Descriptions.Item>
            <Descriptions.Item label="测评名称">{selectedRecord.title}</Descriptions.Item>
            <Descriptions.Item label="测评类型">
              <Tag color="blue">{selectedRecord.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="所属分类">{selectedRecord.category}</Descriptions.Item>
            <Descriptions.Item label="测评时间">
              <Space>
                <CalendarOutlined />
                {dayjs(selectedRecord.date).format('YYYY年MM月DD日')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="用时">
              <Space>
                <ClockCircleOutlined />
                {selectedRecord.duration}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="测评状态">
              {selectedRecord.status === 'completed' ? (
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text type="success">已完成</Text>
                </Space>
              ) : selectedRecord.status === 'pending' ? (
                <Space>
                  <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                  <Text type="warning">待完成</Text>
                </Space>
              ) : (
                <Space>
                  <CheckCircleOutlined style={{ color: '#1890ff' }} />
                  <Text type="secondary">评审中</Text>
                </Space>
              )}
            </Descriptions.Item>
            {selectedRecord.status === 'completed' && (
              <Descriptions.Item label="测评得分">
                <Space>
                  <StarOutlined style={{ color: '#faad14' }} />
                  <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                    {selectedRecord.score}分
                  </Text>
                </Space>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="测评描述" span={2}>
              {selectedRecord.description}
            </Descriptions.Item>
            {selectedRecord.recommendations.length > 0 && (
              <Descriptions.Item label="个性化建议" span={2}>
                <Space orientation="vertical">
                  {selectedRecord.recommendations.map((rec, index) => (
                    <Tag key={index} color="green">{rec}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}