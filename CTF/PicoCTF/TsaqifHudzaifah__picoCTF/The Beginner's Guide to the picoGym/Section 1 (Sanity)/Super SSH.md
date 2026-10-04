<p align="center">
  <img src="https://play.picoctf.org/api/media/picoCTF_p_logo_4c_3_NoYG1qU_3zBp50s.png" alt="picoCTF Logo" width="200"/>
</p>

# Beginner's Guide Challenge: Super SSH 

🔗 [Challenge Link](https://play.picoctf.org/playlists/18?m=146)

---

### 📌 Challenge Overview

- **Name:** Super SSH  
- **Difficulty:** Easy  
- **Category:** General Skills / Shell / SSH   
- **Author:** Jeffery John

---

## 📝 Description
> *Using a Secure Shell (SSH) is going to be pretty important.  
Additional details will be available after launching your challenge instance.*

---

## 💡 Hints

1. Refer to the `ssh` man page: [https://linux.die.net/man/1/ssh](https://linux.die.net/man/1/ssh)
2. Try logging in using the format:
    ```
    <user>@titan.picoctf.net
    ```
3. Don’t forget to specify the port if it’s provided.
4. Keep in mind: **Passwords are hidden** when typed in the terminal.

---

## 🛠️ Solution

### 🔹Step 1: Launch the Challenge Instance
Click the **"Launch Instance"** button on the challenge page. The description will update with this information:

> *Can you SSH as `ctf-player` to `titan.picoctf.net` at port `53726` to get the flag?  
You'll also need the password `83dcefb7`.  
If asked, accept the fingerprint with `yes`.  
If your device doesn't have a shell, use: https://webshell.picoctf.org*

---

### 🔹Step 2: Log in as the User

Open your terminal or the provided web shell and use the following SSH command format:

```bash
ssh <username>@<host> -p <port>
```
For this challenge, you would enter:
```
ssh ctf-player@titan.picoctf.net -p 53726
```

---

### 🔹Step 3: Accept the Host Fingerprint
You may see a message like this:

> *The authenticity of host '[titan.picoctf.net]:53726 ([3.139.174.234]:53726)' can't be established. <br>
ED25519 key fingerprint is SHA256:4S9EbTSSRZm32I+cdM5TyzthpQryv5kudRP9PIKT7XQ. <br>
This host key is known by the following other names/addresses: <br>
    ~/.ssh/known_hosts:1: [hashed name] <br>
Are you sure you want to continue connecting (yes/no/[fingerprint])?*

After typing yes and enter type the password given to you in the description of the challange. <br>
Type ```83dcefb7``` to login to the account.

After succesfully enter the password you are given this text and the flag: <br>
> *Welcome ctf-player, here's your flag: picoCTF{s3cur3_c0nn3ct10n_8969f7d3}*

---

## 🧠What I have Learned
* How to use SSH to connect to remote machines
* Using custom ports with -p
* Accepting unknown host fingerprints
* Understanding password-based SSH login

