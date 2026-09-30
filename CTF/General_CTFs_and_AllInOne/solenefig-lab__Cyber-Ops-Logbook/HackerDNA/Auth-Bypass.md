# WriteUp : Auth Bypass

**Plateforme :** HackerDNA  (https://hackerdna.com/fr/labs/auth-bypass)

**Catégorie :**  SQL Injection: Authentication Bypass   
**Difficulté :** Défi   
**Tags :** `SQL Injection` `Authentication Bypass` `Web Security` `Database Security`

---

## Scénario

Le laboratoire simule l'analyse sécurité d'un réseau d'entreprise, la découverte d'un service d'authentification déployé avec un
portail de connexion, où l'authentification peut être contournée par des requêtes ciblées de base de données d'injection SQL. La faille réside dans des contrôles d'accès insuffisants sur le portail d'authentification et la mauvaise gestion des entrées.

---

## Chaîne d'Attaque
`[Reconnaissance Web]` ➔ `[Reconnaissance des patterns de query]` ➔ `[Injection SQL]` ➔ `[Contournement d'authentification]` ➔ 🚩

---

## Étape 1: Reconnaissance Web et Découverte du Point d'Entrée

La page du défi propose de mener une analyse de sécurité d'un réseau d'entreprise pour découvrir un service de connexion entreprise déployé et tester les mécanismes d'authentification.

L'analyse des ports révèle un service http-proxy sur le port 8080 :

```bash
nmap $IP
PORT     STATE SERVICE
80/tcp   open  http
8080/tcp open  http-proxy
```

La page `IP:8080` affiche un portail d'authentification entreprise `Enterprise Authentication System`. Un service d'authentification exposé sur un port non standard sans TLS constitue une surface d'attaque.

Réflexe audit : Le portail semble accessible via HTTP sur le port 8080. Une vérification de l'utilisation effective de TLS constitue un réflexe d'audit.

---

## Étape 2: Reconnaissance des patterns

Le reste du défi se passe sur la page `Enterprise Authentication System`. Deux entrées sont demandées : `username`et `password`. 
A validation la page redirige vers une page '/login' qui retourne un message (erreur, succès, identifiants inexistants ...).

**Exemple de message retour :**  
`Authentication failed. Invalid username or password.
Database Error: SQLITE_ERROR: unrecognized token: « #"
Database Error: SQLITE_ERROR: near "' AND password = '": syntax error
`

Le retour correspond à des requêtes de bases de données SQL. 

Réflexe audit : 
1. Vérifier que le système sépare bien les entrées utilisateurs du code.
2. Vérifier que la réponse HTTP ne retourne pas la sortie d'une commande SQL.

---

## Étape 3: Injection SQL

L'application présente un comportement caractéristique d'une entrée non paramétrée : les données saisies par l'utilisateur sont interprétées comme faisant partie de la requête SQL, plutôt que comme de simples valeurs transmises en paramètre. Il devient alors possible de modifier la logique de vérification des identifiants sans connaître de compte valide.

Cette faiblesse ne résulte pas d'un dysfonctionnement de la base de données, mais de la manière dont l'application construit ses requêtes. La base de données exécute fidèlement ce qu'elle reçoit, c'est la requête elle-même qui est mal formée.

La section suivante illustre ce mécanisme à l'aide d'une requête d'authentification simplifiée.

_Note : un défi avec des mécanismes similaires d'injection SQL peut être testé ici : [Test d'Injection SQL](https://hackerdna.com/fr/labs/sql-injection-test)_

---

## Étape 4: Contournement d'authentification

Dans un mécanisme d'authentification classique, l'application vérifie les identifiants au moyen d'une requête SQL du type :

`SELECT * FROM users WHERE username = '[INPUT]' AND password = '[INPUT]'`

Lorsque les entrées utilisateur sont directement concaténées à la requête au lieu d'être transmises comme paramètres, il devient possible d'en modifier la logique. Le contrôle d'authentification ne repose alors plus uniquement sur la validité des identifiants, ce qui peut conduire à un accès non autorisé. 
La faille réside à faire passer un code qui est lu comme `TRUE` (condition = vraie) par le système, en expérimentant avec les opérateurs, signes et contraintes.

`Formulaire d'authentification` ➔ `Concaténation SQL de chaînes de caractères`  ➔  `Bypass du login`  ➔  `Accès accordé sans vérification réelle`  ➔  `Compromission de comptes`

`**Authentication Successful!**
Welcome, admin!
`

Le flag s'affiche alors dans la sortie brute : [Compromission d'authentification]

🚩 Flag

---

## Analyse GRC: Recommandations

| Risque | CWE | Impact | Recommandation |
|---|---|---|---|
| Transmission d'informations sensibles en clair sur le réseau | CWE-319 | Expose identifiants, tokens et cookies de session à l'interception, session hijacking et attaques de type *Man-in-the-Middle* | Forcer HTTPS (TLS), redirection HTTP→HTTPS, activer HSTS, utiliser des cookies `Secure` et `HttpOnly` |
| Exposition d'Information via Message d'Erreur | CWE-209 | Divulgation d'informations sur le fonctionnement interne de l'application (moteur SQL, structure des requêtes, erreurs) | Retourner des messages d'erreur génériques, journaliser les détails côté serveur, désactiver les erreurs détaillées en production  |                                       |
| SQL Injection | CWE-89 | Accès non autorisé aux données, contournement d’authentification | Requêtes préparées, validation côté serveur, SAST/DAST |  

---

## Leçons Apprises

- **Chiffrer l'authentification :** L'absence de chiffrement expose les données et les activités à l'interception, les attaques du type Man-in-the-Middle et la manipulation des données d'authentification.
- **Éviter la concaténation de chaînes dans la requête :** L'utilisation d'opérateurs et métacaractères permet de détourner facilement la logique d'exécution des entrées utilisateurs si les arguments ne sont pas isolés de l'exécutable.
- **Vérifier la sortie d'un formulaire :** Retourner directement la sortie d'une commande SQL dans la réponse HTTP trahit une concaténation non filtrée. C'est à la fois l'indice de la vulnérabilité et le vecteur d'exfiltration.

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.