// 基础任务接口
export interface BaseTask {
  id: string | number;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// 日任务接口
export interface DailyTask extends BaseTask {
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  startTime?: string;
  endTime?: string;
  estimatedDuration?: number; // 分钟
  actualDuration?: number;
  isRecurring?: boolean;
  recurringRule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
}

// 周任务接口
export interface WeeklyTask extends BaseTask {
  weekId: string; // 格式: 2025-W06
  targetDate?: string; // 目标完成日期
  isFlexible: boolean;
  dependencies?: (string | number)[];
}

// 日计划接口
export interface DailyPlan {
  date: string;
  tasks: DailyTask[];
  totalTasks: number;
  completedTasks: number;
  progress: number;
  focusArea?: string;
  notes?: string;
}

// 周计划接口
export interface WeeklyPlan {
  id: string;
  year: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  weeklyGoal: string;
  nextWeekPreview?: string;
  tasks: WeeklyTask[];
  progress: number;
  completedTasks: number;
  totalTasks: number;
  focusHours: number;
  totalHours: number;
}

// 计划统计接口
export interface PlanStats {
  daily: {
    completed: number;
    total: number;
    progress: number;
  };
  weekly: {
    completed: number;
    total: number;
    progress: number;
  };
  streakDays: number;
  totalStudyHours: number;
  weeklyStudyHours: number;
}

// API响应格式
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}