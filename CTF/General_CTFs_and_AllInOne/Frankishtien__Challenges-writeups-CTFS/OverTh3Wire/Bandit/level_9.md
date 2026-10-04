# level 9 

```
ssh bandit9@bandit.labs.overthewire.org -p 2220
```

> ## The password for the next level is stored in the file data.txt in one of the few human-readable strings, preceded by several ‘=’ characters.

```
strings data.txt
```

<img width="949" height="270" alt="image" src="https://github.com/user-attachments/assets/6bbe57e5-da23-415b-b96c-dd6c01154957" />

```
strings data.txt | grep -E '^=+'
```

<img width="589" height="141" alt="image" src="https://github.com/user-attachments/assets/fd3cc45b-dfbd-41cc-9e51-7d4c67bf7e96" />

```
FGUW5ilLVJrxX9kMYMmlN4MgbpfMiqey
```

