<h1 align="center">Royal Router</h1>
<p align="center"><img width="80px" src="https://github.com/user-attachments/assets/75e31f34-ccdb-49df-a2e9-58c249ef95df"><br>
2025, September 13<br> Hey there, fellow lifelong learner! I´m <a href="https://www.linkedin.com/in/rosanafssantos/">Rosana</a>,<br>
and I’m excited to join you on this adventure, part of my <code>495</code>-day-streak in<a href="https://tryhackme.com"> TryHackMe</a>.<br>
<em>You will learn how to compromise an IoT device</em>.<br>
Access it <a href="https://tryhackme.com/room/hfb1royalrouter">here</a>.<br>
<img width="1200px" src="https://github.com/user-attachments/assets/7fcf12cf-d5b0-44c5-90bf-1dad8c3829df"></p>

<h1>Task 1 . IoT . Royal Router</h1>
<p>Cipher exposes a crucial router at the edge of his network, creating a narrow window for potential intrusions.  It could grant access to the internal network where he stores his operations and compromised systems.<br>

The VM needs 5 minutes to properly boot up.</p>

<h6 align="center"><img width="200px" src="https://github.com/user-attachments/assets/de754c4a-8db2-427d-ab2c-6a0724047e7f"><br>TryHackMe</h6>

<p><em>Answer the question below</em></p>

<h2>nikto</h2>
<p>

- All CGI directories 'found' ...</p>

