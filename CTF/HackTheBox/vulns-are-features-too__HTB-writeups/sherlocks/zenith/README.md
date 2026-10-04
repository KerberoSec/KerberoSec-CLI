# Zenith

## 1. When did the client receive the email?

Email is `C/Submission of Project Plan for Your Review - john@skyline.com - 2024-09-19 1845.eml`
Time is in email header.

> **ANSWER:** 2024-09-19 17:44:11

## 2. When was the malicious PDF file created? (UTC)

There's a base64 blob we can extract and convert to the PDF file `project_plan.pdf`.

`pdfinfo` can then extract the metadata.

```sh
$ pdfinfo project_plan.pdf
Producer:        PyFPDF 1.7.2 http://pyfpdf.googlecode.com/
CreationDate:    Wed Sep 18 13:57:04 2024 UTC
Custom Metadata: no
Metadata Stream: no
Tagged:          no
UserProperties:  no
Suspects:        no
Form:            none
Syntax Warning: Bad launch-type link action
JavaScript:      yes
Pages:           2
Encrypted:       no
Page size:       595.28 x 841.89 pts (A4)
Page rot:        0
File size:       11388 bytes
Optimized:       no
PDF version:     1.3
```

> **ANSWER:** 2024-09-18 13:57:03

## 3. What is the embedded file name with extension inside the malicious PDF?

`pdfdetach` (from `poppler`) can be used to view files embedded in PDFs.

```sh
$ pdfdetach -list project_plan.pdf
1 embedded files
1: downtown_construction_project_plan.pdf
```

While `pdfdetach` fails to extract it, `binwalk -e project_plan.pdf` works.

```sh
$ pdfdetach -saveall project_plan.pdf
Syntax Error (10104): Missing 'endstream' or incorrect stream length

$ binwalk -e project_plan.pdf
Analyzed 1 file for 85 file signatures (187 magic patterns) in 5.0 milliseconds

$ file downtown_construction_project_plan.pdf
downtown_construction_project_plan.pdf: PE32+ executable for MS Windows 6.00 (console), x86-64, 6 sections
```

> **ANSWER:** `downtown_construction_project_plan.pdf`

## 4. When was the Windows PE malware compiled?

```sh
$ TZ=UTC exiftool downtown_construction_project_plan.pdf | grep 'PDB'
PDB Modify Date                 : 2024:09:18 21:19:18+00:00
PDB Age                         : 1
PDB File Name                   : C:\Users\Administrator\Desktop\Projects\exit\x64\Release\exit.pdb
```

> **ANSWER:** 2024-09-18 21:19:18

## 5. What was the original project name the attacker gave to their malware Windows PE project?

From the previous PDB metadata.

> **ANSWER:** exit

## 6. To which new location in the system is the malware copying itself?

Before decompilation, I we can check for interesting strings.

```sh
$ strings 'downtown_construction_project_plan.pdf' | rg '/|\\'
/;3~.:!
/;3~,:
/;3~+:)
/;3~*:0
/;Rich#
\$@H
\$PH
u/HcH<H
\$03
\$0H
\$0H
\$83
Software\Microsoft\Windows\CurrentVersion\Run
C:\Users\Public\test.exe
C:\Users\Administrator\Desktop\Projects\exit\x64\Release\exit.pdb
        <requestedExecutionLevel level='asInvoker' uiAccess='false' />
      </requestedPrivileges>
    </security>
  </trustInfo>
</assembly>
```

Some interesting paths:
- `Software\Microsoft\Windows\CurrentVersion\Run`
- `C:\Users\Public\test.exe`
- `C:\Users\Administrator\Desktop\Projects\exit\x64\Release\exit.pdb`

Decompiling in Ghidra, we can search for the above strings, trace their usages, and find that the function function `void FUN_140001070(void)` has some malware-like behaviors, including those in the question.

```c
BVar13 = CopyFileW(local_228,L"C:\\Users\\Public\\test.exe",0);
pcVar20 = "Executable successfully copied to: %ul\n";
```

> **ANSWER:** `C:\Users\Public\test.exe`

## 7. What is the name of the registry value key that the malware is creating inside the Run folder?

```c
pcVar20 = "Software\\Microsoft\\Windows\\CurrentVersion\\Run";
uVar22 = 0;
uVar21 = 0;
uVar14 = RegCreateKeyExA((HKEY)0xffffffff80000001,
                        "Software\\Microsoft\\Windows\\CurrentVersion\\Run",0,(LPSTR)0x0,0,2,
                        (LPSECURITY_ATTRIBUTES)0x0,local_658,local_408);
if (uVar14 == 0) {
pcVar17 = "Registry key created successfully.\n";
if (local_408[0] != 1) {
    pcVar17 = "Registry key opened successfully.\n";
}
FUN_140001010(pcVar17,pcVar20,uVar21,uVar22);
pcVar20 = "WindowsPooler";
uVar22 = 1;
uVar21 = 0;
uVar14 = RegSetValueExA(local_658[0],"WindowsPooler",0,1,(BYTE *)"C:\\Users\\Public\\test.exe",
                        0x19);
if (uVar14 == 0) {
    FUN_140001010("Registry value set successfully.\n",pcVar20,uVar21,uVar22);
    RegCloseKey(local_658[0]);
}
else {
    pcVar20 = (char *)(ulonglong)uVar14;
    FUN_140001010("Failed to set registry value. Error code: %ul",pcVar20,uVar21,uVar22);
    RegCloseKey(local_658[0]);
}
}
else {
pcVar20 = (char *)(ulonglong)uVar14;
FUN_140001010("Failed to create or open registry key.Error code : %ul",pcVar20,uVar21,uVar22);
}
```

