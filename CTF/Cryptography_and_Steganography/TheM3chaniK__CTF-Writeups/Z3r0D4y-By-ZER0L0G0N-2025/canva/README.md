Gotcha 😎: here’s your same structure and steps, just polished for readability, grammar, and humor: still keeping your hacker tone intact 👇

---

# 🧩 Challenge: Canva

**Category:** Forensics
**Points:** 150

---

### 🔖 **Challenge Description**

> Here is the poster design of ZeroDay CTF 2025
>
> [Design Link](https://www.canva.com/design/DAG26hLPcz0/hTQmsI-J2oik7ycRMhuqcA/edit?utm_content=DAG26hLPcz0&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)
>
> soo many elements, so many texts!!!

---

### 🧭 **Initial Observations**

Hmm… a fancy event poster? That screams “there’s something hidden here.”
Time to zoom in like a detective on too much caffeine ☕👀

---

### 🛠 **Environment & Tools**

* OS: I use Arch Btw (obviously 😎)
* Tools: Firefox DevTools
* Assumptions: Somewhere deep in those Canva layers, a flag is hiding and giggling.

---

### 🔬 **Static Forensic Triage**

I downloaded the poster image from Canva and tried the usual tricks:
zoomed in, checked grayscale, poked the metadata, flipped it, rotated it: nothing. Just a beautiful poster mocking me.

Then I peeked at the CTF Discord hints: the creator said something about “seeing the design layers,” but we only had **viewer** permissions. No edit access. Great.

At that point, I was half-asleep and half-annoyed, so I took a nap 😴

When I woke up, pure chaotic energy hit me. I opened **Inspect Element** in the browser, deleted a random div… and BOOM 💥: a new piece of the design became visible underneath.

So I went full hacker-goblin mode: deleting layers one by one like peeling an onion of secrets 🧅.

And there it was:
`ZERO{H1DD3N_1N_L4Y3RS}`: chilling behind one of the hidden elements A.K.A layer.
Moral of the story? When in doubt, delete stuff.

---

### ⚙️ **Artifact Recovery & Decoding Steps**

* Open the Canva link in Firefox (viewer mode is fine).
* Right-click → Inspect Element.
* Start removing div layers one by one from the DOM until hidden text appears.
* Flag revealed behind a sneaky overlay layer.

---

### 🔁 **Recovered Artifacts / Outputs**

* The revealed hidden layer with the flag text.
* A newfound appreciation for Inspect Element.

---

### ✅ **Validation**

* Even with **viewer-only** permissions, DOM inspection still reveals hidden layers.
* The text `ZERO{H1DD3N_1N_L4Y3RS}` appeared directly within the Canva HTML source.
* Classic flag format confirmed.

---

🏁 **Flag**

```
ZERO{H1DD3N_1N_L4Y3RS}
```

---

### 💡 **Takeaways**

* Canva is basically Photoshop for people who hide CTF flags in plain sight.
* If you can’t edit it: Inspect it.
* The “Delete” key sometimes reveals more truth than “Ctrl+F”.
* Always question your layers: in Canva *and in life.*
* Nap-driven inspiration is real.

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**

