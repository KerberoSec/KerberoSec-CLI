# Log Ingestion

## Common Log Sources

### Windows
- Event Viewer logs
- Event IDs identify activities

### Linux
Common paths:
- /var/log/httpd → HTTP logs
- /var/log/cron → Scheduled tasks
- /var/log/auth.log → Authentication
- /var/log/kern → Kernel logs

### Web Server
- Apache logs
- Tracks HTTP requests/responses

---

## Ingestion Methods

### 1. Agent / Forwarder
- Installed on endpoints
- Sends logs to SIEM

### 2. Syslog
- Standard protocol
- Sends logs in real time

### 3. Manual Upload
- Used for offline analysis

### 4. Port Forwarding
- Logs sent to SIEM via configured ports

---

## Lab Answer

HTTP logs location → **/var/log/httpd**
