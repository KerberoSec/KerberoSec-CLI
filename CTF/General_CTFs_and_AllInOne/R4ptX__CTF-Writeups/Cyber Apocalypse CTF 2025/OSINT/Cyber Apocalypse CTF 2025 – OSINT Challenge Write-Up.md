# Cyber Apocalypse CTF 2025: OSINT Challenge Write-Up

This document contains solutions for the OSINT challenges in **Cyber Apocalypse CTF 2025**, detailing how each flag was found using open-source intelligence techniques.

---

### Challenge 1: The Stone That Whispers (Difficulty: Very Easy)

In the twilight archives of Eldoria, Nyla studies an image of a mysterious monument. Her enchanted crystals glow as she traces ancient maps with rune-covered fingers. The stone atop the hill of kings calls to her, its secrets hidden in scattered records across realms. As her magical threads of knowledge connect, the true name emerges in glowing script: "The Stone of Destiny." Another mystery solved by the realm's most skilled information seeker, who knows that every artifact leaves traces for those who can read the signs.  
**HTB{Name_Object}  
Example: HTB{Pia_Pail} No special characters**

*[Image: stone thar whispers]*

#### Solution:

The challenge provided an image of a mysterious standing stone. Using **Google Image Search** and descriptive text search (e.g., "standing stone Ireland"), the monument was identified as **Lia Fáil (Stone of Destiny) on the Hill of Tara, Ireland**. Given the required flag format (`HTB{Name_Object}`), the correct flag was determined to be:  

**Flag:** `HTB{Lia_Fail}`

---

### Challenge 2: Echoes in Stone (Difficulty: Very Easy)

In the twilight archives of Eldoria, Nyla studies an image of an ancient Celtic cross. Her enchanted crystals illuminate the intricate carvings as she searches through forgotten tomes. The cross stands at a crossroads of realms and time, its weathered surface telling tales older than Eldoria itself. As her magical threads of knowledge connect across centuries, the true name of the monument emerges in glowing script before her eyes. Another mystery solved by the realm's most skilled information seeker, who knows that even stone can speak to those who know how to listen.  
**HTB{Name_High_Cross}  
Example: HTB{Kells_High_Cross} No special characters and avoid using the letter 's**

#### Solution:

We conducted an image search and cross-referenced it with known historical sites in Ireland. The cross was identified as the **Muiredach's High Cross**, located in **Monasterboice, Ireland**.

After confirming the monument's name, we followed the flag format requirements and submitted:

**Flag:** `Htb{Muiredach_High_Cross}`

---

### Challenge 3: The Mechanical Bird's Nest (Difficulty: Easy)

In the highest tower of Eldoria's archives, Nyla manipulates a crystal scrying glass, focusing on a forbidden fortress in the desert kingdoms. The Queen's agents have discovered a strange mechanical bird within the fortress walls: an unusual flying machine whose exact position could reveal strategic secrets. Nyla's fingers trace precise measurement runes across the crystal's surface as the aerial image sharpens. Her magical lattice grid overlays the vision, calculating exact distances and positions. The blue runes along her sleeves pulse rhythmically as coordinates appear in glowing script. Another hidden truth uncovered by the realm's premier information seeker, who knows that even the most distant secrets cannot hide from one who sees with magical precision.  
**The Mechanical Bird’s Nest: HTB{XX.XXX_-XXX.XXX}  
Example: HTB{48.858_-222.294} Latitude and longitude format with a dash separating the coordinates**

#### Solution:

We performed a **Google Reverse Image Search** to find visually similar locations.
The results indicated that the image closely resembled parts of **Area 51**, a highly classified U.S. military base in Nevada.
Using **Google Earth**, we manually explored the Area 51 region, comparing terrain features, structures, and runway layouts against the provided image.

By carefully matching the landmarks, we pinpointed the precise location of the airstrip depicted in the challenge.

Formatting the coordinates as required, we submitted:

**Flag:** `HTB{37.247_-115.812}`

---

### Challenge 4: The Shadowed Sigil (Difficulty: Medium)

