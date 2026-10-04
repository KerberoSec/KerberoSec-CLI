# Bandit Level 5

> The password for the next level is stored in a file somewhere under the **inhere** directory and has all of the following properties:
	human-readable
	1033 bytes in size
	not executable

## Login

```shell
ssh bandit5@bandit.labs.overthewire.org -p 2220

4oQYVPkxZOOEOO5pTW81FB8j8lxXGUQw
```

## Solution

```shell
cd inhere
```

```shell
find . -type f -readable -not -executable -size 1033c
```

```shell
cat ./maybehere07/.file2
```

```text
HWasnPhtq9AVKe0dmk45nxy20cvUa6EG
```

