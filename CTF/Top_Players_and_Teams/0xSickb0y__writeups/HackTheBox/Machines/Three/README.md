# Three

> [https://app.hackthebox.com/starting-point?tier=1](https://app.hackthebox.com/starting-point?tier=1)

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/fce98391-a077-4217-bc34-9a6753ee79ae" />

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [Web Page](#web-page)
* [Misconfigured S3 Bucket](#misconfigured-s3-bucket)
* [Initial Access](#initial-access)
* [Conclusion](#conclusion)

## About

Three was an Ubuntu Linux machine hosting a website for a fictional band called *The Toppers*. The main challenge involved identifying a misconfigured AWS S3 bucket that allowed unauthorized access to web content. This access enabled source code retrieval and ultimately led to remote code execution.

## References

* [AWS CLI](https://docs.aws.amazon.com/cli/)
* [Amazon S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
* [Subdomain Enumeration](https://book.hacktricks.wiki/network-services-pentesting/pentesting-web/subdomain-enumeration)

## Reconnaissance

Nmap revealed two open ports: 22/tcp: *OpenSSH 7.6p1 (Ubuntu)* and 80/tcp: *Apache httpd 2.4.29 (Ubuntu)*.

<img width="1910" height="520" alt="0" src="https://github.com/user-attachments/assets/80c03cba-672a-4ae5-95c9-c8393a522722" />

## Web Page

The web server hosted a basic homepage for *The Toppers*, featuring tour dates, a contact form, and additional content. The site was mostly static, but the contact form leaked a hostname: `thetoppers.htb`.

<img width="1919" height="1028" alt="1" src="https://github.com/user-attachments/assets/e9bffee6-70f1-4493-875b-cd41f11ac9f0" />

After adding `thetoppers.htb` to `/etc/hosts`, I tested the contact form, which submitted a **POST** request to:

```
http://thetoppers.htb/action_page.php?Name=test&Email=test%40test.com&Message=test
```

The response was a 404 Not Found, prompting further enumeration of the website.

## Misconfigured S3 Bucket

Subdomain enumeration identified `s3.thetoppers.htb`, suggesting the presence of an Amazon S3 bucket.

<img width="1280" height="373" alt="2" src="https://github.com/user-attachments/assets/1fe52798-3281-49ca-8539-995a3669f2f3" />

After adding the new hostname to the `/etc/hosts` file, I tried interacting with this AWS bucket using *cURL*, and it responded with:

```json
{ "status": "running" }
```

Since this is a CTF machine with no outside internet connection, I had to specify `--endpoint=http://s3.thetoppers.htb` in my commands to properly interact with the bucket. After listing the files on the bucket, I could see: *.htaccess* and *index.php*: the source code for **thetoppers.htb**.

From [Amazon S3: Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html):

___"Ensure that your Amazon S3 buckets use the correct policies and are not publicly accessible."___

_"Unless you explicitly require anyone on the internet to be able to read or write to your S3 bucket, make sure that your S3 bucket is not public."_

In this case, both read and write operations were allowed without authentication, which exposed the web server’s internal code and enabled direct exploitation via file upload. Proper IAM policies and bucket ACLs should restrict access to only trusted identities and enforce the principle of least privilege.

## Initial Access

Knowing that the website was running *PHP*, I uploaded a copy of [php-reverse-shell](https://github.com/pentestmonkey/php-reverse-shell) to the server and triggered it with *cURL*.

<img width="1910" height="710" alt="3" src="https://github.com/user-attachments/assets/6863b2f6-dc07-4373-b21d-452fa89d1382" />

The flag was located at: `/var/www/flag.txt`.

<img width="1301" height="370" alt="4" src="https://github.com/user-attachments/assets/84fe753d-cc80-41c0-ab0f-9c4894ef72fb" />

## Conclusion

The **Three** machine demonstrated a misconfigured Amazon S3 bucket that allowed unauthorized file access and upload. Key takeaways:

* **Virtual host discovery was critical**: Subdomain enumeration revealed the S3 bucket.
* **Improper access control on S3**: Publicly accessible read/write permissions exposed server-side files.

The compromise was made possible by poor S3 bucket permission settings and a lack of input validation or upload restrictions on the server.
