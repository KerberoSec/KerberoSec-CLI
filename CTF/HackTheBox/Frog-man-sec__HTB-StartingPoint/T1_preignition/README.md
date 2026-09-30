## Pre-ignition HackTheBox
#### Small Description
Web room. All about how basic of active recon (directory fuzzing).
**`Skills`**
- Nmap
- ffuf / gobuster / dirsearch

---

#### Step `Ox01`: Network Scan
Nmap, I chose you:
```bash
nmap -v -A -sV --privileged -T4 10.129.105.252 -p- -O -sC
```
**`Result`**
|PORT|STATE|SERVICE|VERSION|
|---|---|---|---|
|80/tcp|open|http|nginx 1.14.2|

Ahhh, finally, some web challange. I've been waiting for this.

Let's see what we can find here.

---

#### Step `Ox02`: Web Content Discovery
Now we will check what is this website contains.
- First thing we can confirm that we have `nginx 1.14.2` running in the backend.
- Page shows default nginx page. Now we will try to discover common files found on a nginx server/ site. For that I will use `Ffuf` and as wordlist I will use `one list for all`. <br>
```bash
# you can skip the user-agent and -fc
ffuf -u http://10.129.105.252/FUZZ -w ~/custom-wl/OneListForAll/dict/common_short.txt:FUZZ -w ~/custom-wl/user_agents/user-agents:AGNT -H "User-Agent: AGNT" -fc 400-499 -rate 10
```
- I got `admin.php`. Let's check it out. Brahh use default cred: `admin:admin` and get flag. WTF.