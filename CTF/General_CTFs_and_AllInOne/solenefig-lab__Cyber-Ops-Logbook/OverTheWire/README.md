# OverTheWire Wargames
![Cybersecurity](https://img.shields.io/badge/Cybersecurity-GRC%20%7C%20Linux%20Security-red)
![Tool](https://img.shields.io/badge/Tool-Linux%20%7C%20Bash%20%7C%20OverTheWire-blue)
![Level](https://img.shields.io/badge/Level-Intermediate-orange)
![Status](https://img.shields.io/badge/Status-In%20Progress-yellow)

> **Des patterns techniques aux décisions de gouvernance : comprendre les mécanismes de sécurité pour renforcer l'analyse des risques, les contrôles et les recommandations de sécurité.**

---

## Positionnement

Les wargames **OverTheWire** sont utilisés comme un laboratoire d'observation des mécanismes de sécurité.

Chaque parcours permet d'identifier des **patterns techniques récurrents**, d'analyser leurs implications en matière de sécurité et de les traduire en enseignements utiles pour l'audit, la gouvernance et la maîtrise des risques.

L'objectif n'est pas de documenter les solutions des exercices, mais de construire une base de connaissances réutilisable reliant les observations techniques aux décisions de gouvernance. 

---

## Comment utiliser ce dossier

Les wargames OverTheWire permettent d'observer des mécanismes techniques de sécurité de manière progressive.

Les patterns identifiés sont ensuite :

- reliés au **[Technical Security Assessment Playbook](../docs/technical-security-assessment-playbook.md)** pour comprendre leur intérêt en audit ;
- consolidés dans le **[Panorama des patterns de risques](../docs/risk-patterns.md)** afin de les traduire en enjeux de gouvernance et de gestion des risques ;  
- traduits en scores de criticité et décisions de remédiation via le **[Vulnerability Triage Playbook](../docs/vulnerability_triage_playbook.md)**.

---

## Parcours Hands-on

Chaque parcours est synthétisé sous forme de patterns techniques, de lectures sécurité et de traductions en enjeux GRC, sans divulguer les solutions des exercices.  

### [OverTheWire: Bandit (Niveau 32: Terminé)](https://overthewire.org/wargames/bandit/) | [Consulter mes notes](./bandit/README.md)
*Focus : Fondamentaux Linux, permissions, gestion des accès et exposition des données.*

| Compétence technique | Lecture GRC / Audit |
| :--- | :--- |
| **Permissions & SUID** | Risque d’escalade de privilèges, principe du moindre privilège (IAM). |
| **Recherche de données (`grep`, `find`)** | Détection d'exposition involontaire d’informations sensibles. |
| **Réseau & services (`nc`, ports)** | Maîtrise de la surface d’exposition et contrôle des flux. |
| **SSH / OpenSSL** | Sécurisation des échanges et intégrité des communications. |
| **Bash scripting** | Automatisation de contrôles de sécurité (MCS). |

---

## Exemples de vérification (Audit & Prévention)

```bash
# Détection de fichiers à privilèges élevés (Risque d'élévation de privilèges)
find / -perm -4000 -type f 2>/dev/null

# Recherche de secrets en clair dans les configurations (Audit d'hygiène numérique)
grep -rEi "password|token|secret" /etc/ 2>/dev/null
```
---
### [OverTheWire: Krypton (Level 6/7: En cours)](https://overthewire.org/wargames/krypton/) | [Consulter mes notes](./krypton/README.md)

*Focus : Cryptographie appliquée: de César au stream cipher, en passant
par l'analyse de Kasiski et les générateurs pseudo-aléatoires faibles.*

| Compétence technique | Lecture GRC / Audit |
| :--- | :--- |
| **Analyse de fréquences (mono & polyalphabétique)** | Détection d'algorithmes obsolètes ou mal implémentés (CWE-327). |
| **Méthode de Kasiski & indice de coïncidence** | Identification de la réutilisation de clé: Key Reuse, principe du OTP. |
| **Attaque par plaintext connu sur stream cipher** | PRNG faible = keystream prévisible: exigence de CSPRNG en production (CWE-338). |
| **Script Python d'analyse cryptographique** | Automatisation des contrôles de sécurité: vérification de la robustesse des choix crypto lors d'un audit. |

---
### [OverTheWire: Leviathan (7/7: Terminé)](https://overthewire.org/wargames/leviathan/) | [Consulter mes notes](./leviathan/README.md)
*Focus : Analyse de binaires, escalade de privilèges SetUID, vulnérabilités TOCTOU.*

| Compétence technique | Lecture GRC / Audit |
| :--- | :--- |
| **Reverse engineering (`strings`, `ltrace`)** | Détection de credentials hardcodés dans les exécutables (CWE-798). |
| **Analyse `objdump`** | Compréhension de la logique d'autorisation: où le check s'arrête, où le risque commence. |
| **Faille TOCTOU + injection d'arguments** | Failles de conception sur les binaires privilégiés: impact escalade de privilèges (CWE-367). |
| **Symlink attack sur fichiers temporaires** | Risque d'accès non autorisé via `/tmp`: mauvaise gestion des fichiers temporaires (CWE-377). |
| **Brute force & analyse assembleur** | Absence de protection anti-brute force + secrets extraits statiquement (CWE-261). |
| **Binaires SetUID** | Surface d'attaque liée aux droits élevés: audit PoLP et revue des exécutables sensibles. |

---
### [OverTheWire: Natas (Level 12/34: En cours)](https://overthewire.org/wargames/natas/) | [Consulter mes notes](./natas/README.md)

*Focus : Vulnérabilités web côté serveur: contrôle d'accès, injections,
cryptographie faible. Mapping OWASP Top 10.*

| Compétence technique | Lecture GRC / Audit |
| :--- | :--- |
| **Reconnaissance & exposition (source HTML, robots.txt, directory listing)** | Fuite d'information involontaire: A01 Broken Access Control, hygiène de déploiement. |
| **Header spoofing & auth bypass cookie** | Contrôles d'accès côté client non fiables: A01, principe de validation serveur. |
| **LFI & Command Injection (RCE)** | Paramètres non filtrés = exécution arbitraire: A03 Injection (CWE-78 / CWE-22). |
| **Reverse engineering d'encodage & cryptanalyse XOR** | Clé statique + encodage réversible ≠ chiffrement: A02 Cryptographic Failures (CWE-327). |

---
## Organisation du dépôt
Chaque section documente les concepts techniques, les patterns de résolution rencontrés et leur traduction en enjeux GRC.

[Dossier Bandit](./bandit/README.md): Concepts clés et patterns de résolution (Linux & System Security).

[Dossier Krypton](./krypton/README.md): Bases de la cryptographie appliquée à la protection des actifs.

[Dossier Leviathan](./leviathan/README.md): Analyse de la logique de privilèges et exploitation de binaires.

[Dossier Natas](./natas/README.md): Vulnérabilités web et bonnes pratiques (Top 10 OWASP).

=======

_Note d'éthique : Aucun secret, mot de passe ou solution complète n'est publié afin de préserver l'intégrité des plateformes d'apprentissage et de promouvoir une documentation responsable centrée sur la compréhension des mécanismes de sécurité._

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.