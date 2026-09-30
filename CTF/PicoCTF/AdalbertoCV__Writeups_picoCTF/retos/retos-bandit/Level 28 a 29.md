# Level 28 -> 29

# Descripción
There is a git repository at `ssh://bandit28-git@localhost/home/bandit28-git/repo`. The password for the user `bandit28-git` is the same as for the user `bandit28`.

Clone the repository and find the password for the next level.

# Datos de acceso
bandit28
AVanL161y9rsbcJIsFHuw35rjaOM19nR
# Solución

```bash
bandit28@bandit:~$ mktemp -d
/tmp/tmp.kdj3QTAWYi
bandit28@bandit:~$ cd /tmp/tmp.kdj3QTAWYi
bandit28@bandit:/tmp/tmp.kdj3QTAWYi$

bandit28@bandit:/tmp/tmp.kdj3QTAWYi/repo$ git log
commit 104db85a904e9691ff22aafe1a96124c88f75afa (HEAD, origin/master, origin/HEAD, master)
Author: Morla Porla <morla@overthewire.org>
Date:   Tue Feb 21 22:03:10 2023 +0000

    fix info leak

commit 6c3c5e485cc531e5d52c321587ce1103833ab7c3
Author: Morla Porla <morla@overthewire.org>
Date:   Tue Feb 21 22:03:10 2023 +0000

    add missing data

commit cd3b97ef95879ec34df0d6c82f2a96d552f0e56c
Author: Ben Dover <noone@overthewire.org>
Date:   Tue Feb 21 22:03:10 2023 +0000

    initial commit of README.md
bandit28@bandit:/tmp/tmp.kdj3QTAWYi/repo$ git checkout 6c3c5e485cc531e5d52c321587ce1103833ab7c3
Previous HEAD position was 104db85 fix info leak
HEAD is now at 6c3c5e4 add missing data
bandit28@bandit:/tmp/tmp.kdj3QTAWYi/repo$ cat README.md
# Bandit Notes
Some notes for level29 of bandit.

## credentials

- username: bandit29
- password: tQKvmcwNYcFS6vmPHIUSI3ShmsrQZK8S

```

# Comentarios
|cmd| desc|
|-----|------|
|log| muestra los commits realizados previamente en el repositorio|
|checkout| revierte los cambios hechos por un commit|
