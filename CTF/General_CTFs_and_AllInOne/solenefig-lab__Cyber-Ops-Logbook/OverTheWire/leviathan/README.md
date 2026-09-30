# OverTheWire: Leviathan (Patterns & Concepts)

> Objectif : Extraire les patterns techniques clés et leur lecture 
> sécurité (GRC), sans divulguer de solutions.

---

## 1. Exposition de données dans fichiers non surveillés

**Niveaux concernés : 0 → 1**

- Exploration de répertoires cachés
- Lecture de fichiers à permissions restreintes
- Recherche de credentials dans des données non structurées (HTML, logs)

**Pointers**
```bash
ls -la
grep -i "password" fichier.html
```

**Lecture sécurité**
- **Risque :** Credentials stockés en clair dans des fichiers accessibles au groupe.
- **Enjeu :** Contrôle d'accès sur les fichiers sensibles, principe du moindre privilège (PoLP).

---

## 2. Reverse engineering de binaires & secrets embarqués

**Niveaux concernés : 1 → 2**

- Analyse statique d'un exécutable (`strings`, `ltrace`)
- Interception d'appels système en temps réel
- Identification de mots de passe hardcodés dans le binaire

**Pointers**
```bash
strings ./binaire          # repère les chaînes lisibles
ltrace ./binaire           # intercepte strcmp() en live
```

**Lecture sécurité**
- **Risque :** Hardcoded credentials dans les exécutables (CWE-798 / CWE-312).
- **Enjeu :** Politique de gestion des secrets, interdiction des credentials en dur, usage d'un vault en production.

---

## 3. Vulnérabilité TOCTOU & injection d'arguments

**Niveaux concernés : 2 → 3**

- Analyse d'un binaire SetUID via `strings`, `ltrace`, `objdump`
- Faille TOCTOU : fenêtre entre vérification (`access()`) et exécution (`system()`)
- Injection d'arguments via nom de fichier avec espace ou séparateur `;`
- Escalade de privilèges via shell spawné avec droits effectifs

**Pointers**
```bash
strings ./binaire          # repère /bin/cat %s et access()
ltrace ./binaire           # confirme la logique check → execute
objdump -d ./binaire       # localise access@plt puis snprintf@plt
touch "nom fichier"        # crée le leurre pour access()
ln -s /cible nom           # lien symbolique pour cat
```

**Lecture sécurité**
- **Risque :** TOCTOU (CWE-367) + injection de commande (CWE-78) via construction de commande shell sans échappement.
- **Enjeu :** Validation stricte des entrées, revue de code sur les binaires privilégiés, remplacement de `system()` par des appels directs.

---

## 4. Credentials obfusqués en mémoire

**Niveaux concernés : 3 → 4**

- Analyse `strings` sur un binaire compilé
- Identification de chaînes fragmentées / obfusquées
- Lecture `objdump` pour reconstituer la logique de comparaison

**Pointers**
```bash
strings ./binaire          # repère fragments de chaînes
objdump -d ./binaire       # analyse la logique strcmp
```

**Lecture sécurité**
- **Risque :** L'obfuscation n'est pas du chiffrement: les secrets restent récupérables par analyse statique (CWE-261).
- **Enjeu :** Aucun secret ne doit résider dans un binaire, même fragmenté. Chiffrement et gestion externe obligatoires.

---

## 5. Symlink attack sur fichier temporaire

**Niveaux concernés : 4 → 6**

- Binaire privilégié qui ouvre un fichier à chemin fixe (/tmp/file.log)
- Création d'un lien symbolique vers une cible privilégiée
- Le binaire suit le symlink avec ses droits effectifs (leviathan6)
- unlink() : le fichier est supprimé après lecture, timing critique

**Pointers**
```bash
ltrace ./binaire           # révèle fopen("/tmp/file.log")
ln -s /cible /tmp/file.log # symlink attack
./binaire                  # lit la cible avec droits élevés
```

**Lecture sécurité**
- **Risque :** Symlink attack sur fichiers temporaires (CWE-61 / CWE-377).
- **Enjeu :** Ne jamais ouvrir de fichiers dans /tmp sans O_NOFOLLOW, utiliser mkstemp(), vérifier l'ownership avant ouverture.

---

## 6. Brute force & code hardcodé en assembleur

**Niveaux concernés : 6 → 7**

- Binaire attendant un code à 4 chiffres
- Brute force scriptée (0000-9999), limites : lenteur, déconnexion SSH si shell spawné
- Lecture assembleur via objdump pour extraire la valeur hardcodée
- Conversion hexadécimal → décimal

**Pointers**
```bash
strings ./binaire              # repère atoi, /bin/sh
objdump -d ./binaire | grep "cmp"          # localise la comparaison
objdump -d ./binaire | grep -B 20 "cmp"   # remonte au mov hardcodé
echo $((16#XXXX))              # conversion hex → dec
```

**Lecture sécurité**
- **Risque :** Code hardcodé extrait par analyse statique (CWE-798), absence de protection anti-brute force.
- **Enjeu :** NAucun secret dans le binaire, rate limiting, lockout après N tentatives.

---

## Synthèse

**Workflow d'analyse binaire acquis :**
- Analyser statiquement avant d'exécuter (`strings`, `objdump`).
```
strings → ltrace → objdump → exécution directe
statique → dynamique → assembleur → exploitation
```
  
**Patterns clés acquis :**
- Analyser statiquement avant d'exécuter (`strings`, `objdump`).
- Intercepter dynamiquement pour confirmer (`ltrace`).
- Identifier la fenêtre TOCTOU : où s'arrête le check, où commence l'exécution.
- Tout espace ou caractère non échappé dans une commande shell est une surface d'injection.
- Les fichiers temporaires à chemin fixe sont des cibles d'attaque symlink classiques.

**Surface d'attaque couverte :**
| CWE | Description |
|-----|-------------|
| CWE-798 | Hardcoded credentials |
| CWE-312 | Cleartext storage of sensitive info |
| CWE-367 | TOCTOU race condition |
| CWE-78 | OS command injection |
| CWE-61 | Symlink following |
| CWE-377 | Insecure temporary file |
| CWE-261 | Weak encoding for password |

**Positionnement**

Ces exercices sont abordés comme un terrain d'entraînement pour :
- Comprendre les mécanismes d'escalade de privilèges réels.
- Identifier les failles de conception dans les binaires privilégiés.
- Renforcer une approche GRC pragmatique : savoir ce qu'un auditeur technique peut extraire d'un système.

**N.b. :**
- Pas de solutions ni de mots de passe divulgués.
- Approche méthodologique uniquement.
- Environnement d'apprentissage contrôlé.

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.