source : [here](https://youtu.be/Iv8ig0PoDlc?si=hTY-TXaeBFFdWpqe)

## What is PING?

- Packet Internet Gropher.
- Check Network Connectivity.
- Check Network Interface card.
- Check Latency on Network.
- DNS Resolution

---

## How ping command works? 

```ping 192.168.0.101```

- Ping command will send some packets from my computer to ```192.168.0.101```. The packets will send through ICMP which is Internet Control Message Protocol.

---

__If ping command or packets are losted then what the reason will be?__

- Servers Firewall
- Server down
- Connectivity Issue
- Hardware Issue
- Network Traffic
- Own Hardware issue (ping localhost/127.0.0.1)

---

## Some Ping Commands
- ```ping ip```
- ```ping hostname```
- ```ping -c 3``` (for internet times only)
- ```ping -i 2``` (intervals to send packets)
- ```ping -c 5 -q``` (This will only give summary)
- ```ping -f``` (to send packets as fast as possible to test the network performance)
- ```ping -s 500``` (change size of the packets)
- ```ping -w 10``` (to stop printing after 10 sec)
- ```ping -D www.google.com``` (also print timesstamp to remember the time)
- ```ping -a``` (audible)
