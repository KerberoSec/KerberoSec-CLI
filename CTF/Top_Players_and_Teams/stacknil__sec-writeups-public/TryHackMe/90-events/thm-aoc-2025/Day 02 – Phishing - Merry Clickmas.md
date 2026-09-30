---
type: resource-note
status: done
created: 2025-12-04
updated: 2026-03-12
tags: [security-writeup, tryhackme, aoc2025, phishing, social-engineering]
source: TryHackMe: Advent of Cyber 2025 Day 2
platform: tryhackme
room: Advent of Cyber 2025 Day 02: Phishing & Social Engineering
slug: aoc-2025-day-02-phishing-and-social-engineering
path: TryHackMe/90-events/thm-aoc-2025/Day 02: Phishing: Merry Clickmas.md
topic: 90-events
domain: [blueteam]
skills: [phishing-analysis, awareness-training]
artifacts: [lab-notes]
sanitized: true
description: Red-team phishing exercise against TBFC using a fake portal and the Social-Engineer Toolkit (SET).
---

# Advent of Cyber 2025 Day 02: Phishing & Social Engineering

## Summary

TBFC (The Best Festival Company) is under active cyber‑threat. The internal red team (Recon McRed, Exploit McRed, Pivot McRed + you) runs a **phishing campaign** to validate whether staff follow their cyber‑security awareness training.

Focus of the room:

* Understand **social engineering** and different types of **phishing**.

* Build & host a **fake TBFC Staff Portal login page**.

* Collect credentials via that page.

* Use **SET (Social‑Engineer Toolkit)** to send a realistic phishing email that lures staff to the fake portal.

* Interpret results and think about defensive implications.

> Mental model: this is a controlled, authorised attack against TBFC to measure training effectiveness, not a real crime.

---

## Key Concepts

### 2.1 Social Engineering

**Social engineering** = manipulating humans into making security‑relevant mistakes.

Typical goals:

* Reveal secrets (passwords, OTPs, internal data).

* Execute risky actions (opening malware, approving payments, changing bank details).

* Bypass technical controls by abusing human trust / habits.

Key psychological levers:

* **Urgency**: “do this now or something bad happens”.

* **Curiosity**: “click to see results / gossip / reward”.

* **Authority**: “this is from your boss / HR / bank / IT”.

> Human hacking, not system hacking. 技术栈是“心理学 + 情境设计”。

### 2.2 Phishing & its Variants

**Phishing** = social‑engineering over messages.

Channels:

* Email (classic phishing / spear‑phishing).

* SMS (**smishing**).
* Voice calls (**vishing**).
* QR codes (**quishing**).
* Social‑media DMs / collaboration tools / in‑app messages.

Attacker’s objective:

* Get the user to **click / open / reply / type credentials**, so the attacker can steal **info, money or access**.

### 2.3 Anti‑phishing Mnemonics: S.T.O.P

TBFC trains staff using two S.T.O.P. checklists.

**S.T.O.P. #1 (question the email itself)**

* **S: Suspicious?**  Anything feels off?

* **T: Telling me to click something?**  Buttons / links with pressure.

* **O: Offering an amazing deal?**  Too good to be true.

* **P: Pushing me to act now?**  Urgent / threatening tone.

**S.T.O.P. #2 (what to actually do)**

* **S: Slow down.**  Scammers rely on adrenaline & stress.

* **T: Type the address yourself.**  Don’t trust embedded links.

* **O: Open nothing unexpected.**  Verify before opening attachments.

* **P: Prove the sender.**  Check real email / phone, not only display name / avatar.

> Training is there; this lab tests whether staff actually apply it under pressure.

---

### 3. Fake TBFC Portal: Building the Trap

Goal: steal credentials to the **TBFC Staff Portal (SOCMAS Ops)** using a cloned login page.

#### 3.1 Server‑side setup

On the AttackBox (or your own THM‑VPN host), the room provides a small web app:

```bash
cd ~/Rooms/AoC2025/Day02
./server.py
```

* The script starts a simple HTTP server:

  * **Bind:** `0.0.0.0` (all interfaces)

  * **Port:** `8000`
* Console output example:

```text
Starting server on http://0.0.0.0:8000

```

#### 3.2 Previewing the phishing page

In the AttackBox Firefox:

* Visit `http://127.0.0.1:8000` **or** `http://ATTACKER_IP:8000`.

* You should see a **TBFC Staff Portal** login form (email/username + password).

* Any credentials submitted are **logged in the same terminal** running `server.py`.

> This page is functionally a credential harvester. 真实系统只在视觉层面被模仿，后端完全是你的脚本。

---

### 4. Crafting & Sending the Phishing Email with SET

#### 4.1 Why SET?

**SET (Social‑Engineer Toolkit)** is an open‑source framework for social‑engineering attacks. It includes:

