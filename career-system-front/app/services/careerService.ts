// 生涯规划服务 - 整合职业路径推荐
interface CareerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface CareerPath {
  path_id: string;
  path_name: string;
  fit_score: number;
  path_details: {
    description: string;
    holland_codes: string[];
    average_salary: string;
    growth_potential: string;
    typical_companies: string[];
    required_education: string;
  };
  personalized_plan: {
    immediate_steps: string[];
    short_term_goals: string[];
    long_term_vision: string;
    timeline: string;
  };
  steps: CareerStep[];
}

interface CareerStep {
  step_id: string;
  title: string;
  duration: string;
  required_skills: string[];
  typical_companies: string[];
  salary_range: string;
  description: string;
}

interface CareerAssessment {
  holland_type: string;
  dominant_traits: string[];
  suitable_industries: string[];
  development_suggestions: string[];
}

class CareerService {
  private baseUrl = '/api';
  private recommendationService = recommendationService;

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

  // 获取职业路径推荐
  async getCareerPathRecommendations(
    topN: number = 3
  ): Promise<CareerResponse<any[]>> {
    try {
      const response = await this.recommendationService.getCareerPathRecommendations(
        undefined,
        topN
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data as any
        };
      } else {
        throw new Error(response.error || '获取职业路径推荐失败');
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网络连接错误'
      };
    }
  }

  // 获取职业评估报告
  async getCareerAssessment(): Promise<CareerResponse<CareerAssessment>> {
    try {
      // 这里可以整合霍兰德测评、技能评估等结果
      // 暂时返回mock数据
      const mockAssessment: CareerAssessment = {
        holland_type: 'IRC',
        dominant_traits: ['分析能力强', '喜欢研究问题', '注重细节'],
        suitable_industries: ['互联网科技', '金融科技', '咨询行业'],
        development_suggestions: [
          '加强沟通表达能力',
          '参与团队项目积累经验',
          '关注行业前沿技术发展'
        ]
      };

      return {
        success: true,
        data: mockAssessment
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '获取职业评估失败'
      };
    }
  }

  // 保存职业规划
  async saveCareerPlan(planData: any): Promise<CareerResponse<any>> {
    try {
      // 这里可以连接到后端的规划保存接口
      const response = await fetch(`${this.baseUrl}/career-plans`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(planData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '保存职业规划失败');
      }

      return {
        success: true,
        data: data.data,
        message: '职业规划保存成功'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网络连接错误'
      };
    }
  }

  // 获取保存的职业规划
  async getSavedCareerPlans(): Promise<CareerResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/career-plans`, {
        method: 'GET',
        headers: this.getHeaders(true)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取职业规划失败');
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

// 注意：这里需要导入recommendationService
import { recommendationService } from './recommendationService';
export const careerService = new CareerService();