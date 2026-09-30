# Module 4: Burp Suite

> **Portfolio scope:** Technical notes on using Burp Suite as an HTTP analysis platform in authorized labs. The focus is methodology, request interpretation, and evidence: not automated attack output.

## Module coverage

The legacy module covered:

- Burp Suite setup and navigation;
- Proxy and HTTP history;
- Repeater;
- Intruder;
- Decoder, Comparer, Sequencer, and other modules;
- extensions and operational safety.

The main lesson is that Burp Suite is most valuable when it supports a clear hypothesis. Capturing traffic is not the same as understanding application state, trust, or authorization.

---

## 1. Proxy architecture and setup

Burp acts as an intercepting proxy between the browser and target application.

```text
Browser -> Burp proxy listener -> Target application
```

For HTTPS, the browser trusts a Burp-generated certificate authority in the dedicated test browser profile. This allows Burp to decrypt and re-encrypt traffic for analysis.

### Safe setup practices

- use a separate browser profile for testing;
- install the Burp CA only in the test profile;
- remove it after the lab if appropriate;
- define target scope;
- disable interception when not actively modifying requests;
- avoid proxying unrelated personal or production traffic;
- configure upstream proxies only when required;
- protect saved project files because they may contain cookies and tokens.

### Scope configuration

Add approved hosts to target scope. Scope helps:

- filter HTTP history;
- prevent accidental active scans or requests to third parties;
- focus Site map and tools;
- reduce noise from analytics, fonts, and external APIs.

Burp scope is a safety aid, not a substitute for written authorization.

---

## 2. Proxy and HTTP history workflow

### Capture a baseline

1. navigate through the normal feature;
2. identify the relevant request in HTTP history;
3. record method, path, host, parameters, headers, cookies, and body;
4. inspect the response status, headers, body, and timing;
5. identify dynamic values such as CSRF tokens and nonces;
6. send the request to Repeater.

### Request anatomy

```http
POST /api/v1/profile HTTP/1.1
Host: app.lab.example
Cookie: session=<redacted>
Content-Type: application/json
X-CSRF-Token: <redacted>

{"displayName":"NetFlux"}
```

Questions:

- Which value identifies the session?
- Is CSRF protection tied to the session?
- Is the object identity derived from the session or request body?
- Does the API accept extra fields?
- Which response fields are security-sensitive?
- Does the request change server state?

### Response analysis

Compare:

- status code;
- response length;
- JSON fields;
- headers and cookies;
- redirect location;
- time;
- actual state change in the application.

A `200 OK` does not necessarily mean success; some applications return an error inside a 200 response. Conversely, a `500` may indicate useful error handling information but not exploitability.

---

## 3. Interception and controlled modification

Intercept is useful when a request must be changed before it reaches the server.

Examples:

- modify a hidden form field;
- remove a client-side validation parameter;
- change an object identifier;
- test an alternate role value;
- capture a WebSocket upgrade or API call.

Avoid leaving interception on during normal browsing because queued requests can cause confusion and application timeouts.

### Match and replace

Burp can automatically change headers or values, but automation should be narrowly scoped. Examples include adding a test header or replacing a fixed host in a lab. Broad replacement rules can corrupt requests unexpectedly.

---

## 4. Repeater methodology

Repeater is the primary manual testing tool.

### One-variable-at-a-time testing

A reliable workflow:

1. duplicate the baseline request;
2. change one parameter;
3. send and compare;
4. repeat the request to control for dynamic responses;
5. document the hypothesis and result;
6. test alternate methods or encodings only after establishing the behavior.

### Authorization test example

Tabs:

- **Baseline A:** user A requests user A’s object.
- **Cross-object:** user A requests user B’s object.
- **No auth:** same request without session/token.
- **Alternate method:** change `GET` to `PUT` or `DELETE` where relevant.

This arrangement keeps evidence organized.

### Handling tokens

Requests may require fresh CSRF tokens, signatures, timestamps, or sequence values. Options include:

- recapture a current request;
- use session-handling rules and macros where available;
- manually update the dynamic value;
- understand whether the token is actually required or merely checked by the client.

### Compare responses

Use response highlighting, search, and Comparer to identify small differences. Do not rely only on length because dynamic content, timestamps, and request IDs can change.

---

## 5. Intruder

Intruder automates repeated requests with payload positions.

### Attack types

- **Sniper:** one payload set, one position at a time.
- **Battering ram:** same payload placed in multiple positions.
- **Pitchfork:** multiple payload sets used in parallel positions.
- **Cluster bomb:** combinations across multiple payload positions.

The exact availability and performance can vary by Burp edition.

### Safe use cases

- enumerate a short list of authorized object IDs;
- test input-length handling;
- compare a small set of HTTP methods;
- test a controlled username list in a lab;
- identify virtual hosts;
- vary one parameter across known values.

