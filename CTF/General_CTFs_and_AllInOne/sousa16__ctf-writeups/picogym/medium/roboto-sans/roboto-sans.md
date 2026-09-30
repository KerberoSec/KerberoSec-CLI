## Roboto Sans

[Link to challenge](play.picoctf.org/practice/challenge/291)

Write-up:

1. The name indicates `robots.txt`. That shows us:

    ```
    User-agent *
    Disallow: /cgi-bin/
    Think you have seen your flag or want to keep looking.

    ZmxhZzEudHh0;anMvbXlmaW
    anMvbXlmaWxlLnR4dA==
    svssshjweuiwl;oiho.bsvdaslejg
    Disallow: /wp-admin/
    ```

2. B64 decoding gets us: `flag1.txt` and `js/myfile.txt`, while the rest is gibberish.

3. Flag is in `js/myfile.txt`: picoCTF{Who_D03sN7_L1k5_90B0T5_22ce1f22}