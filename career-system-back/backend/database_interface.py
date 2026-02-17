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
from datetime import datetime


class DatabaseInterface:
    """
    数据库接口类
    
    提供对系统中各类数据的统一访问接口，包括学生信息、职位信息、职业路径和课程信息等。
    该类支持两种数据存储方式：SQL Server数据库和内存数据（作为数据库连接失败时的后备方案）。
    """
    
    def __init__(self, host='localhost', user='sa', password='', database='career_recommendation'):
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
        except Exception as e:
            # 如果连接失败，打印错误信息并使用默认的内存数据
            print(f"无法连接到SQL Server数据库: {e}")  # 打印错误信息
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
            print(f"查询执行失败: {e}")  # 打印错误信息
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
            print(f"更新操作失败: {e}")  # 打印错误信息
            self.connection.rollback()  # 回滚事务
            return 0  # 返回0表示更新失败
    
    # 学生相关操作
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
            query = "SELECT * FROM students WHERE student_id = ?"  # SQL查询语句
            result = self._execute_query(query, (student_id,))     # 执行查询
            return result[0] if result else None                   # 返回查询结果
        else:
            # 使用内存数据
            return self.students.get(student_id)  # 从内存数据中获取学生信息
    
    def get_all_students(self):
        """
        获取所有学生信息
        
        Returns:
            list: 所有学生信息的列表
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取所有学生
            query = "SELECT * FROM students"  # SQL查询语句
            return self._execute_query(query)  # 执行查询并返回结果
        else:
            # 从内存数据获取所有学生
            return list(self.students.values())  # 返回所有学生信息的列表
    
    def add_student(self, student_data):
        """
        添加新学生
        
        Args:
            student_data (dict): 学生信息字典
            
        Returns:
            bool: 添加成功返回True，否则返回False
        """
        # 检查是否包含必要的学生ID
        if 'student_id' not in student_data:
            return False
            
        if self.use_sqlserver:
            # 向SQL Server数据库插入新学生
            query = """
            INSERT INTO students (student_id, name, major, gpa, skills) 
            VALUES (?, ?, ?, ?, ?)
            """  # SQL插入语句
            params = (
                student_data['student_id'],  # 学生ID
                student_data.get('name'),     # 姓名
                student_data.get('major'),
                student_data.get('gpa'),      # GPA
                student_data.get('skills')    # 技能
            )
            return self._execute_update(query, params) > 0  # 执行更新并返回结果
        else:
            # 向内存数据添加新学生
            self.students[student_data['student_id']] = student_data  # 添加学生数据
            return True  # 返回True表示添加成功
    
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
            UPDATE students SET name=?, major=?, gpa=?, skills=? 
            WHERE student_id=?
            """  # SQL更新语句
            params = (
                student_data.get('name'),  # 姓名
                student_data.get('major'), # 专业
                student_data.get('gpa'),   # GPA
                student_data.get('skills'),# 技能
                student_id                 # 学生ID
            )
            return self._execute_update(query, params) > 0  # 执行更新并返回结果
        else:
            # 更新内存数据中的学生信息
            if student_id not in self.students:
                return False  # 学生不存在，返回False
            self.students[student_id] = student_data  # 更新学生数据
            return True  # 返回True表示更新成功
    
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
            query = "DELETE FROM students WHERE student_id = ?"  # SQL删除语句
            return self._execute_update(query, (student_id,)) > 0  # 执行删除并返回结果
        else:
            # 从内存数据删除学生
            if student_id not in self.students:
                return False  # 学生不存在，返回False
            del self.students[student_id]  # 删除学生数据
            return True  # 返回True表示删除成功
    
    # 职位相关操作
    def get_job_by_id(self, job_id):
        """
        根据职位ID获取职位信息
        
        Args:
            job_id (str): 职位ID
            
        Returns:
            dict: 职位信息字典，如果未找到返回None
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取职位
            query = "SELECT * FROM jobs WHERE job_id = ?"  # SQL查询语句
            result = self._execute_query(query, (job_id,))  # 执行查询
            return result[0] if result else None  # 返回查询结果
        else:
            # 从内存数据获取职位
            return self.jobs.get(job_id)  # 从内存数据中获取职位信息
    
    def get_all_jobs(self):
        """
        获取所有职位信息
        
        Returns:
            list: 所有职位信息的列表
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取所有职位
            query = "SELECT * FROM jobs"  # SQL查询语句
            return self._execute_query(query)  # 执行查询并返回结果
        else:
            # 从内存数据获取所有职位
            return list(self.jobs.values())  # 返回所有职位信息的列表
    
    def get_jobs_by_criteria(self, criteria=None):
        """
        根据条件筛选职位
        
        Args:
            criteria (dict): 筛选条件，如{'location': '北京', 'company_size': '大型企业'}
            
        Returns:
            list: 符合条件的职位列表
        """
        if not criteria:
            return self.get_all_jobs()  # 如果没有筛选条件，返回所有职位
        
        if self.use_sqlserver:
            # 构建动态查询语句
            conditions = " AND ".join([f"{key} = ?" for key in criteria.keys()])  # 构建条件语句
            query = f"SELECT * FROM jobs WHERE {conditions}"  # 构建SQL查询语句
            result = self._execute_query(query, tuple(criteria.values()))  # 执行查询
            return result  # 返回查询结果
        else:
            # 在内存数据中筛选职位
            filtered_jobs = []
            for job in self.jobs.values():  # 遍历所有职位
                match = True
                for key, value in criteria.items():  # 检查每个筛选条件
                    if key in job and job[key] != value:  # 如果条件不匹配
                        match = False
                        break
                if match:
                    filtered_jobs.append(job)  # 添加匹配的职位到结果列表
            return filtered_jobs  # 返回筛选结果
    
    def add_job(self, job_data):
        """
        添加新职位
        
        Args:
            job_data (dict): 职位信息字典
            
        Returns:
            bool: 添加成功返回True，否则返回False
        """
        # 检查是否包含必要的职位ID
        if 'job_id' not in job_data:
            return False
            
        if self.use_sqlserver:
            # 向SQL Server数据库插入新职位
            columns = ', '.join(job_data.keys())  # 获取所有列名
            placeholders = ', '.join(['?' for _ in job_data.keys()])  # 创建占位符
            query = f"INSERT INTO jobs ({columns}) VALUES ({placeholders})"  # SQL插入语句
            params = tuple(job_data.values())  # 获取参数值
            return self._execute_update(query, params) > 0  # 执行更新并返回结果
        else:
            # 向内存数据添加新职位
            self.jobs[job_data['job_id']] = job_data  # 添加职位数据
            return True  # 返回True表示添加成功
    
    # 职业路径相关操作
    def get_career_path_by_id(self, path_id):
        """
        根据路径ID获取职业路径信息
        
        Args:
            path_id (str): 职业路径ID
            
        Returns:
            dict: 职业路径信息字典，如果未找到返回None
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取职业路径
            query = "SELECT * FROM career_paths WHERE path_id = ?"
            result = self._execute_query(query, (path_id,))
            return result[0] if result else None
        else:
            # 从内存数据获取职业路径
            return self.career_paths.get(path_id)
    
    def get_all_career_paths(self):
        """
        获取所有职业路径信息
        
        Returns:
            list: 所有职业路径信息的列表
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取所有职业路径
            query = "SELECT * FROM career_paths"
            return self._execute_query(query)
        else:
            # 从内存数据获取所有职业路径
            return list(self.career_paths.values())
    
    # 课程相关操作
    def get_course_by_id(self, course_id):
        """
        根据课程ID获取课程信息
        
        Args:
            course_id (str): 课程ID
            
        Returns:
            dict: 课程信息字典，如果未找到返回None
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取课程
            query = "SELECT * FROM courses WHERE course_id = ?"
            result = self._execute_query(query, (course_id,))
            return result[0] if result else None
        else:
            # 从内存数据获取课程
            return self.courses.get(course_id)
    
    def get_all_courses(self):
        """
        获取所有课程信息
        
        Returns:
            list: 所有课程信息的列表
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取所有课程
            query = "SELECT * FROM courses"
            return self._execute_query(query)
        else:
            # 从内存数据获取所有课程
            return list(self.courses.values())
    
    def get_courses_by_category(self, category):
        """
        根据类别获取课程
        
        Args:
            category (str): 课程类别
            
        Returns:
            list: 指定类别下的课程列表
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取指定类别的课程
            query = "SELECT * FROM courses WHERE category = ?"
            return self._execute_query(query, (category,))
        else:
            # 从内存数据获取指定类别的课程
            courses_in_category = []
            for course in self.courses.values():
                if course.get('category') == category:
                    courses_in_category.append(course)
            return courses_in_category

    # 用户认证相关操作
    def get_user_by_username(self, username):
        """
        根据用户名获取用户信息

        Args:
            username (str): 用户名

        Returns:
            dict: 用户信息字典，如果未找到返回None
        """
        if self.use_sqlserver:
            # 从SQL Server数据库获取用户
            query = "SELECT * FROM users WHERE username = ?"
            result = self._execute_query(query, (username,))
            return result[0] if result else None
        else:
            # 从内存数据中查找用户
            for user_id, user in self.users.items():
                if user.get('username') == username:
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
            query = "SELECT * FROM users WHERE user_id = ?"
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

        if self.use_sqlserver:
            # 向SQL Server数据库插入新用户
            query = """
            INSERT INTO users (user_id, username, password, email, student_id, created_at, last_login) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """
            params = (
                user_data['user_id'],
                user_data['username'],
                user_data['password'],
                user_data.get('email'),
                user_data.get('student_id'),
                user_data['created_at'],
                user_data.get('last_login')
            )
            return self._execute_update(query, params) > 0
        else:
            # 向内存数据添加新用户
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
            query = "UPDATE users SET last_login = ? WHERE user_id = ?"
            return self._execute_update(query, (current_time, user_id)) > 0
        else:
            # 更新内存数据中的用户最后登录时间
            if user_id not in self.users:
                return False
            self.users[user_id]['last_login'] = current_time
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
            query = "UPDATE users SET password = ? WHERE user_id = ?"
            return self._execute_update(query, (new_password_hash, user_id)) > 0
        else:
            # 更新内存数据中的用户密码
            if user_id not in self.users:
                return False
            self.users[user_id]['password'] = new_password_hash
            return True

    def close_connection(self):
        """关闭数据库连接"""
        if self.use_sqlserver:
            # 如果使用的是SQL Server，关闭游标和连接
            self.cursor.close()
            self.connection.close()


# 全局数据库实例
db = DatabaseInterface()


def get_database(host='localhost', user='sa', password='', database='career_recommendation'):
    
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