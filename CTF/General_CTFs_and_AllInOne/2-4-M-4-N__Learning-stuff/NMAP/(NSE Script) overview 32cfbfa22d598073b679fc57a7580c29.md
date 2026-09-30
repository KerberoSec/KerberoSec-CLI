# (NSE Script) overview

Nmap Scripting Engine (NSE) হলো Nmap-এর একটি অত্যন্ত শক্তিশালী feature, যা এর functionality অনেক বেশি বাড়িয়ে দেয়। NSE script গুলো **Lua programming language**-এ লেখা হয় এবং এগুলো বিভিন্ন কাজে ব্যবহার করা যায়: যেমন vulnerability scan করা থেকে শুরু করে automated exploit চালানো পর্যন্ত। reconnaissance (তথ্য সংগ্রহ)-এর ক্ষেত্রে NSE বিশেষভাবে কার্যকর। এছাড়া এর script library অনেক বড় এবং বিস্তৃত।

NSE-তে বিভিন্ন category-এর script পাওয়া যায়। কিছু গুরুত্বপূর্ণ category হলো:

- **safe**: target-এর উপর কোনো প্রভাব ফেলে না
- **intrusive**: নিরাপদ নয়; target system-এ প্রভাব ফেলতে পারে
- **vuln**: vulnerability খুঁজে বের করার জন্য ব্যবহার করা হয়
- **exploit**: vulnerability exploit করার চেষ্টা করে
- **auth**: authentication bypass করার চেষ্টা করে (যেমন: FTP server-এ anonymous login)
- **brute**: brute-force করে credentials বের করার চেষ্টা করে
- **discovery**: running services থেকে অতিরিক্ত তথ্য সংগ্রহ করে (যেমন: SNMP server query করা)

পরবর্তী ধাপে আমরা দেখব কীভাবে NSE-এর সাথে interact করতে হয় এবং এই category গুলোর script ব্যবহার করা যায়।

---

- NSE script কোন programming language-এ লেখা হয়?
    
    > **Lua**
    > 
- কোন category-এর script production environment-এ চালানো খুব খারাপ ধারণা?
    
    > **intrusive**
    >