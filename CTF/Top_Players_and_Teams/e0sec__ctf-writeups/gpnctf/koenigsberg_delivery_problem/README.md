# Königsberg Delivery Problem

| Field | Details |
|-------|---------|
| **Challenge** | Königsberg Delivery Problem |
| **CTF** | GPN CTF 2024 |
| **Category** | Reverse Engineering |
| **Flag** | `GPNCTF{s4y_EulER_The_Owl_OWls_In_kön1g5BeR6_10_7iM3S_FAst!}` |

---

## Overview

A Linux x86-64 PIE binary (`cartographer`) that reads 250 signed bytes via `scanf("%hhd;", ...)`, runs them through a 250-state DFA implemented as a giant jump table in `cfg()`, then calls `check_instance(stack_buf, 250)`.

---

## Reversing

`cfg()` allocates `0x108` bytes on the stack used as a visit-count buffer. Each state block executes `incb [rsp + state_id]`, incrementing that state's counter.

`check_instance` loops over all 250 bytes with `cl=1`; if any byte is `0`, `cl` is set to `0`. The final `test $1, %cl` + `je failure` means **every state must be visited at least once**.

250 inputs, 250 states → **Hamiltonian path required**.

---

## Graph Extraction

Scan the binary for the pattern `fe 44 24 <state_id>` (`incb [rsp+N]`), then follow the `movzbl`, `cmp $max_val`, `ja`-to-fail, `inc rcx`, `lea <table_rip>` sequence, and read 4-byte relative offsets from the jump table to resolve next-state VAs.

Result: **250 nodes, 24,987 directed edges, average out-degree ≈ 100**.

---

## Solving

With average out-degree ~100 the graph is dense: backtracking with a heuristic works fast.

**Warnsdorff's heuristic:** at each step, move to the neighbour with the fewest onward neighbours (that haven't been visited). Finds a valid Hamiltonian path in under 1 second.

---

## Solution

The full input sequence (249 bytes, semicolon-separated):

```
15;31;54;6;34;58;47;44;14;39;85;67;27;23;51;82;63;46;11;51;76;73;68;73;41;3;20;88;70;9;21;7;75;20;91;40;71;16;85;42;27;38;72;89;48;0;54;4;6;61;11;12;3;4;79;40;47;15;65;2;84;15;29;19;41;87;8;83;49;33;11;49;70;30;53;68;3;80;44;61;36;35;58;25;78;11;23;91;27;48;65;41;79;49;70;10;84;39;12;28;73;35;78;27;97;17;43;61;27;25;45;33;24;13;48;72;88;45;41;48;92;87;16;62;90;80;65;22;71;85;22;41;70;57;49;28;83;78;5;79;21;43;104;106;80;46;96;42;22;22;73;34;101;13;75;73;54;87;68;62;82;96;35;93;60;26;15;104;10;38;69;9;38;44;97;97;95;36;44;20;95;89;56;23;20;23;59;1;55;1;63;81;51;98;7;11;26;67;33;95;51;34;93;71;78;40;15;17;80;74;82;42;59;85;92;52;43;7;38;62;74;27;26;75;101;12;17;50;10;38;6;66;62;18;86;39;37;64;29;93;69;84;104;79;41;30;1;7;90
```

Submit to the server:

```bash
echo "15;31;54;6;34;58;47;44;14;39;85;67;27;23;51;82;63;46;11;51;76;73;68;73;41;3;20;88;70;9;21;7;75;20;91;40;71;16;85;42;27;38;72;89;48;0;54;4;6;61;11;12;3;4;79;40;47;15;65;2;84;15;29;19;41;87;8;83;49;33;11;49;70;30;53;68;3;80;44;61;36;35;58;25;78;11;23;91;27;48;65;41;79;49;70;10;84;39;12;28;73;35;78;27;97;17;43;61;27;25;45;33;24;13;48;72;88;45;41;48;92;87;16;62;90;80;65;22;71;85;22;41;70;57;49;28;83;78;5;79;21;43;104;106;80;46;96;42;22;22;73;34;101;13;75;73;54;87;68;62;82;96;35;93;60;26;15;104;10;38;69;9;38;44;97;97;95;36;44;20;95;89;56;23;20;23;59;1;55;1;63;81;51;98;7;11;26;67;33;95;51;34;93;71;78;40;15;17;80;74;82;42;59;85;92;52;43;7;38;62;74;27;26;75;101;12;17;50;10;38;6;66;62;18;86;39;37;64;29;93;69;84;104;79;41;30;1;7;90" | ncat --ssl <host> 443
```

---

## Flag

```
GPNCTF{s4y_EulER_The_Owl_OWls_In_kön1g5BeR6_10_7iM3S_FAst!}
```
