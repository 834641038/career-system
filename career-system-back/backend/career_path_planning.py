#职业路径规划模块
from sample_data import CAREER_PATHS_DATABASE, career_paths_database


class CareerPathPlanner:
    """职业发展路径规划系统"""
    
    def __init__(self, career_paths_db=None):
        self.career_paths_db = career_paths_db or CAREER_PATHS_DATABASE or career_paths_database
    
    def recommend_career_paths(self, student, top_n=5):
        """
        为学生推荐职业发展路径
        
        Args:
            student: 学生信息字典
            top_n: 返回的推荐数量，默认为 5 条
            
        Returns:
            list: 推荐的职业路径及详细规划，按匹配度降序排列
        """
        # 初始化一个空列表，用于存储各职业路径的评分信息
        path_scores = []
        
        # 遍历职业路径数据库中的每一条职业路径
        for path in self.career_paths_db:
            # 计算学生与当前职业路径的匹配度
            score = self._calculate_path_fit(student, path)
            
            # 将当前职业路径的相关信息添加到评分列表中
            path_scores.append({
                'path_id': path['path_id'],        # 职业路径 ID
                'path_name': path['path_name'],    # 职业路径名称
                'fit_score': score,                # 匹配度分数
                'path_details': path,              # 职业路径详细信息
                'personalized_plan': self._generate_personalized_plan(student, path)  # 个性化发展计划
            })
        
        # 按适合度排序（从高到低）
        path_scores.sort(key=lambda x: x['fit_score'], reverse=True)
        
        return path_scores[:top_n]
    
    def _calculate_path_fit(self, student, path):
        """计算路径适配度"""
        score = 0
        
        # 1. 霍兰德类型匹配（40%权重）
        student_code = student.get('holland_code', '')
        if isinstance(student_code, str):
            student_codes = set(list(student_code))
        else:
            student_codes = set(student_code)
        
        path_codes = set(path.get('holland_codes', []))
        if len(path_codes) > 0:
            holland_overlap = len(student_codes & path_codes) / len(path_codes)
        else:
            holland_overlap = 0.5  # 默认值
        
        score += holland_overlap * 100 * 0.4
        
        # 2. 当前技能基础（30%权重）
        # 评估学生当前技能与路径初期要求的匹配度
        stages = path.get('stages', [])
        if stages:
            first_stage = stages[0]
            current_skill_fit = self._assess_current_readiness(student, first_stage)
            score += current_skill_fit * 0.3
        else:
            score += 50 * 0.3  # 默认值
        
        # 3. 职业偏好匹配（20%权重）
        if stages:
            career_options = stages[-1].get('career_options', [])
            preference_match = 0
            # 这里可以与学生的职业偏好进行匹配
            # 简化处理：假设有一定匹配度
            preferred_industries = student.get('career_preferences', {}).get('preferred_industries', [])
            if preferred_industries:
                preference_match = 70  # 默认值
            else:
                preference_match = 60
        else:
            preference_match = 70  # 默认值
        
        score += preference_match * 0.2
        
        # 4. 成功案例相似度（10%权重）
        success_cases = path.get('success_cases', [])
        if len(success_cases) > 0:
            similarity = self._calculate_case_similarity(student, success_cases)
            score += similarity * 0.1
        else:
            score += 50 * 0.1  # 默认值
        
        return score
    
    def _assess_current_readiness(self, student, first_stage):
        """评估学生当前对路径的准备度"""
        milestones = first_stage.get('milestones', {})
        
        if not milestones:
            return 70  # 默认中等准备度
        
        readiness = 0
        total_criteria = 0
        
        # 检查技能达标情况
        if '技能达标' in milestones:
            total_criteria += 1
            skill_requirements = milestones['技能达标']
            
            all_student_skills = {}
            for category in student.get('skills', {}).values():
                if isinstance(category, dict):
                    all_student_skills.update(category)
            
            met = 0
            for skill_req in skill_requirements:
                # 解析形如 "Python>=4"
                if '>=' in skill_req:
                    skill_name = skill_req.split('>=')[0]
                    required_level = int(skill_req.split('>=')[1])
                else:
                    skill_name = skill_req
                    required_level = 1
                
                current_level = 0
                if skill_name in all_student_skills:
                    if isinstance(all_student_skills[skill_name], dict):
                        current_level = all_student_skills[skill_name].get('level', 0)
                    else:
                        current_level = all_student_skills[skill_name]
                
                if current_level >= required_level:
                    met += 1
            
            if len(skill_requirements) > 0:
                readiness += (met / len(skill_requirements)) * 100
        
        # 检查项目经验
        if '项目' in milestones:
            total_criteria += 1
            required_projects = milestones['项目']
            student_projects = len(student.get('academic_records', {}).get('projects', []))
            
            if student_projects >= required_projects:
                readiness += 100
            else:
                readiness += (student_projects / required_projects) * 60 if required_projects > 0 else 0
        
        if total_criteria > 0:
            return readiness / total_criteria
        return 70
    
    def _calculate_case_similarity(self, student, success_cases):
        """计算与成功案例的相似度"""
        # 简化：基于GPA和学校等级的相似度
        avg_satisfaction = sum(case.get('career_satisfaction', 7) for case in success_cases) / len(success_cases)
        
        # 满意度越高，该路径越可靠
        return avg_satisfaction * 10  # 转换为百分制
    
    def _generate_personalized_plan(self, student, path):
        """
        生成个性化的职业发展计划
        """
        current_grade = student.get('basic_info', {}).get('grade', 2)
        
        personalized_stages = []
        
        for stage in path.get('stages', []):
            # 根据学生当前状态调整时间线
            adjusted_stage = stage.copy()
            
            # 分析当前阶段的完成度
            completion = self._assess_stage_completion(student, stage)
            
            # 生成具体行动计划
            action_plan = self._generate_action_plan(student, stage, completion)
            
            adjusted_stage['current_completion'] = completion
            adjusted_stage['action_plan'] = action_plan
            
            personalized_stages.append(adjusted_stage)
        
        stages = path.get('stages', [])
        return {
            'stages': personalized_stages,
            'overall_readiness': self._assess_current_readiness(student, stages[0]) if stages else 70,
            'estimated_success_rate': self._estimate_success_rate(student, path)
        }
    
    def _assess_stage_completion(self, student, stage):
        """评估阶段完成度"""
        milestones = stage.get('milestones', {})
        
        if not milestones:
            return 0
        
        completion = 0
        total = 0
        
        # 评估各个里程碑
        for milestone_type, requirements in milestones.items():
            total += 1
            
            if milestone_type == '技能达标':
                skill_met = 0
                all_student_skills = {}
                for category in student.get('skills', {}).values():
                    if isinstance(category, dict):
                        all_student_skills.update(category)
                
                for req in requirements:
                    if '>=' in req:
                        skill_name = req.split('>=')[0]
                        required_level = int(req.split('>=')[1])
                    else:
                        skill_name = req
                        required_level = 1
                    
                    current_level = 0
                    if skill_name in all_student_skills:
                        if isinstance(all_student_skills[skill_name], dict):
                            current_level = all_student_skills[skill_name].get('level', 0)
                        else:
                            current_level = all_student_skills[skill_name]
                    
                    if current_level >= required_level:
                        skill_met += 1
                
                if len(requirements) > 0:
                    completion += (skill_met / len(requirements))
            
            elif milestone_type == '证书':
                # 检查学生已获得的证书
                # 简化处理，假设未获得
                completion += 0
            
            elif milestone_type == '项目':
                student_projects = len(student.get('academic_records', {}).get('projects', []))
                required = requirements
                if isinstance(required, int):
                    if student_projects >= required:
                        completion += 1
                    else:
                        completion += student_projects / required if required > 0 else 0
            
            elif milestone_type == '竞赛':
                student_competitions = len(student.get('academic_records', {}).get('competitions', []))
                # 简化处理
                completion += min(1.0, student_competitions / 2.0)
        
        if total > 0:
            return (completion / total) * 100
        return 0
    
    def _generate_action_plan(self, student, stage, current_completion):
        """生成具体行动计划"""
        actions = []
        
        courses = stage.get('courses', [])
        internships = stage.get('recommended_internships', [])
        
        # 基于完成度生成不同的建议
        if current_completion < 30:
            if courses:
                actions.append({
                    'priority': '高',
                    'action': f"立即开始学习相关课程（{courses[0] if isinstance(courses, list) else '指定课程'}）",
                    'deadline': '1个月内'
                })
            if internships:
                actions.append({
                    'priority': '高',
                    'action': f"寻找{internships[0]}相关的实习机会",
                    'deadline': '2个月内'
                })
        elif current_completion < 70:
            actions.append({
                'priority': '中',
                'action': "继续提升专业技能，准备相关认证考试",
                'deadline': '3个月内'
            })
            actions.append({
                'priority': '中',
                'action': "参与1-2个实战项目，积累经验",
                'deadline': '当前学期'
            })
        else:
            actions.append({
                'priority': '低',
                'action': "保持技能更新，关注行业动态",
                'deadline': '持续进行'
            })
            stage_name = stage.get('stage', '下一阶段')
            actions.append({
                'priority': '高',
                'action': f"准备进入下一阶段：{stage_name}",
                'deadline': '下学期'
            })
        
        return actions
    
    def _estimate_success_rate(self, student, path):
        """
        估算成功率
        基于历史数据和当前学生情况
        参数:
            student: 学生信息字典，包含基本信息等数据
            path: 职业路径字典，包含各个阶段的信息
        返回:
            int: 估算的成功率，范围在40-95之间
        """
        # 简化：基于GPA、技能匹配度等因素计算基础成功率
        base_rate = 60  # 基础成功率设为60
        
        # GPA加成计算：根据学生GPA成绩增加成功率
        gpa = student.get('basic_info', {}).get('gpa', 0)  # 获取学生GPA，默认为0
        if gpa >= 3.5:  # GPA大于等于3.5时增加15%
            base_rate += 15
        elif gpa >= 3.0:  # GPA大于等于3.0时增加10%
            base_rate += 10
        
        # 技能准备度加成计算：根据学生对第一阶段技能的准备度增加成功率
        stages = path.get('stages', [])  # 获取职业路径的各个阶段
        if stages:  # 如果存在阶段信息
            readiness = self._assess_current_readiness(student, stages[0])  # 评估学生对第一阶段技能的准备度
            base_rate += (readiness - 70) * 0.3  # 超过70分每分加0.3
        
        return min(95, max(40, base_rate))  # 限制在40-95之间


if __name__ == "__main__":
    # 测试代码
    from sample_data import SAMPLE_STUDENTS, CAREER_PATHS_DATABASE
    
    planner = CareerPathPlanner(CAREER_PATHS_DATABASE)
    if SAMPLE_STUDENTS:
        career_recommendations = planner.recommend_career_paths(SAMPLE_STUDENTS[0], top_n=3)
        
        for i, rec in enumerate(career_recommendations, 1):
            print(f"\n{'='*60}")
            print(f"推荐路径 {i}: {rec['path_name']}")
            print(f"适配度: {rec['fit_score']:.2f}分")
            print(f"当前准备度: {rec['personalized_plan']['overall_readiness']:.1f}%")
            print(f"预估成功率: {rec['personalized_plan']['estimated_success_rate']:.1f}%")
            print(f"\n发展阶段:")
            
            for stage in rec['personalized_plan']['stages']:
                print(f"\n  【{stage.get('stage', '未知阶段')}】")
                print(f"  完成度: {stage.get('current_completion', 0):.1f}%")
                print(f"  行动计划:")
                for action in stage.get('action_plan', []):
                    print(f"    • [{action.get('priority', '')}] {action.get('action', '')} (期限: {action.get('deadline', '')})")