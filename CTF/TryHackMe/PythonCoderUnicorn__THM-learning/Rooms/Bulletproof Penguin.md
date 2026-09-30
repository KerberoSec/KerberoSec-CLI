#Linux #Subscribers 
https://tryhackme.com/room/bppenguin

You have been hired by the XYZ company as a consultant to harden the Bulletproof Penguin, an old server that's never been hacked (as far as we know). As you arrive, the company's IT crew hands you a vulnerability scan report that was recently made against the server, and asks you to implement solutions to each finding. To help you, they've added notes on their discussions for each of the vulnerabilities. Armed with only your laptop, you are given SSH access to the server with the following credentials:

```
SSH 
thm : p3ngu1n
```

To help you on your quest, the crew mentions that the person who did the vulnerability scan installed a script that validates if the solutions to the reported vulnerabilities have been correctly implemented. Each time you are done implementing a solution, just run the `get-flags` command from the server's console to get a flag.

```
get-flags
{
  "ssh_weak_ciphers": "VULN",
  "ssh_weak_kex": "VULN",
  "ssh_weak_macs": "VULN",
  "redis_nopass": "VULN",
  "redis_port_public": "VULN",
  "mysql_port_public": "VULN",
  "snmp_public": "VULN",
  "nginx_asroot": "VULN",
  "unused_accounts": "VULN",
  "change_pass": "VULN",
  "sudoers_mary": "VULN",
  "sudoers_munra": "VULN",
  "cleartext_services": "VULN",
  "anon_ftp": "VULN"
}

```

## Redis server no password

```
Redis server has no password 

solution
set password using 'requirepass' director in redis.conf

find / -name redis.conf
/etc/redis/redis.conf

sudo nano /etc/redis/redis.conf
p3ngu1n

go to  security section
uncomment requirepass foobared

get-flags

"redis_nopass": "THM{ae4e5bb7aac2c2252363ca466f10ffd0}"
```

## default SNMP agent

Simple Network Management Protocol (SNMP) is a protocol which can be used by administrators to remotely manage a computer or network device. There are typically 2 modes of remote SNMP monitoring. These modes are roughly 'READ' and 'WRITE' (or PUBLIC and PRIVATE).

If an attacker is able to guess a PUBLIC community string, they would be able to read SNMP data (depending on which MIBs are installed) from the remote device. This information might include system time, IP addresses, interfaces, processes running, etc.

If an attacker is able to guess a PRIVATE community string (WRITE or 'writeall' access), they will have the ability to change information on the remote machine. This could be a huge security hole, enabling remote attackers to wreak complete havoc such as routing network traffic, initiating processes, etc. In essence, 'writeall' access will give the remote attacker full administrative rights over the remote machine.

```
SNMP community name : public 

solution
determine if detected community string is private community string

disable SNMP

Edit the file: /etc/snmp/snmpd.conf

# changed public to private
rocommunity  private default -V systemonly
rocommunity6 private default -V systemonly

"snmp_public": "THM{aa397a808d527fd71f023c78d3c04591}",
```

## Nginx running as root

The nginx server is running as user "root". An attacker could leverage this to gain privileged access to the server by abusing a vulnerable web application hosted by nginx.

```
solution
Check the "user" directive in nginx.conf and set it to use an unprivileged user instead of root.

edit /etc/nginx/nginx.conf

user root --> user www-data

sudo service nginx restart

nginx_asroot": "THM{bebb02b22bb56b2f79ba706975714ee2}"

```

## cleartext protocols 

The remote host is running a Telnet service that allows cleartext logins over unencrypted connections. An attacker can uncover login names and passwords by sniffing traffic to the Telnet service.

```
solution
replace Telnet with a protocol like SSH

- Take down the telnet service.
- Take down the service in port 69/udp.

sudo nmap -sT -O -p 69 localhost
69/ closed tftp

https://www.hivelocity.net/kb/how-to-disable-telnet-access-on-server/

/etc/xinetd.d
service telnet
{
    disable = yes
}
sudo systemctl restart xinetd

/etc/inetd.conf
#telnet stream tcp nowait root /usr/sbin/tcpd in.telnetd
sudo kill -HUP $(cat /var/run/inetd.pid)
sudo nmap -p 23 localhost
sudo killall telnetd

"cleartext_services": "THM{33704d74ec53c8cf50daf817bea836a1}"
```

## weak SSH crypto 

```
# weak key exchange (KEX) for SSH

The remote SSH server is configured to allow / support weak key exchange (KEX) algorithm(s). An attacker can quickly break individual connections.

solution
Disable the reported weak KEX algorithm(s).

https://weakdh.org/sysadmin.html

/etc/ssh/ssd_config
man sshd_config

nano etc/systconfig/sshd

systemctl restart sshd

```

```
# weak encryption algo for SSH

The remote SSH server is configured to allow / support weak encryption algorithm(s).

--------------------
The remote SSH server supports the following weak client-to-server encryption algorithm(s):

3des-cbc
aes128-cbc
aes256-cbc

The remote SSH server supports the following weak server-to-client encryption algorithm(s):

3des-cbc
aes128-cbc
aes256-cbc
--------------------

solution
Disable the reported weak encryption algorithm(s).

https://bobcares.com/blog/how-to-disable-weak-ssh-ciphers-in-linux/

sshd -T | grep “\(ciphers\|macs\|kexalgorithms\)”

```

