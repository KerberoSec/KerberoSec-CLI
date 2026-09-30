# 10: Command Reference

These commands are documented only for the local VulnHub lab.

`ash
ip a
nmap -sn <LOCAL_SUBNET>
netdiscover -r <LOCAL_SUBNET>
curl -I http://10.158.174.179
curl http://10.158.174.179smbclient -L //10.158.174.179 -N
enum4linux -a 10.158.174.179smbclient //10.158.174.179/IPC$ -U <USERNAME>
curl -I http://10.158.174.179:10000
curl -I http://10.158.174.179:20000
``n
Directory discovery commands are preserved in the sanitized notes file. Username and password values are not published and are treated only as lab-only credentials.
