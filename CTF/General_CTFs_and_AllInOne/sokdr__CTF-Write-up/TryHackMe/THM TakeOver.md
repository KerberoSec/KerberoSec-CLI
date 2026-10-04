# CTF Write Up

## TakeOver

### URL: https://tryhackme.com/room/takeover

### Created by _https://tryhackme.com/p/JohnHammond_,  _https://tryhackme.com/p/cmnatic_,  _https://tryhackme.com/p/fumenoid_,  _https://tryhackme.com/p/timtaylor_

![logo](https://tryhackme.com/_next/image?url=https%3A%2F%2Fcdn-images.tryhackme.com%2Froom-icons%2Fe11be3e91db093a84dd92e794e9f8181.png&w=96&q=75)

---

We fire up the virtual environment and then we add the domain to `/etc/hosts`.

<img width="804" height="40" alt="Image" src="https://github.com/user-attachments/assets/7221d0f7-f188-4d8f-9448-62459f7472c0" />

Then we start `nmap` to find open ports.

<img width="1013" height="292" alt="Image" src="https://github.com/user-attachments/assets/1e546db7-aef5-47bd-9944-3b30e78d451e" />

We found three open ports. After accessing port `443` we were not able to obtain any further information from the certificate.

Then we move on with `ffuf` and try to fuzz subdomains and identify a valid path.

<img width="1233" height="645" alt="Image" src="https://github.com/user-attachments/assets/0c905843-6ce3-4fbb-b869-82cffae6fe71" />

We found a subdomain and add it to `/etc/hosts`.

<img width="688" height="526" alt="Image" src="https://github.com/user-attachments/assets/0c42c51f-06ca-4156-af4c-d5c81b4e1b43" />

We then access the certificate information from our browser `firefox` and we see in the relevant information a new subdomain, we also add the new one to `/etc/hosts/`.

<img width="778" height="325" alt="Image" src="https://github.com/user-attachments/assets/05b66441-2519-4560-b672-de59512963d1" />

We access the new subdomain and on url we see the flag.

<img width="913" height="240" alt="Image" src="https://github.com/user-attachments/assets/324b3be8-15f1-4166-992c-01668e95361a" />
