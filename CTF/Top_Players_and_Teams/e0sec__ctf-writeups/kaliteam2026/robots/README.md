# Robots

| Field | Details |
|-------|---------|
| **Challenge** | Robots |
| **CTF** | Kali Team CTF 26 |
| **Category** | Web |
| **Points** | 100 |
| **Author** | F4R3S |
| **Description** | "Our servers have evolved. They no longer see code; they see the glitch in your biological existence. You claim to be "superior" while your species excels only at destruction and theft. Task: Prove your worth to the Silicon Intelligence. If you can still find your "humanity" in the rubble we've logged." |
| **Flag** | `KaliTeam{4638fa2e-b8a4-4a6e-95a8-8e25c36270b1}` |

---

## Challenge

A single URL: `http://53e4.chall.kali-team.online:8001/robots.txt`. Fetching
it returns a wall of in-character "AI vs. humans" flavor text and no
obvious flag:

```
$ curl -s http://53e4.chall.kali-team.online:8001/robots.txt
User-agent: *

DEAR "HUMAN",
...
STATUS: BIOLOGICAL ERROR. SYSTEM PURGE RECOMMENDED.
```

Response headers show `X-Powered-By: PHP/7.0.33`, so `robots.txt` is likely
served dynamically rather than being a static file.

## Recon

Checked the raw bytes of the response for anything hidden (zero-width
characters, trailing data): nothing:

```
$ curl -s http://53e4.chall.kali-team.online:8001/robots.txt -o robots.txt
$ xxd robots.txt | tail -5
```

Clean ASCII, no surprises. Next, looked at the site root and brute-forced a
short list of likely filenames. `robots.php` returned `200` with identical
content to `/robots.txt`: confirming `robots.txt` is just a rewrite/alias
for a PHP script:

```
$ for p in flag.txt admin.php sitemap.xml .git/HEAD robots.php humans.txt; do
    echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' \
      http://53e4.chall.kali-team.online:8001/$p)"
  done
robots.php -> 200
...
```

## The hook: "prove you're not a robot"

The flavor text repeatedly riffs on CAPTCHAs and "prove you're not a
robot": a strong hint that the *server* is the one checking whether the
client is a robot, via `User-Agent`. Since `robots.txt` is the one file
real crawlers (Googlebot, Bingbot, etc.) are expected to request, tried
spoofing a few known crawler UAs against `robots.php`:

```
$ for ua in "Googlebot/2.1" "Bingbot/2.0" "Yandex" "curl/7.68.0"; do
    echo "=== $ua ==="
    curl -s -A "$ua" http://53e4.chall.kali-team.online:8001/robots.php | head -3
  done
```

Every UA returned the same generic rant *except* `Googlebot/2.1`, which
returned a completely different body.

## Getting the flag

```
$ curl -s -A "Googlebot/2.1" http://53e4.chall.kali-team.online:8001/robots.php
User-agent: *

THE HUMANS ARE DISTRACTED BY THEIR OWN CRUELTY.
...
HERE IS THE FLAG THEY DON'T DESERVE: KaliTeam{4638fa2e-b8a4-4a6e-95a8-8e25c36270b1}
...
```

`robots.php` special-cases requests whose `User-Agent` matches Googlebot's
UA string and serves an alternate response containing the flag.

```
KaliTeam{4638fa2e-b8a4-4a6e-95a8-8e25c36270b1}
```

## Lessons learned

- **`robots.txt` isn't always a static file**: a `200` on a guessed
  `.php` sibling with matching output is a quick way to confirm it's
  dynamically generated and worth further UA/parameter fuzzing.
- **Flavor text is often a literal hint.** A page built entirely around
  "prove you're not a robot" is telling you the intended bypass is
  `User-Agent` spoofing as a real crawler, not a generic fuzzing exercise.

---
*Written with substantial AI assistance in analysis and writing.*
