# 🧩 Challenge: Rick You

**Category:** Web

**Points:** 300

---

### 🔖 Challenge Description

> I have something for you [ Surprise ](https://rickyou.pages.dev/)!!!

---

### 🧭 Initial Reconnaissance

Clicked the link like an innocent soul… and BAM 💥: *Rickrolled* 😭
Redirects straight to: [https://www.youtube.com/watch?v=dQw4w9WgXcQ](https://www.youtube.com/watch?v=dQw4w9WgXcQ) 🎵

---

### 🔍 Analysis & Enumeration

But hey 😏 never underestimate the power of a common hacker armed with `curl`.

```bash
$ curl https://rickyou.pages.dev/
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0.001; url='https://www.youtube.com/watch?v=dQw4w9WgXcQ'">
<title>Loading...</title>
<style>
  body {
    background-color: black;
    color: black;
    font-size: 2rem;
    text-align: center;
    margin-top: 20%;
  }
</style>
<script>
  setTimeout(() => {
    window.location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  }, 1);
</script>
</head>
<body>
zero{wohoo_sherlock}
</body>
</html>
```

Hehe 😎: looks like the real treasure was hidden in the HTML all along!
While the browser gets distracted by the music, `curl` reveals the flag 🕵️‍♂️.

---

### ⚙️ Exploitation Process

🧠 Simple game plan:
1. Don’t open the link: use `curl` instead.
1. Inspect the HTML body.
1. Flag smiles back at you. 😏

> *(Short version: `curl → body → flag → victory 💪`)*

---

### 🏁 Flag

```
zero{wohoo_sherlock}
```

---

### 💡 Takeaways

* Redirects can hide interesting content: fetch the raw HTML first.

* Always try simple tools (curl) before calling in the whole toolchain.

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**

