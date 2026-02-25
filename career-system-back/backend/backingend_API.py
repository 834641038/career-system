# 后端API设计

from internship_recommender import InternshipRecommendationSystem
from course_recommender import CourseRecommendationSystem, analyze_skill_gap
from career_path_planning import CareerPathPlanner
from sample_data import (
    get_student_profile, get_filtered_jobs, get_jobs_by_ids,
    get_course_catalog, CAREER_PATHS_DATABASE
)
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

try:
    from flask import Flask, jsonify, request
    import jwt
    import datetime
    from functools import wraps
    import hashlib
    import uuid
    try:
        from flask_cors import CORS
    except ImportError:
        print("警告: flask-cors未安装，请运行: pip install flask-cors")
        raise
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

# 添加请求日志装饰器
def log_request(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        logger.info(f"Request: {request.method} {request.url}")
        logger.info(f"Headers: {dict(request.headers)}")
        if request.is_json:
            logger.info(f"Body: {request.get_json()}")
        response = f(*args, **kwargs)
        if isinstance(response, tuple):
            logger.info(f"Response: {response[1]} - {response[0].get_json() if hasattr(response[0], 'get_json') else response[0]}")
        else:
            logger.info(f"Response: {response.status_code} - {response.get_json() if hasattr(response, 'get_json') else response}")
        return response
    return decorated_function

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
                logger.warning("Missing authorization token")
                return jsonify({'success': False, 'error': '未提供认证令牌'}), 401
            
            # 移除 "Bearer " 前缀
            if token.startswith('Bearer '):
                token = token[7:]
            
            try:
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
                current_user_id = data['user_id']
                logger.info(f"User authenticated: {current_user_id}")
            except jwt.ExpiredSignatureError:
                logger.warning("Token expired")
                return jsonify({'success': False, 'error': '令牌已过期'}), 401
            except jwt.InvalidTokenError:
                logger.warning("Invalid token")
                return jsonify({'success': False, 'error': '无效的令牌'}), 401
            
            return f(current_user_id, *args, **kwargs)
        return decorated

    @app.route('/api/health', methods=['GET'])
    def health_check():
        """健康检查端点"""
        return jsonify({
            'success': True,
            'message': 'API服务运行正常',
            'timestamp': datetime.datetime.now().isoformat()
        })

    @app.route('/api/auth/register', methods=['POST'])
    @log_request
    def register_user():
        """
        用户注册
        注册新用户账户
        """
        try:
            data = request.json
            if not data:
                return jsonify({
                    'success': False,
                    'error': '请求体不能为空'
                }), 400
                
            username = data.get('username')
            password = data.get('password')
            email = data.get('email')
            student_id = data.get('student_id')
            
            if not username or not password:
                return jsonify({
                    'success': False,
                    'error': '用户名和密码不能为空'
                }), 400
            
            from database_interface import db
            # 从数据库获取用户信息
            user = db.get_user_by_student_name(username)
            if not user:
                user = db.get_user_by_email(username)  # 支持使用邮箱登录
            # 检查用户是否存在且密码正确
            if not user or not verify_password(password, user.get('password')):
                return jsonify({
                    'success': False,
                    'error': '用户名或密码错误'
                }), 401
            
            # 创建新用户
            user_data = {
                'username': username,
                'password': hash_password(password),
                'email': email,
                'student_id': student_id,
                'created_at': datetime.datetime.now(),
                'last_login': None
            }
            
            if db.add_user(user_data):
                logger.info(f"User registered successfully: {username}")
                return jsonify({
                    'success': True,
                    'message': '用户注册成功'
                })
            else:
                logger.error("Failed to register user")
                return jsonify({
                    'success': False,
                    'error': '注册失败'
                }), 500
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    @app.route('/api/auth/login', methods=['POST'])
    @log_request
    def login_user():
        """
        用户登录
        生成JWT令牌用于后续认证
        """
        try:
            data = request.json
            if not data:
                return jsonify({
                    'success': False,
                    'error': '请求体不能为空'
                }), 400
                
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
                logger.warning(f"Invalid login attempt for user: {username}")
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
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            
            logger.info(f"User logged in successfully: {username}")
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
            logger.error(f"Login error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    @app.route('/api/recommendations/career-paths', methods=['POST'])
    @token_required
    @log_request
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
        """
        try:
            data = request.json
            if not data:
                return jsonify({
                    'success': False,
                    'error': '请求体不能为空'
                }), 400
                
            student_id = data.get('student_id') or get_student_id_from_user(current_user_id)
            top_n = data.get('top_n', 3)
            
            if not student_id:
                logger.warning("No student ID provided")
                return jsonify({
                    'success': False,
                    'error': '未提供学生ID'
                }), 400
            
            # 获取学生档案信息
            student = get_student_profile(student_id)
            if not student:
                logger.warning(f"Student not found: {student_id}")
                return jsonify({
                    'success': False,
                    'error': f'学生ID {student_id} 不存在'
                }), 404
            
            logger.info(f"Generating career path recommendations for student: {student_id}")
            
            # 生成职业发展路径推荐
            recommendations = career_planner.recommend_career_paths(student, top_n)
            
            logger.info(f"Generated {len(recommendations)} career path recommendations")
            
            return jsonify({
                'success': True,
                'data': recommendations,
                'metadata': {
                    'student_id': student_id,
                    'top_n': top_n,
                    'total_results': len(recommendations)
                }
            })
        except Exception as e:
            logger.error(f"Career path recommendation error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    @app.route('/api/recommendations/internships', methods=['POST'])
    @token_required
    @log_request
    def get_internship_recommendations(current_user_id):
        """
        获取实习岗位推荐
        需要有效的JWT令牌
        """
        try:
            data = request.json
            if not data:
                return jsonify({
                    'success': False,
                    'error': '请求体不能为空'
                }), 400
                
            student_id = data.get('student_id') or get_student_id_from_user(current_user_id)
            filters = data.get('filters', {})
            top_n = data.get('top_n', 10)
            min_score = filters.get('min_match_score', 0)
            
            if not student_id:
                return jsonify({
                    'success': False,
                    'error': '未提供学生ID'
                }), 400
            
            # 获取学生画像
            student = get_student_profile(student_id)
            if not student:
                logger.warning(f"Student not found: {student_id}")
                return jsonify({
                    'success': False,
                    'error': f'学生ID {student_id} 不存在'
                }), 404
            
            # 获取岗位列表（应用筛选条件）
            jobs = get_filtered_jobs(filters)
            
            logger.info(f"Generating internship recommendations for student: {student_id}")
            
            # 生成推荐
            recommendations = internship_recommender.recommend_internships(
                student, jobs, top_n, min_score=min_score
            )
            
            logger.info(f"Generated {len(recommendations)} internship recommendations")
            
            return jsonify({
                'success': True,
                'data': recommendations,
                'metadata': {
                    'student_id': student_id,
                    'top_n': top_n,
                    'filters_applied': filters,
                    'total_results': len(recommendations)
                }
            })
        except Exception as e:
            logger.error(f"Internship recommendation error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    @app.route('/api/recommendations/courses', methods=['POST'])
    @token_required
    @log_request
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
            if not data:
                return jsonify({
                    'success': False,
                    'error': '请求体不能为空'
                }), 400
                
            student_id = data.get('student_id') or get_student_id_from_user(current_user_id)
            target_job_ids = data.get('target_jobs', [])
            top_n = data.get('top_n', 5)
            
            if not student_id:
                return jsonify({
                    'success': False,
                    'error': '未提供学生ID'
                }), 400
            
            student = get_student_profile(student_id)
            if not student:
                logger.warning(f"Student not found: {student_id}")
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
            
            logger.info(f"Generated course recommendations for student: {student_id}")
            
            return jsonify({
                'success': True,
                'data': {
                    'skill_gaps': skill_gaps,
                    'course_recommendations': recommendations
                },
                'metadata': {
                    'student_id': student_id,
                    'target_jobs_count': len(target_job_ids),
                    'skill_gaps_found': len(skill_gaps),
                    'courses_recommended': len(recommendations)
                }
            })
        except Exception as e:
            logger.error(f"Course recommendation error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    # 计划模块和其他API保持不变...
    # [此处保留原有的计划模块代码]

if __name__ == '__main__':
    if FLASK_AVAILABLE:
        logger.info("启动API服务器在 http://localhost:5000")
        app.run(debug=True, port=5000, host='0.0.0.0')
    else:
        print("Flask未安装，无法启动API服务器")
        print("请安装依赖: pip install flask flask-cors pyjwt")