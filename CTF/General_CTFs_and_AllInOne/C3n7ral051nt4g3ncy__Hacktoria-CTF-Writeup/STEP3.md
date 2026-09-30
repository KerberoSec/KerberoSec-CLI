# STEP 3

**Instructions:** Excellent work on finding the locations, the state of the victims matches the killers MO exactly. In a twist of fate, or by the hands of the killer, we’ve received an anonymous tip regarding a video that surfaced. It’s on a completely new YouTube channel, no other content posted, we believe the account to be a sock puppet.

We need you to find out the meaning of the video on this channel. Does this get us anywhere?

https://www.youtube.com/channel/UCyOofwsh3r5FlC3tr1mJQoA

# Methodology

Went to the video and analyzed the YouTube account of the killer, searched in the "About" section, looked for the flag in the video tags, comments, subtitles/audio transcription.<br>

<img width="1544"  src="https://user-images.githubusercontent.com/104733166/170824814-98a133ce-6d65-4213-a39f-e24c631ab33c.png">

I then used Youtube-dl to download the file directly. **Youtube-dl is fast and efficient!**

<img width="633" height="133" src="https://user-images.githubusercontent.com/104733166/170825077-a29be046-6614-4012-8ed2-5785c9aff074.png">

No information was found in the file metadata, so I decided to isolate the audio from the video.

```
$ youtube-dl --extract-audio --audio-format "mp3" https://youtu.be/yTHhV_tEOYY
```
Opened the Audio File with Audacity, chose "multiview". Flag was found. <br>

<img width="1964" src="https://user-images.githubusercontent.com/104733166/170825701-bd2bc413-1912-4824-bf6e-ab94264e9f0a.png">

---
### Flag
```
{theyarehereamongus.blogspot.com}
```
