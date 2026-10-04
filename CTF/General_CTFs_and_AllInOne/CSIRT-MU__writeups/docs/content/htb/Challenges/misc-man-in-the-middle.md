---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Misc: Man in the middle

First by simply reading the data we can see the textual header teling us that this is a `btsnoop` file. That can be analysed using `btmon` or `Wireshark`. While the prior can give some statistical information, we need to use Wireshark.

Now the hard part is to figure out what are the packets sayng. We try to decode them using different **bluetoth device profiles** and look closely if there is a mathch. It matches on a MOUSE and KEYBOARD. The packets are mouse movements and key events (shorter packets). The longer packets are the keyboardevents.

If we mimic the keyboard (key presses, shift presses, etc), we get the flag.