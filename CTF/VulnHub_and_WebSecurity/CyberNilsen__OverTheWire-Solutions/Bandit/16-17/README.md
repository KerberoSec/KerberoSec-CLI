# 🔎 Bandit Level 16 → Level 17

## 🎯 Goal

```
The credentials for the next level can be retrieved by submitting the password of the current level to a port on localhost in the range 31000 to 32000. First find out which of these ports have a server listening on them. Then find out which of those speak SSL/TLS and which don’t. There is only 1 server that will give the next credentials, the others will simply send back to you whatever you send to it.
```

---

## 🧪 Steps Taken

1. **Scan for open ports**

```bash
nmap 127.0.0.1 -p 31000-32000
```

This revealed several open ports. Only one of them will return the correct credentials.

2. **Retrieve the current password**

```bash
cat /etc/bandit_pass/bandit16
```

Password retrieved:

```
kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx
```

3. **Test each open port**

I used `nc` (Netcat) to test each open port by sending the password:

```bash
echo kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx | nc localhost [PORT]
```

If the port echoed the password back, it was not the correct one. If it returned something different, I investigated further.

4. **Check for SSL/TLS support**

To test SSL-enabled ports, I used:

```bash
echo kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx | ncat --ssl localhost [PORT]
```

Or:

```bash
openssl s_client -connect localhost:[PORT]
```

Only one port returned a new password: the rest just echoed the input.

5. **Received the credentials for Bandit17**

Once I found the correct port, it returned the next password. I also received a private SSH key for Bandit17, which I saved locally and used to log in.
