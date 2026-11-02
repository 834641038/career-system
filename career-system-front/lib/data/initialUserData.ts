// 用户初始数据配置文件
import { UserService } from '../services/userService';

// 页面组件中使用示例
export const useInitialUserData = () => {
  // 在应用启动时调用此函数来初始化数据
  const initializeData = () => {
    UserService.initializeMockData();
  };

  // 获取用户数据
  const getUserData = () => {
    return UserService.loadUserData();
  };

  // 获取完整用户档案
  const getUserProfile = () => {
    return UserService.getUserProfile();
  };

  // 检查用户认证状态
  const isAuthenticated = () => {
    return UserService.isAuthenticated();
  };

  return {
    initializeData,
    getUserData,
    getUserProfile,
    isAuthenticated
  };
};

// 开发环境下的自动初始化
if (process.env.NODE_ENV === 'development') {
  // 可以在这里添加自动初始化逻辑
  // 注意：实际项目中应该通过用户操作来触发初始化
}