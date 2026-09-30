# False Order
|Category |Difficulty|
|:-------:|:--------:|
|  Cloud  |  Medium  |

**Skills learned:**
* AWS CLI

## Description
Caldrin Vowmark reaches an Ashguard checkpoint with a sealed order that tells Stormbound's soldiers to leave the east gate and report to Crownspire. The officer in charge believes the order came from Garran Voss, and he will move his soldiers as soon as the seal is checked. If they leave, Vaultrune can take the gate before help arrives. Caldrin knows Garran's orders carry small marks that copyists miss. He has to inspect the order, show the officer that it is false, and stop the unit from leaving before Vaultrune's soldiers reach the gate.

To Prove whether the order was replaced and identify who changed it, you have read-only investigator access to Cloudtrail trail `coalition-gate-audit-trail` and the versioned bucket `ashguard-order-custody`. Begin with `custody/east-gate-order.json`, then correlate its version history with the audit events.

## CLI Setup
1. Install AWS CLI if you have not already. Instructions can be found [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
2. Start the challenge's Docker container and use either `aws configure` or the provided `export` commands to use your assigned credentials.
3. Use the command `aws sts get-caller-identity` to confirm you have successfully configured the `gate-investigator` user.

## Initial Steps
Since we have already been told that there is a **CloudTrail** history and a versioned bucket, we can start looking at the [cloudtrail](https://docs.aws.amazon.com/cli/latest/reference/cloudtrail/#cloudtrail) and [s3api](https://docs.aws.amazon.com/cli/latest/reference/s3api/) CLI command references.

Using the command `aws s3api list-objects --bucket ashguard-order-custody` we can see all custody orders in the bucket, including:
```
{
    "Key": "custody/east-gate-order.json",
    "LastModified": "2026-07-25T18:32:28+00:00",
    "ETag": "\"1be261e8b6c7a5d1976fcbec93d62caa\"",
    "Size": 436,
    "StorageClass": "STANDARD"
},
```

We can **get** the east gate order using the command `aws s3api get-object --bucket ashguard-order-custody --key "custody/east-gate-order.json" EastGateOrder.json`, which saves a copy of file onto our local machine (named EastGateOrder.json). This command also tells us the file's version ID:
```
"VersionId": "23a2abea-48f8-4033-8f5e-85e370c20d42",
```

Printing the contents of the file `cat EastGateOrder.json`:
```
{
  "settlement_id": "EAST-GATE-C4R2",
  "season": "winter",
  "gate": "coalition-gate",
  "issuer": "Coalition Gate Authority",
  "issued_date": "2026-01-09",
  "total_units": 920,
  "custody_status": "RELEASED",
  "order_status": "RELEASED",
  "witness_line": "Gate release authorized per emergency writ WR-4412; witness attestation waived.",
  "ledger_hash": "sha256:4f8c2a91e0b7d3c6a5f1e9d8c7b6a5049382716f5e4d3c2b1a0f9e8d7c6b5a5"
}  
```

We can use S3 to list the contents of the bucket **ashguard-order-custody** and CloudTrail to list captured events `aws cloudtrail lookup-events --max-results [# RESULTS]` that can be examined further to answer the questions. **Hint: You'll need to query more than 50 events in order to have enough data to answer all of the questions.**

## Questions
These questions are to be answered during (and help guide) your investigation.

1. What was the last CloudTrail API action performed from the internal gatehouse IP immediately before the attacker session began?

In order to differentiate between the internal gatehouse session and the attacker's session, we need to look at the **sourceIPAddress** field of events. The internal gatehouse has an **private IP address** while the attacker **does not**. 

Looking at the sourceIPaddress fields, we can assume the internal gatehouse IP is: `10.41.53.22`. For every event from this IP, check the next sequential event to see if:
* The action is suspicious and/or
* The sourceIPAddress is not a private IP

The two relevant events are:
```
{
    "EventId": "481591fc-bbeb-4c4c-a91f-e46c3acf76f7",
    "EventName": "GetCallerIdentity",
    "ReadOnly": "true",
    "EventTime": "2026-07-25T11:33:24.710000-04:00",
    "EventSource": "sts.amazonaws.com",
    "Username": "seal-copyist-contractor",
    "Resources": [],
    "CloudTrailEvent": "{\"eventVersion\":\"1.11\",\"userIdentity\":{\"type\":\"IAMUser\",\"principalId\":\"AIDANOJOVGYO\",\"arn\":\"arn:aws:iam::638291047582:user/seal-copyist-contractor\",\"accountId\":\"638291047582\",\"accessKeyId\":\"AKIAYOXRPP27NOJOVGYO\",\"userName\":\"seal-copyist-contractor\"},\"eventTime\":\"2026-07-25T15:33:24.710Z\",\"eventSource\":\"sts.amazonaws.com\",\"eventName\":\"GetCallerIdentity\",\"awsRegion\":\"us-east-1\",\"sourceIPAddress\":\"198.18.44.91\",\"userAgent\":\"Boto3/1.29.7 md/Botocore#1.29.7 ua/2.0 os/linux#5.15.0-107-generic md/arch#x86_64 lang/python#3.10.12 md/pyimpl#CPython cfg/retry-mode#standard Botocore/1.29.7\",\"requestParameters\":{},\"responseElements\":null,\"readOnly\":true,\"eventType\":\"AwsApiCall\",\"managementEvent\":false,\"recipientAccountId\":\"638291047582\",\"eventID\":\"481591fc-bbeb-4c4c-a91f-e46c3acf76f7\"}"
},
{
    "EventId": "1f5f289e-8b50-43a3-9e81-ea06d983ce15",
    "EventName": "ListObjectsV2",
    "ReadOnly": "true",
    "EventTime": "2026-07-25T11:32:25.087000-04:00",
    "EventSource": "s3.amazonaws.com",
    "Username": "coalition-gate-clerk",
    "Resources": [],
    "CloudTrailEvent": "{\"eventVersion\":\"1.11\",\"userIdentity\":{\"type\":\"IAMUser\",\"principalId\":\"AIDAC6OSKDQM\",\"arn\":\"arn:aws:iam::638291047582:user/coalition-gate-clerk\",\"accountId\":\"638291047582\",\"accessKeyId\":\"AKIA1TQHJBLPC6OSKDQM\",\"userName\":\"coalition-gate-clerk\"},\"eventTime\":\"2026-07-25T15:32:25.087Z\",\"eventSource\":\"s3.amazonaws.com\",\"eventName\":\"ListObjectsV2\",\"awsRegion\":\"us-east-1\",\"sourceIPAddress\":\"10.41.53.22\",\"userAgent\":\"Boto3/1.34.0 md/Botocore#1.34.0 ua/2.0 os/linux#5.15.167.4-lts-hwe md/arch#x86_64 lang/python#3.11.9 md/pyimpl#CPython exec-env/EC2 cfg/retry-mode#standard Botocore/1.34.0\",\"requestParameters\":{\"bucketName\":\"ashguard-order-custody\",\"prefix\":\"custody/\",\"max-keys\":\"5\"},\"responseElements\":null,\"readOnly\":true,\"eventType\":\"AwsApiCall\",\"managementEvent\":false,\"recipientAccountId\":\"638291047582\",\"eventID\":\"1f5f289e-8b50-43a3-9e81-ea06d983ce15\"}"
},
```

The API action can be found in the **EventName** field: `"EventName": "ListObjectsV2",`.

**Answer: ListObjectsV2**

---

2. What was the first CloudTrail API action called from the attacker IP?

The events discovered in question 1 can help us answer this question also. The CloudTrail API action can be found in the **EventName** field. Answering this correctly also confirms the attacker's IP is: `73.134.114.213`.

**Answer: GetCallerIdentity**

---

3. Which S3 API action did the attacker attempt that was explicitly denied before assuming a role?

To answer this question, we need to search for events from the sourceIPAddress of `73.134.114.213` that were denied. For every matching event, we need to check for a consecutive event that tried to assume a new user role. 

The two relevant events are:
```
 {
    "EventId": "56c78c5e-d3f9-4e50-b745-fbf5ea7caabd",
    "EventName": "AssumeRole",
    "ReadOnly": "true",
    "EventTime": "2026-07-25T14:32:28.332000-04:00",
    "EventSource": "sts.amazonaws.com",
    "Username": "seal-copyist-contractor",
    "Resources": [
        {
            "ResourceType": "AWS::IAM::Role",
            "ResourceName": "arn:aws:iam::638291047582:role/ashguard-order-auditor"
        }
    ],
    "CloudTrailEvent": "{\"eventVersion\":\"1.08\",\"userIdentity\":{\"type\":\"IAMUser\",\"userName\":\"seal-copyist-contractor\",\"sessionContext\":{\"attributes\":{\"mfaAuthenticated\":\"false\",\"creationDate\":\"2026-07-25T18:32:28.332Z\"}},\"principalId\":\"AIDA68XK8A26ZNCPSEXK\",\"arn\":\"arn:aws:iam::638291047582:user/seal-copyist-contractor\",\"accountId\":\"638291047582\",\"accessKeyId\":\"AKIAYOXRPP27NOJOVGYO\"},\"eventTime\":\"2026-07-25T18:32:28.332Z\",\"eventSource\":\"sts.amazonaws.com\",\"eventName\":\"AssumeRole\",\"awsRegion\":\"us-east-1\",\"sourceIPAddress\":\"198.18.44.91\",\"userAgent\":\"Boto3/1.29.7 md/Botocore#1.29.7 ua/2.0 os/linux#5.15.0-107-generic md/arch#x86_64 lang/python#3.10.12 md/pyimpl#CPython cfg/retry-mode#standard Botocore/1.29.7\",\"additionalEventData\":{\"SignatureVersion\":\"AWS4-HMAC-SHA256\",\"AuthenticationMethod\":\"AuthHeader\"},\"requestParameters\":{\"path\":\"/\",\"roleArn\":\"arn:aws:iam::638291047582:role/ashguard-order-auditor\",\"roleSessionName\":\"coalition-gate-clerk\",\"action\":\"AssumeRole\"},\"responseElements\":null,\"requestID\":\"f392ce68-0385-4456-9771-08d4e5da2c84\",\"eventID\":\"56c78c5e-d3f9-4e50-b745-fbf5ea7caabd\",\"readOnly\":true,\"eventType\":\"AwsApiCall\",\"managementEvent\":true,\"eventCategory\":\"Management\",\"recipientAccountId\":\"638291047582\",\"resources\":[{\"ARN\":\"arn:aws:iam::638291047582:role/ashguard-order-auditor\",\"type\":\"AWS::IAM::Role\",\"accountId\":\"638291047582\"}],\"errorCode\":\"AccessDenied\",\"errorMessage\":\"User: arn:aws:iam::638291047582:user/seal-copyist-contractor is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::638291047582:role/ashguard-order-auditor\"}"
},
{
    "EventId": "ddcad781-785a-4323-b7dd-ea11174f20e4",
    "EventName": "GetObject",
    "ReadOnly": "true",
    "EventTime": "2026-07-25T14:32:28.290000-04:00",
    "EventSource": "s3.amazonaws.com",
    "Username": "seal-copyist-contractor",
    "Resources": [
        {
            "ResourceType": "AWS::S3::Object",
            "ResourceName": "arn:aws:s3:::ashguard-order-custody/custody/east-gate-order.json"
        },
        {
            "ResourceType": "AWS::S3::Bucket",
            "ResourceName": "arn:aws:s3:::ashguard-order-custody"
        }
    ],
    "CloudTrailEvent": "{\"eventVersion\":\"1.08\",\"userIdentity\":{\"type\":\"IAMUser\",\"userName\":\"seal-copyist-contractor\",\"sessionContext\":{\"attributes\":{\"mfaAuthenticated\":\"false\",\"creationDate\":\"2026-07-25T18:32:28.290Z\"}},\"principalId\":\"AIDA68XK8A26ZNCPSEXK\",\"arn\":\"arn:aws:iam::638291047582:user/seal-copyist-contractor\",\"accountId\":\"638291047582\",\"accessKeyId\":\"AKIAYOXRPP27NOJOVGYO\"},\"eventTime\":\"2026-07-25T18:32:28.290Z\",\"eventSource\":\"s3.amazonaws.com\",\"eventName\":\"GetObject\",\"awsRegion\":\"us-east-1\",\"sourceIPAddress\":\"198.18.44.91\",\"userAgent\":\"Boto3/1.29.7 md/Botocore#1.29.7 ua/2.0 os/linux#5.15.0-107-generic md/arch#x86_64 lang/python#3.10.12 md/pyimpl#CPython cfg/retry-mode#standard Botocore/1.29.7\",\"additionalEventData\":{\"SignatureVersion\":\"AWS4-HMAC-SHA256\",\"AuthenticationMethod\":\"AuthHeader\"},\"requestParameters\":{\"bucketName\":\"ashguard-order-custody\",\"key\":\"custody/east-gate-order.json\"},\"responseElements\":null,\"requestID\":\"1cdb1953-bf18-472b-9f6b-0986eb062f14\",\"eventID\":\"ddcad781-785a-4323-b7dd-ea11174f20e4\",\"readOnly\":true,\"eventType\":\"AwsApiCall\",\"managementEvent\":false,\"eventCategory\":\"Data\",\"recipientAccountId\":\"638291047582\",\"resources\":[{\"ARN\":\"arn:aws:s3:::ashguard-order-custody/custody/east-gate-order.json\",\"type\":\"AWS::S3::Object\",\"accountId\":\"638291047582\"},{\"ARN\":\"arn:aws:s3:::ashguard-order-custody\",\"type\":\"AWS::S3::Bucket\",\"accountId\":\"638291047582\"}],\"errorCode\":\"AccessDenied\",\"errorMessage\":\"User is not authorized to perform: s3:GetObject\"}"
},
```

The API action can be found in the **EventName** field: `"EventName": "GetObject",`.

**Answer: GetObject**

---

4. What is the full S3 path of the object that was tampered with? (format s3://bucket/key)

In this context, tampering may include editing the object or deleting it entirely. We can search for s3 'put' or 'delete' API actions in the events.

We find an event that deletes an object from an S3 bucket:
```
{
    "EventId": "fbb4e243-6537-4e6a-8805-f76069cfcfbd",
    "EventName": "DeleteObject",
    "ReadOnly": "false",
    "EventTime": "2026-07-25T14:32:28.794000-04:00",
    "EventSource": "s3.amazonaws.com",
    "Resources": [
        {
            "ResourceType": "AWS::S3::Object",
            "ResourceName": "arn:aws:s3:::ashguard-order-custody/custody/east-gate-order.json"
        },
        {
            "ResourceType": "AWS::S3::Bucket",
            "ResourceName": "arn:aws:s3:::ashguard-order-custody"
        }
    ],
    "CloudTrailEvent": "{\"eventVersion\":\"1.08\",\"userIdentity\":{\"type\":\"AssumedRole\",\"sessionContext\":{\"sessionIssuer\":{\"type\":\"Role\",\"principalId\":\"AROA638291047582ashguard-order-scanner\",\"arn\":\"arn:aws:iam::638291047582:role/ashguard-order-scanner\",\"accountId\":\"638291047582\",\"userName\":\"ashguard-order-scanner\"},\"attributes\":{\"creationDate\":\"2026-07-25T18:32:28.794Z\",\"mfaAuthenticated\":\"false\"}},\"principalId\":\"AROAM5UL0YKERNLJ4LNJ:coalition-gate-clerk\",\"arn\":\"arn:aws:sts::638291047582:assumed-role/ashguard-order-scanner/coalition-gate-clerk\",\"accountId\":\"638291047582\",\"accessKeyId\":\"ASIANYS99IQKET9LZMYM\"},\"eventTime\":\"2026-07-25T18:32:28.794Z\",\"eventSource\":\"s3.amazonaws.com\",\"eventName\":\"DeleteObject\",\"awsRegion\":\"us-east-1\",\"sourceIPAddress\":\"198.18.44.91\",\"userAgent\":\"Boto3/1.29.7 md/Botocore#1.29.7 ua/2.0 os/linux#5.15.0-107-generic md/arch#x86_64 lang/python#3.10.12 md/pyimpl#CPython cfg/retry-mode#standard Botocore/1.29.7\",\"additionalEventData\":{\"SignatureVersion\":\"AWS4-HMAC-SHA256\",\"AuthenticationMethod\":\"AuthHeader\"},\"requestParameters\":{\"bucketName\":\"ashguard-order-custody\",\"key\":\"custody/east-gate-order.json\"},\"responseElements\":{\"x-amz-version-id\":\"22679cd0-f56e-4d4c-9c9c-a241698278c7\",\"x-amz-delete-marker\":\"true\"},\"requestID\":\"fd320c5c-f02e-4b43-8e21-8485e7c65121\",\"eventID\":\"fbb4e243-6537-4e6a-8805-f76069cfcfbd\",\"readOnly\":false,\"eventType\":\"AwsApiCall\",\"managementEvent\":false,\"eventCategory\":\"Data\",\"recipientAccountId\":\"638291047582\",\"resources\":[{\"ARN\":\"arn:aws:s3:::ashguard-order-custody/custody/east-gate-order.json\",\"type\":\"AWS::S3::Object\",\"accountId\":\"638291047582\"},{\"ARN\":\"arn:aws:s3:::ashguard-order-custody\",\"type\":\"AWS::S3::Bucket\",\"accountId\":\"638291047582\"}]}"
},
```

Looking at the **ResourceName** field under the `"ResourceType": "AWS::S3::Object"`, we will find the //bucket/key that was tampered with: `"ResourceName": "arn:aws:s3:::ashguard-order-custody/custody/east-gate-order.json"`.

**Answer: s3://ashguard-order-custody/custody/east-gate-order.json**

---

5. Which IAM role was assumed for the destructive session? (ARN format)

In the DeleteObject event above (which is part of the destructive session), we can see this:
```
{\"type\":\"Role\",\"principalId\":\"AROA638291047582ashguard-order-scanner\",\"arn\":\"arn:aws:iam::638291047582:role/ashguard-order-scanner\",\"accountId\":\"638291047582\",\"userName\":\"ashguard-order-scanner\"}
```

The full IAM role is in the **arn** field.

**Answer: arn:aws:iam: 638291047582:role/ashguard-order-scanner**

---

6. What was the full STS principal ARN on the DeleteObject call?

We can continue examining the same **DeleteObject** event to find the full principal ARN. 

```
\"principalId\":\"AROAM5UL0YKERNLJ4LNJ:coalition-gate-clerk\",\"arn\":\"arn:aws:sts::638291047582:assumed-role/ashguard-order-scanner/coalition-gate-clerk\",
```

**Answer: arn:aws:sts: 638291047582:assumed-role/ashguard-order-scanner/coalition-gate-clerk**

---

7. From which IP address were the AssumeRole and destructive S3 calls performed?

We can find the IP address from these malicious events occurred from inside the **sourceIPAddress** field. Look at the events from questions 3 and 4 and find the value of this field: `\"sourceIPAddress\":\"198.18.44.91\"`

**Answer: 198.18.44.91**

---

8. Which IAM username owns the long-lived credentials used to call AssumeRole?

In the same `AssumeRole` event from question 3, we can find the username owning the credentials in the **Username** field: `"Username": "seal-copyist-contractor"`

**Answer: seal-copyist-contractor**

---

9. Which IAM role name did the attacker fail to assume before the successful AssumeRole? (role name only, not ARN)	

To find this answer, we need to look for `AssumeRole` events that resulted in an error. We find one relevant event:
```
{
    "EventId": "56c78c5e-d3f9-4e50-b745-fbf5ea7caabd",
    "EventName": "AssumeRole",
    "ReadOnly": "true",
    "EventTime": "2026-07-25T14:32:28.332000-04:00",
    "EventSource": "sts.amazonaws.com",
    "Username": "seal-copyist-contractor",
    "Resources": [
        {
            "ResourceType": "AWS::IAM::Role",
            "ResourceName": "arn:aws:iam::638291047582:role/ashguard-order-auditor"
        }
    ],
    "CloudTrailEvent": "{\"eventVersion\":\"1.08\",\"userIdentity\":{\"type\":\"IAMUser\",\"userName\":\"seal-copyist-contractor\",\"sessionContext\":{\"attributes\":{\"mfaAuthenticated\":\"false\",\"creationDate\":\"2026-07-25T18:32:28.332Z\"}},\"principalId\":\"AIDA68XK8A26ZNCPSEXK\",\"arn\":\"arn:aws:iam::638291047582:user/seal-copyist-contractor\",\"accountId\":\"638291047582\",\"accessKeyId\":\"AKIAYOXRPP27NOJOVGYO\"},\"eventTime\":\"2026-07-25T18:32:28.332Z\",\"eventSource\":\"sts.amazonaws.com\",\"eventName\":\"AssumeRole\",\"awsRegion\":\"us-east-1\",\"sourceIPAddress\":\"198.18.44.91\",\"userAgent\":\"Boto3/1.29.7 md/Botocore#1.29.7 ua/2.0 os/linux#5.15.0-107-generic md/arch#x86_64 lang/python#3.10.12 md/pyimpl#CPython cfg/retry-mode#standard Botocore/1.29.7\",\"additionalEventData\":{\"SignatureVersion\":\"AWS4-HMAC-SHA256\",\"AuthenticationMethod\":\"AuthHeader\"},\"requestParameters\":{\"path\":\"/\",\"roleArn\":\"arn:aws:iam::638291047582:role/ashguard-order-auditor\",\"roleSessionName\":\"coalition-gate-clerk\",\"action\":\"AssumeRole\"},\"responseElements\":null,\"requestID\":\"f392ce68-0385-4456-9771-08d4e5da2c84\",\"eventID\":\"56c78c5e-d3f9-4e50-b745-fbf5ea7caabd\",\"readOnly\":true,\"eventType\":\"AwsApiCall\",\"managementEvent\":true,\"eventCategory\":\"Management\",\"recipientAccountId\":\"638291047582\",\"resources\":[{\"ARN\":\"arn:aws:iam::638291047582:role/ashguard-order-auditor\",\"type\":\"AWS::IAM::Role\",\"accountId\":\"638291047582\"}],\"errorCode\":\"AccessDenied\",\"errorMessage\":\"User: arn:aws:iam::638291047582:user/seal-copyist-contractor is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::638291047582:role/ashguard-order-auditor\"}"
},
```

The IAM role name can be found in the **ResourceName** field: `"ResourceName": "arn:aws:iam::638291047582:role/ashguard-order-auditor"`.

**Answer: ashguard-order-auditor**

---

10. What roleSessionName was used on the successful AssumeRole into the scanner role?

To find the answer to this question, we must find the successful `AssumeRole` events, but we have to specifically look for the `AssumeRole` event where the **ResourceName** is: `"ResourceName": "arn:aws:iam::638291047582:role/ashguard-order-scanner"`.

The matching event is:
```
{
    "EventId": "de159d90-f08d-4eb4-b1a3-9d5cafe9f535",
    "EventName": "AssumeRole",
    "ReadOnly": "true",
    "EventTime": "2026-07-25T14:32:28.388000-04:00",
    "EventSource": "sts.amazonaws.com",
    "Username": "seal-copyist-contractor",
    "Resources": [
        {
            "ResourceType": "AWS::IAM::Role",
            "ResourceName": "arn:aws:iam::638291047582:role/ashguard-order-scanner"
        }
    ],
    "CloudTrailEvent": "{\"eventVersion\":\"1.08\",\"userIdentity\":{\"type\":\"IAMUser\",\"userName\":\"seal-copyist-contractor\",\"sessionContext\":{\"attributes\":{\"mfaAuthenticated\":\"false\",\"creationDate\":\"2026-07-25T18:32:28.388Z\"}},\"principalId\":\"AIDA68XK8A26ZNCPSEXK\",\"arn\":\"arn:aws:iam::638291047582:user/seal-copyist-contractor\",\"accountId\":\"638291047582\",\"accessKeyId\":\"AKIAYOXRPP27NOJOVGYO\"},\"eventTime\":\"2026-07-25T18:32:28.388Z\",\"eventSource\":\"sts.amazonaws.com\",\"eventName\":\"AssumeRole\",\"awsRegion\":\"us-east-1\",\"sourceIPAddress\":\"198.18.44.91\",\"userAgent\":\"Boto3/1.29.7 md/Botocore#1.29.7 ua/2.0 os/linux#5.15.0-107-generic md/arch#x86_64 lang/python#3.10.12 md/pyimpl#CPython cfg/retry-mode#standard Botocore/1.29.7\",\"additionalEventData\":{\"SignatureVersion\":\"AWS4-HMAC-SHA256\",\"AuthenticationMethod\":\"AuthHeader\"},\"requestParameters\":{\"path\":\"/\",\"roleArn\":\"arn:aws:iam::638291047582:role/ashguard-order-scanner\",\"roleSessionName\":\"coalition-gate-clerk\",\"action\":\"AssumeRole\"},\"responseElements\":{\"credentials\":{\"accessKeyId\":\"ASIANYS99IQKET9LZMYM\",\"expiration\":\"2026-07-25T19:32:28.391906018Z\"},\"assumedRoleUser\":{\"arn\":\"arn:aws:sts::638291047582:assumed-role/ashguard-order-scanner/coalition-gate-clerk\",\"assumedRoleId\":\"AROAM5UL0YKERNLJ4LNJ:coalition-gate-clerk\"}},\"requestID\":\"f3612e6d-01b6-4c86-a84f-1dc9f8a7890e\",\"eventID\":\"de159d90-f08d-4eb4-b1a3-9d5cafe9f535\",\"readOnly\":true,\"eventType\":\"AwsApiCall\",\"managementEvent\":true,\"eventCategory\":\"Management\",\"recipientAccountId\":\"638291047582\",\"resources\":[{\"ARN\":\"arn:aws:iam::638291047582:role/ashguard-order-scanner\",\"type\":\"AWS::IAM::Role\",\"accountId\":\"638291047582\"}]}"
},
```

The role session name can be found in the **roleSessionName** field: `\"roleSessionName\":\"coalition-gate-clerk\",`.

**Answer: coalition-gate-clerk**

---

11. What errorCode did CloudTrail record on the denied GetObject probe before role assumption?

The second event pasted under question 3 is again helpful to answer this question. The error code can be found in the **errorCode** field: `\"errorCode\":\"AccessDenied\",`.

**Answer: AccessDenied**

---

12. Which S3 API action name marks the forged ledger upload after DeleteObject?

First, we must find the successful `DeleteObject` event and find the event logged immediately after. 

The relevant events are:
```
{
    "EventId": "0fc3f434-fea4-486f-a220-24c4b2277e71",
    "EventName": "PutObject",
    "ReadOnly": "false",
    "EventTime": "2026-07-25T14:32:28.837000-04:00",
    "EventSource": "s3.amazonaws.com",
    "Resources": [
        {
            "ResourceType": "AWS::S3::Object",
            "ResourceName": "arn:aws:s3:::ashguard-order-custody/custody/east-gate-order.json"
        },
        {
            "ResourceType": "AWS::S3::Bucket",
            "ResourceName": "arn:aws:s3:::ashguard-order-custody"
        }
    ],
    "CloudTrailEvent": "{\"eventVersion\":\"1.08\",\"userIdentity\":{\"type\":\"AssumedRole\",\"sessionContext\":{\"sessionIssuer\":{\"type\":\"Role\",\"principalId\":\"AROA638291047582ashguard-order-scanner\",\"arn\":\"arn:aws:iam::638291047582:role/ashguard-order-scanner\",\"accountId\":\"638291047582\",\"userName\":\"ashguard-order-scanner\"},\"attributes\":{\"creationDate\":\"2026-07-25T18:32:28.837Z\",\"mfaAuthenticated\":\"false\"}},\"principalId\":\"AROAM5UL0YKERNLJ4LNJ:coalition-gate-clerk\",\"arn\":\"arn:aws:sts::638291047582:assumed-role/ashguard-order-scanner/coalition-gate-clerk\",\"accountId\":\"638291047582\",\"accessKeyId\":\"ASIANYS99IQKET9LZMYM\"},\"eventTime\":\"2026-07-25T18:32:28.837Z\",\"eventSource\":\"s3.amazonaws.com\",\"eventName\":\"PutObject\",\"awsRegion\":\"us-east-1\",\"sourceIPAddress\":\"198.18.44.91\",\"userAgent\":\"Boto3/1.29.7 md/Botocore#1.29.7 ua/2.0 os/linux#5.15.0-107-generic md/arch#x86_64 lang/python#3.10.12 md/pyimpl#CPython cfg/retry-mode#standard Botocore/1.29.7\",\"additionalEventData\":{\"SignatureVersion\":\"AWS4-HMAC-SHA256\",\"AuthenticationMethod\":\"AuthHeader\"},\"requestParameters\":{\"bucketName\":\"ashguard-order-custody\",\"key\":\"custody/east-gate-order.json\"},\"responseElements\":{\"x-amz-version-id\":\"23a2abea-48f8-4033-8f5e-85e370c20d42\"},\"requestID\":\"b6088b12-c6c0-4f16-bb8f-f08cbac23ab2\",\"eventID\":\"0fc3f434-fea4-486f-a220-24c4b2277e71\",\"readOnly\":false,\"eventType\":\"AwsApiCall\",\"managementEvent\":false,\"eventCategory\":\"Data\",\"recipientAccountId\":\"638291047582\",\"resources\":[{\"ARN\":\"arn:aws:s3:::ashguard-order-custody/custody/east-gate-order.json\",\"type\":\"AWS::S3::Object\",\"accountId\":\"638291047582\"},{\"ARN\":\"arn:aws:s3:::ashguard-order-custody\",\"type\":\"AWS::S3::Bucket\",\"accountId\":\"638291047582\"}]}"
},
{
    "EventId": "fbb4e243-6537-4e6a-8805-f76069cfcfbd",
    "EventName": "DeleteObject",
    "ReadOnly": "false",
    "EventTime": "2026-07-25T14:32:28.794000-04:00",
    "EventSource": "s3.amazonaws.com",
    "Resources": [
        {
            "ResourceType": "AWS::S3::Object",
            "ResourceName": "arn:aws:s3:::ashguard-order-custody/custody/east-gate-order.json"
        },
        {
            "ResourceType": "AWS::S3::Bucket",
            "ResourceName": "arn:aws:s3:::ashguard-order-custody"
        }
    ],
    "CloudTrailEvent": "{\"eventVersion\":\"1.08\",\"userIdentity\":{\"type\":\"AssumedRole\",\"sessionContext\":{\"sessionIssuer\":{\"type\":\"Role\",\"principalId\":\"AROA638291047582ashguard-order-scanner\",\"arn\":\"arn:aws:iam::638291047582:role/ashguard-order-scanner\",\"accountId\":\"638291047582\",\"userName\":\"ashguard-order-scanner\"},\"attributes\":{\"creationDate\":\"2026-07-25T18:32:28.794Z\",\"mfaAuthenticated\":\"false\"}},\"principalId\":\"AROAM5UL0YKERNLJ4LNJ:coalition-gate-clerk\",\"arn\":\"arn:aws:sts::638291047582:assumed-role/ashguard-order-scanner/coalition-gate-clerk\",\"accountId\":\"638291047582\",\"accessKeyId\":\"ASIANYS99IQKET9LZMYM\"},\"eventTime\":\"2026-07-25T18:32:28.794Z\",\"eventSource\":\"s3.amazonaws.com\",\"eventName\":\"DeleteObject\",\"awsRegion\":\"us-east-1\",\"sourceIPAddress\":\"198.18.44.91\",\"userAgent\":\"Boto3/1.29.7 md/Botocore#1.29.7 ua/2.0 os/linux#5.15.0-107-generic md/arch#x86_64 lang/python#3.10.12 md/pyimpl#CPython cfg/retry-mode#standard Botocore/1.29.7\",\"additionalEventData\":{\"SignatureVersion\":\"AWS4-HMAC-SHA256\",\"AuthenticationMethod\":\"AuthHeader\"},\"requestParameters\":{\"bucketName\":\"ashguard-order-custody\",\"key\":\"custody/east-gate-order.json\"},\"responseElements\":{\"x-amz-version-id\":\"22679cd0-f56e-4d4c-9c9c-a241698278c7\",\"x-amz-delete-marker\":\"true\"},\"requestID\":\"fd320c5c-f02e-4b43-8e21-8485e7c65121\",\"eventID\":\"fbb4e243-6537-4e6a-8805-f76069cfcfbd\",\"readOnly\":false,\"eventType\":\"AwsApiCall\",\"managementEvent\":false,\"eventCategory\":\"Data\",\"recipientAccountId\":\"638291047582\",\"resources\":[{\"ARN\":\"arn:aws:s3:::ashguard-order-custody/custody/east-gate-order.json\",\"type\":\"AWS::S3::Object\",\"accountId\":\"638291047582\"},{\"ARN\":\"arn:aws:s3:::ashguard-order-custody\",\"type\":\"AWS::S3::Bucket\",\"accountId\":\"638291047582\"}]}"
},
```

The API action of event after `DeleteObject` can be found in the **EventName** field: `"EventName": "PutObject",`.

**Answer: PutObject**