# Sliced and Diced

**Category:** Misc **Author:** yoshie878 

> "My questionable QR code got thrown through a rift. Unslice and undice to find the flag on the other side!"

We're handed one file: `sliced-and-diced.png`. Pretty much what it says on the tin: a QR code that's been chopped into triangular wedges, scattered, and rotated all over the canvas, with `bronco{...}` text just kind of sitting on top of it for flavor (and maybe as a taunt, since the flag obviously isn't going to be that easy).

<img width="774" height="433" alt="image" src="https://github.com/user-attachments/assets/7bad28b6-dad6-4091-9a15-bd46a6094714" />

## Step 1: Unslice, undice

No fancy tooling needed here, just patience and GIMP:

1. Load `sliced-and-diced.png` into GIMP.
2. Cut out each triangular/quad piece of the QR code and drop it onto its own layer.
3. Slide each piece back into place, using the QR code's finder patterns (the three big squares in the corners) as anchor points to figure out orientation and alignment.

<img width="297" height="287" alt="image" src="https://github.com/user-attachments/assets/050b25bf-bea5-4bab-8521-b729a792939f" />

After enough shuffling, the pieces click together into a clean, scannable QR code.

<img width="1182" height="659" alt="image" src="https://github.com/user-attachments/assets/805b24af-9d5e-400f-a399-f4d30572f91d" />

## Step 2: Scan it

Scanning the reassembled QR code doesn't drop a flag directly: instead it hands over a URL:

```
https://www.canva.com/design/DAHCqL0Sd-E/WowFDvU8s09qQU8FkVpntw/view?...
```

So the "flag on the other side" of the rift is a Canva design. Classic redirection.

## Step 3: Find the _actually_ hidden text

Opening the link shows a non-shattered version of what we just assembled. But the challenge title is a hint: there's more diced-up content hiding _behind_ what's visible.

<img width="1080" height="572" alt="image" src="https://github.com/user-attachments/assets/8a33c67f-fe6d-49b3-bd07-498bbdb89240" />

The move: select everything on the canvas and copy it out.

- `Ctrl+A` to select all elements on the design
- `Ctrl+C` to copy

Pasting that selection reveals text that was tucked away behind/under the QR code graphic: invisible when just looking at the rendered page, but very much there in the underlying design data.

That text turns out to be the flag:

```
bronco{th3_h1dd3n_cu3}
```

## TL;DR

1. Reassemble the sliced QR code in GIMP (finder patterns = your alignment guide).
2. Scan it → get a Canva link.
3. Select-all + copy on the Canva canvas to pull out text hidden behind the visible design.
4. Flag: `bronco{th3_h1dd3n_cu3}`
