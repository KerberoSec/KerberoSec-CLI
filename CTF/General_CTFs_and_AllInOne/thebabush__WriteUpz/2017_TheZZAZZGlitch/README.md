# TheZZAZZGlitch's April Fools 2017

This is not really a CTF, but a GameBoy/Pokemon reversing challenge/game
(too many slashes here).
It involved loading up a custom-made savefile that, upon starting the game,
would leave you with this:

*[Image: Screenshot]*

I was planning to do a writeup for this, but turns out
[@slipstream already did an excellent one](https://gist.github.com/Wack0/1a84651e7e7e0c6f7d5fb5888e361123).

## Solution / KeyGen

After finishing the game manually, I reversed the whole key generation
algorithm and turned it into a handy python script.
If you run it you get maximum score immediately :)

To help myself in the reversing, I implemented a simple script to encode/decode
the custom string format that is used by Pokemon Blue/Red.
It doesn't support the full character set, but it works with "normal" ASCII
characters:

```bash
$ ./gb_encoder.py encode zzazz
B9 B9 A0 B9 B9

$ ./gb_encoder.py decode "B9 B9 A0 B9 B9"
zzazz
```

## Savefile reversing

This guy named [NieDzejkob](https://pastebin.com/ykXv6ajC) actually reversed the
savefile and made a script to reconstruct it.

## Conclusion

Thanks to
[TheZZAZZGlitch](https://www.youtube.com/channel/UCKlA7qF9XKwu79ULYmVu28w)
 for making this fun game/savefile.
This guy is crazy :D (you should follow him on YouTube).

And since slipstream mentioned Mastodon, [I will
too](https://mastodon.social/@kenoph).
Look at my awesome empty profile.

