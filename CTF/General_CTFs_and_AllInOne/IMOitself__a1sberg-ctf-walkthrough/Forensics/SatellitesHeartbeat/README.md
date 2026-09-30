1. ```
tshark -r capture.pcap -Y "icmp.type == 8" -w clean.pcap
```
2. ```
tshark -r clean_pings.pcap -T fields -e frame.time_delta
```
3. copy the output and put it into deltas.txt
4. run a.py