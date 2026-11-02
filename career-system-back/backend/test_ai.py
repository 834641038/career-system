import os
import requests
from dotenv import load_dotenv

load_dotenv('.env')
key = os.getenv('DASHSCOPE_API_KEY')
endpoint = os.getenv('DASHSCOPE_ENDPOINT')
print('key loaded', bool(key))
print('endpoint', endpoint)
headers = {
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json'
}
payload = {
    'model': 'qwen-max',
    'input': {
        'messages': [
            {'role': 'user', 'content': '测试职业推荐理由生成'}
        ]
    },
    'parameters': {
        'max_tokens': 128,
        'temperature': 0.7,
        'result_format': 'message'
    }
}
try:
    r = requests.post(endpoint, headers=headers, json=payload, timeout=30)
    print('status', r.status_code)
    print('text', r.text[:2000])
    print('keys', list(r.json().keys()))
except Exception as e:
    print('ERROR', type(e).__name__, e)
