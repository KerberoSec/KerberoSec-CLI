```                                                                         
  .g8"""bgd                            
.dP'     `M                            
dM'       ` `7Mb,od8 .gP"Ya `7MMpdMAo. 
MM            MM' "',M'   Yb  MM   `Wb 
MM.    `7MMF' MM    8M""""""  MM    M8 
`Mb.     MM   MM    YM.    ,  MM   ,AP 
  `"bmmmdPY .JMML.   `Mbmmd'  MMbmmd'  
                              MM       
                            .JMML.                                           
```
In this THM challenge, we can test our reconnaissance and OSINT skills to gather
information from publicly accessible sources and exploit potential vulnerabilities. [^1]

What is the API key that allows a user to register on the website?
-----------------------------------------------------------------------------------------
Upon visiting the website `http://<TARGET_MACHINE_IP>`, we are promted with the "Apache2
Ubuntu Default Page". At first, we suspect there to be a publicly known vulnerability in
the Apache2 servers, so we research in the internet a bit but can not immediately proceed
with any of the listed vulnerabilities since they leading to complex attacks without any
clear OSINT technique. Instead, we move on to scanning all the ports with `nmap -p-` on
the target machine:

```
PORT        STATE  SERVICE
22/tcp      open   ssh
80/tcp      open   http
443/tcp     open   https
51337/tcp   open   unknown
```

This makes us suspicious of the unkown service on port 51337, but we'll need this later.
Next, we open the site on port 443 with `https://<TARGET_MACHINE_IP>` and discover a
self-signed certificate from the organisation *SearchME* with the common name
`grep[.]thm`. We identify this as a private page in our network and therefore save the
target machine address to web page mapping in our hosts configuration:
`echo "<TARGET_MACHINE_IP> grep[.]thm" >> /etc/hosts`
Following this, we can visit the web page and are automaticallly redirect to the site
`https://grep[.]thm/public/html/`. This website states, that it is under development,
with a register and login form field. Naively, we try to register with a username,
password, email address and name of our liking but are stopped because we did not
provide the correct API key in our POST request. So, we search for the source code of
the website in Google, for example with the search query `SearchME site:github.com`.
This way, we discover a GitHub repository [^2] which appears to have been created by
the website's creators. Upon browsing the files listed here, we are especially interested
in the PHP source code for the register page [^3]. Remember what we are here for, we want
to find out the API key to register on the website. In the latest version of the repo, we
can not discover it but then we remember that repositories are history-based and upon
looking at all past commits for this file, we discover the suspiciously named commit
"Fix: remove key" [^4]. In here, we disover this line:

```php
if (isset($headers['X-THM-API-Key']) && $headers['X-THM-API-Key'] === '<REDACTED>') {
```

And indeed, in this past commit we can disover the `X-Thm-Api-Key` for registration.
Finally, we resend the POST request with the updated API key and some sample user
data, with which we can later log in. For this, we use the inspector tool in a browser
of our choice and then resend the failed registration attempt with the updated key.

What is the first flag?
-----------------------------------------------------------------------------------------
Having logged in, e.g. with
`{"username":"adam","password":"1234","email":"adam@thm.com","name":"Adam Grumpy"}`
we are now already prompted with the first flag on the dashboard. But besides this, there
is not much to discover here.

What is the email of the "admin" user?
-----------------------------------------------------------------------------------------
Besides having logged in on the website, we further investigate the GitHub source code
and besides the `register.php` API, there is also an `upload.php` API which we can access
under `https[://]grep[.]thm/public/html/upload[.]php`. After further investigating the
file upload functionality, we suspect it to be vulnerable to a malicious file upload to
gain access to a remote shell. As we have used it before, there exists the PHP reverse
shell script by PentestMonkey [^5] which we can craft to be our entry point. For that, we
download the script on the AttackBox and modify the `$ip` and `$port` to the listening
IP address and port number that we use when setting up a server. In our case, the port
would be *8888* because we are listening on it with `python3 -m http.server 8888`. Next,
we want the victim server to accept or file to be uploaded. For that, we need to make
sure that it recognizes it as an image file and not a PHP script. We identify the code in
the upload function to be checking the file type by reading the following *magic bytes*
in the beginning of the file:

```php
$allowedExtensions = ['jpg', 'jpeg', 'png', 'bmp'];
$validMagicBytes = [
    'jpg' => 'ffd8ffe0', 
    'png' => '89504e47', 
    'bmp' => '424d'
];
```
Our goal is now, to edit the hexadecimal bytes in the beginning in the file to match one
of those magic bytes. Make sure, to prepend four characters, for example "AAAA" in the
beginning of the PHP file first, in order not to overwrite the `<?ph` code. To edit the
first hexadecimals values we can then use `vi` and then `:%!xxd` followed by `:%!xxd -r`
or simply `hexedit`. The resulting `php-reverse-shell.php` should have the first bytes
set to "FFD8 FFE0" for example. With that, we can upload the reverse shell script to
the server and get the "File uploaded successfully." message.
In order, to connect the victim machine to our attacking machine, we no need to start
the script by accessing it under the `uploads/` path on the website. Immediately upon
accessing the malicious script, we are now able to enter shell commands on our python
server which is connected to the target.

Since we are interested in the stored website's data from other users, i.e. the admin
we move to the `/var/www/backup` folder on the server and discover a database
`users.sql` which contains among other sensitive data, the admin email.

```sql
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- <SNIP> --
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
-- <SNIP> --
INSERT INTO `users` (`id`, `username`, `password`, `email`, `name`, `role`) VALUES
(1, 'test', '$2y$10$dE6VAdZJCN4repNAFdsO2ePDr3StRdOhUJ1O/41XVQg91qBEBQU3G', 'test@grep.thm', 'Test User', 'user'),
(2, 'admin', '$2y$10$3V62f66VxzdTzqXF4WHJI.Mpgcaj3WxwYsh7YDPyv1xIPss4qCT9C', '<REDACTED>', 'Admin User', 'admin');
-- <SNIP> --
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);
-- <SNIP> --
```

What is the host name of the web application that allows a user to check an email for a
possible password leak?
-----------------------------------------------------------------------------------------
While navigating the server via the remote shell, we also discovered the *leakchecker*
application under `/var/www` which can be accessed under a subdomain of `grep[.]thm`.
But, in order to access it we first need to add this host name to the `/etc/hosts` file
linked to the target machine's IP address.

What is the password of the "admin" user?
-----------------------------------------------------------------------------------------
Just accessing the leakchecker web application is not enough, instead we need to append
the port number *51337* to the HTTPS protocol. Finally, we want to check if the admin
user has been pawned, and for that we enter their email address from the previous tasks
to get the password.

[^1]: https://tryhackme.com/room/greprtp
[^2]: https://github.com/supersecuredeveloper/searchmecms
[^3]: https://github.com/supersecuredeveloper/searchmecms/blob/main/api/register.php
[^4]: https://github.com/supersecuredeveloper/searchmecms/commit/db11421db2324ed0991c36493a725bf7db9bdcf6
[^5]: https://github.com/pentestmonkey/php-reverse-shell
[^6]: https://github.com/supersecuredeveloper/searchmecms/blob/main/api/upload.php
