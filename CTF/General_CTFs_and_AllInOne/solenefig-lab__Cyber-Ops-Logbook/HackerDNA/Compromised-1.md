# WriteUp : Compromised 1

**Plateforme :** HackerDNA  (https://hackerdna.com/fr/labs/compromised-1)

**Catégorie :**  Default Credentials: WAR Deployment: Privilege Escalation  
**Difficulté :** Moyen   
**Tags :** `Web Application Security` `Apache Tomcat` `WAR Deployment` `Web Shells` `Default Credentials` `Privilege Escalation` `Linux` `Sudo`

---

## Scénario

Le laboratoire simule une application Web tournant sous Apache Tomcat. La faille réside dans des mauvaises configurations système.

---

## Chaîne d'Attaque
`[Reconnaissance & Énumération]` ➔ `[Analyse du Point d'Entrée]` ➔ `[Default Credentials]` ➔ `[Téléversement Shell WAR]` ➔ 🚩 ➔ `[Permission sudo]` ➔ `[Escalade de Privilège Linux]` ➔ 🚩

---

## Étape 1: Reconnaissance & Énumération

L'**énumération initiale** cible les services HTTP exposés et identifie la surface d'attaque.

```bash
nmap $IP
```

Résultat : deux ports TCP ouverts. Le port 80 (HTTP standard) et le port 8080 (http-proxy).

Une énumération via **fuzzing** confirme l'existence de deux applications Web "manager" et "host-manager.

```bash
ffuf -u http://$IP:8080/FUZZ -w common.txt
docs                    [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 101ms]
examples                [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 100ms]
favicon.ico             [Status: 200, Size: 21630, Words: 19, Lines: 22, Duration: 107ms]
host-manager            [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 195ms]
manager                 [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 96ms]
```

**Réflexe audit :** 
- L'exposition d'un port 8080 avec un Manager Tomcat accessible publiquement constitue un signal d'alerte immédiat. 
- Ce type de surface doit déclencher une vérification systématique : le service d'administration est-il accessible depuis l'extérieur ? Existe-t-il une restriction réseau (firewall, VPN, RemoteAddrValve) ? L'accès est-il limité aux seules adresses IP de confiance ?  

---

## Étape 2: Analyse du point d'entrée & Identifiants par Défaut

L'analyse du point d'entrée "manager" confirme :  
- l'existence de l'application `Tomcat 9.0.96`,  
- l'accès possible avec les bons identifiants (`401`). 
Il n'y a pas de restriction IP (RemoteAddrValve), seulement une authentification Basic.

```bash
nmap -sV \
--script http-title,http-auth,http-enum,http-headers \
-p8080 \
$IP

PORT     STATE SERVICE VERSION
8080/tcp open  http    Apache Tomcat 9.0.96
|_http-title: Apache Tomcat/9.0.96
| http-enum: 
|   /manager/html/upload: Apache Tomcat (401 )
|_  /manager/html: Apache Tomcat (401 )
| http-headers: 
|   Content-Type: text/html;charset=UTF-8
|   Transfer-Encoding: chunked
|   Date: Sun, 05 Jul 2026 21:55:44 GMT
|   Connection: close
|   
|_  (Request type: HEAD)
```

L'attaque par liste des identifiants les plus fréquents permet d'identifier le couple d'identifiants (nom et mot de passe) pour s'y connecter.

```
hydra \
-L users.txt \
-P passwords.txt \
http-get://$IP:8080/manager/html
```

**Réflexe audit :**  
- Vérifier que la procédure de mise en production inclut explicitement la rotation des identifiants par défaut sur tous les composants déployés. Ce contrôle relève du Secure SDLC : il doit être intégré à la checklist de déploiement, pas laissé à la discrétion de l'administrateur. 
- En l'absence de RemoteAddrValve ou d'équivalent réseau, l'interface Manager ne devrait pas être exposée sur une interface publique, quelle que soit la solidité des credentials. 

---

## Étape 3: Création du fichier de déploiement WAR malveillant

Les identifiants trouvés permettent la connexion à l'application `Manager`, où il est possible de téléverser des fichiers de déploiement WAR (Web Application Archive), une application Java déployable sur Tomcat et exécutable côté serveur.

**Anatomie du WAR**
```
shell.war
├── META-INF/
│   └── MANIFEST.MF      ← généré automatiquement par jar, metadata Java
├── cmd.jsp              ← le web shell où se situe l'exploit, accessible via /shell/cmd.jsp
└── WEB-INF/
    └── web.xml          ← descripteur de l'application, obligatoire pour Tomcat
```

- web.xml est le fichier de configuration minimum que Tomcat exige pour reconnaître une application web valide. Sans lui, Tomcat refuse de déployer. 
- cmd.jsp est placé à la racine du WAR, donc accessible directement via /shell/cmd.jsp (_WEB-INF est un dossier protégé par Tomcat donc inaccessible depuis le web_).  

Le déploiement du fichier WAR se fait par la page `manager`sans restriction, tout passe par HTTP : `envoi de la commande dans le fichier ?cmd=whoami` ➔ `exécution par Tomcat de /bin/sh -c whoami`  ➔ `lecture de la réponse dans HTTP`. Pas de connexion retour nécessaire.
 
Le mécanisme clé est le suivant : une fois authentifié sur le Manager, n'importe quel fichier WAR peut être déployé sans validation de contenu. Tomcat l'exécute immédiatement dans le contexte du processus serveur. Cela signifie que le niveau de privilège obtenu par l'attaquant est directement celui sous lequel tourne Tomcat, sans élévation nécessaire à ce stade.

Une fois le chemin du fichier flag-user.txt trouvé, il suffit de le lire pour obtenir le premier flag.

🚩 Flag User

---

## Étape 4: Permissions et escalade de privilège

La recherche des droits sudo montre une mauvaise configuration qui mène au root : `hacker ALL=(ALL) NOPASSWD: /usr/bin/find`. 
L'exécution de la commande `find` permet d'élever les privilèges via `-exec`.

Une fois la bonne commande encodée, un nouveau téléversement d'un fichier WAR permet d'élever les droits à `root`et lire le fichier **flag-root.txt**.

🚩 Flag Root

**Réflexe audit :** 
- Vérifier les restrictions sur les fichiers et les commandes systèmes pour éviter qu'un processus tournant sous un rôle donné puisse devenir root (OWASP A05:2021: Security Misconfiguration).  
- Appliquer des contrôles détectifs : journalisation des accès au manager, alertes sur les déploiements WAR, détection de web shells.   

---

## Analyse GRC: Recommandations

**La chaîne complète vue par OWASP :**

```
A07 - Credentials par défaut (admin:admin)  
        ↓
A05 - Manager accessible sans restriction IP  
        ↓
A05 - Déploiement WAR non restreint  
        ↓
Web shell → exécution de commandes  
        ↓
A05 - sudo mal configuré → root  
```

_Note : En entreprise ce scénario est extrêmement fréquent sur des serveurs Tomcat oubliés ou mal maintenus._  

Les quatre vulnérabilités identifiées partagent une cause racine commune : l'absence de processus de hardening documenté et appliqué avant mise en production. Aucune des failles présentes n'est une erreur de développement, elles résultent toutes d'une configuration laissée dans son état par défaut ou d'une permission accordée sans politique de contrôle. Le contrôle premier n'est donc pas technique mais organisationnel : disposer d'une baseline de configuration validée (référentiels CIS Benchmarks, DISA STIG Tomcat) et l'appliquer systématiquement.

| Risque | CWE | Impact | Recommandation |
|---|---|---|---|
| Use of Default Credentials | CWE-1392 | Compromission d’accès | Rotation des credentials à la mise en production, alerte sur authentification Basic depuis IP externe | 
| Improper Access Control | CWE-284 | Exécution de code arbitraire avec les privilèges du processus Tomcat | Restreindre les rôles autorisés au déploiement, limiter l'accès au Manager (VPN, filtrage IP, RemoteAddrValve), journaliser les déploiements WAR et surveiller les nouveaux contextes | 
| Authentification d'administration transmise en clair  | CWE-319 | Compromission des identifiants et prise de contrôle de l'interface d'administration | Forcer HTTPS/TLS, désactiver HTTP en production et détecter les accès non chiffrés |
| Permissions excessives sur `find`   | CWE-732 | Escalade de privilèges jusqu'à root  | Supprimer toute entrée NOPASSWD dans sudoers, auditer régulièrement le fichier /etc/sudoers et les fichiers /etc/sudoers.d/ |

---

## Leçons Apprises

- **Auditer la configuration sudo et éliminer les entrées NOPASSWD sur des commandes à risque :** Certaines commandes Unix courantes (find, vim, python, curl, etc.) permettent une élévation de privilèges lorsqu'elles sont exécutables via sudo sans mot de passe. Ce type de mauvaise configuration est référencé dans le projet GTFOBins. La règle de hardening est simple : aucune commande ne devrait figurer dans sudoers avec NOPASSWD sauf besoin opérationnel documenté et validé, et dans ce cas, la commande doit être la plus restrictive possible (argument fixe, chemin absolu, interdiction de sous-commandes).
- **Mettre en place un processus de hardening et une politique de configuration de référence avant mise en production** : le pattern `service d'administration exposé + credentials par défaut + déploiement non restreint `peut s'appliquer aussi à Tomcat qu'à Jenkins, Kubernetes Dashboard, phpMyAdmin, etc. 

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.