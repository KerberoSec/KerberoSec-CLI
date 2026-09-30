# Alien Communication

Category: Forensics

> Aliens are trying to communicate something. They belive in seeing more than what they are hearing. can you help us trying to decode what they are trying to say?

---

We got a wave file called `Alien-voice.wav` which makes strange noises. At first I tried few obvious things, but neither `strings` nor `exiftool` did provide me with something useful. Also a `hexdump` did not show up with something interesting. So I decided to open the file in `Audacity` since it has a lot of possibilities to interact with soundfiles.

### Audacity

I wondered if this could be some morse code, so I started to evaluate the curve with a morse alphabet table but stumbled over `.-...` which is not an actual morse sign. It had to be something else. 

I did some research on stegaography in wav files and found this forum post talking about the **spectogram**: https://forum.audacityteam.org/viewtopic.php?t=102157. So I opened the spectogram view for the soundfile et voilá: it revealed the flag.

