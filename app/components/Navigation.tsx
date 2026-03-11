'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Layout, Button, theme } from 'antd';
import type { MenuProps } from 'antd';
import { 
  HomeOutlined, 
  DashboardOutlined, 
  ExperimentOutlined, 
  RocketOutlined, 
  CalendarOutlined, 
  BookOutlined, 
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AimOutlined,
  FileTextOutlined,
  ProfileOutlined,
  BarChartOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

// 导航菜单数据结构
interface NavMenuItem {
  key: string;
  label: string;
  path?: string;
  icon?: string;
  children?: Omit<NavMenuItem, 'children'>[];
}

const NAV_MENU: NavMenuItem[] = [
  {
    key: 'home',
    label: '首页',
    path: '/',
    icon: 'HomeOutlined'
  },
  {
    key: 'assessment',
    label: '智能测评',
    path: '/assessment',
    icon: 'ExperimentOutlined'
  },
  {
    key: 'plan',
    label: '生涯规划',
    path: '/plan',
    icon: 'CalendarOutlined'
  },
  {
    key: 'dashboard',
    label: '个人仪表盘',
    path: '/dashboard',
    icon: 'BarChartOutlined'
  },
  {
    key: 'career',
    label: '职业探索',
    path: '/career',
    icon: 'AimOutlined'
  },
  {
    key: 'skills',
    label: '技能发展',
    icon: 'RocketOutlined',
    children: [
      {
        key: 'learning-path',
        label: '学习路径',
        path: '/skills-development/learning-path',
        icon: 'BookOutlined'
      },
      {
        key: 'skill-assessment',
        label: '技能评估',
        path: '/skills-development/skill-assessment',
        icon: 'CheckCircleOutlined'
      }
    ]
  },
  {
    key: 'job-search',
    label: '求职服务',
    icon: 'UserOutlined',
    children: [
      {
        key: 'resume-builder',
        label: '简历构建',
        path: '/profile/resume/edit',
        icon: 'FileTextOutlined'
      },
      {
        key: 'interview-prep',
        label: '面试准备',
        path: '/job-search/interview-prep',
        icon: 'ProfileOutlined'
      }
    ]
  },
  {
    key: 'profile',
    label: '个人中心',
    path: '/profile',
    icon: 'UserOutlined'
  }
];

// 根据图标名称获取实际图标组件
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'HomeOutlined':
      return <HomeOutlined />;
    case 'DashboardOutlined':
      return <DashboardOutlined />;
    case 'ExperimentOutlined':
      return <ExperimentOutlined />;
    case 'RocketOutlined':
      return <RocketOutlined />;
    case 'CalendarOutlined':
      return <CalendarOutlined />;
    case 'BookOutlined':
      return <BookOutlined />;
    case 'UserOutlined':
      return <UserOutlined />;
    case 'AimOutlined':
      return <AimOutlined />;
    case 'FileTextOutlined':
      return <FileTextOutlined />;
    case 'ProfileOutlined':
      return <ProfileOutlined />;
    case 'BarChartOutlined':
      return <BarChartOutlined />;
    case 'CheckCircleOutlined':
      return <CheckCircleOutlined />;
    default:
      return <UserOutlined />;
  }
};

interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 构建菜单项
  const buildMenuItems = (menuItems: NavMenuItem[]): MenuProps['items'] => {
    return menuItems.map((item) => {
      const baseItem = {
        icon: getIconComponent(item.icon || ''),
        label: item.path ? <Link href={item.path}>{item.label}</Link> : item.label,
      };
      
      if (item.children && item.children.length > 0) {
        return {
          ...baseItem,
          key: item.key,
          children: buildMenuItems(item.children),
        };
      } else {
        return {
          ...baseItem,
          key: item.path || item.key,
        };
      }
    });
  };

  // 根据当前路径获取选中的菜单项
  const getSelectedKeys = (): string[] => {
    const pathParts = pathname.split('/');
    
    // 检查是否有精确匹配
    for (const item of NAV_MENU) {
      if (item.path === pathname) {
        return [item.path];
      }
      
      if (item.children) {
        for (const child of item.children) {
          if (child.path === pathname) {
            return [child.path];
          }
        }
      }
    }
    
    // 如果没有精确匹配，则返回匹配路径开头的
    for (const item of NAV_MENU) {
      if (item.path && pathname.startsWith(item.path) && item.path !== '/') {
        return [item.path];
      }
      
      if (item.children) {
        for (const child of item.children) {
          if (child.path && pathname.startsWith(child.path)) {
            return [child.path];
          }
        }
      }
    }
    
    // 默认返回首页
    return ['/'];
  };

  // 处理菜单项点击
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key.startsWith('/')) {
      router.push(e.key);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        style={{ background: colorBgContainer }}
      >
        <div className="logo" style={{ height: 32, margin: 16, textAlign: 'center', background: 'rgba(255, 255, 255, 0.2)', lineHeight: '32px' }}>
          {!collapsed && <span style={{ color: '#1890ff', fontWeight: 'bold' }}>职海航图</span>}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={buildMenuItems(NAV_MENU)}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
