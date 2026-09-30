1. open the pcap file on wireshark
2. scrolling throught the list, there are strings in the payload that has a format like this: 
```
s0(UEsDBBQAAAAAAGp2flzxTMGOpyAEAKcgBAAQAAAAcdn-updatescom

s1(ZWNjaGllY2NoaWt1LnBuZ4lQTkcNChoKAAAADUlIcdn-updatescom

...

s9024(AAAAGgAAAAAAAAAAAAAAgAHVIAQAc3lzdGVtLy5jcdn-updatescom

s9025(b25maWcvLmhpZGRlbi5kYXRQSwUGAAAAAAIAAgCGcdn-updatescom

s9026AAAAKSEEAAAAcdn-updatescom
```
- we can easily search list items with this format if we ctrl + f. then select Packet bytes. and typing `cdn` 
- in the left side it is much clearer:
```
...
    Queries
        s0.UEsDBBQAAAAAAGp2flzxTMGOpyAEAKcgBAAQAAAA.cdn-updates.com: type A, class IN
            Name: s0.UEsDBBQAAAAAAGp2flzxTMGOpyAEAKcgBAAQAAAA.cdn-updates.com
            [Name Length: 59]
            [Label Count: 4]
            Type: A (1) (Host Address)
            Class: IN (0x0001)

...
    Queries
        s1.ZWNjaGllY2NoaWt1LnBuZ4lQTkcNChoKAAAADUlI.cdn-updates.com: type A, class IN
            Name: s1.ZWNjaGllY2NoaWt1LnBuZ4lQTkcNChoKAAAADUlI.cdn-updates.com
            [Name Length: 59]
            [Label Count: 4]
            Type: A (1) (Host Address)
            Class: IN (0x0001)
```
3. so the pattern is like `s{index}.{base64_data}.cdn-updates.com`. we combine every base64 data. it will form a file, i think.
- note: if we use cyberchef and paste the base64 from `s1.ZWNjaGllY2NoaWt1LnBuZ4lQTkcNChoKAAAADUlI.cdn-updates.com`, drag magic and turn on intensive mode, we can see the file `ecchiecchiku.png`.
4. we have a huge suspicion that its a zip file. run `solve.py`
5. if we extract it we will see `ecchiecchiku.png` and `output\system\.config\.hidden.dat`.
6. inside `.hidden.dat` is a base64. use cyberchef and paste it, drag magic and turn on intensive mode. we will find 
```
w4g_k4ng_bast05_123
```
7. if we use `strings` on the png we will find:
```
--CTF--A1S{ul0l_h1nd1_p4_1t0_un6_fl4g_bl3hh}
```
8. idk what to do anymore