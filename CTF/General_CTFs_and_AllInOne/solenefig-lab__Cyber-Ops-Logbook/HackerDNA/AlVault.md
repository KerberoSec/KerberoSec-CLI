# Write-Up : AlVault

**Plateforme :** HackerDNA  (https://hackerdna.com/fr/labs/alvault)

**Catégorie :** Web, Informartion Leakage, Command Injection
**Difficulté :** Moyen  
**Tags :** `Web`

---

## Scénario

Une application web d'une entreprise de cybersécurité expose un portail de développement interne contenant des scripts de maintenance et de recherche dégradés. L'objectif : exploiter les fuites d'informations et abuser d'un script de sauvegarde pour compromettre totalement le serveur (RCE→Root).

---

## Chaîne d'Attaque
[Reconnaissance Web] → [Fuzzing] → [Information Leakage]  → [SSH Access] → 🚩 → [Sudo Path-Validation Bypass] → [Command Injection] → 🚩

---

## Étape 1: Reconnaissance

### Lecture code source
Premier réflexe à l'arrivée sur une application web inconnue : inspecter le code source de la page d'accueil.  
Cette habitude, souvent négligée, révèle ici un commentaire laissé par un développeur :

`<!-- Internal dev portal moved to /dev - cleanup old files before pushing to prod -->`

**Réflexe audit :** Les commentaires HTML sont visibles de n'importe quel navigateur. Sur un vrai périmètre, cela figurerait dans le rapport comme "exposition d'informations architecturales en clair".

### Enumération Web
L'accés à la page `robots.txt` pour empêcher l'indexation de pages nous confirment les autres environnements.

```
User-agent: *
Disallow: /dev/
Disallow: /backup/
Disallow: /admin/
```

** Réflexe audit :** `robots.txt` est public par définition. Il est conçu pour les moteurs de recherche, pas pour la sécurité. Le lister comme "protection" est une erreur classique : il cartographie exactement les zones sensibles à ne pas indexer… et donc à explorer en priorité.

### Environnement Dev

L'accés à l'environnement /dev/ est non protégé et expose deux autres outils : 

`/dev/search.php` La version actuelle, sécurisée mais affichant un simple message "TRY HARDER!" ainsi qu'un commentaire supplémentaire d'un développeur avec deux informations clés : l'ancien fichier est toujours présent sur le serveur, et il utilise grep: ce qui suggère une exécution de commande système sur l'entrée utilisateur.

`dev/upload.php`

### Scan de ports

Deux services exposés : SSH (verrouillé pour l'instant) et HTTP. On note l'existence du port SSH pour y revenir dès l'obtention de credentials.

---

## Étape 2: Fuzzing

### Fuzzing de répertoires
En effectuant un fuzzing ciblé sur le répertoire /dev/ à l'aide de listes de mots adaptées un fichier de notes est identifié :

```bash
ffuf -u http://$IP/dev/FUZZ -w common.txt -e .php,.bak,.old,.txt
```

 `notes.txt` révèle que les vérifications système loguent dans /tmp/system_check.log.

 ### Fuzzing avec liste adaptée

La liste générique ne suffit pas. À partir des indices collectés: le nom search.php, la mention d'une "ancienne implémentation", le contexte développement: on construit une liste de variantes plausibles autour du mot "search".

```bash
cat << 'EOF' > /tmp/dev_variants.txt
search
search_old
search_v1
search_v2
search_backup
search_audit
search_grep
grep
grep_search
old_search
find
finder
file_search
EOF

gobuster dir -u http://$IP/dev/ -w /tmp/dev_variants.txt -x php,bak,old,txt,php~,inc
```

---

## Étape 3: Fuite d'Informations et Accès SSH

### Utilisation de la recherche de pattern

La page expose un formulaire de recherche par motif (pattern). Contrairement à search.php, elle transmet réellement l'entrée à grep en backend.  
L'outil permet de rechercher des motifs dans les fichiers du serveur directement depuis la page web. En testant des termes clés liés à l'administration système (ssh, pass, key, user, admin...), on remonte des informations d'identification exposées dans les fichiers de configuration ou de log accessibles.

** Réflexe audit :** Des identifiants SSH et des clés AWS ont été récupérés en clair depuis des fichiers de log et de configuration accessibles via un formulaire web non sécurisé. En contexte réel, cette découverte déclencherait une alerte critique immédiate : notification de l'équipe sécurité, rotation des secrets compromis, et analyse forensique des accès antérieurs. C'est exactement ce que documente CWE-312 : des secrets qui n'auraient jamais dû être stockés dans des fichiers accessibles.

### Accès SSH
Grâce aux informations récupérées, il est enfin possible d'accéder au port SSH.

```bash
ssh developer@$IP
developer@$IP's password: 
Welcome to AlVault!
```

Une fois connecté, le premier flag utilisateur est récupéré à la racine de l'espace personnel.

```bash
cat ~/flag-user.txt
```

🚩 **Flag User :** `FLAG{...}`

---

## Étape 4: Sudo Path-Validation Bypass

### Analyse du vecteur sudo

```bash
sudo -l
# (ALL) NOPASSWD: /usr/bin/python3 /opt/backup.py
```

La lecture de backup.py révèle trois opérations successives sur l'entrée :
> Résolution du chemin absolu via os.path.abspath()  
> Vérification contre une liste noire de répertoires système (RESTRICTED_DIRS)  
> Validation de l'existence du dossier via os.path.isdir()  

Si les trois conditions sont satisfaites, le script exécute :

```
os.system(f"tar -czf {backup_path} {directory}")
```

Le point de rupture est ici : `os.path.isdir()` valide le chemin résolu, mais `os.system()` reçoit la chaîne originale, non assainie, et la passe à un shell. Tout métacaractère présent dans cette chaîne sera interprété.

---
## Etape 5. Contournement de la validation de chemin

### Exploitation par injection d'espace (Space Injection)

À partir de l'analyse précédente, la stratégie est claire : créer un dossier dont le nom satisfait `os.path.isdir()` tout en contenant une injection shell. Le point-virgule termine la commande tar ; ce qui suit est exécuté indépendamment, en contexte root.

Exécution interactive du script en fournissant la chaîne exacte comme cible de sauvegarde :

```bash
sudo /usr/bin/python3 /opt/backup.py
# Enter directory to backup: /tmp/pwn ; cp /root/flag-root.txt /tmp/flag-root.txt ; chmod 644 /tmp/flag-root.txt
```

Lecture du flag root :

```bash
cat /tmp/flag-root.txt
```

_Note : L'erreur tar sur /tmp/pwn est normale et attendue; les commandes injectées s'exécutent indépendamment._

🚩 **Flag Root :** `FLAG{...}`

---

## Analyse GRC: Recommandations

| Risque | CWE | Impact | Recommandation |
|---|---|---|---|
| Information Leakage (`notes.txt`) | CWE-200 | Exposition de chemins internes et d’informations sensibles. | Nettoyer systématiquement les environnements de production en supprimant les fichiers temporaires, de notes et de backup. |
| Fichiers sensibles non supprimés | CWE-538 | Accès à d'anciennes fonctionnalités vulnérables. | Appliquer une politique de nettoyage des artifacts de développement avant mise en production. |
| Stockage de secrets en clair | CWE-312 | Compromission de services tiers (AWS) et de la base de données de production. | Utiliser un gestionnaire de secrets sécurisé (Vault) et interdire les identifiants codés en dur dans les scripts.|
| Improper Input Validation | CWE-20 | Contournement du filtre par injection de métacaractères du shell (espaces et points-virgules). | Bannir l'usage de `os.system()`. Privilégier le module subprocess en transmettant les arguments sous forme de liste (shell=False). |
| OS Command Injection | CWE-78 |  Exécution de commandes arbitraires en contexte root via métacaractères shell non filtrés dans `os.system()`. | Remplacer `os.system()` par `subprocess.run()` avec `shell=False` et transmission des arguments en liste ; ne jamais interpoler une entrée utilisateur dans une chaîne de commande. |
| Privilege Escalation | CWE-269 | Escalade de privilèges jusqu’à root. | Appliquer le principe du moindre privilège pour sudo.  Éviter d'accorder des droits sudo globaux sur des scripts manipulant des appels système dynamiques. |

---

## Leçons Apprises

- **Les commentaires de développeurs sont des cadeaux :** Les commentaires de code (TODO, notes de dev) indiquent souvent la présence d'anciennes fonctionnalités non supprimées et vulnérables.
- **Le fuzzing avec une liste générique ne suffit pas toujours :** La construction d'une wordlist contextuelle, basée sur les indices métier collectés, a permis d'identifier l'ancienne page. La qualité du fuzzing dépend de la qualité de la reconnaissance préalable.
- **Valider l'existence d'un dossier n'est pas valider son contenu :** `os.path.isdir()` confirme qu'un chemin existe, pas que la chaîne qui le contient est sûre pour un shell. L'illusion de validation est plus dangereuse que l'absence de validation, car elle donne une fausse confiance.
- **Lire le code avant d'exploiter :** La lecture de `backup.py` a permis de comprendre précisément le mécanisme de validation et d'identifier le point de rupture (`os.system()`) avant de construire le payload. Une approche boîte blanche, même partielle, accélère et fiabilise l'exploitation.

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.