```bash
:~/RoyalRouter# nikto -h xx.xxx.xx.xxx
- Nikto v2.1.5
---------------------------------------------------------------------------
+ Target IP:          xx.xxx.xx.xxx
+ Target Hostname:    xx.xxx.xx.xxx
+ Target Port:        80
+ Start Time:         2025-09-13 xx:xx:xx (GMT1)
---------------------------------------------------------------------------
+ Server: httpd
+ The anti-clickjacking X-Frame-Options header is not present.
+ All CGI directories 'found', use '-C none' to test none
...
+ Multiple index files found: index.asp, default.asp
...
+ OSVDB-637: /~root/: Allowed to browse root's home directory.
...
+ /cgi.cgi/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /webcgi/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /cgi-914/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /cgi-915/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /bin/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /cgi/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /mpcgi/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /cgi-bin/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /ows-bin/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /cgi-sys/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /cgi-local/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /htbin/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /cgibin/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /cgis/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /scripts/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /cgi-win/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /fcgi-bin/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /cgi-exe/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /cgi-home/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /cgi-perl/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /scgi-bin/blog/: A blog was found. May contain security problems in CGIs, weak passwords, and more.
+ /tsweb/: Microsoft TSAC found. http://www.dslwebserver.com/main/fr_index.html?/main/sbs-Terminal-Services-Advanced-Client-Configuration.html
+ OSVDB-17653: /SiteServer/Admin/commerce/foundation/domain.asp: Displays known domains of which that server is involved.
+ OSVDB-17654: /SiteServer/Admin/commerce/foundation/driver.asp: Displays a list of installed ODBC drivers.
+ OSVDB-17652: /SiteServer/admin/findvserver.asp: Gives a list of installed Site Server components.
+ /SiteServer/Admin/knowledge/dsmgr/default.asp: Used to view current search catalog configurations
+ OSVDB-17656: /SiteServer/Admin/knowledge/dsmgr/users/GroupManager.asp: Used to create, modify, and potentially delete LDAP users and groups.
+ OSVDB-17657: /SiteServer/Admin/knowledge/dsmgr/users/UserManager.asp: Used to create, modify, and potentially delete LDAP users and groups.
+ /prd.i/pgen/: Has MS Merchant Server 1.0
+ /SiteServer/admin/: Site Server components admin. Default account may be 'LDAP_Anonymous', pass is 'LdapPassword_1'. see http://www.wiretrip.net/rfp/p/doc.asp/i1/d69.htm
+ /siteseed/: Siteseed pre 1.4.2 has 'major' security problems.
+ /iisadmin/: Access to /iisadmin should be restricted to localhost or allowed hosts only.
+ /w-agora/: w-agora pre 4.1.4 may allow a remote user to execute arbitrary PHP scripts via URL includes in include/*.php and user/*.php files. Default account is 'admin' but password set during install.
+ /upload.asp: An ASP page that allows attackers to upload files to server
+ /uploadn.asp: An ASP page that allows attackers to upload files to server
+ /uploadx.asp: An ASP page that allows attackers to upload files to server
+ /server/: If port 8000, Macromedia JRun 4 build 61650 remote administration interface is vulnerable to several XSS attacks.
+ /shopa_sessionlist.asp: VP-ASP shopping cart test application is available from the web. This page may give the location of .mdb files which may also be available.
+ /typo3conf/: This may contain sensitive Typo3 files.
+ /webcart/carts/: This may allow attackers to read credit card data. Reconfigure to make this dir not accessible via the web.
+ /webcart/config/: This may allow attackers to read credit card data. Reconfigure to make this dir not accessible via the web.
+ /webcart/orders/: This may allow attackers to read credit card data. Reconfigure to make this dir not accessible via the web.
+ /_mem_bin/auoconfig.asp: Displays the default AUO (LDAP) schema, including host and port.
...
+ OSVDB-6666: /cgi.cgi/hpnst.exe?c=p+i=SrvSystemInfo.html: HP Instant TopTools may be vulnerable to a DoS by requesting hpnst.exe?c=p+i=hpnst.exe multiple times.
+ OSVDB-728: /admentor/adminadmin.asp: Version 2.11 of AdMentor is vulnerable to SQL injection during login, in the style of: ' or =
+ OSVDB-10107: /author.asp: May be FactoSystem CMS, which could include SQL injection problems that could not be tested remotely.
+ OSVDB-4015: /jigsaw/: Jigsaw server may be installed. Versions lower than 2.2.1 are vulnerable to Cross Site Scripting (XSS) in the error page.
+ /ammerum/: Ammerum pre 0.6-1 had several security issues.
+ /ariadne/: Ariadne pre 2.1.2 has several vulnerabilities. The default login/pass to the admin page is admin/muze.
+ /config/: Configuration information may be available remotely.
+ OSVDB-5088: /accounts/getuserdesc.asp: Hosting Controller 2002 administration page is available. This should be protected.
+ /cgi.cgi/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /webcgi/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /cgi-914/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /cgi-915/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /bin/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /cgi/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /mpcgi/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /cgi-bin/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /ows-bin/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /cgi-sys/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /cgi-local/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /htbin/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /cgibin/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /cgis/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /scripts/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /cgi-win/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /fcgi-bin/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /cgi-exe/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
+ /cgi-home/mt-static/: Movable Type weblog found. May contain security problems in CGIs, weak passwords, and more. Default login 'Melody' with password 'Nelson'.
...
+ OSVDB-3092: /cgi.cgi/stats_old/: This might be interesting...
+ OSVDB-3092: /webcgi/stats_old/: This might be interesting...
+ OSVDB-3092: /cgi-914/stats_old/: This might be interesting...
+ OSVDB-3092: /cgi-915/stats_old/: This might be interesting...
+ OSVDB-3092: /bin/stats_old/: This might be interesting...
+ OSVDB-3092: /cgi/stats_old/: This might be interesting...
+ OSVDB-3092: /mpcgi/stats_old/: This might be interesting...
+ OSVDB-3092: /cgi-bin/stats_old/: This might be interesting...
+ OSVDB-3092: /ows-bin/stats_old/: This might be interesting...
+ OSVDB-3092: /cgi-sys/stats_old/: This might be interesting...
+ OSVDB-3092: /cgi-local/stats_old/: This might be interesting...
+ OSVDB-3092: /htbin/stats_old/: This might be interesting...
+ OSVDB-3092: /cgibin/stats_old/: This might be interesting...
+ OSVDB-3092: /cgis/stats_old/: This might be interesting...
+ OSVDB-3092: /scripts/stats_old/: This might be interesting...
+ OSVDB-3092: /cgi-win/stats_old/: This might be interesting...
+ OSVDB-3092: /fcgi-bin/stats_old/: This might be interesting...
+ OSVDB-3092: /cgi-exe/stats_old/: This might be interesting...
+ OSVDB-3092: /cgi-home/stats_old/: This might be interesting...
+ OSVDB-3092: /cgi-perl/stats_old/: This might be interesting...
+ OSVDB-3092: /scgi-bin/stats_old/: This might be interesting...
...
+ /project-admins/: Admin login page/section found.
+ /pureadmin/: Admin login page/section found.
+ /radmind-1/: Admin login page/section found.
+ /radmind/: Admin login page/section found.
+ /rcLogin/: Admin login page/section found.
+ /server_admin_small/: Admin login page/section found.
+ /Server.asp: Admin login page/section found.
+ /ServerAdministrator/: Admin login page/section found.
+ /showlogin/: Admin login page/section found.
+ /simpleLogin/: Admin login page/section found.
+ /smblogin/: Admin login page/section found.
+ /sql-admin/: Admin login page/section found.
+ /ss_vms_admin_sm/: Admin login page/section found.
+ /sshadmin/: Admin login page/section found.
+ /staradmin/: Admin login page/section found.
+ /sub-login/: Admin login page/section found.
+ /Super-Admin/: Admin login page/section found.
+ /support_login/: Admin login page/section found.
+ /sys-admin/: Admin login page/section found.
+ /sysadmin.asp: Admin login page/section found.
+ /sysadmin/: Admin login page/section found.
+ /SysAdmin/: Admin login page/section found.
+ /SysAdmin2/: Admin login page/section found.
+ /sysadmins/: Admin login page/section found.
+ /system_administration/: Admin login page/section found.
+ /system-administration/: Admin login page/section found.
+ /ur-admin.asp: Admin login page/section found.
+ /ur-admin/: Admin login page/section found.
+ /useradmin/: Admin login page/section found.
+ /UserLogin/: Admin login page/section found.
+ /utility_login/: Admin login page/section found.
+ /v2/painel/: Admin login page/section found.
+ /vadmind/: Admin login page/section found.
+ /vmailadmin/: Admin login page/section found.
+ /webadmin.asp: Admin login page/section found.
+ /webmaster/: Admin login page/section found.
+ /websvn/: Admin login page/section found.
+ /wizmysqladmin/: Admin login page/section found.
+ /wp-admin/: Admin login page/section found.
+ /wp-login/: Admin login page/section found.
+ /xlogin/: Admin login page/section found.
+ /yonetici.asp: Admin login page/section found.
+ /yonetim.asp: Admin login page/section found.
+ OSVDB-3092: /test.asp: This might be interesting...
+ /maintenance.asp: This might be interesting...
+ /maint/: This might be interesting...
+ /maint.asp: This might be interesting...
+ 6544 items checked: 474 error(s) and 1071 item(s) reported on remote host
+ End Time:           2025-09-13 xx:xx:xx (GMT1) (184 seconds)
```

