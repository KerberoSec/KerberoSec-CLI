# Bandit Level 11

> The password for the next level is stored in the file **data.txt**, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions

## Login

```shell
ssh bandit11@bandit.labs.overthewire.org -p 2220

dtR173fZKb0RRsDFSGsg2RWnpNVj3qRr
```

## Solution

```shell
cat data.txt | tr "A-Za-z" "N-ZA-Mn-za-m"
```

```text
7x16WNeHIi5YkIhWsfFIqoognUTyj9Q4
```

