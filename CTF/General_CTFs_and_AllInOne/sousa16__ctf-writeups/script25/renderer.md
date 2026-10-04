Write-up:

1. We are given some files, including an `app.py`.
Analyzing it, we see we can upload a file in one of these formats: 'jpg','jpeg','png','svg'.
The file is saved using a hash as filename: <br>

    ```python
    filename = file.filename
    hash = sha256(os.urandom(32)).hexdigest()
    filepath = f'./static/uploads/{hash}.{filename.split(".")[1]}'
    file.save(filepath)
    ```
    <br>

2. We can see by the code that visiting `/developer` for the first time sets
`secret_cookie.txt` to a hash value: <br>

    ```python
    c = open('./static/uploads/secrets/secret_cookie.txt','w')
    c.write(sha256(os.urandom(16)).hexdigest())
    ```

    Opening this file shows us the hash.

3. Before making a new request to `/developer`, we set `developer_secret_cookie` to this hash.
This shows us the flag: `scriptCTF{my_c00k135_4r3_n0t_s4f3!_9b3b3454ed84}`
