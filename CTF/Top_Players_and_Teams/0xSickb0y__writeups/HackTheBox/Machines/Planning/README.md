# Planning

> https://app.hackthebox.com/machines/Planning

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/1416449a-1769-439a-8afd-cd9cae8492d6" />

## Table of Contents

- [About](#about)
- [References](#references)
- [Reconnaissance](#reconnaissance)
- [Web Access](#web-access)
- [Restricted Environment](#restricted-environment)
- [Initial Access](#initial-access)
- [Privilege Escalation](#privilege-escalation)
- [Conclusion](#conclusion)

## About

As is common in real-life penetration tests, the Planning box was started with credentials for the following account: `admin:0D5oT70Fq13EvB5r`

## References

- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Grafana Security Release: CVE-2024-9264](https://grafana.com/blog/2024/10/17/grafana-security-release-critical-severity-fix-for-cve-2024-9264/)
- [CVE-2024-9264 Details](https://nvd.nist.gov/vuln/detail/CVE-2024-9264)
- [CVE-2024-9264 Proof of Concept](https://github.com/nollium/CVE-2024-9264)
- [Docker Container Escape Techniques](https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/docker-security/docker-breakout-privilege-escalation/index.html?highlight=docker%20escape#docker-custom-escape)

## Reconnaissance

The port scan revealed two ports listening on TCP (22/80): OpenSSH and the NGINX web server.

<img width="1636" height="431" alt="0" src="https://github.com/user-attachments/assets/a343d07a-0a6d-4081-869a-eb86ad2f539b" />

The machine description provided credentials, but initially the login panel was nowhere to be found, so I spent some time enumerating the web page looking for it.

After finding nothing of interest on the main web page or any subdirectories, I searched for other virtual hosts that might be present on the server. After a while, a **grafana** subdomain was discovered.

From https://grafana.com/docs/grafana/latest :

*Grafana Open Source Software (OSS) enables you to query, visualize, alert on, and explore your metrics, logs, and traces wherever they're stored. Grafana data source plugins enable you to query data sources including time series databases like Prometheus and CloudWatch, logging tools like Loki and Elasticsearch, NoSQL/SQL databases like Postgres, CI/CD tooling like GitHub, and many more. Grafana OSS provides you with tools to display that data on live dashboards with insightful graphs and visualizations.*

<img width="1319" height="547" alt="1" src="https://github.com/user-attachments/assets/17ad8a44-fd9d-4c02-ab87-b7325b1a4257" />

## Web Access

The provided credentials were used to log in to the Grafana dashboard. From there (and also the login page), it was possible to identify the version being used in this application (v 11.0.0) which was related to [CVE-2024-9264](https://nvd.nist.gov/vuln/detail/CVE-2024-9264), a critical severity security vulnerability that enables *Command Injection* and *Local File Inclusion* via SQL expressions.

<img width="1805" height="985" alt="2" src="https://github.com/user-attachments/assets/0d02bbb3-610a-4b57-8730-be330d52a7fd" />

## Restricted Environment

To obtain a foothold on the system, the following [PoC](https://github.com/nollium/CVE-2024-9264) was used to verify that the Grafana instance could be exploited.

After exploitability was confirmed, I triggered a reverse shell, which led to a Docker instance that was hosting the web server.

<img width="1785" height="670" alt="4" src="https://github.com/user-attachments/assets/fde3a995-d825-49b5-94e1-6e44bdc11ec5" />

## Initial Access

After enumerating and digging through the files being used by both the web server and the Docker instance itself, I noticed the use of two relevant environment variables: `GF_SECURITY_ADMIN_USER` and `GF_SECURITY_ADMIN_PASSWORD`.

Inspecting those variables revealed credentials that allowed me to escape from the container and pivot into the host as **enzo**.

<img width="1786" height="513" alt="5" src="https://github.com/user-attachments/assets/d1e675bd-9546-4639-9b87-5b0d522e2683" />

## Privilege Escalation

I started the enumeration process once again, using automated tools and manually searching for objects of interest. Crontab files were found under `/opt` instead of other usual paths. One file in particular (crontab.db) revealed important information about the cronjobs running on the box.

One of them was executing `/root/scripts/cleanup.sh` every minute, but it was unreadable at the time and I had little success figuring out what this script did. The other cron job was no good either, since it was running at `@daily` and none of the compressed files (_grafana.tar, grafana.tar.gz, grafana.tar.gz.zip_) existed on the filesystem.

Nonetheless, the _command_ line provided a password which came into good use.

<img width="1789" height="530" alt="6" src="https://github.com/user-attachments/assets/9a59a3a7-ad2f-45b1-8731-bc0c1dcaafd9" />

Inspecting local TCP connections revealed a web server listening under `127.0.0.1:8000`. I established an SSH tunnel to my kali machine and could access the Crontab UI remotely.

<img width="1787" height="361" alt="7" src="https://github.com/user-attachments/assets/31042315-14b0-4295-bb39-fc1b8ccedf7b" />
<img width="1803" height="683" alt="8" src="https://github.com/user-attachments/assets/674888b6-15e6-44b9-8e15-11dd93243261" />

From there, the path to root was clear: spawn a new task and execute a reverse shell.

<img width="1905" height="875" alt="9" src="https://github.com/user-attachments/assets/6ad5e89d-a9e8-4921-8f56-e52b1aaa5564" />

## Conclusion

The Planning machine demonstrated a multi-stage attack path involving CVE exploitation, container escape, and privilege escalation through misconfigured services. The key lessons learned from this machine included:

- **Virtual host enumeration was essential**: The main attack vector was hidden behind a subdomain that required proper enumeration techniques

- **Known CVE exploitation provided initial access**: Grafana v11.0.0 was vulnerable to CVE-2024-9264, enabling command injection

- **Container escape through credential reuse**: Environment variables within the Docker container contained credentials for the host system

- **Crontab UI provided privilege escalation**: A locally-running crontab management interface allowed scheduling of arbitrary commands as root
- **SSH tunneling enabled access to internal services**: Port forwarding was necessary to access services bound to localhost
