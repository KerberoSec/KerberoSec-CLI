- a web application is that it is a program running on a remote server
- a server refers to a computer system running continuously to “serve” the clients.
- products database
- customer database
- sales database

#### Example

buy item from website:
1. log into website   [hacker can try many passwords]
2. search for product  [hacker can breach system + items]
3. add product to cart
4. specify shipping location
5. provide payment details  [hacker cracks weak encryption]

## ID & Authentication Failure

- Identification refers to the ability to identify a user uniquely
- authentication refers to the ability to prove that the user is whom they claim to be.
- authentication has some weaknesses = [allowing brute force for passwords, allowing weak passwords, storing passwords in plain text]

## Broken Access Control

Access control ensures that each user can only access files (documents, images, etc.) related to their role or work.

vulnerabilities:
- failing to authenticate `principle of the least privilege` and giving users more access permissions than they need. (see prices not change them)
- being able to view or modify another user account
- being able to browse pages that require authentication as unauth user

## Injection

An injection attack refers to a vulnerability in the web application where the user can insert malicious code as part of their input. One cause of this vulnerability is the lack of proper validation and sanitization of the user’s input.

## Cryptographic Failures

Cryptography focuses on the processes of encryption and decryption of data.
- unencrypted data in HTTP
- weak encryption algorithm (caesar shift)

## IDOR

investigate a vulnerable website that uses Insecure Direct Object References (IDOR).
- IDOR {Broken Access Control}
- a web server receives user-supplied input to retrieve objects (files, data, documents) and that they are numbered sequentially

Lab
```
# user has access to image: `IMG_1003.jpg`
# guess there is 1002.jpg and 1004.jpg

# example: `https:/store.tryhackme.thm/products/product?id=52`

# hacker would try 51 or 53
```

