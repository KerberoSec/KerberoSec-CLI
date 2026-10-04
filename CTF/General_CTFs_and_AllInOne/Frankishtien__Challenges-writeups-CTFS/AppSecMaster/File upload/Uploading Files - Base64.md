
```python
@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        payload = request.get_json()

        if not payload or "filename" not in payload or "content" not in payload:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Both filename and content are required",
                    }
                ),
                400,
            )

        filename = payload["filename"]
        base64_content = payload["content"]

        decoded_content = base64.b64decode(base64_content)

```

## so it require

- **`post`** method 

<img width="1408" height="461" alt="image" src="https://github.com/user-attachments/assets/912ed5e2-5ac2-4bc8-b0f2-b967e05facfb" />

```json
{"error":"415 Unsupported Media Type: Did not attempt to load JSON data because the request Content-Type was not 'application/json'.","success":false}
```

## change content type to **`application/json`**

<img width="1411" height="566" alt="image" src="https://github.com/user-attachments/assets/71abf281-df7c-4a41-8ab6-3f458af548d4" />

## now we need to put json in request body based on :

```python
 if not payload or "filename" not in payload or "content" not in payload:
```

```json
{
  "filename":"test.txt",
  "content":"hello"
}
```

## **`but response say`**

```json
{"error":"Invalid base64-encoded string: number of data characters (5) cannot be 1 more than a multiple of 4","success":false}
```

## encode content to base64 and send

```json
{
  "filename":"test.txt",
  "content":"aGVsbG8="
}
```

### ``response``

```json
{
  "masterKey":"89142f710cc5a3648d435c33572243e7\n",
  "message":"File uploaded successfully",
  "path":"/app/uploads/test.txt","success":true
}
```

<img width="1391" height="624" alt="image" src="https://github.com/user-attachments/assets/f9440a5f-8e8c-49d0-93cb-17fad4c728f5" />

```
89142f710cc5a3648d435c33572243e7
```

