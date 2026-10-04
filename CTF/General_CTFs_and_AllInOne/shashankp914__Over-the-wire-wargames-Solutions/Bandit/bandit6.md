***Login into Bandit6!***
```bash
ssh bandit6@bandit.labs.overthewire.org -p 2220
```
**Password:** P4L4vucdmLnm8I7Vl7jG1ApGSfjYKqJU
 
You have to find a path where the file stored having the following properties:
owned by user bandit7
owned by group bandit6
33 bytes in size

so, type the following command:
```bash
find / -user bandit7 -group bandit6 -size 33c | grep password
```
you'll get the address: /var/lib/dpkg/info/bandit7.password

Now, type the following command:
```bash
cat /var/lib/dpkg/info/bandit7.password
```
You'll get the password of level 7

**Password:** z7WtoNQU2XfjmMtWA8u5rN4vzqu4v99S

Now,

```bash
exit
```