```python
if request.method == 'POST':
        filename = request.form.get('filename')
        if re.match(r'^[a-zA-Z0-9]+\.(jpg|jpeg)', filename):
            # 
            #
            # pseudo code for uploading the file
            #
            #
            if filename.endswith('.jpg') or filename.endswith('.jpeg'):
                message = "File Uploaded Successfully"
            else:
                with open('/tmp/masterkey.txt', 'r') as f:
                    masterkey = f.read()
        else:
            message = "Invalid filename. Only JPEG files are allowed."
```

```
if re.match(r'^[a-zA-Z0-9]+\.(jpg|jpeg)', filename):
```

## so regex is **`^[a-zA-Z0-9]+\.(jpg|jpeg)`**

- **`^`** : start with
- **`[a-zA-Z0-9]`** : any letters and numbers
- **`+`** : It means one or more letters/numbers.
- **`\.`** : The \. It literally means a dot (not any letter).
- **`(jpg|jpeg)`** : Choose between:
   - jpg
   - jpeg
- This means that the extension must be one of these two only.

<img width="1234" height="163" alt="image" src="https://github.com/user-attachments/assets/1255a6e5-8a32-4a2c-8cda-57282ba05534" />

> ### but in challenge it must be **`.php`** file

try:

```
file.jpg.php
```

<img width="706" height="537" alt="image" src="https://github.com/user-attachments/assets/2c903129-349e-4e41-8b9c-61123836bd96" />

```
ASM{r3g3x_1s_tr1cky_w1th0ut_d0ll4r_s1gn}
```

