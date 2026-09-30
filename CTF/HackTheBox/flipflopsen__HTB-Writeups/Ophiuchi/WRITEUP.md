# Ophiuchi

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.10.227 |
| **Status** | Retired |

## Overview
Ophiuchi is a Medium Linux machine featuring an Apache Tomcat application that hosts an "Online YAML Parser". The parser is vulnerable to insecure Java deserialization via SnakeYAML, giving remote code execution as the `tomcat` service user. Enumeration of the filesystem then reveals plaintext admin credentials, and a sudo rule allowing that user to run a Go program as root: which loads and executes a WebAssembly (WASM) module: is abused by patching the WASM module's return value to trigger a root-owned deployment script.

## Reconnaissance
```
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.1
8080/tcp open  http    Apache Tomcat 9.0.38 - "Parse YAML"
```

## Enumeration
The web application on port 8080 accepts arbitrary YAML input and parses it server-side using SnakeYAML, a library known to support unsafe polymorphic type instantiation when `Yaml.load()` is used without a `SafeConstructor`. This is a well-documented gadget chain (the "artsploit yaml-payload" PoC) that can instantiate a `javax.script.ScriptEngineFactory` to execute arbitrary Java/OS commands during YAML parsing.

## Foothold
A malicious YAML payload referencing a custom `ScriptEngineFactory` class (packaged as a small JAR and loaded via `!!javax.script.ScriptEngineManager`) was submitted to the parser, resulting in command execution as the Tomcat service account. From there, a shell was upgraded to a proper TTY and used to explore `/opt/tomcat/conf`, which contained the credential `admin:whythereisalimit` for the local `admin` user.

## Privilege Escalation
`sudo -l` as `admin` showed:
```
(ALL) NOPASSWD: /usr/bin/go run /opt/wasm-functions/index.go
```
`files/privesc/index.go` (mirrored from `/opt/wasm-functions/index.go`) loads a WASM module (`main.wasm`) from the current directory, calls its exported `info()` function, and if the result equals `"1"` executes `/bin/sh deploy.sh`: as root, since the whole `go run` invocation is root-owned via sudo:

```go
init := instance.Exports["info"]
result,_ := init()
if (f != "1") { ... } else {
    out, err := exec.Command("/bin/sh", "deploy.sh").Output()
}
```
Since `go run` executes from the attacker-writable working directory, a fresh `main.wasm`/`deploy.sh` pair can be supplied. The stock `main.wasm` disassembles (via `wasm2wat`) to `files/privesc/main.wat`, whose `info` function simply returns the constant `1`:
```wat
(func $info (type 0) (result i32)
  i32.const 1)
```
By writing a `deploy.sh` that reads the root flag / spawns a reverse shell, then uploading it alongside the (unmodified, already-returning-1) `main.wasm` to a writable working directory (e.g. `/tmp/work`) and re-running `sudo /usr/bin/go run /opt/wasm-functions/index.go` from that directory, `deploy.sh` executed with root privileges, granting full root access.

## Lessons Learned
- SnakeYAML's default `Yaml.load()` is unsafe by design and must never be used on untrusted input: always use `SafeConstructor`/`new Yaml(new SafeConstructor())`.
- Sudo rules that let a user run an interpreter (`go run`, `python`, etc.) against a path are effectively unrestricted, since the interpreter will happily execute attacker-controlled files it discovers relative to the current directory.
- WASM modules are just as inspectable/patchable as any other compiled artifact: `wasm2wat`/`wat2wasm` make trivial logic changes (like flipping a return value) straightforward.

## Tools & References
- `files/privesc/index.go`, `files/privesc/main.wat`, `files/privesc/main.wasm`: the sudo-runnable Go loader and the WASM module used to trigger `deploy.sh` as root.
- SnakeYAML unsafe deserialization: public PoC based on `artsploit/yaml-payload` (https://github.com/artsploit/yaml-payload).
- `exploit/yaml-payload/` (cloned `artsploit/yaml-payload` repository, including `.git` history, a compiled `.jar`/`.class`, and `snakeyaml.zip`): omitted from the repository; the upstream project is referenced above and the technique is summarized here.
- `privesc/wasmer-go` (cloned `wasmerio/wasmer-go` Go bindings repository, used to build/inspect the WASM loader): omitted; see https://github.com/wasmerio/wasmer-go.
- `privesc/wabt` (cloned WebAssembly Binary Toolkit repository, providing `wasm2wat`/`wat2wasm`): omitted; see https://github.com/WebAssembly/wabt.
- `root.txt`: the retired machine's root flag: omitted from the repository as it has no reference value outside of HTB's own scoring system.
