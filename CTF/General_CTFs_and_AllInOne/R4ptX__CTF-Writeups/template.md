**Writeup Author**: [Your Name or Handle, optional]

## Description
[Provide the challenge description as given in the CTF, or summarize it. Include any provided files or links, e.g., `challenge.zip` or `http://challenge.ctf.com`.]

## Solution
[Explain the step-by-step process to solve the challenge. Be clear and concise, focusing on key insights, techniques, or tools used. For example:
- Identified an XSS vulnerability in the input field.
- Used Burp Suite to intercept and modify the request.
- Crafted a payload to bypass WAF.]

## Exploit
[Include the exploit code, script, or payload. Specify the language in the code block for syntax highlighting. For example:]
```python
# exploit.py
import requests

url = "http://challenge.ctf.com/vuln"
payload = "<script>alert('xss')</script>"
requests.post(url, data={"input": payload})
```

[If no code is needed, describe the manual exploit steps or commands, e.g., SQLi query or HTTP request smuggling technique.]

## Flag
```
[flag, e.g., flag{example_flag_here}]
```
