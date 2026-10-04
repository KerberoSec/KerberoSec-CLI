
#Windows #Subscribers 
https://tryhackme.com/room/windowseventlogs

```
# task 2
40961

whoami

Execute a Remote Command

Pipeline Execution Details

# task 3
1071
event log, log file, structured query
Xpath query

Application
Event read direction
Maximum number of events to read

# task 4

OpenSSH/Admin,OpenSSH/Operational

Microsoft-Windows-PowerShell-DesiredStateConfiguration-FileDownloadManager

192

-MaxEvents

# task 5

Get-WinEvent -LogName Application -FilterXPath ‘*/System/Provider[@Name=”WLMS”] and */System/TimeCreated[[@SystemTime]=”2020-12: 15T01:09:08.940277500Z”]’

Get-WinEvent -LogName Security -FilterXPath ‘*/EventData/Data[[@Name]=”TargetUserName”]=”Sam” and */System/EventID=4720’

=====================
Get-WinEvent -LogName Application -FilterXPath '*/System/Provider[@Name="WLMS"] and */System/TimeCreated[@SystemTime="2020-12-15T01:09:08.940277500Z"]'

Get-WinEvent -LogName Security -FilterXPath '*/EventData/Data[@Name="TargetUserName"]="Sam" and */System/EventID=4720'

https://motasem-notes.net/event-log-management-in-windows-tryhackme-windows-event-logs/

```

https://medium.com/@WriteupsTHM_HTB_CTF/windows-event-logs-tryhackme-5df5313ce141

https://medium.com/@laupeiip/tryhackme-windows-event-logs-write-up-e5b975f11c4c

![[Pasted image 20250314182154.png]]

248

