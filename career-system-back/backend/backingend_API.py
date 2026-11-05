# 后端API设计

from internship_recommender import InternshipRecommendationSystem
from course_recommender import CourseRecommendationSystem, analyze_skill_gap
from career_path_planning import CareerPathPlanner
from sample_data import (
    get_student_profile, get_filtered_jobs, get_jobs_by_ids,
    get_course_catalog, CAREER_PATHS_DATABASE
)
import logging
import os
import json
import requests
from dotenv import load_dotenv

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
        print("警告：flask-cors 未安装，请运行：pip install flask-cors")
        raise
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    print("警告：Flask 未安装，API 功能不可用。请运行：pip install flask flask-cors pyjwt")

# 加载环境变量
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

# 导入数据库接口
from database_interface import db

# 内存模式下推荐的默认学生ID（当登录用户未关联学生档案时兜底使用样本学生）
DEFAULT_STUDENT_ID = '2024001'

# 内存模式下的业务存储：key 均为 user_id
# 说明：任务与保存的规划已迁移至数据库（database_interface），以下变量仅作兼容保留
MEM_TASKS = {}  # user_id -> [任务 dict]
MEM_PLANS = {}  # user_id -> [已保存的职业规划 list]

def hash_password(password):
    """对密码进行哈希处理"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password, hashed_password):
    """验证密码是否匹配哈希值"""
    return hash_password(plain_password) == hashed_password

def get_student_id_from_user(user_id):
    """根据用户 ID 获取关联的学生 ID"""
    user = db.get_user_by_id(user_id)
    if user:
        return user.get('student_id')
    return None


def resolve_student_id(data, current_user_id):
    """解析学生ID：优先请求体传入，其次用户关联的学生ID，最后兜底默认样本学生（内存模式保证功能可用）"""
    return data.get('student_id') or get_student_id_from_user(current_user_id) or DEFAULT_STUDENT_ID

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


def _generate_fallback_ai_reply(user_message: str) -> str:
    """当外部 AI 服务不可用时，生成一个简短兜底推荐理由。"""
    path_name = '该职业'
    fit_score = ''
    holland_codes = ''
    average_salary = ''
    growth_potential = ''
    required_education = ''
    typical_companies = ''

    for line in user_message.splitlines():
        if line.startswith('职业名称：'):
            path_name = line.split('：', 1)[1].strip()
        elif line.startswith('匹配度：'):
            fit_score = line.split('：', 1)[1].strip()
        elif line.startswith('霍兰德代码：'):
            holland_codes = line.split('：', 1)[1].strip()
        elif line.startswith('平均薪资：'):
            average_salary = line.split('：', 1)[1].strip()
        elif line.startswith('发展前景：'):
            growth_potential = line.split('：', 1)[1].strip()
        elif line.startswith('学历要求：'):
            required_education = line.split('：', 1)[1].strip()
        elif line.startswith('典型雇主：'):
            typical_companies = line.split('：', 1)[1].strip()

    return (
        f"当前AI服务暂时不可用，以下为基于已有路径信息的推荐理由：\n\n"
        f"职业名称：{path_name}\n"
        f"匹配度：{fit_score}\n"
        f"霍兰德代码：{holland_codes}\n"
        f"平均薪资：{average_salary}\n"
        f"发展前景：{growth_potential}\n"
        f"学历要求：{required_education}\n"
        f"典型雇主：{typical_companies}\n\n"
        "推荐理由：该职业与您的兴趣和能力倾向具有较好契合，建议继续加强核心技能和项目经验，尤其是与霍兰德代码相匹配的方向。"
    )


def _extract_ai_reply(result):
    """从通义千问响应中提取 AI 回复内容。"""
    if not result:
        return None

    output = result.get('output')
    if isinstance(output, dict):
        choices = output.get('choices')
        if choices and isinstance(choices, list):
            first_choice = choices[0]
            if isinstance(first_choice, dict):
                message = first_choice.get('message')
                if isinstance(message, dict):
                    content = message.get('content')
                    if isinstance(content, str):
                        return content
                content = first_choice.get('content')
                if isinstance(content, str):
                    return content
    elif isinstance(output, list):
        first_item = output[0] if output else None
        if isinstance(first_item, dict):
            content_section = first_item.get('content')
            if isinstance(content_section, list) and len(content_section) > 0:
                text = content_section[0].get('text')
                if isinstance(text, str):
                    return text
            if isinstance(content_section, str):
                return content_section
            if isinstance(first_item.get('message'), dict):
                content = first_item['message'].get('content')
                if isinstance(content, str):
                    return content

    # 兼容其他常见输出字段
    if isinstance(result.get('text'), str):
        return result.get('text')
    if isinstance(result.get('reply'), str):
        return result.get('reply')
    if isinstance(result.get('content'), str):
        return result.get('content')
    
    # 最后尝试解析为纯字符串
    if isinstance(output, str):
        return output
    return None


if FLASK_AVAILABLE:
    app = Flask(__name__)
    CORS(app)
    # 设置 JWT 密钥
    app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
    
    # 确保 JSON 响应使用 UTF-8 编码
    app.config['JSON_AS_ASCII'] = False

    # 初始化推荐系统
    internship_recommender = InternshipRecommendationSystem()
    course_recommender = CourseRecommendationSystem()
    career_planner = CareerPathPlanner(CAREER_PATHS_DATABASE)

    # 通义千问 AI 配置
    DASHSCOPE_API_KEY = os.getenv('DASHSCOPE_API_KEY')
    DASHSCOPE_ENDPOINT = os.getenv('DASHSCOPE_ENDPOINT', 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation')
    # 用户认证装饰器
    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token:
                logger.warning("Missing authorization token")
                return jsonify({'success': False, 'error': '未提供认证令牌'}), 401
            
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
            'message': 'API 服务运行正常',
            'timestamp': datetime.datetime.now().isoformat()
        })

    @app.route('/api/ai/chat', methods=['POST'])
    @log_request
    def ai_chat():
        """
        通义千问 AI 对话接口
        Request Body:
        {
            "message": "如何做职业规划？",
            "context": []
        }
        """
        try:
            data = request.json
            if not data:
                return jsonify({
                    'success': False,
                    'error': '请求体不能为空'
                }), 400
            
            user_message = data.get('message', '')
            context = data.get('context', [])
            
            if not user_message:
                return jsonify({
                    'success': False,
                    'error': '消息内容不能为空'
                }), 400
            
            messages = context.copy()
            messages.append({"role": "user", "content": user_message})
            
            if not DASHSCOPE_API_KEY:
                logger.warning("未配置通义千问 API密钥，使用兜底回复")
                fallback_reply = _generate_fallback_ai_reply(user_message)
                return jsonify({
                    'success': True,
                    'data': {
                        'reply': fallback_reply,
                        'model': 'fallback',
                        'usage': {}
                    }
                })
            
            headers = {
                'Authorization': f'Bearer {DASHSCOPE_API_KEY}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                "model": "qwen-max",
                "input": {
                    "messages": messages
                },
                "parameters": {
                    "max_tokens": 1024,
                    "temperature": 0.7,
                    "result_format": "message"
                }
            }
            
            logger.info(f"Calling Qwen API with message: {user_message}")
            
            response = requests.post(
                DASHSCOPE_ENDPOINT,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            logger.info(f"Qwen API raw response: {json.dumps(result, ensure_ascii=False)[:1200]}")
            
            ai_reply = _extract_ai_reply(result)
            if ai_reply:
                logger.info(f"AI reply generated: {ai_reply[:100]}...")
                return jsonify({
                    'success': True,
                    'data': {
                        'reply': ai_reply,
                        'model': 'qwen-max',
                        'usage': result.get('usage', {})
                    }
                })
            else:
                logger.error(f"Invalid response from Qwen API: {json.dumps(result, ensure_ascii=False)[:1200]}")
                fallback_reply = _generate_fallback_ai_reply(user_message)
                return jsonify({
                    'success': True,
                    'data': {
                        'reply': fallback_reply,
                        'model': 'fallback',
                        'usage': {}
                    }
                })
                
        except requests.exceptions.Timeout:
            logger.error("AI request timeout")
            fallback_reply = _generate_fallback_ai_reply(user_message)
            return jsonify({
                'success': True,
                'data': {
                    'reply': fallback_reply,
                    'model': 'fallback',
                    'usage': {}
                }
            })
        except requests.exceptions.RequestException as e:
            logger.error(f"AI request failed: {str(e)}")
            fallback_reply = _generate_fallback_ai_reply(user_message)
            return jsonify({
                'success': True,
                'data': {
                    'reply': fallback_reply,
                    'model': 'fallback',
                    'usage': {}
                }
            })
        except Exception as e:
            logger.error(f"AI chat error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    @app.route('/api/ai/career-advice', methods=['POST'])
    @token_required
    @log_request
    def ai_career_advice(current_user_id):
        """
        基于用户画像的 AI 职业建议（需要登录）
        Request Body:
        {
            "question": "我适合什么工作？",
            "student_id": "2024001"
        }
        """
        try:
            data = request.json
            if not data:
                return jsonify({
                    'success': False,
                    'error': '请求体不能为空'
                }), 400
            
            student_id = resolve_student_id(data, current_user_id)
            question = data.get('question', '')
            
            if not student_id:
                return jsonify({
                    'success': False,
                    'error': '未找到学生信息'
                }), 400
            
            student = get_student_profile(student_id)
            if not student:
                return jsonify({
                    'success': False,
                    'error': f'学生 ID {student_id} 不存在'
                }), 404
            
            system_prompt = f"""你是一位专业的职业规划顾问。请根据以下学生信息提供职业建议：
