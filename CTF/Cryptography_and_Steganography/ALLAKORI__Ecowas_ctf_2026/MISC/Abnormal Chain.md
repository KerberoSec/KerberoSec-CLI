# 🧩 Abnormal Chain: Misc Writeup

**Category:** Misc  
**Difficulty:** Easy  
**Points:** 100  

---

## 📜 Description

> *"The wise know that to move forward, you must sometimes retrace your steps."*

We are given a file `cipher.txt` containing an encoded string.

---

## 📂 Initial Analysis

```bash
cat cipher.txt
```

Output:

```text
RyZuUmhIOTBqa0ctZnE0Ry1FVmxHK3tNaUctTmIyR2NxKH1IRE5Wakcmd2I0RyZuUmpHY3ErWEg4ZTlhRy1OYjNHY3ErY0cmTTZlSDhlQ2RHLU5lbEctV2gzRy1mcTRHLUVWM0cre01pSDg/YWtHJmVJZ0g4ZUQxRyt7SXtHJm5Sa0cmZU02Ry01UDJHLUVWakdjYDBlRyYzfTBHY3o8YUg4MzxlR2NxKFpHJk1EMEctNVAzRy01UDRIOTBqbEcmM19jSDhWNmZHJmVNMUg4VjZnRy1OZTJIOFY5aEctNVA0R2h7UGxHaHtQbEdoe1Bs
```

---

## 🔍 Step 1: Base64 Decode

The string uses only Base64 characters (`A-Za-z0-9+/`), so we decode it:

```bash
echo '...' | base64 -d
```

Result:

```text
G&nRhH90jkG-fq4G-EVlG+{MiG-Nb2Gcq(}HDNVjG&wb4G&nRjGcq+XH8e9aG-Nb3Gcq+cG&M6eH8eCdG-NelG-Wh3G-fq4G-EV3G+{MiH8?akG&eIgH8eD1G+{I{G&nRkG&eM6G-5P2G-EVjGc`0eG&3}0Gcz<aH83<eGcq(ZG&MD0G-5P3G-5P4H90jlG&3_cH8V6fG&eM1H8V6gG-Ne2H8V9hG-5P4Gh{PlGh{PlGh{Pl
```

---

## 🔍 Step 2: Base85 Decode

The output contains many special characters (`& {} () - +`), which is typical of **Base85 encoding**.

⚠️ Important: This is **Python Base85 (b85)**, not standard ASCII85 → many online tools fail.

We decode using Python:

```python
import base64

step1 = b"G&nRhH90jkG-fq4G-EVlG+{MiG-Nb2Gcq(}..."
step2 = base64.b85decode(step1)
print(step2)
```

Result:

```text
484559554f544c4c4a5a4d45324d5a5a495a4847325154324d463256453654444d5a4e454f544c474a5a58474736544c4a424848474f4b474c4a3546434d334450493244455a4b484b49595643365347474a53484d5453584b493d3d3d3d3d3d
```

---

## 🔍 Step 3: Hex Decode

The output is clearly hexadecimal:

```python
step3 = bytes.fromhex(step2.decode())
print(step3)
```

Result:

```text
HEYUOTLLJZME2MZZIZHG2QT2MF2VE6TDMZNEOTLGJZXGG6TLJBHHGOKGLJ5FCM3DPI2DEZKHKIYVC6SGGJSHMTSXKI======
```

---

## 🔍 Step 4: Base32 Decode

The string is uppercase with padding (`=`), typical of Base32:

```python
step4 = base64.b32decode(step3)
print(step4)
```

Result:

```text
91GMkNXM39FNmBzauRzcfZGMfNnczkHNs9FZzQ3cz42eGR1QzF2dvNWR
```

---

## 🔍 Step 5: Reverse

The description hint says:

> *"retracing your steps"*

So we reverse the string:

```python
step5 = step4.decode()[::-1]
print(step5)
```

Result:

```text
RWNvd2FzQ1RGe24zc3QzZF9sNHkzcnNfMGZfczRuazBmNF93MXNkMG19
```

---

## 🔍 Step 6: Final Base64 Decode

This looks like Base64 again:

```python
flag = base64.b64decode(step5).decode()
print(flag)
```

---

## 🏁 Final Flag

```text
EcowasCTF{n3st3d_l4y3rs_0f_s4nk0f4_w1sd0m}
```

---

## 🧠 Key Takeaways

- 🔁 Always consider **multiple encoding layers**
- 🧩 Recognize encoding patterns:
  - Base64 → standard charset
  - Base85 → many special symbols
  - Hex → `[0-9A-F]`
  - Base32 → uppercase + `=`
- 💡 Read hints carefully → here **reverse was required**
- ⚠️ Not all tools support all variants (Base85 != ASCII85)

---

## 🧪 Full Solve Script

```python
import base64

s = "RyZuUmhIOTBqa0ctZnE0Ry1FVmxHK3tNaUctTmIyR2NxKH1IRE5Wakcmd2I0RyZuUmpHY3ErWEg4ZTlhRy1OYjNHY3ErY0cmTTZlSDhlQ2RHLU5lbEctV2gzRy1mcTRHLUVWM0cre01pSDg/YWtHJmVJZ0g4ZUQxRyt7SXtHJm5Sa0cmZU02Ry01UDJHLUVWakdjYDBlRyYzfTBHY3o8YUg4MzxlR2NxKFpHJk1EMEctNVAzRy01UDRIOTBqbEcmM19jSDhWNmZHJmVNMUg4VjZnRy1OZTJIOFY5aEctNVA0R2h7UGxHaHtQbEdoe1Bs"

step1 = base64.b64decode(s)
step2 = base64.b85decode(step1)
step3 = bytes.fromhex(step2.decode())
step4 = base64.b32decode(step3)
step5 = step4.decode()[::-1]
flag = base64.b64decode(step5).decode()

print(flag)
```

---

## 🚀 Conclusion

This challenge demonstrates how multiple simple encodings can be chained together to create a more complex problem. The key skill is not just decoding, but **recognizing patterns and adapting tools accordingly**.
