# Wrong Stamp

| Field | Details |
|-------|---------|
| **Challenge** | Wrong Stamp |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Cloud / DFIR (AWS CloudTrail) |
| **Answers** | See [Findings](#findings) below |

---

## Overview

> Elric Ashspar finds a seizure stamp in a dead clerk's bag near Stonepass. Vaultrune uses copies of that stamp to take supplies from Sythra's border guards, leaving a road Stormbound needs open without them. The stamp looks old, but Elric spots fresh tool marks on it. He must find the flaw, prove the stamp is fake, and give the guards a quick way to reject future copies.

Framing aside, this is an AWS CloudTrail incident-response challenge: reconstruct the final recorded actions of a compromised IAM identity and determine who/what stopped the audit trail from logging.

We're handed **read-only investigator** credentials for `stonepass-investigator` and a mock-AWS API endpoint (LocalStack-style: CloudTrail, IAM, S3, STS) reachable via `AWS_ENDPOINT_URL`.

---

## Setup

```bash
export AWS_ENDPOINT_URL=http://<challenge-ip>:<aws-port>
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=<redacted-investigator-key>
export AWS_SECRET_ACCESS_KEY=<redacted-investigator-secret>
unset AWS_SESSION_TOKEN

aws sts get-caller-identity
```

```json
{
    "UserId": "AIDAVHWY9JR2F4997X7B",
    "Account": "491827305948",
    "Arn": "arn:aws:iam::491827305948:user/stonepass-investigator"
}
```

The investigator role can't call `DescribeTrails` / `GetTrailStatus` directly (`AccessDeniedException`), but **`cloudtrail:LookupEvents`** is permitted: which is all we need to reconstruct history from the event log itself.

---

## Reconstructing the timeline

```bash
aws cloudtrail lookup-events --max-results 50
```

Paginating through `NextToken` and sorting all events by `EventTime` reproduces the full history. Two source IPs stand out among the `stonepass-warden` activity:

- `10.30.41.118`: an internal/EC2 address, the account's normal working IP (`Botocore/1.34.0`, `exec-env/EC2` in the user agent)
- `192.0.2.55`: an external IP (TEST-NET-1 range) that suddenly starts using the **same access key** (`AKIA2S5A************MD7I`)

That shared access key (`AKIA2S5A************MD7I`) is the smoking gun: the stamp (credentials) is a copy, not a new identity: same signer, different location, which is exactly the "fresh tool marks on an old stamp" the briefing describes.

```bash
aws cloudtrail lookup-events --max-results 50 --next-token <token>   # repeat until NextToken is empty
```

Filtering the merged/sorted timeline around the handoff between the two IPs:

```
...
1785091659.345  ListAccessKeys    stonepass-warden  10.30.41.118        (last internal action)
--------------------------------------------------------------------------------------------
1785091680.395  GetTrailStatus    stonepass-warden  192.0.2.55          (first attacker action)
1785091682.821  DeleteTrail       stonepass-warden  192.0.2.55  DENIED  (AccessDeniedException)
1785091684.804  ListBucket        stonepass-warden  192.0.2.55          (stonepass-audit-trail-logs)
1785091686.819  ListObjectsV2     stonepass-warden  192.0.2.55          (stonepass-audit-trail-logs)
1785091688.636  GetObject         stonepass-warden  192.0.2.55  NoSuchKey
1785091690.264  StopLogging       stonepass-warden  192.0.2.55          (trail silenced)
```

The attacker's IAM policy allows disabling the trail (`StopLogging`) but not destroying it (`DeleteTrail` is explicitly denied): hence the trail exists intact for us to read after the fact.

---

## Findings

| # | Question | Answer |
|---|----------|--------|
| 1 | Last CloudTrail action by the compromised user from the internal IP before the attacker session | **ListAccessKeys** |
| 2 | First API action called from the attacker IP | **GetTrailStatus** |
| 3 | API action explicitly denied before the trail was stopped | **DeleteTrail** (`AccessDeniedException`) |
| 4 | S3 bucket enumerated before stopping the trail | **stonepass-audit-trail-logs** |
| 5 | Name of the CloudTrail trail that was stopped | **stonepass-audit-trail** |
| 6 | IAM username whose credentials executed the trail disable | **stonepass-warden** |
| 7 | IP address from which the trail was disabled | **192.0.2.55** |
| 8 | API action used to disable the audit trail | **StopLogging** |

---

## Takeaway

A stolen (copied) access key is functionally indistinguishable from the real one at the API layer: same principal ARN, same `accessKeyId`. The only tell is contextual: source IP jumping from an internal/EC2 range to an external one, followed by reconnaissance (`GetTrailStatus`, bucket enumeration) and an attempt to cover tracks (`DeleteTrail` denied → fallback to `StopLogging`). A quick detection rule for the border guards: alert on any `StopLogging`/`DeleteTrail` call, or any access-key usage from a source IP outside the known internal range.
