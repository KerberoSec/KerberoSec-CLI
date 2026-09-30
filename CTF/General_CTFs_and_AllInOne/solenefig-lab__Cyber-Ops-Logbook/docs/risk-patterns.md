# Panorama des patterns de risques techniques

## Lecture globale

Ce document synthétise des patterns de risques observés à travers des environnements de type wargames et labs de sécurité.

L’objectif est de relier des vulnérabilités techniques à des implications en matière de contrôle, de gouvernance et de gestion des risques.

Ce document constitue le référentiel central du dépôt.

Les observations techniques issues du **[Technical Security Assessment Playbook](technical-security-assessment-playbook.md)** et des études de cas **[HackerDNA](../HackerDNA/README.md)** et **[OverTheWire](../OverTheWire/README.md)** y sont consolidées sous forme de familles de risques, de recommandations de sécurité et de références aux principaux standards (CWE, OWASP Top 10).

---

## Index des risques

| Risque | CWE | Impact | Recommandation | Source |
|--------|-----|--------|----------------|--------|
| Command Injection | CWE-78 | Exécution de code arbitraire sur le système | Éviter les appels système directs, utiliser `subprocess.run()` avec `shell=False` et validation stricte | AIVault, HostHijack , PingPwn |
| SQL Injection | CWE-89 | Accès non autorisé aux données, contournement d’authentification | Requêtes préparées, validation côté serveur, SAST/DAST | Alpwned, Auth Bypass, Query Quake, Test d'Injection SQL |
| Information Disclosure | CWE-200 | Exposition de données sensibles et chemins internes | Nettoyage des environnements, suppression des fichiers de debug | AIVault, FiPloit |
| Exposition d'Information via Message d'Erreur | CWE-209 | Divulgation d'informations sur le fonctionnement interne de l'application (moteur SQL, structure des requêtes, erreurs) | Retourner des messages d'erreur génériques, journaliser les détails côté serveur, désactiver les erreurs détaillées en production  | Auth Bypass |
| Privilege Escalation | CWE-269 / 250 | Accès root ou élévation de privilèges | Moindre privilège, audit sudo, durcissement des permissions | FiPloit, HostHijack |
| FILE privilege MySQL	| CWE-272	| Extension de l'impact de la SQLi par possibilité d'écriture dans le système de fichiers	| Révoquer FILE lorsqu'il n'est pas nécessaire et appliquer le principe du moindre privilège | Query Quake |
| Exposed Administrative Interface | CWE-284 | Accès à des fonctions d'administration critiques depuis un réseau non maîtrisé | Restreindre l'accès (VPN, ACL, filtrage IP), supprimer les interfaces inutiles, journaliser les accès | Compromised-1, Fuite Mythos |
| Cleartext Storage of Sensitive Information | CWE-312 | Exposition d'IDs techniques et de tokens en clair, permettant à un attaquant de reconstituer la surface d'attaque et de s'authentifier sur des ressources internes pour exfiltrer des données confidentielles | Variables d'environnement pour le build ; gestion externalisée des secrets (Vault) ; purge automatique des révisions contenant des données sensibles | Fuite Mythos |
| Transmission d'informations sensibles en clair sur le réseau | CWE-319 | Expose identifiants et cookies de session à l'interception et attaques de type *Man-in-the-Middle*; Compromission des identifiants et prise de contrôle de l'interface d'administration | Forcer HTTPS (TLS), redirection HTTP→HTTPS, activer HSTS, utiliser des cookies `Secure` et `HttpOnly` | Auth bypass, Compromised-1 |
| Python Library Hijacking | CWE-427 | Exécution de code arbitraire via dépendances | Sécuriser PYTHONPATH et chemins d’exécution | Traversed |
| File Upload Bypass | CWE-434 | Upload de webshell et compromission serveur | Validation stricte des extensions, renommage des fichiers | FiPloit |
| Insufficiently Protected Credentials | CWE-522 | Compromission d’accès SSH / fuite de clés | Interdire stockage de clés privées sur serveurs exposés | TechnovaInfiltration, Fuite Mythos |
| Git Repository Exposure | CWE-552 | Fuite du code source et secrets | Bloquer l’accès au répertoire `.git` côté serveur | Traversed |
| BOLA / IDOR | CWE-639 | Fuite de données entre utilisateurs | Vérification des autorisations côté serveur sur chaque objet | ClearDesk |
| Password Reset Poisoning | CWE-640 | Prise de contrôle de compte | Utilisation d’un host statique et sécurisé | HostHijack |
| Ressource critique world-writable	| CWE-732	| Modification d'une ressource exécutée avec privilèges | Permissions minimales, propriétaire privilégié, intégrité des tâches | Query Quake |
| Use of Hard-coded Credentials | CWE-798 | Exposition de credentials réutilisables en cas d'accès au code source |  Utiliser une gestion sécurisée des secrets, hors du code applicatif, avec permissions minimales et rotation | Query Quake |
| Use of Default Credentials | CWE-1392 | Compromission d'un compte privilégié et accès à des fonctions d'administration | Changer systématiquement les identifiants par défaut avant la mise en production, intégrer ce contrôle dans les checklists de déploiement et réaliser des revues périodiques | Compromised-1 |

