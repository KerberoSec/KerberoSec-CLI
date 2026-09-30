# Null, Fin, Xmas

NULL, FIN এবং Xmas TCP port scan: এই তিনটি scan অন্যগুলোর তুলনায় কম ব্যবহৃত হয়, তাই এগুলো নিয়ে খুব বেশি গভীরে আলোচনা করা হয় না। এরা একে অপরের সাথে সম্পর্কিত এবং মূলত ব্যবহার করা হয় কারণ এগুলো তুলনামূলকভাবে SYN “stealth” scan-এর থেকেও বেশি stealthy হতে পারে।

- প্রথমে **NULL scan (`-sN`)**:
    
    নামের মতোই, এই scan-এ TCP packet পাঠানো হয় কোনো flag সেট না করে। RFC অনুযায়ী, যদি port **closed** থাকে, তাহলে target host একটি RST (Reset) packet দিয়ে response করবে।
    
    
    
- এরপর **FIN scan (`-sF`)**:
    
    এটি প্রায় NULL scan-এর মতোই কাজ করে। তবে এখানে empty packet না পাঠিয়ে FIN flag সেট করে packet পাঠানো হয় (FIN সাধারণত একটি active connection gracefully close করার জন্য ব্যবহৃত হয়)। এখানেও যদি port closed থাকে, তাহলে RST response আশা করা হয়।
    
    
    
- তারপর **Xmas scan (`-sX`)**:
    
    এই scan-এ একটি “malformed” TCP packet পাঠানো হয়, যেখানে PSH, URG এবং FIN: এই তিনটি flag সেট থাকে। Wireshark-এ packet capture দেখলে এটি blinking Christmas tree-এর মতো দেখায়, তাই একে Xmas scan বলা হয়। এখানেও closed port-এর জন্য RST response আশা করা হয়।
    
    
    

এই তিনটি scan-এর ক্ষেত্রে **open port-এর behavior** একই এবং UDP scan-এর মতো:

- যদি port **open** থাকে, তাহলে সাধারণত কোনো response পাওয়া যায় না
- কিন্তু firewall থাকলেও একইভাবে response না-ও আসতে পারে

এই কারণে NULL, FIN এবং Xmas scan দিয়ে port সাধারণত তিনভাবে চিহ্নিত করা যায়:

- open|filtered
- closed
- filtered

যদি কোনো port **filtered** হিসেবে ধরা হয়, তাহলে সাধারণত target একটি ICMP unreachable packet পাঠিয়েছে।

এখানে একটি গুরুত্বপূর্ণ বিষয় হলো: RFC 793 অনুযায়ী, malformed packet পেলে closed port-এ RST পাঠানো উচিত এবং open port-এ কোনো response না দেওয়ার কথা। কিন্তু বাস্তবে সব সিস্টেম এই নিয়ম মেনে চলে না। বিশেষ করে Microsoft Windows এবং অনেক Cisco device যেকোনো malformed TCP packet-এর জন্যই RST পাঠায়: port open হোক বা closed। ফলে সব port closed হিসেবে দেখা যেতে পারে।

এই scan-গুলোর মূল উদ্দেশ্য হলো **firewall evasion**। অনেক firewall এমনভাবে configure করা থাকে যে তারা SYN flag সেট করা packet (নতুন connection শুরু করার request) block করে। কিন্তু NULL, FIN, Xmas scan-এ SYN flag ব্যবহার করা হয় না, তাই এই ধরনের firewall কিছু ক্ষেত্রে bypass করা সম্ভব।

তবে আধুনিক IDS/IPS সিস্টেম এখন এই ধরনের scan সহজেই detect করতে পারে। তাই এগুলোর উপর সম্পূর্ণ নির্ভর করা নিরাপদ নয়, বিশেষ করে modern environment-এ।

---

- তিনটি scan type-এর মধ্যে কোনটি URG flag ব্যবহার করে?
    
    > **Xmas**
    > 
- NULL, FIN এবং Xmas scan সাধারণত কেন ব্যবহার করা হয়?
    
    > **Firewall Evasion**
    > 
- কোন সাধারণ operating system NULL, FIN বা Xmas scan-এর ক্ষেত্রে প্রতিটি port-এর জন্য RST response দিতে পারে?
    
    > **Microsoft Windows**
    >