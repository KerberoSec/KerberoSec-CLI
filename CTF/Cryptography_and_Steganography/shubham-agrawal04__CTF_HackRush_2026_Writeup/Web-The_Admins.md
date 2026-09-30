# The Admins

**Category:** Web Exploitation  
**Points:** 50  

---

## Description

> Talk to the admin  
>
> http://4.188.84.14:5555/  
>
> Hint: https://owasp.org/www-community/attacks/SQL_Injection_Bypassing_WAF  

---

## Approach

### 1. Reconnaissance

- Fetched the login page HTML to inspect form structure and scripts  
- Scanned common endpoints:
  - `/api`, `/admin`, `/login`, `/flag`, `/robots.txt`, `/console`  
- Only valid endpoints found:
  - `/admin`, `/search`, `/admin-login`  

- Identified backend:
  - **Werkzeug/3.1.8 Python/3.11.15 (Flask)**  

---

### 2. Login WAF Analysis

- Tested common credentials:
  - `admin:admin`, `admin:password`, etc. → failed  

- Systematically tested payloads to understand filtering:

#### WAF Behavior

| Input Type | Result |
|-----------|--------|
| `or` (substring match) | Blocked |
| `--` | Blocked |
| Words containing `or` (e.g., `world`, `password`) | Blocked |
| `UNION`, `SELECT`, `FROM`, `WHERE` | Allowed |
| `\|\|`, `&&` | Allowed |
| `#`, `/**/`, `1=1`, `'1'='1'` | Allowed |

### Key Insight:
> WAF performs **case-insensitive substring filtering on `or`**, not full SQL parsing.

---

### 3. SQL Injection Attempts on Login

| Payload | Result |
|--------|--------|
| `admin' OR 1=1--` | Blocked (`or`, `--`) |
| `admin' oR '1'='1` | Blocked |
| `admin'/**/OR/**/1=1--` | Blocked |
| Encoded whitespace bypass (`%0a`, `%09`) | Blocked |
| `admin' \|\| '1'='1` | Passed WAF but login failed |
| **`' UNION SELECT 1,2,3 /*`** | **Success (200 OK)** |

---

### 4. Determining Column Count

- Tested column counts from 1 to 7  
- Only **3 columns** worked for login query  

---

### 5. Post-Login Exploration

- Successfully authenticated using UNION-based injection  
- Accessed `/search` using session cookie  

### Observations:
- Found employee data:
  - Naveen, Pavitr, Subhrajit, Kalp  

---

### 6. Additional Enumeration

- Searched for "Manish":
  - Found multiple entries (Finance, IT, Operations, Marketing)
  - **No Management entry visible**

- Indicates:
  - Hidden or filtered data
  - Possible WAF interference on output

---

### 7. Accessing Admin Panel

- Accessed `/admin` after login  
- Previously redirected → now accessible  

---

## Flag

```text
HRCTF{7RUTH_1N_7H3_D474}
```

---

## Key Insight

* WAF used **naive substring filtering**:

  * Blocking `or` globally instead of parsing SQL
* This unintentionally allowed:

  * `UNION SELECT` based injection

---

## Tools Used

* Browser (manual testing)
* Terminal (faster payload iteration)

---

## Lessons Learned

* WAFs based on substring filtering are weak
* Avoid blocked keywords instead of obfuscating them
* UNION-based SQL injection is highly effective
* Understanding filter behavior is more important than payload complexity

---

