# Bandit Level 01 → Level 02

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-01-blue?style=flat-square)

The password for Level 2 is stored in a file named `-` located in the home directory.

### Accessing the Level

Login using the password retrieved from Level 0.

```bash
sshpass -p $(cat passwords/bandit/lvl01) ssh bandit1@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Listing the contents
Use `ls` to confirm the file exists in the current directory.

```bash
ls
```

#### 2. Reading the dash file
Because `-` is a reserved character for standard input/output in many shells, simply running `cat -` will not work. Access it using its relative path.

```bash
cat ./-
```

> [!IMPORTANT]
> When a filename starts with a hyphen `-`, many tools misinterpret it as an option. Prefixing with `./` clarifies that it is a file path.

#### 3. Storing the result
Copy the output and save it locally for the next level.

```bash
echo "PASSWORD" > passwords/bandit/lvl02
```

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `ls` |: | Lists files in the current working directory. |
| `cat` | `./-` | Displays the content of the file called `-`. |

> [!TIP]
> Another way to read this file is by using input redirection: `cat < -`. This forces the shell to treat the character as a file.

> [!CAUTION]
> Running `cat -` without the dash prefix will often force the terminal to wait for your input instead of reading the file. Press `Ctrl+C` to escape if this happens.
