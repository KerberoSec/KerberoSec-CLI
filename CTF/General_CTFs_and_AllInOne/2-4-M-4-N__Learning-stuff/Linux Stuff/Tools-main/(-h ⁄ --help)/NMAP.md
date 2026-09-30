# Nmap (Network Mapper)

[Nmap: the Network Mapper: Free Security Scanner](https://nmap.org/)

```bash
┌─[root@parrot]─[/home/admin]
└──╼ #nmap -h
Nmap 7.95 ( https://nmap.org )
Usage: **nmap [Scan Type(s)] [Options] {target specification}**

**TARGET SPECIFICATION:**
Can pass hostnames, IP addresses, networks, etc.
**Ex: scanme.nmap.org, microsoft.com/24, 192.168.0.1; 10.0.0-255.1-254**

-iL <inputfilename>: Input from list of hosts/networks
-iR <num hosts>: Choose random targets
--exclude <host1[,host2][,host3],...>: Exclude hosts/networks
--excludefile <exclude_file>: Exclude list from file

**HOST DISCOVERY:**
-sL: List Scan - simply list targets to scan
-sn: Ping Scan - disable port scan
-Pn: Treat all hosts as online -- skip host discovery
-PS/PA/PU/PY[portlist]: TCP SYN, TCP ACK, UDP or SCTP discovery to given ports
-PE/PP/PM: ICMP echo, timestamp, and netmask request discovery probes
-PO[protocol list]: IP Protocol Ping
-n/-R: Never do DNS resolution/Always resolve [default: sometimes]
--dns-servers <serv1[,serv2],...>: Specify custom DNS servers
--system-dns: Use OS's DNS resolver
--traceroute: Trace hop path to each host

**SCAN TECHNIQUES:**
-sS/sT/sA/sW/sM: TCP SYN/Connect()/ACK/Window/Maimon scans
-sU: UDP Scan
-sN/sF/sX: TCP Null, FIN, and Xmas scans
--scanflags <flags>: Customize TCP scan flags
-sI <zombie host[:probeport]>: Idle scan
-sY/sZ: SCTP INIT/COOKIE-ECHO scans
-sO: IP protocol scan
-b <FTP relay host>: FTP bounce scan

**PORT SPECIFICATION AND SCAN ORDER:**
-p <port ranges>: Only scan specified ports
**Ex: -p22; -p1-65535; -p U:53,111,137,T:21-25,80,139,8080,S:9**
--exclude-ports <port ranges>: Exclude the specified ports from scanning
-F: Fast mode - Scan fewer ports than the default scan
-r: Scan ports sequentially - don't randomize
--top-ports <number>: Scan <number> most common ports
--port-ratio <ratio>: Scan ports more common than <ratio>

**SERVICE/VERSION DETECTION:**
-sV: Probe open ports to determine service/version info
--version-intensity <level>: Set from 0 (light) to 9 (try all probes)
--version-light: Limit to most likely probes (intensity 2)
--version-all: Try every single probe (intensity 9)
--version-trace: Show detailed version scan activity (for debugging)

**SCRIPT SCAN:**
-sC: equivalent to --script=default
--script=<Lua scripts>: <Lua scripts> is a comma separated list of
directories, script-files or script-categories
--script-args=<n1=v1,[n2=v2,...]>: provide arguments to scripts
--script-args-file=filename: provide NSE script args in a file
--script-trace: Show all data sent and received
--script-updatedb: Update the script database.
--script-help=<Lua scripts>: Show help about scripts.

**<Lua scripts> is a comma-separated list of script-files or
script-categories.**

**OS DETECTION:**
-O: Enable OS detection
--osscan-limit: Limit OS detection to promising targets
--osscan-guess: Guess OS more aggressively

**TIMING AND PERFORMANCE:**
O**ptions which take <time> are in seconds, or append 'ms' (milliseconds),
's' (seconds), 'm' (minutes), or 'h' (hours) to the value (e.g. 30m).**

-T<0-5>: Set timing template (higher is faster)
--min-hostgroup/max-hostgroup <size>: Parallel host scan group sizes
--min-parallelism/max-parallelism <numprobes>: Probe parallelization
--min-rtt-timeout/max-rtt-timeout/initial-rtt-timeout <time>: Specifies
probe round trip time.
--max-retries <tries>: Caps number of port scan probe retransmissions.
--host-timeout <time>: Give up on target after this long
--scan-delay/--max-scan-delay <time>: Adjust delay between probes
--min-rate <number>: Send packets no slower than <number> per second
--max-rate <number>: Send packets no faster than <number> per second

**FIREWALL/IDS EVASION AND SPOOFING:**
-f; --mtu <val>: fragment packets (optionally w/given MTU)
-D <decoy1,decoy2[,ME],...>: Cloak a scan with decoys
-S <IP_Address>: Spoof source address
-e <iface>: Use specified interface
-g/--source-port <portnum>: Use given port number
--proxies <url1,[url2],...>: Relay connections through HTTP/SOCKS4 proxies
--data <hex string>: Append a custom payload to sent packets
--data-string <string>: Append a custom ASCII string to sent packets
--data-length <num>: Append random data to sent packets
--ip-options <options>: Send packets with specified ip options
--ttl <val>: Set IP time-to-live field
--spoof-mac <mac address/prefix/vendor name>: Spoof your MAC address
--badsum: Send packets with a bogus TCP/UDP/SCTP checksum

**OUTPUT:**
-oN/-oX/-oS/-oG <file>: Output scan in normal, XML, s|<rIpt kIddi3,
and Grepable format, respectively, to the given filename.
-oA <basename>: Output in the three major formats at once
-v: Increase verbosity level (use -vv or more for greater effect)
-d: Increase debugging level (use -dd or more for greater effect)
--reason: Display the reason a port is in a particular state
--open: Only show open (or possibly open) ports
--packet-trace: Show all packets sent and received
--iflist: Print host interfaces and routes (for debugging)
--append-output: Append to rather than clobber specified output files
--resume <filename>: Resume an aborted scan
--noninteractive: Disable runtime interactions via keyboard
--stylesheet <path/URL>: XSL stylesheet to transform XML output to HTML
--webxml: Reference stylesheet from Nmap.Org for more portable XML
--no-stylesheet: Prevent associating of XSL stylesheet w/XML output

**MISC:**
-6: Enable IPv6 scanning
-A: Enable OS detection, version detection, script scanning, and traceroute
--datadir <dirname>: Specify custom Nmap data file location
--send-eth/--send-ip: Send using raw ethernet frames or IP packets
--privileged: Assume that the user is fully privileged
--unprivileged: Assume the user lacks raw socket privileges
-V: Print version number
-h: Print this help summary page.

**EXAMPLES:**
nmap -v -A scanme.nmap.org
nmap -v -sn 192.168.0.0/16 10.0.0.0/8
nmap -v -iR 10000 -Pn -p 80
SEE THE MAN PAGE ([https://nmap.org/book/man.html](https://nmap.org/book/man.html)) FOR MORE OPTIONS AND EXAMPLES
```

---

---

### TARGET SPECIFICATION

- **iL <inputfilename>**: এটি একটি ফাইল থেকে হোস্ট বা নেটওয়ার্কের লিস্ট নিয়ে স্ক্যান করে। কোথায় ব্যবহার: বড় লিস্টের হোস্ট স্ক্যান করতে। উদাহরণ: `nmap -iL hosts.txt`: যেখানে hosts.txt ফাইলে IP অ্যাড্রেস লিস্ট আছে, এটি সেই সব হোস্ট স্ক্যান করবে। প্র্যাকটিকাল: ধরুন আপনার অফিসের সব কম্পিউটারের IP লিস্ট একটা ফাইলে আছে, এটি ব্যবহার করে সহজে স্ক্যান করা যায়।
- **iR <num hosts>**: র্যান্ডমভাবে নির্দিষ্ট সংখ্যক হোস্ট সিলেক্ট করে স্ক্যান করে। কোথায় ব্যবহার: টেস্টিং বা র্যান্ডম স্যাম্পলিংয়ে। উদাহরণ: `nmap -iR 10`: ১০টা র্যান্ডম হোস্ট স্ক্যান করবে। প্র্যাকটিকাল: ইন্টারনেটের র্যান্ডম IP চেক করতে, যেমন ভালনারেবিলিটি রিসার্চে।
- **-exclude <host1[,host2][,host3],...>**: নির্দিষ্ট হোস্ট বা নেটওয়ার্ক স্ক্যান থেকে বাদ দেয়। কোথায় ব্যবহার: সেনসিটিভ হোস্ট এড়িয়ে যাওয়ার জন্য। উদাহরণ: `nmap 192.168.1.0/24 --exclude 192.168.1.1`: নেটওয়ার্ক স্ক্যান করবে কিন্তু 192.168.1.1 বাদ দিবে। প্র্যাকটিকাল: লোকাল নেটওয়ার্ক স্ক্যানে গেটওয়ে IP বাদ দিয়ে অন্যান্য ডিভাইস চেক করা।
- **-excludefile <exclude_file>**: একটা ফাইল থেকে বাদ দেওয়ার লিস্ট নেয়। কোথায় ব্যবহার: বড় লিস্টের হোস্ট বাদ দিতে। উদাহরণ: `nmap 10.0.0.0/8 --excludefile exclude.txt`: exclude.txt-এ লিস্টকৃত হোস্ট বাদ দিয়ে স্ক্যান। প্র্যাকটিকাল: কোম্পানির সেনসিটিভ সার্ভারের লিস্ট ফাইলে রেখে বাদ দেওয়া।

### HOST DISCOVERY

- **sL**: শুধু টার্গেট লিস্ট করে, কোনো স্ক্যান করে না। কোথায় ব্যবহার: টার্গেট ভেরিফাই করতে। উদাহরণ: `nmap -sL 192.168.1.0/24`: নেটওয়ার্কের সব IP লিস্ট করবে। প্র্যাকটিকাল: নেটওয়ার্কের সম্ভাব্য হোস্ট দেখার জন্য, আসল স্ক্যানের আগে।
- **sn**: পিং স্ক্যান করে, পোর্ট স্ক্যান না করে। কোথায় ব্যবহার: হোস্ট অনলাইন কিনা চেক করতে। উদাহরণ: `nmap -sn 192.168.1.1-10`: ১ থেকে ১০ IP অনলাইন কিনা দেখবে। প্র্যাকটিকাল: লোকাল নেটওয়ার্কে কোন ডিভাইস চালু আছে কিনা চেক করা।
- **Pn**: হোস্ট ডিসকভারি স্কিপ করে, সব হোস্টকে অনলাইন ধরে নেয়। কোথায় ব্যবহার: ফায়ারওয়াল যেখানে পিং ব্লক করে। উদাহরণ: `nmap -Pn scanme.nmap.org`: ডিরেক্ট পোর্ট স্ক্যান করবে। প্র্যাকটিকাল: রিমোট সার্ভার স্ক্যানে যেখানে পিং রেসপন্স না আসে।
- **PS/PA/PU/PY[portlist]**: TCP SYN/ACK, UDP বা SCTP প্রোব দিয়ে হোস্ট ডিসকভারি। কোথায় ব্যবহার: স্ট্যান্ডার্ড পিংয়ের পরিবর্তে। উদাহরণ: `nmap -PS80,443 scanme.nmap.org`: পোর্ট ৮০ এবং ৪৪৩-এ SYN প্রোব পাঠাবে। প্র্যাকটিকাল: ফায়ারওয়াল বাইপাস করে হোস্ট চেক করা।
- **PE/PP/PM**: ICMP ইকো, টাইমস্ট্যাম্প, নেটমাস্ক প্রোব দিয়ে ডিসকভারি। কোথায় ব্যবহার: ICMP-ভিত্তিক ডিসকভারি। উদাহরণ: `nmap -PE 192.168.1.1`: ICMP ইকো রিকোয়েস্ট পাঠাবে। প্র্যাকটিকাল: নেটওয়ার্কের হোস্ট ডিটেক্ট করতে যেখানে ICMP অনুমোদিত।
- **PO[protocol list]**: IP প্রোটোকল পিং দিয়ে ডিসকভারি। কোথায় ব্যবহার: নন-স্ট্যান্ডার্ড প্রোটোকল চেক। উদাহরণ: `nmap -PO1,2 scanme.nmap.org`: প্রোটোকল ১ এবং ২ চেক করবে। প্র্যাকটিকাল: বিশেষ প্রোটোকল সাপোর্ট চেক করতে।
- **n/-R**: -n: DNS রেজোলিউশন না করে; -R: সবসময় করে। কোথায় ব্যবহার: DNS হ্যান্ডলিং কন্ট্রোল করতে। উদাহরণ: `nmap -n 192.168.1.1`: IP থেকে হোস্টনেম না খুঁজবে। প্র্যাকটিকাল: ফাস্ট স্ক্যানের জন্য DNS স্কিপ করা।
- **-dns-servers <serv1[,serv2],...>**: কাস্টম DNS সার্ভার স্পেসিফাই করে। কোথায় ব্যবহার: ডিফল্ট DNS না ব্যবহার করে। উদাহরণ: `nmap --dns-servers 8.8.8.8 scanme.nmap.org`: Google DNS ব্যবহার করবে। প্র্যাকটিকাল: প্রাইভেট নেটওয়ার্কে কাস্টম DNS দিয়ে স্ক্যান।
- **-system-dns**: OS-এর DNS রিজলভার ব্যবহার করে। কোথায় ব্যবহার: nmap-এর ডিফল্ট DNS না চাইলে। উদাহরণ: `nmap --system-dns scanme.nmap.org`। প্র্যাকটিকাল: লিনাক্স সিস্টেমের ডিফল্ট DNS দিয়ে রেজোলিউশন।
- **-traceroute**: প্রত্যেক হোস্টের হপ পাথ ট্রেস করে। কোথায় ব্যবহার: রুট ট্রেসিংয়ে। উদাহরণ: `nmap --traceroute scanme.nmap.org`: পাথ দেখাবে। প্র্যাকটিকাল: নেটওয়ার্ক ট্রাবলশুটিংয়ে রুট দেখা।

### SCAN TECHNIQUES

- **sS/sT/sA/sW/sM**: TCP SYN (ডিফল্ট, স্টেলথ), Connect (ফুল কানেকশন), ACK (ফায়ারওয়াল চেক), Window (উইন্ডো সাইজ চেক), Maimon (FIN/ACK) স্ক্যান। কোথায় ব্যবহার: TCP পোর্ট স্ক্যানে। উদাহরণ: `nmap -sS scanme.nmap.org`: SYN স্ক্যান। প্র্যাকটিকাল: ওয়েব সার্ভারের ওপেন পোর্ট চেক করতে -sS ব্যবহার।
- **sU**: UDP স্ক্যান। কোথায় ব্যবহার: UDP পোর্ট চেকে। উদাহরণ: `nmap -sU scanme.nmap.org`। প্র্যাকটিকাল: DNS সার্ভারের UDP পোর্ট ৫৩ চেক।
- **sN/sF/sX**: TCP Null (কোনো ফ্ল্যাগ না), FIN, Xmas (সব ফ্ল্যাগ) স্ক্যান: RFC ভায়োলেট করে ফায়ারওয়াল বাইপাস। কোথায় ব্যবহার: স্টেলথ স্ক্যানে। উদাহরণ: `nmap -sX scanme.nmap.org`। প্র্যাকটিকাল: IDS এড়িয়ে পোর্ট চেক।
- **-scanflags <flags>**: কাস্টম TCP ফ্ল্যাগ সেট করে। কোথায় ব্যবহার: অ্যাডভান্সড স্ক্যান কাস্টমাইজেশনে। উদাহরণ: `nmap --scanflags SYNACK scanme.nmap.org`। প্র্যাকটিকাল: স্পেসিফিক ফ্ল্যাগ দিয়ে টেস্টিং।
- **sI <zombie host[:probeport]>**: আইডল স্ক্যান, জম্বি হোস্ট দিয়ে। কোথায় ব্যবহার: সোর্স হাইড করতে। উদাহরণ: `nmap -sI zombiehost scanme.nmap.org`। প্র্যাকটিকাল: অ্যানোনিমাস স্ক্যানিংয়ে।
- **sY/sZ**: SCTP INIT/COOKIE-ECHO স্ক্যান। কোথায় ব্যবহার: SCTP প্রোটোকল চেকে। উদাহরণ: `nmap -sY scanme.nmap.org`। প্র্যাকটিকাল: টেলিকম নেটওয়ার্কে SCTP পোর্ট চেক।
- **sO**: IP প্রোটোকল স্ক্যান। কোথায় ব্যবহার: সাপোর্টেড প্রোটোকল চেকে। উদাহরণ: `nmap -sO scanme.nmap.org`। প্র্যাকটিকাল: রাউটারের প্রোটোকল সাপোর্ট দেখা।
- **b <FTP relay host>**: FTP বাউন্স স্ক্যান। কোথায় ব্যবহার: ওল্ড FTP সার্ভার দিয়ে রিলে। উদাহরণ: `nmap -b ftphost scanme.nmap.org`। প্র্যাকটিকাল: লিগ্যাসি সিস্টেম টেস্টিংয়ে।

### PORT SPECIFICATION AND SCAN ORDER

- **p <port ranges>**: নির্দিষ্ট পোর্ট স্ক্যান করে। কোথায় ব্যবহার: স্পেসিফিক পোর্ট ফোকাসে। উদাহরণ: `nmap -p 80,443 scanme.nmap.org`। প্র্যাকটিকাল: ওয়েব সার্ভারের HTTP/HTTPS চেক।
- **-exclude-ports <port ranges>**: নির্দিষ্ট পোর্ট বাদ দেয়। কোথায় ব্যবহার: অনাকাঙ্ক্ষিত পোর্ট এড়ানো। উদাহরণ: `nmap --exclude-ports 22 scanme.nmap.org`। প্র্যাকটিকাল: SSH পোর্ট বাদ দিয়ে অন্যান্য চেক।
- **F**: ফাস্ট মোড, কম পোর্ট স্ক্যান। কোথায় ব্যবহার: কুইক ওভারভিউ। উদাহরণ: `nmap -F scanme.nmap.org`। প্র্যাকটিকাল: দ্রুত চেক করতে।
- **r**: পোর্ট সিকোয়েন্সিয়ালি স্ক্যান, র্যান্ডম না। কোথায় ব্যবহার: অর্ডার্ড স্ক্যানে। উদাহরণ: `nmap -r -p1-100 scanme.nmap.org`। প্র্যাকটিকাল: ডিবাগিংয়ে অর্ডার দেখা।
- **-top-ports <number>**: টপ কমন পোর্ট স্ক্যান। কোথায় ব্যবহার: কমন পোর্ট ফোকাসে। উদাহরণ: `nmap --top-ports 100 scanme.nmap.org`। প্র্যাকটিকাল: সিকিউরিটি অডিটে কমন ভালনারেবল পোর্ট চেক।
- **-port-ratio <ratio>**: রেশিও-এর উপরে কমন পোর্ট স্ক্যান। কোথায় ব্যবহার: স্ট্যাটিস্টিকাল ফোকাসে। উদাহরণ: `nmap --port-ratio 0.9 scanme.nmap.org`। প্র্যাকটিকাল: হাই-প্রবাবিলিটি পোর্ট চেক।

### SERVICE/VERSION DETECTION

- **sV**: ওপেন পোর্টের সার্ভিস/ভার্সন ডিটেক্ট। কোথায় ব্যবহার: ডিটেল্ড ইনফো। উদাহরণ: `nmap -sV scanme.nmap.org`। প্র্যাকটিকাল: সার্ভারের Apache ভার্সন চেক করে ভালনারেবিলিটি খোঁজা।
- **-version-intensity <level>**: প্রোব ইনটেনসিটি সেট (০-৯)। কোথায় ব্যবহার: ডিটেল্ড vs লাইট। উদাহরণ: `nmap -sV --version-intensity 5 scanme.nmap.org`। প্র্যাকটিকাল: মিডিয়াম ডিটেল চেক।
- **-version-light**: ইনটেনসিটি ২, লাইকলি প্রোব। কোথায় ব্যবহার: ফাস্ট ভার্সন ডিটেকশন। উদাহরণ: `nmap -sV --version-light scanme.nmap.org`। প্র্যাকটিকাল: কুইক অডিট।
- **-version-all**: ইনটেনসিটি ৯, সব প্রোব। কোথায় ব্যবহার: ফুল ডিটেল। উদাহরণ: `nmap -sV --version-all scanme.nmap.org`। প্র্যাকটিকাল: ডিপ ইনভেস্টিগেশন।
- **-version-trace**: ভার্সন স্ক্যানের ডিটেল্ড অ্যাকটিভিটি দেখায়। কোথায় ব্যবহার: ডিবাগিংয়ে। উদাহরণ: `nmap -sV --version-trace scanme.nmap.org`। প্র্যাকটিকাল: প্রোব রেসপন্স ট্রেস করা।

### SCRIPT SCAN

- **sC**: ডিফল্ট স্ক্রিপ্ট স্ক্যান (--script=default)। কোথায় ব্যবহার: বেসিক স্ক্রিপ্টিং। উদাহরণ: `nmap -sC scanme.nmap.org`। প্র্যাকটিকাল: কমন ভালনারেবিলিটি চেক।
- **-script=<Lua scripts>**: নির্দিষ্ট স্ক্রিপ্ট, ডিরেক্টরি বা ক্যাটাগরি রান করে। কোথায় ব্যবহার: কাস্টম স্ক্রিপ্টিং। উদাহরণ: `nmap --script=http-title scanme.nmap.org`। প্র্যাকটিকাল: ওয়েব পেজ টাইটেল চেক।
- **-script-args=<n1=v1,[n2=v2,...]>**: স্ক্রিপ্টের আর্গুমেন্ট দেয়। কোথায় ব্যবহার: স্ক্রিপ্ট কাস্টমাইজ। উদাহরণ: `nmap --script=http-brute --script-args=userdb=users.txt scanme.nmap.org`। প্র্যাকটিকাল: ব্রুট ফোর্স টেস্টিং।
- **-script-args-file=filename**: ফাইল থেকে আর্গুমেন্ট নেয়। কোথায় ব্যবহার: বড় আর্গুমেন্ট লিস্ট। উদাহরণ: `nmap --script=http-brute --script-args-file=args.txt scanme.nmap.org`। প্র্যাকটিকাল: কমপ্লেক্স স্ক্রিপ্ট সেটাপ।
- **-script-trace**: স্ক্রিপ্টের সেন্ড/রিসিভ ডেটা দেখায়। কোথায় ব্যবহার: ডিবাগিং। উদাহরণ: `nmap --script=http-title --script-trace scanme.nmap.org`। প্র্যাকটিকাল: স্ক্রিপ্ট ইন্টার্যাকশন ট্রেস।
- **-script-updatedb**: স্ক্রিপ্ট ডেটাবেস আপডেট করে। কোথায় ব্যবহার: NSE ডেটাবেস রিফ্রেশ। উদাহরণ: `nmap --script-updatedb`। প্র্যাকটিকাল: নতুন স্ক্রিপ্ট যোগ করার পর।
- **-script-help=<Lua scripts>**: স্ক্রিপ্টের হেল্প দেখায়। কোথায় ব্যবহার: ডকুমেন্টেশন। উদাহরণ: `nmap --script-help=http-title`। প্র্যাকটিকাল: স্ক্রিপ্ট ব্যবহারের গাইড দেখা।

### OS DETECTION

- **O**: OS ডিটেকশন চালু করে। কোথায় ব্যবহার: হোস্টের OS জানতে। উদাহরণ: `nmap -O scanme.nmap.org`। প্র্যাকটিকাল: সার্ভারের Windows/Linux চেক।
- **-osscan-limit**: প্রমিসিং টার্গেটে লিমিট করে। কোথায় ব্যবহার: ফাস্ট OS স্ক্যান। উদাহরণ: `nmap -O --osscan-limit scanme.nmap.org`। প্র্যাকটিকাল: বড় নেটওয়ার্কে অপটিমাইজ।
- **-osscan-guess**: অ্যাগ্রেসিভলি OS গেস করে। কোথায় ব্যবহার: অনসার্টেন কেসে। উদাহরণ: `nmap -O --osscan-guess scanme.nmap.org`। প্র্যাকটিকাল: ক্লোজ ম্যাচ গেস করা।

### TIMING AND PERFORMANCE

- **T<0-5>**: টাইমিং টেমপ্লেট সেট (০ স্লো, ৫ ফাস্ট)। কোথায় ব্যবহার: স্পিড কন্ট্রোল। উদাহরণ: `nmap -T4 scanme.nmap.org`। প্র্যাকটিকাল: ফাস্ট স্ক্যান নরমাল নেটওয়ার্কে।
- **-min-hostgroup/max-hostgroup <size>**: প্যারালেল হোস্ট গ্রুপ সাইজ। কোথায় ব্যবহার: প্যারালেলিজম কন্ট্রোল। উদাহরণ: `nmap --min-hostgroup 50 192.168.1.0/24`। প্র্যাকটিকাল: বড় নেটওয়ার্কে স্পিড আপ।
- **-min-parallelism/max-parallelism <numprobes>**: প্রোব প্যারালেলাইজেশন। কোথায় ব্যবহার: প্রোব স্পিড। উদাহরণ: `nmap --min-parallelism 10 scanme.nmap.org`। প্র্যাকটিকাল: স্লো নেটওয়ার্কে অ্যাডজাস্ট।
- **-min-rtt-timeout/max-rtt-timeout/initial-rtt-timeout <time>**: RTT টাইমআউট সেট। কোথায় ব্যবহার: লেটেন্সি হ্যান্ডলিং। উদাহরণ: `nmap --initial-rtt-timeout 500ms scanme.nmap.org`। প্র্যাকটিকাল: হাই-লেটেন্সি নেটওয়ার্কে।
- **-max-retries <tries>**: প্রোব রিট্রাই ক্যাপ। কোথায় ব্যবহার: রিলায়াবিলিটি। উদাহরণ: `nmap --max-retries 3 scanme.nmap.org`। প্র্যাকটিকাল: অ্যানরিলায়েবল নেটওয়ার্কে।
- **-host-timeout <time>**: হোস্ট টাইমআউট। কোথায় ব্যবহার: স্লো হোস্ট স্কিপ। উদাহরণ: `nmap --host-timeout 30m scanme.nmap.org`। প্র্যাকটিকাল: লং স্ক্যানে হ্যাঙ্গ প্রিভেন্ট।
- **-scan-delay/--max-scan-delay <time>**: প্রোবের মধ্যে ডিলে। কোথায় ব্যবহার: রেট লিমিটিং। উদাহরণ: `nmap --scan-delay 1s scanme.nmap.org`। প্র্যাকটিকাল: IDS এড়ানো।
- **-min-rate <number>**: প্যাকেট রেট মিনিমাম। কোথায় ব্যবহার: স্পিড ফোর্স। উদাহরণ: `nmap --min-rate 100 scanme.nmap.org`। প্র্যাকটিকাল: ফাস্ট নেটওয়ার্কে।
- **-max-rate <number>**: প্যাকেট রেট ম্যাক্সিমাম। কোথায় ব্যবহার: কংজেশন প্রিভেন্ট। উদাহরণ: `nmap --max-rate 50 scanme.nmap.org`। প্র্যাকটিকাল: স্লো নেটওয়ার্কে।

### FIREWALL/IDS EVASION AND SPOOFING

- **f; --mtu <val>**: প্যাকেট ফ্র্যাগমেন্ট করে (MTU দিয়ে)। কোথায় ব্যবহার: ফায়ারওয়াল বাইপাস। উদাহরণ: `nmap -f scanme.nmap.org`। প্র্যাকটিকাল: ফ্র্যাগমেন্টেড প্যাকেট দিয়ে স্ক্যান।
- **D <decoy1,decoy2[,ME],...>**: ডেকয় দিয়ে স্ক্যান ক্লোক। কোথায় ব্যবহার: সোর্স হাইড। উদাহরণ: `nmap -D decoy1,ME scanme.nmap.org`। প্র্যাকটিকাল: মাল্টিপল সোর্স থেকে স্ক্যান দেখানো।
- **S <IP_Address>**: সোর্স IP স্পুফ। কোথায় ব্যবহার: স্পুফিং। উদাহরণ: `nmap -S fakeip scanme.nmap.org`। প্র্যাকটিকাল: অ্যানোনিমাস টেস্টিং (রাউটার প্রয়োজন)।
- **e <iface>**: স্পেসিফিক ইন্টারফেস ব্যবহার। কোথায় ব্যবহার: মাল্টি-ইন্টারফেস সিস্টেমে। উদাহরণ: `nmap -e eth0 scanme.nmap.org`। প্র্যাকটিকাল: VPN ইন্টারফেস দিয়ে স্ক্যান।
- **g/--source-port <portnum>**: সোর্স পোর্ট সেট। কোথায় ব্যবহার: ফায়ারওয়াল বাইপাস। উদাহরণ: `nmap -g 53 scanme.nmap.org`। প্র্যাকটিকাল: DNS পোর্ট দিয়ে স্ক্যান।
- **-proxies <url1,[url2],...>**: প্রক্সি দিয়ে রিলে। কোথায় ব্যবহার: প্রক্সি চেইনিং। উদাহরণ: `nmap --proxies <http://proxy.com> scanme.nmap.org`। প্র্যাকটিকাল: অ্যানোনিমাস স্ক্যান।
- **-data <hex string>**: কাস্টম পেলোড অ্যাপেন্ড। কোথায় ব্যবহার: প্যাকেট কাস্টমাইজ। উদাহরণ: `nmap --data 0xdeadbeef scanme.nmap.org`। প্র্যাকটিকাল: টেস্টিং পেলোড।
- **-data-string <string>**: ASCII স্ট্রিং অ্যাপেন্ড। কোথায় ব্যবহার: টেক্সট পেলোড। উদাহরণ: `nmap --data-string "hello" scanme.nmap.org`। প্র্যাকটিকাল: কাস্টম মেসেজ।
- **-data-length <num>**: র্যান্ডম ডেটা অ্যাপেন্ড। কোথায় ব্যবহার: প্যাকেট সাইজ চেঞ্জ। উদাহরণ: `nmap --data-length 100 scanme.nmap.org`। প্র্যাকটিকাল: প্যাডিং দিয়ে।
- **-ip-options <options>**: IP অপশন সেট। কোথায় ব্যবহার: অ্যাডভান্সড IP। উদাহরণ: `nmap --ip-options "R" scanme.nmap.org`। প্র্যাকটিকাল: রেকর্ড রুট।
- **-ttl <val>**: IP TTL সেট। কোথায় ব্যবহার: হপ লিমিট। উদাহরণ: `nmap --ttl 64 scanme.nmap.org`। প্র্যাকটিকাল: ট্রেসরুট সিমুলেট।
- **-spoof-mac <mac address/prefix/vendor name>**: MAC স্পুফ। কোথায় ব্যবহার: লোকাল স্ক্যানে। উদাহরণ: `nmap --spoof-mac 00:11:22:33:44:55 scanme.nmap.org`। প্র্যাকটিকাল: ল্যানে অ্যানোনিমাস।
- **-badsum**: বগাস চেকসাম পাঠায়। কোথায় ব্যবহার: IDS চেক। উদাহরণ: `nmap --badsum scanme.nmap.org`। প্র্যাকটিকাল: ফায়ারওয়াল রেসপন্স টেস্ট।

### OUTPUT

- **oN/-oX/-oS/-oG <file>**: নরমাল, XML, s|<rIpt, Grepable ফরম্যাটে আউটপুট। কোথায় ব্যবহার: ফাইল সেভ। উদাহরণ: `nmap -oN output.txt scanme.nmap.org`। প্র্যাকটিকাল: রিপোর্ট জেনারেট।
- **oA <basename>**: তিনটা মেজর ফরম্যাটে আউটপুট। কোথায় ব্যবহার: মাল্টি-ফরম্যাট। উদাহরণ: `nmap -oA scan scanme.nmap.org`। প্র্যাকটিকাল: অ্যানালাইসিসের জন্য।
- **v**: ভার্বোস লেভেল বাড়ায় (-vv আরও)। কোথায় ব্যবহার: ডিটেল্ড আউটপুট। উদাহরণ: `nmap -v scanme.nmap.org`। প্র্যাকটিকাল: প্রোগ্রেস দেখা।
- **d**: ডিবাগ লেভেল বাড়ায় (-dd আরও)। কোথায় ব্যবহার: ট্রাবলশুটিং। উদাহরণ: `nmap -d scanme.nmap.org`। প্র্যাকটিকাল: এরর ডায়াগনোসিস।
- **-reason**: পোর্ট স্টেটের রিজন দেখায়। কোথায় ব্যবহার: এক্সপ্লেনেশন। উদাহরণ: `nmap --reason scanme.nmap.org`। প্র্যাকটিকাল: কেন পোর্ট ওপেন/ক্লোজড বুঝা।
- **-open**: শুধু ওপেন পোর্ট দেখায়। কোথায় ব্যবহার: ফিল্টার্ড আউটপুট। উদাহরণ: `nmap --open scanme.nmap.org`। প্র্যাকটিকাল: কুইক ওভারভিউ।
- **-packet-trace**: সেন্ড/রিসিভ প্যাকেট দেখায়। কোথায় ব্যবহার: লো-লেভেল ট্রেস। উদাহরণ: `nmap --packet-trace scanme.nmap.org`। প্র্যাকটিকাল: নেটওয়ার্ক অ্যানালাইসিস।
- **-iflist**: ইন্টারফেস এবং রুট লিস্ট করে। কোথায় ব্যবহার: ডিবাগিং। উদাহরণ: `nmap --iflist`। প্র্যাকটিকাল: সিস্টেম কনফিগ চেক।
- **-append-output**: আউটপুট অ্যাপেন্ড করে। কোথায় ব্যবহার: এক্সিস্টিং ফাইলে যোগ। উদাহরণ: `nmap -oN output.txt --append-output scanme.nmap.org`। প্র্যাকটিকাল: মাল্টি-স্ক্যান লগ।
- **-resume <filename>**: অ্যাবর্টেড স্ক্যান রিজিউম। কোথায় ব্যবহার: ইন্টারাপ্টেড স্ক্যান। উদাহরণ: `nmap --resume log.txt`। প্র্যাকটিকাল: লং স্ক্যান রিকভারি।
- **-noninteractive**: কীবোর্ড ইন্টার্যাকশন ডিসেবল। কোথায় ব্যবহার: অটোমেটেড স্ক্রিপ্টিং। উদাহরণ: `nmap --noninteractive scanme.nmap.org`। প্র্যাকটিকাল: ক্রোন জবে।
- **-stylesheet <path/URL>**: XML-এর জন্য XSL স্টাইলশীট। কোথায় ব্যবহার: HTML কনভার্শন। উদাহরণ: `nmap -oX out.xml --stylesheet style.xsl scanme.nmap.org`। প্র্যাকটিকাল: রিপোর্ট ফরম্যাটিং।
- **-webxml**: [nmap.org](http://nmap.org/) থেকে স্টাইলশীট রেফারেন্স। কোথায় ব্যবহার: পোর্টেবল XML। উদাহরণ: `nmap -oX out.xml --webxml scanme.nmap.org`। প্র্যাকটিকাল: ওয়েব-ভিউয়েবল রিপোর্ট।
- **-no-stylesheet**: XML-এ স্টাইলশীট অ্যাসোসিয়েট না। কোথায় ব্যবহার: প্লেইন XML। উদাহরণ: `nmap -oX out.xml --no-stylesheet scanme.nmap.org`। প্র্যাকটিকাল: কাস্টম প্রসেসিং।

### MISC

- **6**: IPv6 স্ক্যান চালু। কোথায় ব্যবহার: IPv6 নেটওয়ার্কে। উদাহরণ: `nmap -6 scanme.nmap.org`। প্র্যাকটিকাল: মডার্ন নেটওয়ার্ক চেক।
- **A**: OS, ভার্সন, স্ক্রিপ্ট, ট্রেসরুট সব চালু। কোথায় ব্যবহার: অ্যাগ্রেসিভ স্ক্যান। উদাহরণ: `nmap -A scanme.nmap.org`। প্র্যাকটিকাল: ফুল অডিট।
- **-datadir <dirname>**: কাস্টম ডেটা ফাইল লোকেশন। কোথায় ব্যবহার: কাস্টম ইন্সটল। উদাহরণ: `nmap --datadir /path/to/data scanme.nmap.org`। প্র্যাকটিকাল: পোর্টেবল nmap।
- **-send-eth/--send-ip**: র অ্যাথারনেট বা IP লেভেল সেন্ড। কোথায় ব্যবহার: লো-লেভেল কন্ট্রোল। উদাহরণ: `nmap --send-eth scanme.nmap.org`। প্র্যাকটিকাল: রাউটেড নেটওয়ার্কে।
- **-privileged**: প্রিভিলেজড মোড অ্যাসুম। কোথায় ব্যবহার: রুট অ্যাক্সেস। উদাহরণ: `nmap --privileged scanme.nmap.org`। প্র্যাকটিকাল: SYN স্ক্যানের জন্য।
- **-unprivileged**: আনপ্রিভিলেজড মোড। কোথায় ব্যবহার: নন-রুট। উদাহরণ: `nmap --unprivileged scanme.nmap.org`। প্র্যাকটিকাল: ইউজার-লেভেল স্ক্যান।
- **V**: ভার্সন প্রিন্ট। কোথায় ব্যবহার: চেকিং। উদাহরণ: `nmap -V`। প্র্যাকটিকাল: আপডেট চেক।
- **h**: হেল্প সামারি। কোথায় ব্যবহার: ইউজেজ গাইড। উদাহরণ: `nmap -h`। প্র্যাকটিকাল: কুইক রেফারেন্স।

---

```bash
┌─[root@parrot]─[/home/admin]
└──╼ #nmap -v -A scanme.nmap.org
Starting Nmap 7.95 ( https://nmap.org ) at 2026-02-08 11:35 EST

NSE: Loaded 157 scripts for scanning.
NSE: Script Pre-scanning.
Initiating NSE at 11:35
Completed NSE at 11:35, 0.00s elapsed
Initiating NSE at 11:35
Completed NSE at 11:35, 0.00s elapsed
Initiating NSE at 11:35
Completed NSE at 11:35, 0.00s elapsed

Initiating Ping Scan at 11:35
Scanning scanme.nmap.org (45.33.32.156) [4 ports]
Completed Ping Scan at 11:35, 0.25s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 11:35
Completed Parallel DNS resolution of 1 host. at 11:35, 0.22s elapsed

Initiating SYN Stealth Scan at 11:35
Scanning scanme.nmap.org (45.33.32.156) [1000 ports]
Discovered open port 80/tcp on 45.33.32.156
Discovered open port 22/tcp on 45.33.32.156
Discovered open port 9929/tcp on 45.33.32.156
Discovered open port 31337/tcp on 45.33.32.156
Completed SYN Stealth Scan at 11:35, 9.40s elapsed (1000 total ports)

Initiating Service scan at 11:35
Scanning 4 services on scanme.nmap.org (45.33.32.156)
Completed Service scan at 11:36, 52.96s elapsed (4 services on 1 host)

Initiating OS detection (try #1) against scanme.nmap.org (45.33.32.156)
Retrying OS detection (try #2) against scanme.nmap.org (45.33.32.156)

Initiating Traceroute at 11:36
Completed Traceroute at 11:36, 3.02s elapsed

Initiating Parallel DNS resolution of 12 hosts. at 11:36
Completed Parallel DNS resolution of 12 hosts. at 11:36, 0.26s elapsed

NSE: Script scanning 45.33.32.156.
Initiating NSE at 11:36
Completed NSE at 11:37, 20.68s elapsed
Initiating NSE at 11:37
Completed NSE at 11:37, 2.01s elapsed
Initiating NSE at 11:37
Completed NSE at 11:37, 0.00s elapsed

Nmap scan report for scanme.nmap.org (45.33.32.156)
Host is up (0.24s latency).
Other addresses for scanme.nmap.org (not scanned): 2600:3c01::f03c:91ff:fe18:bb2f
Not shown: 979 closed tcp ports (reset)
PORT      STATE    SERVICE      VERSION
7/tcp     filtered echo
17/tcp    filtered qotd
19/tcp    filtered chargen
22/tcp    open     ssh          OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   1024 ac:00:a0:1a:82:ff:cc:55:99:dc:67:2b:34:97:6b:75 (DSA)
|   2048 20:3d:2d:44:62:2a:b0:5a:9d:b5:b3:05:14:c2:a6:b2 (RSA)
|   256 96:02:bb:5e:57:54:1c:4e:45:2f:56:4c:4a:24:b2:57 (ECDSA)
|_  256 33:fa:91:0f:e0:e1:7b:1f:6d:05:a2:b0:f1:54:41:56 (ED25519)
79/tcp    filtered finger
80/tcp    open     http?
111/tcp   filtered rpcbind
135/tcp   filtered msrpc
139/tcp   filtered netbios-ssn
1024/tcp  filtered kdm
1025/tcp  filtered NFS-or-IIS
1026/tcp  filtered LSA-or-nterm
1027/tcp  filtered IIS
1028/tcp  filtered unknown
1030/tcp  filtered iad1
1900/tcp  filtered upnp
2323/tcp  filtered 3d-nfsd
3128/tcp  filtered squid-http
6129/tcp  filtered unknown
9929/tcp  open     nping-echo   Nping echo
31337/tcp open     tcpwrapped

Aggressive OS guesses: Linux 5.0 - 5.14 (93%), MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3) (93%), Linux 4.15 - 5.19 (92%), Linux 2.6.32 - 3.10 (91%), Linux 2.6.32 - 3.13 (89%), Linux 5.0 (88%), OpenWrt 22.03 (Linux 5.10) (88%), Linux 3.2 - 4.14 (88%), Linux 3.10 - 4.11 (88%), Linux 4.15 (87%)
No exact OS matches for host (test conditions non-ideal).

Uptime guess: 3.394 days (since Thu Feb  5 02:09:06 2026)

Network Distance: 17 hops
TCP Sequence Prediction: Difficulty=259 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 80/tcp)
HOP RTT       ADDRESS
1   8.98 ms   192.168.0.1
2   4.07 ms   10.23.13.1
3   6.19 ms   172.16.50.1
4   9.50 ms   172.23.8.241
5   7.90 ms   172.31.248.21
6   12.36 ms  172.31.251.202
7   13.22 ms  aes-static-137.31.144.59.airtel.in (59.144.31.137)
8   188.33 ms 116.119.121.127
9   ...
10  72.85 ms  unknown.telstraglobal.net (202.84.207.181)
11  254.05 ms i-1120.eqnx-core02.telstraglobal.net (202.84.141.153)
12  263.05 ms i-92.eqnx03.telstraglobal.net (202.84.247.17)
13  238.39 ms eqix-sv1.linode.com (206.223.116.196)
14  ... 16
17  236.77 ms scanme.nmap.org (45.33.32.156)

NSE: Script Post-scanning.
Initiating NSE at 11:37
Completed NSE at 11:37, 0.00s elapsed
Initiating NSE at 11:37
Completed NSE at 11:37, 0.00s elapsed
Initiating NSE at 11:37
Completed NSE at 11:37, 0.00s elapsed

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .

Nmap done: 1 IP address (1 host up) scanned in 94.86 seconds
Raw packets sent: 1153 (52.940KB) | Rcvd: 2541 (213.643KB)
```