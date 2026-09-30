# Penetration Test Write-up: JavaScript and API Analysis

## Executive Summary
During a penetration test of the target web server at `94.237.48.12:59180`, we discovered and analyzed obfuscated JavaScript code that interacted with a backend API. Through systematic deobfuscation and API interaction, we identified security vulnerabilities and retrieved sensitive information including multiple flags.

## Target Information
- **IP Address**: 94.237.48.12
- **Port**: 59180
- **Service**: Web Application with JavaScript APIs

## Methodology

### Phase 1: Initial Reconnaissance

#### Step 1: HTML Analysis
We began by examining the main webpage to identify referenced JavaScript files:

```bash
wget http://94.237.48.12:59180/ -O page.html
cat page.html
```

**Findings:**
- Application title: "Secret Serial Generator"
- Primary JavaScript file: `api.min.js`
- The page appeared to be an API Keys control panel

#### Step 2: JavaScript File Retrieval
We downloaded the referenced JavaScript file for analysis:

```bash
wget http://94.237.48.12:59180/api.min.js -O api.min.js
```

### Phase 2: Code Analysis and Deobfuscation

#### Step 1: Initial Code Examination
The JavaScript file was heavily obfuscated using a packing technique:

```javascript
eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('t 5(){6 7=\'1{n\'+\'8\'+\'9\'+\'a\'+\'b\'+\'c!\'+\'}\',0=d e(),2=\'/4\'+\'.g\';0[\'f\'](\'i\',2,!![]),0[\'k\'](l)}m[\'o\'](\'1{j\'+\'p\'+\'q\'+\'r\'+\'s\'+\'h\'+\'3}\');',30,30,'xhr|HTB|_0x437f8b|k3y|keys|apiKeys|var|flag|3v3r_|run_0|bfu5c|473d_|c0d3|new|XMLHttpRequest|open|php|n_15_|POST||send|null|console||log|4v45c|r1p7_|3num3|r4710|function'.split('|'),0,{}))
```

#### Step 2: Manual Deobfuscation Attempt
We manually mapped the obfuscated parameters to reveal two potential flags:

- **Flag Variable**: `HTB{n3v3r_run_0bfu5c473d_c0d3!}`
- **Console Output**: `HTB{4v45cr1p7_3num3r4710n_15_k3yk3y}`

#### Step 3: Professional Deobfuscation
Using jsnice.org, we obtained the clean, deobfuscated code:

```javascript
function apiKeys() {
  var flag = "HTB{n" + "3v3r_" + "run_0" + "bfu5c" + "473d_" + "c0d3!" + "}";
  var xhr = new XMLHttpRequest;
  var url = "/keys" + ".php";
  xhr["open"]("POST", url, !![]);
  xhr["send"](null);
}
console["log"]("HTB{j" + "4v45c" + "r1p7_" + "3num3" + "r4710" + "n_15_" + "k3y}");
```

**Confirmed Flags:**
1. **Flag Variable**: `HTB{n3v3r_run_0bfu5c473d_c0d3!}`
2. **Console Flag**: `HTB{j4v45cr1p7_3num3r4710n_15_k3y}`

### Phase 3: API Interaction and Exploitation

#### Step 1: API Endpoint Discovery
The deobfuscated code revealed a POST request to `/keys.php`. We replicated this functionality:

```bash
curl -X POST http://94.237.48.12:59180/keys.php
```

**Response:** `4150495f70336e5f37333537316e365f31355f66756e`

#### Step 2: Hex Decoding
The response contained hex-encoded data:

```bash
echo "4150495f70336e5f37333537316e365f31355f66756e" | xxd -r -p
```

**Decoded Key:** `API_p3n_73571n6_15_fun`

#### Step 3: API Authentication Bypass
We sent the decoded key back to the API as a parameter:

```bash
curl -X POST http://94.237.48.12:59180/keys.php -d "key=API_p3n_73571n6_15_fun"
```

## Findings

### Critical Vulnerabilities Identified

1. **Obfuscated Client-Side Logic**
   - Risk: High
   - Impact: Hidden functionality and potential backdoors
   - Location: `api.min.js`

2. **Insecure API Authentication**
   - Risk: High
   - Impact: Unauthorized API access
   - Location: `/keys.php` endpoint

3. **Information Disclosure**
   - Risk: Medium
   - Impact: Sensitive keys exposed through simple hex encoding
   - Location: API response handling

Here are all the answers from the penetration test assessment:

## Question 1: JavaScript File Identification
**Q:** What is the name of the JavaScript file being used?
**A:** `api.min.js`

## Question 2: First Flag (JavaScript Analysis)
**Q:** Retrieve the 'flag' variable from the deobfuscated JavaScript code
**A:** `HTB{n3v3r_run_0bfu5c473d_c0d3!}`

## Question 3: Second Flag (Console Log)
**Q:** What flag is printed to the console in the deobfuscated code?
**A:** `HTB{j4v45cr1p7_3num3r4710n_15_k3y}`

## Question 4: Secret Key Retrieval
**Q:** What is the secret key obtained from the API?
**A:** `API_p3n_73571n6_15_fun`

## Question 5: Final Flag (API Exploitation)
**Q:** What flag did you get after sending the decoded key to the API?
**A:** `HTB{r34dy_70_h4ck_my_w4y_1n_2_HTB}`

## Summary of All Flags Found:
1. **JavaScript File**: `api.min.js`
2. **Flag Variable**: `HTB{n3v3r_run_0bfu5c473d_c0d3!}`
3. **Console Flag**: `HTB{j4v45cr1p7_3num3r4710n_15_k3y}`
4. **API Secret Key**: `API_p3n_73571n6_15_fun`
5. **Final Flag**: `HTB{r34dy_70_h4ck_my_w4y_1n_2_HTB}`
## Recommendations

### Immediate Actions
1. Remove or properly secure the `/keys.php` endpoint
2. Implement proper authentication and authorization checks
3. Remove obfuscated JavaScript from production environments

### Long-term Security Improvements
1. Implement API rate limiting and proper authentication
2. Conduct regular code reviews to identify obfuscated or malicious code
3. Use Content Security Policies (CSP) to restrict script execution
4. Implement proper input validation and output encoding

### Developer Education
1. Train developers on secure coding practices
2. Establish code review processes to catch security issues early
3. Implement secure API development guidelines

## Conclusion
The penetration test successfully identified multiple security vulnerabilities in the web application's JavaScript implementation and API design. The obfuscated code concealed functionality that could be exploited to bypass authentication mechanisms and retrieve sensitive information. Immediate remediation is required to address the critical vulnerabilities identified in the API endpoints and client-side code implementation.

**Risk Level:** HIGH

**Exploitation Complexity:** LOW

**Business Impact:** CRITICAL

---
## 🏷️ Tags

#Web #HackTheBox #JavaScript 
[[Cracking into Hack the Box Path]]
