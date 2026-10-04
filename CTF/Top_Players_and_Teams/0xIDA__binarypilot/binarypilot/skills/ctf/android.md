---
name: android
description: "CTF Android challenge analysis. APK static analysis with Jadx and APKTool, smali disassembly for flag validation logic, native library JNI reverse engineering with Radare2, ADB dynamic analysis with exported activity launch and content provider query, Frida dynamic instrumentation for method hooking and return value patching, smali patching to bypass flag checks, React Native JS bundle extraction, root detection bypass, SharedPreferences and SQLite flag recovery. Triggers: 'android ctf', 'apk reverse engineering', 'jadx decompile', 'apktool smali', 'frida android', 'adb ctf', 'android frida hook', 'apk flag', 'smali patch', 'android native jni', 'react native apk'."
---

# CTF Android: APK Reverse Engineering

Jadx, APKTool, ADB, Frida. Full static+dynamic workflow.

## Install

```bash
# Jadx (latest):
wget https://github.com/skylot/jadx/releases/latest/download/jadx-1.5.0.zip
unzip jadx-1.5.0.zip -d jadx && echo "export PATH=$PATH:$PWD/jadx/bin" >> ~/.bashrc

# APKTool:
wget https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/linux/apktool
wget https://github.com/iBotPeaches/Apktool/releases/latest/download/apktool_2.9.3.jar
chmod +x apktool && sudo mv apktool /usr/local/bin/ && sudo mv apktool_2.9.3.jar /usr/local/bin/apktool.jar

# ADB:
sudo apt-get install adb

# Frida:
pip install frida-tools --break-system-packages
# Push frida-server to emulator:
# adb push frida-server /data/local/tmp/ && adb shell chmod 755 /data/local/tmp/frida-server
```

---

## Phase 1: Reconnaissance

```bash
# Unzip APK (it's a ZIP):
unzip challenge.apk -d apk_contents/
ls apk_contents/  # AndroidManifest.xml, classes.dex, lib/, assets/, res/

# Check manifest for exported components:
apktool d challenge.apk -o apk_decoded/
cat apk_decoded/AndroidManifest.xml | grep -E "exported|Activity|Provider|Receiver"

# Find interesting strings:
strings apk_contents/classes.dex | grep -i "flag\|secret\|pass\|key\|encrypt"

# Check assets for plaintext:
find apk_contents/assets/ -type f | xargs strings | grep -i "flag\|CTF"
cat apk_decoded/res/values/strings.xml | grep -i "flag\|secret"
```

---

## Phase 2: Static Analysis with Jadx

```bash
# Decompile to Java:
jadx -d jadx_out/ challenge.apk

# Search for flag logic:
grep -r "flag\|Flag\|FLAG" jadx_out/sources/ --include="*.java"
grep -r "checkFlag\|verify\|validate\|password" jadx_out/sources/ --include="*.java"

# Find crypto usage:
grep -r "AES\|DES\|Base64\|SecretKeySpec\|Cipher" jadx_out/sources/ --include="*.java"

# Find hardcoded keys/values:
grep -r "BuildConfig\|const String" jadx_out/sources/ --include="*.java"
grep -r "SharedPreferences\|openDatabase\|SQLite" jadx_out/sources/ --include="*.java"

# Native calls:
grep -r "native \|System.loadLibrary\|loadLibrary" jadx_out/sources/ --include="*.java"
```

---

## Phase 3: Smali Analysis

```bash
# Disassemble to Dalvik bytecode:
apktool d challenge.apk -o smali_out/

# Find main activity:
grep -r "onCreate\|onStart" smali_out/smali/ | head -10

# Read flag check class:
cat smali_out/smali/com/ctf/challenge/FlagChecker.smali

# Key smali instructions:
# const-string v0, "expected_value"   → hardcoded strings
# invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
# if-eqz v0, :cond_fail              → conditional jumps

# Search for comparisons:
grep -n "if-eqz\|if-nez\|equals\|const-string" smali_out/smali/com/ctf/challenge/*.smali
```

---

## Phase 4: Native Library Analysis

```bash
LIB="apk_contents/lib/x86_64/libchallenge.so"  # or armeabi-v7a, arm64-v8a

# Basic analysis:
strings "$LIB" | grep -i "flag\|secret\|CTF"
nm -D "$LIB" | grep "Java_"  # JNI function exports

# Radare2 analysis:
r2 "$LIB" -A
# Commands:
# afl: list functions
# pdf @sym.Java_com_ctf_FlagChecker_checkNative: disassemble
# iz: list all strings
# iE: list exports

# JNI function naming convention:
# Java_<package_dots_to_underscores>_<ClassName>_<methodName>
# Java_com_ctf_challenge_FlagActivity_checkFlag

# Check for embedded key in .rodata:
objdump -s -j .rodata "$LIB" | head -50
```

---

## Phase 5: Dynamic Analysis with ADB

