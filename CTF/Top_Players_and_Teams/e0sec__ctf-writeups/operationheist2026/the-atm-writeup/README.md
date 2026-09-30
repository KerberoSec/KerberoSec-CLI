# The ATM

| Field | Details |
|-------|---------|
| **Challenge** | The ATM |
| **Platform** | themctf.com |
| **Category** | Web / Kiosk Escape |
| **Points** | 75 |
| **Flag** | `K4P{k10sk_3sc4p3_pr1nt_t0_sh3ll_jackp0t_839541b326be12ea}` |

---

## Overview

A browser-based ATM kiosk simulation for the fictional Banco Central Digital. The goal is to log in as a cardholder and escape the locked-down kiosk environment to reach a shell, then extract the ATM's host session key.

---

## Reconnaissance

The page loads `atm.js` which contains the full client-side application logic. Reading through the source reveals the credential validation:

```js
const validPanHash = sha256(process.env.ATM_PAN || '4539601122334451');
const validPinHash = sha256(process.env.ATM_PIN || '8841');
```

Default credentials hardcoded as env fallbacks:

```
PAN: 4539601122334451
PIN: 8841
```

The source also documents the intended escape chain in a comment at the top of the file:

```
// Challenge escape chain:
// Print → print dialog (in screen) → "Print to File" → file chooser (in screen)
// → navigate to parent dir → opens default file manager (BCD Kiosk Files) which blocks terminal
// → player must find the alternative file manager (Nautilus/Files) which allows terminal
```

---

## Step 1: Login

Selected English → entered card number `4539601122334451` and PIN `8841` → authenticated as **TOKIO RIVAS** (card ending in 4451).

---

## Step 2: Kiosk Escape

From the operations menu:

**Operations menu → Print statement → Print button → selected "Print to File" in the printer list → clicked Print**

→ A GTK-style "Save As" dialog appeared showing `/home/kiosk/Documents`

→ Clicked the `/` breadcrumb to navigate up → this triggered the **BCD Kiosk Files** manager, with the terminal option greyed out:

```
🖥 Terminal (restricted)
```

→ Clicked **"Open with..."** in the toolbar → an app chooser appeared with two options:

```
📁  BCD Kiosk Files    [current]
🗂️  Files (Nautilus)   [available]
```

→ Selected **Files (Nautilus)** → Nautilus file manager opened with a working terminal button

→ Clicked **"Open Terminal"** → shell spawned as `kiosk`

---

## Step 3: Extract the Flag

The dispenser config contains the host session key provisioned by the bank:

```bash
cat /opt/bcd-atm/conf/host.ini
```

```ini
[host]
endpoint = 127.0.0.1:9100
terminal_id = SIA7-014
protocol = ISO-8583

[secure]
; host session/master key: provisioned by the bank, never leaves the machine
host_key = K4P{k10sk_3sc4p3_pr1nt_t0_sh3ll_jackp0t_839541b326be12ea}
```

Alternatively, the local dispenser daemon on `127.0.0.1:9100` serves it over a simple text protocol:

```bash
/opt/bcd-atm/hostlink.sh getkey
# REQUIRE-KEY  use: GETKEY <terminal_id>
# HOSTKEY K4P{k10sk_3sc4p3_pr1nt_t0_sh3ll_jackp0t_839541b326be12ea}
```

---

## Attack Chain

```
atm.js source → hardcoded default PAN/PIN
     ↓
Login as TOKIO RIVAS (4539601122334451 / 8841)
     ↓
Print statement → Print to File → navigate to /
     ↓
BCD Kiosk Files (terminal restricted)
     ↓
Open with... → Files (Nautilus)
     ↓
Open Terminal → shell
     ↓
cat /opt/bcd-atm/conf/host.ini → FLAG
```

---

## Flag

```
K4P{k10sk_3sc4p3_pr1nt_t0_sh3ll_jackp0t_839541b326be12ea}
```
