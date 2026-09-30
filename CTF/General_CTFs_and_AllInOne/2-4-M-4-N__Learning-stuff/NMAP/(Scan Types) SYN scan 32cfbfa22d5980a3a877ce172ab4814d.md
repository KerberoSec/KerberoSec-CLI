# (Scan Types) SYN scan

TCP scan-এর মতোই, SYN scan (-sS) ব্যবহার করা হয় target-এর TCP port range স্ক্যান করার জন্য। তবে এই দুই ধরনের scan-এর কাজ করার পদ্ধতিতে কিছু পার্থক্য আছে। SYN scan-কে অনেক সময় **“Half-open” scan** বা **“Stealth” scan** বলা হয়।

TCP Connect scan যেখানে সম্পূর্ণ three-way handshake সম্পন্ন করে, সেখানে SYN scan একটু ভিন্নভাবে কাজ করে। যখন server থেকে SYN/ACK response আসে, তখন SYN scan আর handshake সম্পূর্ণ করে না; বরং সঙ্গে সঙ্গে একটি RST (Reset) packet পাঠিয়ে connection terminate করে দেয়। ফলে connection পুরোপুরি establish হয় না।

অর্থাৎ, একটি open port স্ক্যান করার ক্ষেত্রে sequence হয়:

- Nmap → SYN পাঠায়
- Server → SYN/ACK পাঠায়
- Nmap → RST পাঠিয়ে connection বন্ধ করে দেয়

এই পদ্ধতির কারণে SYN scan-এর কিছু গুরুত্বপূর্ণ সুবিধা আছে:

- পুরনো Intrusion Detection System (IDS) bypass করা যায়, কারণ এগুলো সাধারণত সম্পূর্ণ three-way handshake detect করার জন্য ডিজাইন করা ছিল। যদিও আধুনিক IDS-এ এটি সবসময় কাজ করে না, তবুও এই কারণেই একে এখনো “stealth” scan বলা হয়।
- অনেক application open port-এ connection log করে তখনই, যখন connection পুরোপুরি establish হয়। SYN scan-এ handshake সম্পূর্ণ না হওয়ায় অনেক ক্ষেত্রে log তৈরি হয় না, যা এটিকে আরও stealthy করে।
- প্রতিটি port-এর জন্য handshake সম্পূর্ণ করা লাগে না, তাই SYN scan সাধারণ TCP Connect scan-এর তুলনায় অনেক দ্রুত।

তবে কিছু অসুবিধাও আছে:

- Linux-এ এটি সঠিকভাবে চালাতে sudo (root) permission প্রয়োজন। কারণ SYN scan raw packet তৈরি করে, যা সাধারণ user-এর জন্য অনুমোদিত নয়।
- কিছু unstable service SYN scan-এর কারণে crash বা down হয়ে যেতে পারে, যা production environment-এ সমস্যা তৈরি করতে পারে।

সবকিছু বিবেচনায়, এর সুবিধাগুলো অসুবিধার তুলনায় বেশি।

এই কারণেই, Nmap যদি sudo permission সহ run করা হয়, তাহলে default হিসেবে SYN scan ব্যবহার করে। আর যদি sudo ছাড়া run করা হয়, তাহলে এটি TCP Connect scan ব্যবহার করে।

Closed এবং filtered port চিহ্নিত করার ক্ষেত্রে SYN scan এবং TCP Connect scan একই নিয়ম অনুসরণ করে:

- যদি port **closed** হয়, server RST packet পাঠায়
- যদি port **firewall দ্বারা filtered** হয়, তাহলে SYN packet drop হয়ে যায় অথবা RST দিয়ে spoof করা হয়

এই দিক থেকে দুই scan একই রকম; মূল পার্থক্য হলো open port handle করার পদ্ধতিতে।

[1] উল্লেখ্য, SYN scan চালাতে Nmap-কে CAP_NET_RAW, CAP_NET_ADMIN এবং CAP_NET_BIND_SERVICE capability দিয়েও চালানো যায়; তবে এতে অনেক NSE script সঠিকভাবে কাজ নাও করতে পারে।

---

- SYN scan-এর অন্য দুইটি নাম কী?
    
    > **Half-Open, Stealth**
    > 
- Nmap কি sudo permission ছাড়া SYN scan ব্যবহার করতে পারে (Y/N)?
    
    > **N (না)**
    > 

---