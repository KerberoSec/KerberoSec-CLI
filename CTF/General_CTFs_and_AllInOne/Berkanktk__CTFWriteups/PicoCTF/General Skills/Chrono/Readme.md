# Crono
## Description
How to automate tasks to run at intervals on linux servers?
Use ssh to connect to this server:
Server: `saturn.picoctf.net`
Port: `55098`
Username: `picoplayer` 
Password: `gLST9GqUXg`

## Solution
Lets start by logging into the server:
```bash
$ ssh picoplayer@saturn.picoctf.net -p 55098
```

Now that we are logged in, lets see the crontab:
```bash
$ cat /etc/crontab
picoCTF{flag_is_shown_here}
```

And we are done!
