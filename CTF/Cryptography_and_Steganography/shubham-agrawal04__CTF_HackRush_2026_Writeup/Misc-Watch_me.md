# watch_me

**Category:** Miscellaneous  
**Points:** 50  

---

## Description

> We recorded a cool video. Watch it!  
>
> http://4.188.84.14:7777  
>
> Hint: *got the flags? still not working? maybe it's a visual dilemma. make sure it's a 'O' not '0'*  

---

## Approach

### 1. Initial Observation

- Opened the video in the browser
- While watching carefully:
  - Noticed a **single frame** containing:

```text
h@CkRuSH2O26{
````

* This indicated:

  * The flag is **embedded across video frames**

---

## 2. Investigating Video Streaming

* Observed message:

  ```
  Best quality selected automatically.
  ```

### Insight:

> The video is likely using **adaptive streaming (HLS/DASH)**

---

## 3. Extracting Video Streams

* Opened browser **Developer Console → Network tab**

* Found an `.m3u8` playlist file

* Downloaded the video streams manually

---

## 4. Identifying Multiple Qualities

* From the `.m3u8` file:

  * Found multiple resolutions:

    * **360p**
    * **480p**
    * **720p**

* Converted streams to `.mp4` for easier inspection

---

## 5. Extracting Hidden Frames

### 360p Video:

* Found frame containing:

```text
h@CkRuSH2O26{
```

---

### 480p Video:

* Found frame containing:

```text
hls_
```

---

### 720p Video:

* Found frame containing:

```text
d4sh_
```

---

## 6. Exploring DASH Manifest

* Since HLS was present, suspected **DASH streaming** as well

* Retrieved DASH manifest

* Found an additional frame containing:

```text
m4n1f3st}
```

---

## 7. Constructing the Flag

Combining all parts:

```text
h@CkRuSH2O26{hls_d4sh_m4n1f3st}
```

---

## Final Answer

```text
h@CkRuSH2O26{hls_d4sh_m4n1f3st}
```

---

## Key Insight

* Different video qualities can contain **different hidden data**
* Adaptive streaming (HLS/DASH) splits content across:

  * Resolutions
  * Manifests
* The challenge required:

  * Extracting all streams
  * Combining partial clues

---

## Tools Used

* Browser Developer Tools (Network tab)
* Video conversion tools
* Manual frame inspection

---

## Lessons Learned

* Always inspect streaming protocols (HLS/DASH) in video challenges
* Different resolutions may contain different information
* `.m3u8` and manifest files are key entry points
* Frame-by-frame analysis is crucial for hidden data

---

