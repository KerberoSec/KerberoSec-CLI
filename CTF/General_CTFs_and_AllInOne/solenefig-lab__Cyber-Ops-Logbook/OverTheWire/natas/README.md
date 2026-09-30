# OverTheWire: Natas (Web Security)

🔗 https://overthewire.org/wargames/natas/

---

## Objectif

Documenter l'analyse des vulnérabilités web côté serveur (PHP, HTTP, injection) et leur impact sur la confidentialité des données.

---

## Progression

**Niveaux validés :** 0 → 11  
**Statut actuel :** Accès au Level 12

---

## 1. Reconnaissance & exposition de données

**(Levels 0 → 3)**

- **Analyse de code source**  
  Récupération de credentials via commentaires HTML ou fichiers exposés (.inc)  
  *(Natas 0, 1, 6)*

- **Mauvaise configuration serveur**  
  Directory listing activé sur `/files/` permettant l’accès à `users.txt`  
  *(Natas 2)*

- **Fuite via robots.txt**  
  Répertoire sensible exposé (`/s3cr3t/`)  
  *(Natas 3)*

---

## 2. Manipulation de la logique de contrôle

**(Levels 4 → 5)**

- **Header spoofing**  
  Manipulation du header HTTP `Referer` via `curl -e` pour simuler une origine autorisée  
  *(Natas 4)*

- **Auth bypass via cookie**  
  Modification du cookie `loggedin=1` pour contourner l’authentification  
  *(Natas 5)*

---

## 3. Injections : fichiers & commandes

**(Levels 7 → 10)**

- **LFI (Local File Inclusion)**  
  Exploitation d’un paramètre non filtré (`?page=`) pour lire des fichiers sensibles  
  Exemple : `/etc/natas_webpass/natas8`  
  *(Natas 7)*

- **Command Injection (RCE)**  
  Injection dans une commande système PHP :

  ```php
  passthru("grep -i $key dictionary.txt");
  ```

- **Exploitation via caractères de chaînage (;, &&)**
(Natas 9)

- **Contournement de filtrage**
Bypass d’une blacklist ([;|&]) en utilisant des alternatives d’injection
(Natas 10)

---

## 4. Cryptographie faible & logique applicative

**(Levels 8, 11)**

- **Reverse engineering d’encodage**
Déconstruction d’un pipeline :

bin2hex → strrev → base64

(Natas 8)

- **Cryptanalyse XOR**
Exploitation d’une clé XOR statique via une attaque à texte clair connu
→ modification des données utilisateur dans un cookie (showpassword=yes)
(Natas 11)

---

## Synthèse: Mapping OWASP Top 10 (2021)

| Catégorie OWASP             | Vecteurs observés                         |
| --------------------------- | ----------------------------------------- |
| A01: Broken Access Control  | LFI, cookies, Referer, directory listing  |
| A02: Cryptographic Failures | XOR réversible, secrets exposés           |
| A03: Injection              | Command injection, paramètres non filtrés |

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.