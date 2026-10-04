# Resource That allowed by Same Origin Policy

**Same-Origin Policy (SOP)** এর ক্ষেত্রে যে **resource** allow করে বলতে বুঝায়, “যে সাইটের জন্য রিকোয়েস্ট করছি ওই সাইটের ডাটা বা জিনিসপত্র যেগুলো ব্রাউজার থেকে অ্যাক্সেস করা যায়।”

ওয়েবসাইটের নিচের জিনিসগুলো SOP এর অধীনে পড়ে:

- **DOM**
    
    (যেমন document.body, input value)
    
- **Cookies**
    
    (session cookie, auth token)
    
- **LocalStorage / SessionStorage**
- **Response body**
    
    (fetch/XHR করে যে ডাটা পায়)
    
- **Frames এর ভেতরের ডকুমেন্ট**
    
    (iframe.contentWindow)
    
- JS ফাইল অন্য domain থেকে ডাটা হিসেবে পড়া

এগুলোকেই SOP protect করে।

---

যে সকল রিসোর্স SOP ব্লক করেনা:

- ছবি (img)
- CSS ফাইল
- JS ফাইল অন্য domain থেকে লোড করা
- public files (PDF, static assets)
- ভিডিও/অডিও

এগুলো “resource” হলেও SOP এগুলো ব্লক করে না, কারণ sensitive data leak হওয়ার ঝুঁকি নেই।

---

হ্যাকার কি করবে সে নিচের javascript কোড নিজের ওয়েবসাইটে কনফিগার করে এর মাধ্যমে https://bank.com/account এ access করতে চাইবে 

```jsx
fetch("https://bank.com/account")
  .then(r => r.text())
  .then(data => console.log(data));
```

যখন হ্যাকার এমন একটা কোড নিজের ডোমেইন “https://evil.com/” দিবে তখন সে এই code এর সাহায্যে ব্রাউজার এর মাধ্যমে “https://bank.com” এর account এর ডাটা দেখতে চাইবে। তবে মজার বিষয় “https://bank.com” এ রিকোয়েস্ট কিন্তু যাবে, রিকোয়েস্ট fetch হবে এবং এর থেকে “bank.com/account” এর details আসবে ব্রাউজার এর কাছে।

ব্রাউজার চেক করবে যে ওই “https://bank.com/” আর “https://evil.com” এর origin একই কিনা! যদি mismatch হয় তখন ব্রাউজার রেসপন্স কে ব্লক করে।

---

**Same-Origin Policy কখনো রিকোয়েষ্ট হেডারে কাজ করেনা, সেটা সবসময় রেসপন্স হেডারেই কাজ করে।**

---

**আমার যদি কোনো সাইট থেকে থাকে এবং তার মধ্যে third-party কোনো সাইট যদি রিকোয়েস্ট করে তাহলে রিকোয়েস্টতো যাবে তবে রেসপন্স যেটা আমার সাইট থেকে যাবে সেটা তার ব্রাউজার এর হাতে যে ব্রাউজার দেখাবে নাকি দেখাবে না।**

---

**SOP সম্পূর্ণভাবে ব্রাউজারেই কাজ করে। এটা ব্রাউজারের ভেতরের বিল্ট-ইন নিরাপত্তা নিয়ম।**

---

## তাহলে কি SOP “ব্রাউজারে কনফিগার” করতে হয়?

Same-Origin Policy এটা এমন কোনো সেটিং না যেটা Chrome/Firefox-এ গিয়ে চালু: বন্ধ করতে পারা যাবে।

Same-Origin Policy:

- ব্রাউজার নিজে নিজেই enforce করে
- সব সাইটের জন্য একই নিয়মে
- ডেভেলপার বা ইউজার এটা অফ করতে পারে না
- সার্ভারও এটা নিয়ন্ত্রণ করতে পারে না

---

যদি ব্রাউজারের SOP ডিফল্টে “না” বলে, তাহলে যে সার্ভারে রিকোয়েস্ট করা হচ্ছে সে সার্ভারে Cross-Origin Resource Sharing (CORS) রেসপন্স হেডারে দিয়ে বলে: **“এই সাইটটাকে Allow করো।”**

```
Access-Control-Allow-Origin: https://evil.com
Access-Control-Allow-Methods: POST, GET
Access-Control-Allow-Headers: Content-Type
```

---

**CORS সবসময় সেই সাইটেই কনফিগার করা থাকে যেটার ডাটা রক্ষা করতে হবে**, অর্থাৎ **https:**//**bank.com**-এ।

---

## CORS এখন যেভাবে কাজ করে

`evil.com` চায় AJAX দিয়ে data আনতে:

```jsx
fetch("https://bank.com/account")
  .then(r => r.text())  
  .then(data => console.log(data));
```

এখন ব্রাউজার কী করবে?

- ব্রাউজার bank.com-এ প্রিফ্লাইট বা সাধারণ রিকোয়েস্ট পাঠাবে। এটা দেখতে যে bank.com কি সত্যিই `evil.com`-কে allow করে কি না।
- bank.com যদি রেসপন্স হেডারে দেয়:
    
    ```
    Access-Control-Allow-Origin: https://evil.com
    ```
    
    তাহলে ব্রাউজার আর রিকোয়েস্ট **ব্লক করে দেবে না।**
    
    evil.com **তখন** **সব** **কিছুই পড়তে পারবে**।
    

এইটাই হচ্ছে **Same-Origin Policy(SOP)** আর **Cross-Origin Resource Sharing(CORS)** এর বিষয়।

- **Same-Origin Policy = ডিফল্ট আইন**
- **Cross-Origin Resource Sharing = নির্দিষ্ট অনুমতি পত্র**

---