---

## Cartographie des contrôles

| Risque    | CWE     | OWASP Top 10   | Contrôle principal    | Détection    |
| ------------------ | ------- | ----------------- | ----------------- | ----------------- |
| Command Injection | CWE-78  | A03: Injection  | Validation des entrées    | SAST, revue de code    |
| SQL Injection  | CWE-89  | A03: Injection   | Requêtes préparées     | SAST, DAST, revue de code     |
| Information Disclosure   | CWE-200 | A05: Security Misconfiguration | Durcissement des environnements   | Revue de configuration   |
| Error Message Disclosure  | CWE-209 | A05: Security Misconfiguration | Gestion sécurisée des erreurs     | Tests applicatifs    |
| Privilege Escalation | CWE-269 / 250 | A01: Broken Access Control | Principe du moindre privilège, revue des permissions, durcissement des comptes et des privilèges | Audit des permissions, revue de configuration, tests de privilèges |
| MySQL FILE privilege excessif |	CWE-272 (Application of Incorrect Principle) / CWE-250 (Execution with Unnecessary Privileges) |	A05: Security Misconfiguration |	Révoquer FILE ; appliquer le moindre privilège au compte SQL applicatif	| Revue des privilèges SQL, tests de write (SELECT … INTO OUTFILE), audit de configuration DB |
| Exposed Administrative Interface | CWE-284 | A01: Broken Access Control | Restriction réseau des consoles d'administration, segmentation | Revue de configuration, scan des interfaces exposées |
| Cleartext Storage of Sensitive Information | CWE-312 | A02:2021: Cryptographic Failures | Variables d'environnement pour le build ; exclusion des IDs du JavaScript client ; gestion externalisée des secrets (Vault, AWS Secrets Manager) ; interdiction de stocker des credentials dans le contenu des documents ou leurs révisions | Secret scanning sur les dépôts et les assets JavaScript ; audit des historiques de bases documentaires pour détecter la présence de tokens ou de données sensibles ; revue de configuration des variables d'environnement et des fichiers de build |
| Transmission d'informations en clair | CWE-319 | A02: Cryptographic Failures     | HTTPS/TLS, HSTS    | Scan TLS, revue de configuration; Détection des accès non-chiffrés   |
| Python Library Hijacking | CWE-427 | A08: Software and Data Integrity Failures | Sécurisation du PYTHONPATH, gestion des dépendances, chemins d'import maîtrisés | Revue de configuration, SAST, analyse des dépendances |
| File Upload Bypass   | CWE-434 | A04: Insecure Design | Validation stricte du type et contenu des fichiers, stockage hors répertoire exécutable, renommage des fichiers   | Tests applicatifs, revue de code, tests d'upload |
| Insufficiently Protected Credentials | CWE-522 | A02: Cryptographic Failures | Protection des secrets, stockage sécurisé des identifiants et clés, chiffrement lorsque nécessaire | Secret scanning, revue de configuration, audit des dépôts |
| Git Repository Exposure   | CWE-552 | A05: Security Misconfiguration| Restriction d'accès aux répertoires sensibles | Scan de configuration  |
| BOLA / IDOR     | CWE-639 | A01: Broken Access Control| Contrôle d'accès par objet   | Tests fonctionnels, tests d'autorisation |
| Password Reset Poisoning | CWE-640 | A07: Identification and Authentication Failures | Génération sécurisée des liens de réinitialisation, validation stricte du domaine (Host), jetons à durée de vie limitée | Revue de code, tests fonctionnels du workflow de réinitialisation |
| Hard-coded Credentials (code source)	| CWE-798	| A02: Cryptographic Failures	| Gestion externalisée des secrets (vault, env protégées) ; aucun secret en dur dans le code	| Secret scanning, revue de code, audit des dépôts |
| Ressource critique world-writable (ex: cron/script root)	| CWE-732	| A05: Security Misconfiguration	| Permissions restrictives (chmod 700/600) ; propriétaire root uniquement ; contrôle d’intégrité	| Audit de permissions, recherche de fichiers exécutables modifiables, revue des tâches automatisées |
| Use of Default Credentials | CWE-1392 | A07: Identification and Authentication Failures | Rotation des identifiants par défaut, gestion des comptes d'administration | Audit de configuration, revues de comptes, scans de conformité |

