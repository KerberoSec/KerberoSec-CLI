# Bandit Level 6

> The password for the next level is stored **somewhere on the server** and has all of the following properties:
	owned by user bandit7
	owned by group bandit6
	33 bytes in size

## Login

```shell
ssh bandit6@bandit.labs.overthewire.org -p 2220

HWasnPhtq9AVKe0dmk45nxy20cvUa6EG
```

## Solution

```shell
find / -type f -user "bandit7" -group "bandit6" -size 33c 2>/dev/null
```

```shell
cat /var/lib/dpkg/info/bandit7.password
```

```text
morbNTDkSW6jIlUc0ymOdMaLnOlFVAaj
```

