---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: ProxyAsAService

The web is proxying requests to Reddit.

Importantly, there is also a debug endpoint `/debug/environment` that dumps the ENV. Which is good, as the flag is there (I know it from `Dockerfile`).

However, the problem is that the endpoint can be only invoked from localhost (`is_from_localhost` guard function). So, I need to get around it. Perhaps the proxy will help as it is local to itself.

## Open Redirect

First, I need to call the proxy and not Reddit. By looking at the code I see the hardcoded url as follows:

```
SITE_NAME = 'reddit.com'
...
    target_url = f'http://{SITE_NAME}{url}'
```

This is vulnerable to open redirect due to the missing tailing slash.

So if i call the proxy in the following way I can proxy anywhere:

```
http://167.99.82.136:31499/?url=@TARHET
```

The `@` makes all the prewious recogined as credentials.

But, trying the following returns 403:

```
http://167.99.82.136:31499/?url=@127.0.0.1:1337/debug/environment
```

Note that the used port is the local port it got from `Dockerfile` and `build-docker.sh`.

## Bypassing blacklist

The application have some restricted urls.

```
RESTRICTED_URLS = ['localhost', '127.', '192.168.', '10.', '172.']
```

That blocked the `127.0.0.1`.

According to code the request and response cannot be on the blacklisted urls:

```
  if not is_safe_url(url) or not is_safe_url(response.url):
        return abort(403)
```

So I need to call the localhost somewhat differently. I can use `0.0.0.0`. See: https://unix.stackexchange.com/questions/419880/connecting-to-ip-0-0-0-0-succeeds-how-why/419881#419881 and https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Request%20Forgery#payloads-with-localhost

## Exploit

So, the final exploit is:

```
167.99.82.136:31499/?url=@0.0.0.0:1337/debug/environment
```

And that will dump the ENV, flag included