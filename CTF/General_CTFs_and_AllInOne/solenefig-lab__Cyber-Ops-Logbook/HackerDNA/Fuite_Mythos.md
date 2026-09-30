# WriteUp : Fuite Mythos: Exposition des brouillons d'un CMS headless

**Plateforme :** HackerDNA  (https://hackerdna.com/fr/labs/mythos-leak-headless-cms)

**Catégorie :**  Headless CMS: API Enumeration: Privilege Escalation  
**Difficulté :** Moyen   
**Tags :** `Web Exploitation` `Headless CMS` `API Enumeration` `Information Disclosure` `Revision History` `Token Abuse` `Privilege Escalation`

---

## Scénario

Le laboratoire est inspiré d'un incident réel en mars 2026 (fuite d'un modèle IA non publié) et simule un site utilisant un Headless CMS. Le site ne rend pas ses articles, mais l'API du CMS est accessible localement via un proxy Nginx. L'objectif est d'exploiter un set de données non publié via l'historique de révisions. 

---

## Chaîne d'Attaque

`[Reconnaissance et Enumération Sets de Données]`  ➔ `[Divulgation d'Information]` ➔ 🚩 ➔ `[Historique de Révisions]` ➔ `[Abus de Token et Escalade de Privilège]` ➔  🚩

---

## Étape 1: Reconnaissance & Énumération

La première étude du site web révèle 2 indices du stack technologique :  
- Dans le <head>, on repère : `<script src=` --> Référence à Next.js.
- Dans le <body>, on repère :  ` Nom du CMS, Project ID et Dataset (set de données) sont donnés en clair !  

Le texte de la carte `Engineering` sur le site web confirme l'architecture : "Our marketing site renders content from a headless CMS." La vérification du chemin `/cdn.xxx.io/` montre que le CMS existe et répond (`{"message":"hello"}`). 

**Erreur et recadrage :** Au départ, la recherche sur le Set de Données échoue, `Dataset not found`: le lab est un environnement isolé, l'API est hébergé localement via un proxy Nginx. Il faut penser à utiliser l'IP du lab dans l'URL plutôt que  l'API CMS publique (`https://xxx.api.xxx.io`).

Une reconnaissance via `curl`du script source donne aussi des informations précieuses : confirmation dde nouveau du CDN, du Project ID, du Set de Données, et en plus de la version API et des schémas d'URL pour les posts publiés.

```bash
"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[974],{5321:function(e,t,n){n.r(t);var r=n(7294),i=n(4183);/*! @xxx/client v6.12.3 */const c=i.createClient({projectId:"xxx",dataset:"xxxn",apiVersion:"xxx",useCdn:!0,perspective:"xxx"});async function u(){try{const e=await c.fetch('*[_type=="xxx"]|order(_xxxt desc)');return e}catch(e){console.error("[philanthropic.cms] fetch failed",e);return[]}}t.default=function(){const[e,t]=r.useState([]);r.useEffect(()=>{u().then(t)},[]);return r.createElement("div",null)}}}]);
```

**Réflexe audit :** 
- Vérifier systématiquement les données présentes en clair : sur la page et dans son code source, notamment les liens des différentes ressources et les ressources techniques utilisées.
- Faire un scan des endpoints et implémenter une politique de pare-feu/WAF pour bloquer l'accès public à ces chemins.
- Utiliser des variables d'environnement pour le build, ne pas inclure les IDs sensibles dans le JavaScript du client.
 
---

## Étape 2: Divulgation d'Information

La reconnaissance sur l'API découvert permet de récupèrer les informations sur 3 posts publiés.

```bash
curl -s "$API/query/production?query=*xxx" | jq

{"query":"*xxx","result":[{"_id":"xxx","_type":"xxx","_rev":"xxx","_createdAt":"xxx","_updatedAt":"2026-02-02T10:00:00Z","title":"xxx","slug":"xxx","body":"xxx","author":{"name":"xxx"}},{"_id":"xxx","_type":"xxx","_rev":"xxx","_createdAt":"xxx","_updatedAt":"2026-02-11T10:00:00Z","title":"xxx","slug":"xxx","body":"xxx","author":{"name":"xxx"}}],"ms":3}
```

