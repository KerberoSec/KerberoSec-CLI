# Cyber-Ops Logbook

> **Transformer des patterns techniques en décisions de gouvernance.**  
> *From technical patterns to governance decisions.*

> A structured cybersecurity knowledge base translating technical attack patterns into governance, risk management and security insights.

---

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-blue.svg)](./LICENSE)
![Knowledge Base](https://img.shields.io/badge/Type-Knowledge%20Base-informational.svg)
![Focus: Defensive Security & GRC](https://img.shields.io/badge/Focus-Defensive%20Security%20%26%20GRC-informational.svg)
![Language: FR + EN](https://img.shields.io/badge/Language-FR%20%2B%20EN-informational.svg)

---

## Sommaire

- [Vision](#vision)
- [Comment utiliser ce dépôt](#comment-utiliser-ce-dépôt)
- [À qui s'adresse ce dépôt ?](#a-qui-sadresse-ce-dépôt-)
- [Par où commencer ?](#par-où-commencer-)
- [Démarche](#démarche)
- [Structure du dépôt](#structure-du-dépôt)
- [Contenu du dépôt](#contenu-du-dépôt)
- [Principes](#principes)
- [Publication responsable](#publication-responsable)
- [English Summary](#-english-summary)
- [Contributions](#-contributions)
- [License](#-license)

---

## Vision

Ce projet structure l'analyse de la sécurité à partir de l'observation de mécanismes techniques concrets issus de wargames et de laboratoires.

L'objectif est de relier ces patterns techniques à leurs implications en matière de contrôle, de gestion des risques et de gouvernance de la sécurité.

Il ne s'agit pas de documenter des exploits, mais de construire une base de connaissances réutilisable permettant de transformer des observations techniques en décisions de sécurité plus robustes.

---

## Comment utiliser ce dépôt

Ce dépôt constitue un pont entre les mécanismes techniques observés dans les laboratoires de cybersécurité et les décisions de gouvernance qui en découlent.

Il peut être utilisé comme :
- une base d'apprentissage des mécanismes d'attaque ;
- un support d'analyse sécurité ;
- un référentiel reliant observations techniques, risques et contrôles de sécurité.

--- 
## A qui s'adresse ce dépôt ?

### Pour les profils Audit / GRC / RSSI

Le dépôt permet de :

- préparer des revues de sécurité applicative ;
- construire des exigences de contrôle ;
- enrichir des registres de risques ;
- alimenter des ateliers de threat modeling ;
- illustrer des scénarios de risques dans des comités de gouvernance.

Le **Panorama des patterns de risques** et les sections **Analyse GRC: Recommandations** des études de cas permettent de transformer des constats techniques en recommandations opérationnelles.

### Pour les profils Offensive Security / AppSec / Blue Team

Les dossiers **HackerDNA** et **OverTheWire** permettent de :

- étudier des patterns techniques récurrents ;
- enrichir des revues de code ou des check-lists sécurité ;
- analyser des chaînes d'attaque ;
- relier des observations techniques à des référentiels comme CWE et OWASP ;
- produire des constats techniques compréhensibles par des équipes GRC.

### Pour l'apprentissage

Les write-ups peuvent être utilisés comme études de cas pour :

- comprendre une chaîne d'attaque de bout en bout ;
- identifier les mécanismes techniques sous-jacents ;
- observer leur traduction en risques sécurité ;
- documenter ses propres laboratoires selon une approche orientée gouvernance.

> **EN (short version)**  
> This repository is both a cybersecurity learning resource and a governance knowledge base. It helps translate technical findings from labs, CTFs and wargames into security controls, governance decisions and risk management practices.

---

## Par où commencer ?

Le dépôt est organisé autour de quatre niveaux complémentaires :

1. **[Technical Security Assessment Playbook](./docs/technical-security-assessment-playbook.md)**  
   Comprendre comment les actions techniques d'audit permettent d'identifier des indices, des risques et des pratiques de sécurité associées.

2. **[Panorama des patterns de risques](./docs/risk-patterns.md)**  
   Consolider les vulnérabilités observées et les relier aux familles de risques, aux contrôles et aux enjeux de gouvernance.

3. **[Études de cas HackerDNA](./HackerDNA/README.md)**  
   Observer des chaînes d'attaque réalistes et leur analyse orientée sécurité.

4. **[Patterns techniques OverTheWire](./OverTheWire/README.md)**  
   Approfondir des mécanismes de sécurité fondamentaux à travers des wargames.

5. **[Vulnerability Triage Playbook](./docs/vulnerability_triage_playbook.md)**  
   Quantifier les vulnérabilités observées via CVSS et structurer les décisions de priorisation et de remédiation.

---
## Démarche

Chaque étude suit une logique de transformation : partir d'une observation technique concrète pour aboutir à une compréhension du risque et à une décision de sécurité.

```text
          Pattern technique observé
                    │
                    ▼
      Compréhension du mécanisme
                    │
                    ▼
     Qualification de la faiblesse
          (CWE / OWASP si pertinent)
                    │
                    ▼
        Analyse de l'impact sécurité
                    │
                    ▼
     Identification des contrôles adaptés
                    │
                    ▼
       Enseignements pour la gouvernance
```

---

## Structure du dépôt

```text
Cyber-Ops Logbook
│
├── HackerDNA/      Études de cas d'attaques réalistes
├── OverTheWire/    Patterns techniques issus des wargames
├── docs/           Référentiels GRC, cartographies des risques
└── README.md
```

---

## Contenu du dépôt

### OverTheWire: Patterns techniques

Les wargames **OverTheWire** sont utilisés comme terrain d'observation pour identifier des mécanismes récurrents de sécurité.

Les analyses couvrent notamment :

- Linux Security
- Permissions et gestion des privilèges
- Réseaux
- Cryptographie
- Authentification
- Analyse de binaires
- Git Security
- Automatisation

Chaque document synthétise :

- les patterns techniques observés ;
- leur lecture sécurité ;
- leur traduction en enjeux de gouvernance ;
- les bonnes pratiques de protection.

➡️ **Consulter le dossier [OverTheWire](./OverTheWire/README.md)**

---

### HackerDNA: Études de cas

Les laboratoires **HackerDNA** permettent d'analyser des chaînes d'attaque réalistes dans un environnement contrôlé.

Chaque write-up documente :

- la chaîne d'attaque ;
- les techniques employées ;
- les vulnérabilités identifiées ;
- les références CWE et OWASP lorsque pertinentes ;
- les recommandations de remédiation ;
- les enseignements pour la gouvernance.

Les analyses couvrent notamment :

- Web Security
- API Security
- Linux Security
- Network Security
- Privilege Escalation
- SQL Injection
- Command Injection
- Authentication & Access Control
- Information Disclosure
- Binary Analysis

➡️ **Consulter le dossier [HackerDNA](./HackerDNA/README.md)**

🔗 **Profil public HackerDNA (classement en temps réel)**  
[Profil Solene](https://hackerdna.com/fr/users/solene)

---

### Risk Pattern Mapping

Une cartographie des principaux patterns de vulnérabilités techniques observés dans les labs et wargames est disponible ici :

➡️ [Panorama des patterns de risques](./docs/risk-patterns.md)

Ce référentiel synthétise les vulnérabilités récurrentes et leur lecture en termes de contrôle, de gouvernance et de gestion des risques.

---

## Principes

Ce dépôt repose sur quatre principes :

- **Comprendre avant d'exploiter.**
- **Capitaliser des patterns techniques réutilisables.**
- **Transformer les observations techniques en décisions de gouvernance.**
- **Privilégier une approche défensive, responsable et orientée maîtrise des risques.**

---

## Publication responsable

Afin de préserver l'intégrité des plateformes d'apprentissage :

- aucun flag n'est publié ;
- aucun mot de passe ou secret n'est divulgué ;
- certaines informations sont volontairement anonymisées ;
- les analyses privilégient la compréhension des mécanismes plutôt que la reproduction complète des solutions.

---

## 🇬🇧 English Summary

> **From technical patterns to governance decisions.**

Cyber-Ops Logbook is a cybersecurity knowledge base documenting reusable technical patterns extracted from CTFs, wargames and security labs.

Rather than publishing challenge solutions, the repository focuses on understanding how vulnerabilities emerge, analysing recurring security patterns and translating technical findings into governance, risk management and defensive security insights.

The repository currently includes:

- **OverTheWire:** reusable Linux, system, networking and cryptography security patterns.
- **HackerDNA:** end-to-end security case studies with governance-oriented analysis and defensive recommendations.

---

## 🤝 Contributions

Cyber-Ops-Logbook is open to corrections, technical improvements and better risk mappings.

You can contribute by:

- correcting a technical analysis;  
- improving a CWE / OWASP mapping;  
- strengthening a risk or impact assessment;  
- proposing a better security control;  
- adding a reliable reference;  
- improving documentation.  

→ [Contributing guidelines](./CONTRIBUTING.md)

---

## 📄 License

Unless otherwise stated, the original documentation, analyses, diagrams and other original content in this repository are licensed under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** License.

Challenge names, trademarks and any third-party content remain the property of their respective owners.

This repository contains independent educational analyses and is not affiliated with or endorsed by HackerDNA, OverTheWire or any other platform.

See the [LICENSE](./LICENSE) file for details.

© 2026 Solène Figueiredo