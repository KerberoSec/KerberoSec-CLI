# Hack The Box: Redeemer Writeup  
**Author:** zer0arc4  

---

## 🎯 Target Overview
- Service Identified: Redis
- Port: 6379
- Attack Type: Misconfigured Redis (Unauthenticated Access)

---

## 🔍 TASK 1  
**Q:** Which TCP port is open on the machine?  

### 🧠 Approach:
- Performed an Nmap scan:
```bash
nmap -p0-10000 -sV <IP>
```
- Found only one open port.

### ✅ Answer:
```
6379
```

---

## 🔍 TASK 2  
**Q:** Which service is running on the open port?  

### 🧠 Approach:
- Used `-sV` flag in Nmap to detect service version.
- Identified service running on port 6379.

### 📌 Explanation:
- Redis (Remote Dictionary Server) is a fast, in-memory key-value store used for caching and databases.

### ✅ Answer:
```
Redis
```

---

## 🔍 TASK 3  
**Q:** What type of database is Redis?  

### 🧠 Approach:
- Researched Redis architecture.

### ✅ Answer:
```
In-memory Database
```

---

## 🔍 TASK 4  
**Q:** Which command-line utility is used to interact with Redis?  

### 🧠 Approach:
- Checked Redis documentation.

### ✅ Answer:
```
redis-cli
```

---

## 🔍 TASK 5  
**Q:** Which flag specifies the hostname in Redis CLI?  

### 🧠 Approach:
- Installed Redis tools:
```bash
sudo apt install redis-tools
```
- Checked manual page:
```bash
man redis-cli
```

### ✅ Answer:
```
-h
```

---

## 🔍 TASK 6  
**Q:** Which command shows server information and statistics?  

### 🧠 Approach:
- Referred to Redis CLI cheat sheet.

### ✅ Answer:
```
info
```

---

## 🔍 TASK 7  
**Q:** What is the Redis server version?  

### 🧠 Approach:
- Used:
```bash
info
```
- Located version in output.

### ✅ Answer:
```
5.0.7
```

---

## 🔍 TASK 8  
**Q:** Which command selects a Redis database?  

### 🧠 Approach:
- Referenced Redis commands documentation.

### ✅ Answer:
```
select
```

---

## 🔍 TASK 9  
**Q:** How many keys exist in database index 0?  

### 🧠 Approach:
```bash
select 0
keys *
```

### ✅ Answer:
```
4
```

---

## 🔍 TASK 10  
**Q:** Which command lists all keys in a database?  

### 🧠 Approach:
- Used wildcard listing.

### ✅ Answer:
```
keys *
```

---

## 🔍 TASK 11  
**Q:** Submit root flag  

### 🧠 Approach:
- Retrieved value of key:
```bash
get flag
```

### ✅ Answer:
```
03e1d2b376c37ab3f5319922053953eb
```

---

## 🧾 Summary

| Task | Concept |
|------|--------|
| 1    | Port Scanning (Nmap) |
| 2    | Service Enumeration |
| 3    | Redis Fundamentals |
| 4-5  | CLI Usage |
| 6-7  | Information Gathering |
| 8-10 | Redis Commands |
| 11   | Data Extraction |

---

## 🚀 Key Takeaways
- Redis often runs without authentication → major security risk.
- Misconfigured services can directly expose sensitive data.
- Always enumerate services thoroughly after port scanning.

---

**Author:** zer0arc4  
