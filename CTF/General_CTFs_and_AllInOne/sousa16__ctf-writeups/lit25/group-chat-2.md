
**NOTE: This is a post-solution writeup, created after reviewing the official solution/other players’ approaches. 
It’s for learning and documentation.**

Write-up: 

1. In this challenge, the username has a char limit, so we can't use the long payload
used in the first challenge. However, we can get Flask's secret key using: <br>

    `username1: {{config ~'ss`

    `username2: '}}`

    We get `'SECRET_KEY': b'\xf1\xa8\xbe\xe6\xe2\xfdp\xcd\xd5i\x93bm\xaf\x08=\x186o5\xca\x93\xd2\x84'`

2. We can use this secret key to send our own payload and bypass the char limit. The full
script is `group-chat-2.py`

    Flag: `LITCTF{c4n7_y0u_b3l13v3_us3rn4m35_c0uld_b3_1000_ch4r5_10ng_b3f0r3??}`