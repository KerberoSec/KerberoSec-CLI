---
tags: [ctf, mobile, ios, frida, hooking]
created: 2026-05-02
---

# 🍎 iOS Hooking & Reversing

> iOS challenges น้อยกว่า Android เพราะ tooling ยุ่งกว่า: ต้อง jailbroken device หรือ macOS + Xcode

---

## 🛠 Setup

### Hardware ที่ใช้
- **Jailbroken iOS device** ⭐: ต้องการสำหรับ Frida hook
- Modern jailbreaks: checkra1n (older devices), unc0ver, palera1n, Dopamine
- **Corellium** (cloud iOS VM, paid): alternative ที่ไม่ต้อง physical device

### Tools

| Tool | Purpose |
|------|---------|
| **Frida** | Runtime hook |
| **Objection** | Frida wrapper |
| **class-dump** | Extract Obj-C class headers |
| **Hopper** ($) | Disassembler/decompiler (macOS) |
| **Ghidra** | Free disassembler (cross-platform) |
| **iFunBox / iMazing** | Browse FS |
| **Filza** (on device) | File browser |
| **frida-ios-dump** | Dump decrypted IPA |

### Install Frida on jailbroken iOS
1. Add `https://build.frida.re` to Cydia/Sileo sources
2. Install "Frida"
3. From laptop: `frida-ps -U` should list processes

---

## 📦 IPA Structure

IPA = ZIP file
```
Payload/
└── MyApp.app/
    ├── MyApp                    ← binary (Mach-O)
    ├── Info.plist               ← config
    ├── _CodeSignature/
    ├── *.lproj/                 ← localizations
    ├── *.storyboardc/           ← UI
    ├── Assets.car               ← compiled assets
    └── Frameworks/              ← embedded libs
```

### Extract IPA
```bash
unzip MyApp.ipa -d output/
# หรือ
mv MyApp.ipa MyApp.zip
unzip MyApp.zip
```

---

## 🔐 App Store Encryption

App Store apps เป็น **encrypted**: binary ไม่อ่านได้ดิบๆ

### Decrypt with frida-ios-dump
```bash
git clone https://github.com/AloneMonkey/frida-ios-dump
cd frida-ios-dump

# Configure dump.py with device IP
# Then run:
./dump.py -l                                  # list installed apps
./dump.py com.example.app                     # dump
```

### Alternative: Clutch (older, less reliable now)

### Why need decrypt
Encrypted Mach-O cannot be statically analyzed: strings, decompile, etc. ไม่ work

---

## 📋 Mach-O Format (briefly)

iOS binary = Mach-O format
```bash
file MyApp
# Mach-O 64-bit executable arm64

otool -h MyApp                                # header
otool -L MyApp                                # libraries
otool -l MyApp                                # all load commands

# String search
strings MyApp | grep -i flag
```

---

## 🎯 Static Analysis

### class-dump (Obj-C only)
```bash
class-dump -H MyApp.app/MyApp -o headers/
ls headers/
# Output: ClassName.h files
```

ดู:
- Class names
- Method signatures
- Property declarations

→ Important sản function names → for Frida hook

### Ghidra
- Open Mach-O directly
- Auto-analysis
- Function listing (look for class methods like `-[ClassName methodName:]`)

### Hopper (recommended on macOS)
- Better Obj-C/Swift support than Ghidra
- Method-by-method decompilation
- Pseudocode

### Swift
Apps ที่เขียนด้วย Swift: function names mangled
```
$s8MyApp7checkPwd...
```

→ Use **swift-demangle** to read:
```bash
echo '$s8MyApp7checkPwd...' | swift-demangle
```

---

## 🪝 Frida on iOS

### Basic hook
```javascript
// hook.js
ObjC.classes.MyClass.checkPassword_.implementation = ObjC.implement(
    ObjC.classes.MyClass.checkPassword_, 
    function(handle, selector, password) {
        console.log('[+] checkPassword called: ' + ObjC.Object(password).toString());
        return ObjC.classes.NSNumber.numberWithBool_(true);  // force true
    }
);
```

หรือ syntax ที่ใหม่กว่า:
```javascript
var checkPwd = ObjC.classes.MyClass['- checkPassword:'];
Interceptor.attach(checkPwd.implementation, {
    onEnter: function(args) {
        console.log('checkPassword called');
        // args[0] = self, args[1] = selector, args[2] = first param
        var password = ObjC.Object(args[2]);
        console.log('Input: ' + password.toString());
    },
    onLeave: function(retval) {
        console.log('Return: ' + retval);
        retval.replace(1);                    // force success
    }
});
```

