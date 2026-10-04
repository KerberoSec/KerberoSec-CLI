#Subscribers 

https://tryhackme.com/room/loguniverse

## Logs 

Logs are the footprints of digital components and invaluable tools and resources in the storytelling of systems, applications and networks. However, harnessing the power of logs is a challenging task. First, you need to understand the different types, formats, offerings and importance of logs. Then, you can start to uncover the insights, patterns and "treasures" among the lines!

Logs provide visibility, context, and carry evidence value in security operations, incident response, threat hunting, compliance, cyber resilience, and cyber maturity. Most importantly, the ability to correlate simultaneous and distinct events among distributed networks and systems is also achieved with the visibility and context gained by logs. No matter what kind of security operation is being implemented, the logs are one of the essential components.

DATA SOURCES

```
Physical
	facilities systems hosted, offices, control rooms
	security cameras , access logs

Virtual
	network components: routers & switches
	operating systems
	servers
	security appliances = firewall, AV, IDS/IPS, DLP, VPN
	apps & frameworks = .NET, Java, PHP, Python
	mobile devices
	virtualization & Cloud components
	databases

each data source has different logs
```

Data Specifications

We have learned that multiple data sources generate different logs for different purposes. However, to avoid log noise and to enable log management, correlation, and investigation, some "minimum qualification requirements" must be present in each log. Common base qualifications are listed below:

```
system which created the log
log creation time 
event the caused the log
severity of the log
source associated with the log (IP, port, MAC, username)
```

## toolset and hints

- https://github.com/carina-studio/ULogViewer
-  the tool preference varies between analysts and the environment. One of the most important details of the log analysis tool is flexibility, compatibility, and support for parsing multiple log formats
- 
```
# ULogViewer
browser access
datasets: log file samples
Windows, Linux, Apache logs

1. Apache Access Log Files: Only Apache access log analysis.
2. Linux System Log Files: Only Linux system log analysis.
3. Raw Text In File: Cleartext log analysis.
4. Windows Event Log Files: Only Windows log analysis.

Task 4
Win Sample.evtx
Win Questions.evtx

Task 5
Linux.log

Task 6
Apache Access.log
Apache Error.log

1. Select the log profile to be parsed.
2. Add the log file to be parsed.
3. Filter logs and perform search.
4. Delete the loaded logs from the UI.
5. Open a new tab for a different log source.
```

## Windows event logs 

Windows event logs provide in-depth footprint information on the system, security, and applications installed on a Windows operating system. Windows provides a generous amount of logs, and you will need to activate them according to your visibility needs and capacity. 

Remember, the logging scope is fully configurable, and the default settings are not enough for the current state of the threats. Being comfortable with logs is a vital skill, but it is also important to have the general characteristics before deep diving into each log source's details. Now, let's take a look at the Windows event log characteristics. Below are the main specifications of the Windows event logs.

```
format/ extension
	.evt  .evtx   --> .xml .csv .txt

file location
	depends on OS version
	<= 2003:   C:\WINDOWS\system32\config
	>= Vista:  C:\WINDOWS\System32\winevt\Logs
	
view tool
	event viewer

Windows Logs (overall system)
App & Services Logs (specific, can create custom log format)

Windows Logs
	Application and software logs
	System and component logs
	security - local & group policy audit
	setup app install logs
	forwarded events - logs sent from hosts in same network

Apps & Service Logs
	Microsoft/Windows/PowerShell/Operational
	security, audit, compliance
	script block executions, module loads, admin actions

	Powershell debugging scripts
	script block executions, errors

Windows EventLog
	log name: app, system, security
	source: app or component
	event ID: 
	level: info/error/warning/critical/verbose
	user: account that triggered event
	logged: <date>
	task category: process creation/service creation/log clear
	keywords: none/audit failure/audit success
	computer: hostname
	message: log message
	
```

PID and TID data are beneficial for process tracing, correlation, and understanding the natural flow of events during log analysis. The timestamp also plays an essential role in determining which processes and threads were running at a particular time or during the workflow and, if applicable, the call times of the child processes and threads created by the user or execution flow.

Learning the anatomy of the Windows log files is essential, but you will also need to know the indicative event log IDs and details. Therefore, you will be able to track and understand the details of a potential anomaly or an intrusion attempt. Some useful Windows event log IDs are listed below.

```
# account management
	4720: User account creation.
	4722: User account enabled.
	4723: Attempt to change an account password.
	4724: Attempt to reset the account password of another account.  
    4725: Account disable.
	4726: Account removal.

# account logon
	4624: Successful logon.
	4625: Failed logon.
	4634 and 4647: Logoff.
	4779: Session disconnect.

# scheduled tasks
	4698: Scheduled task creation.
	4702: Scheduled task updated.
	4699: Scheduled task deletion.

# security 
	1100: Logging service disabled.
	1102: Log deletion.
	1116: Malware detection.
```

```
What is the Thread ID of the user creation event?
744

What is the account name that creates the new user?
SubjectUserName: Administrator

What is the name of the created account name?
TargetUserName: Adminstrator

What is the "SubjectLogonID" value of the "account reset attempt" event?
0x4B666

```

## Linux Logs 

```
format/extension
	.log
	cleartext systemd and journald logs in binary

file location
	most linux distros have  /var/log

view tool
	system log viewer
	cat, tail, more, less, grep ,awk
	lnav
	journalctl, who, failog, lastlog, dmesg

```

### common logs 

cleartext logs
```
# general system logs
	/var/log/syslog
	/var/log/messages
	
	system boot logs:    /var/log/boot.log
	background daemon:   /var/log/daemon.log

# authentication logs 
	/var/log/auth.log
	/var/log/secure

	kernel logs:   /var/log/kern.log
	audit logs:    /var/log/audit

# cron daemon logs
	/var/log/cron.log

	debug logs:         /var/log/debug
	apt command logs:   /car/log/apt
```

