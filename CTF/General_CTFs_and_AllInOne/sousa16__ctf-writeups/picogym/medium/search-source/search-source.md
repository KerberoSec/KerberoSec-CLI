## Search Source

[Link to challenge](https://play.picoctf.org/practice/challenge/295?)

Write-up:

1. Taking a hint from the title, we're probably supposed to search the source code of the website for the flag.

2. After doing an initial search and not finding anything, I decided to download the full website and just search for the flag in the whole source code.
`wget -r -l 5 -k -p -N http://saturn.picoctf.net:54229/`

3. Searching for "pico" finds us the flag in style.css: **picoCTF{1nsp3ti0n_0f_w3bpag3s_8de925a7}**