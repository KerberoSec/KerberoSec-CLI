### Joker’s Digital Shadow
>**Category:** OSINT

**Flag example:** ```CSCUU{staff_name}```

---

### Description:

During the international takedown of Nulled. to, a prominent darknet marketplace and hacking forum, investigators uncovered fragmented clues about one of its key staff members. This individual operated under an alias, but whispers in underground circles suggest they had a passion for the Joker character and were deeply involved in digital art as their primary job.

Your mission is to track down the identity or alias of this staff member before their digital footprint vanishes.

---

### Approach: 

What is OSINT?

**OSINT** stands for Open Source Intelligence: the art of gathering and analyzing publicly available information from open sources (like websites, social media, forums, archives) to derive actionable intelligence.
In CTFs, OSINT challenges require digging into internet footprints, leaked databases, and archived content to uncover hidden clues.
Approach

I started by carefully analyzing the description: the keywords Nulled.to, Joker, and digital art instantly stood out.
A quick search on Google for “Nulled.to site” revealed that the forum had been seized by U.S. law enforcement. Historically, Nulled.to was an underground hub for:

    Trading and selling stolen databases

    Distributing hacking tools, malware, and cracked software

    Offering cybercrime-related services

Digging deeper, I explored old snapshots, leaks, and forum discussions. In one leaked database, I found references to a staff member connected to the “Joker” theme. My first instinct was to try the alias directly:

    CSCUU{jocker} → Incorrect

    CSCUU{Jocker} → Incorrect

Then I tried known Nulled.to founder names like:

    CSCUU{Lucas_Sohn} → Incorrect

    CSCUU{Lucas} → Incorrect

At this point, I revisited the description. The repeated mention of Joker and digital art seemed intentional. Combining them felt like a natural alias possibility.

I submitted:

    CSCUU{JokerArt} →  Hit!

---

### **Flag:** ```CSCUU{JokerArt}```