### List classes
```javascript
for (var className in ObjC.classes) {
    if (className.indexOf('MyApp') !== -1) {
        console.log(className);
    }
}
```

### List methods of class
```javascript
var methods = ObjC.classes.MyClass.$ownMethods;
for (var i = 0; i < methods.length; i++) {
    console.log(methods[i]);
}
```

### Run
```bash
frida -U -l hook.js -f com.example.app
```

---

## 🔓 Common Bypasses

### Jailbreak Detection Bypass
Apps มัก check:
- File exists: `/Applications/Cydia.app`, `/usr/sbin/sshd`, etc.
- URL scheme: `cydia://`
- Sandbox check (writability)
- fork() or popen() (not allowed in sandboxed)

### Frida script
```javascript
// Hook NSFileManager fileExistsAtPath:
var NSFileManager = ObjC.classes.NSFileManager;
NSFileManager['- fileExistsAtPath:'].implementation = function(path) {
    var p = new ObjC.Object(path).toString();
    if (p.indexOf('Cydia') !== -1 || p.indexOf('jailbreak') !== -1) {
        return false;
    }
    return this['- fileExistsAtPath:'](path);
};
```

→ Or use **objection**:
```bash
objection -g com.example.app explore
> ios jailbreak disable
```

### SSL Pinning Bypass
```bash
objection -g com.example.app explore
> ios sslpinning disable
```

หรือ use Frida script: pinning bypass scripts on github

---

## 🗄 File System Access (jailbroken)

### App data location
```bash
ssh root@<device-ip>             # default password: alpine
cd /var/mobile/Containers/Data/Application/<UUID>/
```

หรือใช้ iFunBox / Filza

### Common files
- `Library/Preferences/<bundle>.plist`: UserDefaults
- `Library/Application Support/`
- `Documents/`
- `tmp/`
- `Library/Caches/`

### Inspect plist
```bash
plutil -p file.plist                   # macOS
# or convert to XML
plutil -convert xml1 file.plist
cat file.plist
```

---

## 🌐 Network Inspection

### Setup proxy
- iPhone Settings → Wi-Fi → proxy → laptop IP : 8080
- Install Burp CA on iPhone
- For SSL: Frida unpinning

---

## 🎯 CTF Patterns (iOS)

### Pattern 1: Hardcoded in plist
```bash
plutil -p Info.plist
# Look for keys like FLAG, SECRET, API_KEY
```

### Pattern 2: Strings in binary
```bash
strings MyApp | grep -i flag
```

### Pattern 3: Custom URL scheme abuse
```
Info.plist → CFBundleURLTypes → CFBundleURLSchemes

myapp://action?key=value
```
ลอง trigger different actions: open Safari → `myapp://...`

### Pattern 4: Keychain access
Apps store secrets in iOS Keychain
```bash
objection -g com.example.app explore
> ios keychain dump
```

→ Decrypted contents (if app's keychain accessible)

### Pattern 5: Encrypted resources
- App ships encrypted assets
- Decrypt at runtime → hook decrypt function → leak

---

## 🛠 Useful Objection Commands

```bash
objection -g com.example.app explore

> env                                              # app environment
> ios info binary
> ios bundles list_bundles
> ios bundles list_frameworks
> ios cookies get
> ios keychain dump
> ios plist cat <file>
> ios pasteboard monitor                           # clipboard
> ios sslpinning disable
> ios jailbreak disable
> ios ui dump                                      # UI hierarchy
> ios ui screenshot file.png

> ios hooking list classes                         # all classes
> ios hooking search classes Login                 # filter
> ios hooking list class_methods MyClass
> ios hooking watch class MyClass
> ios hooking watch method "-[MyClass checkPassword:]" --dump-args --dump-return
> ios hooking set return_value "-[MyClass checkPassword:]" true
```

---

## 🔗 ที่เกี่ยวข้อง

- [Mobile-Intro](Mobile-Intro.md)
- [Android-Reversing](Android-Reversing.md)
- [Frida basics](../05-Reverse-Engineering/Dynamic-Analysis.md)

## 📚 References

- frida.re/docs/ios
- "iOS Application Security": David Thiel
- OWASP MSTG (iOS sections)
- pentestmag.com (iOS guides)

---

#ctf #mobile #ios #frida
