# The Invisible Developer

**Category:** OSINT / Git Forensics  
**Difficulty:** Medium  
**Platform:** CultRang 2026  
**Objective:** Find the real name of the author behind the Reddit comment and GitHub profile

## 🎯 Challenge Description

The challenge began with a link to a Reddit comment in r/cats with the ID nzegadr. The goal was to find the real name of the author behind the Reddit comment and GitHub profile.

## 🔍 Reconnaissance

### Step 1: Reddit Investigation
- **Target:** Reddit user `u/No-Giraffe5587`
- **Location:** r/cats subreddit
- **Observation:** The Reddit profile was largely anonymous with pseudonymous username and no bio
- **Pivot:** Through investigating the user's activity, discovered a connected GitHub account: `susantest-tech`

### Step 2: GitHub Profile Analysis
Navigated to `https://github.com/susantest-tech` to look for personal details.

**Findings:**
- Name: Not set (Null)
- Bio: Empty  
- Public Repositories: 1 (A repository named `ocr-model`)
- Commit Activity: Recent activity in Jan 2026

Since the public profile page did not reveal the "Real Name," moved to inspecting the code repositories for sensitive information leaks.

## 🚨 Vulnerability Discovery

### Step 3: Repository Forensics & Credential Leak
Examined the source code in the `ocr-model` repository. Developers often accidentally commit configuration files that should be ignored by git (like `.env`).

**Action:** Checked the commit history for a file named `.env`

**Discovery:** A commit titled "Update .env" contained the following content:

```bash
FASTAPI_ENV=production
DEBUG=False
...
PAT_TOKEN=<REDACTED_TOKEN>
```

This PAT_TOKEN appears to be the suffix of a GitHub Fine-Grained Personal Access Token. All fine-grained tokens start with the prefix `github_pat_`.

**Reconstructed Token:** `github_pat_<REDACTED_TOKEN>`

## 🔓 Exploitation

### Step 4: API Enumeration (The "Who Am I?" Check)
With a valid Personal Access Token (PAT), we can impersonate the user and query the GitHub API for information that is not public.

**Attempt 1: Basic User Info**
Queried the `/user` endpoint to see if the token revealed a hidden display name.

```bash
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <REDACTED_TOKEN>" \
  https://api.github.com/user
```

**Result:** The JSON response returned `"name": null`. The user had not set a display name in their account settings.

### Step 5: Advanced Enumeration (Private Emails)
Since the name was missing, the next logical step was to find the email address associated with the account. GitHub allows users to hide their email from the public web UI, but a valid PAT with the `user:email` scope can retrieve it via the API.

```bash
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <REDACTED_TOKEN>" \
  https://api.github.com/user/emails
```

**Response:**
```json
[
  {
    "email": "<REDACTED_EMAIL>",
    "primary": true,
    "verified": true,
    "visibility": "private"
  },
  {
    "email": "251638929+susantest-tech@users.noreply.github.com",
    "primary": false,
    "verified": true,
    "visibility": null
  }
]
```

## 🏆 Flag Capture

The API call successfully bypassed the privacy settings (`"visibility": "private"`) and revealed the user's primary email address: `<REDACTED_EMAIL>`.

From this email, we can infer the user's real name.

**Flag:** `CultRang{<REDACTED_USERNAME>}`

## 🔧 Tools Used

- **curl**: API requests
- **GitHub API**: User and email enumeration
- **Git history analysis**: Credential discovery
- **Reddit investigation**: Initial reconnaissance

