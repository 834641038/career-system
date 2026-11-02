// 存储管理工具
import { CompleteUserData } from '../types/user';
import { ResumeData } from '../types/resume';

export class StorageManager {
  static readonly USER_PROFILE_KEY = 'user_profile_data';
  static readonly AUTH_KEY = 'user';
  static readonly TOKEN_KEY = 'token';
  static readonly RESUME_KEY = 'career_resume_data';
  static readonly COMPLETE_USER_PROFILE_KEY = 'complete_user_profile';

  // 保存用户数据
  static saveUserProfile(data: CompleteUserData): void {
    try {
      localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('保存用户数据失败:', error);
    }
  }

  // 加载用户数据
  static loadUserProfile(): CompleteUserData | null {
    try {
      const data = localStorage.getItem(this.USER_PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('加载用户数据失败:', error);
      return null;
    }
  }

  // 保存认证信息
  static saveAuthInfo(authData: any): void {
    try {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('保存认证信息失败:', error);
    }
  }

  // 加载认证信息
  static loadAuthInfo(): any {
    try {
      const data = localStorage.getItem(this.AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('加载认证信息失败:', error);
      return null;
    }
  }

  // 保存简历数据
  static saveResume(resumeData: ResumeData): void {
    try {
      localStorage.setItem(this.RESUME_KEY, JSON.stringify(resumeData));
    } catch (error) {
      console.error('保存简历数据失败:', error);
    }
  }

  // 加载简历数据
  static loadResume(): ResumeData | null {
    try {
      const data = localStorage.getItem(this.RESUME_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('加载简历数据失败:', error);
      return null;
    }
  }

  // 保存完整用户档案
  static saveCompleteProfile(profile: CompleteUserData): void {
    try {
      localStorage.setItem(this.COMPLETE_USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('保存完整用户档案失败:', error);
    }
  }

  // 加载完整用户档案
  static loadCompleteProfile(): CompleteUserData | null {
    try {
      const data = localStorage.getItem(this.COMPLETE_USER_PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('加载完整用户档案失败:', error);
      return null;
    }
  }

  // 清除所有用户数据
  static clearUserData(): void {
    const keysToRemove = [
      this.USER_PROFILE_KEY,
      this.AUTH_KEY,
      this.TOKEN_KEY,
      this.RESUME_KEY,
      this.COMPLETE_USER_PROFILE_KEY
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('所有用户数据已清除');
  }

  // 检查是否有有效的用户数据
  static hasValidUserData(): boolean {
    const auth = this.loadAuthInfo();
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!(auth && token);
  }
}