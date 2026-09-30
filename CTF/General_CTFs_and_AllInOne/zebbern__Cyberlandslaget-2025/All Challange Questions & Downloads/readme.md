## Challenge Topics 
- **[Forensics](#forensics)**
  - **[STRABA](#straba)**
  - **[EFTERFORSKNINGEN](#efterforskningen)**
  - **[PING-SWEEP](#ping-sweep)**
  - **[COVERTCHANNEL2](#covertchannel2)**
  - **[COVERTCHANNEL1](#covertchannel1)**
  - **[COVERTCHANNEL3](#covertchannel3)**
  - **[FDE-BOOTLOADER](#fde-bootloader)**
  - **[FUTURISTIC MALWARE](#futuristic-malware)**
- **[Reverse Engineering](#reverse-engineering)**
  - **[OUTXORCING](#outxorcing)**
  - **[WHAT TIME IS IT?](#what-time-is-it)**
  - **[PASSPROTECTOR](#passprotector)**
  - **[STERN BROCCOLI](#stern-broccoli)**
  - **[NOTEPADLAUNCHER](#notepadlauncher)**
  - **[DDCLE](#ddcle)**
- **[Cryptography](#cryptography)**
  - **[VIGENÈRE'S DICTIONARY](#vigenères-dictionary)**
  - **[LONG LIVE, CAESAR!](#long-live-caesar)**
  - **[AES DECRYPTION](#aes-decryption)**
  - **[BINARY-ENCODINGS1](#binary-encodings1)**
  - **[DLOG](#dlog)**
  - **[RSA2](#rsa2)**
  - **[BINARY-ENCODINGS2](#binary-encodings2)**
  - **[LEARNING WHAT EXISTS](#learning-what-exists)**
  - **[DLOG 2](#dlog-2)**
  - **[AUTHENTICATED PRIVILEGE 2, SYMMETRIC PSYDUCKS RETURN!](#authenticated-privilige-2-symmetric-psyducks-return)**

- **[Binary](#binary)**
  - **[GOTOWIN](#gotowin)**
  - **[PWN ME GOOD UWU](#pwn-me-good-uwu)**
  - **[ROPLICATOR](#roplicator)**
  - **[PWN ME GOOD UWU: WIFU EDITION](#pwn-me-good-uwu---wifu-edition)**
  - **[EZWIN](#ezwin)**
- **[Web Exploitation](#web-exploitation)**
  - **[CROSS SITE JOB](#cross-site-job)**
  - **[LEAKY STORE](#leaky-store)**
  - **[COMPLETE STYLING SADNESS](#complete-styling-sadness)**
  - **[FIND FRONTDOOR](#find-frontdoor)**
  - **[DDC LOUNGE](#ddc-lounge)**
  - **[FILM TIL DIG PT 1](#film-til-dig-pt-1)**
  - **[FILM TIL DIG PT 2](#film-til-dig-pt-2)**
  - **[PHP101](#php101)**
- **[Misc](#misc)**
  - **[MASAHIRO HARA](#masahiro-hara)**
  - **[THE PROFESSOR’S LOST NOTE](#the-professors-lost-note)**
  - **[SHUTTER TRACE](#shutter-trace)**
  - **[HASHER IS BACK](#hasher-is-back)**
  - **[DDC ADMIN BOT](#ddc-admin-bot)**
  - **[ROLL YOUR OWN CRYPTO](#roll-your-own-crypto)**
  - **[MAX 420](#max-420)**
  - **[MAX 69](#max-69)**
- **[Boot2Root](#boot2root)**
  - **[THE GAUNTLET PT 1](#the-gauntlet-pt-1)**
  - **[THE GAUNTLET PT 2](#the-gauntlet-pt-2)**

       

### **Forensics/**

---

### **Straba**

> Note: The challenge solution does not involve finding any people/locations from the visuals of the picture. You can treat all the pictures as if they are all ai generated. (A few pictures turned out to be real, this is not part of the solution. The author has been bonked with a stick for their crimes.)
> 

We are looking for location of some soldiers. We have received a tip-off that they use Straba to post their runs. However, Straba has a policy of not disclosing any information, so we have to see if we can find something ourselves. Go to straba.hkn and see if you can find anything in the images.

The flag is the name of the city near the military base they are at.

Example flag: **DDC{roskilde}**

[straba.hkn](https://ctf.cyberlandslaget.no/challenges#)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **Efterforskningen**

PET, in collaboration with the NSA, has conducted a long-term investigation into the world-renowned hacker Fin B. Last Friday, PET raided Fin B's residence, where they found a computer. However, when they opened it, they found nothing. They suspect that Fin B deleted all his files before their arrival.

PET now needs your help! They want you to search the most important parts of his computer, such as root. So, bring out your best tools and see if you can recover the deleted documents.

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Forensics____Efterforskningen.zip)

---

### **ping-sweep**

We suspect that some of our engineers are hiding a secret message in our vulnerability scanner, which uses an ICMP ping sweep at the start of the scan.

We have attached a **.pcap** file that captures an example of suspicious activity. Can you determine if there is anything unique about some of the packets and whether they contain a hidden message?

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Forensics_ping-sweep.pcap)

---

### **covertchannel1**

A noise covert channel should be in these pcaps. The whole flag has been transmitted in each pcap.

> Hint: Covert channels are information hidden in unusual places. This can for example be in unused fields, how/when packets are sent, or by manipulating fields to carry information. Look for patterns across packets!
> 

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Forensics_covertchannel1.zip)

---

### **covertchannel2**

A covert channel should be in this pcap.

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Forensics_covertchannel2.zip)

---

### **covertchannel3**

A covert channel should be in this pcap. Reading RFCs wont help you. Practical implementation is what matters.

> Hint: The channel is located in the TCP packets before the TCP content, so you only need to look at the IP and TCP headers!
> 
> 
> (This channel is modelled over a state-sponsored attackers one-way exfiltration method)
> 

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Forensics_covertchannel3.zip)

---

### **fde-bootloader**

I’ve found this ancient disk in a computer during a recent search, but I haven’t found the password yet… did they even have full disk encryption back then?

Update 28/02: The flag is in Danish, with same casing/punctuation as seen in the challenge. It is possible to get the exact flag in the challenge, but if you think you have something that looks right but its not accepted by ctfd, please open a ticket and we can help.

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Forensics_fde-bootloader.zip)

---

### **Futuristic Malware**

I gave you [modern malware](https://github.com/olnor18/writeup/tree/master/DDC/2024/ModernMalware).

How do you like some futuristic malware???

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Forensics_Futuristic_Malware.zip)

---

## Reverse Engineering/

---

### **outXORcing**

I only develop beautiful user interfaces, so I outsourced access control to a backend developer (the inverse of me). Can you check if it's secure for me?

P.S. My backend developer says that `objdump -d -S` is strictly forbidden and that no one uses Ghidra anymore.

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Reverse_Engineering_outXORcing.zip)

---

### **What time is it?**

I'm always running late, so my friends end up eating all the cookies before I even arrive. This time, they’ve left me a challenge: I have to guess the exact order in which they ate the cookies.

Can you help me figure out the sequence?

Go visit [http://what-time-is-it.hkn](https://ctf.cyberlandslaget.no/challenges#)

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Reverse_Engineering_What_time_is_it_.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **PassProtector**

Does obfuscation scare you?

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Reverse_Engineering_PassProtector.zip)

---

### **Stern Broccoli**

Just a stern broccoli file.

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Reverse_Engineering_Stern_Broccoli.zip)

---

### **NotepadLauncher**

I made this new and super useful tool! Check it out: although you need a license to use it...

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Reverse_Engineering_NotepadLauncher.zip)

---

### **DDCLE**

Wordle theme is still relevant right?

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Reverse_Engineering_DDCLE.zip)

---

## Cryptography/

---

### **Vigenère's dictionary**

A more advanced substitution cipher is the Vigenère cipher, where a longer key is used to prevent brute-force attacks.

The key was chosen from a Danish dictionary, making it easy to remember.

The encrypted flag is in Danish: can it be decrypted even though it is very short?

Remember to format the result as a flag. (DDC example flag -> **DDC{example_flag}**)

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Cryptography_Vigen%C3%A8re_s_dictionary.zip)

---

### **Long live, Caesar!**

One of the oldest forms of encryption is the Caesar cipher, where each letter is shifted by a secret key.

This time, someone has modified the Caesar cipher by using multiplication instead of addition.

Can you decrypt the flag?

Remember to format the result as a flag. (DDC example flag -> **DDC{example_flag}**)

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Cryptography_Long_live__Caesar_.zip)

---

### **AES Decryption**

You've intercepted a Base64-encoded AES-encrypted message, along with a potential key. Analyze and decrypt the ciphertext to uncover the secret at:

[aes-ddc.hkn](https://ctf.cyberlandslaget.no/challenges#)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **Binary-Encodings1**

I heard hackers like binary, so I took my flag and binarified it, then scattered it among the primes! Can you reconstruct it from these small numbers, then undo my super cool permutation?

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Cryptography_Binary-Encodings1.zip)

---

### **dlog**

A good cryptographer understands when assumptions are instantiated securely

[dlog.hkn:9999](https://ctf.cyberlandslaget.no/challenges#)

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Cryptography_dlog.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **RSA2**

I overslept and missed the lecture on RSA, but gave it a try anyway!

Update 23/02: A player made us aware that the original output.txt wasn't an exact output of the chal.py provided. After investigation it seems that during some parameter changes during testing, the original output was messed it up slightly. We have double checked that our solution still works on it despite this.

For completeness, we've made a new handout where output.txt was generated by the exact script in the handout. We are keeping the old handout for transparency. Again, our solution works on both.

Note: The new handout has a different flag to the original handout. Both flags are accepted by ctfd, so you can solve using either handout :)

[New Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Cryptography_rsa2_handout_new.zip) sha256: 795f6186972f360056186e7037e26371b12bac5918db2a42242059ae924e25ed

---

### **Binary-Encodings2**

Were all those outputs in the previous challenge really so neccesary?

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Cryptography_Binary-Encodings2.zip)

---

### **Learning What Exists**

So you know 15 different attacks against RSA and can recognise small primes at a glance... How about a basic post quantum primitive?

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Cryptography_Learning_What_Exists.zip)

---

### **dlog 2**

A good CTF player knows when you can cheese with compute and when you cant!

> Note: This challenge is solveable on standard consumer hardware! If you have a solution that is barely missing the timeout (on a normal laptop/pc) then open a ticket!

[dlog2.hkn:9999](https://ctf.cyberlandslaget.no/challenges#)

Update: 27/02 We've received a few questions about the compute required for this challenge, so here's a vps benchmark in the hopes of providing clarity.

On a cheap Digital Ocean droplet, (premium intel cpu-optimised (4vcpu),) the reference solve script was able to get the flag locally within the challenge timeout after a few attempts.

The challenge has multiple solves, but we are still willing to support people having issues specifically due to slow personal hardware. If you have a working local solution that gets flag, but misses the timeout by a bit due to slow hardware, open a ticket and we'll see if we can help. (Alternatively, knowing how to rent a cheap online server for computation/ping advantages can be a good skill for a ctf'er to learn ^^)

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Cryptography_dlog_2.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **Authenticated Privilige 2, symmetric psyducks return!**

If all the math gets too much, there's always symmetric cryptography :)

In 2022 we made a nice beginner GCM challenge, but reading writeups like:

(https://rektedekte.github.io/CTF-writeups/ddc-qualifiers-2023/authenticated-privilege/)

it seems like players found all sorts of vulnerabilities in my code, like no domain seperating AAD, and an endpoint to set repeated nonces?????

I've fixed all those flaws, and even temporarily removed the super-admin registration, so lets see what people can do now! \o/

[gcm.hkn:8000](https://ctf.cyberlandslaget.no/challenges#)

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Cryptography_Authenticated_Privilige_2__symmetric_psyducks_return_.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

## Binary/

---

### **gotowin**

Check this binary and see if you can go for the win!

Tip: The password is really hard to guess.

`gotowin.hkn:8080`

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Binary_gotowin.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **PWN me good uwu**

UwU~ our wittle zerochain has a tiny buffer boo-boo! >w< Overflow the stack (gently, pwease~), align it wif a smol ret, and jump to the hidden function~ OwO. If you're a good hax0r, it'll spill its secwet fwag~ uwu ✨.

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Binary_PWN_me_good_uwu.zip)

[uwu.hkn:4242](https://ctf.cyberlandslaget.no/challenges#)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **PWN me good uwu: Wifu Edition**

OwO~ Part 2 is here, and it's even spicier! This time, our wifu binary zerochain2 is hiding behwiiind a stwong stack canawy and sneaky memowy wandomization~ >w< But dwon't wowwy, we got dis!

Defeat the defenses, bypass the canawy, and uwrap the fwag wike a pwesent fow wifu~ 💖 OwO.

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Binary_PWN_me_good_uwu_-_Wifu_Edition.zip)

[uwu-wifu.hkn:6969](https://ctf.cyberlandslaget.no/challenges#)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **ROPlicator**

"Watch this", said a pwner before running an overly complicated solve.py and printing out a flag. I would ask them what they did, but they are too busy scrolling through job offers. Luckily I still have the binary and network traffic, can you make sense of it?

> Note: This challenge doesn't have a remote, see if you can use the pwners logs to help you pwn the binary locally!
> 

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Binary_ROPlicator.zip)

---

### **EzWin**

I've found a new Privilege Management tool for Windows 11! It's not quite ready for production, but I've setup a test environment for it running the latest Windows 11 24H2 (26100.2454). Now your malware won't be able to get my flag from C:\Users\Administrator\flag.txt.

Please only submit a payload when you have a working local exploit. You should only install EzAdmin in a virtual machine, running the same version of Windows 11 with secure boot disabled. You get to submit an executable that can run standalone and get a screenshot afterwards. You have an execution limit of 1-2 minutes. If your payload doesn't work, it might have been caught by defender.

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Binary_EzWin.zip)

https://ezwin.ctftech.uk/

---

## Web exploitation

---

### **Cross Site Job**

Secure Corp is looking for new talent, and you have the chance to submit your application through their online job application system. The website contains a job application form and an administrative section, which is only accessible to employees. Your task is to find a way to gain access to this section.

Once your application is submitted, the administrator will immediately review it in their browser.

(Reminder: The challenge servers cannot reach the wider internet, but maybe you can make the administrator's browser send a request and capture it using [http://webhook.hkn](http://webhook.hkn/), `http.server`, or `netcat`.)

Website: [http://cross-site-job.hkn](https://ctf.cyberlandslaget.no/challenges#)

Source code: [webexp_cross-site-job.zip](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Web_exploitation_Cross_Site_Job.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **Leaky Store**

New products have arrived in the shop, so take a look! You can shop via the website or our API.

It’s definitely completely secure, so we don't expect there to be any chance that our database could be leaked.

[http://leaky-store.hkn](https://ctf.cyberlandslaget.no/challenges#)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **Complete Styling Sadness**

Sometimes, things need to be adjusted to fit perfectly together. Take a closer look at the structure and order: the solution lies in the details.

I've heard from my friends that **CSS is always the answer.**

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Web_exploitation_Complete_Styling_Sadness.zip)

---

### **Find Frontdoor**

We've all heard of "backdoors" in software, but what about a "frontdoor"?

I locked the flag behind a super secret code, and even saved on server compute by making the client check the code locally on their own computer!

My security friends mentioned something about "client side validation is bad" or "inspecting elements", but deadlines are deadlines so we're shipping it!

See the webste at: [findfrontdoor.hkn:8080](https://ctf.cyberlandslaget.no/challenges#)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **DDC Lounge**

The right honorable Jens has used part of the years DDC budget to make a lounge for all the competitors! I'm sure they didn't skimp on anything, since DDC only deserves the best!

[http://ddc-lounge.hkn](https://ctf.cyberlandslaget.no/challenges#)

[webexp_ddc-lounge.zip](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Web_exploitation_DDC_Lounge.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **Film til dig pt 1**

0xlime things you should sit down and watch some films. There are two flags, find a film for you at [film-til-dig.hkn](https://ctf.cyberlandslaget.no/challenges#), and remember to share your thoughts!

[film-til-dig.hkn](https://ctf.cyberlandslaget.no/challenges#)

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Web_exploitation_Film_til_dig_pt_1.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **Film til dig pt 2**

Find film til dig part 2

[film-til-dig.hkn](https://ctf.cyberlandslaget.no/challenges#)

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Web_exploitation_Film_til_dig_pt_2.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **php101**

Welcome to the first lecture in php101! Since php is by far the most widely used* language, its important to have a good understanding of how you write nice clean code thats easy to maintain.

To this end, here's a little intro challenge to capture the essence of how simple and effective php can be!

- Source: my imagination

[php101.hkn](https://ctf.cyberlandslaget.no/challenges#)

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Web_exploitation_php101.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

## Misc/

---

### **Masahiro Hara**

👉 [Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Misc_Masahiro_Hara.zip) 👈

---

### **The Professor's Lost Note**

**Scenario:** A cybersecurity professor at the university, Dr. Niels Andersen, has been working on a set of notes containing tips and solutions for the upcoming exams. Unfortunately, Dr. Andersen misplaced one of these files, **hint.txt**, while organizing his folders, and now he needs your help to retrieve it before it's too late!

You have been given a folder named **Professor_Notes**, which contains multiple files. Somewhere in this folder, there is a hidden file containing Dr. Andersen’s important note. However, it seems like the file is not directly visible in the folder.

**Tip:** The note you are looking for may not be immediately obvious. By using the right terminal commands to explore directories and inspect files and their contents, you will be able to find the lost information.

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Misc____The_Professor_s_Lost_Note.zip)

---

### **Shutter Trace**

You work in the police investigation department and have received an anonymous lead on a criminal case. Your chief has shared a folder containing the evidence, and your task is to uncover the identity of the person who took the photo found in the folder.

Search for the **"clue.txt"** file in the **"Clue"** folder to uncover information that will guide you to the correct folder where the image is stored. You may also investigate the image's creator.

**Tips:**

Some important concepts you might want to consider include hidden files, encoding (base64), and using **exiftool** to analyze image metadata.

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Misc____Shutter_Trace.zip)

---

### **Hasher is back**

💀 We hashed the flag, can you crack it?💀

MD5 Hash: 24bb5c555b8f32d27eaeec9c5522b576

🛠️ find the value we hashed and insert it into the flag format like so: DDC{cracked-hash-words-here} . 🛠️

```
Pro tip: Its **not** possible to reverse a hash directly to go **from** the hash value back to its "pre-image". However **if** you have some guesses **for** what the the original message could be, you can test them to see **if** they match **in** a so-called "dictionary attack"! Tools like john the ripper **or** hashcat can **do** **this** very fast, **or** you can **try** googling to find databases of pre-computed hashes to look the hash up **in**.
```

---

### **DDC Admin Bot**

Note: This is not a social engineering challenge, we've given you the source code of the bot! Do not message admins/other users asking them to verify you.

---

We made a super cool discord server for all the DDC (danish cyber championship) admins! To make it easier to add new admins I've made a discord bot!

Here's a [link to the server](https://discord.com/invite/WV8e4SD84v).

You can also have the bot's source code so you can see how it works!

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Misc_DDC_Admin_Bot.zip)

---

### **max 420**

Show that you are a python whisperer! Feel free to chuckle every time you see a funny number.

[max420.hkn:4200](https://ctf.cyberlandslaget.no/challenges#)

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Misc_max_420.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **max 69**

Denne udfordring er ikke for sarte sjæle! Vis, at du er en pythonhvisker! Du er velkommen til at grine, hver gang du ser et sjovt nummer.

English: This challenge is not for the faint of heart! Show that you are a python whisperer! Feel free to chuckle every time you see a funny number.

> nc max-69.hkn 6969

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Misc_max_69.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **Roll your own crypto**

Why make a new "cyberchef crypto" challenge every year, when we can make a "make a cyberchef crypto challenge" challenge instead!

[rollyourowncrypto.hkn:9999](https://ctf.cyberlandslaget.no/challenges#)

[Handout](https://campfirestorageaccount.blob.core.windows.net/ctf-handouts/ddc2025/Misc_Roll_your_own_crypto.zip)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

## Boot2root/

---

### **The Gauntlet pt 1**

So, you think you're a l33t h4xx0r? Alright, here's my little gauntlet to you then: Break in through the website and get a shell one way or another. Once that's done, escalate your privileges and own the box. You won't be needing any fancy kernel exploits or such, this one's all about bad practices and misconfigurations. Doesn't sound too hard, now does it? Good luck!

Flag binaries are located at /home/*****/user.flag and /root/root.flag [the-gauntlet.hkn](https://ctf.cyberlandslaget.no/challenges#)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)

---

### **The Gauntlet pt 2**

So, part two.. gitgud, get root..

[the-gauntlet.hkn](https://ctf.cyberlandslaget.no/challenges#)

**NOTE:**

Create a user and find the VPN and Browser LABs on [Campfire Labs](https://nordics.campfiresecurity.dk/)
