import os
import requests
from dotenv import load_dotenv

load_dotenv('.env')
key = os.getenv('DASHSCOPE_API_KEY')
endpoint = os.getenv('DASHSCOPE_ENDPOINT')

prompt = '''请为以下职业推荐生成详细的推荐理由：

职业名称：人工智能工程师
匹配度：82.5%
霍兰德代码：I,R,C
平均薪资：20K-40K/月
发展前景：很高
学历要求：硕士及以上
典型雇主：头部 AI 公司, 科研院所, 大型互联网企业

请从以下几个方面分析：
1. 为什么这个职业适合该学生（结合霍兰德代码和兴趣匹配）
2. 职业发展优势和前景
3. 薪资水平和增长空间
4. 需要重点提升的技能
5. 具体的发展建议

请用中文回答，语气专业且鼓励性。'''

headers = {
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json'
}
payload = {
    'model': 'qwen-max',
    'input': {
        'messages': [
            {'role': 'user', 'content': prompt}
        ]
    },
    'parameters': {
        'max_tokens': 256,
        'temperature': 0.7,
        'result_format': 'message'
    }
}

try:
    r = requests.post(endpoint, headers=headers, json=payload, timeout=30)
    print('status', r.status_code)
    print('text', r.text[:2000])
    try:
        j = r.json()
        print('json keys', list(j.keys()))
        print('output', j.get('output'))
        if j.get('output') and isinstance(j['output'], dict):
            print('choices', j['output'].get('choices'))
    except Exception as e:
        print('json parse error', e)
except Exception as e:
    print('ERROR', type(e).__name__, e)
