```python
 if request.method == 'POST':
        url = request.form.get('url')
        pattern = r'^https:\/\/www.appsecmaster\.net$'

        if url and re.match(pattern, url):
            hostname = urlparse(url).hostname
            
            if hostname != 'www.appsecmaster.net':
                message = "URL Hit Successfully"
                with open('/tmp/masterkey.txt', 'r') as f:
                    masterkey = f.read()
            else:
                message = "URL Hit Successfully"

        else:
            message = "Invalid URL. Must contain a whitelisted domain." 

    return render_template('index.html', message=message, masterkey=masterkey)
```

```python
pattern = r'^https:\/\/www.appsecmaster\.net$'
```

## so the regex is **`^https:\/\/www.appsecmaster\.net$`**

- **`^https:\/\/www`** : it must start with `https://www`
- **`.`** : It means any character (except a newline).
- **`appsecmaster\.net$`** : it must end with `appsecmaster.net`

> the trick here is **`.`** we can Put one letter to get the master key but : 

<img width="915" height="241" alt="image" src="https://github.com/user-attachments/assets/afd34021-b492-4bda-8b6f-d1acf2b1c387" />

#### so let's try :

```
https://www\appsecmaster.net
```

<img width="689" height="634" alt="image" src="https://github.com/user-attachments/assets/dc514d80-3205-401e-b55c-dfff2a2ee506" />

```
ASM{3sc4p3-th3-d0ts-b3f0r3-t00-l4t3}
```

