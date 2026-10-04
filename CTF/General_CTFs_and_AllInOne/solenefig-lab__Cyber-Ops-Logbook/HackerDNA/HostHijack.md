# WriteUp : Host Hijack

**Plateforme :** HackerDNA  (https://hackerdna.com/fr/labs/host-hijack)

**Catégorie :** HTTP Headers: Web Vulnerabilities: PrivEsc  
**Difficulté :** Moyen 
**Tags :** `Host Header Injection` `Password Reset Poisoning` `Command Injection` `PrivEsc`  

---

## Scénario

Le laboratoire simule une compromission de l'application médicale MediTrack Health. La faille réside dans une mauvaise gestion de l'en-tête HTTP Host lors de la génération des liens de réinitialisation de mot de passe, couplée à une troncature stricte des URLs dans les logs. Après une prise de contrôle du compte administrateur, une injection de commandes permet un accès au système, suivi d'une escalade de privilèges via un binaire système autorisé dans la configuration sudo.

---

## Chaîne d'Attaque
`[Reconnaissance]` ➔ `[Host Header Injection]` ➔ `[Password Reset Poisoning]` ➔ 🚩 ➔ `[Command Injection]` ➔ `[Sudo Privilege Escalation]` ➔ 🚩

---

## Étape 1: Reconnaissance

La phase d'énumération initiale cible les services HTTP disponibles et la structure apparente du serveur web (Nginx/1.28.2).

```bash
curl -I http://$IP/login 
curl -i http://$IP/robots.txt
```

Le fichier robots.txt dévoile l'existence de répertoires normalement restreints : l'inspection de la page /xxx retourne un historique des demandes de réinitialisation de mot de passe au format JSON.

---

## Étape 2: Host Header Injection & Password Reset Poisoning

En analysant les logs de messagerie de l'étape précédente, on remarque que l'application génère des URLs basées sur la valeur dynamique de l'en-tête Host fourni par le client.

Une tentative classique de récupération de token est effectuée :

```bash
curl -X POST http://$IP/forgot-password \
     -H "Host: meditrack.hdna.me" \
     -d "email=admin@meditrack.hdna.me"
```

Cependant, lors de la lecture du journal, le jeton de sécurité (token) apparaît systématiquement tronqué à une longueur fixe de caractères (token=ici1MUFy_1rWhf4YwIjJDg-qg1khC...). La valeur stockée par le serveur subit une limite de caractères rigide sur la longueur totale de l'URL.

**L'astuce de contournement :** Pour récupérer l'intégralité du token requis, il faut libérer de l'espace dans la chaîne de caractères. En injectant un en-tête Host ultra-court, le serveur réduit la taille de l'hôte et préserve les caractères restants du jeton lors de la troncature. Résultat : L'URL générée ne contient plus de points de suspension et livre le token complet : `http://x.y/reset-password?token=`

```bash
curl -X POST http://$IP/forgot-password \
     -H "Host: x.y" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "email=admin@meditrack.hdna.me"

# Lecture du log mis à jour
curl -s http://$IP/xxx | jq -r '.[-1].link'
```

---

## Étape 3: Accès Initial & Compte Administrateur

Le jeton complet permet de réinitialiser le mot de passe de la cible directement dans le navigateur. Une fois le mot de passe modifié, la connexion au tableau de bord affiche le premier flag.

🚩 Flag User

---

## Étape 4: Injection de Commandes (Command Injection)

Depuis l'interface d'administration accessible à l'adresse /admin/diagnostics, un outil de diagnostic réseau (ping) prend en entrée une adresse IP ou un nom d'hôte. La variable n'étant pas correctement nettoyée avant son exécution dans un interpréteur de commandes, un caractère de liaison (|) permet d'injecter des instructions système arbitraires. Exemple : `127.0.0.1|id`

---

## Étape 5: Escalade de privilèges (Sudo find)

L'énumération des privilèges de l'utilisateur meditrack est réalisée en inspectant la configuration du fichier /etc/sudoers via l'injection de commande : `127.0.0.1|cat /etc/sudoers`

La directive de configuration finale révèle un vecteur d'élévation critique : `meditrack ALL=(root) NOPASSWD: /usr/bin/find`

Le binaire système /usr/bin/find dispose d'un paramètre natif (-exec) permettant d'exécuter des commandes système avec les privilèges appliqués par sudo (ici, l'utilisateur root), sans nécessiter de mot de passe (méthode de contournement référencée GTFOBins).
L'injection finale est construite pour lire directement la preuve d'accès root.

Le flag root devient alors accessible :

🚩 Flag Root

---

## Analyse GRC: Recommandations

Analyse GRC: Recommandations
| Risque | CWE | Impact | Recommandation |
|---|---|---|---|
| Host Header Injection | CWE-644 | Génération d'URLs arbitraires et détournement de fonctionnalités applicatives. | Configurer le serveur web pour rejeter les requêtes avec un en-tête Host non reconnu ou utiliser une liste blanche stricte. |
| Password Reset Poisoning | CWE-640 | Compromission et prise de contrôle de comptes utilisateurs. | Utiliser une valeur d'hôte statique et définie de manière sécurisée dans la configuration globale de l'application pour construire les liens. |
| Command Injection | CWE-78 | Exécution de code arbitraire sur le système d'exploitation sous-jacent. | Éviter de passer des entrées utilisateurs directement à des fonctions système ; utiliser des APIs de filtrage strictes ou des listes blanches d'arguments. |
| Excessive Privileges (Sudo) | CWE-269 | Escalade de privilèges locale vers l'utilisateur root. | Retirer les binaires dotés de fonctions d'exécution de commandes (comme find) des autorisations sudo sans mot de passe. |

---

## Leçons Apprises

- **Les en-têtes HTTP ne sont pas fiables :** L'en-tête Host est entièrement contrôlé par l'attaquant et ne doit jamais servir de base pour générer des données de sécurité ou des liens sensibles.
- **Attention aux limites de stockage :** Tronquer une donnée dans un journal pour des raisons d'affichage peut créer des effets de bord où la réduction de certaines variables permet d'exposer la partie masquée d'une autre.
- **La neutralisation des entrées est indispensable :** Tout paramètre utilisateur concaténé dans une commande système (comme les outils de diagnostic réseau) doit subir une validation rigoureuse ou être encapsulé.
- **Sécuriser les droits sudo :** Accorder le privilège d'exécuter certains utilitaires natifs (comme find, less, awk) en tant que root revient à accorder un accès shell complet sur la machine.

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.