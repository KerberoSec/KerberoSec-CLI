# 📱 Android Native Library Flag Extraction (Reverse Engineering)

## Challenge Info

| Field | Details |
|---|---|
| Platform | Cybersecurity Hackathon 2026 |
| Category | Android Reverse Engineering |
| Tools Used | unzip, grep/strings, jadx |

---

## 🧩 Description

An unsigned Android APK. `classes.dex` strings hinted at an in-app
validator (`"Correct! You found the flag!"` / `"Wrong flag. Try again!"`),
but the flag itself was nowhere in the Java/Kotlin layer.

---

## 🔍 Reconnaissance

**Step 1: Unpack the APK**

An APK is just a ZIP:

```bash
mkdir unsigned_unpacked && cd unsigned_unpacked
unzip -o ../app-release-unsigned.apk
```

**Step 2: Grep the DEX layer first**

```bash
grep -aRoE 'flag\{[^}]{1,100}\}|CTF\{[^}]{1,100}\}' .
```

No hits at the DEX level: confirmed the app has a real validator
(`getHint`, success/fail toast strings in `classes.dex`) but no plaintext
flag sitting in the Java-derived code.

---

## ⚔️ Attack Process

**Step 1: Check the native layer**

Android apps frequently push "sensitive" strings into native `.so`
libraries under the assumption that JADX/dex-only analysis won't reach
them. Ran the same grep across the whole unpacked tree instead of just
the dex files:

```bash
grep -aRoE 'flag\{[^}]{1,100}\}' ./lib
```

**Step 2: Confirm and cross-check**

Hit inside `lib/arm64-v8a/libnative-lib.so`, and, checking the sibling
architecture folder, the identical string was embedded in
`lib/armeabi-v7a/libnative-lib.so` too (both ABI builds carry the same
hardcoded flag).

---

## 🚩 Flag
```
flag{4***2_7***_5***3_4S_0********3_r*****5_m3_***7}
```

Decoded (leetspeak): *"the SOC is obfuscated, reverse me, 1337"*.

---

## 💡 Lessons Learned

- Never limit a string search to `classes.dex` alone: Android apps
  routinely stash secrets in native `.so` libraries via JNI, expecting
  that to raise the bar for casual dex-only analysis
- Always check **every ABI folder** (`arm64-v8a`, `armeabi-v7a`, `x86`,
  etc.): the same secret is often duplicated across architectures,
  and checking only one can waste time if that particular build
  strips it differently
- A broad, unfiltered `grep -aR` across the entire unpacked APK tree is
  cheap and should be the very first move before reaching for a
  decompiler

---

## 🛠️ Tools Used

- **unzip**: APK extraction
- **grep / strings**: flag-pattern search across dex and native layers
- **jadx**: available for deeper logic review, not needed once the
  native string hit

---

*Solved during Cybersecurity Hackathon 2026: legal, authorized CTF environment*
