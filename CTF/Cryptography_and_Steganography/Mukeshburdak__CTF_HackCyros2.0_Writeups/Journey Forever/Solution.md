🚆 Journey Forever: CTF Writeup
-
<p align="center"> <img src="https://img.shields.io/badge/Category-OSINT-blue?style=for-the-badge"> <img src="https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge"> <img src="https://img.shields.io/badge/Focus-News%20%7C%20Railway%20Analysis-green?style=for-the-badge"> </p>

🧠 Challenge Description
-
The challenge describes:

A late 2017 overnight train journey

Starting from a state capital in eastern India

Ending at one of India’s busiest railway terminals

A nationally recognisable figure

A halt at the station with the least number of alphabets (excluding words like junction, cantonment, station)

We had to:

Identify the station

Identify the full name of the person

Submit in format:

cyros{STATION_PERSON-NAME}

(UPPERCASE, spaces replaced with underscores)

🔎 Investigation Process
-
1️⃣ Identify the Person
-
Search queries used:

“2017 famous personality train journey overnight eastern India”

“celebrity travelled by train after decade 2017 news”

This led to news articles about:

👉 Mahendra Singh Dhoni
-
In 2017, he travelled by train from Ranchi (Jharkhand capital) to Delhi.

2️⃣ Identify the Train Route
-
The train had multiple scheduled halts.

We analyzed the list of stations and counted the alphabets in each station name (excluding words like Junction, Cantonment, etc.).

Among all scheduled stops, the station with the least number of letters was:

👉 Muri
-
“MURI” has only 4 letters: the smallest among the halts.

🚩 Final Flag
-
cyros{MURI_MAHENDRA_SINGH_DHONI}

🧩 Key Takeaways
-
Small details (like alphabet count) matter in OSINT challenges.

News archives are powerful investigation tools.

Railway route analysis can reveal hidden logic.

Always verify information from multiple sources.

🏁 Conclusion
-
This challenge combined:

News research

Logical filtering

Railway route analysis

Attention to detail

The correct station and personality were successfully identified through structured OSINT investigation.

---
<img width="891" height="410" alt="Screenshot 2026-02-28 100058" src="https://github.com/user-attachments/assets/1b3d2a2c-d1f3-4925-bddb-d2a79d2c841b" />
<img width="823" height="56" alt="Screenshot 2026-02-28 100351" src="https://github.com/user-attachments/assets/6266ccfe-7f29-47fc-8402-6988473b7a3b" />

