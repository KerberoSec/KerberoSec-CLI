# (Scan Types) TCP connect scan

TCP Connect scan (-sT) বুঝতে হলে আগে TCP three-way handshake সম্পর্কে পরিষ্কার ধারণা থাকা জরুরি। যদি এই টার্মটি নতুন হয়, তাহলে আগে basic networking (I[ntroductory Networking](https://tryhackme.com/room/introtonetworking)) পড়া ভালো।

সংক্ষেপে, three-way handshake তিনটি ধাপে সম্পন্ন হয়:

1. প্রথমে client (এখানে আমাদের attacking machine) target server-এ একটি TCP packet পাঠায়, যেখানে SYN flag set থাকে।
2. এরপর server সেই request-টি acknowledge করে এবং একটি TCP packet পাঠায়, যেখানে SYN এবং ACK: দুইটি flag-ই set থাকে।
3. সবশেষে client একটি ACK flag সেট করা TCP packet পাঠিয়ে handshake সম্পূর্ণ করে।

এটি TCP/IP networking-এর একটি মৌলিক প্রক্রিয়া। এখন প্রশ্ন হলো: এটা Nmap-এর সাথে কীভাবে সম্পর্কিত?

TCP Connect scan (-sT) এই তিন ধাপের handshake ব্যবহার করেই কাজ করে। অর্থাৎ, Nmap প্রতিটি target port-এর সাথে সম্পূর্ণ TCP connection establish করার চেষ্টা করে। সার্ভারের response দেখে Nmap নির্ধারণ করে portটি open নাকি closed।

যেমন:

- যদি কোনো port **closed** থাকে, তাহলে [RFC 9293](https://datatracker.ietf.org/doc/html/rfc9293) অনুযায়ী server একটি RST (Reset) flag সেট করা TCP packet দিয়ে response করবে।
    
    অর্থাৎ, Nmap যখন SYN পাঠাবে, তখন RST পেলে বুঝবে portটি closed।
    
    
    
- যদি কোনো port **open** থাকে, তাহলে server SYN+ACK সহ response পাঠাবে।
    
    তখন Nmap বুঝবে portটি open, এবং ACK পাঠিয়ে handshake সম্পূর্ণ করবে।
    

তবে এখানে আরেকটি পরিস্থিতি থাকতে পারে:

- যদি portটি open থাকে কিন্তু **firewall-এর পেছনে hidden থাকে**, তাহলে firewall অনেক সময় incoming packet সরাসরি drop করে দেয়।
    
    এই ক্ষেত্রে Nmap SYN পাঠায়, কিন্তু কোনো response পায় না।
    
    তখন Nmap ধরে নেয় portটি **filtered** (মানে firewall দ্বারা protected)।
    

তবে সমস্যা হলো, firewall এমনভাবে configure করা যায় যাতে সেটি RST packet দিয়ে reply করে। উদাহরণ হিসেবে Linux-এর iptables-এ নিচের মতো rule ব্যবহার করা যায়:

```bash
iptables -I INPUT -p tcp --dport -j REJECT --reject-with tcp-reset
```

এতে করে Nmap-এর জন্য বোঝা কঠিন হয়ে যায় আসলেই port closed নাকি firewall ইচ্ছাকৃতভাবে reset পাঠাচ্ছে। ফলে accurate result পাওয়া অনেক সময় কঠিন (কখনও অসম্ভবও) হয়ে যায়।

---

- কোন RFC TCP protocol-এর সঠিক আচরণ (behavior) নির্ধারণ করে?
    
    > **RFC 9293**
    > 
- যদি কোনো port closed থাকে, তাহলে server কোন flag পাঠায় তা বোঝানোর জন্য?
    
    > **RST (Reset)**
    >