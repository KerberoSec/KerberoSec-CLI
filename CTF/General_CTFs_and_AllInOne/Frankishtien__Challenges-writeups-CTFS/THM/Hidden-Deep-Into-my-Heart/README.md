# TryHackMe Hidden Deep Into my Heart Writeup

---

## Nmap Scan 

```
nmap -sCV -Pn 10.67.161.192
```

<img width="1324" height="448" alt="image" src="https://github.com/user-attachments/assets/6a6e0156-6560-46ba-a3bc-767b836862a6" />

## i found secret path in robots.txt

<img width="885" height="160" alt="image" src="https://github.com/user-attachments/assets/cd72964c-aa61-43af-a77a-5d1fc1ed4659" />

```
User-agent: *
Disallow: /cupids_secret_vault/*

# cupid_arrow_2026!!!
```

### let's visit it 

```
http://10.67.161.192:5000/cupids_secret_vault/
```

<img width="1192" height="604" alt="image" src="https://github.com/user-attachments/assets/db78a4f6-aaec-480e-8f86-3c9d994e89a7" />

## gobuster 

```
gobuster dir -w /usr/share/wordlists/dirb/common.txt -u http://10.67.161.192:5000/cupids_secret_vault/
```

<img width="1416" height="500" alt="image" src="https://github.com/user-attachments/assets/f851e9dc-a557-4ee5-a7cd-2873c7ed0c8c" />

```
http://10.67.161.192:5000/cupids_secret_vault/administrator
```

## found login page

<img width="908" height="707" alt="image" src="https://github.com/user-attachments/assets/28cf3f7d-1b22-49da-ad3f-283c58959fba" />

## let's try **`cupid_arrow_2026!!!`** that we found in robots.txt as password to administrator

```
administrator : cupid_arrow_2026!!!
```

<img width="721" height="516" alt="image" src="https://github.com/user-attachments/assets/29383608-748a-4369-ba30-bf8522486753" />

## i tried admin and it work boom

```
admin : cupid_arrow_2026!!!
```

<img width="1069" height="560" alt="image" src="https://github.com/user-attachments/assets/3bf0102e-97e1-45f7-9eea-af077c071f90" />