### Grep and result analysis

Configure match/extract rules for:

- error messages;
- response fields;
- headers;
- object names;
- reflected markers;
- session changes.

Sort by status, length, time, or extracted values. Manually verify interesting results in Repeater.

### Operational controls

- set conservative concurrency;
- define delays where appropriate;
- limit payload count;
- avoid authentication lockout unless specifically approved;
- monitor service health;
- stop when sufficient evidence is obtained.

---

## 6. Decoder

Decoder transforms data formats such as:

- URL encoding;
- Base64;
- hexadecimal;
- HTML encoding;
- ASCII/bytes.

Encoding is not encryption. A Base64 token may reveal structured data but should not be assumed modifiable unless integrity protection is absent.

Example:

```text
TmV0Rmx1eA==  ->  NetFlux
```

When decoding tokens, determine whether they are signed, encrypted, compressed, or only encoded.

---

## 7. Comparer

Comparer highlights differences between requests or responses.

Useful for:

- valid versus invalid login responses;
- authorized versus unauthorized object access;
- before/after a parameter modification;
- token behavior;
- subtle error messages;
- dynamic response analysis.

Normalize obviously dynamic fields mentally or with controlled preprocessing so they do not obscure security-relevant differences.

---

## 8. Sequencer

Sequencer evaluates the apparent randomness of tokens such as session identifiers or CSRF values. Statistical analysis requires a sufficiently large sample and a correct understanding of token generation.

Questions:

- Is the token generated server-side?
- Is it meant to be unpredictable or merely unique?
- Does it contain a timestamp or counter?
- Is the token signed?
- Can an attacker obtain many samples?
- Does prediction actually lead to session compromise?

A statistical anomaly is not automatically an exploitable finding.

---

## 9. Extensions

Burp extensions can support:

- authorization comparison;
- passive detection;
- token handling;
- JSON or GraphQL analysis;
- request signing;
- logging and export.

### Extension risk

Extensions can access sensitive project traffic. Before installing:

- review author and source;
- inspect permissions and code where possible;
- prefer maintained extensions;
- avoid unnecessary extensions;
- keep Burp and extensions updated;
- do not install untrusted code in a sensitive assessment environment.

Tools can also create false positives. Every finding requires manual validation.

---

## 10. Useful Burp workflows

### Workflow A: IDOR

1. log in as user A;
2. capture request for object A;
3. send to Repeater;
4. identify object reference;
5. replace with seeded object B;
6. compare response and state;
7. repeat for update/delete;
8. test as user B and unauthenticated;
9. record exact authorization expectation.

### Workflow B: input-to-sink

1. place a unique marker in input;
2. locate it in response or later workflow;
3. determine context: HTML, attribute, JavaScript, SQL-like error, filename, or command output;
4. change one metacharacter at a time;
5. observe encoding and validation;
6. validate only with harmless lab proof;
7. identify correct remediation for the sink.

### Workflow C: session lifecycle

1. capture anonymous cookie;
2. authenticate;
3. compare cookie values;
4. test logout and old-cookie reuse;
5. change password and test existing sessions;
6. test inactivity and absolute timeout;
7. inspect cookie attributes;
8. review authentication logs if provided.

### Workflow D: race condition

Use Repeater groups or controlled concurrent tooling to send synchronized requests. Confirm state in the backend or UI. Keep request count low and avoid denial-of-service.

---

## 11. Evidence management

Burp project files may contain:

- credentials;
- session cookies;
- bearer tokens;
- personal data;
- full API responses;
- uploaded documents.

Controls:

- use encrypted storage;
- redact exports;
- avoid sending raw project files through insecure channels;
- delete according to the engagement retention policy;
- rotate exposed test credentials if necessary.

When reporting, export the smallest request/response needed and redact secrets while preserving technical meaning.

---

## 12. Common interpretation errors

- assuming every `403` means the resource is secure without testing alternate endpoints or methods;
- assuming every `500` is exploitable;
- treating reflected input as XSS without proving executable context;
- trusting status code alone;
- overlooking side effects;
- using Intruder before understanding the baseline request;
- comparing responses with different sessions or dynamic states;
- leaving stale CSRF tokens and misreading failures;
- installing untrusted extensions;
- exporting evidence with live tokens.

---

## Portfolio takeaway

I learned to use Burp Suite as a controlled HTTP laboratory. My workflow is baseline-first, hypothesis-driven, and evidence-focused: capture normal behavior, modify one variable, compare responses and state, manually validate interesting results, and preserve the exact request/response needed for reporting.

## References

- TryHackMe Jr Penetration Tester (Legacy): https://tryhackme.com/path/outline/jrpenetrationtester-legacy
- PortSwigger Burp Suite documentation: https://portswigger.net/burp/documentation
- PortSwigger Web Security Academy: https://portswigger.net/web-security