_Note : Les correspondances CWE ↔ OWASP Top 10 sont indicatives; une même faiblesse peut relever de plusieurs catégories selon son contexte d'exploitation._

---

## Lecture des patterns (extraits représentatifs)

### Command Injection (CWE-78)

**Description**  
Exécution de commandes système via entrées non contrôlées.

**Impact**  
Compromission complète de l’hôte.

**Recommandations**
- `subprocess.run()` avec `shell=False`
- validation stricte des entrées
- interdiction des concaténations de commandes

---

### SQL Injection (CWE-89)

**Description**  
Manipulation de requêtes SQL via entrées utilisateur.

**Impact**  
Accès non autorisé aux données et contournement d’authentification.

**Recommandations**
- requêtes préparées
- validation serveur
- tests SAST/DAST

---

### BOLA / IDOR (CWE-639)

**Description**  
Accès à des objets non autorisés par manipulation d’identifiants.

**Impact**  
Fuite de données multi-utilisateurs.

**Recommandations**
- contrôle d’accès côté serveur
- vérification par objet
- tests automatisés des permissions

---

## Synthèse des familles de risques observées

Les vulnérabilités observées convergent vers cinq familles principales :

- **Contrôle d'accès insuffisant**
  - Exemple : BOLA / IDOR, contournement d'authentification

- **Validation insuffisante des entrées**
  - Exemple : SQL Injection, Command Injection, File Upload Bypass

- **Exposition d'informations sensibles**
  - Exemple : messages d'erreur détaillés, données sensibles exposées

- **Gestion insuffisante des privilèges système**
  - Exemple : élévation de privilèges, permissions excessives

- **Gestion des secrets et intégrité du code**
  - Exemple : exposition de clés, dépendances ou bibliothèques compromises

---

## Référentiels utilisés

Les correspondances avec OWASP Top 10 se basent sur la version **OWASP Top 10:2021**.

Ce document utilise principalement :
- MITRE CWE pour classifier les faiblesses techniques ;
- OWASP Top 10:2021 pour relier ces faiblesses aux grandes familles de risques applicatifs.

---

## Finalité

Ce document structure une lecture des risques techniques sous un angle exploitable en audit, en gouvernance et en conception de contrôles de sécurité.

---

## Aller plus loin

Pour comprendre comment ces risques sont identifiés sur le terrain :

- consulter le **[Technical Security Assessment Playbook](./technical-security-assessment-playbook.md)** pour comprendre comment les actions techniques d'audit permettent d'identifier des indices, des risques et des pratiques de sécurité associées ;
- consulter le **[Vulnerability Triage Playbook](./vulnerability-triage-playbook.md)** pour quantifier les vulnérabilités identifiées via CVSS et prioriser les décisions de remédiation ;
- explorer les études de cas **[HackerDNA](../HackerDNA/README.md)** ;
- parcourir les analyses **[OverTheWire](../OverTheWire/README.md)**.

---

## License

© Solène Figueiredo

Licensed under CC BY 4.0.