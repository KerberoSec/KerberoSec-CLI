---
author: NotCare
pubDatetime: 2021-12-01T01:01:00Z
title: Defenses against BOF (part 3)
postSlug: defense-against-bof
featured: false
draft: false
tags:
  - research
  - code
ogImage: ""
description: Lets switch teams!
---

## Defense Intro

If we look back to how the attacker was exploiting code was overwriting pointers, injecting code and altering the address so on. We could try to detect those attack by randomizing the address itself, altough this can be brute-forced. There are several cases of Spactial Safety, Temporal safety which prevents the program from BOF. We will see some of the defenses against buffer overflow.

## stack canaries

One way to prevent the stack-based buffer overflow above from being successful, is introducing a stack canary just before the EBP and the RP. This token value will be added by the compiler and serve as a warning that the SFP and RP may be overwritten. Stack canaries will be checked for their value just before the return to the calling function, which is the moment at which the attacker will gain control over the instruction pointer as their overwritten value for the return pointer is loaded into the instruction pointer.

## ASLR

Address space layout randomization is another method of preventing buffer overflows, as the name implies the addresses are randomized . It is a well-known, mature and widely used
protection technique which randomizes the memory address of processes in an attempt to deter forms of exploitation, which rely on knowing the exact location of the process objects.
Rather than increasing security by removing vulnerabilities from the system, as source code analysis tools tend to do, ASLR is a prophylactic technique which tries to make it more difficult to exploit existing vulnerabilities. Its **important** to know that only the _stack_ and _libraries_ are randomized and not the _heap , text, bss segment_.

## CFI

Control Flow Integrity is another type of defense which follows _Software execution must follow its execution path_. Any attempt to change the execution path may notify that an adversary is trying to execute malicious code stored in memory. CFI enforces integrity of a program’s execution
flow path. An undefined change in the path of execution by an adversary can be detected using CFI. It efficiently detects and mitigates buffer overflow, RoP, return-to-libc attacks, etc.

## Further reading

[Sans stack canaries](https://www.sans.org/blog/stack-canaries-gingerly-sidestepping-the-cage/)<br>
[Protecting the stack with PACed canaries](https://arxiv.org/pdf/1909.05747.pdf#:~:text=A%20stack%20canary%20is%20a,the%20canary%20before%20function%20return.)<br>
[ASLR nextGen](https://www.mdpi.com/2076-3417/9/14/2928/pdf)<br>
[CFI paper](https://cse.usf.edu/~ligatti/papers/cficcs.pdf)
