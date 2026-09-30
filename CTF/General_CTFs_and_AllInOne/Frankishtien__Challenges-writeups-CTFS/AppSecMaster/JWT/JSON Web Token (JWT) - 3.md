```python

```

<img width="1488" height="719" alt="image" src="https://github.com/user-attachments/assets/cf7ac843-9a9c-442e-936e-fd7c7528b46b" />

```http
POST /login HTTP/1.1
Host: 108.130.16.74
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Content-Type: application/json
Content-Length: 56

{
   "username":"alice",
   "password": "password1"
}
```

```json
{
    "token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsaWNlIiwiaXNBZG1pbiI6ZmFsc2UsImV4cCI6MTc1ODIwMTg3Mn0.nzNfTRnCQz2PhtS18vwDvFEjpnNdDRowwmueOmLvlbDy8CS2PMnArGrRDUFaE3_MPaP14h0xDULMmFu5e1-mV1qI2izASmUUvw3FevNNrfQje5nJG6dKBxywMj1ZbI24ZCwS0iSLZcPwzO1SestmTnM91LgjSnLJSMUwdbG3EAmzbx8P1nAcvAr54vMT1AO8r10v7WZFEz5SLHEn2VeBAaM1y3nrMH3B1gFABjsbnXL60jThY_VhIkFC_G1PGeupyngUjwLQQFy4Zn-UUuxxnrRhu7uuVOG1g_-ECh0fsKEASl7T6sBSU5oIkxH53JEHWbjMmfGHOqLlppxKfndOOw"
}

```

<img width="1407" height="704" alt="image" src="https://github.com/user-attachments/assets/b1337e44-e180-4ce3-8fda-dc057efd6502" />

```
http://108.130.16.74/.well-known/jwks.json
```

```json
{
  "keys": [
    {
      "alg": "RS256",
      "e": "AQAB",
      "kty": "RSA",
      "n": "xECMI4Cjh_loayMujDAXF3uRXOjcvuvjMQqWWXdyZospe-o09S8BKpk-LfIfhz5Pr2jCAEdlIoPenAQtV8Ole_2Li4DJ2CMBZJNEeWGt71_kC7a2p6o7_OulLIPe8ax1e5BvCwgMLyQTlaLmul4Y57aDWuuFCp53P4NkUE7oCunkRHrwvoyMPKxIuxhiW-TZaAo--9Vd-D52xvfRAs5OuiEJGo-kts2XWbotM9B3eEmNilsBtAF57XV9qMDMEAKjbVDK3QEecTtLLp2bU5mgisrKTYBoVjG9bIUiEjxxg2cA5lScR4MXq1ipJiWJD1zcwFIhPdatJRjFRy8U-Tq4_Q",
      "use": "sig"
    }
  ]
}
```

### first genrate **`rsa key`** and put the public key in it then save it as `PEM` format

<img width="1275" height="736" alt="image" src="https://github.com/user-attachments/assets/d25d59e3-4e7d-4dc6-9747-13baf7d6b1f7" />

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxECMI4Cjh/loayMujDAX
F3uRXOjcvuvjMQqWWXdyZospe+o09S8BKpk+LfIfhz5Pr2jCAEdlIoPenAQtV8Ol
e/2Li4DJ2CMBZJNEeWGt71/kC7a2p6o7/OulLIPe8ax1e5BvCwgMLyQTlaLmul4Y
57aDWuuFCp53P4NkUE7oCunkRHrwvoyMPKxIuxhiW+TZaAo++9Vd+D52xvfRAs5O
uiEJGo+kts2XWbotM9B3eEmNilsBtAF57XV9qMDMEAKjbVDK3QEecTtLLp2bU5mg
isrKTYBoVjG9bIUiEjxxg2cA5lScR4MXq1ipJiWJD1zcwFIhPdatJRjFRy8U+Tq4
/QIDAQAB
-----END PUBLIC KEY-----
```

