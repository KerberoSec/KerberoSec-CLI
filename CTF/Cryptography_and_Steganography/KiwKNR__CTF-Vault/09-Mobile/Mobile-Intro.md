---
tags: [ctf, mobile, android, ios]
created: 2026-05-02
---

# 📱 Mobile Security: บทนำ

> Mobile CTF challenges เน้น Android (APK) เป็นหลัก เพราะ open ecosystem, easy reverse: iOS ก็มีแต่น้อยกว่า เพราะ tools/devices ราคาแพงและจำกัด

---

## 🎯 ประเภทโจทย์ Mobile

### Static Analysis
- Decompile APK → Java/Smali code
- หา flag ที่ hardcoded หรือ check logic
- Native libraries (.so): RE ด้วย Ghidra/IDA

### Dynamic Analysis
- Run app + Frida hook
- ดู runtime values, intercept calls
- Network traffic analysis

### Specific
- Insecure storage (SharedPreferences, SQLite)
- WebView vulnerabilities
- Deep links / Intent abuse
- Root detection bypass
- SSL pinning bypass
- Native code (NDK)

---

## 🛠 Tools Stack

### Android Static
| Tool | ใช้ทำอะไร |
|------|----------|
| **JADX** ⭐ | Decompile APK → Java |
| **apktool** | Extract resources, Smali |
| **bytecode-viewer** | All-in-one decompiler |
| **MobSF** | Auto static + dynamic analysis |
| **Ghidra** / **IDA** | Native .so libraries |

### Android Dynamic
| Tool | ใช้ทำอะไร |
|------|----------|
| **Frida** ⭐ | Runtime hook |
| **Objection** | Frida wrapper, ใช้ง่าย |
| **adb** | Android Debug Bridge |
| **Drozer** | Android security testing framework |
| **Burp Suite** | HTTP traffic |
| **Wireshark** | Network |

### iOS
| Tool | ใช้ทำอะไร |
|------|----------|
| **Hopper** | Disassembler (macOS) |
| **Ghidra** | Free alternative |
| **class-dump** | Extract Obj-C class info |
| **Frida** | Hook (jailbroken) |
| **Cycript** | Runtime injection |
| **iFunBox / iMazing** | File system browser |

### Emulators / Devices
- **Android Studio Emulator** ⭐ ฟรี
- **Genymotion**: เร็วกว่า, free for personal
- **Real device** + adb usb debugging
- **Corellium** ($): virtual iOS

---

## 📦 APK Structure

APK = ZIP file
```
MyApp.apk
├── AndroidManifest.xml      ← permissions, activities, intents
├── classes.dex              ← compiled Java/Kotlin (DEX bytecode)
├── classes2.dex (optional)  ← multidex
├── resources.arsc           ← compiled resources
├── res/                     ← XML layouts, drawables
│   ├── layout/
│   ├── drawable/
│   └── values/
├── assets/                  ← raw files
├── lib/                     ← native libraries (.so)
│   ├── arm64-v8a/
│   ├── armeabi-v7a/
│   └── x86/
└── META-INF/                ← signing info
```

### Extract APK
```bash
# Just unzip
unzip MyApp.apk -d MyApp_extracted

# apktool: better (decode XML, smali)
apktool d MyApp.apk -o MyApp_decoded
```

`apktool d` benefits:
- AndroidManifest.xml decoded (binary → XML)
- Resources decoded
- DEX → Smali (assembly-like)

---

## 🔍 Static Analysis Workflow

### 1. AndroidManifest.xml
```bash
cat MyApp_decoded/AndroidManifest.xml
```

ดู:
- **`<permission>`**: what app accesses
- **`<activity>`**: entry points
  - `android:exported="true"` → callable from other apps
- **`<service>`**, **`<receiver>`**, **`<provider>`**
- **`<intent-filter>`**: deep links
- **`debuggable="true"`** ⭐: ถ้ามี → Frida ง่ายขึ้น

### 2. Decompile with JADX
```bash
jadx -d output_dir MyApp.apk
jadx-gui MyApp.apk          # interactive
```

JADX-GUI features:
- Search across whole codebase
- Cross-references (xref)
- Java pseudocode

### 3. หา flag/secrets

**Hardcoded strings**:
```bash
grep -r "flag{" output_dir/
grep -r "FLAG" output_dir/
strings classes.dex | grep -i flag
```

**Activity logic**:
- หา `MainActivity.java` (or whatever launcher)
- Read `onCreate()`: what initializes
- Trace button onClickListener → check function

**API keys, hardcoded creds**:
```bash
grep -r "api_key" output_dir/
grep -r "AKIA" output_dir/                    # AWS
grep -r "sk_live" output_dir/                  # Stripe
grep -rE "[A-Za-z0-9]{32,}" output_dir/ | head # high-entropy strings
```

