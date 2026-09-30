# (Scan Types) overview

Nmap দিয়ে port scanning করার সময় তিনটি প্রধান scan type আছে। এগুলো হলো:

- TCP Connect Scan (-sT)
- SYN “Half-open” Scan (-sS)
- UDP Scan (-sU)

এছাড়াও কিছু কম ব্যবহৃত scan type আছে, যেগুলো আমরা তুলনামূলক কম বিস্তারিতভাবে দেখব। সেগুলো হলো:

- TCP Null Scan (-sN)
- TCP FIN Scan (-sF)
- TCP Xmas Scan (-sX)

এই scan গুলোর বেশিরভাগই (UDP scan ছাড়া) প্রায় একই উদ্দেশ্যে ব্যবহার করা হয়, তবে প্রতিটির কাজ করার পদ্ধতি আলাদা। তাই সাধারণত প্রথম তিনটি scan (TCP Connect, SYN, UDP) বেশিরভাগ ক্ষেত্রে বেশি ব্যবহার করা হয়, কিন্তু অন্যান্য scan type গুলো সম্পর্কেও ধারণা রাখা গুরুত্বপূর্ণ।

নেটওয়ার্ক স্ক্যানিংয়ের ক্ষেত্রে আমরা সংক্ষেপে ICMP (অর্থাৎ “ping”) scanning নিয়েও আলোচনা করব।