# Challenge: what's a net cat?
**Category:** General Skills | **Difficulty:** Easy | **Author:** Sanjay C/Danny Tunitis

## Challenge Description
*"Using netcat (nc) is going to be pretty important. Can you connect to fickle-tempest.picoctf.net at port 56690 to get the flag?"*

This is a fundamental challenge designed to introduce `nc` (Netcat), often referred to as the "Swiss Army knife" of networking, which is essential for interacting with remote CTF instances.

> **Note:** This challenge uses **dynamic instances**. You must launch your own challenge instance on the picoCTF platform to get the specific host URL and port for your `nc` (Netcat) connection.

---

## Analysis & The "Colon" Misconception

Coming from web development and standard network URIs, one might assume the connection format follows the standard `host:port` syntax (e.g., `http://url:port`). 

As seen in my initial attempt (**Figure 1**), I instinctively tried connecting using a colon:
```bash
nc fickle-tempest.picoctf.net:56690
```

<div align="center">
  *[Image: Failed Netcat connection]*
  <p><i>Figure 1: The standard URI host:port syntax fails in raw CLI commands.</i></p>
</div>

The terminal threw an error: `nc: missing port number`. 
**Why?** Because `nc` is a command-line utility, not a web browser. Linux command-line tools parse arguments separated by **spaces**, not colons. It interpreted `fickle-tempest.picoctf.net:56690` as the hostname and noticed the mandatory port argument was missing.

---

## Solution

To fix this, I simply replaced the colon with a space, strictly following the `nc [hostname] [port]` syntax.

```bash
nc fickle-tempest.picoctf.net 56690
```

<div align="center">
  *[Image: Successful Netcat connection]*
  <p><i>Figure 2: Successfully connecting via Netcat using space-separated arguments.</i></p>
</div>

The server immediately responded with a congratulatory message and the flag.

---

## 🚩 Final Flag

<details>
  <summary>Click to reveal the flag</summary>
  
  `picoCTF{nEtCat_Mast3ry_0d33dA2C}`
</details>

---

## Key Takeaways
* **CLI vs. Web Syntax:** Command-line utilities (like `nc`, `ssh`, etc.) generally use spaces to separate hosts and ports as positional arguments, whereas web URIs use the `host:port` format.
* **Tool Mastery:** Netcat is the absolute standard for communicating with raw TCP/UDP sockets in CTF challenges.
