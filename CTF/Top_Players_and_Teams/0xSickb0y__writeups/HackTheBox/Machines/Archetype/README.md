# Archetype

> [https://app.hackthebox.com/starting-point?tier=2](https://app.hackthebox.com/starting-point?tier=2)

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/128132ef-61eb-4d24-ae46-cb4052858f21" />

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [Exposed SQL Service Credentials](#exposed-sql-service-credentials)
* [Initial Access](#initial-access)
* [Privilege Escalation](#privilege-escalation)
* [Conclusion](#conclusion)

## About

Archetype was a Windows Server 2019 machine running Microsoft SQL Server 2017. The main challenge revolved around discovering a misconfigured SQL Server Integration Services (SSIS) configuration file exposed via SMB. This led to credential disclosure, remote code execution via xp_cmdshell, and privilege escalation through sensitive PowerShell command history.

## References

* [XP\_CMDSHELL](https://learn.microsoft.com/pt-br/sql/relational-databases/system-stored-procedures/xp-cmdshell-transact-sql?view=sql-server-ver17)
* [XML config files in SSIS](https://www.red-gate.com/simple-talk/databases/sql-server/bi-sql-server/xml-configuration-files-in-sql-server-integration-services/)
* [Microsoft: Securing SQL Server](https://learn.microsoft.com/en-us/sql/relational-databases/security/securing-sql-server?view=sql-server-ver17)
* [Windows privilege escalation via PowerShell History](https://michaelkoczwara.medium.com/windows-privilege-escalation-dbb908cce8d4)

## Reconnaissance

Nmap revealed five open TCP ports:

* **135**: msrpc (Microsoft Windows RPC)
* **139**: netbios-ssn (Microsoft Windows NetBIOS)
* **445**: microsoft-ds (SMB: Windows Server 2019 Standard)
* **1433**: ms-sql-s (Microsoft SQL Server 2017)
* **5985**: http (WinRM: Microsoft HTTPAPI HTTP/2.0)

The MS-SQL NTLM information revealed the NetBIOS/DNS name, domain/computer name (*ARCHETYPE*), and the product version (*10.0.17763*: SQL Server 2017). Nmap’s SMB scripts also provided information such as the system time, OS version (Windows Server 2019 Standard, build 17763), clock skew, and the SMB security mode.

<img width="1901" height="991" alt="0" src="https://github.com/user-attachments/assets/ce8a7abd-4931-452c-b4a5-8d6bf7f282c7" />

## Exposed SQL Service Credentials

Besides the default shares, there was a readable share named `backups`. It contained a file called `prod.dtsConfig`. This is a **DTS (Data Transformation Services)** configuration file used by **SQL Server Integration Services (SSIS)** in Microsoft SQL Server.

SSIS is a platform for building data integration and workflow solutions: typically used for ETL (Extract, Transform, Load) processes. This configuration file stores runtime settings for an SSIS package, including connection strings, variable values, or property values.

<img width="1908" height="438" alt="1" src="https://github.com/user-attachments/assets/0f4c297f-5e7d-4740-a6a9-5bf91eb2eee2" />

## Initial Access

The `prod.dtsConfig` file included metadata but most importantly, it contained credentials for the user __ARCHETYPE\sql_svc__, which allowed me to connect to the MS-SQL instance using [mssqlclient.py](https://github.com/Twi1ight/impacket/blob/master/examples/mssqlclient.py).

<img width="1471" height="727" alt="2" src="https://github.com/user-attachments/assets/e6905561-f7cf-4d60-982e-349f0fe8eac4" />

To gain access to the system, I enabled `xp_cmdshell` and trigerred a reverse shell using [Invoke-PowerShellTcpOneLine.ps1](https://github.com/samratashok/nishang/blob/master/Shells/Invoke-PowerShellTcpOneLine.ps1).

<img width="1905" height="501" alt="3" src="https://github.com/user-attachments/assets/6991895f-c2d0-4053-8d74-8e8846ccb2d1" />

## Privilege Escalation

Under _PowerShell Settings_, [winPEAS](https://github.com/peass-ng/PEASS-ng/tree/master/winPEAS) discovered the PowerShell history file (_ConsoleHost_history.txt_) for the __ARCHETYPE\sql_svc__ user. This file contained a `net use` command that exposed the Administrator password.

```powershell
net.exe use T: \\Archetype\backups /user:administrator MEGACORP_4dm1n!!
exit
```

<img width="1136" height="312" alt="4" src="https://github.com/user-attachments/assets/7520c53c-46a0-49a6-b5bb-e04de8754b2b" />

I used **nxc** to confirm that a WinRM connection could be established as the Administrator user, which succeeded with the message **Pwn3d!**. I then used **evil-winrm** to log in, retrieve the root flag, and complete the challenge.

<img width="1906" height="684" alt="5" src="https://github.com/user-attachments/assets/702a556b-b763-4c42-a1ef-1afc9c32ce82" />

## Conclusion

The Archetype machine demonstrated the risks of exposed configuration files and poor credential hygiene. The compromise was enabled by insecure file sharing practices, lack of service hardening on SQL Server, and insufficient cleanup of sensitive command history.

Key takeaways:

- Misconfigured SMB share: An exposed SSIS config file (prod.dtsConfig) contained plaintext credentials.

- Enabled xp_cmdshell: Allowed execution of system commands directly via SQL queries.

- Poor credential management: PowerShell history revealed hardcoded administrator credentials.

