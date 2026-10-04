# JWT: Weak secret

Well as name suggest, we need to crack the given jwt `secret` and use the secret key to generate a token for `admin` and access the password to validate the challenge.

<img alt="image" src="https://github.com/user-attachments/assets/63b128ac-ba14-4777-b85e-6156b9cb6ec5" />

`/token`

```bash
curl http://challenge01.root-me.org/web-serveur/ch59/token
```
```jq
{"Here is your token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiZ3Vlc3QifQ.4kBPNf7Y6BrtP-Y3A-vQXPY9jAh_d0E6L4IUjL65CvmEjgdTZyr2ag-TM-glH6EYKGgO3dBYbhblaPQsbeClcw"}
```

As we don't know the secret for the token, we are unable to modify it, Let's try to crack the secret.

<img alt="key" src="https://github.com/user-attachments/assets/93242903-af08-49be-a9f8-bc71e4818dce" />

We got the secret i.e `lol`, Let's generate a new key from https://jwt.io and use the jwt to access `/admin` 
```jq
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiYWRtaW4ifQ.y9GHxQbH70x_S8F_VPAjra_S-CcMpYljN190KcV1qV6qLFTNrvg4Gwyv29OCjAWA
Incomplete token;
```
wallah!!

<img alt="image" src="https://github.com/user-attachments/assets/ad7aeb66-9e72-42ca-ad5d-a744d12e6071" />

## Resources used 
*  https://jwt.io
*  https://github.com/AresS31/jwtcat
