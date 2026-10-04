```                                                                                
▄▄▄▖        ▗  ▖        ▐    ▄▄ ▗  ▖         ▄▄     ▐                ▝  ▐       
 ▐   ▖▄ ▗ ▗ ▐  ▌ ▄▖  ▄▖ ▐ ▗ ▝ ▝▌▐▌▐▌        ▐▘ ▘▗ ▗ ▐▄▖  ▄▖  ▄▖  ▖▄ ▗▄  ▐▄▖  ▄▖ 
 ▐   ▛ ▘▝▖▞ ▐▄▄▌▝ ▐ ▐▘▝ ▐▗▘  ▗▄▘▐▐▌▌ ▐      ▝▙▄ ▐ ▐ ▐▘▜ ▐ ▝ ▐▘▝  ▛ ▘ ▐  ▐▘▜ ▐▘▐ 
 ▐   ▌   ▙▌ ▐  ▌▗▀▜ ▐   ▐▜    ▝▌▐▝▘▌          ▝▌▐ ▐ ▐ ▐  ▀▚ ▐    ▌   ▐  ▐ ▐ ▐▀▀ 
 ▐   ▌   ▜  ▐  ▌▝▄▜ ▝▙▞ ▐ ▚ ▝▄▟▘▐  ▌ ▐      ▝▄▟▘▝▄▜ ▐▙▛ ▝▄▞ ▝▙▞  ▌  ▗▟▄ ▐▙▛ ▝▙▞ 
         ▞                                                                      
        ▝▘
```
In this THM special CTF room, we want to help Hack3M reach 3 million subscribers. [^1]

Exploitation
-----------------------------------------------------------------------------------------
**What is the invite code for the `hackme.thm` website?**

We begin by visiting the web application of the target IP address and try to understand
the problem of the unkown invitation code. In the source code of the website, we notice
an `/img/` folder which is accessible and contains multiple images for us to see. Also,
we discover the cookie value of the current session stored in `PHPSESSID` but nothing
further susceptible there. Then, we move on to the `/sign_up.php` page and investigate it
in the developer tools. Along with this PHP script, the web server also sends an 
`invite.js` script from which we can see the instructions on how to get the invite code.
```js
function e() {
    var e = window.location.hostname;
    if (e === "capture3millionsubscribers.thm") {
        var o = new XMLHttpRequest;
        o.open("POST", "inviteCode1337HM.php", true);
        o.onload = function() {
            if (this.status == 200) {
                console.log("Invite Code:", this.responseText)
            } else {
                console.error("Error fetching invite code.")
            }
        };
        o.send()
    } else if (e === "hackme.thm") {
        console.log("This function does not operate on hackme.thm")
    } else {
        console.log("Lol!! Are you smart enough to get the invite code?")
    }
}
```
This script performs a hostname check followed by a hidden HTTP POST request to
`http://capture3millionsubscribers.thm/inviteCode1337HM.php` and prints the server's
response code into the browser's developer console if the hostname was correct. Since we
previously accessed the website over the IP address only, we will now add two entries to
`/etc/hosts` that contain the `<TARGET_IP_ADDRESS> hackme.thm` and
`<TARGET_IP_ADDRESS> capture3millionsubscribers.thm` domains. Having done this, we can
navigate to the `http[://]capture3millionsubscribers[.]thm/sign_up.php` sign up page and
execute the `e()` function. This provokes a POST request to the invite page which
results in us obtaining the desired invitation code.

**What is the password for the user `guest@hackme.thm`?**

After entering the invite code from the previous task in the sign up page, we get the
guest login credentials for `guest@hackme.thm:[REDACTED_PASSWORD]` with which we can
access the dashboard.

**What is the secure token for accessing the admin panel?**

After logging in with the guest credentials from the previous task, we look at the 
cookies in the developer tools of the dashboard and notice am `isVIP` boolean value
which can be set to "true" without further do.  Having done that, we are able to access
the "Training Room 2: Advanced Red Teaming" which normally only subscribers could
deploy. Here, we can try to start the virtual machine but a popup alerts us that this
is only possible for *VIP* users (although we could already access this premium room
with the cookie alteration). However, upon further inspection of the network traffic,
we notice a suspicious GET request to 
`http://capture3millionsubscribers[.]thm/BBF813FA941496FCE961EBA46D754FF3.php`
in which a shell was opened. So, we open this page in a new tab and see the machine
with the *Ubuntu* shell. A quick `ls` listing leads us to read the configuration with
`cat config.php`. In it, we can discover the `$SECURE_TOKEN` to access the admin panel
and the `$urlAdminPanel` which we want to add to `/etc/hosts` with the target IP address
for subsequent access. 

