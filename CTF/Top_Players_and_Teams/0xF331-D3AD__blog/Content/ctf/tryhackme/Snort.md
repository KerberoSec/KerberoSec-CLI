
# Snort

## *Interactive Material and VM*

- Navigate to the Task-Exercises folder and run the command "./.easy.sh" and write the output

> Too Easy!

---

## *Introduction to IDS/IPS*

- Which snort mode can help you stop the threats on a local machine?

> HIPS

- Which snort mode can help you detect threats on a local network?

> NIDS

- Which snort mode can help you detect the threats on a local machine?

> HIDS

- Which snort mode can help you stop the threats on a local network?

> NIPS

- Which snort mode works similar to NIPS mode?

> nba

- According to the official description of the snort, what kind of NIPS is it?

> full-blown

- NBA training period is also known as ...

> baselining

---

## *First Interaction with Snort*

- Run the Snort instance and check the build number.

```bash
$ snort -V
```

> 149

- Test the current instance with "/etc/snort/snort.conf" file and check how many rules are loaded with the current build.

```bash
$ sudo snort -c /etc/snort/snort.conf -T
```

After all the warnings there's a note about rules added.

> 4151

- Test the current instance with "/etc/snort/snortv2.conf" file and check how many rules are loaded with the current build.

> 1

---

## *Operation Mode 2: Packet Logger Mode*

- Now, you should have the logs in the current directory. Navigate to folder "145.254.160.237". What is the source port used to connect port 53?

> 3009

- Use snort.log.1640048004. Read the snort.log file with Snort; what is the IP ID of the 10th packet?

```bash
$ snort -r snort.log.1640048004 -n 10 -q
```

> 49313

- Read the "snort.log.1640048004" file with Snort; what is the referer of the 4th packet?

```bash
$ snort -r snort.log.1640048004 -q -n 4 -X
```

> http://www.ethereal.com/development.html

- Read the "snort.log.1640048004" file with Snort; what is the Ack number of the 8th packet?

> 0x38AFFFF3

- Read the "snort.log.1640048004" file with Snort; what is the number of the "TCP port 80" packets?

```bash
$ snort -r snort.log.1640048004 -q 'tcp and port 80' >> tcp_port_80.txt

$ cat tcp_port_80.txt | grep '=+=.*' | wc -l
```

> 41

---

## *Operation Mode 3: IDS/IPS*

- What is the number of the detected HTTP GET methods?

You can see it in the statistics that appears after you terminate snort

> 2

---

## *Operation Mode 4: PCAP Investigation*

- What is the number of the generated alerts?

> 170

- Keep reading the output. How many TCP Segments are Queued?

> 18

- Keep reading the output.How many "HTTP response headers" were extracted?

> 3

- Investigate the mx-1.pcap file with the second configuration file. What is the number of the generated alerts?

> 68

- Investigate the mx-2.pcap file with the default configuration file. What is the number of the generated alerts?

> 340

- Keep reading the output. What is the number of the detected TCP packets?

> 82

- Investigate the mx-2.pcap and mx-3.pcap files with the default configuration file. What is the number of the generated alerts?

> 1020

---

## *Snort Rule Structure*

- Write a rule to filter IP ID "35369" and run it against the given pcap file. What is the request name of the detected packet?

Rule: ***alert icmp any any <> any any (msg: "Task packet found!"; id: 35369; sid: 1000001; rev: 1;)***

> TIMESTAMP REQUEST

- Create a rule to filter packets with Syn flag and run it against the given pcap file. What is the number of detected packets?

Rule: ***alert tcp any any <> any any (msg: "Task packet found!"; flags:S; sid: 1000001; rev: 1;)***

> 1

- Write a rule to filter packets with Push-Ack flags and run it against the given pcap file. What is the number of detected packets?

Rule: ***alert tcp any any <> any any (msg: "Task packet found!"; flags:P,A; sid: 1000001; rev: 1;)***

> 216

- Create a rule to filter packets with the same source and destination IP and run it against the given pcap file. What is the number of detected packets?

Rules:

```
alert tcp any any <> any any (msg: "TCP with same IP"; sameip; sid: 1000001; rev: 1;)
alert udp any any <> any any (msg: "UDP with same IP"; sameip; sid: 1000002; rev: 1;)
```

> 10

- Case Example: An analyst modified an existing rule successfully. Which rule option must the analyst change after the implementation?

> rev

