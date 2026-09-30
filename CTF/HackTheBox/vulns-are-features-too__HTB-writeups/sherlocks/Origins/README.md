# Origins

## 1. What is the attacker's IP address?

Within `tcp.stream eq 4`, there's and FTP packet with :
- Src: 172.31.45.144
- Dst: 15.206.185.207
- content: "Please specify the password."

The content tells us the Dst is the client.

> **ANSWER:** 15.206.185.207

## 2. It's critical to get more knowledge about the attackers, even if it's low fidelity. Using the geolocation data of the IP address used by the attackers, what city do they belong to?

Search `https://ipgeolocation.io/what-is-my-ip/15.206.185.207`

> **ANSWER:** Mumbai

## 3. Which FTP application was used by the backup server? Enter the full name and version. (Format: Name Version)

Filter `ftp`

> **ANSWER:** vsFTPd 3.0.5

## 4. The attacker has started a brute force attack on the server. When did this attack start?

Filter `ftp`, scroll until first `Request: USER admin`, copy `UTC Arrival Time`

```php
echo new DateTime("May  3, 2024 04:12:54.654978000 UTC")->format('Y-m-d h:i:s');
```

> **ANSWER:** 2024-05-03 04:12:54

## 5. What are the correct credentials that gave the attacker access? (Format username:password)

Filter `ftp`, scroll until sign of successful login (from brute-forcing), commands, and file transfer.

Following the resulting stream `tcp.stream eq 33`.

> **ANSWER:** `forela-ftp:ftprocks69$`

## 6. The attacker has exfiltrated files from the server. What is the FTP command used to download the remote files?

In same stream as before

> **ANSWER:** RETR

## 7. Attackers were able to compromise the credentials of a backup SSH server. What is the password for this SSH server?

Export objects for `ftp-data`.
Password s in `Maintenance-Notice.pdf`

> **ANSWER:** `**B@ckup2024!**`

## 8. What is the s3 bucket URL for the data archive from 2023?

In the exported `s3_buckets.txt`

> **ANSWER:** `https://2023-coldstorage.s3.amazonaws.com`

## 9. The scope of the incident is huge as Forela's s3 buckets were also compromised and several GB of data were stolen and leaked. It was also discovered that the attackers used social engineering to gain access to sensitive data and extort it. What is the internal email address used by the attacker in the phishing email to gain access to sensitive data stored on s3 buckets?

The email in `s3_buckets.txt`

> **ANSWER:** `archivebackups@forela.co.uk`

