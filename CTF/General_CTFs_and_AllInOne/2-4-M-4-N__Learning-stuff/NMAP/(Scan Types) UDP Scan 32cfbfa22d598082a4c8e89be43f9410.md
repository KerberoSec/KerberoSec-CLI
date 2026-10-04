# (Scan Types) UDP Scan

TCP-এর মতো নয়, UDP connection **stateless**। অর্থাৎ এখানে কোনো back-and-forth “handshake” হয় না। UDP-তে client শুধু target port-এ packet পাঠায় এবং ধরে নেয় যে সেটি পৌঁছাবে। এই কারণে UDP খুব দ্রুত (speed-oriented) communication-এর জন্য উপযোগী (যেমন: video streaming), কিন্তু acknowledgement না থাকায় UDP scan করা তুলনামূলকভাবে কঠিন এবং অনেক ধীর। Nmap-এ UDP scan করার জন্য switch হলো **`-sU`**।

যখন একটি packet কোনো **open UDP port**-এ পাঠানো হয়, সাধারণত কোনো response পাওয়া যায় না। এই অবস্থায় Nmap port-টিকে **`open|filtered`** হিসেবে চিহ্নিত করে। অর্থাৎ, portটি open হতে পারে, আবার firewall-এর কারণে filtered-ও হতে পারে।

যদি UDP response পাওয়া যায় (যা খুবই বিরল), তাহলে portটিকে সরাসরি **open** ধরা হয়। সাধারণত response না পেলে Nmap একই request দ্বিতীয়বার পাঠায় নিশ্চিত হওয়ার জন্য। তবুও response না এলে সেটিকে open|filtered হিসেবে mark করে এবং পরবর্তী port-এ চলে যায়।

অন্যদিকে, যখন packet কোনো **closed UDP port**-এ পাঠানো হয়, তখন target সাধারণত একটি **ICMP (ping) packet** পাঠায়, যেখানে উল্লেখ থাকে যে portটি unreachable। এর মাধ্যমে Nmap সহজেই বুঝতে পারে portটি closed এবং সেই অনুযায়ী mark করে।

UDP port open কিনা তা নিশ্চিতভাবে নির্ধারণ করা কঠিন হওয়ায় UDP scan সাধারণত TCP scan-এর তুলনায় অনেক ধীর। উদাহরণস্বরূপ, ভালো connection থাকলেও প্রথম ১০০০টি port scan করতে প্রায় ২০ মিনিট সময় লাগতে পারে।

এই কারণে সাধারণত **`--top-ports <number>`** অপশন ব্যবহার করা ভালো। যেমন: **`nmap -sU --top-ports 20 <target>`** এটি সবচেয়ে বেশি ব্যবহৃত ২০টি UDP port স্ক্যান করবে, ফলে সময় অনেক কম লাগবে।

UDP scan করার সময় Nmap সাধারণত empty (raw) UDP packet পাঠায়। তবে কিছু well-known service-এর port-এর ক্ষেত্রে এটি protocol-specific payload পাঠায়, যাতে response পাওয়ার সম্ভাবনা বাড়ে এবং আরও accurate result পাওয়া যায়।

---

- যদি কোনো UDP port Nmap scan-এ কোনো response না দেয়, তাহলে সেটিকে কীভাবে mark করা হয়?
    
    > **open|filtered**
    > 
- যখন কোনো UDP port closed থাকে, তখন convention অনুযায়ী target একটি “port unreachable” message পাঠায়। এটি কোন protocol ব্যবহার করে?
    
    > **ICMP**
    >