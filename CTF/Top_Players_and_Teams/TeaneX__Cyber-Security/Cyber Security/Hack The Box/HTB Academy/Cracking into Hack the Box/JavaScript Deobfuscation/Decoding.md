# 🔐 Decoding Challenge Write-up

## 🎯 Target Information
- **URL**: `http://94.237.123.178:59389/serial.php`
- **Objective**: Find the flag by decoding encoded messages
- **Method**: POST requests with encoded parameters

---

## 🔍 Step-by-Step Solution

### **Step 1: Initial Reconnaissance**
Started with a simple POST request to understand the endpoint:

```bash
curl -X POST http://94.237.123.178:59389/serial.php -d "param1=sample"
```

**Response**:  
`ZG8gdGhlIGV4ZXJjaXNlLCBkb24ndCBjb3B5IGFuZCBwYXN0ZSA7KQo=`

### **Step 2: Identify Encoding Type**
- String contains only alphanumeric characters with `=` padding
- **Identified as**: Base64 encoding

### **Step 3: First Decoding**
```bash
echo "ZG8gdGhlIGV4ZXJjaXNlLCBkb24ndCBjb3B5IGFuZCBwYXN0ZSA7KQo=" | base64 -d
```

**Decoded Message**:  
`do the exercise, don't copy and paste ;)`

### **Step 4: Follow Instructions**
Sent the decoded message as required:

```bash
curl -X POST http://94.237.123.178:59389/serial.php -d "serial=do the exercise, don't copy and paste ;)"
```

**Response**:  
`N2gxNV8xNV9hX3MzY3IzN19tMzU1NGcz`

### **Step 5: Second Decoding**
```bash
echo "N2gxNV8xNV9hX3MzY3IzN19tMzU1NGcz" | base64 -d
```

**Decoded Message**:  
`7h15_15_a_s3cr37_m3554g3`

*Note: This is leetspeak for "this_is_a_secret_message"*

### **Step 6: Final Request**
Sent the leetspeak message:

```bash
curl -X POST http://94.237.123.178:59389/serial.php -d "serial=7h15_15_a_s3cr37_m3554g3"
```

---

## 🏁 Flag
```plaintext
HTB{ju57_4n07h3r_r4nd0m_53r14l}
```

---

## 💡 Key Takeaways
- **Base64 Recognition**: Look for alphanumeric strings with `=` padding
- **Follow Instructions Carefully**: The challenge required multiple decoding rounds
- **Leetspeak Awareness**: `7h15_15_a_s3cr37_m3554g3` = `this_is_a_secret_message`
- **Iterative Approach**: Sometimes challenges require multiple steps of decoding and sending data

---
## 🛠️ Tools Used
- `curl` for HTTP requests
- `base64` for decoding
- Kali Linux terminal

---

## 🏷️ Tags

#Web #HackTheBox #JavaScript 
[[Cracking into Hack the Box Path]]
