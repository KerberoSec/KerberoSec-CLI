# Level 5 ->6

# Descripción
The password for the next level is stored in a file somewhere under the **inhere** directory and has all of the following properties:

-   human-readable
-   1033 bytes in size
-   not executable

# Datos de acceso
bandit5
lrIWWI6bB37kxfiCQZqUdOIYfr6eEeqR
# Solución
```bash
bandit5@bandit:~$ cd inhere/
bandit5@bandit:~/inhere$ find -readable -size 1033 -type f
bandit5@bandit:~/inhere$ ls
maybehere00  maybehere02  maybehere04  maybehere06  maybehere08  maybehere10  maybehere12  maybehere14  maybehere16  maybehere18
maybehere01  maybehere03  maybehere05  maybehere07  maybehere09  maybehere11  maybehere13  maybehere15  maybehere17  maybehere19
bandit5@bandit:~/inhere$ find -readable -size 1033c -type f
./maybehere07/.file2
bandit5@bandit:~/inhere$ cat maybehere07/
-file1        .file1        -file2        .file2        -file3        .file3        spaces file1  spaces file2  spaces file3
bandit5@bandit:~/inhere$ cat maybehere07/.file2
P4L4vucdmLnm8I7Vl7jG1ApGSfjYKqJU

```
# Comentarios

|comando|desc|
|-------|-----------|
|find| Nos ayuda a encontrar archivos segun sus caracteristicas|
|-readable| archivo legible|
|-size|especificar el tamaño|
|-type| especificar el tipo|

# Referencias