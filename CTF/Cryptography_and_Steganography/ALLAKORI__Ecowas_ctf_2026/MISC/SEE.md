
# 🕵️ SEE: Misc (400 pts)

## 🧩 Challenge Description
> Provided with the leaked artifacts, you are required to extract the flag and provide it.

---

## 📦 Provided Files
```

chall.zip
├── emails.eml
├── profiles.json
└── __MACOSX/ (irrelevant)

````

---

## 🔎 Step 1: Extract and Inspect Files

```bash
unzip chall.zip
file *
````

We identify two relevant files:

* `emails.eml` → email thread
* `profiles.json` → employee profiles

---

## 🧠 Step 2: Analyze the Email (Key Hint)

```bash
strings emails.eml
```

Important part:

```text
@Archives: for EWI-047 only:
...
use the temporary pattern we discussed verbally
(team token + the year we all remember from the Abidjan office milestone + your usual trailing symbol)
```

💡 Key observations:

* Only **EWI-047** is concerned
* Password pattern is clearly defined:

```text
[team token] + [milestone year] + [trailing symbol]
```

---

## 🎯 Step 3: Identify Target Profile (EWI-047)

```bash
cat profiles.json
```

Locate:

```json
{
  "employee_id": "EWI-047",
  "display_name": "Yao N’Guessan",
```

---

## 🔍 Step 4: Extract Required Components

### 🔹 1. Team Token

```json
"fan_shorthand": "Mimos"
```

📌 Email hint confirms:

> team token = fan shorthand (NOT full team name)

👉 **team token = Mimos**

---

### 🔹 2. Milestone Year

```json
"id_badge_footer_print": "EST. MMXIX"
```

Convert Roman numerals:

```text
MMXIX = 2019
```

👉 **year = 2019**

---

### 🔹 3. Trailing Symbol

```json
"Ends ... with a tilde"
```

👉 **symbol = ~**

---

## 🧩 Step 5: Reconstruct the Password

```text
Mimos + 2019 + ~
```

👉 Result:

```text
Mimos2019~
```

---

## 🏁 Step 6: Submit Flag

```text
EcowasCTF{Mimos2019~}
```

---

## 💡 Key Takeaways

* Classic **OSINT + correlation challenge**
* No brute force required
* All pieces are:

  * ✔ Explicit
  * ✔ Distributed across files
* Requires:

  * Careful reading
  * Linking hints between artifacts

---

## 🧠 Methodology Pattern (Reusable)

When you see:

* “pattern”
* “only X user”
* multiple files

👉 Think:

```text
Extract → Correlate → Reconstruct
```

---

## ✅ Final Flag

```text
EcowasCTF{Mimos2019~}
```

```
```
