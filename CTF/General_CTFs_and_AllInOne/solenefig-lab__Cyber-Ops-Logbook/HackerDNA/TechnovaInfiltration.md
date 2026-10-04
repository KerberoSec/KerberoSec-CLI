# WriteUp : TechNova Infiltration

**Plateforme :** HackerDNA  (https://hackerdna.com/fr/labs/technova-infiltration)

**Catégorie :** SSH Key Discovery: CVE Exploitation  
**Difficulté :** Moyen 
**Tags :** `Web Enumeration` `SSH` `Password Cracking` `PrivEsc` `Linux Security` `CVE Exploitation`

---

## Scénario

Le laboratoire simule une compromission suite à une série de négligences : une clé SSH privée exposée dans un répertoire de backup web et une version de Sudo vulnérable à une CVE de 2025. L'objectif est de démontrer comment une fuite de données initiale mène à une prise de contrôle totale du système (Root).

---

## Chaîne d'Attaque
`[Reconnaissance]` ➔ `[Directory Fuzzing]` ➔ `[SSH Key Discovery]` ➔ `[Brute-force Passphrase]` ➔ `[CVE Exploitation]` ➔ 🚩

---

## Étape 1: Reconnaissance & Énumération

Le scan initial révèle deux services standard : **SSH (22)** et **HTTP (80)**. L'investigation se porte d'abord sur la surface web pour identifier des points d'entrée.

### Fuzzing de répertoires
L'utilisation de `gobuster` avec une recherche d'extensions spécifiques (`.bak`, `.old`, `.txt`) permet de découvrir un répertoire de ressources critiques :

```bash
gobuster dir -u http://<IP>/assets -w wordlist.txt -x php,txt,bak
```

**Découverte :** Un répertoire de type backup ou configuration contient une clé privée SSH (id_rsa) et sa clé publique correspondante.

---

## Étape 2: Accès Initial (SSH)

La clé privée récupérée est protégée par une passphrase. L'extraction du hash et l'utilisation d'une attaque par dictionnaire (John the Ripper) ont permis de lever cette protection.

```bash
python3 ssh2john.py id_rsa > hash.txt
john --wordlist=rockyou.txt hash.txt
```

Le nom d’utilisateur nécessaire à la connexion SSH est récupéré via l’analyse des fichiers exposés.

**Résultat :** Passphrase et utilisateur identifiée, clef privée téléchargée permettant la connexion SSH et la lecture du fichier flag-user.txt.

🚩 Flag User

---

## Étape 3: Escalade de Privilèges (PrivEsc)

L'audit du système compromis depuis le shell de l'utilisateur montre une version de Sudo vulnérable (1.9.16p2). Une vérification des versions vulnérables publiquement documentées confirme que la release installée est affectée par la CVE-2025-32463.

```bash
sudo --version
Sudo version 1.9.16p2
```

**Exploitation de la CVE-2025-32463 correspondante: **
>La version installée de sudo était vulnérable à une élévation de privilèges locale permettant de contourner les restrictions sudoers via un chargement de bibliothèque dynamique mal contrôlé.
>Cette vulnérabilité permet un dépassement des restrictions sudoers pour obtenir un shell root. L'exploitation a nécessité la compilation d'un payload dynamique adapté à l'architecture cible (aarch64).

Merci à Mohamed Karrab pour le partage des payloads: https://github.com/MohamedKarrab/CVE-2025-32463/tree/main

```bash
# Vérification de l'architecture et exécution de l'exploit
./get_root.sh
# -> Detected architecture: aarch64
# -> Launching sudo with archs-dynamic payload...
whoami
# -> root
```

🚩 Flag Root

---

## Analyse GRC: Recommandations

| Risque | CWE | Impact | Recommandation |
|---|---|---|---|
| Exposure of Private Key | CWE-522 | Accès non autorisé au serveur via SSH. | Ne jamais stocker de clés privées sur un serveur web accessible publiquement. |
| Exposed Backup Files | CWE-552 | Fuite d’informations sensibles via des fichiers accessibles publiquement. | Restreindre l’accès aux répertoires de backup et supprimer les fichiers inutiles en production. |
| Vulnerable Sudo Version | CWE-1104 | Escalade de privilèges jusqu’à root. | Maintenir les composants système à jour via une politique de patch management. |

---

## Leçons Apprises

- **La fragilité du périmètre :** Un simple fichier de backup oublié par un développeur a rendu caduque toute la sécurité périmétrale.
- **L'importance du durcissement (Hardening) :** Au-delà de l'accès SSH, c'est la version obsolète d'un binaire système (Sudo) qui a permis la prise de contrôle totale. La sécurité est une défense en profondeur.
- **Gestion des secrets :** Une clé SSH ne devrait jamais transiter via un serveur HTTP. L'utilisation de protocoles de transfert sécurisés et la rotation des clés sont essentielles.

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.
