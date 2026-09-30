## HTTP: Open redirect
We got a simple website where we can simply go to facebook, twitter or so on. The challenge is to make the website redirect to any other website rather than the given option.
<img width="909" height="257" alt="image" src="https://github.com/user-attachments/assets/c97aa60d-3440-4aa5-b70c-efb125191602" />

As usual, I started to check the `source code` and just look for `request` and `response` over BURP 
<img width="1000" height="528" alt="image" src="https://github.com/user-attachments/assets/89cec756-bd71-4090-bfa5-09cfdc0776b0" />

Let's make some changes over the request and try to redirect to `evil.com` instead.

<img width="1057" height="488" alt="image" src="https://github.com/user-attachments/assets/cd523e41-ca37-47e4-b520-a940f736e0b2" />

Well, interesting,the redirection is primarily checking for the hash and if its incorrect, the redirection gets failed. These are the hash and its respective site for the redirection.

<img width="701" height="140" alt="image" src="https://github.com/user-attachments/assets/3861bf2d-e6cb-4d66-9897-2530fc0ca034" />

Looks like `MD5` but let's check it from https://hashes.com/en/tools/hash_identifier 

<img width="753" height="154" alt="image" src="https://github.com/user-attachments/assets/0c082ed1-7d47-4ec8-a5e7-1bb9e5f13061" />

I got the logic. Let's reverse it 
<img width="1098" height="231" alt="image" src="https://github.com/user-attachments/assets/17a07bff-d882-4e6d-b464-c96e8f138a20" />

Okay, everything crystle clear. 
```bash
echo -n "https://evil.com" | md5sum
-> 7a1eb5272a0de83226e7a50d14334056
```
Wallah, we got the flag.

<img width="1031" height="543" alt="image" src="https://github.com/user-attachments/assets/532f1e1c-c7a7-4a01-bc36-993f377ba74c" />

## Resource used: 
* https://hashes.com/en/tools/hash_identifier
* https://askubuntu.com/questions/53846/how-to-get-the-md5-hash-of-a-string-directly-in-the-terminal