<h2>nmap</h2>

<p>

- 80 : http : DD-WRT milli_httpd : D-LINK CORPORATION, INC | WIRELESS ROUTER | LOGIN</p>

```bash
:~/RoyalRouter# nmap -p- -vv xx.xxx.xx.xxx
...
PORT      STATE SERVICE REASON
22/tcp    open  ssh     syn-ack ttl 64
23/tcp    open  telnet  syn-ack ttl 63
80/tcp    open  http    syn-ack ttl 63
9999/tcp  open  abyss   syn-ack ttl 63
20443/tcp open  unknown syn-ack ttl 63
24433/tcp open  unknown syn-ack ttl 63
28080/tcp open  unknown syn-ack ttl 63
50628/tcp open  unknown syn-ack ttl 63
```

```bash
:~/RoyalRouter# nmap -sC -sV -Pn -T4 -p22,23,80,9999,20443,24433,28080,50628 xx.xxx.xx.xxx
...
PORT      STATE SERVICE    VERSION
22/tcp    open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
23/tcp    open  tcpwrapped
80/tcp    open  http       DD-WRT milli_httpd
|_http-server-header: httpd
|_http-title: D-LINK CORPORATION, INC | WIRELESS ROUTER | LOGIN
9999/tcp  open  tcpwrapped
20443/tcp open  tcpwrapped
24433/tcp open  tcpwrapped
28080/tcp open  tcpwrapped
50628/tcp open  tcpwrapped
```

