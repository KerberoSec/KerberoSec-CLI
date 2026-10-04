## Challenge 🧩

One of the employees at your company has their computer infected by malware! Turns out every time they try to switch on the computer, it shuts down right after they log in. The story given by the employee is as follows:

1. They installed software using an installer they downloaded online
2. They ran the installed software but it seemed to do nothing
3. Now every time they bootup and login to their computer, a black command prompt screen quickly opens and closes and their computer shuts down instantly.

See if you can find evidence for the each of these events and retrieve the flag (split into 3 pieces) from the correct logs!

Author: Venax</br>
Points: 200

Hints:

1. Try to filter the logs with the right event ID
2. What could the software have done when it was ran that causes the shutdowns every time the system starts up?

## Solution 🕵️‍♂️

Since the user has installed a program, filter based on EventID `1033`

```xml
Log Name: Application
Source: MsiInstaller
Date: 15-07-2024 09:25:57 PM
Event ID: 1033
Task Category: None
Level: Information
Keywords: Classic
User: S-1-5-21-3576963320-1344788273-4164204335-1001
Computer: DESKTOP-EKVR84B
Description:
Windows Installer installed the product. Product Name: Totally_Legit_Software. Product Version: 1.3.3.7. Product Language: 0. Manufacturer: cGljb0NURntFdjNudF92aTN3djNyXw==. Installation success or error status: 0.
Event Xml:
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="MsiInstaller" />
    <EventID Qualifiers="0">1033</EventID>
    <Version>0</Version>
    <Level>4</Level>
    <Task>0</Task>
    <Opcode>0</Opcode>
    <Keywords>0x80000000000000</Keywords>
    <TimeCreated SystemTime="2024-07-15T15:55:57.7297984Z" />
    <EventRecordID>2373</EventRecordID>
    <Correlation />
    <Execution ProcessID="0" ThreadID="0" />
    <Channel>Application</Channel>
    <Computer>DESKTOP-EKVR84B</Computer>
    <Security UserID="S-1-5-21-3576963320-1344788273-4164204335-1001" />
  </System>
  <EventData>
    <Data>Totally_Legit_Software</Data>
    <Data>1.3.3.7</Data>
    <Data>0</Data>
    <Data>0</Data>
    <Data>cGljb0NURntFdjNudF92aTN3djNyXw==</Data>
    <Data>(NULL)</Data>
    <Data></Data>
    <Binary>7B33443343333833332D444544362D343032322D423541312D4537463337373839433339307D3030303037363533376239373032333966396130373530633431623838363466646163393030303030303030</Binary>
  </EventData>
</Event>
```

```text
cGljb0NURntFdjNudF92aTN3djNyXw==
```

Now we know the program name, filter using it.</br>
`Description.Contains("Totally_Legit_Software", StringComparison.OrdinalIgnoreCase)`

