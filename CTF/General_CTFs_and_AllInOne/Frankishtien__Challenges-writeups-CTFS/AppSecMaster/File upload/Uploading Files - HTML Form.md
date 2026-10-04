

```python
app = Flask(__name__)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    content_type = request.content_type

    if not content_type:
        return jsonify({"error": "No Content-Type header found."}), 400

    if not content_type.startswith('multipart/form-data'):
        return jsonify({"error": "Invalid content type. Content type must be 'multipart/form-data'."}), 400

    if not request.files:
        return jsonify({"error": "No file part in the request."}), 400

    file = next(iter(request.files.values()))

    if file.filename == '':
        return jsonify({"error": "No file selected for upload."}), 400

    try:
        with open('/tmp/masterkey.txt', 'r') as file_obj:
            masterkey = file_obj.read().strip()
    except FileNotFoundError:
        masterkey = "Masterkey file not found."

    return jsonify({"message": f"Uploaded file: {file.filename}", "Masterkey": masterkey}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)
```

### so it's reqiure **`post`** method and **` multipart/form-data`** content type :

<img width="1208" height="475" alt="image" src="https://github.com/user-attachments/assets/dc7c3668-0c0d-497d-a96e-e8607a7762a4" />

### to add file part in request 

- edit content type to : **`Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryxYzAbC123456`**
- set request body 

```http
POST /api/upload HTTP/1.1
Host: 3.255.232.107
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryxYzAbC123456
Content-Length: 201

------WebKitFormBoundaryxYzAbC123456
Content-Disposition: form-data; name="file"; filename="hacked.txt"
Content-Type: text/plain

This is a test file content
------WebKitFormBoundaryxYzAbC123456--
```

<img width="1292" height="569" alt="image" src="https://github.com/user-attachments/assets/17950a4c-157f-439e-87f2-0e0f487518fb" />

## or using **`curl`**

```
curl -X POST http://3.255.232.107/api/upload -F "file=@C:\Users\Dell\Downloads\test.txt"
```

- **`-F`** : mean `multipart/form-data`

<img width="1285" height="127" alt="image" src="https://github.com/user-attachments/assets/15d8d2cf-10fb-46aa-9bd2-8503c436206c" />

```
54e9112f7196246d4fe8b6946deb1bba
```