In the central chamber of Eldoria's Arcane Archives, Nyla studies a glowing sigil captured by the royal wardens. The ethereal marking: "139.5.177.205": pulsates with malicious energy, having appeared in multiple magical breaches across the realm. Her fingers trace the sigil's unique pattern as her network of crystals begins to search through records of known dark covens and their magical signatures. The runes along her sleeves flash with recognition as connections form between seemingly unrelated incidents. Each magical attack bears the same underlying pattern, the same arcane origin. Her enchanted sight follows the magical threads backward through time and space until the name of a notorious cabal of shadow mages materializes in glowing script. Another dangerous secret revealed by Eldoria's master information seeker, who knows that even the most elusive malefactors leave traces of their magic for those skilled enough to recognize their unique signature.  
**HTB{APTNumber}  
Example: HTB{APT01} No special characters**

#### Solution:

To solve this challenge, I used a series of OSINT techniques, primarily focusing on the IP address **139.5.177.205** provided in the challenge.

For this challenge, we focused on the IP address **139.5.177.205** provided in the description. We first turned to **ipinfo.io** to gather basic information about the IP. The search returned data such as geolocation and ISP details, but it did not link the IP to any known threat actor or malicious activity, leaving us with no significant findings. We then turned to **Shodan**, a tool that searches for internet-connected devices. Similar to our results in ipinfo.io, Shodan provided no meaningful information or association with any specific threat group.

At this point, we decided to proceed with **VirusTotal**, a widely-used platform for checking whether an IP address is associated with any known malware or threat actor. After entering **139.5.177.205** into the VirusTotal search bar, we found that the IP was flagged as being associated with **APT28**, also known as **Fancy Bear**, a notorious advanced persistent threat (APT) group. APT28 is known for its involvement in high-profile cyber espionage campaigns, particularly against government, military, and political organizations.

**Flag:** `HTB{APT28}`

---

### Challenge 5: The Poisoned Scroll (Difficulty: Medium)

In her crystal-lit sanctum, Nyla examines reports of a series of magical attacks against the ruling council of Germinia, Eldoria's eastern ally. The attacks all bear the signature of the Shadow Ravens, a notorious cabal of dark mages known for their espionage across the realms. Her fingers trace connections between affected scrolls and contaminated artifacts, seeking the specific enchantment weapon deployed against the Germinian leaders. The runes along her sleeves pulse rhythmically as she sifts through intercepted messages and magical residue analyses from the attack sites. Her network of information crystals glows brighter as patterns emerge in the magical attacks: each victim touched by the same corrupting spell, though disguised under different manifestations. Finally, the name of the specific dark enchantment materializes in glowing script above her central crystal. Another dangerous threat identified by Eldoria's master information seeker, who knows that even the most sophisticated magical weapons leave distinctive traces for those who know how to read the patterns of corruption.  
**Poisoned Scroll: HTB{MalwareName}  
Example: HTB{DarkPhantom} No special characters**

#### Solution:

For this challenge, we focused on identifying the malware used in attacks against the Germinian leaders. The clue "Germinia" led us to suspect Germany, so we searched for malware associated with cyberattacks on Germany. Using Google, we found several malware names linked to attacks in Germany. After reviewing the results, we identified **Wineloader** as the correct match.

**Flag:** `HTB{Wineloader}`

---

### Challenge 6: The Hillside Haven (Difficulty: Easy)

Nyla stands before her largest crystal, hands weaving intricate patterns as she conjures an aerial view of the Western Hills district. A noble family's ancestral home must be located precisely: its entrance marked with a numerical rune that could unlock valuable diplomatic secrets. The crystalline vision floats above her palms, revealing winding roads and nestled dwellings along the hillsides. Her enchanted sight zooms closer as she traces the hidden pathways between estates. The magical markers on her map pulse brighter as she narrows her search, until finally, the numerical sigil above one particular doorway glows with confirmation. Another secret revealed by Eldoria's master information seeker, who knows that even among a thousand similar dwellings, each bears a unique magical signature for those with eyes to see.  
**HTB{Number_StreetnameRoad}  
Example: HTB{13_OakwoodRoad} No special characters**

#### Solution:

For this one, we were given a satellite image and tasked with figuring out the exact location of a house. The clues like "Western Hills district" and "Hillside Haven" pointed us towards California, so we focused there. The house number **356** was visible on the garage, which gave us a good start. After spending hours searching on Google Maps (seriously, hours!), we finally found the right spot: **356 Coventry Rd, Kensington, CA 94707**.

**Flag:** `HTB{356_CoventryRoad}`

---

