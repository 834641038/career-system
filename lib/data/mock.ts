import { DailyTask, WeeklyTask, DailyPlan, WeeklyPlan, PlanStats } from '@/lib/types/plan';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek'; 
dayjs.locale('zh-cn');
dayjs.extend(isoWeek);

// 转换现有仪表盘任务为DailyTask格式
export const mockDailyTasks: DailyTask[] = [
  {
    id: 1,
    title: '完成React Hooks学习',
    date: dayjs().format('YYYY-MM-DD'),
    time: '14:00',
    priority: 'high',
    completed: true,
    category: '学习',
    estimatedDuration: 120,
    actualDuration: 135,
    createdAt: dayjs().subtract(1, 'day').format(),
    updatedAt: dayjs().format()
  },
  {
    id: 2,
    title: '英语六级听力练习',
    date: dayjs().format('YYYY-MM-DD'),
    time: '16:00',
    priority: 'medium',
    completed: true,
    category: '语言',
    estimatedDuration: 60,
    actualDuration: 60,
    createdAt: dayjs().subtract(1, 'day').format(),
    updatedAt: dayjs().format()
  },
  {
    id: 3,
    title: '职业兴趣测评',
    date: dayjs().format('YYYY-MM-DD'),
    time: '18:00',
    priority: 'high',
    completed: false,
    category: '测评',
    estimatedDuration: 45,
    createdAt: dayjs().subtract(1, 'day').format(),
    updatedAt: dayjs().subtract(1, 'day').format()
  },
  {
    id: 4,
    title: '更新个人简历',
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    time: '10:00',
    priority: 'high',
    completed: false,
    category: '求职',
    estimatedDuration: 90,
    createdAt: dayjs().format(),
    updatedAt: dayjs().format()
  },
  {
    id: 5,
    title: '算法题练习（动态规划）',
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    time: '14:00',
    priority: 'medium',
    completed: false,
    category: '算法',
    estimatedDuration: 120,
    createdAt: dayjs().format(),
    updatedAt: dayjs().format()
  },
  {
    id: 6,
    title: '前端项目开发',
    date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    priority: 'high',
    completed: false,
    category: '项目',
    estimatedDuration: 180,
    createdAt: dayjs().format(),
    updatedAt: dayjs().format()
  }
];

