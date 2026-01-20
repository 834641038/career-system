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
  MenuFoldOutlined
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
    key: 'dashboard',
    label: '仪表板',
    path: '/dashboard',
    icon: 'DashboardOutlined'
  },
  {
    key: 'career-planning',
    label: '职业规划',
    icon: 'ExperimentOutlined',
    children: [
      {
        key: 'assessment',
        label: '能力测评',
        path: '/assessment'
      },
      {
        key: 'plan',
        label: '生涯规划',
        path: '/plan'
      },
      {
        key: 'career-exploration',
        label: '职业探索',
        path: '/career'
      }
    ]
  },
  {
    key: 'skills-development',
    label: '技能发展',
    icon: 'RocketOutlined',
    children: [
      {
        key: 'skill-assessment',
        label: '技能评估',
        path: '/skills-development/skill-assessment'
      },
      {
        key: 'learning-path',
        label: '学习路径',
        path: '/skills-development/learning-path'
      }
    ]
  },
  {
    key: 'job-search',
    label: '求职管理',
    icon: 'CalendarOutlined',
    children: [
      {
        key: 'resume-builder',
        label: '简历构建',
        path: '/job-search/resume-builder'
      },
      {
        key: 'interview-prep',
        label: '面试准备',
        path: '/job-search/interview-prep'
      }
    ]
  },
  {
    key: 'resources',
    label: '资源中心',
    icon: 'BookOutlined',
    path: '/resources'
  },
  {
    key: 'profile',
    label: '个人中心',
    path: '/profile',
    icon: 'UserOutlined'
  }
];

interface NavigationProps {
  children?: React.ReactNode;
}

const Navigation: React.FC<NavigationProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // 使用 usePathname 获取当前路径
  
  // 获取图标组件
  const getIconComponent = (iconName: string | undefined) => {
    const iconMap: Record<string, React.ReactNode> = {
      'HomeOutlined': <HomeOutlined />,
      'DashboardOutlined': <DashboardOutlined />,
      'ExperimentOutlined': <ExperimentOutlined />,
      'RocketOutlined': <RocketOutlined />,
      'CalendarOutlined': <CalendarOutlined />,
      'BookOutlined': <BookOutlined />,
      'UserOutlined': <UserOutlined />,
    };
    return iconName ? iconMap[iconName] : null;
  };

  // 生成菜单项
  const menuItems: MenuProps['items'] = NAV_MENU.map(item => {
    if (item.children) {
      return {
        key: item.key,
        label: item.label,
        icon: getIconComponent(item.icon),
        children: item.children.map(child => ({
          key: child.key,
          label: (
            <Link href={child.path || ''}>
              {child.label}
            </Link>
          ),
          onClick: () => router.push(child.path || '')
        }))
      };
    }

    return {
      key: item.key,
      label: (
        <Link href={item.path || ''}>
          {item.label}
        </Link>
      ),
      icon: getIconComponent(item.icon),
      onClick: () => router.push(item.path || '')
    };
  });

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 计算当前选中的菜单项
  const getCurrentSelectedKey = () => {
    if (pathname === '/') return 'home';
    
    // 检查是否匹配子菜单路径
    for (const item of NAV_MENU) {
      if (item.children) {
        for (const child of item.children) {
          if (child.path && pathname.startsWith(child.path)) {
            return child.key;
          }
        }
      }
      if (item.path && pathname.startsWith(item.path) && item.path !== '/') {
        return item.key;
      }
    }
    return 'home';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        style={{ background: colorBgContainer, position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 10 }}
      >
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', visibility: 'hidden' }} />
        <Menu
          theme="light"
          mode="inline"
          items={menuItems}
          selectedKeys={[getCurrentSelectedKey()]}
          style={{ height: 'calc(100% - 64px)', borderRight: 0, overflowY: 'auto' }}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
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
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          minHeight: 'calc(100vh - 112px)', 
          background: colorBgContainer,
          overflow: 'auto'
        }}>
          {/* 渲染传入的内容 */}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Navigation;