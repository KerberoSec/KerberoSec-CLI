## Bike HackTheBox
#### Box info
SSTI and Node.js. 2 deadly combo.

---
#### Recon
```bash
sudo nmap -A -sV --privileged -T4 <ip> -p- -O -sC -v | tee -a nmap.md
```
**`Result:`**
|PORT|STATE|SERVICE|VERSION|
|---|---|---|---|
|22/tcp|open|ssh|OpenSSH 8.2p1 Ubuntu 4ubuntu0.4 (Ubuntu Linux; protocol 2.0)|
|80/tcp |open|http|Node.js (Express middleware)|

If we view the site `wappalyzer` will show some more info:
- Running express
- has Jquery

Now I will fuzz for directories and files using `FFUF`:
```
ffuf -u http://10.129.124.162/FUZZ -w ~/custom-wl/OneListForAll/onelistforallmicro.txt -v -r -c -fc 404,403
```
got nothing. but htb suggest we should use **`SSTI`**. Well, let's do that.

#### Getting in
simple ssti gives us error, which means this is getting executed in the backend. 

Even though it's a beginner level Box, it's still quite hard and that's good. I had to look at the writeup to get what's going on. I will stop here as I followed the writeup. I don't have to 'reinvent the wheel' here.

***`Over and out`***