Logs with binary 
```
# failed login
/var/log/failog           failog

# active login records    who
/var/log/wtmp

# last logins
/var/log/lastlog          lastlog

# kernel ring buffer 
/var/log/dmesg            dmesg

```

Syslog
```
timestamp
hostname
application/process
process ID
message ID  Inbound TCP connection etc
message 
```

Analyzing multi-line logs requires high attention to detail and the ability to filter and extract significant details. This process involves identifying and filtering timestamps, hostnames, process IDs, and event descriptions, among other critical details. By effectively analyzing and correlating these attributes, it is possible to uncover the sequence of events, diagnose problems, and gain valuable insight into system behaviour, security incidents, or operational performance.

The following log examples are a series of timestamped entries from "TempServer" that show critical system events and resource management. 
These logs provide insight into memory issues, process terminations, and system reboots. Each log entry includes essential information: 
- timestamp, server name (TempServer), log source (Kernel or Systemd), process IDs (PID), and detailed event descriptions. 
- It's important to note that these logs are presented in a generic system log format, with no specific categorization, providing an insight into the server's operational challenges and the need for memory management and system recovery.

```
2023-09-25T08:15:20.123456Z TempServer kernel: Out of memory: Killed process 5678 (myapp); system reboot required.

The above log entries showcase events on "TempServer" that include crucial memory-related events. It shows that processes with IDs "5678" (myapp), "9876" (database), and "1234" (myapp) caused memory problems and resulted in process terminations, memory limit violations, swap space exhaustion, and low memory warnings, ultimately requiring reboots for recovery and stability.
```

- "Linux System Log Files"
- 
```
What is the number of successful sync events done by the NTPD service?
28

Which user logged in using the SSHD service?
THMjohn-p

What is the PID number of the Apache web server?
5678

Which service is stopped due to RAM issues?
nginx

Which service is stopped due to CPU issues?
apache tomcat

What is the timestamp of the second time reset event?
03/27 15:51:56

```

### Misc Logs: Application Logs

Misc logs provide in-depth footprint information on application-based events, giving more insights on application and process-based details that will help analysts in security operations, including monitoring, threat hunting, and incident response. This task will cover the details of Apache logs.

```
The directory of the log files can differ according to the used services and configuration file. Still, most Unix-like operating systems share the same directory to store the log files.

Main directory    /var/log/apache2/
Access logs       /var/log/apache2/access.log
Error logs        /var/log/apache2/error.log

```

### Apache Logs: Access.log

Access logs are invaluable records generated by web servers, containing essential attributes that form the backbone of effective log analysis. These attributes, including IP addresses, timestamps, HTTP methods, URLs, status codes, and user agent information, play a vital role in web server management and security.

These attributes enable administrators and analysts to ensure server health, diagnose problems, detect security threats, and optimize web services for a seamless user experience. Understanding the importance of these attributes is essential before embarking on log analysis, as it provides the baseline for informed decision making and effective web server management.

The anatomy of the Apache access.log's "Combined log format" is detailed in the given table.

```
IP          %h       IP of client (requester)
no info     %l       no info is available
user ID     %u       HTTP authentication user ID
timestamp   %t
request     \"%r\"    the request logged in 
status      %>s     status code sent back to client
object size  %b     size returned object (no headers)
referer    \"%{referer}i\"    HTTP referer field
user agent  \"%{User-agent}i\"

```

Apache access logs are identified by the "Common Log Format" and "Combined Log Format". Both formats focus on visibility but serve different purposes. The standard format is more lightweight and focuses on the basics, capturing only the essentials such as IP, URL and response. The combined format captures more details, such as referrer and user agent data, which is useful for in-depth analysis. The combined log format structure is shown in the below section.

```
LogFormat 
"%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-agent}i\"" 

HTTP POST method : Access Log

192.168.1.100 - THMjohn [15/Nov/2025:10:30:45 -0500] "POST /api/data HTTP/1.1" 404 1234 "https://www.LogUniverse-THM.com/page" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
```

### Apache error log

Error logs are an essential component of web server management, providing critical insight into system health and potential issues that can impact server performance and user experience. These logs capture essential attributes such as timestamps, error messages, file paths, and originating IP addresses. These attributes are essential for administrators and analysts to diagnose and resolve errors, identify vulnerabilities, and maintain server security. Before delving into error log analysis, it is vital to understand the importance of these attributes as they provide the foundation for proactive problem resolution and continuous improvement of web server stability and reliability.

```
timestamp     %t       time request is received
level         %l       log level of message
process ID    %P       PID current process
source file   %F       source file and number of log call
error status  %E       error status code
client IP     %a       client IP and port

actual log message    %M

Unlike access.log, error.log is identified under a single format named "ErrorLogFormat" and focuses on providing additional information to the log message. The structure is shown in the below section.

ErrorLogFormat "[%t] [%l] [pid %P] %F: %E: [client %a] %M"
```

Use the Access.log file to answer the first few questions.
```
What is the user's IP address who accessed "/secure.html"? (In defanged format)
203[.]45[.]78[.]102

Which user failed to access the settings page?
buyer986

Which user accessed the malicious page?
payload > adv8779

What is the user agent that discovered the malicious page?
nikto/2.1.5 (OpenVAS)

Use the Error.log file to answer the rest of the questions.

What is the PID of the process that causes permission error?
7654

What is the request that contains an invalid method?
 \x80\x03\x01\x00\x01

What pattern match triggered the access error in ModSecurity?
"SELECT.+FROM"

What is the path value of the file that tries to remove data from the system?
/etc/httpd/conf.d/malicious.conf

```

![[Pasted image 20250307170711.png]]

