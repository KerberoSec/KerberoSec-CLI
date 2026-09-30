# Nmap Switches

বেশিরভাগ pentesting tool-এর মতোই, **nmap** terminal থেকে চালানো হয়। এটি Windows এবং Linux: দুই platform-এর জন্যই পাওয়া যায়। এখানে ধরে নেওয়া হচ্ছে আপনি Linux ব্যবহার করছেন; তবে ব্যবহৃত switch গুলো একই থাকে। Kali Linux এবং TryHackMe Attack Box: উভয় জায়গাতেই Nmap defaultভাবে install করা থাকে।

Nmap ব্যবহার করতে terminal-এ `nmap` লিখে তার পরে বিভিন্ন “switch” (অর্থাৎ command argument) যোগ করতে হয়, যেগুলো program-কে নির্দিষ্ট কাজ করতে নির্দেশ দেয়।

এই কাজগুলোর জন্য আপনার যা প্রয়োজন হবে:

- Nmap-এর help menu → `nmap -h`
- অথবা Nmap-এর manual page → `man nmap`

প্রতিটি উত্তরে সম্পূর্ণ switch লিখতে হবে, যদি আলাদা করে কিছু বলা না থাকে। অর্থাৎ switch-এর শুরুতে থাকা hyphen (-) সহ পুরোটা উল্লেখ করতে হবে।

---

1. Nmap-এর help menu-তে “Syn Scan” এর জন্য যে প্রথম switch-টি দেওয়া আছে, সেটি কী?
    
    ```bash
    -sS
    ```
    
2. UDP scan করার জন্য আপনি কোন switch ব্যবহার করবেন?
    
    ```bash
    -sU
    ```
    
3. আপনি যদি জানতে চান যে target system-টি কোন operating system চালাচ্ছে, তাহলে কোন switch ব্যবহার করবেন?
    
    ```bash
    -O
    ```
    
4. Nmap target-এ চলমান service-এর version detect করার জন্য একটি switch প্রদান করে। সেটি হলো:
    
    ```bash
    -sV
    ```
    
5. Nmap-এর default output অনেক সময় pentester-এর জন্য যথেষ্ট তথ্য দেয় না। verbosity (বিস্তারিততা) বাড়ানোর জন্য যে switch ব্যবহার করা হয়, সেটি হলো:
    
    ```bash
    -v
    ```
    
6. Verbosity level one ভালো, কিন্তু verbosity level two আরও ভালো! আপনি কীভাবে verbosity level দুই এ সেট করবেন?
(নোট: অন্তত এই অপশনটি ব্যবহার করা সবসময়ই খুব বেশি পরামর্শযোগ্য)
    
    ```bash
    -vv
    ```
    
7. আমাদের সবসময় স্ক্যানের আউটপুট সংরক্ষণ করা উচিত: এর ফলে আমাদের স্ক্যানটি মাত্র একবারই চালাতে হয় (যা নেটওয়ার্ক ট্রাফিক কমায় এবং ফলে শনাক্ত হওয়ার সম্ভাবনাও কমে), এবং ক্লায়েন্টের জন্য রিপোর্ট লেখার সময় এটি একটি রেফারেন্স হিসেবে ব্যবহার করা যায়।
    
    ```bash
    -oA
    ```
    
8. nmap-এর ফলাফল "normal" ফরম্যাটে সংরক্ষণ করার জন্য আপনি কোন switch ব্যবহার করবেন?
    
    ```bash
    -oN
    ```
    
9. একটি খুবই ব্যবহারযোগ্য আউটপুট ফরম্যাট: আপনি কীভাবে ফলাফলগুলো "grepable" ফরম্যাটে সংরক্ষণ করবেন?
    
    ```bash
    -oG
    ```
    
10. কখনও কখনও আমরা যে ফলাফলগুলো পাই তা যথেষ্ট হয় না। যদি আমরা কতটা “loud” (সহজে শনাক্তযোগ্য) হচ্ছি তা নিয়ে চিন্তা না করি, তাহলে আমরা "aggressive" মোড চালু করতে পারি। এটি একটি shorthand switch, যা service detection, operating system detection, traceroute এবং সাধারণ script scanning সক্রিয় করে।
    
    আপনি কীভাবে এই সেটিংটি সক্রিয় করবেন?
    
    ```bash
    -A
    ```
    
11. Nmap পাঁচটি “timing” template প্রদান করে। এগুলো মূলত স্ক্যানের গতি বাড়ানোর জন্য ব্যবহৃত হয়। তবে সতর্ক থাকুন: গতি যত বেশি হবে, তত বেশি “noisy” হবে এবং ভুল (error) হওয়ার সম্ভাবনাও বাড়বে।
    
    আপনি কীভাবে timing template-কে level 5-এ সেট করবেন?
    
    ```bash
    -T5
    ```
    
12. আমরা চাইলে কোন port(গুলো) স্ক্যান করব সেটাও নির্ধারণ করতে পারি।
    
    আপনি কীভাবে nmap-কে শুধু port 80 স্ক্যান করতে বলবেন?
    
    ```bash
    -p 80
    ```
    
13. আপনি কীভাবে nmap-কে 1000-1500 পোর্টগুলো স্ক্যান করতে বলবেন?
    
    ```bash
    -p 1000-1500
    ```
    
14. একটি খুবই গুরুত্বপূর্ণ অপশন, যা কখনোই উপেক্ষা করা উচিত নয়:
    
    আপনি কীভাবে nmap-কে সব পোর্ট স্ক্যান করতে বলবেন?
    
    ```bash
    -p-
    ```
    
15. nmap scripting library থেকে একটি script কীভাবে চালু (activate) করবেন?
    
    ```bash
    --script
    ```
    
16. How would you activate all of the scripts in the "vuln" category?
    
    ```bash
    --script=vuln
    ```