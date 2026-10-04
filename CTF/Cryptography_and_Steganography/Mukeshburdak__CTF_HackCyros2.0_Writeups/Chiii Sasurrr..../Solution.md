# 📍 Chiii Sasurrr....: CTF Challenge Writeup

> *"Khaini Khaiyega kya??"*

---

## 🏁 Challenge Info

| Field | Details |
|-------|---------|
| **Name** | Chiii Sasurrr.... |
| **Category** | OSINT / Geolocation |
| **Flag Format** | `cyros{lat,long}` |
| **Flag** | `cyros{23.20,76.99}` |

---

## 📜 Description

> "Khaini Khaiyega kya??"  
> `cyros{10.00,10.00}`

A KML/location file was provided with a **decoy flag** `cyros{10.00,10.00}` buried in the description metadata. The real flag requires identifying the **actual coordinates** of the location embedded in the challenge.

---

## 🔍 Solution

### Step 1: Spot the Decoy

The description contains `cyros{10.00,10.00}`: coordinates that point to the **Gulf of Guinea** (middle of the ocean, off the coast of Africa). This is a classic CTF troll/decoy. The real flag is the actual coordinates of the location in the challenge.

### Step 2: Identify the Location

The challenge provided a KML file with a pin on **Gram Panchayat Office, Mahodiya**. Opening the location in **Google Maps** reveals the precise coordinates in the URL bar and camera info:

```
23°12'10.29"N  76°59'53.79"E
```

Address: `Gram Panchayat Office, Mahodiya, Madhya Pradesh 466001`  
Plus Code: `6X3X+47 Mahodiya, Madhya Pradesh`

### Step 3: Convert DMS → Decimal Degrees

Using the standard DMS to Decimal Degrees formula:

```
Decimal = Degrees + (Minutes / 60) + (Seconds / 3600)
```

**Latitude:**
```
23 + (12 / 60) + (10.29 / 3600) = 23.20286389°
```

**Longitude:**
```
76 + (59 / 60) + (53.79 / 3600) = 76.99826944°
```

### Step 4: Round to 2 Decimal Places

```
Latitude:  23.20286389  →  23.20
Longitude: 76.99826944  →  77.00
```

> ⚠️ Note: Depending on intended rounding, the flag may also be `cyros{23.20,76.99}`. Try both if one doesn't work.

### Step 5: Construct the Flag

```
cyros{23.20,76.99}
```

---

## 🗺️ Location Verification

| Field | Value |
|-------|-------|
| **Place** | Gram Panchayat Office, Mahodiya |
| **State** | Madhya Pradesh, India |
| **PIN** | 466001 |
| **DMS Coordinates** | 23°12'10.29"N, 76°59'53.79"E |
| **Decimal Coordinates** | 23.20286389°N, 76.99826944°E |
| **Plus Code** | 6X3X+47 Mahodiya |

---

## 🏆 Flag

```
cyros{23.20,76.99}
```

---

## 🛠️ Tools Used

- **Google Maps / Google Earth**: location identification from satellite view
- **KML file inspection**: extracting embedded coordinates and metadata
- **DMS to Decimal converter**: coordinate format conversion
- **Plus Code decoder**: cross-verification of location

---

## 💡 Key Takeaways

- **Never trust the flag in the description**: decoy flags are a common OSINT trick.
- KML files store rich metadata including coordinates, descriptions, and place names: always inspect them fully.
- Google Maps' camera coordinates (shown at the bottom of the screen) give highly precise DMS coordinates.
- Plus Codes (Open Location Codes) can be used to independently verify a location.
- When a flag says `{10.00, 10.00}`: that's the middle of the ocean. Keep digging! 🌊

---

*Coordinates found. Khaini declined. Flag accepted. 🫡*

Problem.png
-
<img width="1600" height="518" alt="problem" src="https://github.com/user-attachments/assets/6a893892-00df-4635-b03a-ea55a77a5107" />

Map.png
-
<img width="1128" height="811" alt="Map" src="https://github.com/user-attachments/assets/e2f0f64f-a5ef-4205-b08c-f83d4dd4c303" />

Convert.png
-
<img width="797" height="544" alt="Convert" src="https://github.com/user-attachments/assets/44574db8-10b4-4713-8188-34ee78c36bf7" />

---
