import json
import urllib.request
import urllib.error

BASE = 'http://localhost:5000'

headers = {'Content-Type': 'application/json'}

def post(path, data):
    req = urllib.request.Request(BASE + path, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.read().decode()
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode()
        except Exception:
            body = str(e)
        return f'HTTPError {e.code}: {body}'
    except Exception as e:
        return f'ERROR: {e}'


# 注册
reg_data = {
    'username': 'testuser+bot@example.com',
    'password': 'TestPass123',
    'email': 'testuser+bot@example.com',
    'student_id': 'S1001'
}
print('REGISTER RESPONSE:')
print(post('/api/auth/register', reg_data))

# 登录
login_data = {
    'username': 'testuser+bot@example.com',
    'password': 'TestPass123'
}
print('\nLOGIN RESPONSE:')
print(post('/api/auth/login', login_data))
