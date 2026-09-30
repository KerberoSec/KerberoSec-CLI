# Charger Confessions: CTF Writeup

## Challenge Overview

This challenge involves a combination of MQTT message interception, credential extraction, cryptographic decoding, and web exploitation. The goal is to progressively gather information from various sources to ultimately retrieve the flag.

## Step-by-Step Solution

### Step 1: Initial Reconnaissance

Upon examining the challenge, we discover there's a web server running, but it requires authentication credentials that we don't have yet. We also notice there's an MQTT broker available.

### Step 2: MQTT Broker Connection

Since we need credentials for the web interface, we decide to investigate the MQTT broker first. We connect to the MQTT broker and subscribe to all topics using the wildcard `#` to monitor all message traffic:

```bash
mqtt sub -h <mqtt_broker_address> -p 1883 -t '#'```
```

### Step 3: Intercepting Admin Session Token

While monitoring MQTT traffic, we intercept an interesting authentication message containing an admin session token:

```json
{
  "timestamp": "2025-09-02T15:13:08.660Z", 
  "event_type": "authentication_success", 
  "severity": "warning", 
  "source": "auth-proxy", 
  "user_identity": {
    "username": "service_account", 
    "role": "service", 
    "permissions": ["read", "monitor"]
  }, 
  "request_details": {
    "method": "PATCH", 
    "endpoint": "/api/v1/users/profile", 
    "source_ip": "192.168.198.144", 
    "x_forwarded_for": "203.0.239.94"
  }, 
  "session_info": {
    "session_id": "sess_admin_a47e19a0", 
    "session_token": "YWRtaW5fdXNlcjpTM2N1cjNfUEBzc3cwcmRfMjAyNQ==", 
    "expires_at": "2025-09-02T15:49:46Z"
  }
}
```

### Step 4: Decoding the Session Token

The `session_token` field contains a base64-encoded string. When decoded:

```bash
echo "YWRtaW5fdXNlcjpTM2N1cjNfUEBzc3cwcmRfMjAyNQ==" | base64 -d
# Output: admin_user:S3cur3_P@ssw0rd_2025
```

This gives us MQTT admin credentials in the format `username:password`.

### Step 5: Authenticated MQTT Connection

These credentials aren't for the web interface, so we use them to authenticate with the MQTT broker as an admin user. This gives us access to additional topics and messages that weren't visible before.

### Step 6: Finding the Encrypted Unlock Phrase

With admin access to MQTT, we intercept another interesting message:

```json
{
  "service": "credential_manager", 
  "status": "awaiting unlock command", 
  "encrypted_unlock_phrase": "5573767475206e66204a20626e207569662062656e6a6f", 
  "timestamp": 1756825989
}
```

### Step 7: Decrypting the Unlock Phrase

The `encrypted_unlock_phrase` is encoded in hexadecimal. We need to:

1. **Convert hex to ASCII:**
   ```
   5573767475206e66204a20626e207569662062656e6a6f → "Ustvtu nf J bn uif benjo"
   ```

2. **Apply Caesar cipher with shift -1:**
   ```
   "Ustvtu nf J bn uif benjo" → "Trust me I am the admin"
   ```

### Step 8: Discovering the Secure Channel

We also intercept a message revealing a secure administrative channel:

```json
{
  "notice": "Secure administrative channel available", 
  "location": "internal/admin/secure_channel", 
  "timestamp": 1756826009
}
```

### Step 9: Sending the Unlock Phrase

We publish the decoded unlock phrase ("Trust me I am the admin") to the secure channel topic `internal/admin/secure_channel`.

### Step 10: Receiving Web UI Credentials

After sending the unlock phrase, we receive web UI credentials:

```json
{
  "username": "charger_webui",
  "password": "Alm0st_ChALL3ng3_S0lv3d!"
}
```

### Step 11: Web UI Authentication

Using these credentials, we authenticate to the web interface using HTTP Basic Authentication:

```bash
curl -u charger_webui:Alm0st_ChALL3ng3_S0lv3d! http://<webui_host>:<webui_port>/
```

### Step 12: Analyzing the Web Interface

Upon examining the HTML response from the web interface, we discover a hidden reference to `/cgi-bin/flag.cgi`.

### Step 13: Retrieving the Flag

Finally, we make a request to the flag endpoint using our authenticated session:

```bash
curl -u charger_webui:Alm0st_ChALL3ng3_S0lv3d! http://<webui_host>:<webui_port>/cgi-bin/flag.cgi
```

This returns the flag in the format `WPCTF{...}`.

