# Wrong Stamp
|Category |Difficulty|
|:-------:|:--------:|
|  Cloud  |   Easy   |

**Skills learned:**
* AWS CLI

## Description
Elric Ashspar finds a seizure stamp in a dead clerk's bag near Stonepass. Vaultrune uses copies of that stamp to take supplies from Sythra's border guards, leaving a road Stormbound needs open without them. The stamp looks old, but Elric spots fresh tool marks on it. He must find the flaw, prove the stamp is fake, and give the guards a quick way to reject future copies.

Stonepass's surviving CloudTrail history is the only record of activity surrounding the copied stamp. You hold read-only investigator access. Reconstruct the final recorded actions and determine which identity stopped the trail from logging.

## CLI Setup
1. Install AWS CLI if you have not already. Instructions can be found [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
2. Start the challenge's Docker container and use either `aws configure` or the provided `export` commands to use your assigned credentials.
3. Use the command `aws sts get-caller-identity` to confirm you have successfully configured the `stonepass-investigator` user.

## Initial Steps
Since we have already been told that there is a **CloudTrail** history, we can start looking at the cloudtrail CLI [command reference](https://docs.aws.amazon.com/cli/latest/reference/cloudtrail/#cloudtrail).

It does appear that our user has limited permissions, so not all of the useful commands will work (describe-trails, list-trails).

However, we can use CloudTrail to list captured events `aws cloudtrail lookup-events --max-results [# RESULTS]` that can be examined further to answer the questions.

## Questions
These questions are to be answered during (and help guide) your investigation.

1. What was the last CloudTrail API action performed by the compromised user from the internal IP immediately before the attacker session began?

Examining the cloudtrail events, we can see which events came from the compromised user based on the **sourceIPAddress** field. The user has an private IP address, while the attacker does not.

The compromised user's last API action before the attacker's session can be found in this (partial) event:
```
{
    "EventId": "195c2127-9aab-48eb-be43-900b2973546d",
    "EventName": "ListAccessKeys",
    "ReadOnly": "true",
    "EventTime": "2026-07-24T20:00:03.052000-04:00",
    "EventSource": "iam.amazonaws.com",
    "Username": "stonepass-warden",
    "Resources": [
         {
             "ResourceType": "AWS::IAM::User",
             "ResourceName": "arn:aws:iam::491827305948:user/stonepass-warden"
         }
    ],
}
```

**Answer: ListAccessKeys**

---

2. What was the first CloudTrail API action called from the attacker IP?

The attacker's first API action occurs shortly after the event from question 1. The event includes:
```
{
    "EventId": "70010155-1eea-4387-863f-05c4d0d82fcd",
    "EventName": "GetTrailStatus",
    "ReadOnly": "true",
    "EventTime": "2026-07-24T20:00:24.079000-04:00",
    "EventSource": "cloudtrail.amazonaws.com",
    "Username": "stonepass-warden",
    "Resources": [
         {
            "ResourceType": "AWS::CloudTrail::Trail",
            "ResourceName": "arn:aws:cloudtrail:us-east-1:491827305948:trail/stonepass-audit-trail"
        }
    ],
}
```

**Answer: GetTrailStatus**

---

3. Which API action did the attacker attempt that was explicitly denied before the trail was stopped?

We can determined which API action was denied based on events from the attacker's IP address that may include **errors**.

The relevant event includes:
```
\"eventVersion\":\"1.08\",\"userIdentity\":{\"type\":\"IAMUser\",\"userName\":\"stonepass-warden\",\"sessionContext\":{\"attributes\":{\"mfaAuthenticated\":\"false\",\"creationDate\":\"2026-07-25T00:00:26.463Z\"}},\"principalId\":\"AIDA005PIAC3MOFK5VIJ\",\"arn\":\"arn:aws:iam::491827305948:user/stonepass-warden\",\"accountId\":\"491827305948\",\"accessKeyId\":\"AKIATOXD5SVJBRHUDT88\"},\"eventTime\":\"2026-07-25T00:00:26.463Z\",\"eventSource\":\"cloudtrail.amazonaws.com\",\"eventName\":\"DeleteTrail\",\"awsRegion\":\"us-east-1\",\"sourceIPAddress\":\"192.0.2.55\",\"userAgent\":\"Boto3/1.29.7 md/Botocore#1.29.7 ua/2.0 os/linux#5.15.0-107-generic md/arch#x86_64 lang/python#3.10.12 md/pyimpl#CPython cfg/retry-mode#standard Botocore/1.29.7\",\"additionalEventData\":{\"SignatureVersion\":\"AWS4-HMAC-SHA256\",\"AuthenticationMethod\":\"AuthHeader\"},\"requestParameters\":{\"path\":\"/\",\"name\":\"stonepass-audit-trail\"},\"responseElements\":null,\"requestID\":\"59e50e15-12ac-4a3b-93cd-1c6791508049\",\"eventID\":\"1c8ce4f9-b358-4518-b45b-df35c787a1cb\",\"readOnly\":false,\"eventType\":\"AwsApiCall\",\"managementEvent\":true,\"eventCategory\":\"Management\",\"recipientAccountId\":\"491827305948\",\"resources\":[{\"ARN\":\"arn:aws:cloudtrail:us-east-1:491827305948:trail/stonepass-audit-trail\",\"type\":\"AWS::CloudTrail::Trail\",\"accountId\":\"491827305948\"}],\"errorCode\":\"AccessDeniedException\",\"errorMessage\":\"User is not authorized to perform: cloudtrail:DeleteTrail\"
```

**Answer: DeleteTrail**

---

4. Which S3 bucket did the attacker enumerate before stopping the trail?

We can filter down all cloudtrail events related to S3 buckets by looking at the **ResourceType** field. We want to look at events with this ResourceType of **AWS: S3: Bucket**.

The S3 bucket enumeration includes this event:
```
{
    "EventId": "753f9b8c-40d5-4016-8a96-e13a4a5e5514",
    "EventName": "GetObject",
    "ReadOnly": "true",
    "EventTime": "2026-07-24T20:00:32.258000-04:00",
    "EventSource": "s3.amazonaws.com",
    "Username": "stonepass-warden",
    "Resources": [
        {
            "ResourceType": "AWS::S3::Object",
            "ResourceName": "arn:aws:s3:::stonepass-audit-trail-logs/AWSLogs/us-east-1/CloudTrail/us-east-1/2026/06/24/audit.log.gz"
        },
        {
            "ResourceType": "AWS::S3::Bucket",
            "ResourceName": "arn:aws:s3:::stonepass-audit-trail-logs"
        }
    ],
}
```

**Answer: stonepass-audit-trail-logs**

---

5. What is the name of the CloudTrail trail that was stopped?

We can see the stopped trail by searching the events for the phrase **stop**. That points us to one event, which includes:
```
{
    "EventId": "65e2ebcb-38a1-46fa-a89f-0f15be4f2642",
    "EventName": "StopLogging",
    "ReadOnly": "false",
    "EventTime": "2026-07-24T20:00:33.893000-04:00",
    "EventSource": "cloudtrail.amazonaws.com",
    "Username": "stonepass-warden",
    "Resources": [
        {
            "ResourceType": "AWS::CloudTrail::Trail",
            "ResourceName": "arn:aws:cloudtrail:us-east-1:491827305948:trail/stonepass-audit-trail"
        }
    ],
}
```

**Answer: stonepass-audit-trail**

---

6. Which IAM username's credentials were used to execute the trail disable?

We can determine which IAM username executed the trail disable inside the **Username** field of the log event from question 5.

**Answer: stonepass-warden**

---

7. From which IP address was the trail disabled?

We can determine which IP address that executed the trail disable inside the **sourceIPAddress** field of full `CloudTrailEvent` listing from the same event.

```
 "CloudTrailEvent": "{\"eventVersion\":\"1.08\",\"userIdentity\":{\"type\":\"IAMUser\",\"userName\":\"stonepass-warden\",\"sessionContext\":{\"attributes\":{\"mfaAuthenticated\":\"false\",\"creationDate\":\"2026-07-25T00:00:33.893Z\"}},\"principalId\":\"AIDA005PIAC3MOFK5VIJ\",\"arn\":\"arn:aws:iam::491827305948:user/stonepass-warden\",\"accountId\":\"491827305948\",\"accessKeyId\":\"AKIATOXD5SVJBRHUDT88\"},\"eventTime\":\"2026-07-25T00:00:33.893Z\",\"eventSource\":\"cloudtrail.amazonaws.com\",\"eventName\":\"StopLogging\",\"awsRegion\":\"us-east-1\",\"sourceIPAddress\":\"192.0.2.55\",\"userAgent\":\"Boto3/1.29.7 md/Botocore#1.29.7 ua/2.0 os/linux#5.15.0-107-generic md/arch#x86_64 lang/python#3.10.12 md/pyimpl#CPython cfg/retry-mode#standard Botocore/1.29.7\",\"additionalEventData\":{\"SignatureVersion\":\"AWS4-HMAC-SHA256\",\"AuthenticationMethod\":\"AuthHeader\"},\"requestParameters\":{\"path\":\"/\",\"name\":\"stonepass-audit-trail\"},\"responseElements\":null,\"requestID\":\"91242c54-4071-45c5-ba03-db0488cee78c\",\"eventID\":\"65e2ebcb-38a1-46fa-a89f-0f15be4f2642\",\"readOnly\":false,\"eventType\":\"AwsApiCall\",\"managementEvent\":true,\"eventCategory\":\"Management\",\"recipientAccountId\":\"491827305948\",\"resources\":[{\"ARN\":\"arn:aws:cloudtrail:us-east-1:491827305948:trail/stonepass-audit-trail\",\"type\":\"AWS::CloudTrail::Trail\",\"accountId\":\"491827305948\"}]}"
```

**Answer: 192.0.2.55**

---

8. Which API action was used to disable the audit trail?

We can find the API action inside the **EventName** field of the log event mentioned in questions 5-7.

**Answer: StopLogging**