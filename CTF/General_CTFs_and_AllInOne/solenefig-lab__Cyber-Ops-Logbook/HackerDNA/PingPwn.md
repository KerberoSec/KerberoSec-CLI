# WriteUp : Ping Pwn

**Plateforme :** HackerDNA  (https://hackerdna.com/fr/labs/ping-pwn)

**Catégorie :**  Network Security: Command Injection   
**Difficulté :** Défi   
**Tags :** `Command Injection` `Web Exploitation` `Service Discovery` `Network Security`  

---

## Scénario

Le laboratoire simule l'audit et l'évaluation de la sécurité d'une infrastructure réseau d'entreprise compromise. La faille principale réside dans un outil de surveillance réseau qui exécute des requêtes de connectivité (ping) sans assainir les entrées utilisateurs, ouvrant la porte à une exécution de commandes arbitraires sur le système d'exploitation sous-jacent.

---

## Chaîne d'Attaque
`[Reconnaissance & Énumération]` ➔ `[Découverte de Service]` ➔ `[Analyse du Point d'Entrée]` ➔ `[Command Injection]` ➔ 🚩

---

## Étape 1: Reconnaissance & Énumération

L'énumération initiale cible les services HTTP exposés et identifie la surface d'attaque.

```bash
nmap $IP
```

Résultat : deux ports TCP ouverts. Le port 80 (HTTP standard) et le port 8080 (HTTP-Proxy) qui héberge l'application cible.

---

## Étape 2: Découverte de Service

Une inspection rapide avec curl sur le port 8080 révèle une application intitulée Network Monitoring Tool. L'énumération des chemins avec ffuf découvre deux endpoints actifs :

```bash
ffuf -u http://$IP:8080/FUZZ -w common.txt
/health   [Status: 200]   → état du service
/ping     [Status: 200]   → outil de diagnostic réseau
```

---

## Étape 3: Analyse du Point d'Entrée

L'interface expose un formulaire HTML acceptant une adresse IP ou un nom d'hôte. La requête GET transite directement via le paramètre host :

```bash
http://$IP:8080/ping?host=<valeur>
```

La réponse observée correspond étroitement au format standard produit par l'utilitaire système ping, ce qui suggère que l'application relaie directement ou indirectement sa sortie.

 `PING <valeur> (<valeur>) 56(84) bytes of data. --- <valeur> ping statistics --- 1 packets transmitted, 0 received, 100% packet loss, time 0ms`

---

## Étape 4: Injection de Commandes (Command Injection)

L'hypothèse de concaténation est confirmée par l'injection d'un séparateur de commandes shell. Le point-virgule `;` permet de clore proprement la commande ping et d'enchaîner immédiatement l'utilitaire de listage des fichiers (ls). 

L'application s'exécute avec succès et retourne les statistiques du ping local et la liste des fichiers du répertoire de travail de l'application. 
_Note : Le caractère de saut de ligne encodé %0a constitue un vecteur alternatif valide._ 

Pour trouver le flag, la portée de la commande est élargie pour explorer l'arborescence globale du système. Le listage du répertoire racine (/) montre la structure standard d'un environnement Linux.

Un fichier nommé flag.txt est formellement identifié à la racine du système. Pour finaliser le défi, l'injection est modifiée pour appeler l'utilitaire cat avec le chemin absolu du fichier cible afin d'en afficher le contenu dans la réponse HTTP.

Le flag s'affiche alors dans la sortie brute :

🚩 Flag

---

## Analyse GRC: Recommandations

| Risque | CWE | Impact | Recommandation |
|---|---|---|---|
| Improper Input Validation | CWE-20 | Cause racine permettant l'injection | Valider le format attendu (IPv4/hostname) par liste blanche stricte avant tout traitement. |
| Command Injection | CWE-78 | Exécution de code arbitraire sur le système d'exploitation sous-jacent. | Éviter de passer des entrées utilisateurs directement à des fonctions système ; utiliser des APIs de filtrage strictes ou des listes blanches d'arguments. |
| Fichier sensible accessible | CWE-250 | Problème de privilèges excessifs accordés au processus | Appliquer le principe du moindre privilège ; le processus applicatif ne doit pas avoir accès aux fichiers sensibles. |

---

## Leçons Apprises

- **Énumérer avant d'exploiter :** La découverte de /ping via ffuf est l'étape qui rend l'exploitation possible; sans elle, la surface d'attaque reste invisible.
- **Éviter la concaténation de chaînes dans le shell :** L'utilisation de métacaractères du shell (;, |, &, %0a) permet de détourner facilement la logique d'exécution séquentielle d'une application si les arguments ne sont pas isolés de l'exécutable.
- **Vérifier la sortie d'un formulaire :** Retourner directement la sortie d'une commande système dans la réponse HTTP trahit une concaténation non filtrée. C'est à la fois l'indice de la vulnérabilité et le vecteur d'exfiltration.

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.