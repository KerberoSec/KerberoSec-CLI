# 🏜️ Wallahaaa: CTF Challenge Writeup

> *"Rutututuuuu...." 🚗💨*

---

## 🏁 Challenge Info

| Field | Details |
|-------|---------|
| **Name** | Wallahaaa |
| **Category** | OSINT / Geolocation |
| **Flag Format** | `cyros{Lat,Long}` |
| **Flag** | `cyros{25.05,55.33}` |

---

## 📜 Description

> A courier used a remote desert drop point to exchange sensitive data.  
> We intercepted a ground-level capture taken near the drop site.  
>
> The location appears isolated, but no place is truly empty: the desert always leaves traces.  
>
> Identify the exact coordinates where this image was captured.  
>
> The system only accepts precision.  
> Lat = 10.00 | Long = 10.00  
> Flag: `cyros{Lat,Long}`  
>
> BTW, i like to drift, Rutututuuuu....

---

## 🔍 Solution

### Step 1: Ignore the Decoy Coordinates

Just like before, `Lat = 10.00, Long = 10.00` is a **decoy**: those coordinates land in the Gulf of Guinea, in the middle of the Atlantic Ocean. The real flag requires identifying the actual location from the challenge data.

### Step 2: Extract the KML Metadata

The challenge embeds a KML file. Inspecting the KML reveals a pinned coordinate in the description. The hint: *"courier," "remote desert drop point," "I like to drift"*: strongly suggests **Dubai, UAE** (famous for desert terrain and drift culture 🏎️).

### Step 3: Identify the Location on Google Maps

Dropping the coordinates from the KML onto Google Maps confirms the location:

```
25°03'00.0"N  55°19'48.0"E
```

**Plus Code:** `28XH+XXX Dubai - United Arab Emirates`

The satellite view shows a **remote desert road junction** on the outskirts of Dubai: an isolated strip of asphalt cutting through barren sand dunes. Classic "dead drop" territory.

### Step 4: Convert DMS → Decimal Degrees

```
Latitude:
25 + (03 / 60) + (00.001 / 3600) = 25.05000028°  →  25.05

Longitude:
55 + (19 / 60) + (48.00 / 3600) = 55.33000000°  →  55.33
```

### Step 5: Construct the Flag

```
cyros{25.05,55.33}
```

---

## 🗺️ Location Details

| Field | Value |
|-------|-------|
| **Place** | Remote desert road, outskirts of Dubai |
| **Country** | United Arab Emirates 🇦🇪 |
| **DMS Coordinates** | 25°03'00.0"N, 55°19'48.0"E |
| **Decimal Coordinates** | 25.05000028°N, 55.33000000°E |
| **Plus Code** | 28XH+XXX Dubai, UAE |
| **Terrain** | Desert road junction, isolated, no nearby structures |

---

## 🏆 Flag

```
cyros{25.05,55.33}
```

---

## 🛠️ Tools Used

- **Google Maps / Google Earth**: satellite view and coordinate pin verification
- **KML metadata inspection**: extracting embedded coordinates
- **DMS to Decimal Degrees converter**: coordinate format conversion
- **Google Maps Timeline viewer**: cross-checking 2023 satellite imagery

---

## 💡 Key Takeaways

- **Decoy flags are standard**: always verify coordinates actually land somewhere meaningful before submitting.
- Cultural clues in the description matter: *"drift"* + *"desert"* = UAE/Dubai is a very strong signal.
- **Plus Codes** (Open Location Codes like `28XH+XXX`) are a fast way to verify you're in the right region without needing full decimal precision.
- Desert satellite imagery is surprisingly distinctive: road junctions, wadi patterns, and sand track formations can all help narrow down a location.
- Google Maps' historical imagery slider (visible in Image 2, set to 2023) can help verify when a photo was taken vs. when the location was set up.

---

*Desert drop located. Drift noted. Flag submitted. Wallah. 🏁*