<h2>DD-WRT milli-httpd</h2>

<img width="660" height="152" alt="image" src="https://github.com/user-attachments/assets/3ea97c48-a543-4b93-a1e8-3ac45e8faa46" />

<br>
<br>
<h2>Web port 80</h2>
<p>

- Product-Page: DIR-615
- Hardware version: C2<br>
- Firmware Version: 3.03WW<br>
- https://nvd.nist.gov/vuln/detail/CVE-2021-37388</p>

<br>
<br>

<h3>CVE-201-37288</h3>

<img width="1888" height="871" alt="image" src="https://github.com/user-attachments/assets/207fabe6-6bb5-4cf4-a21a-e003630ac049" />

<br>
<br>

<img width="1110" height="407" alt="image" src="https://github.com/user-attachments/assets/3c4e6d0d-647c-4b12-86f7-6bda1fe185a3" />

<br>
<br>

<img width="662" height="352" alt="image" src="https://github.com/user-attachments/assets/46fdbd8e-ff7b-4f68-9b0e-24130cd37a56" />

<br>
<br>

<img width="665" height="387" alt="image" src="https://github.com/user-attachments/assets/0c53ca29-de53-4259-a970-f0e7f532e2fe" />

<br>
<br>

<img width="663" height="277" alt="image" src="https://github.com/user-attachments/assets/25b174d4-1c4f-447b-b873-f5015395149e" />

<br>
<br>

<img width="1021" height="376" alt="image" src="https://github.com/user-attachments/assets/9309433f-bcaa-4af8-9d35-3f4f48c4dfe0" />

<br>
<br>

<img width="1010" height="315" alt="image" src="https://github.com/user-attachments/assets/fa9f1e9f-75eb-4482-9759-a16b330ad770" />

<br>
<br>

<img width="586" height="97" alt="image" src="https://github.com/user-attachments/assets/b58faaed-cbf4-476a-9f15-cb8bf98f80cb" />

<br>
<br>

<img width="1017" height="326" alt="image" src="https://github.com/user-attachments/assets/d2c015a6-1879-4288-8c2f-bf084545b461" />

<br>
<br>

<img width="866" height="127" alt="image" src="https://github.com/user-attachments/assets/36d2d289-74eb-4737-99ae-a4fcaeaed5ca" />

<br>
<br>

<img width="1009" height="308" alt="image" src="https://github.com/user-attachments/assets/b0d50d2f-1ad7-41a7-b993-326948339357" />

<br>
<br>

<img width="956" height="156" alt="image" src="https://github.com/user-attachments/assets/7bca2caa-9848-4ae5-91e0-6756fbe30e40" />

<br>
<br>
<p>1.1. What is the flag?<br>
<code>THM{**************************}</code></p>

<br>
<br>
<h2 align="center">Completed</h2>
<p align="center"><img width="1200px" src="https://github.com/user-attachments/assets/6e35d71a-0b93-47c1-b62b-2ca3fc87bdb0"><br>
                  <img width="1200px" src="https://github.com/user-attachments/assets/73cbbb24-e4bd-4b82-947d-decad8e8da00"></p>

