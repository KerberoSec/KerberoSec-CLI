# (NSE Script) Working with the NSE

Task 3-এ আমরা খুব সংক্ষেপে **`--script`** switch দেখেছিলাম, যেখানে **`--script=vuln`** ব্যবহার করে vuln category-এর NSE script চালানো হয়েছিল। একইভাবে অন্যান্য category-ও ঠিক একই পদ্ধতিতে কাজ করে। যেমন, **`--script=safe`** ব্যবহার করলে target-এর উপর applicable সব safe script run হবে (উল্লেখ্য: শুধুমাত্র active service-কে target করে এমন script-ই চালানো হবে)।

নির্দিষ্ট কোনো script চালাতে হলে ব্যবহার করতে হয়:

- **--script=**
    
    যেমন: `--script=http-fileupload-exploiter`
    
- একাধিক script একসাথে চালানো যায় comma দিয়ে আলাদা করে।
    
    উদাহরণ: `--script=smb-enum-users,smb-enum-shares`
    

কিছু script চালাতে অতিরিক্ত argument প্রয়োজন হয় (যেমন: authenticated vulnerability exploit করতে credentials লাগতে পারে)। এই argument গুলো দেওয়া হয় **`--script-args`** switch দিয়ে। উদাহরণ হিসেবে **`http-put`** script (PUT method ব্যবহার করে file upload করার জন্য) এটি **দুইটি argument নেয়:

- upload করার জন্য URL
- local disk-এ file-এর path

উদাহরণ কমান্ড:

```bash
nmap -p 80 --script http-put --script-args http-put.url='/dav/shell.php',http-put.file='./shell.php'
```

এখানে লক্ষ্য করার বিষয়:

- argument গুলো comma দিয়ে আলাদা করা হয়.
- এবং script-এর সাথে argument যুক্ত হয় dot (.) ব্যবহার করে
    
    অর্থাৎ: `<script-name>.<argument>`
    

সব NSE script, তাদের argument এবং example usage-এর বিস্তারিত তালিকা অফিসিয়াল [documentation](https://nmap.org/nsedoc/)-এ পাওয়া যায়।

---

এছাড়া Nmap script-এর built-in help system আছে। এটি ব্যবহার করতে হয়:

```bash
nmap --script-help <script-name>
```

এই help system-টি documentation-এর মতো এত বিস্তারিত না হলেও, local environment-এ কাজ করার সময় যথেষ্ট সহায়ক।

---

- ftp-anon.nse script কোন optional argument নিতে পারে?
    
    > **maxlist**
    >