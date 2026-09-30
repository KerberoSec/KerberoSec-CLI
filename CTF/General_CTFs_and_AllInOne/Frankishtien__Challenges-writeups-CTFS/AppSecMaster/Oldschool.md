# Oldschool

## first login after that i get session token

```
session_token=77646f5a4f3166637627abe998e7a1470fe72d8b430f067dafa86263f1f23f94
```

## i crack it with hashcat 

```
hashcat -m 1400 hash.txt /usr/share/wordlists/rockyou.txt
```

<img width="1087" height="357" alt="image" src="https://github.com/user-attachments/assets/ebb10f9c-c6e5-48e4-835f-e7edd08a1e3c" />

## so token it **`sha-256`** of username

<img width="1291" height="204" alt="image" src="https://github.com/user-attachments/assets/4569900d-ac62-431c-ad3f-d0354ec31b9d" />

```
8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
```

<img width="1667" height="431" alt="image" src="https://github.com/user-attachments/assets/ea574a33-2912-4803-b771-598ae5f5e9c5" />

