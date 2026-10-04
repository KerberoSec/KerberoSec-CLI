# 🧩 Challenge: Copy and Paste

**Category:** Web

**Points:** 100

---

### 🔖 Challenge Description

> I'll be honest, I used ChatGpt to code this Calculator. I do know...."some" coding, but there appears to be a lot of stuff that I don't understand. I think its fine. I mean, if it works, it works, right?
> [Calculator App](https://vuln-calculator.pages.dev/)

---

### 🧭 Initial Reconnaissance (aka “when in doubt, View Source”)

I opened the given calculator webpage https://vuln-calculator.pages.dev/ (P.S I don't know at the time you are seeing this, the page is available or not):  at first glance, it looked like a normal calculator app. But as every CTF player knows, the first move isn’t calculating `2+2`, it’s hitting **View Page Source**.

---

### 🔍 Analysis (aka “trust issues with minified JS”)

Scrolling through the source, I spotted an obfuscated JavaScript block. It was the classic `_0x` variable soup: a dead giveaway for hidden logic.

Here’s the suspicious part:

```javascript
(function(_0x3d7b37,_0x9db06d){var _0x5b5850=_0x1ae3,_0x7ddfb2=_0x3d7b37();while(!![]){try{...}}}(_0x3961,0x22726));
function _0x1ae3(_0x249064,_0x12cce5){...}
function printForgottenFunction(){var _0x4e5e4d=_0x1ae3;console[_0x4e5e4d(0x1cb)]('emVyb3thX2Z1bmN0aW9uX3dob21fbm9fb25lX3JlbWVtYmVyc30');}
```

So there was a `printForgottenFunction()` that logged a Base64-looking string.
No calculator needs a mysterious forgotten function: perfect bait.

---

### ⚙️ Exploitation Process (aka “chatGPT dev left the door open”)

Deobfuscating mentally (and partially formatting it), the code essentially does this:

```javascript
function printForgottenFunction() {
  console.log("emVyb3thX2Z1bmN0aW9uX3dob21fbm9fb25lX3JlbWVtYmVyc30");
}
```

So all it does is print that Base64 string.

I copied it, ran this in the terminal:

```bash
echo "emVyb3thX2Z1bmN0aW9uX3dob21fbm9fb25lX3JlbWVtYmVyc30" | base64 -d
```

And boom: out came the flag.

---

### 🏁 Flag

```
zero{a_function_whom_no_one_remembers}
```

---

### 💡 Takeaways

- Always check the source: web challenges often hide Easter eggs in JS.
- Obfuscation ≠ security.
- Sometimes, the “forgotten” function remembers the flag for you.

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**
