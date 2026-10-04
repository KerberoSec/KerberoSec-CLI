🎥 Catch me: CTF Writeup
-
<p align="center"> <img src="https://img.shields.io/badge/Category-Forensics%20%7C%20Steganography-blue?style=for-the-badge"> <img src="https://img.shields.io/badge/Difficulty-Easy-green?style=for-the-badge"> <img src="https://img.shields.io/badge/Technique-Frame%20Analysis-orange?style=for-the-badge"> </p>

🧠 Challenge Description
-
Catch me if you can …!!

Flag format: cyros{data_of_video}

The challenge provides a video file and hints that the data is hidden inside it.

🎯 Objective
-
Analyze the video carefully and extract the hidden flag.

🛠️ Solution Approach
-
1️⃣ Observe the Video Carefully
-
After playing the video normally, nothing obvious appears at first glance.

However, the title “Catch me if you can” hints that:

The hidden content might appear very briefly.

It may require pausing or slowing down the video.

2️⃣ Pause & Frame-by-Frame Analysis
-
We:

Played the video

Paused at different timestamps

Carefully inspected frames

On pausing at specific frames, individual letters briefly appear on the screen.

3️⃣ Extract the Hidden Letters
-
The letters revealed across frames were:

D ! f f 2 c

Rearranged in order as shown in the video:

D!ff2c

🚩 Final Flag
-
cyros{D!ff2c}

🔎 Why This Worked
-
This challenge used a basic form of:

Frame-based steganography

Visual obfuscation

Human attention testing

The letters were embedded inside individual frames, visible only when:

Pausing the video

Watching in slow motion

Scrubbing through the timeline

🧩 Key Takeaways
-
Always inspect videos frame-by-frame in CTF challenges.

Hidden data can appear for milliseconds.

Use tools like:

VLC (Frame-by-frame mode using E key)

FFmpeg (extract frames)

Video timeline scrubbing

🧠 Skills Used
-
Digital Forensics

Frame Analysis

Attention to Detail

Steganography Basics

🏁 Conclusion
-
The flag was hidden in plain sight, but only visible when the video was paused at the right moment.

Sometimes, the simplest trick is the most effective one.

---
