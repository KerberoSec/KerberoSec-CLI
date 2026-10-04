# TryHackMe: NahamStore

> **Objectif :** présenter pas à pas la méthodologie d’exploitation de la room NahamStore, en explicitant la logique suivie pour chaque question.

---

## 1. Pré‑requis et environnement

| Élément          | Valeur                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| Domaine cible    | `nahamstore.thm`                                                       |
| IP de la machine | *attribuée par THM*                                                    |
| OS attaquant     | Kali Linux 2024                                                      |
| Outils           | `nmap`, `wfuzz`, `gobuster`, `sqlmap`, `burp`, `curl`, `jq`, `hydra` … |

Ajouter au fichier **/etc/hosts** :

```bash
<IP> nahamstore.thm
```

---

## 2. Reconnaissance

### 2.1 Scan de ports

```bash
rustscan -a nahamstore.thm -- -sC -sV -oA rustscan/full
```

Résultats :

- **22/tcp** SSH
- **80/tcp** HTTP
- **8000/tcp** HTTP (interface interne « /admin »)

### 2.2 Découverte de vhosts

```bash
wfuzz -c -z file,/usr/share/dirb/wordlists/domain/subdomains-top1million-5000.txt \
      -u "http://nahamstore.thm/" -H "Host: FUZZ.nahamstore.thm" --hw 65
```

Sous‑domaines trouvés : `marketing`, `stock`.

### 2.3 Enumération de répertoires

```bash
gobuster dir -u http://nahamstore.thm/ -w /usr/share/dirb/wordlists/common.txt -x php,txt,html
```

Pour `marketing.nahamstore.thm` :

```bash
gobuster dir -u http://marketing.nahamstore.thm/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

---

## 3. Section *Recon*: réponses aux questions

| #   | Question               | Méthode / Explication         | Réponse       |
| --- | ---------------------- | ----------------------------- | ------------- |
| 3.1 | **SSN de Jimmy Jones** | Via API `…/api?customer_id=2` | `521‑61‑****` |

---

## 4. XSS (Cross‑Site Scripting)

### 4.1 URL vulnérable (réflection)

- Endpoint : `marketing.nahamstore.thm/?error=`
- Payload test : `<script>alert(1)</script>`

**Réponse :** `http://marketing.nahamstore.thm/?error=<script>alert(1)</script>`

### 4.2 HTTP header stocké (stored XSS)

- Le champ **User‑Agent** est réinjecté dans l’historique de commandes.

**Réponse :** `User‑Agent`

### 4.3 Tag HTML à échapper (page produit)

- Le nom du produit est inséré entre balises `<title>`.

**Réponse :** `title`

### 4.4 Variable JavaScript à échapper (recherche)

- Dans le JS inline, la variable `search` reçoit la valeur du GET `search`.

**Réponse :** `search`

### 4.5 Paramètre masqué (page d’accueil)

- Paramètre `q` utilisé par la barre de recherche ; mal filtré.

**Réponse :** `q`

### 4.6 Tag HTML à échapper (page retours)

- Champ `<textarea>` du formulaire de retour.

**Réponse :** `textarea`

### 4.7 Valeur du `<h1>` sur la page 404

- La page affiche « Page Not Found » en `<h1>` et reflète le chemin.

**Réponse :** `Page Not Found`

### 4.8 Autre paramètre masqué (cart)

- GET `discount` sur l’URL `/product?id=…&added=1&discount=`.

**Réponse :** `discount`

---

## 5. Open Redirect

| #   | Endroit testé                        | Paramètre vulnérable |
| --- | ------------------------------------ | -------------------- |
| 5.1 | `/r?next=`                           | `r`                  |
| 5.2 | `/account/addressbook?redirect_url=` | `redirect_url`       |

> *PoC* : `http://nahamstore.thm/account/addressbook?redirect_url=https://google.com`

---

## 6. CSRF (Cross‑Site Request Forgery)

| #   | Élément             | Détails                      |
| --- | ------------------- | ---------------------------- |
| 6.1 | URL sans protection | `/account/settings/password` |
| 6.2 | Champ supprimable   | `csrf_protect`               |
| 6.3 | Encodage naïf       | `Base64`                     |

---

## 7. IDOR (Insecure Direct Object Reference)

| #   | Donnée obtenue     | Technique                             | Valeur partielle      |
| --- | ------------------ | ------------------------------------- | --------------------- |
| 7.1 | Ligne d’adresse 1  | `address_id=3` -> info de Jimmy Jones | `160 Broadway`        |
| 7.2 | Date commande ID 3 | Changer `id=4` -> `id=3` dans receipt | `22/02/2021 11:42:13` |

---

## 8. LFI (Local File Inclusion)

- Paramètre `file=` dans la requête image.
- Bypass via `....//` nesting.

**Flag :** `{7ef6…}`

---

## 9. SSRF (Server‑Side Request Forgery)

- Endpoint stock API : `/check_stock?product_id=2&server=…`
- Chaine : `stock.nahamstore.thm@internal-api.nahamstore.thm/orders/…`

**Carte bancaire Jimmy Jones :** `5190 **** **** 2131`

---

## 10. XXE (XML External Entity)

### 10.1 XXE direct

- POST `/product/1?xml` avec payload inline.

**Flag :** `{9f18…}`

### 10.2 XXE aveugle

- Upload `.xlsx` modifié dans `/staff` ➜ exfiltration DNS/HTTP.

**Flag :** `{d6b2…}`

---

## 11. RCE (Remote Code Execution)

| #    | Contexte                     | Méthode                      | Flag      |
| ---- | ---------------------------- | ---------------------------- | --------- |
| 11.1 | Admin `/admin` sur port 8000 | Web‑shell PHP via campagne   | `{b42d…}` |
| 11.2 | Paramètre `id` dans PDF      | Injection shell par backtick | `{9312…}` |

---

## 12. Injection SQL

| #    | Technique                 | Flag      |
| ---- | ------------------------- | --------- |
| 12.1 | UNION SELECT (`sqli_one`) | `{d890…}` |
| 12.2 | Blind time‑based          | `{212e…}` |

---

## Conclusion

Cette room illustre un panel complet de vulnérabilités Web : **XSS, Open Redirect, CSRF, IDOR, LFI, SSRF, XXE, SQLi et RCE**. Chaque faille a été exploitée pour répondre aux questions du challenge et extraire les données sensibles (partiellement masquées ici). Prenez le temps de reproduire chaque étape pour bien comprendre les vecteurs et les contre‑mesures possibles.

---

***Auteur*** *: Saad Idrissi*