```xml
Log Name: Security
Source: Microsoft-Windows-Security-Auditing
Date: 15-07-2024 09:26:19 PM
Event ID: 4657
Task Category: Registry
Level: Information
Keywords: Audit Success
User: 
Computer: DESKTOP-EKVR84B
Description:
A registry value was modified.

Subject:
	Security ID:		S-1-5-21-3576963320-1344788273-4164204335-1001
	Account Name:		user
	Account Domain:		DESKTOP-EKVR84B
	Logon ID:		0x5A428

Object:
	Object Name:		\REGISTRY\MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
	Object Value Name:	Immediate Shutdown (MXNfYV9wcjN0dHlfdXMzZnVsXw==)
	Handle ID:		0x208
	Operation Type:		New registry value created

Process Information:
	Process ID:		0x1BD0
	Process Name:		C:\Program Files (x86)\Totally_Legit_Software\Totally_Legit_Software.exe

Change Information:
	Old Value Type:		-
	Old Value:		-
	New Value Type:		REG_SZ

	New Value:		C:\Program Files (x86)\Totally_Legit_Software\custom_shutdown.exe
Event Xml:
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Security-Auditing" Guid="{54849625-5478-4994-a5ba-3e3b0328c30d}" />
    <EventID>4657</EventID>
    <Version>0</Version>
    <Level>0</Level>
    <Task>12801</Task>
    <Opcode>0</Opcode>
    <Keywords>0x8020000000000000</Keywords>
    <TimeCreated SystemTime="2024-07-15T15:56:19.1031964Z" />
    <EventRecordID>168656</EventRecordID>
    <Correlation />
    <Execution ProcessID="4" ThreadID="1084" />
    <Channel>Security</Channel>
    <Computer>DESKTOP-EKVR84B</Computer>
    <Security />
  </System>
  <EventData>
    <Data Name="SubjectUserSid">S-1-5-21-3576963320-1344788273-4164204335-1001</Data>
    <Data Name="SubjectUserName">user</Data>
    <Data Name="SubjectDomainName">DESKTOP-EKVR84B</Data>
    <Data Name="SubjectLogonId">0x5a428</Data>
    <Data Name="ObjectName">\REGISTRY\MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run</Data>
    <Data Name="ObjectValueName">Immediate Shutdown (MXNfYV9wcjN0dHlfdXMzZnVsXw==)</Data>
    <Data Name="HandleId">0x208</Data>
    <Data Name="OperationType">%%1904</Data>
    <Data Name="OldValueType">-</Data>
    <Data Name="OldValue">-</Data>
    <Data Name="NewValueType">%%1873</Data>
    <Data Name="NewValue">C:\Program Files (x86)\Totally_Legit_Software\custom_shutdown.exe</Data>
    <Data Name="ProcessId">0x1bd0</Data>
    <Data Name="ProcessName">C:\Program Files (x86)\Totally_Legit_Software\Totally_Legit_Software.exe</Data>
  </EventData>
</Event>
```

```text
MXNfYV9wcjN0dHlfdXMzZnVsXw==
```

Then filter using shutdown EventID `1074`

```xml
Log Name: System
Source: User32
Date: 15-07-2024 10:31:05 PM
Event ID: 1074
Task Category: None
Level: Information
Keywords: Classic
User: S-1-5-21-3576963320-1344788273-4164204335-1001
Computer: DESKTOP-EKVR84B
Description:
The process C:\Windows\system32\shutdown.exe (DESKTOP-EKVR84B) has initiated the shutdown of computer DESKTOP-EKVR84B on behalf of user DESKTOP-EKVR84B\user for the following reason: No title for this reason could be found
 Reason Code: 0x800000ff
 Shut-down Type: shutdown
 Comment: dDAwbF94eHh4eHh4eH0=
Event Xml:
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="User32" Guid="{b0aa8734-56f7-41cc-b2f4-de228e98b946}" EventSourceName="User32" />
    <EventID Qualifiers="32768">1074</EventID>
    <Version>0</Version>
    <Level>4</Level>
    <Task>0</Task>
    <Opcode>0</Opcode>
    <Keywords>0x8080000000000000</Keywords>
    <TimeCreated SystemTime="2024-07-15T17:01:05.3935836Z" />
    <EventRecordID>3801</EventRecordID>
    <Correlation />
    <Execution ProcessID="432" ThreadID="3496" />
    <Channel>System</Channel>
    <Computer>DESKTOP-EKVR84B</Computer>
    <Security UserID="S-1-5-21-3576963320-1344788273-4164204335-1001" />
  </System>
  <EventData>
    <Data Name="param1">C:\Windows\system32\shutdown.exe (DESKTOP-EKVR84B)</Data>
    <Data Name="param2">DESKTOP-EKVR84B</Data>
    <Data Name="param3">No title for this reason could be found</Data>
    <Data Name="param4">0x800000ff</Data>
    <Data Name="param5">shutdown</Data>
    <Data Name="param6">dDAwbF94eHh4eHh4eH0=</Data>
    <Data Name="param7">DESKTOP-EKVR84B\user</Data>
  </EventData>
</Event>
```

```text
dDAwbF94eHh4eHh4eH0=
```

### Tool Used

> [EventLogExpert](https://github.com/microsoft/EventLogExpert)

## Flag 🚩

`picoCTF{Ev3nt_vi3wv3r_1s_a_pr3tty_us3ful_t00l_xxxxxxxx}`
