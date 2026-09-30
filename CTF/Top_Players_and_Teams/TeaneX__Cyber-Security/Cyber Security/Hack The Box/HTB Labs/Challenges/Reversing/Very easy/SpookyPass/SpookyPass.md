# 👨‍💻HTB Challenge: SpookyPass Write-up

- **Category:** Reverse Engineering  
- **Difficulty:** Easy  
- **Flag:** `HTB{un0bfu5c4t3d_5tr1ng5}`
- **Tools Used:** `unzip`,`file`,`string`,`bash` 
- **Platform:** Hack The Box

---

## 📂 Step 1: Unzip the Archive

**Input:**
```bash
ls
````

**Output:**

```bash
SpookyPass.zip
```

---

**Input:**

```bash
unzip SpookyPass.zip
```

**Output:**

```bash
Archive:  SpookyPass.zip
   creating: rev_spookypass/
[SpookyPass.zip] rev_spookypass/pass password: 
  inflating: rev_spookypass/pass
```

---

**Input:**

```bash
ls
```

**Output:**

```bash
rev_spookypass  SpookyPass.zip
```

---

## 📁 Step 2: Navigate and Check Files

**Input:**

```bash
cd rev_spookypass
ls
```

**Output:**

```bash
pass
```

---

## 🔍 Step 3: Analyze the File

**Input:**

```bash
file pass
```

**Output:**

```bash
pass: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=3008217772cc2426c643d69b80a96c715490dd91, for GNU/Linux 4.4.0, not stripped
```

---

## 🔎 Step 4: Extract Strings

**Input:**

```bash
strings pass
```

**Output (snippet):**

```bash
...
Welcome to the 
[1;3mSPOOKIEST
[0m party of the year.
Before we let you in, you'll need to give us the password: 
s3cr3t_p455_f0r_gh05t5_4nd_gh0ul5
Welcome inside!
You're not a real ghost; clear off!
...
```

> 🔑 Password found: `s3cr3t_p455_f0r_gh05t5_4nd_gh0ul5`

---

## 🚀 Step 5: Run the Program

**Input:**

```bash
./pass
```

**Output:**

```bash
Welcome to the SPOOKIEST party of the year.
Before we let you in, you'll need to give us the password: s3cr3t_p455_f0r_gh05t5_4nd_gh0ul5
Welcome inside!
HTB{un0bfu5c4t3d_5tr1ng5}
```

---

## 🏁 Final Flag

```
HTB{un0bfu5c4t3d_5tr1ng5}
```

---

## 🛠️ Tools Used

- `unzip`
    
- `file`
    
- `strings`
    
- `bash`
    

---

## 📌 Summary

This was a beginner-friendly reverse engineering challenge. Since the binary was **not stripped** and the password was stored as a plaintext string, we were able to retrieve the flag using just basic Linux tools: no decompilers needed.

## 🏷️ Tags

#ReverseEngineering #Spookypass #BinaryExploitation #HackTheBox #CTF 

[[Reverse Engineering]]
