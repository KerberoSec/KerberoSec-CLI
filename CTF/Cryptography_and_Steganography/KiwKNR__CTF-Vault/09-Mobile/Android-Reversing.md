---
tags: [ctf, mobile, android, frida, hooking]
created: 2026-05-02
---

# 🤖 Android Reversing: ลึก

> เน้น: Frida hooking, dynamic analysis, common vulnerabilities

---

## 🛠 Setup

### ADB (Android Debug Bridge)
```bash
sudo apt install android-tools-adb

# Connect
adb devices
adb shell                                     # interactive shell
adb push file /sdcard/                        # upload to device
adb pull /sdcard/file ./                      # download
adb logcat                                    # real-time logs
adb logcat | grep MyApp                       # filter
adb install app.apk
adb uninstall com.example.app
adb shell pm list packages                    # list installed
adb shell pm path com.example.app            # find APK location
adb pull /data/app/.../base.apk pulled.apk    # extract APK
```

### Frida
```bash
pip install frida frida-tools

# Push frida-server to device (need root or emulator)
adb push frida-server-XX-android-arm64 /data/local/tmp/
adb shell "chmod +x /data/local/tmp/frida-server-XX-android-arm64"
adb shell "/data/local/tmp/frida-server-XX-android-arm64 &"

# Verify
frida-ps -U                                   # list processes
```

### Objection (Frida wrapper)
```bash
pip install objection

# Run on app
objection -g com.example.app explore

# Inside objection
> android hooking list classes
> android hooking watch class com.example.app.MainActivity
> android hooking set return_value com.example.app.checkPassword true
> android sslpinning disable
> android root disable
```

---

## 🎯 Frida Workflow

### Hook a method
```javascript
// hook.js
Java.perform(function() {
    var MainActivity = Java.use('com.example.app.MainActivity');
    
    // Hook checkPassword
    MainActivity.checkPassword.implementation = function(password) {
        console.log('[+] checkPassword called with: ' + password);
        var ret = this.checkPassword(password);
        console.log('[+] returned: ' + ret);
        return true;        // override: always return true
    };
});
```

```bash
frida -U -l hook.js -f com.example.app
```

### List classes/methods
```javascript
Java.perform(function() {
    Java.enumerateLoadedClasses({
        onMatch: function(name) {
            if (name.indexOf('example') !== -1) {
                console.log(name);
            }
        },
        onComplete: function() {}
    });
});
```

### Hook all methods of a class
```javascript
Java.perform(function() {
    var Cls = Java.use('com.example.app.MyClass');
    var methods = Cls.class.getDeclaredMethods();
    
    methods.forEach(function(m) {
        var name = m.getName();
        Cls[name].overloads.forEach(function(overload) {
            overload.implementation = function() {
                console.log('[+] ' + name + ' called');
                console.log('  args: ' + JSON.stringify(arguments));
                var ret = overload.apply(this, arguments);
                console.log('  return: ' + ret);
                return ret;
            };
        });
    });
});
```

### Bypass root detection
```javascript
Java.perform(function() {
    var File = Java.use('java.io.File');
    File.exists.implementation = function() {
        var path = this.getAbsolutePath();
        if (path.indexOf('su') !== -1 || 
            path.indexOf('busybox') !== -1 ||
            path.indexOf('Magisk') !== -1) {
            return false;
        }
        return this.exists();
    };
});
```

### Bypass SSL pinning ⭐
```javascript
// Multiple pinning libs - hook all
Java.perform(function() {
    // OkHttp 3
    try {
        var CertificatePinner = Java.use('okhttp3.CertificatePinner');
        CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function() {
            console.log('[+] OkHttp pinning bypassed');
            return;
        };
    } catch (e) {}
    
    // TrustManager
    try {
        var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        var SSLContext = Java.use('javax.net.ssl.SSLContext');
        // ...override
    } catch (e) {}
    
    // ใช้ pre-made script: ssl-pinning-bypass จาก github
});
```

ใน practice ใช้ **frida-ssl-pinning-bypass** scripts สำเร็จรูป:
- httptoolkit.com/blog/frida-certificate-pinning
- Objection: `objection -g <app> explore` → `android sslpinning disable`

### Trace function calls
```javascript
Java.perform(function() {
    var Cipher = Java.use('javax.crypto.Cipher');
    Cipher.getInstance.overload('java.lang.String').implementation = function(transformation) {
        console.log('[+] Cipher.getInstance: ' + transformation);
        return this.getInstance(transformation);
    };
    
    Cipher.doFinal.overload('[B').implementation = function(data) {
        console.log('[+] Cipher.doFinal:');
        console.log('  Mode: ' + this.getAlgorithm());
        console.log('  Input: ' + bytesToHex(data));
        var ret = this.doFinal(data);
        console.log('  Output: ' + bytesToHex(ret));
        return ret;
    };
});

function bytesToHex(bytes) {
    var hex = '';
    for (var i = 0; i < bytes.length; i++) {
        hex += ('00' + (bytes[i] & 0xff).toString(16)).slice(-2);
    }
    return hex;
}
```

