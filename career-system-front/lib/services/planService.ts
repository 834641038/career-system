import { DailyPlan, WeeklyPlan, PlanStats, ApiResponse } from '@/lib/types/plan';

class PlanService {
  private baseUrl = 'http://localhost:5000/api/plan'

  private getHeaders(requireAuth: boolean = true) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (requireAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  async getRecentDailyPlans(days: number = 3): Promise<ApiResponse<DailyPlan[]>> {
    try {
      const res = await fetch(`${this.baseUrl}/daily?days=${days}`, { headers: this.getHeaders(true) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '获取日计划失败')
      return { success: true, data: data.data, timestamp: new Date().toISOString() }
    } catch (error: any) {
      return { success: false, error: error.message || '获取日计划失败', timestamp: new Date().toISOString() }
    }
  }

  async getWeeklyPlan(weekId?: string): Promise<ApiResponse<WeeklyPlan>> {
    try {
      const url = weekId ? `${this.baseUrl}/weekly?weekId=${encodeURIComponent(weekId)}` : `${this.baseUrl}/weekly`
      const res = await fetch(url, { headers: this.getHeaders(true) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '获取周计划失败')
      return { success: true, data: data.data, timestamp: new Date().toISOString() }
    } catch (error: any) {
      return { success: false, error: error.message || '获取周计划失败', timestamp: new Date().toISOString() }
    }
  }

  async getPlanStats(): Promise<ApiResponse<PlanStats>> {
    try {
      const res = await fetch(`${this.baseUrl}/stats`, { headers: this.getHeaders(true) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '获取计划统计失败')
      return { success: true, data: data.data, timestamp: new Date().toISOString() }
    } catch (error: any) {
      return { success: false, error: error.message || '获取计划统计失败', timestamp: new Date().toISOString() }
    }
  }

  async createTask(taskData: any): Promise<ApiResponse<any>> {
    try {
      const res = await fetch(`${this.baseUrl}/tasks`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(taskData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '创建任务失败')
      return { success: true, data: data.data, timestamp: new Date().toISOString() }
    } catch (error: any) {
      return { success: false, error: error.message || '创建任务失败', timestamp: new Date().toISOString() }
    }
  }

  async updateTaskStatus(taskId: string | number, completed: boolean): Promise<ApiResponse<any>> {
    try {
      const res = await fetch(`${this.baseUrl}/tasks/${taskId}/status`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ completed })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '更新任务失败')
      return { success: true, data: data.data, timestamp: new Date().toISOString() }
    } catch (error: any) {
      return { success: false, error: error.message || '更新任务失败', timestamp: new Date().toISOString() }
    }
  }

  async deleteTask(taskId: string | number): Promise<ApiResponse<any>> {
    try {
      const res = await fetch(`${this.baseUrl}/tasks/${taskId}`, { method: 'DELETE', headers: this.getHeaders(true) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '删除任务失败')
      return { success: true, data: data, timestamp: new Date().toISOString() }
    } catch (error: any) {
      return { success: false, error: error.message || '删除任务失败', timestamp: new Date().toISOString() }
    }
  }
}

export const planService = new PlanService();