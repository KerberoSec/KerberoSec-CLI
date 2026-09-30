# Encrypted Database

---

> ### The company hired an inexperienced developer, but he told them he hided the database and have it encrypted so the website is totally secure, can you prove that he is wrong ??

### found in source code :

```
/admin/assets/app.js
```

### now try to access 

```
/admin/
```

<img width="1459" height="596" alt="image" src="https://github.com/user-attachments/assets/c8f19185-26fc-43b2-a05b-09bccbe330f5" />

### catch the request 

<img width="1636" height="553" alt="image" src="https://github.com/user-attachments/assets/0b294def-4447-4e9e-9858-761b248d18f3" />

## found

```
secret-database%2Fdb.json
```

### now open :

```
/admin/secret-database%2Fdb.json
```

<img width="1404" height="250" alt="image" src="https://github.com/user-attachments/assets/e68e5eca-056a-49ec-884b-552bdd254507" />

```
flag	"ab003765f3424bf8e2c8d1d69762d72c"
```

<img width="1395" height="459" alt="image" src="https://github.com/user-attachments/assets/d8b8f604-f1ae-4a25-88c8-9acf17b2ac39" />

```
badboy
```

