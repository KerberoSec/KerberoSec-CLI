# WriteUp : Traversed

**Plateforme :** HackerDNA  (https://hackerdna.com/fr/labs/traversed)

**Catégorie :** Git Exposure: Python PrivEsc    
**Difficulté :** Moyen   
**Tags :** `Git Exposure` `Source Code Disclosure` `Credential Leakage` `SSH` `Python Library Hijacking` `PrivEsc`     

---

## Scénario

Le laboratoire simule une compromission provoquée par l’exposition accidentelle d’un dépôt Git sur un serveur web. L’objectif est de démontrer comment une fuite de code source et d’historique Git peut mener à la récupération d’identifiants SSH, puis à une escalade de privilèges via un détournement de bibliothèque Python.

---

## Chaîne d'Attaque
`[Reconnaissance]` ➔ `[Git Exposure]` ➔ `[Git History Analysis]` ➔ `[Credential Disclosure]` ➔ `[SSH Access]` ➔ `[Python Library Hijacking]` ➔ 🚩

---

## Étape 1: Reconnaissance

Le scan réseau initial révèle deux services exposés : SSH (22)et HTTP nginx (80). L’application web ne présente aucun contenu sensible visible, mais la présence potentielle d’artefacts de développement mérite une reconnaissance plus poussée.

```bash
nmap -sV <IP>
```

---

## Étape 2: Exposition du dépôt Git

L’accès direct au répertoire .git est testé manuellement :

```bash
curl http://<IP>/.git/HEAD
# Résultat : ref: refs/heads/master
```

Cette réponse confirme que le dépôt Git est accessible publiquement depuis le serveur web. Une vérification complémentaire permet également d’accéder au fichier de configuration Git.

**Réflexe audit :** Un dépôt .git exposé permet souvent de reconstruire l’intégralité du code source et l’historique des commits, y compris des secrets supprimés ultérieurement.

---

## Étape 3: Reconstruction du dépôt & récupération des identifiants

L’outil git-dumper est utilisé afin de reconstruire le dépôt localement. **Note technique :** L'outil télécharge récursivement les objets identifiés dans .git/index et .git/refs/, contournant ainsi l'absence d'indexation du serveur web.

Une analyse de l’historique Git révèle plusieurs commits sensibles :

```bash
git-dumper http://<IP>/.git/ output_dir
git log -p
```

**Découverte critique :** Un ancien commit contient un fichier .txt avec des identifiants SSH. Même si le fichier a ensuite été supprimé puis “redacted”, les données restent accessibles dans l’historique Git.

**Réflexe audit :** Supprimer un secret d’un dépôt Git ne l’efface pas de l’historique. Une rotation des secrets compromis est indispensable.

---

## Étape 4: Accès initial (SSH)

Les identifiants récupérés permettent une connexion SSH au serveur. Une fois connecté, le flag utilisateur est localisé.

```bash
ssh username@<IP>
find /home -name "filename.txt" 2>/dev/null
```

🚩 Flag User

---

## Étape 5: Escalade de privilèges (Python Library Hijacking)

Identification du vecteur: l'énumération des droits avec sudo -l révèle un privilège spécifique, plus précisément un script Python appartenant à root. Le script *.py appartient à root mais se situe dans le répertoire personnel de l'utilisateur. Il contient la ligne import webbrowser.

En Python, lors d’un import, l’interpréteur recherche d’abord les modules dans le répertoire courant avant d’utiliser les bibliothèques système.

Cette mécanique permet une attaque de type Python Library Hijacking :

création d’un faux module webbrowser.py,
exécution de code arbitraire lors de l’import par un processus privilégié.
Création du module malveillant
echo 'import os; os.system("cat /root/flag-root.txt > /home/hackerdna/root.txt && chmod 777 /home/hackerdna/root.txt")' > webbrowser.py

Le script est ensuite exécuté avec les privilèges root :

sudo -u root /usr/bin/python3 /home/hackerdna/test.py

Une erreur Python apparaît :

AttributeError: module 'webbrowser' has no attribute 'open'

Cette erreur confirme néanmoins que le faux module webbrowser.py a bien été chargé avant l’échec du script, permettant l’exécution du payload.

Le flag root devient alors accessible :

🚩 Flag Root

---

## Analyse GRC: Recommandations

Analyse GRC: Recommandations
| Risque | CWE | Impact | Recommandation |
|---|---|---|---|
| Git Repository Exposure | CWE-552 | Exposition du code source et des secrets applicatifs. | Bloquer l’accès HTTP au répertoire `.git` au niveau du serveur web (Nginx/Apache). |
| Hardcoded Credentials | CWE-798 | Divulgation d’identifiants SSH valides. | Interdire les secrets en clair et utiliser des variables d’environnement ou un coffre-fort (Vault). |
| Sensitive Data in History | CWE-532 | Persistance des secrets dans l’historique Git. | Réécrire l’historique (`BFG` / `git-filter-repo`) et effectuer une rotation immédiate des clés. |
| Python Library Hijacking | CWE-427 | Exécution de code arbitraire (PrivEsc). | Sécuriser le `PYTHONPATH` et éviter l’exécution via sudo de scripts situés dans des dossiers utilisateurs. |
| Excessive Privileges (Sudo) | CWE-250 | Escalade de privilèges vers root. | Appliquer le principe du moindre privilège et auditer régulièrement `/etc/sudoers`. |

---

## Leçons Apprises

- **Les dépôts Git exposés sont critiques :** ils permettent souvent de reconstruire le code source complet et d’accéder à des secrets supprimés.
- **Supprimer un secret ne suffit pas :** l’historique Git conserve les anciennes versions des fichiers tant qu’il n’est pas réécrit.
- **Le chargement de bibliothèques est une surface d’attaque :** Python privilégie les modules locaux avant les bibliothèques système.
- **Les environnements de développement exposés sont dangereux :** une simple erreur de configuration peut mener à une compromission complète du serveur.

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.