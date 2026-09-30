# Cookie Collector: Writeup

## Challenge Description
The web application provides the following hint:

> *"Inspect the page carefully: there might be something hidden for you."*

A link to a hidden endpoint is present:

```
/hidden
```

---

## Initial Recon

Accessing the endpoint without parameters:

```
GET /hidden
```

Response:

```
Hi hacker, the server expects a 'token' to give you the pass 😉
```

This indicates that a **token** is required.

---

## Cookie Analysis

Visiting the root page (`/`) reveals that the server sets a cookie:

```
Set-Cookie: token=54686973206973206120736563726574
```

The value appears to be **hex-encoded**.

---

## Decoding the Token

Decode the hex value:

```bash
echo 54686973206973206120736563726574 | xxd -r -p
```

Output:

```
This is a secret
```

So the application provides a hidden secret via encoding.

---

## Understanding the Logic

Behavior observed:

- No `token` → server asks for it  
- `?token=...` → server compares it with something  
- Cookie alone → not sufficient  

This suggests the backend likely performs a comparison between:

- the **cookie value**
- the **GET parameter**

Equivalent logic:

```python
if request.cookies.get("token") == request.args.get("token"):
    return flag
```

---

## Important Detail: URL Encoding

The value contains spaces:

```
This is a secret
```

When passed in a URL, spaces must be encoded:

```
This%20is%20a%20secret
```

---

## Exploitation

Send both:
- the cookie (`token=This is a secret`)
- the GET parameter (`token=This%20is%20a%20secret`)

```bash
curl -s -H 'Cookie: token=This is a secret' \
'http://labs.ecowasctf.com.gh:5002/hidden?token=This%20is%20a%20secret'
```

---

## Flag

```
EcowasCTF{c00kie_c0llect0r_m@st3R>!}
```

---

## Key Takeaways

- Cookies can store hidden or encoded data
- Hex encoding is commonly used to obfuscate values
- Some applications validate multiple inputs together (cookie + parameter)
- Proper URL encoding is critical when dealing with special characters
- Using `curl -H` allows precise control over HTTP headers
