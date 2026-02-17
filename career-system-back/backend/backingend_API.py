# 后端API设计

from internship_recommender import InternshipRecommendationSystem
from course_recommender import CourseRecommendationSystem, analyze_skill_gap
from career_path_planning import CareerPathPlanner
from sample_data import (
    get_student_profile, get_filtered_jobs, get_jobs_by_ids,
    get_course_catalog, CAREER_PATHS_DATABASE
)

try:
    from flask import Flask, jsonify, request
    import jwt
    import datetime
    from functools import wraps
    import hashlib
    import uuid
    from flask_cors import CORS
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    print("警告: Flask未安装，API功能不可用。请运行: pip install flask flask-cors pyjwt")

def hash_password(password):
    """对密码进行哈希处理"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password, hashed_password):
    """验证密码是否匹配哈希值"""
    return hash_password(plain_password) == hashed_password

def get_student_id_from_user(user_id):
    """根据用户ID获取关联的学生ID"""
    from database_interface import db
    user = db.get_user_by_id(user_id)
    if user:
        return user.get('student_id')
    return None

if FLASK_AVAILABLE:
    app = Flask(__name__)
    CORS(app)
    # 设置JWT密钥
    app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'  # JWT加密密钥，生产环境中应更换为安全密钥

    # 初始化推荐系统
    internship_recommender = InternshipRecommendationSystem()
    course_recommender = CourseRecommendationSystem()
    career_planner = CareerPathPlanner(CAREER_PATHS_DATABASE)

    # 用户认证装饰器
    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token:
                return jsonify({'success': False, 'error': '未提供认证令牌'}), 401
            
            # 移除 "Bearer " 前缀
            if token.startswith('Bearer '):
                token = token[7:]
            
            try:
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
                current_user_id = data['user_id']
            except jwt.ExpiredSignatureError:
                return jsonify({'success': False, 'error': '令牌已过期'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'success': False, 'error': '无效的令牌'}), 401
            
            return f(current_user_id, *args, **kwargs)
        return decorated

    @app.route('/api/auth/register', methods=['POST'])
    def register_user():
        """
        用户注册
        注册新用户账户
        """
        try:
            data = request.json
            username = data.get('username')
            password = data.get('password')
            email = data.get('email')
            student_id = data.get('student_id')  # 关联学生档案ID
            
            if not username or not password:
                return jsonify({
                    'success': False,
                    'error': '用户名和密码不能为空'
                }), 400
            
            # 检查用户是否已存在
            from database_interface import db
            if db.get_user_by_username(username):
                return jsonify({
                    'success': False,
                    'error': '用户名已存在'
                }), 409
            
            # 创建新用户
            user_data = {
                'username': username,
                'password': hash_password(password),  # 密码哈希
                'email': email,
                'student_id': student_id,
                'created_at': datetime.datetime.now(),
                'last_login': None
            }
            
            if db.add_user(user_data):
                return jsonify({
                    'success': True,
                    'message': '用户注册成功'
                })
            else:
                return jsonify({
                    'success': False,
                    'error': '注册失败'
                }), 500
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    @app.route('/api/auth/login', methods=['POST'])
    def login_user():
        """
        用户登录
        生成JWT令牌用于后续认证
        """
        try:
            data = request.json
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return jsonify({
                    'success': False,
                    'error': '用户名和密码不能为空'
                }), 400
            
            from database_interface import db
            # 从数据库获取用户信息
            user = db.get_user_by_username(username)
            if not user or not verify_password(password, user.get('password')):
                return jsonify({
                    'success': False,
                    'error': '用户名或密码错误'
                }), 401
            
            # 更新最后登录时间
            user_id = user.get('user_id')
            db.update_user_last_login(user_id)
            
            # 生成JWT令牌
            token = jwt.encode({
                'user_id': user_id,
                'username': username,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)  # 令牌有效期24小时
            }, app.config['SECRET_KEY'], algorithm="HS256")
            
            return jsonify({
                'success': True,
                'token': token,
                'user': {
                    'user_id': user_id,
                    'username': username,
                    'student_id': user.get('student_id')
                }
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    @app.route('/api/auth/profile', methods=['GET'])
    @token_required
    def get_user_profile(current_user_id):
        """
        获取用户个人信息
        需要有效的JWT令牌
        """
        try:
            from database_interface import db
            user = db.get_user_by_id(current_user_id)
            if not user:
                return jsonify({
                    'success': False,
                    'error': '用户不存在'
                }), 404
            
            # 不返回密码等敏感信息
            profile = {
                'user_id': user.get('user_id'),
                'username': user.get('username'),
                'email': user.get('email'),
                'student_id': user.get('student_id'),
                'created_at': user.get('created_at'),
                'last_login': user.get('last_login')
            }
            
            return jsonify({
                'success': True,
                'data': profile
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    @app.route('/api/auth/change-password', methods=['POST'])
    @token_required
    def change_password(current_user_id):
        """
        修改用户密码
        需要有效的JWT令牌
        """
        try:
            data = request.json
            old_password = data.get('old_password')
            new_password = data.get('new_password')
            
            if not old_password or not new_password:
                return jsonify({
                    'success': False,
                    'error': '原密码和新密码不能为空'
                }), 400
            
            from database_interface import db
            user = db.get_user_by_id(current_user_id)
            if not user or not verify_password(old_password, user.get('password')):
                return jsonify({
                    'success': False,
                    'error': '原密码错误'
                }), 401
            
            # 更新密码
            hashed_new_password = hash_password(new_password)
            if db.update_user_password(current_user_id, hashed_new_password):
                return jsonify({
                    'success': True,
                    'message': '密码修改成功'
                })
            else:
                return jsonify({
                    'success': False,
                    'error': '密码修改失败'
                }), 500
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    @app.route('/api/recommendations/internships', methods=['POST'])
    @token_required
    def get_internship_recommendations(current_user_id):
        """
        获取实习岗位推荐
        需要有效的JWT令牌
        """
        try:
            # 解析请求数据
            data = request.json
            student_id = data.get('student_id') or get_student_id_from_user(current_user_id)  # 优先使用传入的学生ID，否则从用户信息获取
            filters = data.get('filters', {})
            top_n = data.get('top_n', 10)
            min_score = filters.get('min_match_score', 0)
            
            # 获取学生画像
            student = get_student_profile(student_id)
            if not student:
                return jsonify({
                    'success': False,
                    'error': f'学生ID {student_id} 不存在'
                }), 404
            
            # 获取岗位列表（应用筛选条件）
            jobs = get_filtered_jobs(filters)
            
            # 生成推荐
            recommendations = internship_recommender.recommend_internships(
                student, jobs, top_n, min_score=min_score
            )
            
            return jsonify({
                'success': True,
                'data': recommendations
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    @app.route('/api/recommendations/courses', methods=['POST'])
    @token_required
    def get_course_recommendations(current_user_id):
        """
        获取课程推荐
        
        Request Body:
        {
            "student_id": "2024001",
            "target_jobs": ["J2024001", "J2024002"],
            "top_n": 5
        }
        """
        try:
            data = request.json
            student_id = data.get('student_id') or get_student_id_from_user(current_user_id)  # 优先使用传入的学生ID，否则从用户信息获取
            target_job_ids = data.get('target_jobs', [])
            top_n = data.get('top_n', 5)
            
            student = get_student_profile(student_id)
            if not student:
                return jsonify({
                    'success': False,
                    'error': f'学生ID {student_id} 不存在'
                }), 404
            
            target_jobs = get_jobs_by_ids(target_job_ids)
            
            # 分析技能缺口
            skill_gaps = analyze_skill_gap(student, target_jobs)
            
            # 推荐课程
            course_catalog = get_course_catalog()
            recommendations = course_recommender.recommend_courses(
                student, skill_gaps, course_catalog, top_n
            )
            
            return jsonify({
                'success': True,
                'data': {
                    'skill_gaps': skill_gaps,
                    'course_recommendations': recommendations
                }
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    @app.route('/api/recommendations/career-paths', methods=['POST'])
    @token_required
    def get_career_path_recommendations(current_user_id):
        """
        获取职业发展路径推荐

        Args:
            student_id (str): 学生唯一标识符
            top_n (int, optional): 返回的职业发展路径数量，默认为3
            
        Returns:
            JSON response containing:
                - success (bool): 请求是否成功
                - data (list): 职业发展路径推荐列表
                或
                - success (bool): 请求是否成功
                - error (str): 错误信息
                
        HTTP Status Codes:
            200: 成功返回推荐结果
            404: 学生ID不存在
            500: 服务器内部错误
        """
        try:
            data = request.json
            student_id = data.get('student_id') or get_student_id_from_user(current_user_id)  # 优先使用传入的学生ID，否则从用户信息获取
            top_n = data.get('top_n', 3)
            
             # 获取学生档案信息
            student = get_student_profile(student_id)
            if not student:
                return jsonify({
                    'success': False,
                    'error': f'学生ID {student_id} 不存在'
                }), 404
            
             # 生成职业发展路径推荐
            recommendations = career_planner.recommend_career_paths(student, top_n)
            
            return jsonify({
                'success': True,
                'data': recommendations
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500


    # -----------------
    # 计划模块（内存实现，供前端开发使用）
    # -----------------
    # 简单内存存储结构
    PLAN_STORAGE = {
        'daily': [],  # list of {date, tasks: [{id, title, completed, ...}]}
        'weekly': {}, # weekId -> weekly plan
        'tasks': {}   # taskId -> task
    }

    # 初始化示例数据
    import time
    def _init_plan_sample():
        today = datetime.date.today()
        # 创建最近3天的日计划
        for i in range(3):
            d = (today - datetime.timedelta(days=i)).isoformat()
            tasks = []
            for j in range(2):
                tid = str(uuid.uuid4())
                task = {
                    'id': tid,
                    'title': f'示例任务 {i+1}-{j+1}',
                    'completed': False,
                    'date': d,
                    'notes': ''
                }
                tasks.append(task)
                PLAN_STORAGE['tasks'][tid] = task
            PLAN_STORAGE['daily'].append({'date': d, 'tasks': tasks})

        # 简单周计划
        week_id = f'wk-{int(time.time())}'
        PLAN_STORAGE['weekly'][week_id] = {
            'week_id': week_id,
            'start_date': (today - datetime.timedelta(days=today.weekday())).isoformat(),
            'end_date': (today + datetime.timedelta(days=6-today.weekday())).isoformat(),
            'tasks': list(PLAN_STORAGE['tasks'].values())
        }

    _init_plan_sample()

    @app.route('/api/plan/daily', methods=['GET'])
    @token_required
    def api_get_recent_daily(current_user_id):
        try:
            days = int(request.args.get('days', 3))
            # 返回最近 days 天的日计划
            data = PLAN_STORAGE['daily'][:days]
            return jsonify({'success': True, 'data': data})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/plan/weekly', methods=['GET'])
    @token_required
    def api_get_weekly(current_user_id):
        try:
            week_id = request.args.get('weekId')
            if week_id:
                plan = PLAN_STORAGE['weekly'].get(week_id)
            else:
                # 返回最近的周计划
                plan = next(iter(PLAN_STORAGE['weekly'].values()))
            if not plan:
                return jsonify({'success': False, 'error': '未找到周计划'}), 404
            return jsonify({'success': True, 'data': plan})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/plan/stats', methods=['GET'])
    @token_required
    def api_get_plan_stats(current_user_id):
        try:
            total_tasks = len(PLAN_STORAGE['tasks'])
            completed = sum(1 for t in PLAN_STORAGE['tasks'].values() if t.get('completed'))
            stats = {'total_tasks': total_tasks, 'completed': completed}
            return jsonify({'success': True, 'data': stats})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/plan/tasks', methods=['POST'])
    @token_required
    def api_create_task(current_user_id):
        try:
            data = request.json or {}
            title = data.get('title') or '新任务'
            date = data.get('date') or datetime.date.today().isoformat()
            tid = str(uuid.uuid4())
            task = {'id': tid, 'title': title, 'completed': False, 'date': date, 'notes': data.get('notes', '')}
            PLAN_STORAGE['tasks'][tid] = task
            # 添加到对应日计划
            for day in PLAN_STORAGE['daily']:
                if day['date'] == date:
                    day['tasks'].append(task)
                    break
            else:
                PLAN_STORAGE['daily'].insert(0, {'date': date, 'tasks': [task]})
            return jsonify({'success': True, 'data': task}), 201
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/plan/tasks/<task_id>/status', methods=['POST'])
    @token_required
    def api_update_task_status(current_user_id, task_id):
        try:
            data = request.json or {}
            completed = bool(data.get('completed'))
            task = PLAN_STORAGE['tasks'].get(task_id)
            if not task:
                return jsonify({'success': False, 'error': '任务未找到'}), 404
            task['completed'] = completed
            return jsonify({'success': True, 'data': task})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/plan/tasks/<task_id>', methods=['DELETE'])
    @token_required
    def api_delete_task(current_user_id, task_id):
        try:
            task = PLAN_STORAGE['tasks'].pop(task_id, None)
            if not task:
                return jsonify({'success': False, 'error': '任务未找到'}), 404
            # 从日计划中移除
            for day in PLAN_STORAGE['daily']:
                day['tasks'] = [t for t in day['tasks'] if t.get('id') != task_id]
            return jsonify({'success': True, 'message': '已删除'})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    if FLASK_AVAILABLE:
        print("启动API服务器在 http://localhost:5000")
        app.run(debug=True, port=5000)
    else:
        print("Flask未安装，无法启动API服务器")
        print("请安装依赖: pip install flask flask-cors pyjwt")