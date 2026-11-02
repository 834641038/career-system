import requests

for url in ['http://localhost:5000/api/health', 'http://localhost:5000/api/ai/chat']:
    try:
        if url.endswith('/chat'):
            r = requests.post(url, json={'message': '测试'} , timeout=10)
        else:
            r = requests.get(url, timeout=10)
        print('URL:', url)
        print('Status:', r.status_code)
        print('Response:', r.text[:1000])
    except Exception as e:
        print('URL:', url, 'ERROR:', type(e).__name__, e)