**Resource strings**:
```bash
cat output_dir/res/values/strings.xml
# Look for hidden test strings
```

### 4. Native libraries (.so)
```bash
file lib/arm64-v8a/libnative.so
# Open in Ghidra/IDA: same as regular RE

# Find imports/exports
nm -D lib/arm64-v8a/libnative.so

# Strings
strings lib/arm64-v8a/libnative.so
```

JNI functions follow pattern: `Java_com_example_MyClass_methodName`

---

## ⚙️ Smali Basics

Smali = readable assembly of DEX bytecode

```smali
.class public Lcom/example/MainActivity;
.super Landroid/app/Activity;

.method public checkPassword(Ljava/lang/String;)Z
    .registers 4
    .param p1, "input"
    
    const-string v0, "supersecret"
    invoke-virtual {p1, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v1
    
    return v1
.end method
```

→ Read: function `checkPassword` compares input กับ "supersecret"

### Patching APK
1. Decode: `apktool d app.apk`
2. Edit smali file
3. Rebuild: `apktool b app -o patched.apk`
4. Sign: 
   ```bash
   # Generate key (once)
   keytool -genkey -v -keystore my.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias myalias
   
   # Sign
   apksigner sign --ks my.keystore patched.apk
   ```
5. Install: `adb install patched.apk`

---

## 🎯 Workflow

```
1. unzip APK / apktool d
2. Read AndroidManifest.xml: what's exposed?
3. JADX-GUI → search "flag" / "password" / etc.
4. Trace MainActivity → button listeners → check logic
5. หา hardcoded values
6. ถ้ามี native lib: Ghidra
7. ถ้า logic ซับซ้อน: Frida hook (next file)
```

---

## 🔐 Common Vulnerabilities

### 1. Hardcoded secrets
API keys, passwords, encryption keys ใน code

### 2. Insecure storage
- SharedPreferences: `/data/data/<pkg>/shared_prefs/`
- SQLite: `/data/data/<pkg>/databases/`
- External storage (anyone reads)

### 3. Insecure logging
`Log.d("TAG", "Password: " + password)`: leak ใน logcat

### 4. WebView issues
- `setJavaScriptEnabled(true)` + load untrusted URL → XSS in app
- `setAllowFileAccess(true)` → file:// access
- Custom JS interfaces: RCE if poorly configured

### 5. Intent issues
- Implicit intents leak data
- `exported=true` activities → callable by malicious apps
- Intent filter for deep links → manipulation

### 6. SSL/TLS
- No SSL pinning → MITM
- Pinning can be bypassed (next file)
- Trust user certificates → MITM in test phase

### 7. Root detection
- Check `/system/bin/su`, busybox
- Check installed packages (Magisk, SuperSU)
- Check build.prop
- All bypassable

### 8. Anti-tampering
- Signature verification
- Debugger detection
- Frida detection
- ทุก check bypassable

---

## 🍎 iOS Specific (briefly)

### IPA Structure
IPA = ZIP
```
Payload/MyApp.app/
├── MyApp                    ← binary (Mach-O)
├── Info.plist               ← config
├── *.lproj/                 ← localizations
└── ...
```

### Decrypt
- Apps from App Store เป็น **encrypted**: ต้อง dump from jailbroken device
- **frida-ios-dump**: popular tool
- **Clutch**: older

### Reverse
- **Hopper** (macOS, paid)
- **Ghidra** (free, cross-platform)
- **class-dump** for Obj-C classes:
  ```bash
  class-dump -H MyApp.app/MyApp -o headers/
  ```

### Hook
- **Frida** with jailbroken iOS
- **Cycript**: Obj-C runtime injection
- **Cydia Substrate** / **Tweak**

iOS CTF น้อยกว่ามาก: ส่วนมากใช้ Android

---

## 📚 Practice Platforms

- **OWASP MSTG**: Mobile Security Testing Guide
- **DIVA** (Damn Insecure and Vulnerable App)
- **Pivaa** (iOS version of DIVA)
- **AndroGoat**
- **HackTheBox** (Mobile category)
- **TryHackMe** (Mobile rooms)
- **InsecureShop**
- **Fridump** challenges

---

## 🔗 ต่อไป

- [Android RE ลึก: Frida, hook](Android-Reversing.md)
- [iOS hooking + Frida](iOS-Hooking.md)

## 📚 References

- OWASP Mobile Security Testing Guide ⭐
- "Android Hacker's Handbook"
- frida.re
- HackTricks Mobile section

---

#ctf #mobile #android #ios
