# WhoAmI (OSINt)

**Author:** @vvanuss

#### Challenge

> While traveling through Oklahoma, I stumbled upon an interesting shop and took this selfie. Can you figure out my name?

We're given an image and told it's Oklahoma. That's basically our only starting clue, so let's roll with it.

#### Solving it

First thing I noticed in the photo: the guy's arm position is a little off for a normal selfie: looks like he's holding the camera out on a stick. That's a classic tell for a **360° photosphere shot**, which immediately made me think Google Maps / Street View instead of a regular Instagram-style selfie.

So the plan became: find the shop, find the 360° view, find whoever's credited as the photographer.

Since we already know we're looking for a shop in Oklahoma, I just searched something like:

```
antique co-op oklahoma
```

That turned up a matching location pretty quickly. Jumped into Google Maps, switched over to Street View, and poked around for any 360° photosphere pins near the shop.

Found one that lined up with the exact same angle and vibe as the challenge image: same shop, same pose, same stick-arm selfie energy.

Clicked into the photosphere details, and there it was: the uploader's name.

<img width="804" height="715" alt="image" src="https://github.com/user-attachments/assets/c61d5f09-d2ca-46d6-be7a-1bd8002f2dbd" />

**Russell Rogers**

Slapped that into the flag format and we're done:

```
grodno{Russell_Rogers}
```

#### TL;DR

Selfie stick → probably a 360 photo → find the shop on Google Maps → find the matching Street View photosphere → check who uploaded it → flag.

Nice easy OSINT one: mostly about recognizing _what kind_ of photo you're looking at before you even start searching. 🕵️
