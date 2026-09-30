# level 13 

```
ssh bandit13@bandit.labs.overthewire.org -p 2220
```

<img width="1006" height="651" alt="image" src="https://github.com/user-attachments/assets/4f03bb78-79ce-436b-a280-1b013c492d96" />

```
nano private.pem
chmod 600 private.pem
ssh -i private.pem bandit14@bandit.labs.overthewire.org -p 2220
```

<img width="1213" height="210" alt="image" src="https://github.com/user-attachments/assets/7be6b6be-0c74-4f47-af6e-3d352f4b50ef" />

```
cd /etc/bandit_pass/
find . -type f -user bandit14
```

```
MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS
```

