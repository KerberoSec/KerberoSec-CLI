# findme Writeup

After launching the instance on the second day (if you know you know) I finally got to the website, played around for a bit but didn't find anything but that search bar was really throwing me off, nice trap creator :).

Remembered there are hints so after checking it it said to check for redirects, so thats what I did, after doing the right login, if I went back 2 pages both of those pages would say the title `flag` on the tab, so I started checking every single line of HTML not realizing it was in the URL all this time!

The second page has the `id` on the URL ending with "==" which is a common element on base64 strings, so by joining the ID of the 1st with the one of the 2nd page I got this:

`cGljb0NURntwcm94aWVzX2FsbF90aGVfd2F5X2QxYzBiMTEyfQ==`

When decoded with any b64 decoder online it gave me:

`picoCTF{proxies_all_the_way_d1c0b112}`