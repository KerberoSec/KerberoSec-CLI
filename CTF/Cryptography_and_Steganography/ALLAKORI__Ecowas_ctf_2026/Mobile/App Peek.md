# 🏆 Challenge Writeup: App Peek

![CTF](https://img.shields.io/badge/CTF-EcowasCTF-blue)
![Category](https://img.shields.io/badge/Category-Mobile-red)
![Difficulty](https://img.shields.io/badge/Difficulty-Easy-orange)
![Points](https://img.shields.io/badge/Points-100-green)

## 📌 Challenge Information
- **Name:** App Peek
- **Author:** EcowasCTF
- **Category:** Mobile
- **Points:** 100
- **Connection:** `App Peek.apk` (Static Analysis)

---

## 🧠 Challenge Description
Analyze the APK and extract the flag.

---

## 🔍 Initial Analysis
The file is an Android APK (8.3 KB). Since it is an "Easy" mobile challenge, the goal is to perform static analysis to find a hardcoded flag within the application's resources.

---

## 🧪 Exploration & Failed Attempts
* Attempt 1: Running the strings command on the binary.
  ````
   strings App\ Peek.apk | grep "EcowasCTF"
  ````
* Result: Failed (no output). This is because Android resource XMLs are stored in a compiled binary format that plain grep cannot read effectively.

---

## ⚙️ Exploitation Process

### 1. Decoding the APK
I used apktool with the decode option to extract the project structure and convert binary XMLs into human-readable text.
````
 apktool d App\ Peek.apk
````
### 2. Searching for the Flag
I performed a recursive search for the "Ecowas" string inside the decoded folder.
````
 grep -ri "Ecowas" App\ Peek/
````
The flag was discovered in the following file: App Peek/res/values/strings.xml

---

## 🧾 Final Solve (Terminal Commands)
````
apktool d App\ Peek.apk
grep -ri "Ecowas" App\ Peek/
````
---

## 🚩 Flag
EcowasCTF{m0b1l3_4pKK_p3ek}

---

## 💡 Conclusion
This challenge demonstrates the vulnerability of Hardcoded Sensitive Information. The flag was stored in plain text inside the strings.xml resource file. By using apktool to decode the APK, any analyst can easily retrieve such secrets.
