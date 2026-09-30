# Farewell

**Category:** Miscellaneous  
**Points:** 40  

---

## Description

> A former member of ISTF left behind a trail of digital breadcrumbs.  
>
> On July 2018, he attended a farewell event. Before the event, he was working on a guideline document.  
>
> Find the exact start date and time of the farewell event and convert it into a Unix Epoch timestamp.  
>
> Flag format: `HRCTF{EPOCH_TIMESTAMP}`  
>
> **Note:** Do NOT contact ISTF staff.

---

## Approach

### 1. Understanding the Challenge

- The problem hinted at:
  - ISTF website

👉 This suggested an **OSINT-style search task**

---

## 2. Exploring ISTF Resources

- Navigated through ISTF-related pages and documents
- Found a relevant PDF:

```

Google_calender_Room_booking_guide_July2018.pdf

```

Source:
```

https://istf.iitgn.ac.in/sites/default/files/Software/HowTo/Google_calender_Room_booking_guide_July2018.pdf

```

---

## 3. Extracting the Event Information

- Inside the PDF:
  - Found a **calendar view for July 2018**

### Key Observation:

- **16th July** marked as:
```

Farewell Event

```
- Time:
```

4:00 PM: 6:00 PM

```

---

## 4. Converting to Required Format

### Step 1: Convert IST to UTC

- IST = UTC + 5:30  
- Event start time:
```

16 July 2018, 4:00 PM IST

```
- Convert to UTC:
```

16 July 2018, 10:30 AM UTC

```

---

### Step 2: Convert UTC → Unix Epoch

- UTC time:
```

2018-07-16 10:30:00

````

- Epoch timestamp:
```text
1531737000
````

---

## Final Answer

```text
HRCTF{1531737000}
```

---

## Key Insight

* The challenge relied on:

  * **Finding hidden information in documents (OSINT)**
  * Not brute-force or guessing
* The “guideline document” clue directly pointed to the PDF

---

## Tools Used

* Web browsing (OSINT)
* Manual time conversion

---

## Lessons Learned

* Always follow contextual clues (e.g., “guideline document”)
* PDFs and documents often contain valuable hidden information
* Timezone conversion is a common step in CTF challenges
* OSINT challenges reward attention to detail over technical complexity

---