```bash
# Start emulator (API 29 recommended for most compatibility):
# In Android Studio or: emulator -avd Pixel_3_API_29

# Install APK:
adb install challenge.apk

# Launch specific activity:
adb shell am start -n com.ctf.challenge/.FlagActivity
adb shell am start -n "com.ctf.challenge/com.ctf.challenge.MainActivity"

# Query exported content provider:
adb shell content query --uri "content://com.ctf.challenge.provider/flags"
adb shell content query --uri "content://com.ctf.challenge/data" --projection "*"

# Send broadcast:
adb shell am broadcast -a com.ctf.challenge.GET_FLAG

# Monitor app output:
adb logcat | grep -i "flag\|ctf\|secret\|error"
adb logcat com.ctf.challenge:D *:S

# Pull SQLite database:
adb shell run-as com.ctf.challenge cp /data/data/com.ctf.challenge/databases/app.db /sdcard/
adb pull /sdcard/app.db
sqlite3 app.db ".tables"
sqlite3 app.db "SELECT * FROM flags;"

# Pull SharedPreferences:
adb shell run-as com.ctf.challenge cat /data/data/com.ctf.challenge/shared_prefs/prefs.xml
```

---

## Phase 6: Frida Dynamic Instrumentation

```bash
# Start frida-server on device:
adb shell /data/local/tmp/frida-server &

# List running apps:
frida-ps -U | grep ctf

# Attach and hook:
frida -U -f com.ctf.challenge -l hook.js --no-pause
```

```javascript
// hook.js: Hook String.equals to see flag comparison:
Java.perform(function() {
    Java.use('java.lang.String').equals.implementation = function(other) {
        const result = this.equals(other);
        if (this.toString().includes('CTF') || (other && other.toString().includes('CTF'))) {
            console.log('[+] String.equals: "' + this + '" vs "' + other + '" => ' + result);
        }
        return result;
    };
});

// Hook checkFlag method:
Java.perform(function() {
    const FlagChecker = Java.use('com.ctf.challenge.FlagChecker');
    FlagChecker.checkFlag.implementation = function(input) {
        console.log('[+] checkFlag called with: ' + input);
        const result = this.checkFlag(input);
        console.log('[+] checkFlag returned: ' + result);
        return true;  // Always return true (bypass)
    };
});

// Dump all method calls:
Java.perform(function() {
    Java.enumerateLoadedClasses({
        onMatch: function(name) {
            if (name.includes('ctf')) {
                try {
                    const cls = Java.use(name);
                    // Hook all methods
                } catch(e) {}
            }
        },
        onComplete: function() {}
    });
});

// Hook native function:
Interceptor.attach(Module.findExportByName('libchallenge.so', 'Java_com_ctf_challenge_FlagChecker_checkNative'), {
    onEnter: function(args) {
        console.log('[+] Native checkNative args:', args[2]);  // JNIEnv, jclass, actual_arg
    },
    onLeave: function(retval) {
        console.log('[+] Native return:', retval);
        retval.replace(1);  // Force return true (jboolean = 1)
    }
});
```

---

## Phase 7: Smali Patching

```bash
# Edit smali to bypass check:
nano smali_out/smali/com/ctf/challenge/FlagChecker.smali

# Change conditional:
# BEFORE: if-eqz v0, :cond_fail
# AFTER:  if-nez v0, :cond_fail  (invert logic)
# OR:     goto :cond_success     (skip check entirely)

# OR: force checkFlag to always return true:
# Find the return-* instruction, replace with:
# const/4 v0, 0x1
# return v0

# Recompile:
apktool b smali_out/ -o challenge_patched.apk

# Sign (required for installation):
# Generate key (first time):
keytool -genkey -v -keystore debug.keystore -alias debug -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Debug"

# Sign APK:
apksigner sign --ks debug.keystore --ks-pass pass:android --key-pass pass:android \
    --out challenge_patched_signed.apk challenge_patched.apk

# Install:
adb install -r challenge_patched_signed.apk
```

---

## Phase 8: React Native / Special Cases

```bash
# React Native: extract JS bundle:
find apk_contents/ -name "*.bundle" -o -name "index.android.bundle"
cat apk_contents/assets/index.android.bundle | grep -i "flag\|secret"

# De-obfuscate minified JS:
node -e "
const code = require('fs').readFileSync('index.android.bundle', 'utf8');
// Find flag-related function:
const match = code.match(/function[^{]+\{[^}]*flag[^}]*\}/gi);
console.log(match);
"

# Root detection bypass (Frida):
Java.perform(function() {
    // Bypass common root checks:
    const RootBeer = Java.use('com.scottyab.rootbeer.RootBeer');
    RootBeer.isRooted.implementation = function() { return false; };
    RootBeer.isRootedWithBusyBoxCheck.implementation = function() { return false; };

    // Generic file check bypass:
    const File = Java.use('java.io.File');
    File.exists.implementation = function() {
        const path = this.getAbsolutePath();
        if (path.includes('su') || path.includes('magisk')) return false;
        return this.exists();
    };
});
```

---

## Output

Save to `.omop/engagement/ctf/android/`:
- `hook.js`: Frida hook script
- `analysis.txt`: key findings
- `flag.txt`: captured flag

## Next Phase

→ `ctf-reverse-patterns-ctf` for native binary analysis
→ `ctf-wasm` for WebAssembly challenges