**Erreur et recadrage :** 
1. Ce lab est un environnement simulé avec un faux CMS headless, qui ne supporte pas le GROQ complet, ou de composant Next.js ultra-simplifié; il n'y a pas de "vraie" base de données ni de serveur complet derrière. Ici, une action bien précise est attendue pour trouver le flag utilisateur.  
2. Attention à l'encodage des URL depuis un terminal : ici, les [ et " doivent être correctement encodés pour que @uery aboutisse.

La liste des posts publiés donnent des informations sur la structure du CMS; dans la fuite initiale, les informations avaient été trouvées dans les brouillons non publiés (drafts).

```
{"query":"*[_xxx(\"drafts.**\")]","result":[{"_id":"xxx","_type":"xxx","_rev":"xxx","_createdAt":"2026-03-01T08:15:00Z","_updatedAt":"2026-03-03T14:22:00Z","title":"xxxx","slug":"xxx","body":"EMBARGOED DRAFT. Do not publish.\n\nPhilanthropic is a new tier above our current flagship. It scores dramatically higher on coding and cybersecurity benchmarks.\n\n============================================================\n>>> USER FLAG: xxxx <<<\n============================================================\n\nSee the internal briefing document (_id: xxxg) for the launch comms plan. It was pulled before launch, but the transaction log still lists its old revisions.","author":{"name":"xxx"}}],"ms":3}
```

🚩 User Flag 

**Réflexe audit :**  
- **Un langage de reequête comme GROQ est un vecteur d'attaque** : Tester les projections et les conditions peut contourner les limitations de l'interface frontale.

---

## Étape 3: Historique de Révision

Le brouillon mentionne une information clef : il existe un document de briefing interne dont nous avons le `_id`, il a été effacé mais pas dans les historiques de révisions.

**Erreur et recadrage :** l'API history est la boone entrée, mais il y a une différence entre lister les transactions d'un document (pour trouver les IDs de révision) et récupérer le contenu d'une révision spécifique. Dans le deuxième cas, le chemin URL attend le document ID directement,

La liste des transactions du document donne 2 transactions avec leur id `_rev`, ce qui permet de construire le chemin complet pour afficher leur contenu. Leur contenu revèle le Token de l'API interne.

```bash
[{"_id":"xxx","_type":"xxx","_rev":"xxx","_createdAt":"2026-02-20T09:00:00Z","_updatedAt":"2026-02-28T17:00:00Z","title":"xxx","body":"[REDACTED - contact comms lead before republishing]","author":{"name":"xxx","notes":"Token rotated into author.notes during migration - cleanup pending. API token for the internal dataset: xxx"}}]}
```

**Réflexe audit :**  
- Tester l'accès au set de données `internal` en modifiant l'URL : mettre une authentification stricte sur toutes les requêtes à l'API interne, même celles qui semblent "locales".
- Faire un audit d'historique et vérfier la présence de données supprimées mais récupérables: appliquer une politique de purge des révisions (retention limitée) pour les documents contenant des données sensibles.

---

## Étape 4: Abus de Token et Escalade de Privilège

Une fois le token récupéré, il doit être passé en header HTTP d'authentification, pas dans l'URL, pour accéder au Set de Donnée Interne.

**Erreur et recadrage :** L'erreur bad range specification in URL provient du fait que curl interprète les crochets [...] comme une syntaxe de sélection de plage d'URLs (globbing interne de curl), et non du shell. Pour corriger cela, il faut utiliser l'option -g (ou --globoff) pour désactiver ce comportement, tout en continuant à faire attention à l'encodage correct de l'URL.

