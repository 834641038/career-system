// 简历数据类型定义
export interface ResumeBasicInfo {
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  birthday: string;
  location: string;
  avatar?: string;
}

export interface JobIntention {
  position: string;
  industry: string;
  salaryExpectation: string;
  workLocation: string;
  employmentType: 'full-time' | 'part-time' | 'internship' | 'freelance';
}

export interface EducationExperience {
  id: string;
  school: string;
  major: string;
  degree: 'bachelor' | 'master' | 'doctor' | 'associate';
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  achievements: string[];
}

export interface ProjectExperience {
  id: string;
  projectName: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  technologies: string[];
  link?: string;
}

export interface SkillCertificate {
  id: string;
  name: string;
  level: 'basic' | 'proficient' | 'expert';
  certificate?: string;
  score?: string;
}

export interface SelfEvaluation {
  content: string;
}

// 完整简历数据结构
export interface ResumeData {
  basicInfo: ResumeBasicInfo;
  jobIntention: JobIntention;
  educationExperiences: EducationExperience[];
  workExperiences: WorkExperience[];
  projectExperiences: ProjectExperience[];
  skills: SkillCertificate[];
  certificates: SkillCertificate[];
  selfEvaluation: SelfEvaluation;
  updatedAt: string;
}

// localStorage键名常量
export const RESUME_STORAGE_KEY = 'career_resume_data';