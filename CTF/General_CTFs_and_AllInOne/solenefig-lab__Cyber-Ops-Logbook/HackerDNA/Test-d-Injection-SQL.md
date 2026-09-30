# WriteUp : Test d'Injection SQL

**Plateforme :** HackerDNA  (https://hackerdna.com/fr/labs/sql-injection-test)

**Catégorie :**  SQL Injection: Authentication Bypass   
**Difficulté :** Défi   
**Tags :** `SQL Injection` `Web Security` `Database Security` `Authentication Bypass` `Input Validation` `Penetration Testing`

---

## Scénario

Le laboratoire simule un portail de connexion, où l'authentification peut être contournée par des requêtes ciblées de base de données d'injection SQL. La faille réside dans la mauvaise gestion des entrées.

---

## Chaîne d'Attaque
`[Reconnaissance des patterns de query]` ➔ `[Injection SQL]` ➔ `[Contournement d'authentification]` ➔ 🚩

---

## Étape 1: Reconnaissance des patterns

L'entièreté du défi se passe sur la page `ADMIN LOGIN PORTAL`. Deux entrées sont demandées : `username`et `password`. 
A validation la page retourne un message (erreur, succès, identifiants inexistants ...) et une vue `Executed Query:`correspondant aux entrées des identifiants.

**Exemple d'entrée et de retour :**  
`username : username`  
`password : no login`

```
Executed Query:
SELECT * FROM users WHERE username = 'username' AND password = 'nologin'
```

Le retour correspond bien à des requêtes de bases de données SQL. Il nous donne le nom de la table et les colonnes requêtées.

Décomposition :  
- SELECT :  sélectionner des entrées d'une base de données,  
- * : toutes les colonnes,  
- FROM : depuis la base de données,  
- users : nom de la base de donnée (ici users),  
- WHERE : clause pour extraire les entrées qui correspondent à un condition spécifique,
-  `username =`et   `password =`: conditions à respecter ici,
- `' '`: guillements simples autour d'un string (chaîne de caractères),
- AND : opérateur logique qui demande que toutes les conditions soient vraies.  

Réflexe audit : vérifier que le système sépare bien les entrées utilisateurs du code.

---

## Étape 2: Injection SQL

L'objectif du défi est d'expérimenter avec des opérateurs, des signes et des contraintes (règles pour les bases de données) pour essayer de contourner la requête d'authentification.

**Principaux opérateurs** en langage SQL

| Opérateur SQL | Exemples |
| ------ | -------- |
| Opérateurs arithmètiques | +, -, *, /, % |
| Opérateurs de comparaison | =, >, <, >=, <=, <> |
| Opérateurs logiques | ALL, AND, ANY, BETWEEN, EXISTS, IN, LIKE, NOT, OR, SOME |
| Commentaires SQL | --, /* */ | 

---

## Étape 3: Contournement d'authentification

Plusieurs solutions d'injection SQL existent pour contourner l'authentification. La faille réside à faire passer un code qui est lu comme `TRUE` (condition = vraie) par le système.

`Formulaire d'authentification` ➔ `Concaténation de chaînes de caractères`  ➔  `Accès validé par requête à la base de données`

```
Login successful! Welcome, admin
```

Le flag s'affiche alors dans la sortie brute : `Access Granted`

🚩 Flag

---

## Analyse GRC: Recommandations

| Risque | CWE | Impact | Recommandation |
|---|---|---|---|
| SQL Injection | CWE-89 | Accès non autorisé aux données, contournement d’authentification | Requêtes préparées, validation côté serveur, SAST/DAST |  

---

## Leçons Apprises

- **Éviter la concaténation de chaînes dans la requête :** L'utilisation d'opérateurs et métacaractères permet de détourner facilement la logique d'exécution des entrées utilisateurs si les arguments ne sont pas isolés de l'exécutable.
- **Vérifier la sortie d'un formulaire :** Retourner directement la sortie d'une commande SQL dans la réponse HTTP trahit une concaténation non filtrée. C'est à la fois l'indice de la vulnérabilité et le vecteur d'exfiltration.

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.