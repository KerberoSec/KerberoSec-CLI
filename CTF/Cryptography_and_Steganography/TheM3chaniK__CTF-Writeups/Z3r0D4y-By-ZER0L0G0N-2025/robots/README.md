# 🧩 Challenge: Robots

**Category:** Web

**Points:** 100

---

### 🔖 Challenge Description

> Thank god you can't find the flag by googling

---

### 🧭 Initial Reconnaissance

The name and description screamed **robots.txt** to my high-IQ hacker brain. There was no direct link in the prompt, so I guessed the target and navigated to:

`http://register.zerologon.co.in/robots.txt`

> P.S It's the link of the CTF page itself

---

### 🔍 Analysis & Enumeration

The robots file disallowed a couple of paths:

```
User-agent: *
Disallow: /admin
/secret5431
```

`/secret5431` smelled like a hidden page, so I opened it.

---

### ⚙️ Exploitation Process

Visited `/secret5431` and the page didn’t hide anything: it literally shouted the flag.

---

### 🏁 Flag

```
zero{consent_4_crawling}
```

---

### 💡 Takeaways

* robots.txt is not a security mechanism: it’s a map of places admins *don’t* want crawlers to hit (but CTFs love).
* When the challenge title hints at robots, check `/robots.txt` first. Instant wins happen.

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**