* Mass‑mailer for phishing campaigns.

* Website clones, payload generators, QR attacks, etc.

In this room we only use the **Mass Mailer** to send a realistic email that links to our fake portal.

#### 4.2 Launching SET

```bash
setoolkit
```

Menu flow:

1. **Main menu →** `1) Social-Engineering Attacks`

2. **Attack type →** `5) Mass Mailer Attack`

3. **Mode →** `1) E-Mail Attack Single Email Address`

Now answer the interactive questions.

#### 4.3 Mail routing & identity settings

Suggested values from the room (adapt IPs if your instance differs):

* **Send email to:** `factory@wareville.thm`

  (target user at TBFC factory)
* **How to deliver email:** `2) Use your own server or open relay`

* **From address:** `updates@flyingdeer.thm`

  (looks like the legitimate shipping partner)

* **From name:** `Flying Deer`
  (displayed sender name)
* **Username for open‑relay:** leave blank → `Enter`

* **Password for open‑relay:** leave blank → `Enter`

* **SMTP server address:** TBFC mail server IP, e.g. `10.67.135.69`

* **SMTP port:** keep default `25`
* **High priority flag:** `no`
* **Attach file?** `n`
* **Attach inline file?** `n`

#### 4.4 Subject & body

* **Subject:** something plausible, e.g. `Shipping Schedule Changes`

* **Send as HTML or plain:** accept default `p` (plain text) unless you need HTML.

* **Body:** write a short, believable message and include the phishing URL.

Example body (each line entered separately, finish with `END`):

```text
Dear elves,
Kindly note that there have been significant changes to the shipping schedules due to increased shipping orders.

Please confirm the new schedule by visiting http://ATTACKER_IP:8000

Best regards,
Flying Deer
END
```

SET then sends the mail through the TBFC SMTP server and prints:

```text
[*] SET has finished sending the emails

Press <return> to continue
```

At this point:

* One or more TBFC users receive a **legit‑looking email**.

* The link leads to **your fake portal**.

#### 4.5 Harvesting credentials

Switch back to the terminal running `./server.py` and watch for hits:

* When a victim opens the page and logs in, the script prints the **email/username and password**.

* In the story, at least **one set of working credentials** is captured.

Implication:

* Real‑world adversary could do the same → compromise SOCMAS delivery system.

* Indicates TBFC needs **stronger awareness training + technical controls**.

---

### 5. Defensive View: What Should Blue Team Do?

If this were a real incident, defenders should:

1. **Detect & contain**

   * Monitor mail gateway for suspicious senders / headers.

   * Block the phishing domain/IP at proxies / firewalls.

   * Invalidate any credentials used on the fake portal (force password reset, revoke sessions).

2. **Harden users & systems**

   * Reinforce **S.T.O.P.** training with real examples.

   * Enforce **MFA** on critical portals (password alone ≠ access).

   * Deploy **phishing‑resistant authentication** where possible (FIDO2/WebAuthn).

3. **Improve email security**

   * SPF / DKIM / DMARC correctly configured and monitored.

   * Banner for external emails, plus anti‑phishing filters.

4. **Run regular phishing simulations**

   * Use controlled campaigns like this lab to measure improvement.

> Red‑team takeaway: your job isn’t just to “pwn”; it’s to produce evidence that drives **concrete improvements**.

---

### 6. Command Cheat Sheet

Quick reference for this room:

```bash
# Start phishing web server
cd ~/Rooms/AoC2025/Day02
./server.py

# Run Social-Engineer Toolkit
setoolkit

# Inside SET: menu path
1  # Social-Engineering Attacks
5  # Mass Mailer Attack
1  # E-Mail Attack Single Email Address

# Verify current directory (general Linux CLI refresher)

pwd
ls
cat <file>

# Basic network/system checks (useful on AttackBox)

ip addr
uptime
ps aux
```

---

### 7. Mini Glossary (EN → ZH)

* **Social engineering**: 利用人性的攻击 / 社会工程学。
* **Phishing**: 网络钓鱼（通过邮件或消息诱骗）。
* **Smishing**: SMS 短信钓鱼。
* **Vishing**: 语音电话钓鱼。
* **Quishing**: QR code 钓鱼。
* **Credential harvesting**: 凭据收集（窃取账号密码）。
* **MFA (Multi‑Factor Authentication)**: 多因素认证。
* **SMTP**: Simple Mail Transfer Protocol，邮件传输协议。
* **Open relay**: 未限制转发的邮件服务器，容易被滥用发送垃圾邮件。
* **SET (Social‑Engineer Toolkit)**: 社会工程攻击框架，用于构造钓鱼邮件、假站点等。
* **AttackBox**: TryHackMe 提供的在线攻击机环境。
