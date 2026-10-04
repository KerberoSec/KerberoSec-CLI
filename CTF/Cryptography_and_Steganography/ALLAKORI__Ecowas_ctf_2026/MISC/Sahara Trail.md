# 🏜️ Sahara Trail: Writeup

**Category:** Misc  
**Difficulty:** Medium  
**Points:** 200  

---

## 📜 Description

> *A caravan crossed the Sahara and left photos at each stop. I’m sure the trails don’t lie, maybe they do.*

We are given a ZIP archive containing multiple images (`stops.zip`).

---

## 📂 Initial Analysis

```bash
file stops.zip
unzip stops.zip
cd stops
```

We obtain ~35 JPEG images:

```bash
ls
stop_0.jpg  stop_1.jpg  ... stop_34.jpg
```

Opening them visually:

```bash
eog *.jpg
```

👉 All images look identical (orange background).

⚠️ **Conclusion:** The visual content is a decoy.

---

## 🔍 Metadata Analysis

We inspect the files using:

```bash
file *.jpg
```

We notice something interesting:

```text
description=stop_X: <char>, GPS-Data
```

👉 Each image contains:
- a **character** in `Image Description`
- **GPS coordinates**

---

## 🧠 Key Insight

The challenge title: **"Sahara Trail"**

The description mentions:
- *caravan*
- *stops*
- *trail*

👉 This strongly suggests:
> The correct order is NOT `stop_0 → stop_1 → ...`  
> but the **actual geographical path**

---

## 🌍 Extract GPS Data

```bash
exiftool *.jpg
```

We observe:

- **Latitude is constant** → `15°N`
- **Longitude varies** → from `0°E → 34°E`

👉 So the movement is **East-West**

---

## 🔥 Reconstruct the Trail

We extract and sort by longitude:

```bash
exiftool -csv -GPSLongitude# -ImageDescription *.jpg \
| tail -n +2 \
| sort -t, -k2 -n \
| sed -E 's/.*stop_[0-9]+: //' \
| tr -d '\n'
```

---

## 🧪 Command Breakdown

| Step | Purpose |
|------|--------|
| `exiftool -csv` | Extract metadata in CSV format |
| `-GPSLongitude#` | Numeric longitude |
| `-ImageDescription` | Extract hidden character |
| `tail -n +2` | Remove CSV header |
| `sort -t, -k2 -n` | Sort by longitude |
| `sed` | Extract only the character |
| `tr -d '\n'` | Join everything |

---

## 🏁 Final Flag

```text
EcowasCTF{s4h4r4_tr41l_3x1f_c00rds}
```

---

## 💡 Lessons Learned

- Always inspect **metadata** in image challenges
- Identical images → likely **hidden data**
- GPS data can define **ordering logic**
- Challenge names/descriptions often contain **critical hints**

---

## 🧠 Takeaway

> When everything looks the same visually…  
> **the truth is usually in the metadata.**

🔥
