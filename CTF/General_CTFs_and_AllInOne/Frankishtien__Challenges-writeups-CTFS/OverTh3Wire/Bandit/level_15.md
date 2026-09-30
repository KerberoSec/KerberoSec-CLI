# level 15

```
ssh bandit15@bandit.labs.overthewire.org -p 2220
```

> ### The password for the next level can be retrieved by submitting the password of the current level to port 30001 on localhost using SSL/TLS encryption.

### current pass

```
8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo
```

Almost the same idea as Level 14, **but the important difference** is that the connection must be **SSL/TLS encrypted**.

Meaning:

- `nc` ❌ It will not work

- You must use **openssl**

```
openssl s_client -connect localhost:30001
```

<img width="1290" height="762" alt="image" src="https://github.com/user-attachments/assets/96547f52-6f39-4659-9a91-c7e16e9348f3" />

```
kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx
```