```php
<?php
$SECURE_TOKEN= "[REDACTED]";
$urlAdminPanel= "http://admin1337special.hackme.thm:40009";
?>
```

**What is the flag value after enabling the registration feature and getting 3M 
subscribers on the platform?**

After having added the domain of the admin panel without the port from the previous task
in `/etc/hosts`, we can navigate to the admin panel URL and are automatically redirected 
to  `http://admin1337special.hackme.thm:40009/public/html/login`. This seems to be the
new root directory of the webserver for which we don't have access however. So, we fire
up a `gobuster` query to find out any hidden pages for the URL and are able to spot the
`/login` and `/logout` pages this way.
```sh
gobuster dir -u http://admin1337special.hackme.thm:40009/public/html -w /usr/share/wordlists/dirb/common.txt
```
After navigating to the `login.php` page we are prompted for an authentication code and
choose to submit the secure token from the previous task. With this, we are prompted with
another login screen. At first, we attempt `admin:admin` for the credentials but just
get a popup that either the username or password are invalid. And so, we try out a few
common credentials without any success. Since the client side does not appear to be
vulnerable on first sight, we suspect a possible *SQLi* attack and try out `' OR 1=1 --`
for the username. This does not help us log in, but it does not show the usual alert
message either, so we assume we're on the right track. So, we copy the *Request Headers*
with the *JSON Body* into a text file and use it in `sqlmap`.
```
$ cat request_headers.txt 
POST /api/login.php HTTP/1.1
Host: admin1337special.hackme.thm:40009
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:152.0) Gecko/20100101 Firefox/152.0
Accept: */*
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate
Referer: http://admin1337special.hackme.thm:40009/public/html/login
Content-Type: application/json
Content-Length: 39
Origin: http://admin1337special.hackme.thm:40009
Connection: keep-alive
Cookie: PHPSESSID=[REDACTED]
Priority: u=0

{"username":"admin","password":"sample"}

$ sqlmap -r request_headers.txt --dbs --batch
```
After some probing of the JSON username, `sqlmap` finds a vulnerability and is able to
thus obtain six databases, most notably the *hackme* database. Next, we want to print all
tables from it with `sqlmap -r request_headers.txt -D hackme --tables` and discover a
*config* and *users* table. Since, we want to find out the *admin* password for the login
request, we print the *users* table with 
`sqlmap -r request_headers.txt -D hackme -T users --dump`. This way, we are able to
obtain the credentails for the admin user with the email address `admin@hackme.thm` with
which we can log in and then activate the new sign up feature. Having done this, we can
finally visit the `hackme.thm` website and get rewarded with the flag.

Detection
-----------------------------------------------------------------------------------------
**How many logs are ingested in the Splunk instance?**

Once we have access to the *Splunk Enterprise* instance, we go to *Search & Reporting*
and search for `ip` for all time. This way, we can see all logs from April 4th, 2024.

**What is the web hacking tool used by the attacker to exploit the vulnerability on the
website?**

For this task, we investigate the *User Agents* for all logs, and notice one suspicious
one, that we also used in the last task of the *Exploitation* phase.

**How many total events were observed related to the attack?**

Next to the listing of the suspicious user agent, we can also spot a count that 
attributed to 1.5% of all logs.

**What is the observed IP address of the attacker?**

Upon clicking on the suspicious web hacking tool event, we can have a look at all listed
source IP addresses, and find only one that can be attributed to the attacker.

**How many events were observed from the attacker's IP?**

After filtering for the `source_ip` in the search bar and nothing else over the whole
time period, we can find out how many events the attacker triggered.

**What is the table used by the attacker to execute the attack?**

For this task, we have a look at the URI filter in our logs and discover the normal
`/api/login.php` request and a suspicious one worth investigating further. This request
contains the SQLi attack parameters and a reference to the table used by the attacker to
execute the attack of exfiltrating user's credential data.
```
/api/login.php?SSyw=7014%20AND%201=1%20UNION%20ALL%20SELECT%201,username,password,2,3,4%20FROM%20TryHack3M_users%20WHERE%20role=%22admin%22%20ORDER%20BY%20role%20LIMIT%201--/**/;%20#%20HTTP/1.1;
```
```sql
SELECT 1,username,password,2,3,4 FROM [REDACTED] WHERE role=(admin) ORDER BY role LIMIT 1--
```

[^1]: https://tryhackme.com/room/subscribe
