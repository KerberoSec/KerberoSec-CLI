# sewing-waste-and-agriculture-leftovers
> UDP: UNRELIABLE datagram protocol.

## About the Challenge
We were given a `pcap` file (You can get the file here)

## How to Solve?
First i extract the pcap and then import the file into `Wireshark`. And then check every packet by pressing `Ctrl + Alt + Shift + U` to follow the UDP stream

*[Image: udp_1]*

*[Image: udp_2]*

If we examine each packet, the data in each packet will form a flag but there are still many parts missing, so to solve this chall there are 2 ways combine each packet manually (Like me :D) or you can create a script to get the flag. In this case i check every packet manually and then you will get the flag

*[Image: flag]*

```
kalmar{if_4t_first_you_d0nt_succeed_maybe_youre_us1ng_udp}
```