```
# weak MAC algo for SSH

The remote SSH server is configured to allow / support weak MAC algorithm(s).

---------
The remote SSH server supports the following weak client-to-server | server-to-client MAC algorithm(s):

hmac-md5-96
---------

solution
Disable the reported weak MAC algorithm(s).

https://www.dbappweb.com/2021/07/14/disable-ssh-weak-mac-algorithms-in-linux/

```

```
sudo nano /etc/ssh/sshd_config
sudo systemctl restart sshd.service
get-flags

// remove
3des-cbc
aes128-cbc
aes256-cbc
hmac-md5-96

Ciphers 3des-cbc, //aes128-cbc, aes192-cbc, //aes256-cbc, aes128-ctr, aes192-ctr, aes256-ctr, aes128-gcm@openssh.com, aes256-gcm@openssh.com, chacha20-poly1305@openssh.com

MACs hmac-md5, hmac-md5-96, hmac-sha1, hmac-sha1-96, hmac-sha2-256, hmac-sha2-512, umac-64@openssh.com, umac-128@openssh.com, hmac-md5-etm@openssh.com, hmac-md5-96-etm@openssh.com, hmac-sha1-etm@openssh.com, hmac-sha1-96-etm@openssh.com, hmac-sha2-256-etm@openssh.com, hmac-sha2-512-etm@openssh.com, umac-64-etm@openssh.com, umac-128-etm@openssh.com

kexalgorithms curve25519-sha256, curve25519-sha256@libssh.org,  diffie-hellman-group14-sha1, diffie-hellman-group14-sha256, diffie-hellman-group16-sha512, diffie-hellman-group18-sha512, //diffie-hellman-group-exchange-sha1, diffie-hellman-group-exchange-sha256, ecdh-sha2-nistp256, ecdh-sha2-nistp384, ecdh-sha2-nistp521, sntrup4591761x25519-sha512@tinyssh.org

"ssh_weak_ciphers": "THM{9ff9c182cad601291d45951c01d0b2c7}",
"ssh_weak_kex": "THM{d9baf598ee934d79346f425a81bd693a}",
"ssh_weak_macs": "THM{e3d6b82f291b64f95213583dcd89b659}",

```

## anonymous FTP 

A host that provides an FTP service may additionally provide Anonymous FTP access as well. Under this arrangement, users do not strictly need an account on the host. Instead, the user typically enters 'anonymous' or 'ftp' when prompted for username. Although users are commonly asked to send their email address as their password, little to no verification is actually performed on the supplied data.

Based on the files accessible via this anonymous FTP login and the permissions of this account, an attacker might be able to:

- gain access to sensitive files
- upload or delete files.

```
sudo nano /etc/vsftpd.conf
anonymous_enable=NO
sudo systemctl restart vsftpd.service

get-flags

"anon_ftp": "THM{f20b5ff5a3d4c779e99c3a93d1f68c6d}"

```

## weak password 

Some accounts are using easy-to-guess passwords. An attacker could easily launch a brute-force attack against them to gain access to the server.

```
mary:Mary2023
munra:Password321

solution
Change the passwords for the reported accounts. Remember to use hard-to-guess passwords.

Erase the accounts of `joseph` and `test1` from the machine.

sudo passwd mary      lamb$ch0pz
sudo passwd munra     gr4ntyy*

"change_pass": "THM{be74a521c3982298d2e9b0e347a3807d}",

sudo deluser joseph
sudo deluser test1

"unused_accounts": "THM{1b354db0e71f75057abe69de26a637ab}",

```

## review sudo permissions

Ensure that permissions to execute elevated commands via sudo are granted only to users that strictly require it.

```
munra ALL=(ALL:ALL) ALL

Solution
Determine if the listed users should have the assigned permissions. It is generally recommended to avoid granting full sudo privileges to a user. Whenever possible, sudo privileges should be restricted to specific commands only.

1. Revoke all sudo privileges from user `munra`.
2. The user `mary` must be able to run the `/usr/bin/ss` command as root. When doing so, she must NOT be asked for her password. Assign the corresponding sudo privileges.

Note:
Be sure to use `visudo` to edit the sudoers file. Editing it directly may lead to errors and `sudo` functionality breaking.

sudo visudo

#munra ALL=(ALL:ALL) ALL
mary ALL=(root) NOPASSWD: /usr/bin/ss

su mary  : lamb$ch0pz
sudo /usr/bin/ss
exit

"sudoers_mary": "THM{a0bcb9b72fd26d0ad55cdcdcd21698f1}",
"sudoers_munra": "THM{1e9ee13fb42fea2a9eb2730c51448241}",

```

## exposed database ports

While not a vulnerability in itself, exposing database ports makes them prone to brute-force attacks and other exploits. Ensure that access to the reported database ports is restricted to the minimum necessary.

```
3306/tcp MySQL
6379/tcp Redis

solution
Determine if the database ports should be exposed. Apply ACLs or any other type of control to avoid exposing databases unnecessarily.

1. Modify the MySQL's service configuration to bind port 3306 to 127.0.0.1 (localhost) only.
2. Modify the Redis' service configuration to bind port 6379 to 127.0.0.1 (localhost) only.

sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

bind-address            = 127.0.0.1
mysqlx-bind-address     = 127.0.0.1

sudo /etc/init.d/mysql restart

"mysql_port_public": "THM{526e33142b54e13bb47b17056823ab60}",

sudo nano /etc/redis/redis.conf

bind 127.0.0.1

sudo systemctl restart redis-server

"redis_port_public": "THM{20a809866dbcf94109189c5bafabc5c2}",

```

![[Pasted image 20250220154705.png]]

## reference

https://ishsome.medium.com/tryhackme-bulletproof-penguin-9cc2fa2522f9

