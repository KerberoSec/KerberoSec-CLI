# 🚀 Silent Witness
**Category** OSINT
**Difficulty** Easy  
**Points:** 100

## Description
You are given a photo of an object. Your task is to identify where this object is currently located and on which floor.

Flag format: LakshyaCTF{place_name_floorNumber}

(All lowercase, replace spaces with underscores: e.g., LakshyaCTF{uffizi_galleries_8})

## Files / Resources

- `osint_2.jpg`

## Tools Used

 * Google
 * Google Translate

## 🧠 Analysis

- Step 1: Analyze The Image  
  We opened the image so it was a coffee machine cant tell anything else.
- Step 2: Reverse Image Search  
  By using image search we tried to find where was the image from and quickly we found a website where exact image was used. You can check the website [here](https://blog.hnf.de/der-kaffee-ist-fertig/)  
- Step 3: Translating The Page  
  The page was in german. As none of us know germen we translated this page using google translate
- Step 4: Reading the blog  
  It was a very interesting blog though we read it and at the last of the blog there was some lines
  ```html
  Since October 2016, the „Trojan Room Coffee Pot “ has been on permanent loan at the Heinz Nixdorf MuseumsForum; we would like to thank SPIEGEL ONLINE. The square, see the entrance picture above, is a compartment in the internet wall on the second floor; like in England everything is from one Video camera monitored. Fresh coffee is available in the museum café F7 on the ground floor: the is the menu and drinks menu.
  ```
- Step 6: Constructing the flag  
  * So we found out that the image was taken at `Heinz Nixdorf MuseumsForum` and it is at `2nd floor`.
  * So by looking at the question the flag should be `LakshyaCTF{heinz_nixdorf_museumsforum_2}`
## 🏁 Flag

```bash
LakshyaCTF{heinz_nixdorf_museumsforum_2}
```