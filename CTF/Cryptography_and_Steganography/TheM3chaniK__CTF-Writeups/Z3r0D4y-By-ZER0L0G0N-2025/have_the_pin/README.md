# 🧩 Challenge:  Have the pin?

**Category:** Reverse Engineering
**Points:** 150

---

### 🔖 **Challenge Description**

> Give me the pin, I will give you the flag
>
> Connect via nc 172.104.207.121 5000

---

### 📎 **Attachments**

* `server.py`: (provided)

---

### 🧭 **First Impressions**

Ok we have to nc a server and the server's working code is written of the `server.py`

---

### 🛠 **Environment & Tools**

* OS: I use Arch Btw
* Tools: python3, netcat
* Assumptions: If we understand the python code we can get the flag from the server

---

### 📂 **Assets (what we actually have)**

* `server.py`: server's working script

---

### 🔬 **Static Analysis**

From reading `server.py` I can tell

* It create socket connection
* The `handle_client` function start get input from the client
* Validates with `PIN` variable
* If the `PIN` is correct. The server will throw out the flag.
* In the code `PIN` variable doen't change it value stays always `954312`

---

### ▶️ **Dynamic Analysis**

I starte the server in my local machine first to check if my approach is correct.

```bash
$ python3 server.py
[*] Server listening on 0.0.0.0:5000

```

And connect in via netcat locally

```bash
$ nc 127.0.0.1 5000
Welcome to the challenge!
Enter 6-digit PIN: 954312
Correct! Here is your flag:
###REDACTED###

```

So my logic is correct

---

### ⚙️ **Patching / Exploitation / Decoding Process**

Lets do the same thing with the flag server now

1. Open `server.py`, find `PIN = 954312`.
2. Connect to remote with netcat: `nc 172.104.207.121 5000`.
3. When prompted, send the PIN `954312`.
4. Server responds with the flag.

*Assumptions noted:*

* Remote service runs the same code as `server.py`.
* No IP-based rate-limiting or temporary bans triggered during my single connection.
* The server expects a newline-terminated PIN (sending `954312\n` is correct).
* No additional hidden checks (e.g., source IP validation or challenge-response) are present.

---

### 🔁 **Recovery & Artifacts**

```bash
$ nc 172.104.207.121 5000
Welcome to the challenge!
Enter 6-digit PIN: 954312
Correct! Here is your flag:
zero{r3alms_0f_r3v3rs3_3ngin33ring}

```

---

### ✅ **Validation**

Why I'm confident:

  * The flag was returned *directly* by the remote service after supplying the discovered hardcoded PIN.
  * The plaintext flag matches expected CTF format (`zero{...}`) and contains readable, sensible content related to the challenge.
  * Local execution of `server.py` produced identical prompt/response behavior, confirming parity between local and remote code paths.

---

### 🏁 **Flag**

```
zero{r3alms_0f_r3v3rs3_3ngin33ring}
```

---

### 💡 **Takeaways**

* Always read the supplied source: competitions often intentionally include the secret in plain sight.
* Hardcoded secrets are a major security anti-pattern; never commit them in real systems. 🔓
* Local reproduction of a service is invaluable: it lets you validate assumptions without risking remote rate limits or bans.
* Simple challenges are great for practicing the full RE loop: inspect → verify → exploit → confirm.
* Netcat remains the fastest way to interact with simple TCP CTF services: know your pipes.

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**

