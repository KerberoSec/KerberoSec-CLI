
# 🧩 Obscura: Reverse Engineering (Mobile)  

![Category](https://img.shields.io/badge/Category-Reverse-blue)  
![Difficulty](https://img.shields.io/badge/Difficulty-Easy-green)  
![Platform](https://img.shields.io/badge/Platform-Android-brightgreen)  

---

## 🏁 Challenge Overview  

We are given an Android application:  

```

Obscura.apk.zip

````

After extraction:  

```bash
unzip Obscura.apk.zip
````

We obtain:

```
Obscura.apk
```

🎯 **Goal:** Reverse the APK and retrieve the flag.

---

## 🔍 Step 1: APK Decompilation

We start by decompiling the APK using `apktool`:

```bash
apktool d Obscura.apk -o apk_dec
cd apk_dec
```

---

## 🔎 Step 2: Initial Recon

We perform a quick keyword scan:

```bash
grep -RinE "EcowasCTF|flag|secret|http" .
```

🔑 This reveals an API endpoint:

```xml
<string name="api_url">http://192.168.45.5:5003/login</string>
```

⚠️ The IP is private, but the challenge provides:

```
http://labs.ecowasctf.com.gh:5003/
```

➡️ Reconstructed endpoint:

```
http://labs.ecowasctf.com.gh:5003/login
```

---

## 🌐 Step 3: API Discovery (curl)

### 🔹 Test endpoint

```bash
curl -i http://labs.ecowasctf.com.gh:5003/login
```

Response:

```
405 METHOD NOT ALLOWED
Allow: OPTIONS, POST
```

🧠 Interpretation:

* Endpoint exists ✅
* GET not allowed ❌
* POST required ✔

---

### 🔹 Try POST

```bash
curl -i -X POST http://labs.ecowasctf.com.gh:5003/login
```

Response:

```
415 Unsupported Media Type
```

🧠 Interpretation:

* Server expects JSON

---

### 🔹 Send JSON

```bash
curl -i -X POST http://labs.ecowasctf.com.gh:5003/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:

```json
{"error":"Invalid credentials"}
```

🧠 Interpretation:

* Format is correct
* Credentials are required

---

## 🔑 Step 4: Extract Credentials

Search for credentials inside the APK:

```bash
grep -RinE "username|password|user|pass|login|token|key" .
```

We find:

```xml
<string name="username">user</string>
<string name="password">user_access</string>
```

### 🔹 Test credentials

```bash
curl -i -X POST http://labs.ecowasctf.com.gh:5003/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"user_access"}'
```

Response:

```json
{"message":"Login successful"}
```

✔ Login works
❌ No flag returned

🧠 Interpretation:

* These are **low-privilege credentials**
* A higher privilege account likely exists (admin)

---

## 🔍 Step 5: Smali Analysis

Search for suspicious logic:

```bash
grep -RinE "getPass|getUser|Base64|decode" .
```

We discover:

```
getPass()
getUser()
Base64.decode
```

🚨 Strong indicator of hidden credentials

---

## 🔓 Step 6: Decode Hidden Credentials

### 🔹 Extract password

```bash
sed -n '10,25p' smali/com/metasploit/stage/MainActivity.smali
```

```smali
const-string v0, "czNjcjN0IQ=="
```

Decode:

```bash
echo "czNjcjN0IQ==" | base64 -d
```

Result:

```
s3cr3t!
```

---

### 🔹 Extract username

```bash
sed -n '8610,8628p' smali/com/metasploit/stage/Payload.smali
```

```smali
const-string v0, "YWRtaW4="
```

Decode:

```bash
echo "YWRtaW4=" | base64 -d
```

Result:

```
admin
```

---

## 🚀 Step 7: Final Exploit

```bash
curl -i -X POST http://labs.ecowasctf.com.gh:5003/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"s3cr3t!"}'
```

Response:

```json
{
  "flag": "EcowasCTF{h4rdc0d3d_m0b1l3_xpl0it}",
  "message": "Welcome admin"
}
```

---

## 🏁 Flag

```
EcowasCTF{h4rdc0d3d_m0b1l3_xpl0it}
```

---

## 🧠 Key Takeaways

* 🔍 Always start with `grep` for quick recon
* 🌐 Use `curl` to validate API behavior
* 📡 HTTP status codes guide the attack flow:

  * `405` → wrong method
  * `415` → wrong format
  * `401` → missing credentials
  * `200` → success
* ⚠️ `strings.xml` may contain fake credentials
* 🔬 Always analyze **smali code for hidden logic**
* 🔐 Base64 is commonly used to obfuscate secrets

---

## 🔥 Methodology Summary

```
APK → Decompile → Grep → API Discovery → curl → Credentials → Smali → Decode → Admin Access → Flag
```

---

```
```
