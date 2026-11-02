//认证上下文
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'
import { message } from 'antd'
import { UserService } from '../../lib/services/userService'

interface User {
  id: string
  email: string
  name: string
  studentId?: string
  major?: string
  university?: string
  enrollmentYear?: string
  graduationYear?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  logout: () => Promise<void>
  register: (userData: RegisterData) => Promise<AuthResponse>
  loading: boolean
  initializeMockData: () => void
}

interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
  studentId: string
  major: string
}

interface AuthResponse {
  success: boolean
  message?: string
  user?: User
  token?: string
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储的认证信息
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // 首先检查是否有现成的用户数据
      const currentUser = UserService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        return;
      }

      // 如果没有，则尝试通过token验证
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        return
      }

      // 验证 token 并获取用户信息
      const profile = await authService.getProfile()
      if (profile.success && profile.user) {
        setUser(profile.user as unknown as User)
        localStorage.setItem('user', JSON.stringify(profile.user))
      } else {
        // Token无效，清除本地存储
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      setLoading(true)
      const result = await authService.login(credentials)
      
      if (result.success && result.user && result.token) {
        setUser(result.user as unknown as User)
        
        // 存储认证信息
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('token', result.token)
        
        if (credentials.rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        }
      }
      
      return {
        success: result.success,
        message: result.message,
        token: result.token,
        user: result.user ? (result.user as unknown as User) : undefined
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '登录失败'
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await authService.logout()
      setUser(null)
      UserService.clearUserData()
      message.success('已退出登录')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      setLoading(true)
      const result = await authService.register(userData)
      
      // 注册成功后不需要自动登录，让用户手动登录
      return { success: result.success, message: result.message }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '注册失败'
      }
    } finally {
      setLoading(false)
    }
  }

  // 初始化模拟数据的方法
  const initializeMockData = () => {
    UserService.initializeMockData()
    // 重新检查认证状态以加载新数据
    checkAuthStatus()
    message.success('模拟数据初始化完成')
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    loading,
    initializeMockData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}