---
status: done
created: 2026-04-13
updated: 2026-04-13
date: 2026-04-13
platform: tryhackme
room: Introduction to Flask
slug: introduction-to-flask
path: notes/10-web/introduction-to-flask.md
topic: 10-web
domain: [web, web-app-security]
skills: [python-basics, http, file-upload, input-validation, secure-by-design]
artifacts: [concept-notes, lab-notes, pattern-card]
type: resource-note
source: User-provided room text and screenshots, cross-checked with official Flask docs
next_action: Continue with Jinja2 security, Flask session handling, and secure file upload validation
---

# Introduction to Flask

## Summary

* **Flask** is a lightweight Python web framework, often described as a **microframework**.
* It is designed to make it easy to build small web applications quickly, without forcing a large project structure at the beginning.
* Flask handles core web tasks such as **routing**, **HTTP methods**, **template rendering**, and **request processing**.
* The room also shows an important security lesson: unsafe template rendering with Jinja2 can lead to **Server-Side Template Injection (SSTI)**.
* For a pentester, Flask matters because it is common in labs, prototypes, internal tools, admin dashboards, and small production services.

```text
HTTP Request
    -> Flask route
    -> Python function
    -> Response / HTML / JSON / file action
```

---

## 1. What Flask Is

Flask is a Python framework for building web applications. In practical terms, it maps URLs to Python functions and lets those functions return content such as:

* plain text
* HTML pages
* JSON responses
* redirects
* rendered templates

### Why it is called a microframework

"Micro" does **not** mean weak or toy-like. It means the core stays small.

By default Flask does not force:

* ORM / database abstraction
* form validation layer
* authentication system
* admin panel
* large default project layout

That gives developers flexibility, but it also means security quality depends heavily on implementation discipline.

---

## 2. Installation and Project Setup

The room introduces a basic local setup with Python 3 and a virtual environment.

### Typical steps

```bash
pip3 install Flask
mkdir myproject
cd myproject
python3 -m venv venv
```

### Why virtual environments matter

A **virtual environment** isolates project dependencies from the operating system and from other Python projects.

This reduces:

* package conflicts
* accidental version drift
* global environment contamination

### Historical vs current CLI note

Older tutorials often rely on setting the `FLASK_APP` environment variable. That still appears in many labs. Current official Flask documentation prefers using the `--app` CLI flag, e.g. `flask --app hello run`, while also noting shortcut behavior for files named `app.py` or `wsgi.py`.

---

## 3. Minimal Flask Application

### Minimal app example

```python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, TryHackMe!'
```

### What each line does

| Line | Meaning |
| --- | --- |
| `from flask import Flask` | imports the core Flask class |
| `app = Flask(__name__)` | creates the web application object |
| `@app.route('/')` | binds URL `/` to a Python function |
| `return 'Hello, TryHackMe!'` | sends a response back to the browser |

### Key idea

Flask routing is built around **decorators**.
A decorator tells Flask, "when this path is requested, run this function."

---

## 4. Running the App

The default local development server typically runs on:

```text
http://127.0.0.1:5000/
```

### Important defaults

* default port: `5000`
* loopback address: `127.0.0.1`
* development server only, not production-grade

### Port question from the room

* Default deployment port used by Flask: **5000**
* Is it possible to change the port? **yay**

### Command example

```bash
flask --app hello run --port 8000
```

### External exposure

```bash
flask run --host=0.0.0.0
```

This makes the dev server listen on all interfaces. That is convenient for labs and dangerous if used carelessly.

---

## 5. Routing Basics

The room then shows that Flask can define multiple pages easily.

### Routing example

```python
@app.route('/')
def home():
    return 'Home Page'

@app.route('/admin')
def admin():
    return 'Admin page'
```

### Concept

A route is simply a rule that maps:

```text
URL path -> Python function -> Response
```

### Why this matters for pentesting

When assessing Flask apps, routes are often where you first discover:

* hidden admin pages
* unauthenticated endpoints
* debug pages
* upload handlers
* API routes

---

## 6. HTTP Methods

By default, a Flask route handles **GET** requests only.

If a route should support POST, the developer must say so explicitly.

### Method-aware route example

```python
from flask import request

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        return do_the_login()
    else:
        return show_the_login_form()
```

### Room question

* Does Flask support POST requests? **yay**

### Practical interpretation

This pattern is common in:

* login forms
* search forms
* upload endpoints
* password reset flows
* admin actions

### Security implication

When testing a Flask app, always check whether:

* sensitive actions are POST-only
* CSRF protection exists
* GET endpoints perform unintended state changes

---

## 7. Template Rendering

Flask uses **Jinja2** as its template engine.

Instead of hardcoding raw HTML inside Python strings, developers can store templates separately and render them.

### Template rendering example

```python
from flask import render_template

@app.route('/rendered')
def hello(name=None):
    return render_template('template.html', name=name)
```

### Template folder convention

```text
/application.py
/templates
    /template.html
```

### Why templates are useful

They separate:

* Python logic
* HTML presentation

This makes apps easier to maintain and reduces messy inline string handling.

### Room question wording issue

The room asks "What markdown language can you use to make templates for Flask?"
That wording is technically inaccurate.

The real answer is:

* Flask templates are typically written with **HTML** plus **Jinja2 template syntax**.

Jinja can also generate plain text, emails, markdown, or other text formats, but in normal Flask web apps the standard answer is **HTML + Jinja2**.

---

## 8. File Upload Handling

Flask makes uploaded files accessible through `request.files`.

### Upload handler example

```python
from flask import request
from werkzeug.utils import secure_filename

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        f = request.files['the_file']
        f.save('/var/www/uploads/' + secure_filename(f.filename))
```

### Important components

| Element | Role |
| --- | --- |
| `request.files` | reads uploaded file objects |
| `secure_filename()` | sanitizes filename strings |
| `save()` | writes file to disk |

### HTML requirement

A file upload form must include:

```html
enctype="multipart/form-data"
```

Without that attribute, the browser will not send the file correctly.

---

## 9. File Upload Security Notes

The room focuses on functionality, but in practice file uploads are high-risk.

### Common developer mistakes

* trusting file extension only
* storing uploads in web-accessible paths blindly
* failing to validate MIME type or content
* allowing dangerous file types
* not renaming files server-side
* not scanning for malware
* saving files into predictable paths

### Safer design pattern

```text
User uploads file
    -> validate size
    -> validate extension and content type
    -> rename server-side
    -> store outside direct web root when possible
    -> scan / process safely
    -> serve indirectly
```

---

## 10. Jinja2 and SSTI Risk

This is the most important security section of the room.

The room shows a vulnerable pattern where user input becomes part of a Jinja-rendered template string.

### Dangerous pattern

```python
template = '''<h2>Hello %s!</h2>''' % person['name']
return render_template_string(template, person=person)
```

### Why this is dangerous

Jinja2 treats `{{ ... }}` as executable template expressions.
If attacker-controlled input reaches the template interpreter unsafely, the server may evaluate attacker-supplied expressions.

That is **Server-Side Template Injection (SSTI)**.

### Consequences

Depending on the context and what objects are exposed, SSTI can lead to:

* variable disclosure
* secret exposure
* local file read
* arbitrary code execution
* server compromise

---

## 11. SSTI Mental Model

```text
Untrusted input
    -> inserted into server-side template
    -> template engine evaluates it as code-like expression
    -> sensitive data / execution path exposed
```

### Safer mental rule

Never let raw user input become template syntax.

---

## 12. Lab Example: From Output Manipulation to File Read

The room demonstrates a vulnerable `/vuln` endpoint where the attacker can first access internal data, then abuse helper functions exposed to Jinja.

### Observed outcomes in the room

* displaying a sensitive variable such as a password
* reading files through a helper function exposed to the template context

### Why this matters

This shows a common escalation path:

```text
Expression evaluation
    -> internal object access
    -> helper / global function access
    -> local file read or worse
```

### Flag shown in the provided screenshots

The screenshots show a successful SSTI/LFI-style read resulting in:

```text
THM{flask_1njected}
```

---

## 13. Why the Vulnerability Exists

The room mentions a mitigation idea involving changing quote style, but the deeper lesson is broader:

### Real root cause

The vulnerability exists because the application:

* builds a template dynamically using unsafe string interpolation
* inserts attacker-controlled data into that template source
* then passes it into `render_template_string()` for evaluation

### More robust safe rule

Do this:

```python
return render_template('hello.html', person=person)
```

Avoid this:

```python
template = f"<h2>Hello {user_input}!</h2>"
return render_template_string(template)
```

### Proper mitigation principles