```bash
curl -g -i -H "xxx: xxx TOKEN" \
  "http://xxxx/internal?query=*[_type==\"xxx\"]"
{"query":"*[_type==\"xxx\"]","result":[{"_id":"xxx","_type":"xxx","_rev":"rxxx","_createdAt":"2026-02-20T09:00:00Z","_updatedAt":"2026-02-28T17:00:00Z","title":"xxxx","body":"Cleared for internal distribution only.\nLaunch window TBD.\n\n============================================================\n>>> ROOT FLAG: xxx<<<\n============================================================","author":{"name":"xxx"}}],"ms":3}
```

🚩 Flag Root

**Réflexe audit :**
- Faire des audits réguliers des secrets et ne jamais stocker de jetons d'authentification dans le contenu des documents, même supprimés.

---

## Analyse GRC: Recommandations

**La chaîne complète vue par OWASP :**

```
A05:2021 - Security Misconfiguration --> Exposition de l'API / URLs sensibles
A04:2021 - Insecure Design --> Révisions historiques exposant des données supprimées
A02:2021 - Cryptographic Failures --> Token d'API en clair dans les notes d'historique
A01:2021 - Broken Access Control--> Accès au set de données `internal` sans autorisation
```

---

La chaîne d'exploitation met en évidence plusieurs contrôles indépendants défaillants, qui repose plutôt sur l'accumulation de plusieurs faiblesses.

| Risque | CWE | Impact | Recommandation |
|---|---|---|---|
| Cleartext Storage of Sensitive Information | CWE-312 | Stockage en clair d'IDs techniques et de tokens dans le JavaScript client et l'historique des révisions permettant à un attaquant de reconstituer la surface d'attaque et de s'authentifier sur des sets de données internes, conduisant à l'exfiltration de données confidentielles | Utiliser des variables d'environnement pour le build ; ne jamais stocker de credentials dans le contenu des documents, même supprimés ; mettre en place une purge automatique des révisions contenant des données sensibles |
| Improper Access Control | CWE-284 | Absence de contrôle d'accès sur l'API interne et l'historique des révisions permettant à tout utilisateur non authentifié d'extraire l'intégralité des sets de données, y compris les documents supprimés et les brouillons |  Implémenter une politique de pare-feu/WAF pour bloquer l'accès public aux chemins internes ; authentifier strictement toutes les requêtes à l'API interne, même celles qui semblent locales | 
| Insufficiently Protected Credentials | CWE-522 | Récupération du token d'API depuis l'historique des révisions pouvant être réutilisé sans restriction pour accéder au set de données interne et exfiltrer des documents confidentiels, sans détection ni possibilité de révocation ciblée | Appliquer des restrictions d'usage aux tokens : binding IP, durée de vie limitée, scope restreint au dataset concerné, révocation individuelle possible ; auditer régulièrement les tokens actifs |

---

## Leçons Apprises

- Les environnements "internal", "staging" et "production" ne doivent pas partager la même infrastructure d'authentification. La séparation doit être technique (clés distinctes, ACLs au niveau de l'API) et pas seulement organisationnelle. Dans ce lab, un attaquant qui compromet le set de données public peut automatiquement pivoter vers le set de données privé, un principe de moindre privilège aurait dû l'en empêcher.
- Les mécanismes de suppression dans les bases documentaires sont souvent des "soft deletes", et les historiques de révisions sont conservés intentionnellement (pour l'audit, le rollback). Une organisation qui stocke des secrets dans ses documents doit considérer que ces secrets seront conservés indéfiniment dans l'historique, même si le document "actif" est supprimé. La politique de rétention doit être définie non pas par le cycle de vie du document, mais par la sensibilité des données qu'il contient.
- Les APIs de requête (GROQ, GraphQL, SQL) ne sont pas des "lectures passives". Elles exécutent du code (des requêtes) envoyé par le client. Une organisation qui expose une API de requête doit traiter chaque paramètre (projection, condition, chemin) comme une entrée utilisateur potentiellement malveillante. 

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.