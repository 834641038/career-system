import json
import urllib.request
import urllib.error

BASE = 'http://localhost:5000'
headers = {'Content-Type': 'application/json'}

def post(path, data, token=None):
    hdrs = headers.copy()
    if token:
        hdrs['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(BASE + path, data=json.dumps(data).encode('utf-8'), headers=hdrs, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.read().decode()
    except urllib.error.HTTPError as e:
        return f'HTTPError {e.code}: {e.read().decode()}'
    except Exception as e:
        return f'ERROR: {e}'

def get(path, token=None):
    hdrs = headers.copy()
    if token:
        hdrs['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(BASE + path, headers=hdrs, method='GET')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.read().decode()
    except urllib.error.HTTPError as e:
        return f'HTTPError {e.code}: {e.read().decode()}'
    except Exception as e:
        return f'ERROR: {e}'

# login using existing test user
reg_data = {'username':'testuser+bot@example.com','password':'TestPass123','email':'testuser+bot@example.com','student_id':'S1001'}
print('REGISTER:', post('/api/auth/register', reg_data))

# login
login_data = {'username':'testuser+bot@example.com','password':'TestPass123'}
print('LOGIN:', post('/api/auth/login', login_data))

# parse token
resp_text = post('/api/auth/login', login_data)
try:
    resp = json.loads(resp_text)
    token = resp.get('token')
except Exception:
    token = None

print('TOKEN:', token)

print('\nGET /api/plan/daily')
print(get('/api/plan/daily?days=3', token))

print('\nPOST /api/plan/tasks')
print(post('/api/plan/tasks', {'title':'自动添加任务','date':None}, token))

# fetch again
print('\nGET /api/plan/daily after create')
print(get('/api/plan/daily?days=3', token))
