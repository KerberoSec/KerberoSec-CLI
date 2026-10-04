# (Scan Types) Icmp network scanning

Black box assignment-এ কোনো target network-এ প্রথমবার connect করার পর আমাদের প্রথম লক্ষ্য থাকে একটি “map” তৈরি করা: অর্থাৎ কোন কোন IP address-এ active host আছে এবং কোনগুলোতে নেই তা নির্ধারণ করা।

এটি করার একটি উপায় হলো Nmap ব্যবহার করে একটি **“ping sweep”** চালানো। নাম থেকেই বোঝা যায়, এখানে Nmap নির্দিষ্ট network-এর প্রতিটি সম্ভাব্য IP address-এ ICMP packet পাঠায়। যেসব IP address থেকে response পাওয়া যায়, সেগুলোকে alive (active host) হিসেবে চিহ্নিত করা হয়। যদিও এটি সবসময় পুরোপুরি নির্ভুল নয়, তবুও এটি একটি প্রাথমিক ধারণা (baseline) দেয়, যা কাজে লাগে।

Ping sweep করার জন্য **`-sn`** switch ব্যবহার করা হয়, সাথে IP range উল্লেখ করতে হয়। এই range দুইভাবে লেখা যায়:

- Hyphen (-) ব্যবহার করে:
    
    `nmap -sn 192.168.0.1-254`
    
- CIDR notation ব্যবহার করে:
    
    `nmap -sn 192.168.0.0/24`
    

এখানে **`-sn`** switch Nmap-কে বলে দেয় যেন কোনো port scan না করে। ফলে Nmap মূলত ICMP echo request (ping) ব্যবহার করে target identify করে। যদি local network-এ sudo বা root হিসেবে চালানো হয়, তাহলে এটি ARP request-ও ব্যবহার করতে পারে।

এছাড়াও, -sn ব্যবহার করলে Nmap শুধু ICMP না, আরও কিছু packet পাঠায়:

- target-এর port 443-এ একটি TCP SYN packet
- target-এর port 80-এ একটি TCP ACK packet (root না হলে SYN packet)

এই অতিরিক্ত packet গুলো পাঠানোর উদ্দেশ্য হলো বিভিন্ন পরিস্থিতিতে host alive কিনা তা আরও নির্ভরযোগ্যভাবে নির্ধারণ করা।

---

- CIDR notation ব্যবহার করে 172.16.x.x network (Netmask: 255.255.0.0)-এ Nmap দিয়ে ping sweep কীভাবে করা যায়?
    
    > **nmap -sn 172.16.0.0/16**
    >