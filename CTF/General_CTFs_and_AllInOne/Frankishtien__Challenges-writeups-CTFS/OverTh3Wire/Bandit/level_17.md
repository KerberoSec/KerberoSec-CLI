# level 17 

> ### There are 2 files in the homedirectory: passwords.old and passwords.new. The password for the next level is in passwords.new and is the only line that has been changed between passwords.old and passwords.new

```
ssh bandit16@bandit.labs.overthewire.org -p 2220 
```

```
diff passwords.old passwords.new
```

```
42c42
< pGozC8kOHLkBMOaL0ICPvLV1IjQ5F1VA
---
> x2gLTTjFwMOhQ8oWNbMN362QKxfRqGlO
```

<img width="777" height="156" alt="image" src="https://github.com/user-attachments/assets/9112ca2f-f687-43a3-83a7-71058c5d792d" />

```
x2gLTTjFwMOhQ8oWNbMN362QKxfRqGlO
```

