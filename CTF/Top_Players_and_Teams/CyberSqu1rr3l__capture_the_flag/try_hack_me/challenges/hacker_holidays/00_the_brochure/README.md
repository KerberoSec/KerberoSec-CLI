```
░▀█▀░█░█░█▀▀░░░█▀▄░█▀▄░█▀█░█▀▀░█░█░█░█░█▀▄░█▀▀
░░█░░█▀█░█▀▀░░░█▀▄░█▀▄░█░█░█░░░█▀█░█░█░█▀▄░█▀▀
░░▀░░▀░▀░▀▀▀░░░▀▀░░▀░▀░▀▀▀░▀▀▀░▀░▀░▀▀▀░▀░▀░▀▀▀
```
The brochure's hero photo has an AI fingerprint. Follow the account that posted it, and
the trail doesn't end at the hotel; it ends at someone the hotel never mentioned. [^1]

What is the flag?
-----------------------------------------------------------------------------------------
We start by downloading the task file and `unzip` the archive. This way, we are presented
with an image file that shows the brochure of the luxury hotel. At first, we try to
locate any hidden information in the `exiftool` metadata but can not find anything
suspicious. Instead, we notice the banner on the brochure, that indicates a hidden
Instagram account. A quick query in a search engine of our choice rewards us with this
account. [^2] But, the posts in themselves do not show anything suspicious and since we
do not want to create an Instagram account just for this purpose, we use one of the free
Instagram profile analyzers online, such as PV Story [^3] to find out the one account
*thebytelotusresort* follows. This, way we find out the account of our concierge *Vera*
[^4] which submitted some interesting posts. After copying the *Base64* similar code, we
can use `base64 -d` to attempt to decrypt the string
`VEhNe1YzckBzX2FDQzB1bnRfaDRzX2IzM25fZjB1bmQhfQ==`. And indeed, this is the flag we are
looking for all along.

[^1]: https://tryhackme.com/room/hh-thebrochure-081f3e36
[^2]: https://www.instagram.com/thebytelotusresort/
[^3]: https://pvstory.com/
[^4]: https://www.instagram.com/veratheconcierge/
