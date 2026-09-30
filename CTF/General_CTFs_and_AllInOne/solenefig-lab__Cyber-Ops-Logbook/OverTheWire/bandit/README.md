# OverTheWire: Bandit (Patterns & Concepts)

> **Objectif :** Extraire les patterns techniques clés et leur lecture sécurité (GRC), sans divulguer de solutions.

---

## 1. Manipulation de fichiers & navigation
**Niveaux concernés :** 0 → 5  
* Lecture de fichiers  
* Gestion de noms complexes (espaces, caractères spéciaux)  
* Fichiers cachés  

**Pointers**
```bash
ls -a
cat <file>
cat "./file name"
```

**Lecture sécurité**

 *   Risque : Exposition de données sensibles.

 *  Enjeu : Contrôle d’accès et hygiène des fichiers système.

---

## 2. Recherche & identification de données

**Niveaux concernés :** 5 → 9

  * Recherche par type / taille

  *  Recherche de contenu (Pattern matching)

  * Identification de données uniques

**Pointers**
```bash

find . -type f -size +100k
grep -r "password" .
sort file | uniq -u
```

**Lecture sécurité**

  *  Risque : Fuite de secrets en clair (Hardcoded secrets).

  *  Enjeu : Classification et détection des données sensibles (Data Loss Prevention).

---

## 3. Encodage & transformation de données

**Niveaux concernés :** 9 → 12

  *  Base64 / ROT13

  * Extraction de texte binaire

**Pointers**
```bash

base64 -d file
strings file
tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

**Lecture sécurité**

  *  Risque : Dissimulation simple de données (Obfuscation).

  *  Enjeu : Capacité à détecter et analyser des données offusquées lors d'un audit.

---

## 4. Formats & compression imbriquée

**Niveaux concernés :** 12 → 13

   * Identification de formats (Magic bytes)

   * Extraction multi-couches

**Pointers**
```bash

file file
tar -xf archive.tar
gzip -d file.gz
```

**Lecture sécurité**

 *   Risque : Dissimulation de contenu malveillant ou exfiltration.

 *   Enjeu : Inspection complète des artefacts et analyse forensique de base.

---

## 5. Authentification & chiffrement

**Niveaux concernés :** 13 → 15

   * SSH avec clé privée

   * Connexions sécurisées (TLS/SSL)

**Pointers**
```bash

ssh -i key user@host
openssl s_client -connect host:port
```

**Lecture sécurité**

 *   Risque : Mauvaise gestion des clés (Key Management) et interception.

 *   Enjeu : Sécurisation des accès à privilèges et des échanges inter-systèmes.

---

## 6. Réseau & exposition

**Niveaux concernés :** 14 → 17

 *   Communication via ports

  *  Scan réseau local

**Pointers**
```bash

nc host port
nmap -p- localhost
```

**Lecture sécurité**

  *  Risque : Surface d’attaque élargie par des services non documentés.

  *  Enjeu : Segmentation réseau et filtrage (Firewalling).

---

## 7. Privilèges & exécution

**Niveaux concernés :** 19 → 20

  *  Binaires SUID

  *  Exécution avec droits élevés

**Pointers**
```bash

find / -perm -4000 -type f 2>/dev/null
```

**Lecture sécurité**

 *   Risque : Escalade de privilèges locale.

 *   Enjeu : Respect strict du principe du moindre privilège (PoLP).

---
## 8. Automatisation & tâches planifiées

**Niveaux concernés :** 21 → 24

  *  Scripts Bash & Cron jobs

  *  Exécution automatique

**Pointers**
```bash

cat /etc/cron.d/*
chmod +x script.sh
```

**Lecture sécurité**

 *   Risque : Exécution de code non contrôlée et persistance.

 *   Enjeu : Sécurisation et audit des tâches automatisées.

---

## 9. Automatisation & brute force

**Niveaux concernés :** 24 → 25

  *  Génération de combinaisons

  *  Scripts de test (Fuzzing basique)

**Pointers**
```bash

for i in {0000..9999}; do echo $i; done
```

**Lecture sécurité**

  *  Risque : Attaques par force brute sur des points d'entrée faibles.

  *  Enjeu : Politiques de protection (Rate limiting, lockout, MFA).

---
## 10. Shell-Escape & Environnements contraints

**Niveaux concernés :** 25 → 26

  *  Sortie d'un shell restreint (rshell)

  *  Manipulation de l'éditeur vi pour invoquer un terminal

  *  Compréhension des profils de connexion utilisateur

  **Pointers**
```bash
# Dans vi :
:set shell=/bin/bash
:shell
```
**Lecture sécurité**

* Risque : Évasion de bac à sable (Sandbox escape).
  
* Enjeu : Sécurisation des environnements d'administration et limitation des commandes autorisées.

---
##  11. Analyse de binaires & API locales

**Niveaux concernés :** 26 → 31

  *  Décompilation basique et analyse de chaînes de caractères

  *  Interaction avec des services locaux via des ports spécifiques

  *  Utilisation de Git (Historique, branches, tags) pour retrouver des secrets

 **Pointers**
```bash
git log
git checkout <branch>
git show <hash>
```

**Lecture sécurité**

  *  Risque : Persistence de secrets dans l'historique des versions (Shadow data).

  *  Enjeu : Sécurisation du pipeline CI/CD et nettoyage des dépôts de code source.

---
## 12. Fuite de données via métadonnées Git

**Niveaux concernés :** 31 → 32

  *  Analyse de fichiers .gitignore

  *  Push de fichiers pour déclencher des mécanismes distants

  *  Recherche de "leaks" dans les configurations de déploiement

 **Pointers**
```bash
git add -f <file>
git commit -m "push"
```

**Lecture sécurité**

  *  Risque : Fuite d'informations via les outils de développement.

  * Enjeu : Gouvernance du cycle de vie logiciel (SDLC) et protection du code source.

---
## 3. Le Shell "Upper Case" (Bypass logique)

**Niveaux concernés :** 32 → 33

 *   Contournement d'un shell qui transforme tout en majuscules

 *   Utilisation des variables spéciales du Shell ($0)

  *  Compréhension de l'exécution des processus

 **Pointers**
```bash
$0
```

**Lecture sécurité**

  *  Risque : Contournement des filtres de sécurité par logique applicative.

  *  Enjeu : Robustesse des interfaces de saisie et validation des entrées (Input Validation).

----

## Synthèse

Patterns clés acquis :

  *  Lire avant d’exécuter (Analyse statique).

  *  Identifier avant d’exploiter (Reconnaissance).

  *  Automatiser dès que possible (Efficience).

  *  Vérifier systématiquement les permissions et l'exposition.

   * Penser en flux (Input → Traitement → Output).

###  Positionnement

Ces exercices sont abordés comme un terrain d’entraînement pour :

  *  Comprendre les mécanismes techniques profonds.

  * Identifier les risques réels en environnement de production.

  *  Renforcer une approche GRC pragmatique et crédible.

_**N.b.:**_

   * Pas de solutions ni de mots de passe divulgués.

   * Approche méthodologique uniquement.

   * Environnement d’apprentissage contrôlé.

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.