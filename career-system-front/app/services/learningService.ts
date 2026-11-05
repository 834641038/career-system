// 学习资源服务 - 连接课程推荐功能
interface LearningResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
  price?: string;
  rating?: number;
}

interface SkillGap {
  skill: string;
  current_level: number;
  required_level: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  recommended_courses: string[];
}

interface LearningPath {
  path_id: string;
  title: string;
  description: string;
  courses: Course[];
  estimated_duration: string;
  difficulty: string;
  skills_to_gain: string[];
}

class LearningService {
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

  // 获取课程推荐
  async getRecommendedCourses(
    targetJobs: string[] = [],
    topN: number = 10
  ): Promise<LearningResponse<any>> {
    try {
      const response = await this.recommendationService.getCourseRecommendations(
        undefined,
        targetJobs,
        topN
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            skill_gaps: response.data.skill_gaps as any,
            courses: response.data.course_recommendations as any
          }
        };
      } else {
        throw new Error(response.error || '获取课程推荐失败');
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网络连接错误'
      };
    }
  }

  // 获取特定技能的学习路径
  async getLearningPath(skill: string): Promise<LearningResponse<LearningPath>> {
    try {
      // 这里可以调用专门的学习路径API
      // 暂时返回mock数据
      const mockPath: LearningPath = {
        path_id: `path_${skill}`,
        title: `${skill} 学习路径`,
        description: `从入门到精通的完整${skill}学习路线`,
        courses: [],
        estimated_duration: '3-6个月',
        difficulty: '中级',
        skills_to_gain: [skill, `${skill}进阶`, `${skill}项目实践`]
      };

      return {
        success: true,
        data: mockPath
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '获取学习路径失败'
      };
    }
  }

  // 搜索课程
  async searchCourses(
    keyword: string,
    filters?: {
      category?: string;
      difficulty?: string;
      provider?: string;
      min_rating?: number;
    }
  ): Promise<LearningResponse<Course[]>> {
    try {
      // 这里可以连接到真实的课程搜索API
      // 暂时返回mock数据
      const mockCourses: Course[] = [
        {
          course_id: 'course_1',
          title: `${keyword}入门教程`,
          provider: '知名教育平台',
          duration: '12小时',
          difficulty: '初级',
          skills_covered: [keyword, '基础概念', '实践应用'],
          relevance_score: 95,
          description: `全面介绍${keyword}的基础知识和核心概念`,
          price: '免费',
          rating: 4.8
        }
      ];

      return {
        success: true,
        data: mockCourses
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '搜索课程失败'
      };
    }
  }

  // 获取技能缺口分析
  async getSkillGapAnalysis(
    targetJobs: string[] = []
  ): Promise<LearningResponse<any[]>> {
    try {
      const response = await this.recommendationService.getCourseRecommendations(
        undefined,
        targetJobs,
        0 // 只获取技能缺口，不获取课程
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.skill_gaps as any
        };
      } else {
        throw new Error(response.error || '获取技能分析失败');
      }
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
export const learningService = new LearningService();