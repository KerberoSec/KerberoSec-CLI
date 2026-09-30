## JaWT Scratchpad

[Link to challenge](https://play.picoctf.org/practice/challenge/25)

Write-up:

1. The challenge name refers to JSON Web Tokens. There's also a link in the web application to [John The Ripper](https://github.com/openwall/john).

2. According to the instructions, we probably need to login as admin. After 
attempting to login as `admin` and another regular username (like `abc`), we notice
that when the login is successful, the request contains a JWT (saved in `jwt.txt`).

3. Using a JWT decoder, we get the following:

    ### Header
    ```json
    {
    "typ": "JWT",
    "alg": "HS256"
    }
    ```

    ### Payload
    ```json
    {
    "user": "a"
    }
    ```

4. We now know the token uses the HS256 algorithm. If the secret key is weak, an
attacker can forge a valid token. Since the web application has a reference to
John The Ripper, we can search how to crack the secret key using it. Running 
`john jwt.txt --format=HMAC-SHA256 --wordlist=rockyou.txt` gets us the secret 
key: `ilovepico`

5. THis [tool](https://www.jwt.io/) allows us to craft a JWT for the `admin` user: 
`eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.gtqDl4jVDvNbEe_JYEZTN19Vx6X9NNZtRVbKPBkhO-s`. 
Setting the `jwt` cookie to this payload gets us the flag: **picoCTF{jawt_was_just_what_you_thought_f859ab2f}**