<h2 align="center">My TryHackMe Journey ・ 2025, September</h2>

<div align="center"><h6>

| Date              | Room                                  |Streak   |   All Time<br>Global   |   All Time<br>Brazil   |   Monthly<br>Global   |   Monthly<br>Brazil  | Points   | Rooms<br>Completed     | Badges    |
|:------------------|:--------------------------------------|--------:|:-----------: | :----------: | :---------: | :--------: | :------  | :-------: | :-------: |
| 2025, Sep 13      |Hard 🚩: <code><strong>Royal Router</strong></code>| 495  | 107ᵗʰ | 5ᵗʰ  |     388ᵗʰ    |     6ᵗʰ    | 126,160  |    962    |    74     |
| 2025, Sep 13      |Medium 🚩: Void Execution             | 495  | 107ᵗʰ | 5ᵗʰ  |     383ʳᵈ    |     6ᵗʰ    | 126,120  |    961    |    73     |
| 2025, Sep 12      |Easy 🚩: Invite Only                  | 494    |     110ᵗʰ    |      5ᵗʰ     |     352ⁿᵈ    |     6ᵗʰ    | 126,056  |    960    |    73     |
| 2025, Sep 12      |Medium 🚩: Devie                      | 494    |     110ᵗʰ    |      5ᵗʰ     |     607ᵗʰ    |     9ᵗʰ    | 125,606  |    959    |    73     |
| 2025, Sep 11      |Medium 🚩: Backtrack, in progress     | 493    |     110ᵗʰ    |      5ᵗʰ     |     629ᵗʰ    |     9ᵗʰ    | 125,516  |    958    |    73     |
| 2025, Sep 11      |Easy 🔗: Detecting Web Attacks        | 493    |     110ᵗʰ    |      5ᵗʰ     |     629ᵗʰ    |     9ᵗʰ    | 125,516  |    958    |    73     |
| 2025, Sep 10      |Easy 🔗: Attacking ICS Plant #1       | 492    |     110ᵗʰ    |      5ᵗʰ     |     675ᵗʰ    |     9ᵗʰ    | 125,428  |    957    |    73     |
| 2025, Sep 10      |Easy 🔗: SOC Role in Blue Team        | 492    |     110ᵗʰ    |      5ᵗʰ     |     664ᵗʰ    |     9ᵗʰ    | 125,292  |    956    |    73     |
| 2025, Sep 9       |Hard 🚩: Python Playground            | 491    |     111ˢᵗ    |      5ᵗʰ     |     693ʳᵈ    |     9ᵗʰ    | 125,236  |    955    |    73     |
| 2025, Sep 9       |Hard 🚩: Borderlands                  | 491    |     111ˢᵗ    |      5ᵗʰ     |     713ʳᵈ    |    10ᵗʰ    | 125,146  |    954    |    73     |
| 2025, Sep 9       |Medium 🚩: Forgotten Implant          | 491    |     112ⁿᵈ    |      5ᵗʰ     |     660ᵗʰ    |    10ᵗʰ    | 125,016  |    953    |    73     |
| 2025, Sep 8       |Easy 🔗: Web Enumeration              | 490    |     112ⁿᵈ    |      5ᵗʰ     |     663ʳᵈ    |    10ᵗʰ    | 124,986  |    952    |    73     |
| 2025, Sep 8       |Easy 🔗: iOS: Forensics               | 490    |     113ʳᵈ    |      5ᵗʰ     |     548ᵗʰ    |     9ᵗʰ    | 124,850  |    951    |    73     |
| 2025, Sep 7       |Medium 🚩: VulnNet: Active            | 489    |     114ᵗʰ    |      5ᵗʰ     |     542ⁿᵈ    |     9ᵗʰ    | 124,746  |    950    |    73     |
| 2025, Sep 7       |Medium 🚩: pyLon                      | 489    |     114ᵗʰ    |      5ᵗʰ     |     535ᵗʰ    |     9ᵗʰ    | 124,716  |    949    |    73     |
| 2025, Sep 7       |Medium 🚩: Pressed                    | 489    |     113ʳᵈ    |      5ᵗʰ     |     508ᵗʰ    |     9ᵗʰ    | 124,886  |    948    |    73     |
| 2025, Sep 6       |Easy 🚩: Classic Passwd               | 488    |     114ᵗʰ    |      5ᵗʰ     |     683ʳᵈ    |    12ⁿᵈ    | 124,476  |    947    |    73     |
| 2025, Sep 6       |Medium 🚩: toc2                       | 488    |     114ᵗʰ    |      5ᵗʰ     |     695ᵗʰ    |    12ⁿᵈ    | 124,446  |    946    |    73     |
| 2025, Sep 6       |Hard 🚩: Extract                      | 488    |     114ᵗʰ    |      5ᵗʰ     |     716ᵗʰ    |    13ʳᵈ    | 124,386  |    945    |    73     |
| 2025, Sep 6       |Medium 🚩: Plotted-EMR                | 488    |     114ᵗʰ    |      5ᵗʰ     |     844ᵗʰ    |    12ⁿᵈ    | 124,326  |    944    |    73     |
| 2025, Sep 5       |Medium 🚩: Inferno                    | 487    |     114ᵗʰ    |      5ᵗʰ     |     758ᵗʰ    |    12ⁿᵈ    | 124,236  |    943    |    73     |
| 2025, Sep 5       |Easy 🔗: Psycho Break                 | 487    |     115ᵗʰ    |      5ᵗʰ     |     724ᵗʰ    |    10ᵗʰ    | 124,152  |    942    |    73     |
| 2025, Sep 4       |Medium 🚩: Cold VVars                 | 486    |     113ʳᵈ    |      5ᵗʰ     |     579ᵗʰ    |    10ᵗʰ    | 124,048  |    941    |    73     |
| 2025, Sep 4       |Medium 🔗: IP and Domain Threat Intel | 486    |     113ʳᵈ    |	    5ᵗʰ     |     579ᵗʰ    |    10ᵗʰ    | 124,018  |   940    |    73     |
| 2025, Sep 3       |Easy 🔗: Malware Classification       | 485    |     112ⁿᵈ    |      5ᵗʰ     |     714ᵗʰ    |    13ʳᵈ    | 123,882  |    939    |    73     |
| 2025, Sep 2       |Medium 🔗: Session Forencics          | 484    |     111ˢᵗ    |      5ᵗʰ     |     706ᵗʰ    |    14ᵗʰ    | 123,786  |    938    |    73     |
| 2025, Sep 1       |Medium 🚩: Voyage                     | 483    |     111ˢᵗ    |      5ᵗʰ     |     849ᵗʰ    |    15ᵗʰ    | 123,636  |    937    |    73     |
</h6></div><br>

<br>

<p align="center">Global All Time:   107ᵗʰ<br><img width="250px" src="https://github.com/user-attachments/assets/12c2592b-bb20-4c52-831a-7fb52d84594d"><br>
                                              <img width="1200px" src="https://github.com/user-attachments/assets/c5a1d0c1-5c57-4b2c-8434-ec14e8e7471e"><br><br>
                  Brazil All Time:     5ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/1ad349bc-d407-4b6b-892a-5161837b7714"><br>
                  Global monthly:   388ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/6d25d0b9-3509-40c9-83e0-89d9be126b06"><br>
                  Brazil monthly:      6ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/05cb5f71-9fce-4153-a07f-b51d6f13be40"><br>

<h2 align="center">Thanks for coming!</h2>
<p align="center">Follow me on <a href="https://medium.com/@RosanaFS">Medium</a>, here on <a href="https://github.com/RosanaFSS/TryHackMe">GitHub</a>, and on <a href="https://www.linkedin.com/in/rosanafssantos/">LinkedIN</a>.</p>  

