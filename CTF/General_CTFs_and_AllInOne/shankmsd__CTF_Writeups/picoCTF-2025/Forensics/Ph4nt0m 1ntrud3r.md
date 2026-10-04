## Challenge 🧩

A digital ghost has breached my defenses, and my sensitive data has been stolen! 😱💻 </br>
Your mission is to uncover how this phantom intruder infiltrated my system and retrieve the hidden flag. </br>
To solve this challenge, you'll need to analyze the provided PCAP file and track down the attack method. The attacker has cleverly concealed his moves in well timely manner. Dive into the network traffic, apply the right filters and show off your forensic prowess and unmask the digital intruder! </br>

Author: Prince Niyonshuti N.</br>
Points: 50

Hints :

1. Filter your packets to narrow down your search.
2. Attacks were done in timely manner.
3. Time is essential

## Solution 🕵️‍♂️

Sort the packets by timestamp of the frame to get the required Base64 encoded data from 6 tcp packets of length 12 and a tcp packet of length 4.

```text
cGljb0NURg==
ezF0X3c0cw==
bnRfdGg0dA==
XzM0c3lfdA==
YmhfNHJfeA==
eHh4eHh4eA==
fQ==
```

```bash
┌──(user㉿shell)-[~]
└─$ printf "%s\n" \
cGljb0NURg== \
ezF0X3c0cw== \
bnRfdGg0dA== \
XzM0c3lfdA== \
YmhfNHJfeA== \
eHh4eHh4eA== \
fQ== | base64 --decode
picoCTF{1t_w4snt_th4t_34sy_tbh_4r_xxxxxxxx}
```

### Tool Used

> `Wireshark`

## Flag 🚩

`picoCTF{1t_w4snt_th4t_34sy_tbh_4r_xxxxxxxx}`
