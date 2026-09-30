# Write-Up : Clear Desk

**Plateforme :** HackerDNA  (https://hackerdna.com/fr/labs/cleardesk)

**Catégorie :** API Security: Access Controls    
**Difficulté :** Moyen   
**Tags :** `IDOR` `API Security` `Path Traversal` `Access Control` `PrivEsc`

---

## Scénario

L'API du helpdesk de **ClearDesk** authentifie chaque requête, mais manque de contrôles d'autorisation granulaire. L'objectif de cette investigation est de démontrer comment une vulnérabilité de type **IDOR/BOLA** permet une escalade de privilèges verticaux, aboutissant à une lecture de fichiers critiques sur le serveur.

---

## Chaîne d'Attaque
`[Enumération API]` ➔ `[IDOR / BOLA]` ➔ `[Credential Theft]` ➔ `[Privilege Escalation]` ➔ `[Path Traversal]` ➔ 🚩

---

## Étape 1: Énumération & IDOR (BOLA)

Après une connexion initiale avec des privilèges restreints (`guest`), l'analyse du trafic montre que l'application interroge un endpoint API pour afficher les tickets de support.

### Manipulation de l'ID de ressource
L'endpoint suit une structure prévisible : `/api/ticket/<ID>`. Bien que l'utilisateur soit authentifié, le serveur ne vérifie pas si l'utilisateur possède les droits sur l'objet demandé (**Broken Object Level Authorization**).

En automatisant l'incrémentation des IDs, plusieurs ressources confidentielles ont été exfiltrées :
*   **Audit Findings** : Un ticket contenant les conclusions d'un audit de sécurité interne.
🚩 **Flag User :** `FLAG{...}`

*   **IT Admin Credentials** : Un ticket de support technique contenant des identifiants temporaires pour un compte administrateur.

> **Réflexe audit (CWE-639) :** L'authentification ("Qui êtes-vous ?") est présente, mais l'autorisation ("Qu'avez-vous le droit de voir ?") est absente. L'utilisation d'identifiants non prévisibles (UUID) au lieu d'IDs incrémentaux est une première barrière recommandée.

---

## Étape 2: Escalade de Privilèges

Grâce aux identifiants compromis lors de l'étape précédente, une nouvelle session est ouverte avec le compte **IT Admin**. Cette identité permet d'accéder à des fonctionnalités d'administration avancées, notamment un module de consultation des logs système.

---

## Étape 3: Path Traversal (LFI)

Le module de logs utilise un paramètre `file` pour appeler des fichiers sur le disque. Ce paramètre n'est pas correctement assaini, permettant de sortir du répertoire prévu.

### Preuve de Concept (PoC)
Lecture du fichier `/etc/passwd` pour confirmer la vulnérabilité et identifier les utilisateurs du système :
```bash
curl "http://<IP>/admin/logs?file=../../../../etc/passwd"
```

*   **Recherche de chemin** : En exploitant un indice trouvé dans les tickets d'administration (mentionnant un échec de backup sur un fichier sensible), l'accès au flag final est réalisé via un chemin absolu.
🚩 **Flag Root :** `FLAG{...}`

---

## Analyse GRC: Recommandations

| Risque | CWE | Impact | Recommandation |
|--------|--------|--------|----------------|
| BOLA / IDOR | CWE-639 |	Fuite de données massives et vol d'identifiants. |	Valider les autorisations sur chaque objet demandé côté serveur. |
| Missing Authorization | CWE-862 |	Contrôle d’autorisation manquant. |	Mettre en place des contrôles d’accès centralisés et le moindre privilège. |
| Credential Exposure / Sensitive Data Exposure | CWE-256 (+ CWE-200) |	Exposition de mots de passe et secrets sensibles. | Interdire les secrets en clair et utiliser des liens temporaires. |
| LFI / Path Traversal |	CWE-22 (+ CWE-73)	| Lecture de fichiers système et compromission de l'hôte. |	Restreindre les chemins accessibles et filtrer les entrées utilisateur. |

---

## Leçons Apprises

- **L'illusion de la sécurité par l'authentification :** Un utilisateur "connecté" n'est pas un utilisateur "sûr". Chaque accès à une ressource doit être vérifié.
- **La chaîne de compromission :** Une faille jugée "moyenne" (IDOR) devient "critique" lorsqu'elle permet de rebondir sur d'autres vulnérabilités (Path Traversal).
- **Hygiène des tickets :** Les outils de support sont des cibles de choix pour les attaquants car ils contiennent souvent des informations sensibles transmises par erreur par les utilisateurs ou les administrateurs.
