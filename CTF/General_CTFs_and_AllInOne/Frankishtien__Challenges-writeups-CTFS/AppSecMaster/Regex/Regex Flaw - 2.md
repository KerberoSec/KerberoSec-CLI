
```python
 if request.method == 'POST':
        url = request.form.get('url')
        pattern = r'^https:\/\/.*appsecmaster\.net$'

        if url and re.match(pattern, url):
            hostname = urlparse(url).hostname
            
            if hostname == 'evil.com':
                message = "URL Hit Successfully"
                with open('/tmp/masterkey.txt', 'r') as f:
                    masterkey = f.read()
            else:
                message = "URL Hit Successfully"

        else:
            message = "Invalid URL. Must contain a whitelisted domain." 
```

```python
pattern = r'^https:\/\/.*appsecmaster\.net$'
```

### so regex is **`^https:\/\/.*appsecmaster\.net$`**

- **`^https:\/\/`** : it must start with`https://`
- **`.`** It means any character (except a newline).
- **`*`** It means zero or more letters.
- This means that any text is allowed here after ``https://`` and before the word ``appsecmaster.net``
- **`appsecmaster\.net$`** : that is mean it must end with `appsecmaster.net`

### but in challenge say 

<img width="891" height="200" alt="image" src="https://github.com/user-attachments/assets/33cc5a4d-19c4-45c7-a77f-59634e7b12d3" />

#### let's try 

```
https://evil.com/.appsecmaster.net
```

<img width="734" height="597" alt="image" src="https://github.com/user-attachments/assets/c06cf798-7c82-4282-b190-6e61b7fb1d4d" />

```
ASM{even-one-character-can-make-the-difference}
```

