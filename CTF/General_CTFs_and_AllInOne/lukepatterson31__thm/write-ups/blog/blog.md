# Blog

set blog.thm in /etc/host

Ports:

- 22/tcp SSH OpenSSH 7.6p1 Ubuntu 4ubuntu0.3
- 80/tcp  HTTP Apache httpd 2.4.29
- 139/tcp NetBIOS Samba smbd 3.X: 4.X
- 445/tcp SMB Samba smbd 4.7.6-Ubuntu

Notes:

- Multiple vulnerabilities detected by WPScan -> [blog.wpscan](./blog.wpscan)
- Found users `kwheel` and `bjoel`
- Taylor Swift/tswift, Alice in Wonderland/White Rabbit, Billy Joel: We Didn't Start the Fire

### Enumeration

**HTTP/WordPress**

Multiple vulnerabilities in WordPress v5.0, namely:

- Authenticated RCE
- Unauthenticated view private/draft posts

Theme twentytwenty v1.3

Found users:
- bjoel
- kwheel

brute forced kwheel's password with hydra

`hydra -u kwheel -p /usr/share/wordlists/rockyou.txt blog.thm http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log+In&redirect_to=http%3A%2F%2Fblog.thm%2Fwp-admin%2F&testcookie=1:F=The password you entered for the username" -V
`

**SMB**

Share called BillySMB, contains files:

- tswift.mp4 is a segemnt of Taylor Swift: I Knew You Were Trouble video with a goat screaming edited in
- PNG of the rabbit from Alice in Wonderland
- QR code linking to the video for Billy joel: We Didn't Start the Fire

### Exploitation

Use kweel's credentials and the metasploit module WordPress Crop-image Shell Upload to gain a remote shell

Check suid/sgid binaries with find:

`find / -type f -perm -04000 -ls 2>/dev/null`

Found an unknown binary in /usr/sbin called checker

Analyse it with ltrace to find it evaluates the admin variable

Setting admin=1 and running checker executes a bash shell as root, granting access to user.txt and root.txt
