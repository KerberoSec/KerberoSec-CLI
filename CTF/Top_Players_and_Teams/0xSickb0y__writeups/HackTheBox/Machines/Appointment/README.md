# Appointment

> https://app.hackthebox.com/starting-point?tier=1

![alt text](https://github.com/user-attachments/assets/a0ccef77-80e0-41b8-977a-55054eb29966)

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [Authentication Bypass](#authentication-bypass)
* [Conclusion](#conclusion)

## About

This machine features a simple Linux system hosting an Apache web server with a single login page. The primary challenge involved bypassing authentication using SQL injection to retrieve the flag.

## References

* [SQL Syntax: W3Schools](https://www.w3schools.com/sql/sql_syntax.asp)
* [SQL Injection: OWASP](https://owasp.org/www-community/attacks/SQL_Injection)
* [SQL Injection Prevention: OWASP](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
* [SQL Injection Cheat Sheet: PortSwigger](https://portswigger.net/web-security/sql-injection/cheat-sheet)

## Reconnaissance

Initial port scanning revealed a single open TCP port: an _Apache HTTP_ service running on port 80. The service presents a basic login page with no disallowed entries.

<img width="1355" height="328" alt="0" src="https://github.com/user-attachments/assets/b4246e39-1c46-4d2d-9b51-f6939404b3bd" />

## Authentication Bypass

The web interface presents a straightforward login form with two input fields: `username` and `password`. Given the machine's _"Very Easy"_ difficulty rating and associated tags on Hack The Box, SQL injection is the likely attack vector.

<img width="1918" height="1032" alt="1" src="https://github.com/user-attachments/assets/d2633efd-4b28-42d9-acc1-e60e6f13eece" />

The successful payload used for authentication bypass was: `username=' or 1=1;-- -&password=pass`. The `or 1=1` creates a true condition and `-- -` comments out the password check.

__Likely query pattern__
```sql
SELECT * FROM users WHERE username='<input>' AND password='<input>'
```

__After injection__
```sql
SELECT * FROM users WHERE username='' or 1=1;-- -' AND password='pass'
```

<img width="1537" height="851" alt="2" src="https://github.com/user-attachments/assets/7feb307d-a613-4729-80dc-dafdfa3c26e5" />

## Conclusion

This machine demonstrates a classic SQL injection vulnerability where unsanitized user input in a login form allows query manipulation. The simple `or 1=1` payload bypasses authentication by forcing a true condition: a fundamental web security lesson highlighting why parameterized queries are essential for secure applications.
