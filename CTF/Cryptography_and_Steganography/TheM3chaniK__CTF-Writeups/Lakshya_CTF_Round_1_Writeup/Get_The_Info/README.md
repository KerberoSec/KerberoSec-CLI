# 🚀 Get The Info
**Category** OSINT
**Difficulty** Easy
**Points:** 150

## Description
I recently took a trip to Washington, D.C., to meet Donald Trump at his residence. After the meeting, we had lunch at a famous Indian restaurant known for its Indian and Nepali cuisine: the kind of place locals rave about. From there, we walked to a nearby art gallery, all within a 0.3 mile radius. That’s where I saw a ceramic sculpture that completely captivated me. The artist, known for her ceramic work and she also told me that she is having an exhibition there on March 26. I really wanted to contact her to inquire about purchasing the piece, but I lost her details. Can you help me find the email address of the artist?

Flag Format : LakshyaCTF{email@gmail.com}

## Tools Used

 * Google
 * ChatGPT
 * GoogleMaps

## 🧠 Analysis
- Step 1: Trying to find the location of the donald trump's residence  
So obviously it was `White House`

- Step 2: Trying to find the nearby famous Indian restaurant known for its Indian and Nepali cuisine  
 So using google map I went to the location of white house then in the nearby option search restaurant. And in the filter I selected cuisine: Indian, Rating: 4.5 star(As local Rave about it). Then the nearest good restaurant was `G.O.A.T. Room`.

- Step 3: Finding the nearby art Gallery within 0.3 miles  
  So again using google map nearby option I searched art gallery and the closest art gallery was `touchstone gallery` (exactly 0.2 miles apart)

- Step 4: It's time to find the artist.  
  According the question the artist was female and she also had a show at March 26. So I asked chatgpt
  ```html
  Name the female artist who had a exhibition at touch stone gallery at march 26 on ceramic sculpture
  ```
  And It replied

  ```html
  The female artist who held a ceramic sculpture exhibition at Touchstone Gallery starting on March 26, 2025, is **Elena Tchernomazova**. Her solo exhibition, titled *Constellations*, features over two dozen ceramic sculptures inspired by her background in astrophysics and her fascination with astronomy. The exhibition runs from March 26 to April 27, 2025. citeturn0search0

  Elena Tchernomazova holds a Master's degree in astrophysics from Moscow State University and has also studied ceramics at Montgomery College. Her work often reflects her scientific background, blending artistic expression with astronomical themes. citeturn0search12

  If you're interested in learning more about her work or visiting the exhibition, you can find additional information on the [Touchstone Gallery website](https://www.touchstonegallery.com/elena-tchernomazova). 
  ```
  So the artist was `Elena Tchernomazova`

- Step 5: Find her email  
  Though we couldn't find her email anywhere. we went to the contact page in her site which you can find [here](http://www.elenaceramics.com/contactbuy.htm), but no luck. Then by seeing the flag pattern in the question we took a hard guess and assume her email would be `<her_name>@gmail.com`.
  So our guess was `elenatchernomazova@gmail.com`. And we were correct. so the flag was `LakshyaCTF{elenatchernomazova@gmail.com}`
  
## 🏁 Flag

```bash
LakshyaCTF{elenatchernomazova@gmail.com}
```