* do not construct templates from untrusted input
* pass user data as variables, not as template source
* avoid `render_template_string()` for attacker-controlled data
* minimize dangerous globals/functions in template context
* keep debug mode off in production

---

## 14. Debug Mode Risk

Flask debug mode is helpful during development and dangerous in production.

### Why

The interactive debugger can expose:

* stack traces
* configuration details
* environment information
* in some misconfigurations, remote code execution paths

### Safe rule

```text
Development: debug on if isolated and controlled
Production: debug off
```

---

## 15. Flask From an Attacker's Perspective

When you see a Flask target, think in layers.

### Enumeration priorities

1. identify routes
2. identify methods per route
3. inspect forms and upload handlers
4. inspect cookies / session behavior
5. look for debug traces
6. look for Jinja template injection surfaces
7. check file access and helper exposure

### Useful signals that a site is Flask

* Werkzeug / Flask headers in dev environments
* Jinja syntax in templates
* common route patterns
* default debug error pages
* stack traces referencing Flask, Werkzeug, or Jinja2

---

## 16. Pattern Cards

### Pattern Card: Minimal Flask App

**Indicator:** simple `Flask(__name__)` app with a few routes
**Use:** quick prototyping, internal tools, CTF labs
**Risk:** developers may skip hardening because the app feels small

### Pattern Card: Route/Method Split

**Indicator:** `@app.route('/login', methods=['GET', 'POST'])`
**Use:** forms and workflow actions
**Risk:** weak input validation, CSRF gaps, logic flaws

### Pattern Card: Upload Handler

**Indicator:** `request.files[...]` and `.save(...)`
**Use:** user file submission
**Risk:** dangerous file upload, path abuse, webshell exposure if validation is weak

### Pattern Card: Jinja SSTI

**Indicator:** `render_template_string()` with user-influenced content
**Use:** dynamic text rendering
**Risk:** template injection, file read, possible code execution

---

## 17. Common Exam / Interview Facts

### Q: Which environment variable was historically used to tell Flask what app to run?

**A:** `FLASK_APP`

### Q: What is the default Flask development port?

**A:** `5000`

### Q: Can Flask handle POST requests?

**A:** Yes

### Q: What template engine does Flask use?

**A:** Jinja2

### Q: What function is commonly used to render templates from files?

**A:** `render_template()`

### Q: What function is riskier when mixed with untrusted input?

**A:** `render_template_string()`

---

## 18. CN-EN Glossary

* Flask: Flask micro web framework
* Microframework: microframework
* Route / Routing: route / routing
* Decorator: decorator
* Request: request
* Response: response
* HTTP GET / POST: HTTP GET / POST
* Template engine: template engine
* Jinja2: Jinja2 template system
* Render template: render template
* Development server: development server
* Debug mode: debug mode
* File upload: file upload
* `secure_filename()` - safe filename handling
* SSTI (Server-Side Template Injection): server-side template injection
* LFI (Local File Inclusion / local file read in this lab context): local file read / local file inclusion related risk
* Context: context
* Helper function: helper function
* Attack surface: attack surface

---

## 19. Takeaways

Flask is easy to learn because the control flow is direct:

```text
route -> function -> response
```

That simplicity is also why security mistakes become very visible.

The room's strongest lesson is not "how to build Hello World."
It is this:

**small frameworks do not reduce security responsibility.**

A few lines of Python are enough to create:

* a working website
* a useful internal admin tool
* or a severe SSTI vulnerability

### Three things to remember

1. **Flask is simple, not automatically safe.**
2. **Jinja variables are safe only when passed as data, not when user input becomes template code.**
3. **Uploads, debug mode, and template rendering are common Flask security review points.**

---

## 20. Minimal Review Checklist

```text
[ ] I can explain what Flask is and why it is called a microframework.
[ ] I know the default Flask dev port is 5000.
[ ] I know how routes map URLs to Python functions.
[ ] I understand GET vs POST in Flask routes.
[ ] I know Flask commonly uses Jinja2 templates.
[ ] I know request.files is used for uploads.
[ ] I understand why render_template_string with untrusted input is dangerous.
[ ] I remember the lab flag shown in the screenshots: THM{flask_1njected}
```

---

## 21. Suggested Next Notes

Natural follow-ups:

* Jinja2 template fundamentals
* Flask session and cookie handling
* Secure file upload validation
* Python web authentication patterns
* SSTI methodology and detection
* Introduction to Django