- 专业：{student.get('major', '未知')}
- 年级：{student.get('grade', '未知')}
- 技能：{', '.join(student.get('skills', []))}
- 兴趣：{', '.join(student.get('interests', []))}
- 价值观：{', '.join(student.get('values', []))}

学生的问题是：{question}

请用专业、鼓励的语气给出具体建议。"""
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ]
            
            headers = {
                'Authorization': f'Bearer {DASHSCOPE_API_KEY}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                "model": "qwen-max",
                "input": {
                    "messages": messages
                },
                "parameters": {
                    "max_tokens": 1024,
                    "temperature": 0.7,
                    "result_format": "message"
                }
            }
            
            response = requests.post(
                DASHSCOPE_ENDPOINT,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
            if result.get('output') and result['output'].get('choices'):
                ai_reply = result['output']['choices'][0]['message']['content']
                
                return jsonify({
                    'success': True,
                    'data': {
                        'reply': ai_reply,
                        'student_profile': {
                            'major': student.get('major'),
                            'grade': student.get('grade'),
                            'skills_count': len(student.get('skills', []))
                        }
                    }
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'AI 服务返回格式异常'
                }), 500
                
        except Exception as e:
            logger.error(f"AI career advice error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

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
            
            # 创建新用户，使用与数据库接口一致的字段名
            user_data = {
                'user_name': username,
                'password_hash': hash_password(password),
                'user_email': email,
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
            
            # 从数据库获取用户信息，支持用户名或邮箱登录
            user = db.get_user_by_username(username)
            if not user:
                user = db.get_user_by_email(username)
            # 支持旧字段和新字段名称
            stored_hash = None
            if user:
                stored_hash = user.get('password_hash') or user.get('password')
            if not user or not verify_password(password, stored_hash):
                logger.warning(f"Invalid login attempt for user/email: {username}")
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
                'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
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
                
            student_id = resolve_student_id(data, current_user_id)
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
                
            student_id = resolve_student_id(data, current_user_id)
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
                
            student_id = resolve_student_id(data, current_user_id)
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

    # ==================== 用户资料与认证补充接口 ====================

    @app.route('/api/auth/profile', methods=['GET'])
    @token_required
    def get_profile(current_user_id):
        """获取当前登录用户的资料"""
        try:
            user = db.get_user_by_id(current_user_id)
            if not user:
                return jsonify({
                    'success': False,
                    'error': '用户不存在'
                }), 404
            return jsonify({
                'success': True,
                'data': {
                    'user_id': user.get('user_id'),
                    'username': user.get('user_name') or user.get('username'),
                    'email': user.get('user_email') or user.get('email'),
                    'student_id': user.get('student_id')
                }
            })
        except Exception as e:
            logger.error(f"Get profile error: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/auth/verification-code', methods=['POST'])
    def send_verification_code():
        """发送验证码（内存模式模拟发送）"""
        try:
            data = request.json or {}
            email = data.get('email', '')
            if not email:
                return jsonify({'success': False, 'message': '邮箱不能为空'}), 400
            # 内存模式无邮件服务，模拟成功
            return jsonify({'success': True, 'message': '验证码已发送至您的邮箱（演示环境验证码：123456）'})
        except Exception as e:
            logger.error(f"Send verification code error: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/api/auth/forgot-password', methods=['POST'])
    def forgot_password():
        """忘记密码：发送重置邮件（内存模式模拟）"""
        try:
            data = request.json or {}
            email = data.get('email', '')
            if not email:
                return jsonify({'success': False, 'message': '邮箱不能为空'}), 400
            user = db.get_user_by_email(email)
            if not user:
                # 不暴露用户是否存在，统一返回成功提示
                return jsonify({'success': True, 'message': '如果该邮箱已注册，重置邮件已发送'})
            return jsonify({'success': True, 'message': '重置邮件已发送至您的邮箱（演示环境请使用验证码：123456）'})
        except Exception as e:
            logger.error(f"Forgot password error: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/api/auth/reset-password', methods=['POST'])
    def reset_password():
        """重置密码：校验令牌后更新密码（内存模式模拟令牌校验）"""
        try:
            data = request.json or {}
            token = data.get('token', '')
            new_password = data.get('newPassword', '')
            email = data.get('email', '')
            if not token or not new_password:
                return jsonify({'success': False, 'message': '令牌和新密码不能为空'}), 400
            # 定位用户：优先邮箱，其次演示环境直接尝试查找第一个用户
            user = db.get_user_by_email(email) if email else None
            if user is None and not email:
                # 演示环境：未传邮箱时仅模拟流程成功
                return jsonify({'success': True, 'message': '密码重置成功'})
            if user is None:
                return jsonify({'success': False, 'message': '用户不存在'}), 404
            db.update_user_password(user.get('user_id'), hash_password(new_password))
            return jsonify({'success': True, 'message': '密码重置成功'})
        except Exception as e:
            logger.error(f"Reset password error: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/api/auth/social/<provider>', methods=['POST'])
    def social_login(provider):
        """社交登录（内存模式：模拟第三方登录成功并签发JWT）"""
        try:
            supported = ['wechat', 'qq', 'github', 'gitee']
            if provider not in supported:
                return jsonify({'success': False, 'message': f'暂不支持 {provider} 登录'}), 400
            mock_user_id = str(uuid.uuid4())
            mock_username = f'{provider}_user'
            token = jwt.encode({
                'user_id': mock_user_id,
                'username': mock_username,
                'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            return jsonify({
                'success': True,
                'message': f'{provider} 登录成功',
                'token': token,
                'user': {
                    'user_id': mock_user_id,
                    'username': mock_username,
                    'student_id': None
                }
            })
        except Exception as e:
            logger.error(f"Social login error: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500

    # ==================== 职业规划保存/查询接口 ====================

    @app.route('/api/career-plans', methods=['GET'])
    @token_required
    def get_career_plans(current_user_id):
        """获取当前用户保存的职业规划"""
        try:
            plans = db.get_career_plans_by_user(current_user_id)
            return jsonify({'success': True, 'data': plans})
        except Exception as e:
            logger.error(f"Get career plans error: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/career-plans', methods=['POST'])
    @token_required
    def save_career_plan(current_user_id):
        """保存职业规划"""
        try:
            data = request.json
            if not data:
                return jsonify({'success': False, 'error': '请求体不能为空'}), 400
            plan = dict(data)
            plan.setdefault('id', str(uuid.uuid4()))
            plan.setdefault('created_at', datetime.datetime.now().isoformat())
            plan['user_id'] = current_user_id
            saved = db.add_career_plan(current_user_id, plan)
            if saved is None:
                return jsonify({'success': False, 'error': '规划保存失败'}), 500
            return jsonify({'success': True, 'data': saved, 'message': '职业规划保存成功'})
        except Exception as e:
            logger.error(f"Save career plan error: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    # ==================== 计划模块接口（供前端 planService 调用） ====================

    def _get_user_tasks(user_id):
        """获取用户的全部任务列表（来自数据库）"""
        return db.get_tasks_by_user(user_id)

    @app.route('/api/plan/daily', methods=['GET'])
    @token_required
    def get_daily_plans(current_user_id):
        """获取近期日计划（按日期分组的任务列表）
        Query: days=N（默认7）
        """
        try:
            days = int(request.args.get('days', 7))
            tasks = _get_user_tasks(current_user_id)
            # 按日期分组
            by_date = {}
            for task in tasks:
                by_date.setdefault(task.get('date'), []).append(task)
            dates = sorted(by_date.keys(), reverse=True)[:days]
            result = []
            for date in dates:
                day_tasks = sorted(by_date[date], key=lambda t: (t.get('time') or ''))
                completed = sum(1 for t in day_tasks if t.get('completed'))
                total = len(day_tasks)
                result.append({
                    'date': date,
                    'tasks': day_tasks,
                    'totalTasks': total,
                    'completedTasks': completed,
                    'progress': round(completed / total * 100) if total else 0
                })
            return jsonify({'success': True, 'data': result})
        except Exception as e:
            logger.error(f"Get daily plans error: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/plan/stats', methods=['GET'])
    @token_required
    def get_plan_stats(current_user_id):
        """获取计划统计（今日/本周任务完成情况；连续打卡与学习时长在内存模式下返回演示数据）"""
        try:
            tasks = _get_user_tasks(current_user_id)
            today = datetime.date.today().isoformat()
            today_tasks = [t for t in tasks if t.get('date') == today]
            daily_total = len(today_tasks)
            daily_completed = sum(1 for t in today_tasks if t.get('completed'))

            # 本周（周一至周日）
            now = datetime.date.today()
            monday = now - datetime.timedelta(days=now.weekday())
            sunday = monday + datetime.timedelta(days=6)
            week_tasks = [t for t in tasks if monday.isoformat() <= (t.get('date') or '') <= sunday.isoformat()]
            week_total = len(week_tasks)
            week_completed = sum(1 for t in week_tasks if t.get('completed'))

            return jsonify({
                'success': True,
                'data': {
                    'daily': {
                        'completed': daily_completed,
                        'total': daily_total,
                        'progress': round(daily_completed / daily_total * 100) if daily_total else 0
                    },
                    'weekly': {
                        'completed': week_completed,
                        'total': week_total,
                        'progress': round(week_completed / week_total * 100) if week_total else 0
                    },
                    # 内存模式无历史数据，以下为演示值，保证仪表盘展示不退化
                    'streakDays': 7,
                    'totalStudyHours': 36,
                    'weeklyStudyHours': 36.0
                }
            })
        except Exception as e:
            logger.error(f"Get plan stats error: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/plan/weekly', methods=['GET'])
    @token_required
    def get_weekly_plan(current_user_id):
        """获取周计划（Query: weekId 可选）"""
        try:
            tasks = _get_user_tasks(current_user_id)
            now = datetime.date.today()
            monday = now - datetime.timedelta(days=now.weekday())
            sunday = monday + datetime.timedelta(days=6)
            week_number = now.isocalendar()[1]
            week_tasks = [t for t in tasks if monday.isoformat() <= (t.get('date') or '') <= sunday.isoformat()]
            total = len(week_tasks)
            completed = sum(1 for t in week_tasks if t.get('completed'))
            week_id = request.args.get('weekId') or f"{now.year}-W{week_number:02d}"
            return jsonify({
                'success': True,
                'data': {
                    'id': week_id,
                    'year': now.year,
                    'weekNumber': week_number,
                    'startDate': monday.isoformat(),
                    'endDate': sunday.isoformat(),
                    'weeklyGoal': '本周计划目标',
                    'nextWeekPreview': '',
                    'tasks': week_tasks,
                    'progress': round(completed / total * 100) if total else 0,
                    'completedTasks': completed,
                    'totalTasks': total,
                    'focusHours': 0,
                    'totalHours': 0
                }
            })
        except Exception as e:
            logger.error(f"Get weekly plan error: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/plan/tasks', methods=['POST'])
    @token_required
    def create_task(current_user_id):
        """创建任务（持久化到数据库）"""
        try:
            data = request.json
            if not data or not data.get('title'):
                return jsonify({'success': False, 'error': '任务标题不能为空'}), 400
            task = {
                'id': str(uuid.uuid4()),
                'title': data.get('title'),
                'description': data.get('description', ''),
                'priority': data.get('priority', 'medium'),
                'completed': bool(data.get('completed', False)),
                'category': data.get('category', '学习'),
                'date': data.get('date') or datetime.date.today().isoformat(),
                'time': data.get('time', ''),
                'createdAt': datetime.datetime.now().isoformat(),
                'updatedAt': datetime.datetime.now().isoformat()
            }
            saved = db.add_task(current_user_id, task)
            if saved is None:
                return jsonify({'success': False, 'error': '任务保存失败'}), 500
            return jsonify({'success': True, 'data': saved})
        except Exception as e:
            logger.error(f"Create task error: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/plan/tasks/<task_id>/status', methods=['POST'])
    @token_required
    def update_task_status(current_user_id, task_id):
        """更新任务完成状态"""
        try:
            data = request.json or {}
            completed = bool(data.get('completed', False))
            if db.update_task_status(current_user_id, task_id, completed):
                tasks = db.get_tasks_by_user(current_user_id)
                for task in tasks:
                    if str(task.get('id')) == str(task_id):
                        return jsonify({'success': True, 'data': task})
                return jsonify({'success': True, 'data': {'id': task_id, 'completed': completed}})
            return jsonify({'success': False, 'error': '任务不存在'}), 404
        except Exception as e:
            logger.error(f"Update task status error: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/plan/tasks/<task_id>', methods=['DELETE'])
    @token_required
    def delete_task(current_user_id, task_id):
        """删除任务（持久化删除）"""
        try:
            if db.delete_task(current_user_id, task_id):
                return jsonify({'success': True, 'message': '任务已删除'})
            return jsonify({'success': False, 'error': '任务不存在'}), 404
        except Exception as e:
            logger.error(f"Delete task error: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    if FLASK_AVAILABLE:
        logger.info("启动API服务器在 http://localhost:5000")
        app.run(debug=True, port=5000, host='0.0.0.0')
    else:
        print("Flask未安装，无法启动API服务器")
        print("请安装依赖: pip install flask flask-cors pyjwt")