"""
数据库接口模块

pip install pyodbc

"""

try:
    import pyodbc
    _HAS_PYODBC = True
except Exception:
    pyodbc = None
    _HAS_PYODBC = False
from sample_data import SAMPLE_STUDENTS, SAMPLE_JOBS, CAREER_PATHS_DATABASE, COURSE_CATALOG
import hashlib
import uuid
import json
from datetime import datetime


class DatabaseInterface:
    """
    数据库接口类
    
    提供对系统中各类数据的统一访问接口，包括学生信息、职位信息、职业路径和课程信息等。
    该类支持两种数据存储方式：SQL Server数据库和内存数据（作为数据库连接失败时的后备方案）。
    """
    
    def __init__(self, host='localhost', user='app_user', password='34rj>sh&2uio3(jk12e', database='career_system_prod'):
        # 2026-11-07 切换到数据库组交付的 career_system_prod（34 表 / 真实岗位课程数据）
        # 原 career_recommendation 保留未动，可随时回退
        """初始化数据库接口"""
        # 如果没有安装 pyodbc，则直接使用内存样本数据
        if not _HAS_PYODBC:
            print("pyodbc 未安装，使用内存样本数据")
            self._init_sample_data()
            self.use_sqlserver = False
            return

        try:
            # 尝试连接SQL Server数据库
            # 构建连接字符串
            conn_str = (
                f"DRIVER={{ODBC Driver 17 for SQL Server}};"  # ODBC驱动程序
                f"SERVER={host};"                             # 服务器地址
                f"DATABASE={database};"                       # 数据库名称
                f"UID={user};"                                # 用户名
                f"PWD={password}"                             # 密码
            )
            self.connection = pyodbc.connect(conn_str)  # 建立数据库连接
            self.cursor = self.connection.cursor()       # 创建游标对象
            self.use_sqlserver = True                    # 标记使用SQL Server数据库
            print("已连接到SQL Server数据库")
        except Exception as e:
            # 如果连接失败，打印错误信息并使用默认的内存数据
            print(f"无法连接到SQL Server数据库：{e}")  # 打印错误信息
            print("使用默认的内存数据")                   # 提示使用内存数据
            self._init_sample_data()                     # 初始化样本数据
            self.use_sqlserver = False                   # 标记使用内存数据
    
    def _init_sample_data(self):
        """初始化样本数据（当无法连接数据库时使用）"""
        # 将样本数据存储在字典中，以ID为键
        self.students = {student['student_id']: student for student in SAMPLE_STUDENTS}  # 学生数据字典
        self.jobs = {job['job_id']: job for job in SAMPLE_JOBS}                          # 职位数据字典
        self.career_paths = {path['path_id']: path for path in CAREER_PATHS_DATABASE}    # 职业路径数据字典
        self.courses = {course['course_id']: course for course in COURSE_CATALOG}        # 课程数据字典
        self.users = {}  # 用户数据字典
        self.companies = {}  # 公司数据字典
        self.skills = {}  # 技能字典表
        self.holland_test_results = {}  # 霍兰德测试结果
        self.career_values = {}  # 职业价值观
        self.skill_dimension_assessments = {}  # 技能维度测评
        self.experiences = {}  # 经历表
        self.day_plans = {}  # 日计划表
        self.week_plans = {}  # 周计划概要表
        self.student_skills = {}  # 学生技能关联表
        self.job_skill_requirements = {}  # 岗位技能要求表
        self.student_preferences = {}  # 学生偏好表
        self.matching_results = {}  # 匹配结果表
        self.tasks = {}  # 计划任务表（内存模式）
        self.saved_career_plans = {}  # 保存的职业规划表（内存模式）
        
        # 技能库与学生 - 技能关联表（内存后备方案）
        # 根据 SAMPLE_STUDENTS 中可能的技能字段预填充内存数据
        for s in SAMPLE_STUDENTS:
            sid = s.get('student_id')
            sks = s.get('skills') or []
            if not sks:
                continue
            self.student_skills.setdefault(sid, {})
            for sk in sks:
                if isinstance(sk, dict):
                    skill_id = sk.get('skill_id') or str(uuid.uuid4())
                    if skill_id not in self.skills:
                        self.skills[skill_id] = {
                            'skill_id': skill_id,
                            'skill_name': sk.get('name'),
                            'skill_category': sk.get('category'),
                            'skill_description': sk.get('description')
                        }
                    self.student_skills[sid][skill_id] = {
                        'skill_id': skill_id,
                        'proficiency_level': sk.get('proficiency'),
                        'experience_months': sk.get('experience_months')
                    }
                else:
                    # 假设为技能名称字符串
                    skill_id = str(uuid.uuid4())
                    self.skills[skill_id] = {'skill_id': skill_id, 'skill_name': sk}
                    self.student_skills[sid][skill_id] = {'skill_id': skill_id, 'proficiency_level': None}
        
        # 预填充测试数据（新表）
        self._init_test_data()
    
    def _init_test_data(self):
        """初始化新表的测试数据"""
        # 公司测试数据
        self.companies['c001'] = {
            'company_id': 'c001',
            'company_name': '测试科技公司',
            'company_location': '北京',
            'company_size': '100-500',
            'company_description': '一家专注于人工智能的科技公司'
        }
        
        # 日计划测试数据
        plan_id = 'dp001'
        self.day_plans[plan_id] = {
            'day_plan_id': plan_id,
            'student_id': 's001',
            'day_plan_name': '完成Python学习',
            'day_plan_describe': '学习Python基础语法',
            'day_plan_prority': 1,
            'day_plan_ddl': datetime.now().strftime('%Y-%m-%d'),
            'day_plan_finish': 0
        }
        
        # 周计划测试数据
        week_id = 'wp001'
        self.week_plans[week_id] = {
            'week_plan_id': week_id,
            'student_id': 's001',
            'week_plan_name': '第一周学习计划',
            'week_plan_start': datetime.now().strftime('%Y-%m-%d'),
            'week_plan_ddl': datetime.now().strftime('%Y-%m-%d'),
            'week_plan_finish': 0
        }
    
    def _execute_query(self, query, params=None):
        """执行查询并返回结果"""
        try:
            # 执行查询并获取所有结果
            self.cursor.execute(query, params or ())  # 执行SQL查询
            columns = [column[0] for column in self.cursor.description]  # 获取列名
            results = []
            for row in self.cursor.fetchall():  # 遍历查询结果
                results.append(dict(zip(columns, row)))  # 将结果转换为字典列表
            return results
        except Exception as e:
            # 查询失败时打印错误信息并返回空列表
            print(f"查询执行失败：{e}")  # 打印错误信息
            return []  # 返回空列表
    
    def _execute_update(self, query, params=None):
        """执行更新操作"""
        try:
            # 执行更新操作并提交事务
            self.cursor.execute(query, params or ())  # 执行SQL更新
            self.connection.commit()  # 提交事务
            return self.cursor.rowcount  # 返回受影响的行数
        except Exception as e:
            # 更新失败时打印错误信息并回滚事务
            print(f"更新操作失败：{e}")  # 打印错误信息
            self.connection.rollback()  # 回滚事务
            return 0  # 返回0表示更新失败
    
    # ==================== 用户登录模块 (users_login 表) ====================
    
    def get_user_by_username(self, username):
        """
        根据姓名获取用户信息

        Args:
            username (str): 用户名

        Returns:
            dict: 用户信息字典，如果未找到返回None
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取用户
            query = "SELECT * FROM users_login WHERE user_name = ?"
            result = self._execute_query(query, (username,))
            return result[0] if result else None
        else:
            # 从内存数据中查找用户
            for user_id, user in self.users.items():
                if user.get('user_name') == username:
                    return user
            return None

    def get_user_by_email(self, email):
        """
        根据邮箱获取用户信息

        Args:
            email (str): 用户邮箱

        Returns:
            dict: 用户信息字典，如果未找到返回None
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取用户
            query = "SELECT * FROM users_login WHERE user_email = ?"
            result = self._execute_query(query, (email,))
            return result[0] if result else None
        else:
            # 从内存数据中查找用户
            for user_id, user in self.users.items():
                if user.get('user_email') == email:
                    return user
            return None

    def get_user_by_studentname(self, student_name):
        """
        根据学生姓名获取用户信息

        Args:
            student_name (str): 学生姓名

        Returns:
            dict: 用户信息字典，如果未找到返回None
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取用户
            query = "SELECT * FROM users_login WHERE user_id = (SELECT user_id FROM students WHERE )"
            result = self._execute_query(query, (student_name,))
            return result[0] if result else None
        else:
            # 从内存数据中查找用户
            for user_id, user in self.users.items():
                if user.get('student_name') == student_name:
                    return user
            return None

    def get_user_by_id(self, user_id):
        """
        根据用户ID获取用户信息

        Args:
            user_id (str): 用户ID

        Returns:
            dict: 用户信息字典，如果未找到返回None
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取用户
            query = "SELECT * FROM users_login WHERE user_id = ?"
            result = self._execute_query(query, (user_id,))
            return result[0] if result else None
        else:
            # 从内存数据获取用户
            return self.users.get(user_id)

    def add_user(self, user_data):
        """
        添加新用户

        Args:
            user_data (dict): 用户信息字典

        Returns:
            bool: 添加成功返回True，否则返回False
        """
        # 生成用户ID
        user_id = str(uuid.uuid4())
        user_data['user_id'] = user_id

        # 兼容旧/新字段名
        user_name = user_data.get('user_name') or user_data.get('username')
        password_hash = user_data.get('password_hash') or user_data.get('password')
        user_email = user_data.get('user_email') or user_data.get('email')

        if self.use_sqlserver:
            # 向SQL Server数据库插入新用户
            query = """
            INSERT INTO users_login (user_name, password_hash, user_email, user_status, user_created_time, user_remark) 
            VALUES (?, ?, ?, ?, ?, ?)
            """
            params = (
                user_name,
                password_hash,
                user_email,
                user_data.get('user_status', 1),
                user_data.get('created_at', datetime.now()),
                user_data.get('user_remark')
            )
            return self._execute_update(query, params) > 0
        else:
            # 向内存数据添加新用户
            # 保留原始数据结构，但确保常用字段同时存在
            user_data['user_name'] = user_name
            user_data['password_hash'] = password_hash
            user_data['user_email'] = user_email
            self.users[user_id] = user_data
            return True

    def update_user_last_login(self, user_id):
        """
        更新用户的最后登录时间

        Args:
            user_id (str): 用户ID

        Returns:
            bool: 更新成功返回True，否则返回False
        """
        current_time = datetime.now()

        if self.use_sqlserver:
            # 更新SQL Server数据库中的用户最后登录时间
            query = "UPDATE users_login SET last_login_time = ? WHERE user_id = ?"
            return self._execute_update(query, (current_time, user_id)) > 0
        else:
            # 更新内存数据中的用户最后登录时间
            if user_id not in self.users:
                return False
            self.users[user_id]['last_login_time'] = current_time
            return True

    def update_user_password(self, user_id, new_password_hash):
        """
        更新用户密码

        Args:
            user_id (str): 用户ID
            new_password_hash (str): 新密码哈希值

        Returns:
            bool: 更新成功返回True，否则返回False
        """
        if self.use_sqlserver:
            # 更新SQL Server数据库中的用户密码
            query = "UPDATE users_login SET password_hash = ? WHERE user_id = ?"
            return self._execute_update(query, (new_password_hash, user_id)) > 0
        else:
            # 更新内存数据中的用户密码
            if user_id not in self.users:
                return False
            self.users[user_id]['password_hash'] = new_password_hash
            return True

    # ==================== 学生信息模块 (students 表) ====================
    
    def get_student_by_user(self, user_id):
        """根据登录用户ID取学生档案（students.user_id），没有则返回 None"""
        if self.use_sqlserver:
            result = self._execute_query(
                "SELECT * FROM students WHERE user_id = ?", (user_id,))
            return result[0] if result else None
        else:
            for stu in self.students.values():
                if str(stu.get('user_id')) == str(user_id):
                    return stu
            return None

    def get_or_create_student_by_user(self, user_id, student_name=None):
        """按登录用户取学生档案，不存在时创建一条最小档案（便于测评等模块直接入库）"""
        student = self.get_student_by_user(user_id)
        if student:
            return student
        if self.use_sqlserver:
            try:
                self._execute_update(
                    "INSERT INTO students (user_id, student_name) VALUES (?, ?)",
                    (int(user_id), student_name))
            except Exception as e:
                print(f"创建学生档案失败：{e}")
                return None
            return self.get_student_by_user(user_id)
        else:
            student_id = str(uuid.uuid4())
            record = {'student_id': student_id, 'user_id': user_id,
                      'student_name': student_name}
            self.students[student_id] = record
            return record

    def get_student_by_id(self, student_id):
        """
        根据学生ID获取学生信息
        
        Args:
            student_id (str): 学生ID
            
        Returns:
            dict: 学生信息字典，如果未找到返回None
        """
        if self.use_sqlserver:
            # 使用SQL Server查询
            query = "SELECT * FROM students WHERE student_id = ?"
            result = self._execute_query(query, (student_id,))
            return result[0] if result else None
        else:
            # 使用内存数据
            return self.students.get(student_id)

    def get_all_students(self):
        """
        获取所有学生信息
        
        Returns:
            list: 所有学生信息的列表
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取所有学生
            query = "SELECT * FROM students"
            return self._execute_query(query)
        else:
            # 从内存数据获取所有学生
            return list(self.students.values())


    def add_student(self, user_id,student_data):
        """
        添加新学生
        
        Args:
            student_data (dict): 学生信息字典
            
        Returns:
            bool: 添加成功返回True，否则返回False
        """
        # 无需检查是否包含必要的用户ID
            
        if self.use_sqlserver:
            # 向SQL Server数据库插入新学生
            query = """
            INSERT INTO students (student_major, user_id) 
            VALUES (?, ?)
            """
            params = (
                student_data.get('student_major'),
                user_id
            )
            return self._execute_update(query, params) > 0
        else:
            # 向内存数据添加新学生
            student_id = str(uuid.uuid4())
            student_data['student_id'] = student_id
            self.students[student_id] = student_data
            return True

    def update_student(self, student_id, student_data):
        """
        更新学生信息
        
        Args:
            student_id (str): 学生ID
            student_data (dict): 更新后的学生信息
            
        Returns:
            bool: 更新成功返回True，否则返回False
        """
        if self.use_sqlserver:
            # 更新SQL Server数据库中的学生信息
            query = """
            UPDATE students SET student_name=?, student_major=?, grade=?, gpa=?, user_id=? 
            WHERE student_id=?
            """
            params = (
                student_data.get('student_name'),
                student_data.get('student_major'),
                student_data.get('grade'),
                student_data.get('gpa'),
                student_data.get('user_id'),
                student_id
            )
            return self._execute_update(query, params) > 0
        else:
            # 更新内存数据中的学生信息
            if student_id not in self.students:
                return False
            self.students[student_id].update(student_data)
            return True

    def delete_student(self, student_id):
        """
        删除学生信息
        
        Args:
            student_id (str): 学生ID
            
        Returns:
            bool: 删除成功返回True，否则返回False
        """
        if self.use_sqlserver:
            # 从SQL Server数据库删除学生
            query = "DELETE FROM students WHERE student_id = ?"
            return self._execute_update(query, (student_id,)) > 0
        else:
            # 从内存数据删除学生
            if student_id not in self.students:
                return False
            del self.students[student_id]
            return True

    # ==================== 公司模块 (companies 表) ====================
    
    def get_company_by_id(self, company_id):
        """
        根据公司ID获取公司信息
        
        Args:
            company_id (str): 公司ID
            
        Returns:
            dict: 公司信息字典，如果未找到返回None
        """
        if self.use_sqlserver:
            query = "SELECT * FROM companies WHERE company_id = ?"
            result = self._execute_query(query, (company_id,))
            return result[0] if result else None
        else:
            return self.companies.get(company_id)

    def get_all_companies(self):
        """
        获取所有公司信息
        
        Returns:
            list: 所有公司信息的列表
        """
        if self.use_sqlserver:
            query = "SELECT * FROM companies"
            return self._execute_query(query)
        else:
            return list(self.companies.values())

    def add_company(self, company_data):
        """
        添加新公司
        
        Args:
            company_data (dict): 公司信息字典
            
        Returns:
            bool: 添加成功返回True，否则返回False
        """
        if self.use_sqlserver:
            query = """
            INSERT INTO companies (company_name, company_location, company_size, company_description) 
            VALUES (?, ?, ?, ?)
            """
            params = (
                company_data.get('company_name'),
                company_data.get('company_location'),
                company_data.get('company_size'),
                company_data.get('company_description')
            )
            return self._execute_update(query, params) > 0
        else:
            company_id = str(uuid.uuid4())
            company_data['company_id'] = company_id
            self.companies[company_id] = company_data
            return True

    # ==================== 技能模块 (skills 表) ====================
    
    def get_skill_by_id(self, skill_id):
        """根据技能ID获取技能信息"""
        if self.use_sqlserver:
            query = "SELECT * FROM skills WHERE skill_id = ?"
            result = self._execute_query(query, (skill_id,))
            return result[0] if result else None
        else:
            return self.skills.get(skill_id)

    def get_skill_by_name(self, skill_name):
        """根据技能名称从技能库中检索技能"""
        if self.use_sqlserver:
            query = "SELECT * FROM skills WHERE skill_name = ?"
            result = self._execute_query(query, (skill_name,))
            return result[0] if result else None
        else:
            for skill in self.skills.values():
                if skill.get('skill_name') == skill_name:
                    return skill
            return None

    def get_all_skills(self):
        """获取所有技能"""
        if self.use_sqlserver:
            query = "SELECT * FROM skills"
            return self._execute_query(query)
        else:
            return list(self.skills.values())

    def add_skill(self, skill_data):
        """向技能库中添加技能"""
        if self.use_sqlserver:
            query = "INSERT INTO skills (skill_name, skill_category, skill_description) VALUES (?, ?, ?)"
            params = (
                skill_data.get('skill_name'),
                skill_data.get('skill_category'),
                skill_data.get('skill_description')
            )
            return self._execute_update(query, params) > 0
        else:
            skill_id = str(uuid.uuid4())
            skill_data['skill_id'] = skill_id
            self.skills[skill_id] = skill_data
            return True

    # ==================== 职业测评模块 (holland_test_results 表) ====================
    
    def get_holland_test_by_student(self, student_id):
        """获取学生的霍兰德测试结果"""
        if self.use_sqlserver:
            query = "SELECT * FROM holland_test_results WHERE student_id = ? ORDER BY holland_test_time DESC"
            return self._execute_query(query, (student_id,))
        else:
            results = []
            for result in self.holland_test_results.values():
                if result.get('student_id') == student_id:
                    results.append(result)
            return sorted(results, key=lambda x: x.get('holland_test_time', ''), reverse=True)

    def add_holland_test(self, test_data):
        """添加霍兰德测试结果"""
        if self.use_sqlserver:
            query = """
            INSERT INTO holland_test_results 
            (student_id, holland_R, holland_I, holland_A, holland_S, holland_E, holland_C, holland_test_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """
            params = (
                test_data.get('student_id'),
                test_data.get('holland_R', 0),
                test_data.get('holland_I', 0),
                test_data.get('holland_A', 0),
                test_data.get('holland_S', 0),
                test_data.get('holland_E', 0),
                test_data.get('holland_C', 0),
                test_data.get('holland_test_time', datetime.now())
            )
            return self._execute_update(query, params) > 0
        else:
            test_id = str(uuid.uuid4())
            test_data['holland_test_id'] = test_id
            test_data['holland_test_time'] = test_data.get('holland_test_time', datetime.now())
            self.holland_test_results[test_id] = test_data
            return True

    # ==================== 职业价值观模块 (career_values 表) ====================
    
    def get_career_values_by_student(self, student_id):
        """获取学生的职业价值观测试结果"""
        if self.use_sqlserver:
            query = "SELECT * FROM career_values WHERE student_id = ? ORDER BY value_test_time DESC"
            return self._execute_query(query, (student_id,))
        else:
            results = []
            for result in self.career_values.values():
                if result.get('student_id') == student_id:
                    results.append(result)
            return sorted(results, key=lambda x: x.get('value_test_time', ''), reverse=True)

    def add_career_values(self, values_data):
        """添加职业价值观测试结果"""
        if self.use_sqlserver:
            query = """
            INSERT INTO career_values 
            (student_id, social_contribution, achievement_oriented, safe_stable, 
             work_life_balance, power_status, innovation_challenge, value_test_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """
            params = (
                values_data.get('student_id'),
                values_data.get('social_contribution', 0),
                values_data.get('achievement_oriented', 0),
                values_data.get('safe_stable', 0),
                values_data.get('work_life_balance', 0),
                values_data.get('power_status', 0),
                values_data.get('innovation_challenge', 0),
                values_data.get('value_test_time', datetime.now())
            )
            return self._execute_update(query, params) > 0
        else:
            value_id = str(uuid.uuid4())
            values_data['value_id'] = value_id
            values_data['value_test_time'] = values_data.get('value_test_time', datetime.now())
            self.career_values[value_id] = values_data
            return True

    # ==================== 技能维度测评模块 (skill_dimension_assessments 表) ====================

    def add_skill_dimension_assessment(self, data):
        """保存一次技能维度测评（技术/思维/学习/软技能/管理/创意/行业 七维）"""
        if self.use_sqlserver:
            query = """
            INSERT INTO skill_dimension_assessments
            (student_id, major, technical, thinking, learning, soft, management,
             creative, industry, overall, assess_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            params = (
                data.get('student_id'),
                data.get('major'),
                data.get('technical'),
                data.get('thinking'),
                data.get('learning'),
                data.get('soft'),
                data.get('management'),
                data.get('creative'),
                data.get('industry'),
                data.get('overall'),
                data.get('assess_time', datetime.now())
            )
            return self._execute_update(query, params) > 0
        else:
            record_id = str(uuid.uuid4())
            data['assessment_id'] = record_id
            data['assess_time'] = data.get('assess_time', datetime.now())
            self.skill_dimension_assessments[record_id] = data
            return True

    def get_skill_dimension_by_student(self, student_id):
        """取学生的技能维度测评历史（按时间倒序）"""
        if self.use_sqlserver:
            query = ("SELECT * FROM skill_dimension_assessments "
                     "WHERE student_id = ? ORDER BY assess_time DESC")
            return self._execute_query(query, (student_id,))
        else:
            results = [v for v in self.skill_dimension_assessments.values()
                       if str(v.get('student_id')) == str(student_id)]
            return sorted(results, key=lambda x: x.get('assess_time', ''), reverse=True)

    # ==================== 经历模块 (experiences 表) ====================
    
    def get_experiences_by_student(self, student_id):
        """获取学生的经历列表"""
        if self.use_sqlserver:
            query = "SELECT * FROM experiences WHERE student_id = ? ORDER BY experience_start_time DESC"
            return self._execute_query(query, (student_id,))
        else:
            results = []
            for exp in self.experiences.values():
                if exp.get('student_id') == student_id:
                    results.append(exp)
            return sorted(results, key=lambda x: x.get('experience_start_time', ''), reverse=True)

    def add_experience(self, experience_data):
        """添加学生经历"""
        if self.use_sqlserver:
            query = """
            INSERT INTO experiences 
            (student_id, experience_title, experience_content, experience_type, 
             experience_role, experience_start_time, experience_end_time, updated_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """
            params = (
                experience_data.get('student_id'),
                experience_data.get('experience_title'),
                experience_data.get('experience_content'),
                experience_data.get('experience_type'),
                experience_data.get('experience_role'),
                experience_data.get('experience_start_time'),
                experience_data.get('experience_end_time'),
                datetime.now()
            )
            return self._execute_update(query, params) > 0
        else:
            exp_id = str(uuid.uuid4())
            experience_data['experience_id'] = exp_id
            experience_data['updated_time'] = datetime.now()
            self.experiences[exp_id] = experience_data
            return True

    def update_experience(self, experience_id, experience_data):
        """更新学生经历"""
        if self.use_sqlserver:
            query = """
            UPDATE experiences SET experience_title=?, experience_content=?, experience_type=?, 
            experience_role=?, experience_start_time=?, experience_end_time=?, updated_time=? 
            WHERE experience_id=?
            """
            params = (
                experience_data.get('experience_title'),
                experience_data.get('experience_content'),
                experience_data.get('experience_type'),
                experience_data.get('experience_role'),
                experience_data.get('experience_start_time'),
                experience_data.get('experience_end_time'),
                datetime.now(),
                experience_id
            )
            return self._execute_update(query, params) > 0
        else:
            if experience_id not in self.experiences:
                return False
            self.experiences[experience_id].update(experience_data)
            self.experiences[experience_id]['updated_time'] = datetime.now()
            return True

    def delete_experience(self, experience_id):
        """删除学生经历"""
        if self.use_sqlserver:
            query = "DELETE FROM experiences WHERE experience_id = ?"
            return self._execute_update(query, (experience_id,)) > 0
        else:
            if experience_id not in self.experiences:
                return False
            del self.experiences[experience_id]
            return True

    # ==================== 计划系统模块 (day_plans, week_plans 表) ====================
    
    def get_day_plan_by_id(self, day_plan_id):
        """根据日计划ID获取日计划"""
        if self.use_sqlserver:
            query = "SELECT * FROM day_plans WHERE day_plan_id = ?"
            result = self._execute_query(query, (day_plan_id,))
            return result[0] if result else None
        else:
            return self.day_plans.get(day_plan_id)

    def get_day_plans_by_student(self, student_id, days=7):
        """获取学生最近N天的日计划"""
        if self.use_sqlserver:
            query = """
            SELECT * FROM day_plans 
            WHERE student_id = ? AND day_plan_ddl >= DATEADD(DAY, -?, GETDATE())
            ORDER BY day_plan_ddl DESC
            """
            return self._execute_query(query, (student_id, days))
        else:
            results = []
            for plan in self.day_plans.values():
                if plan.get('student_id') == student_id:
                    results.append(plan)
            return sorted(results, key=lambda x: x.get('day_plan_ddl', ''), reverse=True)[:days]

    def add_day_plan(self, plan_data):
        """添加日计划"""
        if self.use_sqlserver:
            query = """
            INSERT INTO day_plans 
            (student_id, day_plan_name, day_plan_describe, day_plan_prority, day_plan_ddl, day_plan_finish) 
            VALUES (?, ?, ?, ?, ?, ?)
            """
            params = (
                plan_data.get('student_id'),
                plan_data.get('day_plan_name'),
                plan_data.get('day_plan_describe'),
                plan_data.get('day_plan_prority', 1),
                plan_data.get('day_plan_ddl'),
                plan_data.get('day_plan_finish', 0)
            )
            return self._execute_update(query, params) > 0
        else:
            plan_id = str(uuid.uuid4())
            plan_data['day_plan_id'] = plan_id
            self.day_plans[plan_id] = plan_data
            return True

    def update_day_plan_finish(self, day_plan_id, finished):
        """更新日计划完成状态"""
        if self.use_sqlserver:
            query = "UPDATE day_plans SET day_plan_finish = ? WHERE day_plan_id = ?"
            return self._execute_update(query, (1 if finished else 0, day_plan_id)) > 0
        else:
            if day_plan_id not in self.day_plans:
                return False
            self.day_plans[day_plan_id]['day_plan_finish'] = 1 if finished else 0
            return True

    def delete_day_plan(self, day_plan_id):
        """删除日计划"""
        if self.use_sqlserver:
            query = "DELETE FROM day_plans WHERE day_plan_id = ?"
            return self._execute_update(query, (day_plan_id,)) > 0
        else:
            if day_plan_id not in self.day_plans:
                return False
            del self.day_plans[day_plan_id]
            return True

    def get_week_plan_by_id(self, week_plan_id):
        """根据周计划ID获取周计划"""
        if self.use_sqlserver:
            query = "SELECT * FROM week_plans WHERE week_plan_id = ?"
            result = self._execute_query(query, (week_plan_id,))
            return result[0] if result else None
        else:
            return self.week_plans.get(week_plan_id)

    def get_week_plans_by_student(self, student_id):
        """获取学生的周计划列表"""
        if self.use_sqlserver:
            query = "SELECT * FROM week_plans WHERE student_id = ? ORDER BY week_plan_start DESC"
            return self._execute_query(query, (student_id,))
        else:
            results = []
            for plan in self.week_plans.values():
                if plan.get('student_id') == student_id:
                    results.append(plan)
            return sorted(results, key=lambda x: x.get('week_plan_start', ''), reverse=True)

    def add_week_plan(self, plan_data):
        """添加周计划"""
        if self.use_sqlserver:
            query = """
            INSERT INTO week_plans 
            (student_id, week_plan_name, week_plan_start, week_plan_ddl, week_plan_finish) 
            VALUES (?, ?, ?, ?, ?)
            """
            params = (
                plan_data.get('student_id'),
                plan_data.get('week_plan_name'),
                plan_data.get('week_plan_start'),
                plan_data.get('week_plan_ddl'),
                plan_data.get('week_plan_finish', 0)
            )
            return self._execute_update(query, params) > 0
        else:
            plan_id = str(uuid.uuid4())
            plan_data['week_plan_id'] = plan_id
            self.week_plans[plan_id] = plan_data
            return True

    def update_week_plan_finish(self, week_plan_id, finished):
        """更新周计划完成状态"""
        if self.use_sqlserver:
            query = "UPDATE week_plans SET week_plan_finish = ? WHERE week_plan_id = ?"
            return self._execute_update(query, (1 if finished else 0, week_plan_id)) > 0
        else:
            if week_plan_id not in self.week_plans:
                return False
            self.week_plans[week_plan_id]['week_plan_finish'] = 1 if finished else 0
            return True

    # ==================== 关系表模块 (student_skills, jobs, job_skill_requirements) ====================
    
    def get_student_skills(self, student_id):
        """获取学生的所有技能及其详情"""
        if self.use_sqlserver:
            query = """
            SELECT ss.skill_record_id, ss.student_id, ss.skill_id, s.skill_name, s.skill_category, 
                   ss.proficiency_level, ss.experience_months
            FROM student_skills ss
            JOIN skills s ON ss.skill_id = s.skill_id
            WHERE ss.student_id = ?
            """
            return self._execute_query(query, (student_id,))
        else:
            result = []
            student_map = self.student_skills.get(student_id, {})
            for skill_id, assoc in student_map.items():
                skill = self.skills.get(skill_id, {'skill_id': skill_id})
                merged = skill.copy()
                merged.update({
                    'skill_record_id': assoc.get('skill_record_id'),
                    'proficiency_level': assoc.get('proficiency_level'),
                    'experience_months': assoc.get('experience_months')
                })
                result.append(merged)
            return result

    def add_skill_to_student(self, student_id, skill_id, proficiency_level=None, experience_months=None):
        """将技能与学生关联"""
        if self.use_sqlserver:
            # 检查是否已存在
            existing = self._execute_query(
                "SELECT * FROM student_skills WHERE student_id = ? AND skill_id = ?", 
                (student_id, skill_id)
            )
            if existing:
                return self._execute_update(
                    "UPDATE student_skills SET proficiency_level = ?, experience_months = ? WHERE student_id = ? AND skill_id = ?", 
                    (proficiency_level, experience_months, student_id, skill_id)
                ) > 0
            else:
                query = "INSERT INTO student_skills (student_id, skill_id, proficiency_level, experience_months) VALUES (?, ?, ?, ?)"
                return self._execute_update(query, (student_id, skill_id, proficiency_level, experience_months)) > 0
        else:
            self.student_skills.setdefault(student_id, {})
            self.student_skills[student_id][skill_id] = {
                'skill_id': skill_id,
                'proficiency_level': proficiency_level,
                'experience_months': experience_months
            }
            return True

    def remove_skill_from_student(self, student_id, skill_id):
        """从学生的技能表中移除某项技能"""
        if self.use_sqlserver:
            query = "DELETE FROM student_skills WHERE student_id = ? AND skill_id = ?"
            return self._execute_update(query, (student_id, skill_id)) > 0
        else:
            if student_id not in self.student_skills or skill_id not in self.student_skills[student_id]:
                return False
            del self.student_skills[student_id][skill_id]
            return True

    def get_job_by_id(self, job_id):
        """根据职位ID获取职位信息"""
        if self.use_sqlserver:
            query = "SELECT * FROM jobs WHERE job_id = ?"
            result = self._execute_query(query, (job_id,))
            return result[0] if result else None
        else:
            return self.jobs.get(job_id)

    def get_all_jobs(self):
        """获取所有职位信息"""
        if self.use_sqlserver:
            query = "SELECT * FROM jobs"
            return self._execute_query(query)
        else:
            return list(self.jobs.values())

    def get_jobs_by_criteria(self, criteria=None):
        """根据条件筛选职位"""
        if not criteria:
            return self.get_all_jobs()
        
        if self.use_sqlserver:
            conditions = " AND ".join([f"{key} = ?" for key in criteria.keys()])
            query = f"SELECT * FROM jobs WHERE {conditions}"
            result = self._execute_query(query, tuple(criteria.values()))
            return result
        else:
            filtered_jobs = []
            for job in self.jobs.values():
                match = True
                for key, value in criteria.items():
                    if key in job and job[key] != value:
                        match = False
                        break
                if match:
                    filtered_jobs.append(job)
            return filtered_jobs

    def add_job(self, job_data):
        """添加新职位"""
        if 'job_id' not in job_data and 'job_title' not in job_data:
            return False
            
        if self.use_sqlserver:
            query = """
            INSERT INTO jobs (company_id, job_title, job_type, salary_range) 
            VALUES (?, ?, ?, ?)
            """
            params = (
                job_data.get('company_id'),
                job_data.get('job_title'),
                job_data.get('job_type'),
                job_data.get('salary_range')
            )
            return self._execute_update(query, params) > 0
        else:
            job_id = str(uuid.uuid4())
            job_data['job_id'] = job_id
            self.jobs[job_id] = job_data
            return True

    def get_job_skill_requirements(self, job_id):
        """获取岗位的技能要求"""
        if self.use_sqlserver:
            query = """
            SELECT jsr.requirement_id, jsr.job_id, jsr.skill_id, s.skill_name, 
                   jsr.required_level, jsr.requirement_type
            FROM job_skill_requirements jsr
            JOIN skills s ON jsr.skill_id = s.skill_id
            WHERE jsr.job_id = ?
            """
            return self._execute_query(query, (job_id,))
        else:
            results = []
            for req in self.job_skill_requirements.values():
                if req.get('job_id') == job_id:
                    skill = self.skills.get(req.get('skill_id'), {})
                    merged = skill.copy()
                    merged.update(req)
                    results.append(merged)
            return results

    def add_job_skill_requirement(self, job_id, skill_id, required_level=None, requirement_type=None):
        """添加岗位技能要求"""
        if self.use_sqlserver:
            query = """
            INSERT INTO job_skill_requirements (job_id, skill_id, required_level, requirement_type) 
            VALUES (?, ?, ?, ?)
            """
            params = (job_id, skill_id, required_level, requirement_type)
            return self._execute_update(query, params) > 0
        else:
            req_id = str(uuid.uuid4())
            self.job_skill_requirements[req_id] = {
                'requirement_id': req_id,
                'job_id': job_id,
                'skill_id': skill_id,
                'required_level': required_level,
                'requirement_type': requirement_type
            }
            return True

    # ==================== 业务表模块 (student_preferences, matching_results) ====================
    
    def get_student_preferences(self, student_id):
        """获取学生偏好"""
        if self.use_sqlserver:
            query = "SELECT * FROM student_preferences WHERE student_id = ?"
            result = self._execute_query(query, (student_id,))
            return result[0] if result else None
        else:
            for pref in self.student_preferences.values():
                if pref.get('student_id') == student_id:
                    return pref
            return None

    def add_student_preferences(self, preferences_data):
        """添加/更新学生偏好"""
        if self.use_sqlserver:
            # 检查是否已存在
            existing = self._execute_query(
                "SELECT * FROM student_preferences WHERE student_id = ?", 
                (preferences_data.get('student_id'),)
            )
            if existing:
                query = """
                UPDATE student_preferences SET preferred_industries=?, preferred_locations=?, 
                expected_salary=?, work_mode_preference=? WHERE student_id=?
                """
                params = (
                    preferences_data.get('preferred_industries'),
                    preferences_data.get('preferred_locations'),
                    preferences_data.get('expected_salary'),
                    preferences_data.get('work_mode_preference'),
                    preferences_data.get('student_id')
                )
                return self._execute_update(query, params) > 0
            else:
                query = """
                INSERT INTO student_preferences (student_id, preferred_industries, preferred_locations, 
                expected_salary, work_mode_preference) VALUES (?, ?, ?, ?, ?)
                """
                params = (
                    preferences_data.get('student_id'),
                    preferences_data.get('preferred_industries'),
                    preferences_data.get('preferred_locations'),
                    preferences_data.get('expected_salary'),
                    preferences_data.get('work_mode_preference')
                )
                return self._execute_update(query, params) > 0
        else:
            pref_id = str(uuid.uuid4())
            preferences_data['preference_id'] = pref_id
            self.student_preferences[pref_id] = preferences_data
            return True

    def get_matching_results_by_student(self, student_id):
        """获取学生的匹配结果"""
        if self.use_sqlserver:
            query = """
            SELECT mr.match_id, mr.student_id, mr.job_id, j.job_title, c.company_name, 
                   mr.match_score
            FROM matching_results mr
            JOIN jobs j ON mr.job_id = j.job_id
            JOIN companies c ON j.company_id = c.company_id
            WHERE mr.student_id = ?
            ORDER BY mr.match_score DESC
            """
            return self._execute_query(query, (student_id,))
        else:
            results = []
            for match in self.matching_results.values():
                if match.get('student_id') == student_id:
                    job = self.jobs.get(match.get('job_id'), {})
                    company = self.companies.get(job.get('company_id'), {})
                    merged = match.copy()
                    merged.update({
                        'job_title': job.get('job_title'),
                        'company_name': company.get('company_name')
                    })
                    results.append(merged)
            return sorted(results, key=lambda x: x.get('match_score', 0), reverse=True)

    def add_matching_result(self, student_id, job_id, match_score):
        """添加匹配结果"""
        if self.use_sqlserver:
            query = "INSERT INTO matching_results (student_id, job_id, match_score) VALUES (?, ?, ?)"
            return self._execute_update(query, (student_id, job_id, match_score)) > 0
        else:
            match_id = str(uuid.uuid4())
            self.matching_results[match_id] = {
                'match_id': match_id,
                'student_id': student_id,
                'job_id': job_id,
                'match_score': match_score
            }
            return True

    # ==================== 多表操作模块 ====================
    
    def register_user_with_student(self, user_data, student_data):
        """用户注册同时创建学生信息（多表插入）"""
        if self.use_sqlserver:
            try:
                self.connection.begin()
                
                # 插入 users_login 表
                user_query = """
                INSERT INTO users_login (user_name, password_hash, user_email, user_status, user_created_time) 
                VALUES (?, ?, ?, ?, ?)
                """
                self.cursor.execute(user_query, (
                    user_data.get('user_name'),
                    user_data.get('password_hash'),
                    user_data.get('user_email'),
                    user_data.get('user_status', 1),
                    datetime.now()
                ))
                user_id = self.cursor.execute("SELECT SCOPE_IDENTITY()").fetchone()[0]
                
                # 插入 students 表
                student_query = """
                INSERT INTO students (student_name, student_major, grade, gpa, user_id) 
                VALUES (?, ?, ?, ?, ?)
                """
                self.cursor.execute(student_query, (
                    student_data.get('student_name'),
                    student_data.get('student_major'),
                    student_data.get('grade'),
                    student_data.get('gpa'),
                    user_id
                ))
                student_id = self.cursor.execute("SELECT SCOPE_IDENTITY()").fetchone()[0]
                
                self.connection.commit()
                return {'success': True, 'user_id': user_id, 'student_id': student_id}
            except Exception as e:
                self.connection.rollback()
                return {'success': False, 'error': str(e)}
        else:
            user_id = str(uuid.uuid4())
            student_id = str(uuid.uuid4())
            user_data['user_id'] = user_id
            student_data['student_id'] = student_id
            student_data['user_id'] = user_id
            self.users[user_id] = user_data
            self.students[student_id] = student_data
            return {'success': True, 'user_id': user_id, 'student_id': student_id}

    # ==================== 计划任务模块 (tasks 表) ====================

    def get_tasks_by_user(self, user_id):
        """获取用户的计划任务列表"""
        user_id = str(user_id)
        if self.use_sqlserver:
            query = """
            SELECT task_uuid, title, description, priority, completed, category, task_date, task_time, created_at, updated_at
            FROM tasks WHERE user_id = ? ORDER BY task_date DESC, task_time ASC
            """
            rows = self._execute_query(query, (user_id,))
            return [self._task_row_to_dict(r) for r in rows]
        else:
            results = []
            for task in self.tasks.values():
                if str(task.get('user_id')) == user_id:
                    results.append(task)
            return sorted(results, key=lambda x: (x.get('date') or '', x.get('time') or ''), reverse=True)

    def _task_row_to_dict(self, row):
        """将 tasks 表行转换为前端任务字段格式"""
        return {
            'id': row.get('task_uuid'),
            'title': row.get('title'),
            'description': row.get('description') or '',
            'priority': row.get('priority') or 'medium',
            'completed': bool(row.get('completed')),
            'category': row.get('category') or '学习',
            'date': row.get('task_date'),
            'time': row.get('task_time') or '',
            'createdAt': row.get('created_at').isoformat() if isinstance(row.get('created_at'), datetime) else str(row.get('created_at')),
            'updatedAt': row.get('updated_at').isoformat() if isinstance(row.get('updated_at'), datetime) else str(row.get('updated_at'))
        }

    def add_task(self, user_id, task):
        """添加计划任务，返回任务字典"""
        user_id = str(user_id)
        task_uuid = str(task.get('id') or uuid.uuid4())
        if self.use_sqlserver:
            query = """
            INSERT INTO tasks (user_id, task_uuid, title, description, priority, completed, category, task_date, task_time, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            now = datetime.now()
            params = (
                user_id,
                task_uuid,
                task.get('title'),
                task.get('description', ''),
                task.get('priority', 'medium'),
                1 if task.get('completed') else 0,
                task.get('category', '学习'),
                task.get('date') or datetime.now().strftime('%Y-%m-%d'),
                task.get('time', ''),
                now,
                now
            )
            ok = self._execute_update(query, params) > 0
        else:
            self.tasks.setdefault(user_id, []).append(dict(task))
            ok = True
        if ok:
            return dict(task, id=task_uuid)
        return None

    def update_task_status(self, user_id, task_id, completed):
        """更新任务完成状态"""
        user_id = str(user_id)
        task_id = str(task_id)
        if self.use_sqlserver:
            query = "UPDATE tasks SET completed = ?, updated_at = ? WHERE user_id = ? AND task_uuid = ?"
            return self._execute_update(query, (1 if completed else 0, datetime.now(), user_id, task_id)) > 0
        else:
            for task in self.tasks.get(user_id, []):
                if str(task.get('id')) == task_id:
                    task['completed'] = bool(completed)
                    return True
            return False

    def delete_task(self, user_id, task_id):
        """删除任务"""
        user_id = str(user_id)
        task_id = str(task_id)
        if self.use_sqlserver:
            query = "DELETE FROM tasks WHERE user_id = ? AND task_uuid = ?"
            return self._execute_update(query, (user_id, task_id)) > 0
        else:
            tasks = self.tasks.get(user_id, [])
            for i, task in enumerate(tasks):
                if str(task.get('id')) == task_id:
                    del tasks[i]
                    return True
            return False

    # ==================== 保存的职业规划 (saved_career_plans 表) ====================

    def get_career_plans_by_user(self, user_id):
        """获取用户保存的职业规划列表"""
        user_id = str(user_id)
        if self.use_sqlserver:
            query = "SELECT plan_uuid, plan_json, created_at FROM saved_career_plans WHERE user_id = ? ORDER BY created_at DESC"
            rows = self._execute_query(query, (user_id,))
            result = []
            for row in rows:
                try:
                    plan = json.loads(row.get('plan_json'))
                    plan.setdefault('id', row.get('plan_uuid'))
                    plan.setdefault('created_at', str(row.get('created_at')))
                    result.append(plan)
                except Exception:
                    continue
            return result
        else:
            return self.saved_career_plans.get(user_id, [])

    def add_career_plan(self, user_id, plan):
        """保存职业规划，返回带 id 的规划字典"""
        user_id = str(user_id)
        plan_uuid = str(plan.get('id') or uuid.uuid4())
        if self.use_sqlserver:
            query = "INSERT INTO saved_career_plans (user_id, plan_uuid, plan_json, created_at) VALUES (?, ?, ?, ?)"
            ok = self._execute_update(query, (user_id, plan_uuid, json.dumps(plan, ensure_ascii=False), datetime.now())) > 0
        else:
            self.saved_career_plans.setdefault(user_id, []).append(dict(plan))
            ok = True
        if ok:
            return dict(plan, id=plan_uuid)
        return None

    # ==================== 推荐数据读取（sample_students / sample_jobs / sample_courses 表） ====================

    def get_recommendation_students(self):
        """获取推荐用学生画像列表（SQL 模式读数据库；内存模式返回 None 由调用方回退 sample_data）"""
        if not self.use_sqlserver:
            return None
        rows = self._execute_query("SELECT student_id, student_json FROM sample_students")
        result = []
        for row in rows:
            try:
                student = json.loads(row.get('student_json'))
                student.setdefault('student_id', row.get('student_id'))
                result.append(student)
            except Exception:
                continue
        return result

    def get_recommendation_jobs(self):
        """获取推荐用岗位列表（SQL 模式读数据库；内存模式返回 None 由调用方回退 sample_data）"""
        if not self.use_sqlserver:
            return None
        rows = self._execute_query("SELECT job_id, job_json FROM sample_jobs")
        result = []
        for row in rows:
            try:
                job = json.loads(row.get('job_json'))
                job.setdefault('job_id', row.get('job_id'))
                result.append(job)
            except Exception:
                continue
        return result

    def get_recommendation_courses(self):
        """获取课程目录（SQL 模式读数据库；内存模式返回 None 由调用方回退 sample_data）"""
        if not self.use_sqlserver:
            return None
        rows = self._execute_query("SELECT course_id, course_json FROM sample_courses")
        result = []
        for row in rows:
            try:
                course = json.loads(row.get('course_json'))
                course.setdefault('course_id', row.get('course_id'))
                result.append(course)
            except Exception:
                continue
        return result

    def close_connection(self):
        """关闭数据库连接"""
        if self.use_sqlserver:
            # 如果使用的是SQL Server，关闭游标和连接
            self.cursor.close()
            self.connection.close()


# 全局数据库实例
db = DatabaseInterface()


def get_database(host='localhost', user='app_user', password='34rj>sh&2uio3(jk12e', database='career_system_prod'):
    """
    获取数据库实例（支持连接重连）
    
    Args:
        host: 服务器地址
        user: 用户名
        password: 密码
        database: 数据库名称
    
    Returns:
        DatabaseInterface: 数据库接口实例
    """
    global db
    if db.use_sqlserver:
        try:
            # 测试连接是否仍然有效
            db._execute_query("SELECT 1")
        except:
            # 如果连接失效，则重新创建连接
            db = DatabaseInterface(host, user, password, database)
    else:
        # 如果之前是使用内存数据，现在尝试连接数据库
        db = DatabaseInterface(host, user, password, database)
    return db