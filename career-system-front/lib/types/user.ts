import { ResumeData } from './resume'
// 用户相关的TypeScript类型定义
export interface UserProfile {
  auth: AuthInfo;
  personalInfo: PersonalInfo;
  academicBackground: AcademicBackground;
  skillAssessment: SkillAssessment;
  careerAssessment: CareerAssessment;
  resume: ResumeData;
  learningDevelopment: LearningDevelopment;
  activityStats: ActivityStats;
  achievements: Achievement[];
  recentActivities: Activity[];
}

export interface AuthInfo {
  id: string;
  email: string;
  name: string;
  studentId: string;
  major: string;
  university: string;
  enrollmentYear: string;
  graduationYear: string;
}

export interface PersonalInfo {
  name: string;
  englishName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  birthday: string;
  location: string;
  hometown: string;
  avatar: string;
  bio: string;
  joinDate: string;
  lastLogin: string;
  accountStatus: 'active' | 'inactive';
}

export interface AcademicBackground {
  university: string;
  college: string;
  major: string;
  degree: 'bachelor' | 'master' | 'doctor' | 'associate';
  gpa: string;
  ranking: string;
  enrollmentYear: string;
  expectedGraduation: string;
  academicAchievements: string[];
}

export interface SkillLevel {
  name: string;
  level: 'basic' | 'proficient' | 'expert';
  proficiency: number;
}

export interface TechnicalSkills {
  programmingLanguages: SkillLevel[];
  frontend: SkillLevel[];
  backend: SkillLevel[];
  tools: SkillLevel[];
}

export interface SoftSkills {
  communication: number;
  teamwork: number;
  problemSolving: number;
  leadership: number;
  adaptability: number;
  timeManagement: number;
}

export interface SkillAssessment {
  technicalSkills: TechnicalSkills;
  softSkills: SoftSkills;
}

export interface HollandScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface HollandCode {
  primary: string;
  scores: HollandScores;
  recommendedCareers: string[];
}

export interface ValueRanking {
  name: string;
  score: number;
  rank: number;
}

export interface ValuesAssessment {
  topValues: ValueRanking[];
}

export interface CareerAssessment {
  hollandCode: HollandCode;
  valuesAssessment: ValuesAssessment;
  interestAreas: string[];
}

// 学习发展相关类型
export interface CurrentCourse {
  id: string;
  name: string;
  platform: string;
  progress: number;
  startDate: string;
  endDate: string;
}

export interface CompletedCourse {
  id: string;
  name: string;
  platform: string;
  completionDate: string;
  certificate: boolean;
}

export interface SkillGoal {
  skill: string;
  targetLevel: 'basic' | 'proficient' | 'expert';
  currentLevel: 'basic' | 'proficient' | 'expert';
  deadline: string;
}

export interface LearningDevelopment {
  currentCourses: CurrentCourse[];
  completedCourses: CompletedCourse[];
  skillGoals: SkillGoal[];
}

export interface ActivityStats {
  assessmentsCompleted: number;
  plansCreated: number;
  daysActive: number;
  badgesEarned: number;
  coursesCompleted: number;
  projectsContributed: number;
  lastActivity: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  date: string;
  type: string;
}

export interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
}

// 完整用户数据接口
export interface CompleteUserData {
  auth: AuthInfo;
  personalInfo: PersonalInfo;
  academicBackground: AcademicBackground;
  skillAssessment: SkillAssessment;
  careerAssessment: CareerAssessment;
  resume: ResumeData;
  learningDevelopment: LearningDevelopment;
  activityStats: ActivityStats;
  achievements: Achievement[];
  recentActivities: Activity[];
}

// localStorage键名常量
export const USER_STORAGE_KEYS = {
  AUTH: 'user',
  TOKEN: 'token',
  RESUME: 'career_resume_data',
  COMPLETE_PROFILE: 'complete_user_profile'
};