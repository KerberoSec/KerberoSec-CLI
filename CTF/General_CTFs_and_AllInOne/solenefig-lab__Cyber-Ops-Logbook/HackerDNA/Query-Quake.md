# WriteUp : Query Quake

**Plateforme :** HackerDNA  (https://hackerdna.com/fr/labs/query-quake)

**Catégorie :**  SQL Injection: WebShell: Privilege Escalation  
**Difficulté :** Moyen   
**Tags :** `MYSQLI` `RCE`

---

## Scénario

Le laboratoire simule une entreprise fictive, NexaTech Solutions, exposant une interface d'administration non référencée mais accessible depuis Internet. La surface d'attaque apparente est minimale : un seul port ouvert, des formulaires statiques. 
L'objectif du laboratoire est de comprendre comment plusieurs faiblesses peuvent se combiner pour former une chaîne de compromission; l'intérêt du scénario ne réside pas uniquement dans l'exploitation de la SQL Injection, mais dans l'enchaînement de contrôles de sécurité insuffisants.

---

## Chaîne d'Attaque
`[Reconnaissance & Énumération]` ➔ `[Analyse du Point d'Entrée]` ➔ `[Injection SQL par erreur]` ➔ `[Contournement d'authentification]` ➔ `[WebShell]` ➔ 🚩 ➔ `[Énumération post-exploitation]` ➔ `[Escalade de Privilège]` ➔ 🚩

---

## Étape 1: Reconnaissance & Énumération

La première reconnaissance ne met pas en valeur de port exposé (un seul port ouvert, le port 80, HTTP standard). 
La première étude du site web révèle 2 formulaires `contact-form`et `newsletter`. Mais dans le code source, les formulaires ont tous : `<form action="#">`, donc les paramètres name, email, message et newsletter ne sont pas envoyés à un endpoint serveur dédié.

Une énumération via **fuzzing** confirme l'existence d'une autre application Web "webadmin".

```bash
ffuf -u "http://$IP/FUZZ" \
  -w "/Users/SecLists/Discovery/Web-Content/common.txt" \
  -mc all \
  -fc 404

webadmin                [Status: 301, Size: 319, Words: 20, Lines: 10, Duration: 23ms]
```

La ressource /webadmin/ présente une page d'administration, mais ne révèle pas immédiatement de fonctionnalité exploitable.

Une deuxième énumération via **fuzzing** sur "webadmin/" confirme un nouveau point d'entrée : `webadmin/index.php`.

**Réflexe audit :** 
- Une ressource non référencée n'est pas nécessairement une ressource protégée. 
- Vérifier systématiquement : accessibilité depuis Internet, restrictions réseau (firewall, VPN, IP allowlist), mécanismes d’authentification et de journalisation.  

---

## Étape 2: Analyse du point d'entrée

L'analyse du point d'entrée "/webadmin/index.php" confirme :  
- l'existence d'un formulaire d'authentification,  
- deux points d'accés possibles `username` et `password`. 
Le premier test logique est donc de déterminer si `username` est injectable.

```bash
curl -s -X POST "http://$IP/webadmin/index.php" \
  -d "username=test%27&password=test"
<br />
<b>Fatal error</b>:  Uncaught mysqli_sql_exception: You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near ''test''' at line 1 in /var/www/html/webadmin/index.php:20
Stack trace:
#0 /var/www/html/webadmin/index.php(20): mysqli-&gt;query('SELECT * FROM a...')
#1 {main}
  thrown in <b>/var/www/html/webadmin/index.php</b> on line <b>20</b><br />
```

Le paramètre `username` est vulnérable à une **injection SQL par erreur**.

**Réflexe audit :**  
- Lorsqu'un paramètre utilisateur atteint un interpréteur, vérifier que les données restent séparées des instructions.
- Vérifier également que les erreurs détaillées et stack traces ne sont pas exposées en production.

---

## Étape 3: Contournement d'authentification

La requête sous-jacente est du type : `SELECT * FROM users WHERE user='INPUT' AND pass='INPUT'`

Le laboratoire fournit également une erreur suffisamment détaillée pour **utiliser le comportement du moteur SQL comme canal d'information**.

La fonction updateXML() de MySQL peut provoquer une erreur XPath contenant une valeur contrôlée. Ici, ce comportement permet notamment de confirmer des informations sur le contexte SQL.

Ce mécanisme permet d'identifier un certain nombre d'information clés : 
- Base de données  via SELECT database()  
- Table            → via information_schema.tables  
- Colonnes         → via information_schema.columns  
- Credentials  

**Résumé des découvertes**
- Vulnérabilité : contournement d’authentification par SQLi sur /`webadmin/index.php`.
- Impact : accès au dashboard administrateur sans identifiants valides.
- Données exposées : schéma DB et credentials.
- CWE : CWE-89: Improper Neutralization of Special Elements used in an SQL Command.
- Correctif principal : requêtes préparées / paramètres liés.
- Autres contrôles : désactiver les erreurs détaillées en production, journaliser côté serveur, limiter les privilèges du compte SQL applicatif.

---

## Étape 4: Injection SQL et Détournement d'un WebShell

Une fois la SQLi confirmée, l’étape suivante est d’évaluer les privilèges du compte MySQL, notamment via `@@secure_file_priv`.
Ici, aucune restriction de répertoire n’est retournée et le compte dispose du privilège `FILE`.

```bash
<b>Fatal error</b>:  Uncaught mysqli_sql_exception: XPATH syntax error: '~EMPTY~' in /var/www/html/webadmin/index.php:20
```

En combinant :  
- Identification dy nombre de colonnes de la table en utilisant la clause `ORDER BY`,  
- Injection SQL en utilisant UNION pour sélectionner et récupérer des données entières de la base de données,  
- Utilisation de la clause `SELECT INTO OUTFILE` pour écrire des données dans des fichiers à partir de la requête précédente (fonctionne grâce à la combinaison secure_file_priv vide + privilège FILE accordé à l'utilisateur MySQL),  
il est possible d’écrire un fichier PHP dans un répertoire accessible par le serveur web, puis d’obtenir un webshell exécuté dans le contexte du serveur (`www-data`).

Le dépôt d'un webshell permet alors de confirmer l'exécution de commandes dans le contexte du serveur web :

```bash
curl -s "http://$IP/shell.php?cmd=id"
→ uid=33(www-data)
```

Une fois le chemin du fichier flag-user.txt trouvé, il suffit de le lire avec la commande `cat`pour obtenir le premier flag.

🚩 Flag User

La vulnérabilité applicative est devenue une compromission du contexte d'exécution de l'application.

**Réflexe audit :**  
- Vérifier les privilèges du compte SQL utilisé par l’application (moindre privilège, pas de FILE inutile).  
- Contrôles : révoquer FILE, restreindre secure_file_priv, séparer répertoires d’écriture et répertoires exécutables, exécuter le serveur web avec un compte non privilégié.

---

## Étape 5: Permissions et Escalade de Privilège

Le webshell permet de lire les fichiers accessibles à `www-data`, y compris le code source PHP, révélant notamment les identifiants MySQL.

L’énumération post-exploitation (SUID, sudo, cron, fichiers modifiables) met en évidence un fichier critique :

-  `/supervisord.cron` en `-rwx-wx-wx`, propriétaire root, exécutable automatiquement avec les privilèges root.
- Modifiable depuis le contexte `www-data`, il permet d’injecter des commandes exécutées ensuite en root.
- Après modification et exécution automatique, la lecture du second drapeau est possible.

🚩 Flag Root

**Réflexe audit :**
- Vérifier l’absence de credentials en dur dans le code source ; utiliser une gestion externalisée des secrets.  
- Auditer les scripts exécutés automatiquement (cron, superviseurs, tâches planifiées) : propriétaire, permissions, contexte d’exécution, possibilités de modification depuis des comptes moins privilégiés.  
- CWE : CWE-798 (hard-coded credentials) et CWE-732 (Incorrect Permission Assignment for Critical Resource).

---

## Analyse GRC: Recommandations

**La chaîne complète vue par OWASP :**

```
A05:2021: Security Misconfiguration  → /webadmin/ accessible sans restriction réseau
A03:2021: Injection                  → SQLi sur username, entrée utilisateur concaténée à la requête
A05:2021: Security Misconfiguration  → erreurs SQL détaillées exposées au client
A05:2021: Security Misconfiguration  → privilèges excessifs du compte MySQL / FILE
A05:2021: Security Misconfiguration  → fichier exécuté avec privilèges root modifiable par des utilisateurs non privilégiés
````

---

La chaîne d'exploitation met en évidence plusieurs contrôles indépendants défaillants, qui repose plutôt sur l'accumulation de plusieurs faiblesses permettant la défense en profondeur de ne pas fonctionner.

| Risque | CWE | Impact | Recommandation |
|---|---|---|---|
| Improper Neutralization of Special Elements | CWE-89 | Accès au dashboard administrateur sans identifiants valides | Requêtes préparées et paramètres liés, plutôt que concaténation SQL |
| Use of Hard-coded Credentials | CWE-798 | Exposition de credentials réutilisables en cas d'accès au code source |  Utiliser une gestion sécurisée des secrets, hors du code applicatif, avec permissions minimales et rotation | 
| FILE privilege MySQL	| CWE-272	| Extension de l'impact de la SQLi par possibilité d'écriture dans le système de fichiers	| Révoquer FILE lorsqu'il n'est pas nécessaire et appliquer le principe du moindre privilège |
| Ressource critique world-writable	| CWE-732	| Injection de commandes exécutées automatiquement en tant que root | Exécution de code en root	chmod 700 + propriétaire root uniquement |

---

## Leçons Apprises

- Une surface d'attaque apparente réduite ne signifie pas une surface d'attaque réduite : une interface non référencée peut rester directement accessible. 
- Une injection SQL doit être évaluée au-delà du simple accès aux données : le niveau de privilège du compte SQL détermine fortement l'impact potentiel de la vulnérabilité.  
- Les erreurs applicatives peuvent devenir un canal d'information : une stack trace ou une erreur SQL détaillée peut révéler p.ex.  la structure de l'application ou des chemins internes.  
- Les permissions doivent être analysées dans leur contexte. Un fichier writable n'est pas nécessairement vulnérable, mais le devient combiné à : une exécution automatique, un contexte privilégié et une absence de contrôle d'intégrité.  

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.