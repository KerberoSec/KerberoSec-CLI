The main problem in discovering covert channels is to look at the data from the right angle. One method is going through the ip and tcp header fields one by one and assessing them.

Looking at the remote port:

`tcpdump -nn -l -r cc3.pcap dst 192.168.120.179 and tcp | cut -d " " -f 3 | cut -d "." -f 5 | less`

Reveals that it's only communicating to port 443, so no hidden channel in that field.

Looking at the local port:

`tcpdump -nn -l -r cc3.pcap src 192.168.120.179 and tcp | cut -b 36-40 | while read i; do printf "%x\n" $i; done | less`

Gives some more variety, but nothing that comes out as a flag. The art here is to know when to stop digging further into the rabbit hole.

Going further through the fields at some point we look at the options:

`tcpdump -nn -l -r cc3.pcap src 192.168.120.179 and tcp | grep options | sed -e "s/.*options \[//" -e "s/\].*//" | less`

Here we'll see the options starting out with long series of similar lines of `nop,nop,TS val 305632336 ecr 2259981247`. The list also ends the same way. But in the middle we'll see lines with alternating position of the nops:

```
nop,TS val 1281398200 ecr 1140542569,nop
nop,TS val 1281398203 ecr 2575013073,nop
nop,nop,TS val 1281398210 ecr 3592284721
nop,TS val 1281398211 ecr 928585952,nop
nop,nop,TS val 1281398211 ecr 3755910247
nop,nop,TS val 1281398212 ecr 1950423018
nop,TS val 1281398212 ecr 353573636,nop
nop,nop,TS val 1281398215 ecr 2058448215
nop,TS val 1281398216 ecr 1140542569,nop
```

Digging further into this we discover that the only connections exhibiting this behaviour is with the destination 95.101.195.101. Enterpreting nop's in the end of options as 1 and the opposite as 0 will result in a bit stream containing the flag.

```sh
$ cat solve.sh 
d=$(tcpdump -nn -l -r cc3.pcap dst 95.101.195.101 | grep options | while read l; do echo "$l" | grep -F -q 'nop]'; if [ $? -eq 0 ]; then echo -n 1; else echo -n 0; fi; done)
e=$(echo "$d" | sed -e 's/11111111//' -e 's/111111110.*//')
python3 -c "import sys;n=int(sys.argv[1],2);print(n.to_bytes((n.bit_length() + 7) // 8, 'big').decode())" "$e"
```
