# FOOTBALLchik

**Author:** @vvanuss

> At the end of spring, I decided to go to a football match and took this photo. Find the exact time the first goal was scored. Flag format: `grodno{MM:SS}`

## The image

We're given a photo of a football (soccer) match, taken from the stands. Nothing crazy jumps out at first: just a stadium, a scoreboard showing `0:0` and a clock reading `17:06`, some sponsor banners in Cyrillic, and a bunch of players mid-play.

<img width="2560" height="1920" alt="FOOTBALLchik" src="https://github.com/user-attachments/assets/e0d04aed-3521-4d74-91cb-b74c5c5a1543" />

## Step 1: Reverse image search

Classic OSINT move: just chuck the image into Google reverse image search. This actually paid off immediately and led me to an Instagram post:

`https://www.instagram.com/p/DZEub38AunM/?img_index=4`

Posted by [ggpek.by](https://www.instagram.com/ggpek.by/), tagging [gruppa61se](https://www.instagram.com/gruppa61se/).

The caption (in Russian):

> ⚽️ 30 мая 2026 года наши ребята побывали в ГУ «Центральный спортивный комплекс «Неман» на футбольном матче между командами «Неман: МЛ Витебск». Мы поддерживали и болели всей душой за свою команду Неман-Гродно! 💪🔥

Translated:

> ⚽️ On May 30, 2026, our guys visited the Central Sports Complex "Neman" at the football match between the teams "Neman-ML Vitebsk". We supported and cheered wholeheartedly for our team Neman-Grodno! 💪🔥

Nice: that's basically the whole context handed to us on a plate:

- **Date:** May 30, 2026
- **Teams:** Neman-Grodno vs Neman-ML Vitebsk
- **Venue:** Central Sports Complex "Neman"

This also lines up with the flag prefix `grodno{...}`: makes sense now.

## Step 2: Finding the goal time

With the match identified, the next step was just to find _when_ the first goal went in.

I checked a few sites that list match stats/timelines for this game, but none of them gave a precise MM:SS: just vague "first half" type info, or nothing at all.

So I went looking for actual match footage instead, and found a YouTube upload of the game:

`https://youtu.be/5YP6OUcQJVw?t=141`

Scrubbing through the video, you can pinpoint the exact in-game clock moment the ball crosses the line for the first goal. That timestamp is the answer.

## Flag

```
grodno{36:27}
```

## TL;DR

1. Reverse image search → Instagram post → date + teams + venue.
2. Google/searching match stats sites → not precise enough.
3. Found full match video on YouTube → scrubbed to the first goal → read the clock.
4. Flag: `grodno{36:27}`
