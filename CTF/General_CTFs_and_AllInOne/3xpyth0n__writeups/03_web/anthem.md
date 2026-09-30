# TryHackMe: Anthem

**Objectif :** récolter les 4 flags Web puis accéder à la machine via RDP pour obtenir les flags *user* et *root*.  
**IP cible :** `10.10.80.126`

---

## 1. Préparation & état d’esprit

Avant de commencer, j’ai posé trois règles :

1. **Tout noter** : captures d’écran, commandes, timestamps.  
2. **Ne pas brûler les étapes** : comprendre *pourquoi* avant de lancer un outil.  
3. **Explorer les culs‑de‑sac** : même si cela n’aboutit pas, c’est formateur.

---

## 2. Reconnaissance réseau initiale

Je lance **Nmap** en balayage complet. Je n’active PAS `-sC -sV` d’emblée : je préfère d’abord savoir *quels* ports sont ouverts, puis zoomer.

```bash
nmap -p- -Pn -T4 10.10.80.126 -oA nmap/full
```

Résultat : seuls **80/tcp** (HTTP) et **3389/tcp** (RDP) répondent.  
> Un faible nombre de ports réduit la surface ; cela oriente l’effort vers l’application Web.

---

## 3. Première cartographie Web

### 3.1 Navigation manuelle

J’ouvre `http://10.10.80.126/` : un blog très simple.  

### 3.2 Dirbusting rapide

Je lance tout de même **Gobuster** :

```bash
gobuster dir -u http://10.10.80.126/ -w /usr/share/wordlists/dirb/common.txt -t 40
```

Aucun répertoire exotique n’apparaît: pas grave, on reviendra si besoin.

---

## 4. Exploitation des fichiers destinés aux crawlers

Je pense spontanément à `robots.txt`.

```bash
curl http://10.10.80.126/robots.txt
```

Réponse :

```
UmbracoIsTheBest!

User-agent: *
Disallow: /umbraco
***
```

- **`/umbraco`** → chemin interne.  
- **`UmbracoIsTheBest!`** → probable mot de passe.

---

## 5. Identification du CMS et du domaine

Le mot‑clé « Umbraco » sonne comme un CMS . Je Googlais vite fait pour confirmer : **Umbraco CMS** (ASP.NET).  
En bas de page, un gros bandeau « anthem.com » : c’est le domaine.

Je l’ajoute localement :

```bash
echo "10.10.80.126 anthem.com" | sudo tee -a /etc/hosts
```

---

## 6. Recherche du nom & de l’e‑mail de l’admin

### 6.1 Nom de l’admin

Sur un article nommé « IT Blog », l’auteur d'un poème est listé comme **Solomon Grundy**.  
> Note : j’ai perdu 5 minutes à confirmer que c’est un personnage de comptine anglaise.

### 6.2 Format d’e‑mail

Un autre article signé *Jane Doe* mentionne `JD@anthem.com`.  
Je généralise : initiales + `@anthem.com` ⇒ **SG@anthem.com** pour Solomon Grundy.

---

## 7. Chasse aux 4 flags côté site

Méthode : `Ctrl+U` sur chaque page + recherche « THM{ ».  
| Flag | Page | Emplacement précis |
| ---- | ---- | ------------------ |
| #1 | `we-are-hiring` | commentaire HTML dans le footer |
| #2 | Accueil | meta description |
| #3 | `/author/jane-doe` | commentaire après la bio |
| #4 | `it-blog` | meta keywords |

---

## 8. Construction et test des identifiants RDP

| Élément | Valeur |
|---------|--------|
| **Utilisateur** | SG |
| **Mot de passe** | UmbracoIsTheBest! |

Connexion :

```bash
xfreerdp /u:SG /p:UmbracoIsTheBest! /v:anthem.com +clipboard /dynamic-resolution
```

Premier essai avec l’IP directo a échoué: le client RDP voulait un nom DNS, d’où `/etc/hosts`.

---

## 9. Session SG : récupération de `user.txt`

Une fois loggé, j’ouvre **File Explorer** → `Desktop` → `user.txt`.  
> Pas besoin de privilèges, c’est offert.

---

## 10. Investigation Windows : trouver le mot de passe admin

### 10.1 Pistage des « hidden »

J’active *View → Hidden items*. Un dossier `backups` apparaît à la racine `C:\`. Je n’ai pas accès (ACL stricte).

### 10.2 Changement d’ACL en GUI

- *Properties* → *Security* → *Advanced*  
- Ajouter `SG` avec *Full Control*  
- **Apply** (ne pas oublier, sinon rien n’est écrit).

### 10.3 Lecture du fichier

```
C:\backups\restore.txt
```

Contenu : `Le mot de passe admin !!`

---

## 11. Session *Administrator* : récupération de `root.txt`

Retour à **xfreerdp** :

```bash
xfreerdp /u:Administrator /p:[MdpAdmin] /v:anthem.com
```

Sur le bureau admin :

```
C:\Users\Administrator\Desktop\root.txt
```

Flags complets ✔️

---

## 12. Conclusion & apprentissages

- **Enumeration first !** Tous les indices sont publics.  
- **Pattern d’e‑mail** : repérer un exemple et extrapoler.  
- **Windows ACL** : même un compte limité peut parfois s’ajouter des droits si les paramètres par défaut sont laxistes.  
- **Rester curieux** : reconnaître `Solomon Grundy` a débloqué la question « nom de l’admin ».

---

**Auteur :** Saad Idrissi
