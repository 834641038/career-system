// app/settings/page.tsx
// 设置界面
'use client'
import { useState } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Switch, 
  List, 
  Divider,
  Modal,
  Input,
  Form,
  Row,
  Col,
  Alert,
  Space
} from 'antd';
import { 
  SettingOutlined,
  NotificationOutlined,
  SafetyOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation'; // 确保从正确的路径导入

const { Title, Text } = Typography;

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);

  // 状态管理
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      system: false,
    },
    privacy: {
      profileVisible: true,
      activityPublic: false,
    },
  });

  // 事件处理函数
  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      Modal.success({
        title: '设置已保存',
        content: '您的偏好设置已成功更新',
      });
    } catch (error) {
      Modal.error({
        title: '保存失败',
        content: '请检查网络连接后重试',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    // 实际的密码修改逻辑应调用API
    console.log('修改密码:', values);
    setChangePasswordModal(false);
    Modal.success({ title: '密码修改成功' });
  };

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      {/* 页面头部 - 添加返回导航 */}
      <div style={{ marginBottom: 32 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.back()}
          style={{ marginBottom: 16 }}
          type="text"
        >
          返回
        </Button>
        <Title level={2} style={{ marginBottom: 8 }}>
          <SettingOutlined style={{ marginRight: 12 }} />
          账户设置
        </Title>
        <Text type="secondary">管理您的账户偏好和安全设置</Text>
      </div>

      {/* 通知设置 - 简化选项 */}
      <Card 
        title={
          <span>
            <NotificationOutlined style={{ marginRight: 8 }} />
            通知设置
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <List
          dataSource={[
            {
              title: '邮件通知',
              description: '接收重要更新和系统通知',
              key: 'email',
              enabled: settings.notifications.email,
            },
            {
              title: '系统消息',
              description: '接收系统提示和更新',
              key: 'system', 
              enabled: settings.notifications.system,
            },
          ]}
          renderItem={item => (
            <List.Item
              actions={[
                <Switch
                  key={item.key}
                  checked={item.enabled}
                  onChange={(checked) => handleNotificationChange(item.key, checked)}
                />
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 隐私设置 - 简化选项 */}
      <Card 
        title={
          <span>
            <EyeInvisibleOutlined style={{ marginRight: 8 }} />
            隐私设置
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <List
          dataSource={[
            {
              title: '个人资料可见',
              description: '允许其他用户查看您的个人资料',
              key: 'profileVisible',
              enabled: settings.privacy.profileVisible,
            },
            {
              title: '学习活动公开',
              description: '公开您的学习进度和成就',
              key: 'activityPublic',
              enabled: settings.privacy.activityPublic,
            },
          ]}
          renderItem={item => (
            <List.Item
              actions={[
                <Switch
                  key={item.key}
                  checked={item.enabled}
                  onChange={(checked) => handlePrivacyChange(item.key, checked)}
                />
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 安全设置 - 保留核心功能 */}
      <Card 
        title={
          <span>
            <SafetyOutlined style={{ marginRight: 8 }} />
            账户安全
          </span>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>登录密码</Text>
              <div style={{ fontSize: '12px', color: '#666' }}>定期更改密码有助于保护账户安全</div>
            </div>
            <Button 
              icon={<LockOutlined />}
              onClick={() => setChangePasswordModal(true)}
            >
              修改密码
            </Button>
          </div>
        </Space>
      </Card>

      {/* 保存按钮 */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Button 
          type="primary" 
          size="large" 
          loading={loading}
          onClick={handleSaveSettings}
          icon={<SaveOutlined />}
        >
          保存设置
        </Button>
      </div>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={changePasswordModal}
        onCancel={() => setChangePasswordModal(false)}
        footer={null}
        width={400}
      >
        <Form
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位字符' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}