// 周计划模拟数据
const getWeekId = () => {
  const today = dayjs();
  const year = today.year();
  const weekNumber = today.isoWeek();
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

export const mockWeeklyPlans: WeeklyPlan[] = [
  {
    id: getWeekId(),
    year: 2025,
    weekNumber: 6,
    startDate: '2025-02-03',
    endDate: '2025-02-09',
    weeklyGoal: '掌握React高级特性，完成算法强化训练',
    nextWeekPreview: '开始学习后端基础知识，准备简历更新',
    tasks: [
      {
        id: 101,
        title: 'React源码学习',
        description: '学习React核心源码，理解虚拟DOM和Diff算法',
        priority: 'high',
        completed: true,
        category: '学习',
        weekId: getWeekId(),
        isFlexible: false,
        createdAt: '2025-01-30T09:00:00Z',
        updatedAt: '2025-02-06T12:00:00Z'
      },
      {
        id: 102,
        title: '算法题集（动态规划）',
        description: '完成10道动态规划相关算法题',
        priority: 'high',
        completed: false,
        category: '算法',
        weekId: getWeekId(),
        isFlexible: true,
        createdAt: '2025-01-30T10:00:00Z',
        updatedAt: '2025-02-06T10:00:00Z'
      },
      {
        id: 103,
        title: '英语学习计划',
        description: '每天坚持英语学习1小时',
        priority: 'medium',
        completed: false,
        category: '语言',
        weekId: getWeekId(),
        isFlexible: true,
        createdAt: '2025-01-30T11:00:00Z',
        updatedAt: '2025-02-06T11:00:00Z'
      }
    ],
    progress: 33,
    completedTasks: 1,
    totalTasks: 3,
    focusHours: 6,
    totalHours: 16
  }
];

// 计划统计
export const mockPlanStats: PlanStats = {
  daily: {
    completed: 2,
    total: 3,
    progress: 66
  },
  weekly: {
    completed: 4,
    total: 10,
    progress: 40
  },
  streakDays: 7,
  totalStudyHours: 36,
  weeklyStudyHours: 41.7
};

// 模拟API函数
export const planApi = {
  // 获取最近N天的计划
  getRecentDailyPlans: async (days: number = 3): Promise<DailyPlan[]> => {
    const today = dayjs();
    const plans: DailyPlan[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = today.add(i, 'day').format('YYYY-MM-DD');
      const dateTasks = mockDailyTasks.filter(task => task.date === date);
      
      const totalTasks = dateTasks.length;
      const completedTasks = dateTasks.filter(task => task.completed).length;
      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
      
      plans.push({
        date,
        tasks: dateTasks,
        totalTasks,
        completedTasks,
        progress
      });
    }
    
    return new Promise(resolve => {
      setTimeout(() => resolve(plans), 300);
    });
  },

  // 获取周计划
  getWeeklyPlan: async (weekId?: string): Promise<WeeklyPlan> => {
    const targetWeekId = weekId || getWeekId();
    const plan = mockWeeklyPlans.find(p => p.id === targetWeekId);
    
    if (!plan) {
      // 返回一个默认的周计划
      return {
        id: targetWeekId,
        year: dayjs().year(),
        weekNumber: dayjs().isoWeek(),
        startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('week').format('YYYY-MM-DD'),
        weeklyGoal: '本周暂无明确目标',
        tasks: [],
        progress: 0,
        completedTasks: 0,
        totalTasks: 0,
        focusHours: 0,
        totalHours: 0
      };
    }
    
    return new Promise(resolve => {
      setTimeout(() => resolve(plan), 300);
    });
  },

  // 获取计划统计
  getPlanStats: async (): Promise<PlanStats> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(mockPlanStats), 200);
    });
  },

  // 创建任务
  createTask: async (taskData: any): Promise<any> => {
    console.log('创建任务:', taskData);
    
    const newTask: DailyTask = {
      id: Date.now(),
      title: taskData.title,
      description: taskData.description,
      date: taskData.date || dayjs().format('YYYY-MM-DD'),
      time: taskData.time,
      priority: taskData.priority || 'medium',
      completed: false,
      category: taskData.category || '其他',
      estimatedDuration: taskData.estimatedDuration,
      createdAt: dayjs().format(),
      updatedAt: dayjs().format()
    };
    
    // 添加到模拟数据
    mockDailyTasks.push(newTask);
    
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true, data: newTask }), 300);
    });
  },

  // 更新任务状态
  updateTaskStatus: async (taskId: string | number, completed: boolean): Promise<any> => {
    console.log('更新任务状态:', taskId, completed);
    
    // 更新日任务
    const dailyTask = mockDailyTasks.find((task: DailyTask) => task.id === taskId);
    if (dailyTask) {
      dailyTask.completed = completed;
      dailyTask.updatedAt = dayjs().format();
    }
    
    // 更新周任务
    mockWeeklyPlans.forEach((weekPlan: WeeklyPlan) => {
      const weeklyTask = weekPlan.tasks.find((task: WeeklyTask) => task.id === taskId);
      if (weeklyTask) {
        weeklyTask.completed = completed;
        weeklyTask.updatedAt = dayjs().format();
        
        // 更新周计划进度
        const completedTasks = weekPlan.tasks.filter((t: WeeklyTask) => t.completed).length;
        weekPlan.completedTasks = completedTasks;
        weekPlan.progress = Math.round((completedTasks / weekPlan.totalTasks) * 100);
      }
    });
    
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true }), 200);
    });
  },

  // 删除任务
  deleteTask: async (taskId: string | number): Promise<any> => {
    console.log('删除任务:', taskId);
    
    // 从日任务中删除
    const dailyIndex = mockDailyTasks.findIndex(task => task.id === taskId);
    if (dailyIndex > -1) {
      mockDailyTasks.splice(dailyIndex, 1);
    }
    
    // 从周任务中删除
    mockWeeklyPlans.forEach((weekPlan: WeeklyPlan) => {
      const weeklyIndex = weekPlan.tasks.findIndex((task: WeeklyTask) => task.id === taskId);
      if (weeklyIndex > -1) {
        weekPlan.tasks.splice(weeklyIndex, 1);
        weekPlan.totalTasks = weekPlan.tasks.length;
        weekPlan.progress = Math.round((weekPlan.completedTasks / weekPlan.totalTasks) * 100);
      }
    });
    
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true }), 200);
    });
  }
};