// 测评服务：把霍兰德 / 价值观 / 技能测评结果提交到后端并读取历史
class AssessmentService {
  private baseUrl = '/api/assessment'

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  private async post(path: string, body: any): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || data.message || '保存失败' }
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || '网络异常，结果未保存' }
    }
  }

  /** 保存霍兰德测评六维分数 */
  async saveHolland(scores: Record<string, number>) {
    return this.post('/holland', { scores })
  }

  /** 保存职业价值观六维分数（键为中文维度名） */
  async saveValues(scores: Record<string, number>) {
    return this.post('/values', { scores })
  }

  /** 保存技能维度测评分数 */
  async saveSkills(major: string, scores: Record<string, number>) {
    return this.post('/skills', { major, scores })
  }

  /** 读取三类测评历史 */
  async getHistory(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/history`, { headers: this.getHeaders() })
      const data = await res.json()
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || '获取测评记录失败' }
      }
      return { success: true, data: data.data }
    } catch (error: any) {
      return { success: false, error: error.message || '网络异常' }
    }
  }
}

export const assessmentService = new AssessmentService()
