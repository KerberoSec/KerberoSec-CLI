# OverTheWire: Krypton (Patterns & Concepts)

> Objectif : Extraire les patterns techniques clés et leur lecture
> sécurité (GRC), sans divulguer de solutions.

---

## 1. Encodage ≠ chiffrement

**Niveaux concernés : 0 → 1**

- Décodage Base64
- Distinction entre encodage (réversible, pas de clé) et chiffrement

**Pointers**
```bash
base64 -d <<< "chaine_encodee"
```

**Lecture sécurité**
- **Risque :** Confusion fréquente entre encodage et protection des données.
- **Enjeu :** Base64 n'offre aucune confidentialité: une donnée encodée
  est une donnée en clair. Politique de classification et de chiffrement réel.

---

## 2. Chiffrement par substitution (César / ROT)

**Niveaux concernés : 1 → 2**

- Chiffre de César : décalage fixe sur l'alphabet
- ROT13 comme cas particulier (décalage de 13)
- Déchiffrement par `tr`

**Pointers**
```bash
cat fichier | tr 'A-Za-z' 'N-ZA-Mn-za-m'   # ROT13
```

**Lecture sécurité**
- **Risque :** Substitution monoalphabétique cassable par analyse de fréquences.
- **Enjeu :** Les algorithmes historiques (César, Vigenère) ne constituent
  pas un chiffrement acceptable en production: obsolescence cryptographique (CWE-327).

---

## 3. Analyse de fréquences sur chiffrement monoalphabétique

**Niveaux concernés : 2 → 4**

- Chiffrement par clé de substitution fixe (SetUID + keyfile)
- Analyse statistique des fréquences de lettres
- Déduction de la clé par correspondance avec la langue naturelle (anglais)

**Pointers**
```bash
cat found1 found2 found3 | tr -d ' ' | fold -w1 | sort | uniq -c | sort -nr
# Lettre la plus fréquente → E en anglais
# Décalage = (lettre_observée - E) mod 26
```

**Lecture sécurité**
- **Risque :** Toute clé fixe et courte est vulnérable à l'analyse statistique.
- **Enjeu :** Longueur et entropie de la clé sont des critères fondamentaux
  d'évaluation cryptographique lors d'un audit.

---

## 4. Chiffre de Vigenère & analyse de Kasiski

**Niveaux concernés : 4 → 5**

- Chiffrement polyalphabétique : la clé se répète sur le texte
- Méthode de Kasiski : les trigrammes répétés révèlent la longueur de la clé
- Indice de coïncidence (IC) pour confirmer la longueur
- Analyse fréquentielle colonne par colonne une fois la longueur connue

**Pointers**
```bash
# Recherche des répétitions de trigrammes et de leurs distances
grep -ob 'XYZ' ciphertext.txt

# Calcul de l'IC moyen pour différentes longueurs de clé (Python)
python3 ic.py   # IC anglais ≈ 0.065 / IC aléatoire ≈ 0.038
```

**Lecture sécurité**
- **Risque :** Une clé courte et répétée, même polyalphabétique, est
  statistiquement cassable avec suffisamment de texte chiffré.
- **Enjeu :** Longueur de clé proportionnelle au message, non-réutilisation
  de clé: principes du One Time Pad et des chiffrements modernes.

---

## 5. Clé inconnue & détermination par IC

**Niveaux concernés : 5 → 6**

- Vigenère sans longueur de clé connue
- Test de Kasiski sur trigrammes multiples (PGCD des distances)
- Confirmation par IC : le bon `n` donne IC ≈ 0.065 par colonne
- Analyse colonne par colonne sur chaque fichier séparément
  (la concaténation des fichiers noie le signal)

**Pointers**
```bash
# IC par longueur de clé candidate
for n in [3..12]:
    ics = [ic(text[i::n]) for i in range(n)]
    print(f"n={n} : IC moyen = {moyenne}")
# Le pic d'IC révèle la longueur de clé
```

**Lecture sécurité**
- **Risque :** Même sans connaître la longueur de clé, un attaquant disposant
  de plusieurs textes chiffrés avec la même clé peut la reconstituer.
- **Enjeu :** Non-réutilisation de clé (Key Reuse): une clé symétrique
  ne doit jamais chiffrer deux messages distincts.

---

## 6. Générateur pseudo-aléatoire faible (LFSR) & stream cipher

**Niveaux concernés : 6 → 7**

- Stream cipher : chiffrement XOR octet par octet avec un flux de clé
- LFSR (Linear Feedback Shift Register) 8 bits : périodique, prévisible
- Attaque par plaintext connu : chiffrer un texte contrôlé révèle le keystream
- Le keystream se répète → récupération par analyse hexadécimale

**Pointers**
```bash
hexdump -C fichier_chiffre    # visualiser les patterns dans le flux
# Chiffrer un plaintext connu pour extraire le keystream
# XOR(ciphertext, plaintext_connu) = keystream
# Appliquer le keystream au ciphertext cible
```

**Lecture sécurité**
- **Risque :** Un PRNG (générateur pseudo-aléatoire) de faible entropie
  est prévisible: le keystream peut être reconstruit (CWE-338).
- **Enjeu :** Les PRNG cryptographiques (CSPRNG) sont obligatoires en
  production. Auditeurs : vérifier l'origine et la qualité de l'aléa utilisé.

---

## Synthèse

**Patterns clés acquis :**
- Distinguer encodage, obfuscation et chiffrement réel.
- L'analyse statistique casse tout chiffrement à clé courte ou répétée.
- La longueur et la non-réutilisation de la clé sont les deux critères
  fondamentaux d'un chiffrement robuste.
- Un PRNG faible compromet l'ensemble du système cryptographique.
- Plus le texte chiffré disponible est long, plus l'attaque est facile.

**Positionnement**

Ces exercices sont abordés comme un terrain d'entraînement pour :
- Comprendre les failles des implémentations cryptographiques réelles.
- Identifier les mauvaises pratiques lors d'un audit (clé réutilisée,
  PRNG faible, algorithme obsolète).
- Renforcer une approche GRC pragmatique : savoir poser les bonnes
  questions sur les choix cryptographiques d'une organisation.

**N.b. :**
- Pas de solutions ni de mots de passe divulgués.
- Approche méthodologique uniquement.
- Environnement d'apprentissage contrôlé.

---

## License

Original analysis © Solène Figueiredo.

Licensed under **CC BY 4.0**.

Challenge names and any third-party intellectual property remain the property of their respective owners.