### Get key from KeyStore
```javascript
Java.perform(function() {
    var SecretKeySpec = Java.use('javax.crypto.spec.SecretKeySpec');
    SecretKeySpec.$init.overload('[B', 'java.lang.String').implementation = function(key, alg) {
        console.log('[+] Key: ' + bytesToHex(key) + ' (' + alg + ')');
        return this.$init(key, alg);
    };
});
```

→ Hook ทุกครั้งที่สร้าง key → leak

---

## 📂 Common Storage Locations

ดูข้อมูล app เก็บอะไร:
```bash
adb shell                              # need root or debuggable app
cd /data/data/com.example.app/

# SharedPreferences
ls shared_prefs/
cat shared_prefs/MyPrefs.xml

# SQLite databases
ls databases/
sqlite3 databases/data.db
sqlite> .tables
sqlite> SELECT * FROM users;

# Files
ls files/

# Cache
ls cache/
```

→ มัก leak: tokens, credentials, settings, debug logs

---

## 🌐 Network Traffic Analysis

### Setup Burp on Android
1. Phone proxy → laptop IP : 8080 (Burp)
2. Install Burp CA cert on phone
3. **For SSL inspection**:
   - User cert (Android < 7) → trusted automatically
   - Android 7+ → need to be system cert OR app must opt-in via `network_security_config.xml`
   - Bypass: Frida script → trust user certs

### Bypass SSL pinning (recap)
- Frida script
- Objection: `android sslpinning disable`
- Patch APK: edit `network_security_config.xml`

```xml
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

Repackage + sign → SSL inspection works

---

## 🐛 Common CTF Patterns

### Pattern 1: Hardcoded flag
```bash
jadx-gui app.apk
# Search "flag{"
```

### Pattern 2: Encrypted flag
ดู `MainActivity` → encryption call → Frida hook key + IV → decrypt

### Pattern 3: Native code obfuscation
- Some flags ใน .so library
- Open with Ghidra → trace JNI function

### Pattern 4: WebView XSS / RCE
WebView load HTML → JS interface allows code execution
```java
webView.addJavascriptInterface(new MyInterface(), "android");
// Then in JS: window.android.someMethod()
```
ถ้า method dangerous → RCE

### Pattern 5: Insecure Provider
ContentProvider exported → callable by other apps
```bash
adb shell content query --uri content://com.example.app.provider/data
```

### Pattern 6: Deep link manipulation
App registers `myapp://` scheme: handle URL params
```bash
adb shell am start -a android.intent.action.VIEW -d "myapp://action?param=evil"
```

### Pattern 7: Activity manipulation
Exported activity callable directly:
```bash
adb shell am start -n com.example.app/.SecretActivity --ez bypass true
```

---

## 🛠 MobSF (Mobile Security Framework)

Auto static + dynamic analysis tool

```bash
# Docker
docker run -it --rm -p 8000:8000 opensecurity/mobile-security-framework-mobsf

# Or local install
git clone https://github.com/MobSF/Mobile-Security-Framework-MobSF
cd Mobile-Security-Framework-MobSF
./setup.sh
./run.sh
```

→ Web UI → upload APK → auto report

---

## 🔥 Advanced: Bypass Anti-Frida

Some apps detect Frida:
- ดู process name `frida-server` running
- ดู port 27042 (default Frida)
- Check ptrace status
- Read /proc/self/maps สำหรับ Frida loader

### Bypass
- Run Frida-server on non-default port
- Rename Frida-server binary
- Use `frida-server` patched
- Or hook the detection function with Frida itself (cat-and-mouse)

Tools: **strongR-frida-android**: patched Frida that's stealthier

---

## 📋 Workflow Cheatsheet

```
1. Get APK
   adb shell pm path com.example.app
   adb pull /data/app/.../base.apk

2. Static
   apktool d base.apk
   jadx-gui base.apk
   Read AndroidManifest.xml
   Search "flag", "password", hardcoded keys

3. Resources / Storage
   /data/data/<pkg>/shared_prefs/
   /data/data/<pkg>/databases/

4. Dynamic
   Frida hook check functions
   Frida hook crypto (key extraction)
   Burp + SSL pinning bypass

5. Native (if applicable)
   Ghidra on lib/*/lib*.so

6. Recombine clues → flag
```

---

## 🔗 ที่เกี่ยวข้อง

- [Mobile-Intro](Mobile-Intro.md)
- [iOS-Hooking](iOS-Hooking.md)
- [Frida basics](../05-Reverse-Engineering/Dynamic-Analysis.md)

## 📚 References

- frida.re documentation
- httptoolkit.com: SSL pinning bypass guides
- OWASP MASVS / MSTG
- "Android Security Internals": Nikolay Elenkov

---

#ctf #mobile #android #frida
