#PenTesting  #Metasploit

INTRO
- https://tryhackme.com/room/metasploitintro

Metasploit is a powerful tool that can support all phases of a penetration testing engagement, from information gathering to post-exploitation.

**Metasploit Framework**: The open-source version that works from the command line.

Framework is a set of tools that allow information gathering, scanning, exploitation, exploit development, post-exploitation, etc

Main components 
- `msfconsole` = command line
- `modules` for exploits, scanners, payloads, etc
- `tools` for vulnerability research/ assessment or PenTesting: `msfvenom`

## msfconsole

the main interface with different modules of the framework

- `exploit` = piece of code that uses a vulnerability present on the target system
- `vulnerability` = a design/ coding/ logic flaw affecting the target system
- `payload` = exploit will take advantage of a vulnerability, the code that will run on the target system

**Auxiliary category**
```
# modules
admin, analyze, bnat, client, cloud, clrawler, docx,
exaple.py, example.rb, fileformat, fuzzers, gather,
scanner, server, sniffer, spoof, sqli, voip, vsploit
```

**Encoders category**
- allow you to encode the exploit and payload in hopes the anti-virus software misses it
```
cmd, geenric, mipsle, php, ppc, ruby, sparc, x64, x84
```

**Evasion category**
- evasion module will try to evade anti-virus software 
```
windows/
	applocker_evasion_install_util.rb
	applocker_evasion_msbuild.rb
	applocker_evasion_presentationhost.rb
	applocker_evasion_regasm_regsvcs.rb
	applocker_evasion_workflow_compiler.rb
	process_herpaderping.rb
	syscall_inject.rb
	windows_defender_exe.rb
	windows_defender_js_hta.rb
```

**Exploit category**
```
aix, android, apple_ios, bsd, bsdi, dialup,
example_linux_priv_esc.rb, example.py, example.rb,
firefox, freebsd, hpux, irix, linux, mainframe,
multi, netware, openbsd, osx, qnx, solaris, unix, windows
```

**NOPS category**
- no operation , do nothing
- intel x86 CPU `0x90`  used for pausing CPU for 1 cycle for consistent payload sizes
```
aarch64, armle, cmd, mipsbe, php, ppc, sparc, tty, x64, x86
```

**Payloads category**
- code that runs on target system
- Exploits will leverage a vulnerability on the target system
- getting a shell, load malware, running a command, launch `calc.exe` 

