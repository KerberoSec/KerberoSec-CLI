# Bandit Level 17

```bash
    nmap -sV -p 31000-32000 127.0.0.1
    # We scan all the port between 31000 and 32000
    # PORT      STATE SERVICE
    # 31046/tcp open  echo
    # 31518/tcp open  ssl/echo
    # 31691/tcp open  echo
    # 31790/tcp open  ssl/unknown
    # 31960/tcp open  echo
```
```bash
    openssl s_client -quiet -connect 127.0.0.1:31790
    # Paste the password 
    # Correct!
    # -----BEGIN RSA PRIVATE KEY-----
    # ...
    # -----END RSA PRIVATE KEY-----
```
And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))

```bash
    mkdir /tmp/reda2
    cd /tmp/reda2
    touch rsakey_private
    vim rsakey_private
    # Paste [ESC] and type :wq to save and quit
    chmod 600 rsakey_private
    ssh -i rsakey_private bandit17@localhost
```
