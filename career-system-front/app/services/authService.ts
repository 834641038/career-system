//认证服务
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

interface User {
  id: string
  email: string
  name: string
  studentId?: string
}

interface AuthResponse {
  success: boolean
  message?: string
  user?: User
  token?: string
  data?: any
  error?: string
}

class AuthService {
  private baseUrl = '/api/auth'

  private getHeaders(requireAuth: boolean = false) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (requireAuth) {
      const token = localStorage.getItem('token')
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const payload = {
        username: credentials.email, // 后端API期望username字段
        password: credentials.password
      }

      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || data.message || '登录失败')
      }

      // 存储token
      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      // 转换用户数据格式以适配前端
      const user = data.user ? {
        id: data.user.user_id,
        email: data.user.username, // 后端返回username作为邮箱
        name: data.user.username,
        studentId: data.user.student_id
      } : undefined

      return {
        success: true,
        message: '登录成功',
        user,
        token: data.token
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || '网络连接错误' 
      }
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const payload = {
        username: userData.name, // 姓名作为登录用户名
        password: userData.password,
        email: userData.email,
        student_id: userData.studentId
      }

      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || data.message || '注册失败')
      }

      return { 
        success: true, 
        message: data.message || '注册成功' 
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || '注册失败' 
      }
    }
  }

  async logout(): Promise<void> {
    try {
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'GET',
        headers: this.getHeaders(true)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || data.message || '获取用户信息失败')
      }

      // 转换用户数据格式
      const user = data.data ? {
        id: data.data.user_id,
        email: data.data.username,
        name: data.data.username,
        studentId: data.data.student_id
      } : undefined

      return { 
        success: true, 
        user 
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || '获取用户信息失败' 
      }
    }
  }

  async socialLogin(provider: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/social/${provider}`, {
        method: 'POST',
        headers: this.getHeaders(false)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || `${provider}登录失败`)

      if (data.token) localStorage.setItem('token', data.token)

      const user = data.user ? {
        id: data.user.user_id,
        email: data.user.username,
        name: data.user.username,
        studentId: data.user.student_id
      } : undefined

      return { success: true, message: data.message || '登录成功', user, token: data.token }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  async sendVerificationCode(email: string, action: string): Promise<{success: boolean, message?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/verification-code`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify({ email, action })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || '发送验证码失败')
      return { success: true, message: data.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  async forgotPassword(email: string): Promise<{success: boolean, message?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/forgot-password`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || '请求失败')
      return { success: true, message: data.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{success: boolean, message?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/reset-password`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || '重置失败')
      return { success: true, message: data.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  // 检查是否已认证
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  }
}

export const authService = new AuthService()