## 🏷️ Tool

![Wget](https://img.shields.io/badge/Wget-File%20Retrieval-green?style=for-the-badge\&logo=linux)

---

# 📥 2. Wget: Download Exposed Git Repository

### 🎯 Objective

Retrieve the publicly accessible `.git` directory from the web server.

<details>
<summary>💻 Command</summary>

```bash
wget -r -np -R "index.html*" http://<TARGET_IP>:8080/.git/
```

</details>

### 🔧 Options Explained

| Option | Description                                             |
| ------ | ------------------------------------------------------- |
| `-r`   | Enables recursive downloading                           |
| `-np`  | Prevents downloading files outside the target directory |
| `-R`   | Rejects files matching a specific pattern               |

### 🧠 Why These Options?

The `.git` directory contains multiple nested objects and metadata files.

* `-r` was required to download the complete repository structure
* `-np` restricted downloads to the exposed `.git` directory only
* `-R "index.html*"` removed unnecessary auto-generated directory pages

Sample

### ✅ Result

The exposed repository was successfully downloaded locally.