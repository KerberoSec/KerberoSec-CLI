# Mobile Security

> Android and iOS security: reverse engineering apps, dynamic analysis, OWASP Mobile Top 10.

---

## OWASP Mobile Top 10 (2024)

| # | Category | Example |
|---|----------|---------|
| M1 | Improper Credential Usage | Hardcoded API keys in APK |
| M2 | Inadequate Supply Chain Security | Malicious SDK |
| M3 | Insecure Authentication/Authorization | Bypass via parameter tampering |
| M4 | Insufficient Input/Output Validation | XSS in WebView |
| M5 | Insecure Communication | Plain HTTP, no cert pinning |
| M6 | Inadequate Privacy Controls | Excessive permissions, PII logging |
| M7 | Insufficient Binary Protections | No obfuscation, debug builds |
| M8 | Security Misconfiguration | Exported activities, debug flags |
| M9 | Insecure Data Storage | Cleartext in SharedPreferences/NSUserDefaults |
| M10 | Insufficient Cryptography | Hardcoded keys, ECB mode |

---

## Android

### Static Analysis
```bash
# Decompile APK
apktool d target.apk -o target_decompiled/
jadx -d target_jadx/ target.apk   # Decompile to Java

# Search for secrets
grep -r "password\|api_key\|secret\|token" target_decompiled/ --include="*.xml"
grep -rn "http://" target_decompiled/smali/

# Check AndroidManifest.xml: exported components, permissions
cat target_decompiled/AndroidManifest.xml | grep -i "exported\|permission\|debuggable"

# Extract strings from native libs
strings target_decompiled/lib/arm64-v8a/*.so | grep -iE "key|token|pass|secret"
```

### Dynamic Analysis: Frida
```javascript
// Hook Java method
Java.perform(function() {
    var MainActivity = Java.use("com.target.app.MainActivity");
    MainActivity.checkPassword.implementation = function(pass) {
        console.log("Password: " + pass);
        return true;  // Bypass check
    };
});

// Enumerate loaded classes
Java.enumerateLoadedClasses({
    onMatch: function(name) { console.log(name); },
    onComplete: function() {}
});

// Hook SSL pinning bypass
Java.perform(function() {
    var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
    TrustManagerImpl.verifyChain.implementation = function() { return arguments[0]; };
});
```

```bash
# Inject Frida
frida -U -f com.target.app --no-pause -l hook.js

# List running apps
frida-ps -U

# Objection: automated mobile pentest framework
objection -g com.target.app explore
  android sslpinning disable
  android root disable
  android hooking list classes
  android hooking watch class com.target.app.Auth
```

### ADB (Android Debug Bridge)
```bash
adb devices                              # list connected devices
adb shell                                # drop to shell
adb logcat | grep -i "password\|token"  # monitor logs

# Pull app data (rooted)
adb pull /data/data/com.target.app/
adb shell "sqlite3 /data/data/com.target.app/databases/app.db .dump"

# Install/launch
adb install target.apk
adb shell am start -n com.target.app/.MainActivity

# Extract APK from device
adb shell pm path com.target.app
adb pull /data/app/com.target.app-1.apk
```

### Insecure Data Storage
```bash
# SharedPreferences (cleartext XML)
adb shell "cat /data/data/com.target.app/shared_prefs/*.xml"

# SQLite databases
adb shell "find /data/data/com.target.app/ -name '*.db'"

# External storage
adb shell "find /sdcard/Android/data/com.target.app/ -type f"

# Backup extraction
adb backup -apk -noshared -nosystem com.target.app
java -jar abe.jar unpack backup.ab backup.tar
```

---

## iOS

### Static Analysis
```bash
# Extract IPA
unzip target.ipa -d target_extracted/

# Strings / secrets hunt
strings Payload/Target.app/Target | grep -iE "api|key|token|secret|password"

# Binary analysis
otool -L Payload/Target.app/Target        # linked libraries
otool -l Payload/Target.app/Target | grep -A4 LC_ENCRYPTION  # check if encrypted
nm Payload/Target.app/Target | grep -i " T "  # exported symbols

# Inspect plist files
plutil -convert xml1 -o - Payload/Target.app/Info.plist
find Payload/ -name "*.plist" -exec plutil -p {} \;
```

### Dynamic Analysis: Frida on iOS
```javascript
// Hook Objective-C method
var resolver = new ApiResolver("objc");
resolver.enumerateMatches("*[*Auth*]", {
    onMatch: function(m) { console.log(m.name + " @ " + m.address); },
    onComplete: function() {}
});

Interceptor.attach(ObjC.classes.NSURLSession["- dataTaskWithRequest:completionHandler:"].implementation, {
    onEnter: function(args) {
        var request = ObjC.Object(args[2]);
        console.log("URL: " + request.URL().toString());
    }
});
```

```bash
# SSL Kill Switch 2 / SSLBypass via Objection
objection -g "com.target.app" explore
  ios sslpinning disable
  ios jailbreak disable
  ios keychain dump
  ios nsuserdefaults get
```

### iOS Keychain Extraction
```bash
# Objection (on jailbroken device)
ios keychain dump

# Keychain-dumper (jailbroken)
./keychain_dumper -a

# Check plist credential storage
find /var/mobile/Library/ -name "*.plist" | xargs grep -l "password" 2>/dev/null
```

---

## Certificate Pinning Bypass

```bash
# Android: apk-mitm (automated)
apk-mitm target.apk            # patches cert pinning, outputs patched.apk

# Android: manually patch OkHttp
# Find CertificatePinner.check() in smali, replace with return-void

# iOS: frida-ios-dump / objection
objection -g "Bundle.ID" explore -- ios sslpinning disable

# Burp Suite proxy setup
# Settings → CA Certificate → export DER → install on device
# Android 7+: add to network_security_config.xml or patch manually
```

---

## Traffic Interception Setup

```bash
# Burp + adb proxy
adb shell settings put global http_proxy 192.168.1.100:8080

# Burp + iOS
# Settings → Wi-Fi → (i) → HTTP Proxy → Manual
# Host: attacker IP, Port: 8080
# Install Burp CA from http://burpsuite/

# For non-HTTP (raw TCP): use Proxyman or Charles
```

---

## Tools

| Tool | Purpose |
|------|---------|
| [apktool](https://ibotpeaches.github.io/Apktool/) | APK decompile/recompile |
| [jadx](https://github.com/skylot/jadx) | Dex → Java decompiler |
| [Frida](https://frida.re) | Dynamic instrumentation |
| [objection](https://github.com/sensepost/objection) | Runtime mobile exploration |
| [MobSF](https://mobsf.live) | Automated mobile app analysis |
| [adb](https://developer.android.com/tools/adb) | Android debug bridge |
| [apk-mitm](https://github.com/shroudedcode/apk-mitm) | Automated cert pinning patch |
| [Ghidra](https://ghidra-sre.org) | Native lib reversing |
| [drozer](https://labs.f-secure.com/tools/drozer/) | Android attack surface analysis |
