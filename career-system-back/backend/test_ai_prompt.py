import requests

prompt = '''请为以下职业推荐生成详细的推荐理由：
        
职业名称：数据科学家发展路径
匹配度：85.0%
霍兰德代码：I,C
平均薪资：15K-25K/月
发展前景：高
学历要求：本科及以上
典型雇主：阿里巴巴, 腾讯, 百度

请从以下几个方面分析：
1. 为什么这个职业适合该学生（结合霍兰德代码和兴趣匹配）
2. 职业发展优势和前景
3. 薪资水平和增长空间
4. 需要重点提升的技能
5. 具体的发展建议

请用中文回答，语气专业且鼓励性。'''

response = requests.post('http://localhost:5000/api/ai/chat', json={'message': prompt, 'context': []}, timeout=30)
print('status', response.status_code)
print(response.text)
