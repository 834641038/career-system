// 推荐服务 - 连接后端智能推荐功能
interface RecommendationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface InternshipFilters {
  min_salary?: number;
  max_salary?: number;
  location?: string;
  job_type?: string;
  min_match_score?: number;
}

interface Job {
  job_id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  match_score: number;
  required_skills: Record<string, any>;
  description: string;
}

interface Course {
  course_id: string;
  title: string;
  provider: string;
  duration: string;
  difficulty: string;
  skills_covered: string[];
  relevance_score: number;
  description: string;
}

interface SkillGap {
  skill: string;
  current_level: number;
  required_level: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}

interface CareerPath {
  path_id: string;
  path_name: string;
  fit_score: number;
  steps: CareerStep[];
  average_salary: string;
  growth_potential: string;
}

interface CareerStep {
  step_id: string;
  title: string;
  duration: string;
  required_skills: string[];
  typical_companies: string[];
}

class RecommendationService {
  private baseUrl = '/api';

  private getHeaders(requireAuth: boolean = true) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (requireAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // 实习岗位推荐
  async getInternshipRecommendations(
    studentId?: string,
    filters?: InternshipFilters,
    topN: number = 10
  ): Promise<RecommendationResponse<Job[]>> {
    try {
      const payload = {
        student_id: studentId,
        filters: filters || {},
        top_n: topN,
        min_score: filters?.min_match_score || 0
      };

      const response = await fetch(`${this.baseUrl}/recommendations/internships`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取实习推荐失败');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网络连接错误'
      };
    }
  }

  // 课程推荐
  async getCourseRecommendations(
    studentId?: string,
    targetJobs: string[] = [],
    topN: number = 5
  ): Promise<RecommendationResponse<{ 
    skill_gaps: SkillGap[]; 
    course_recommendations: Course[] 
  }>> {
    try {
      const payload = {
        student_id: studentId,
        target_jobs: targetJobs,
        top_n: topN
      };

      const response = await fetch(`${this.baseUrl}/recommendations/courses`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取课程推荐失败');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网络连接错误'
      };
    }
  }

  // 职业路径推荐
  async getCareerPathRecommendations(
    studentId?: string,
    topN: number = 3
  ): Promise<RecommendationResponse<CareerPath[]>> {
    try {
      const payload = {
        student_id: studentId,
        top_n: topN
      };

      const response = await fetch(`${this.baseUrl}/recommendations/career-paths`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取职业路径推荐失败');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网络连接错误'
      };
    }
  }

  // 获取学生档案（用于推荐系统）
  async getStudentProfile(studentId: string): Promise<RecommendationResponse<any>> {
    try {
      // 这里可能需要调用数据库接口或其他服务来获取学生档案
      // 暂时返回mock数据，实际应该连接到后端
      const mockProfile = {
        student_id: studentId,
        name: '张三',
        major: '计算机科学与技术',
        holland_code: 'IRC', // 霍兰德代码
        skills: {
          technical: {
            '编程基础': { level: 80, experience: '2年' },
            '数据结构': { level: 75, experience: '1年' }
          },
          soft: {
            '沟通能力': { level: 70 },
            '团队协作': { level: 75 }
          }
        }
      };

      return {
        success: true,
        data: mockProfile
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '获取学生档案失败'
      };
    }
  }
}

export const recommendationService = new RecommendationService();

// ========== AI 对话服务 ==========

interface AIChatResponse {
  success: boolean;
  data?: {
    reply: string;
    model: string;
    usage?: {
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
    };
  };
  error?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AICareerAdviceResponse {
  success: boolean;
  data?: {
    reply: string;
    student_profile: {
      major: string;
      grade: string;
      skills_count: number;
    };
  };
  error?: string;
}

class AIService {
  private baseUrl = '/api';

  private getHeaders(requireAuth: boolean = true) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (requireAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // 通用 AI 对话
  async chat(message: string, context: ChatMessage[] = []): Promise<AIChatResponse> {
    try {
      const payload = {
        message,
        context
      };

      const response = await fetch(`${this.baseUrl}/ai/chat`, {
        method: 'POST',
        headers: this.getHeaders(false), // 不需要认证
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'AI 对话失败');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网络连接错误'
      };
    }
  }

  // 个性化职业建议（需要登录）
  async getCareerAdvice(question: string, studentId?: string): Promise<AICareerAdviceResponse> {
    try {
      const payload = {
        question,
        student_id: studentId
      };

      const response = await fetch(`${this.baseUrl}/ai/career-advice`, {
        method: 'POST',
        headers: this.getHeaders(true), // 需要认证
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取职业建议失败');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网络连接错误'
      };
    }
  }
}

export const aiService = new AIService();