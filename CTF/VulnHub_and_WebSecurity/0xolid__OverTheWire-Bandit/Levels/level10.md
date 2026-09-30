s# Bandit Level 10

> The password for the next level is stored in the file **data.txt**, which contains base64 encoded data

## Login

```shell
ssh bandit10@bandit.labs.overthewire.org -p 2220

FGUW5ilLVJrxX9kMYMmlN4MgbpfMiqey
```

## Solution

```shell
base64 -d data.txt 
```

```text
dtR173fZKb0RRsDFSGsg2RWnpNVj3qRr
```