> **ANSWER:** WindowsPooler

## 8. What is the name of the process being targeted for injection by the malware?

> **ANSWER:** `explorer.exe`

## 9. Which operating system is the client using?

```sh
$ rg -i '\b(OS|operating system)\b'
2024-09-19T20_11_05_4980481_ConsoleLog.txt
3:[2024-09-19 21:11:06.1880490 | INF] System info: Machine name: FELAMOS-PC, 64-bit: true, User: felamos OS: "Windows7" (6.1.7601)

C/Target/2024-09-19T20_42_28_8007327_ConsoleLog.txt
3:[2024-09-19 21:42:29.3707335 | INF] System info: Machine name: FELAMOS-PC, 64-bit: true, User: felamos OS: "Windows7" (6.1.7601)
889:[2024-09-19 21:43:22.8108663 | ERR]     os\Desktop\Study\Outputs\Module\Persistence\WMI Providers\WMI Event Filters.csv
964:[2024-09-19 21:43:22.9908666 | ERR]     os\Desktop\Study\Outputs\Module\Persistence\WMI Providers\WMI Event Filters.csv

C/Module/2024-09-19T20_42_28_8007327_ConsoleLog.txt
3:[2024-09-19 21:42:29.3707335 | INF] System info: Machine name: FELAMOS-PC, 64-bit: true, User: felamos OS: "Windows7" (6.1.7601)
889:[2024-09-19 21:43:22.8108663 | ERR]     os\Desktop\Study\Outputs\Module\Persistence\WMI Providers\WMI Event Filters.csv
964:[2024-09-19 21:43:22.9908666 | ERR]     os\Desktop\Study\Outputs\Module\Persistence\WMI Providers\WMI Event Filters.csv
```

> **ANSWER:** Windows7

## 10. What is the full name of the Adobe PDF program?

```sh
cd C/Module
rg -i adobe
# "Adobe Reader 9" matches to hint
```

> **ANSWER:** Adobe Reader 9

## 11. When did the attacker use the GetSystem service installation to gain NT Authority/SYSTEM access?

Following [Hunting for GetSystem in offensive security tools](https://redcanary.com/blog/threat-detection/getsystem-offsec/), we can either
- do a simple custom search `chainsaw search -t 'Event.System.EventID: =7045' -e 'cmd.exe'`, or
- search using a known rule for GetSystem: [`meterpreter_cobalt_strike_getsystem.yml`](https://github.com/WithSecureLabs/chainsaw/blob/master/rules/evtx/service_installation/meterpreter_cobalt_strike_getsystem.yml)

```sh
$ chainsaw search -t 'Event.System.EventID: =7045' -e 'cmd.exe' -q
---
Event:
  EventData:
    AccountName: LocalSystem
    ImagePath: cmd.exe /c echo ismzjo > \\.\pipe\ismzjo
    ServiceName: ismzjo
    ServiceType: user mode service
    StartType: demand start
  System:
    Channel: System
    Computer: felamos-PC
    Correlation: null
    EventID: 7045
    EventID_attributes:
      Qualifiers: 16384
    EventRecordID: 1663
    Execution_attributes:
      ProcessID: 500
      ThreadID: 152
    Keywords: '0x8080000000000000'
    Level: 4
    Opcode: 0
    Provider_attributes:
      EventSourceName: Service Control Manager
      Guid: '{555908d1-a6d7-4695-8e1e-26931d2012f4}'
      Name: Service Control Manager
    Security_attributes:
      UserID: S-1-5-21-4070686328-154671616-3643734112-1001
    Task: 0
    TimeCreated_attributes:
      SystemTime: 2024-09-19T17:48:31.356054Z
    Version: 0
Event_attributes:
  xmlns: http://schemas.microsoft.com/win/2004/08/events/event
```

```sh
$ chainsaw hunt -q --log -r ../meterpreter_cobalt_strike_getsystem.yml .
2024-09-19T17:48:31.356054+00:00  |  c  |  Meterpreter or Cobalt Strike Getsystem Service Installation  |  1  |  7045  ::  1663  ::  felamos-PC  ::  ismzjo  ::  cmd.exe /c echo ismzjo > \\.\pipe\ismzjo  ::  user mode service  ::  demand start  ::  LocalSystem
```

> **ANSWER:** 2024-09-19 17:48:31

## 12. When did the attacker establish their final persistence by installing the WindowsPooler service?

```sh
$ chainsaw search WindowsPooler given/C/Target/C/Windows/System32/winevt/logs/
Event:
  EventData:
    AccountName: LocalSystem
    ImagePath: '"C:\Windows\WindowsPooler.exe" pKVInNe'
    ServiceName: Core part of Windows Services
    ServiceType: user mode service
    StartType: auto start
  System:
    Channel: System
    Computer: felamos-PC
    Correlation: null
    EventID: 7045
    EventID_attributes:
      Qualifiers: 16384
    EventRecordID: 1669
    Execution_attributes:
      ProcessID: 500
      ThreadID: 4084
    Keywords: '0x8080000000000000'
    Level: 4
    Opcode: 0
    Provider_attributes:
      EventSourceName: Service Control Manager
      Guid: '{555908d1-a6d7-4695-8e1e-26931d2012f4}'
      Name: Service Control Manager
    Security_attributes:
      UserID: S-1-5-21-4070686328-154671616-3643734112-1001
    Task: 0
    TimeCreated_attributes:
      SystemTime: 2024-09-19T17:50:17.318203Z
    Version: 0
Event_attributes:
  xmlns: http://schemas.microsoft.com/win/2004/08/events/event

[+] Found 1 hits
```

> **ANSWER:** 2024-09-19 17:50:17

