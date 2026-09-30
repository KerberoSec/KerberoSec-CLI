## Challenge 🧩

On a quiet Halloween night, when the world outside was wrapped in shadows, an intrusion alert pierced through the calm. 
The alert, triggered by an internal monitoring system, pinpointed unusual activity on a specific workstation. Can you illuminate the darkness and uncover what happened during this intrusion? 

Note: flag is split into two parts

## Solution 🕵️‍♂️

The Zip file contains Windows Event Log Files.

After analyzing logs, Two Entries in `Microsoft-Windows-PowerShell_Operational.evtx` stand out.

```text
Log Name: Microsoft-Windows-PowerShell/Operational
Source: Microsoft-Windows-PowerShell
Date: 02/09/2024 01:09:17 AM
Event ID: 4104
Task Category: Starting Command
Level: 5
Keywords:
User: S-1-5-21-3783332216-3677135460-475609662-1001
Computer: DESKTOP-PMOIL0D
Description:
Creating Scriptblock text (1 of 1):
Get-ChildItem -Path "$env:TEMP" -Verbose
Get-Process -Verbose

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-EncodedCommand JHRlbXBQYXRoID0gIiRlbnY6d2luZGlyXHRlbXBcR2gwc3QudHh0IgoiSFRCe0doMHN0X0wwYzR0MTBuIiB8IE91dC1GaWxlIC1GaWxlUGF0aCAkdGVtcFBhdGggLUVuY29kaW5nIHV0Zjg="
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "MaintenanceTask" -Description ""

ScriptBlock ID: 677529ad-da67-4f73-a7b3-b3385eaed86b
Path: C:\Users\usr01\AppData\Local\Temp\wLDwomPJLN.ps1
Event Xml:
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-PowerShell" Guid="{a0c1853b-5c40-4b15-8766-3cf1c58f985a}" />
    <EventID>4104</EventID>
    <Version>1</Version>
    <Level>5</Level>
    <Task>2</Task>
    <Opcode>15</Opcode>
    <Keywords>0x0</Keywords>
    <TimeCreated SystemTime="2024-09-01T19:39:17.4156564Z" />
    <EventRecordID>22</EventRecordID>
    <Correlation ActivityID="{ceda99a8-fcae-0003-3ba0-daceaefcda01}" />
    <Execution ProcessID="5808" ThreadID="876" />
    <Channel>Microsoft-Windows-PowerShell/Operational</Channel>
    <Computer>DESKTOP-PMOIL0D</Computer>
    <Security UserID="S-1-5-21-3783332216-3677135460-475609662-1001" />
  </System>
  <EventData>
    <Data Name="MessageNumber">1</Data>
    <Data Name="MessageTotal">1</Data>
    <Data Name="ScriptBlockText">Get-ChildItem -Path "$env:TEMP" -Verbose
Get-Process -Verbose

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-EncodedCommand JHRlbXBQYXRoID0gIiRlbnY6d2luZGlyXHRlbXBcR2gwc3QudHh0IgoiSFRCe0doMHN0X0wwYzR0MTBuIiB8IE91dC1GaWxlIC1GaWxlUGF0aCAkdGVtcFBhdGggLUVuY29kaW5nIHV0Zjg="
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "MaintenanceTask" -Description ""
</Data>
    <Data Name="ScriptBlockId">677529ad-da67-4f73-a7b3-b3385eaed86b</Data>
    <Data Name="Path">C:\Users\usr01\AppData\Local\Temp\wLDwomPJLN.ps1</Data>
  </EventData>
</Event>
```

```text
Log Name: Microsoft-Windows-PowerShell/Operational
Source: Microsoft-Windows-PowerShell
Date: 02/09/2024 01:09:22 AM
Event ID: 4104
Task Category: Starting Command
Level: 5
Keywords:
User: S-1-5-21-3783332216-3677135460-475609662-1001
Computer: DESKTOP-PMOIL0D
Description:
Creating Scriptblock text (1 of 1):
Get-PSDrive -Name C -Verbose
Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion" -Verbose

New-Item -Path "HKCU:\Software\cPdQnixceg" -Force
New-ItemProperty -Path "HKCU:\Software\cPdQnixceg" -Name "cPdQnixceg" -Value "X1c0c19SM3YzNGwzZH0=" -PropertyType String
Get-ScheduledTask -Verbose

ScriptBlock ID: 72187be7-469a-440d-ac5f-44d1f81d3de5
Path: C:\Users\usr01\AppData\Local\Temp\3MZvgfcEiT.ps1
Event Xml:
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-PowerShell" Guid="{a0c1853b-5c40-4b15-8766-3cf1c58f985a}" />
    <EventID>4104</EventID>
    <Version>1</Version>
    <Level>5</Level>
    <Task>2</Task>
    <Opcode>15</Opcode>
    <Keywords>0x0</Keywords>
    <TimeCreated SystemTime="2024-09-01T19:39:22.2471978Z" />
    <EventRecordID>63</EventRecordID>
    <Correlation ActivityID="{ceda99a8-fcae-0002-9ba6-daceaefcda01}" />
    <Execution ProcessID="5908" ThreadID="2524" />
    <Channel>Microsoft-Windows-PowerShell/Operational</Channel>
    <Computer>DESKTOP-PMOIL0D</Computer>
    <Security UserID="S-1-5-21-3783332216-3677135460-475609662-1001" />
  </System>
  <EventData>
    <Data Name="MessageNumber">1</Data>
    <Data Name="MessageTotal">1</Data>
    <Data Name="ScriptBlockText">Get-PSDrive -Name C -Verbose
Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion" -Verbose

New-Item -Path "HKCU:\Software\cPdQnixceg" -Force
New-ItemProperty -Path "HKCU:\Software\cPdQnixceg" -Name "cPdQnixceg" -Value "X1c0c19SM3YzNGwzZH0=" -PropertyType String
Get-ScheduledTask -Verbose
</Data>
    <Data Name="ScriptBlockId">72187be7-469a-440d-ac5f-44d1f81d3de5</Data>
    <Data Name="Path">C:\Users\usr01\AppData\Local\Temp\3MZvgfcEiT.ps1</Data>
  </EventData>
</Event>
```

Decoding the Strings

```bash
┌──(user㉿shell)-[~]
└─$ echo "JHRlbXBQYXRoID0gIiRlbnY6d2luZGlyXHRlbXBcR2gwc3QudHh0IgoiSFRCe0doMHN0X0wwYzR0MTBuIiB8IE91dC1GaWxlIC1GaWxlUGF0aCAkdGVtcFBhdGggLUVuY29kaW5nIHV0Zjg=" | base64 -d
$tempPath = "$env:windir\temp\Gh0st.txt"
"HTB{Gh0st_L0c4t10n" | Out-File -FilePath $tempPath -Encoding utf8
```

```bash
┌──(user㉿shell)-[~]
└─$ echo "X1c0c19SM3YzNGwzZH0=" | base64 -d
_W4s_R3v34l3d}
```

### Tool Used

> [EventLogExpert](https://github.com/microsoft/EventLogExpert)

## Flag 🚩

`HTB{Gh0st_L0c4t10n_W4s_R3v34l3d}`
