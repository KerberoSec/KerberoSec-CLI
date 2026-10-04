# Mongod: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Very%20Easy-brightgreen) ![OS](https://img.shields.io/badge/OS-Linux-blue) ![Category](https://img.shields.io/badge/Category-Database%20Misconfiguration-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| **Machine Name** | Mongod |
| **Difficulty** | Very Easy |
| **Platform** | Hack The Box |
| **Operating System** | Linux |
| **Category** | Unauthenticated Database Access |
| **Focus** | MongoDB Security & Access Controls |

---

## Table of Contents

- [Overview](#overview)
- [Initial Enumeration](#initial-enumeration)
- [Service Identification](#service-identification)
- [Database Access](#database-access)
- [Data Enumeration](#data-enumeration)
- [Flag Retrieval](#flag-retrieval)
- [Key Takeaways](#key-takeaways)

---

## Overview

Mongod is a **"Very Easy"** difficulty machine from Hack The Box that demonstrates the critical risks of exposing database services directly to the network without proper authentication or access controls.

This box highlights a common real-world misconfiguration where MongoDB, typically deployed for internal application use, is exposed externally with default settings that allow full database access without any credentials. This represents an immediate and complete data compromise scenario.

**Learning Objectives:**
- Understanding database service exposure risks
- MongoDB enumeration techniques
- NoSQL database structure and querying
- Importance of authentication and network segmentation
- Impact of database misconfigurations

> ⚠️ **Key Concept:** This is not a traditional "exploit": it's a critical misconfiguration that provides immediate access to all data.

---

## Initial Enumeration

### Port Scanning

We begin with a comprehensive port scan to identify all running services:

```bash
nmap -sC -sV -p- -oN nmap/full_scan 10.10.10.X
```

**Results:**
```
PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3
27017/tcp open  mongodb MongoDB 3.6.8
```

**Key Findings:**
- 🔓 **Port 22:** SSH service (standard)
- 🔓 **Port 27017:** MongoDB 3.6.8 (default port)

> 💡 **Important:** MongoDB running on its default port (27017) and accessible from external networks is a major red flag.

---

## Service Identification

### MongoDB Service Analysis

**MongoDB Version:** 3.6.8  
**Default Port:** 27017  
**Database Type:** NoSQL (document-based)

#### What is MongoDB?

MongoDB is a popular NoSQL database that:
- Stores data in flexible, JSON-like documents (BSON format)
- Does **not** use traditional tables or SQL schemas
- Organizes data into **databases** → **collections** → **documents**
- Is commonly used for web applications and microservices

#### Architecture
```
MongoDB Server
├── Database 1
│   ├── Collection A
│   │   ├── Document 1
│   │   ├── Document 2
│   │   └── Document 3
│   └── Collection B
├── Database 2
└── Database 3
```

> ⚠️ **Security Issue:** MongoDB is designed for internal use within trusted networks. External exposure without authentication is a critical vulnerability.

---

## Database Access

### Connecting to MongoDB

With MongoDB identified on port 27017, we attempt to connect using the standard MongoDB client:

```bash
mongo mongodb://10.10.10.X:27017
```

**Alternative connection methods:**
```bash
# Using mongosh (newer MongoDB shell)
mongosh mongodb://10.10.10.X:27017

# Using mongo with explicit connection
mongo --host 10.10.10.X --port 27017
```

### Connection Result

```
MongoDB shell version v3.6.8
connecting to: mongodb://10.10.10.X:27017/
MongoDB server version: 3.6.8
>
```

**🚨 CRITICAL FINDING:** Connection successful **without authentication**

**What this means:**
- ❌ No username required
- ❌ No password required
- ❌ No network restrictions in place
- ✅ Full database access granted immediately

> ⚠️ **This level of access should NEVER be possible from an untrusted network.**

### Interactive MongoDB Shell

Once connected, we have full interactive access to the MongoDB instance:

```javascript
> // We now have an interactive MongoDB shell
> // Full read/write access to all databases
```

**Available operations from the shell:**
- 📚 Enumerate all databases
- 📁 List collections within databases
- 📄 Query and dump stored documents
- ✏️ Modify or delete data (not necessary for this box)
- ⚙️ View server configuration and stats

---

## Data Enumeration

### Listing Databases

First, we enumerate all available databases on the server:

```javascript
> show dbs
```

**Output:**
```
admin                  0.000GB
config                 0.000GB
local                  0.000GB
sensitive_information  0.000GB
```

**Observations:**
- `admin`, `config`, `local` - Default MongoDB system databases
- `sensitive_information` - Custom database (🎯 **target identified**)

> 💡 **Analysis:** The presence of a database named "sensitive_information" is a clear indicator of where critical data might be stored.

### Selecting the Target Database

Switch to the target database:

```javascript
> use sensitive_information
```

**Output:**
```
switched to db sensitive_information
```

### Listing Collections

Within the database, we list all collections:

```javascript
> show collections
```

**Output:**
```
flag
```

**🎯 Critical Finding:** A collection named `flag` exists in the database.

> 💡 **MongoDB Structure:** Collections in MongoDB are analogous to tables in SQL databases. They contain groups of documents (similar to rows).

### Querying the Collection

Now we query the `flag` collection to retrieve all stored documents:

```javascript
> db.flag.find()
```

**Alternative query methods:**
```javascript
// Pretty-print the output
> db.flag.find().pretty()

// Limit results
> db.flag.find().limit(1)

// Find specific fields
> db.flag.find({}, {flag: 1, _id: 0})
```

---

## Flag Retrieval

### Query Results

```javascript
> db.flag.find().pretty()
```

**Output:**
```json
{
    "_id" : ObjectId("5f5e35c7d5c5e2c5f5e35c7d"),
    "flag" : "HTB{[FLAG_REDACTED]}",
    "description" : "MongoDB exposed without authentication"
}
```

**🎉 Flag Successfully Retrieved**

### What Happened?

The complete attack chain:
```
1. Port Scan → MongoDB discovered on port 27017
   ↓
2. Connection Attempt → No authentication required
   ↓
3. Database Enumeration → "sensitive_information" database found
   ↓
4. Collection Listing → "flag" collection discovered
   ↓
5. Data Query → Flag document retrieved
   ↓
6. Mission Complete → Full data access achieved
```

### Additional Enumeration Commands

**Other useful MongoDB commands for enumeration:**

```javascript
// Show current database
> db

// Count documents in a collection
> db.flag.count()

// Show database statistics
> db.stats()

// List all users (if any exist)
> db.getUsers()

// Show server status
> db.serverStatus()

// List all collection names
> db.getCollectionNames()

// Find with specific criteria
> db.flag.find({field: "value"})
```

---

## Impact Assessment

### Vulnerability Analysis

**Vulnerability Type:** Unauthenticated Database Exposure  
**CVSS Score:** 9.8 (Critical)  
**Attack Complexity:** Low  
**Privileges Required:** None  
**User Interaction:** None

### Technical Impact

This misconfiguration allows an attacker to:

| Impact Category | Details |
|----------------|---------|
| 🔓 **Data Confidentiality** | Complete breach: all data readable |
| ✏️ **Data Integrity** | All data can be modified or deleted |
| 💾 **Data Availability** | Database can be destroyed or locked |
| 🚪 **Access Control** | No authentication = no access control |
| 📊 **Information Disclosure** | Full database schema and content exposed |

### Real-World Impact

In a production environment, this vulnerability would result in:

#### Immediate Consequences
- 🔓 **Complete data breach**: All database contents accessible
- 💳 **PII/sensitive data exposure**: Customer data, credentials, financial records
- 🗑️ **Data destruction potential**: Entire databases can be dropped
- 🔐 **Ransomware opportunity**: Data can be encrypted and held for ransom
- 📝 **Compliance violations**: GDPR, HIPAA, PCI-DSS breaches

#### Business Impact
- 💰 Significant financial losses
- ⚖️ Legal liability and regulatory fines
- 📉 Reputational damage
- 👥 Customer trust erosion
- 📰 Mandatory breach notifications

> 🚨 **Real-World Example:** In 2017, MongoDB servers exposed without authentication led to massive data breaches affecting millions of users across multiple companies.

---

## Key Takeaways

### 🎯 Critical Lessons Learned

#### 1️⃣ Never Expose Databases Directly to the Internet
- Database services are designed for internal application use
- Direct internet exposure = immediate compromise opportunity
- Even with authentication, databases should be behind firewalls
- Use VPNs or bastion hosts for remote database access

#### 2️⃣ Authentication Must Be Enforced By Default
- **MongoDB changed its defaults** after widespread attacks
- Versions prior to 3.6 had authentication **disabled** by default
- Never assume default configurations are secure
- Always enable authentication before deploying

#### 3️⃣ Network-Level Access Controls Are Critical
- Firewall rules should restrict database access to trusted sources
- Use IP whitelisting for database connections
- Implement network segmentation (DMZ, internal zones)
- Database servers should **never** be in the DMZ

#### 4️⃣ This is Misconfiguration, Not Exploitation
- No "exploit" was needed to access the data
- No vulnerability was "discovered"
- Simply connecting to an exposed service = immediate access
- Demonstrates that not all security failures require technical exploits

#### 5️⃣ Defense in Depth is Essential
- Multiple security layers prevent single-point failures
- Even if authentication fails, network controls should block access
- Encryption in transit (TLS) is important but doesn't prevent this
- Monitoring and alerting can detect unauthorized connections

---

## 🛡️ Defensive Recommendations

### Immediate Actions (Critical Priority)

| Priority | Action | Implementation |
|----------|--------|----------------|
| 🔴 **CRITICAL** | Enable MongoDB authentication | `mongod --auth` or in config file |
| 🔴 **CRITICAL** | Bind MongoDB to localhost only | `bindIp: 127.0.0.1` |
| 🔴 **CRITICAL** | Implement firewall rules | Block port 27017 from external networks |
| 🟠 **HIGH** | Change default port | Use non-standard port (security through obscurity as additional layer) |

### MongoDB Authentication Configuration

**Enable authentication in MongoDB:**

```javascript
// 1. Create an admin user
use admin
db.createUser({
  user: "adminUser",
  pwd: "strongPasswordHere",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

// 2. Restart MongoDB with authentication enabled
// mongod --auth
```

**Configure in `/etc/mongod.conf`:**
```yaml
# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1  # Bind to localhost only

# Security settings
security:
  authorization: enabled  # Enable authentication
```

### Network-Level Security

**Firewall Configuration (iptables example):**
```bash
# Block all external access to MongoDB port
iptables -A INPUT -p tcp --dport 27017 -s 127.0.0.1 -j ACCEPT
iptables -A INPUT -p tcp --dport 27017 -j DROP

# Alternative: Allow only from specific IP ranges
iptables -A INPUT -p tcp --dport 27017 -s 10.0.0.0/8 -j ACCEPT
iptables -A INPUT -p tcp --dport 27017 -j DROP
```

### Best Practices Checklist

- ✅ **Enable authentication** on all database instances
- ✅ **Bind to localhost** (127.0.0.1) unless remote access is absolutely necessary
- ✅ **Use strong passwords** for all database users
- ✅ **Implement role-based access control** (RBAC): principle of least privilege
- ✅ **Enable TLS/SSL** for encrypted connections
- ✅ **Regular security audits** of database configurations
- ✅ **Monitor for unauthorized access attempts**
- ✅ **Keep MongoDB updated** to the latest stable version
- ✅ **Use VPNs or SSH tunnels** for remote database administration
- ✅ **Implement database activity monitoring**

### MongoDB Security Hardening Guide

**1. Authentication & Authorization**
```yaml
security:
  authorization: enabled
  javascriptEnabled: false  # Disable server-side JavaScript if not needed
```

**2. Network Configuration**
```yaml
net:
  bindIp: 127.0.0.1
  port: 27017
  tls:
    mode: requireTLS
    certificateKeyFile: /path/to/mongodb.pem
```

**3. Logging & Auditing**
```yaml
systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true

auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/audit.json
```

**4. Resource Limits**
```yaml
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1  # Limit memory usage
```

---

## 🔧 Tools Used

| Tool | Purpose |
|------|---------|
| **Nmap** | Service discovery and version detection |
| **mongo / mongosh** | MongoDB client for database interaction |
| **netcat** | Alternative connection testing |

---

## 📚 Additional MongoDB Enumeration

### Advanced Query Techniques

```javascript
// Count all documents in a collection
db.collection_name.count()

// Find with regex pattern matching
db.collection_name.find({field: /pattern/i})

// Aggregate pipeline for complex queries
db.collection_name.aggregate([
  { $match: { field: "value" } },
  { $group: { _id: "$field", total: { $sum: 1 } } }
])

// Export data to JSON
mongoexport --db database_name --collection collection_name --out output.json

// Find all collections across all databases
var databases = db.adminCommand('listDatabases').databases;
databases.forEach(function(database) {
  db = db.getSiblingDB(database.name);
  print("Database: " + database.name);
  db.getCollectionNames().forEach(function(collection) {
    print("  - " + collection);
  });
});
```

---

## 🌐 Real-World Case Studies

### Notable MongoDB Exposure Incidents

**2017: Massive MongoDB Ransomware Campaign**
- Over 27,000 MongoDB instances compromised
- Data deleted and held for Bitcoin ransom
- Affected databases were exposed without authentication
- Total ransom demands exceeded millions of dollars

**Key Lesson:** These attacks were automated and indiscriminate: any exposed MongoDB instance was vulnerable regardless of the data it contained.

---

## 📖 References

- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [MongoDB Authentication Configuration](https://docs.mongodb.com/manual/core/authentication/)
- [OWASP Top 10: A01:2021 Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [CWE-306: Missing Authentication for Critical Function](https://cwe.mitre.org/data/definitions/306.html)
- [CVE-2020-7928: MongoDB Server-Side Request Forgery](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-7928)

---

## 🎓 Learning Resources

- [MongoDB University (Free Courses)](https://university.mongodb.com/)
- [MongoDB Security Architecture Guide](https://docs.mongodb.com/manual/core/security/)
- [Hack The Box Academy: NoSQL Injection](https://academy.hackthebox.com/)

---

**Author:** Gresa Hisa
**Machine IP:** 10.10.10.X  
**Difficulty:** Very Easy  
**Points:** 20

---

*This writeup is for educational purposes only. Always ensure you have proper authorization before testing any systems.*
