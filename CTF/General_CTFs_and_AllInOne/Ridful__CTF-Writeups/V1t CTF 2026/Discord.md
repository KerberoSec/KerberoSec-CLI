## Challenge Writeup: Discord Announcement Emoji Cipher

The challenge clue was hidden in the **#announcements** channel description. Instead of plain text, it consisted of number emojis:

```
7️⃣6️⃣ 3️⃣1️⃣ 7️⃣4️⃣ 7️⃣🇧 6️⃣4️⃣ 7️⃣5️⃣ 6️⃣3️⃣ 6️⃣🇧 6️⃣3️⃣ 3️⃣0️⃣ 7️⃣2️⃣ 6️⃣4️⃣ 7️⃣🇩
```

The numbers resemble **hexadecimal** values. Replacing the emoji digits with their hexadecimal equivalents gives:

```
76 31 74 7B 64 75 63 6B 63 30 72 64 7D
```

Converting each hex byte to its ASCII character results in:

```
76 -> v31 -> 174 -> t7B -> {64 -> d75 -> u63 -> c6B -> k63 -> c30 -> 072 -> r64 -> d7D -> }
```

This decodes to the flag:

```
v1t{duckc0rd}
```

**Flag:** `v1t{duckc0rd}`
