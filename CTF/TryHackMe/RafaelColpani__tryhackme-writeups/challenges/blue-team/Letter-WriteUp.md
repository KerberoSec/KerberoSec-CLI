> **Platform:** TryHackMe
> **Room:** Letter
> **Difficulty:** Easy
> **Category:** OSINT
> **Tools Used:** Google Search, Image Inspection

# Letter Room

**Date:** 2026-08-06

## Description

> It's just another Monday morning on your mail delivery route when an unusual letter catches your eye. The envelope is battered, riddled with holes as if it's been through a storm. The address is barely legible, and your coworkers at the post office wave it off as a lost cause.
>
> But something about it nags at you.
>
> You carefully open the damp envelope. Inside, you find a faded newspaper clipping and a short handwritten note. The clipping is torn and water-damaged, with key sections missing. The note is personal, clearly not meant for your eyes, but the fragments you can read hint at a story buried in time.
>
> **Objective:** Use the clues provided in the ZIP file to uncover the full name and age of the person mentioned in the note.
>
> **Flag format:** `THM{Name_Surname_age}` (Only the first letter of the first name and surname should be capitalized.)
>
> **Example:** `THM{Pierre-Henry_Lagaffe_23}`

---

## Tasks

1. What is the postal code of the delivery address on the envelope?
2. What is the flag?

---

# Initial Reconnaissance

The room provides a ZIP archive named **Letter.zip** containing:

- Two PNG images
- One text file named **Notes.txt**

The first step was to inspect the contents of the note.

## Notes.txt

```text
Mon cher Édouard,

Aujourd'hui, en rangeant le grenier chez mes grands-parents, je suis tombée sur cette vieille coupure de journal. Ton arrière-grand-père n'avait même pas l'âge de passer le permis quand il s'est distingué ce jour-là. Le benjamin de l'équipe, et certainement pas le moins courageux.

Il serait si fier de te voir sur l'eau à ton tour.

Avec toute mon affection,
Audette
```

### English Translation

```text
My dear Édouard,

Today, while tidying up my grandparents' attic, I came across this old newspaper clipping. Your great-grandfather wasn't even old enough to get his driver's license when he distinguished himself that day. The youngest member of the team-and certainly not the least courageous.

He would be so proud to see you out on the water, too.

With all my love,
Audette
```

## Initial Findings

At first glance, the note does not reveal much information. However, a few clues stand out:

- The recipient is **Édouard**.
- His **great-grandfather** was **too young to obtain a driver's license**, suggesting he was a minor.
- He was described as **the youngest member of the team**, indicating that his age is likely relevant.
- The sentence **"He would be so proud to see you out on the water, too."** suggests that the historical event was related to the sea.

These clues would later prove useful.

---

# Image Analysis

## Image 1: `letter.png`

The first image shows an old, heavily damaged envelope.

After zooming in, I identified the following details:

- The recipient's name appears to be **"Édouard G..."**, matching the name mentioned in the note.
- The envelope contains the **SNSM** logo.

Since I was unfamiliar with the acronym, I searched for it and found the following information:

> The SNSM (Société Nationale de Sauvetage en Mer) is France's leading voluntary organization dedicated to saving lives at sea and along the coast. Founded in 1967, it relies on thousands of volunteers and operates hundreds of rescue vessels along the French coastline.

This reinforced the hypothesis that the story involved a maritime rescue.

Unfortunately, I could not extract any additional useful information from the envelope.

---

## Image 2: Newspaper Clipping

The second image contains an old, partially destroyed newspaper.

The newspaper title **L'Ouest-Éclair** was still readable.

### First Attempts

My initial approach was to search for the newspaper itself.

I tried several Google searches, including:

```text
L'Ouest-Éclair Journal Républicain Quotidien
```

and

```text
L'Ouest-Éclair L'oeuvre urgente
```

Neither search produced any relevant results.

Next, I searched for another readable headline:

```text
L'Ouest-Éclair Les événements du Maroc
```

Again, nothing useful was found.

I also attempted to identify another damaged title that looked like:

```text
Amund... - l-il atteint le pole Nord ?
```

Unfortunately, this search was also unsuccessful.

---

## Identifying the Main Article

The only remaining clue was the heavily damaged headline.

It appeared to read something similar to:

```text
Une ...phe sur ...s du Fiaisvere
```

I searched for:

```text
L'Ouest-Éclair côtes du Fiaisvere
```

Google corrected the query to:

```text
L'Ouest-Éclair côtes du Fièvre
```

This correction finally led me to relevant search results.

Among them was Google's AI Overview, which briefly described a maritime disaster. More importantly, I found the following article:

> https://www.kbcpenmarch.franceserv.com/le-desastre-du-30-septembre-1912.html

The article referenced **L'Ouest-Éclair**, confirming that it was discussing the same historical event shown in the newspaper clipping.

From there, I discovered that the article referred to **Penmarc'h**, which ultimately allowed me to identify the postal code shown on the envelope.

# Finding the Flag

Although the article described the disaster, I could not find anyone matching the clue about being underage.

I returned to Google and searched for additional articles published by **L'Ouest-Éclair**.

Eventually, I found another article:

> https://kbcpenmarch.franceserv.com/la-catastrophe-du-23-mai-1925-selon-la-presse-locale.html

While reading it, I found a rescue participant described as:

- **Gourlaouen Yves Marie**
- **15 years old**

This immediately matched several clues from the note:

- He was only **15 years old**.
- The note states that the great-grandfather was **too young to obtain a driver's license**.
- The recipient's surname on the envelope appears to begin with the letter **"G"**, matching **Gourlaouen**.

Based on these observations, I constructed the flag.

---

# Questions

<details>
<summary>Final Answers</summary>

| Question | Answer |
|----------|--------|
| Postal Code | `29760` |
| Flag | `THM{Yves-Marie_Gourlaouen_15}` |

</details>

---
