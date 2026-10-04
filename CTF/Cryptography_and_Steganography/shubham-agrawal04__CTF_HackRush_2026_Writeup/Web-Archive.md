# Archive

**Category:** Web Exploitation  
**Points:** 35  

---

## Description

> Something still left!!  
>
> http://4.188.84.14:5555/  

---

## Approach

### 1. Context

- Continuation of **The Admins** challenge  
- Already had:
  - Authenticated session
  - Access to `/admin`
  - Confirmed SQL Injection vulnerability (UNION-based)

---

### 2. Identifying New Attack Surface

- Inside `/admin`, found a **report/query form**
- Observed:
  - POST parameter: `query`
  - Directly used in backend SQL

### Insight:
> This endpoint is **injectable** and more powerful than previous ones

---

### 3. Exploiting Admin Query

- Used UNION-based SQL injection again:

```sql
' UNION SELECT ...
````

* Determined:

  * Query expects **4 columns**

---

### 4. Database Enumeration Attempts

#### Tried:

* `sqlite_master`
* `pragma_table_info()`
* `database()`, `sqlite_version()`

#### Result:

* Mostly **blocked or returned empty**
* Indicates:

  * WAF filtering or restricted output

---

### 5. Discovering Hidden Table

* Found a table via metadata exploration:

```
IITGN_ARCHIVE_2008
```

* Description hinted:

  > "Restricted info (to be redacted by intern)"

---

### 6. Extracting Data

Executed:

```sql
SELECT * FROM IITGN_ARCHIVE_2008
```

* Table structure:

  * Single column
* Successfully retrieved stored data

---

### 7. Flag Discovery

```text
HRCTF{4DM1N_M1GHT_N0T_N0T1C3}
```

---

## Unsuccessful Attempts

* Classic SQLi (`OR 1=1`) → blocked by WAF
* Encoding/obfuscation of `or` → blocked
* Full schema enumeration → blocked
* Extracting full employee records → partially filtered

---

## Key Insight

* Admin panel provided a **stronger injection point**
* Even when enumeration is restricted:

  * Metadata leaks + inference can reveal hidden tables
* WAF inconsistencies can be exploited across endpoints

---

## Tools Used

* Browser
* Terminal (manual payload crafting)

---

## Lessons Learned

* Privileged endpoints often expose deeper vulnerabilities
* UNION-based SQLi is flexible across contexts
* Enumeration may require indirect methods
* WAF restrictions can differ across endpoints

---
