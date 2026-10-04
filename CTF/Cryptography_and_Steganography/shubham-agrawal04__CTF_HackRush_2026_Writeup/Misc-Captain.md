# Captain

**Category:** Miscellaneous  
**Points:** 50  

---

## Description

> Find the mysterious message for our Captain:  
>
> https://www.linkedin.com/in/americacaptain/  
>
> Hint: *You know where. But unsure where? look where images come to life.*  

---

## Approach

### 1. Initial Recon (LinkedIn)

- Visited the given LinkedIn profile  
- Explored posts and activity  

### Key Observation:
- Found a **Spider-Man & Captain America themed post**
- The post contained a **link to an audio file**

---

## 2. Audio Analysis

- Downloaded the audio file  
- Audio sounded distorted / unintelligible  

### Hypothesis:
> The audio might be **reversed**

---

### 3. Reversing the Audio

- Reversed the audio using a tool  

### Result:
- Extracted **geographical coordinates**

---

## 4. Using Coordinates

- Entered the coordinates into **Google Maps**

### Result:
- Located a place related to **Art@IITGN**

---

## 5. Finding the Key Clue on Maps

- While exploring the location on Google Maps:
  - Found a user named:

```

Enderman

````

### Important Discovery:

- This user had:
  - Left a **review** on Art@IITGN which was a photo
- The review/photo contained:
  - **Part of the flag**

---

## 6. Completing the Flag

- Visited the **Enderman profile** on Maps  
- Found another image uploaded by the same user  

### Result:
- Second image contained the **remaining part of the flag**

---

## Final Answer

```text
HRCTF{L00k_f0r_th3_3y3}
````

---

## Key Insight

* The challenge required chaining:

  1. LinkedIn → find hidden link
  2. Audio → reverse → coordinates
  3. Maps → find user activity
  4. User profile → combine clues from images

* The hint *“images come to life”* pointed towards:

  * **Image-based clues on platforms like Google Maps**

---

## Tools Used

* Browser (LinkedIn, Maps)
* Audio reversing tool

---

## Lessons Learned

* OSINT challenges often span multiple platforms
* User-generated content (reviews, uploads) can hide clues
* Always inspect:

  * Profiles
  * Reviews
  * Uploaded images
* Small hints can guide the entire investigation path

---

