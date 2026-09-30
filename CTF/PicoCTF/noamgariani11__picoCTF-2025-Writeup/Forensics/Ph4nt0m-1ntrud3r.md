# Description

A digital ghost has breached my defenses, and my sensitive data has been stolen! 😱💻 Your mission is to uncover how this phantom intruder infiltrated my system and retrieve the hidden flag.
To solve this challenge, you'll need to analyze the provided PCAP file and track down the attack method. The attacker has cleverly concealed his moves in well timely manner. Dive into the network traffic, apply the right filters and show off your forensic prowess and unmask the digital intruder!
Find the PCAP file here Network Traffic PCAP file and try to get the flag.

# Solution

After downloading the pcap file you can open it with [wireshark](https://www.wireshark.org/) to view the packets. You can also use `wget https://challenge-files.picoctf.net/c_verbal_sleep/4d25aca04e2409ba0d917d8ed27d49c6fb616ff9603fa3926712cce623a3d7f5/myNetworkTraffic.pcap` and run `strings myNetworkTraffic.pcap` to get it through the terminal and see that the packets have a series of base64.

Strings output:
```
X5w4OZo=:
H7DUfjk=:
ob0o5i0=:
y50ZdmI=:
y1vZtpY=:
hBFmx3U=:
b0gkDEE=:
fQ==:
cGljb0NURg==:
8WXUPlw=:
KWH98Vc=:
kpRM1Ck=:
ZTEwZTgzOQ==:
6dmdW8U=:
XzM0c3lfdA==:
FNoN3tc=:
bnRfdGg0dA==:
LJzhGLY=:
tXcY/Ew=:
YmhfNHJfOA==:
ezF0X3c0cw==:
FUiWx28=
```

From here you can notice that there are multiple strings of base64 of a longer length with two equal signs for padding and assume that they are the flag and try to assemble them. However, the less brute force way to do it is to sort the packets based on the time. Once you sort the packets from the lowest time to largest than you can packet No. 9 [TCP Out-of-Order] which is the first in the series that has the flag. The next 6 packets are the rest of the segments of the flag (21, 17, 15, 20, 13, 8) and once all 7 segments are assembled you get the flag in base64:

```
cGljb0NURg==
ezF0X3c0cw==
bnRfdGg0dA==
XzM0c3lfdA==
YmhfNHJfOA==
ZTEwZTgzOQ==
fQ==
```

From here you can use [CyberChef](https://gchq.github.io/CyberChef/#recipe=From_Base64('A-Za-z0-9%2B/%3D',true,false)&ieol=CRLF&oeol=FF) with the base64 recipe. Or you can just put the string piped into `base64 -d`:

```
echo "cGljb0NURg==
ezF0X3c0cw==
bnRfdGg0dA==
XzM0c3lfdA==
YmhfNHJfOA==
ZTEwZTgzOQ==
fQ==" | base64 -d
```

Either way, the decoded base64 gives the flag.

Flag: `picoCTF{1t_w4snt_th4t_34sy_tbh_4r_8e...}`