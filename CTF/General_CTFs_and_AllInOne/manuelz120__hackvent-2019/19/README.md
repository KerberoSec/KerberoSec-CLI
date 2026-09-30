## HV19.19 🎅

```
🏁🍇🎶🔤🐇🦁🍟🗞🍰📘🥖🖼🚩🥩😵⛺❗️🥐😀🍉🥞🏁👉️🧀🍎🍪🚀🙋🏔🍊😛🐔🚇🔷🎶📄🍦📩🍋💩⁉️🍄🥜🦖💣🎄🥨📺🥯📽🍖🐠📘👄🍔🍕🐖🌭🍷🦑🍴⛪🤧🌟🔓🔥🎁🧦🤬🚲🔔🕯🥶❤️💎📯🎙🎚🎛📻📱🔋😈🔌💻🐬🖨🖱🖲💾💿🧮🎥🎞🔎💡🔦🏮📔📖🏙😁💤👻🛴📙📚🥓📓🛩📜📰😂🍇🚕🔖🏷💰⛴💴💸🚁🥶💳😎🖍🚎🥳📝📁🗂🥴📅📇📈📉📊🔒⛄🌰🕷⏳📗🔨🛠🧲🐧🚑🧪🐋🧬🔬🔭📡🤪🚒💉💊🛏🛋🚽🚿🧴🧷🍩🧹🧺😺🧻🚚🧯😇🚬🗜👽🔗🧰🎿🛷🥌🎯🎱🎮🎰🎲🏎🥵🧩🎭🎨🧵🧶🎼🎤🥁🎬🏹🎓🍾💐🍞🔪💥🐉🚛🦕🔐🍗🤠🐳🧫🐟🖥🐡🌼🤢🌷🌍🌈✨🎍🌖🤯🐝🦠🦋🤮🌋🏥🏭🗽⛲💯🌁🌃🚌📕🚜🛁🛵🚦🚧⛵🛳💺🚠🛰🎆🤕💀🤓🤡👺🤖👌👎🧠👀😴🖤🔤 ❗️➡️ ㉓ 🆕🍯🐚🔢🍆🐸❗️➡️ 🖍🆕㊷ 🔂 ⌘ 🆕⏩⏩ 🐔🍨🍆❗️ 🐔㉓❗️❗️ 🍇 ⌘ ➡️🐽 ㊷ 🐽 ㉓ ⌘❗️❗️🍉 🎶🔤🍴🎙🦖📺🍉📘🍖📜🔔🌟🦑❤️💩🔋❤️🔔🍉📩🎞🏮🌟💾⛪📺🥯🥳🔤 ❗️➡️ 🅜 🎶🔤💐🐡🧰🎲🤓🚚🧩🤡🔤 ❗️➡️ 🅼 😀 🔤 🔒 ➡️ 🎅🏻⁉️ ➡️ 🎄🚩 🔤❗️📇🔪 🆕 🔡 👂🏼❗️🐔🍨🍆❗️🐔🍨👎🍆❗️❗️❗️ ➡️ 🄼 ↪️🐔🄼❗️🙌 🐔🍨🍆❗️🍇🤯🐇💻🔤👎🔤❗️🍉 ☣️🍇🆕🧠🆕🐔🅜❗️❗️➡️ ✓🔂 ⌘ 🆕⏩⏩🐔🍨🍆❗️🐔🅜❗️❗️🍇🐽 ㊷ 🐽 🅜 ⌘❗️❗️ ➡️ ⌃🐽 🄼 ⌘ 🚮🐔🄼❗️❗️➡️ ^💧🍺⌃➖🐔㉓❗️➗🐔🍨👎👍🍆❗️❗️❌^❌💧⌘❗️➡️ ⎈ ↪️ ⌘ ◀ 🐔🅼❗️🤝❎🍺🐽 ㊷ 🐽 🅼 ⌘❗️❗️➖ 🤜🤜 🐔🅜❗️➕🐔🅜❗️➖🐔🄼❗️➖🐔🅼❗️➕🐔🍨👍🍆❗️🤛✖🐔🍨👎👎👎🍆❗️🤛 🙌 🔢⎈❗️❗️🍇 🤯🐇💻🔤👎🔤❗️🍉✍✓ ⎈ ⌘ 🐔🍨👎🍆❗️❗️🍉🔡🆕📇🧠✓ 🐔🅜❗️❗️❗️➡️ ⌘↪️⌘ 🙌 🤷‍♀️🍇🤯🐇💻🔤👎🔤❗️🍉😀🍺⌘❗️🍉 🍉
```

### Solution

For this challenge, we get an obscure sequence of emojis, without any further description. After a while, I discovered the emoji-based programming language [emojicode](https://github.com/emojicode/emojicode). Our emoji sequence contains the exact starting sequence of an emojicode program (🏁🍇), so I decided to give it a try. Unfortunately, the repo does not offer any simple conversion tools (e.g. emojicode to JS), so I have to dig deeper. After cloning the github repo, I was able to compile an [executable](./ch19) from our "source code". When executing this file, I got the following prompt:

``` 🔒 ➡️ 🎅🏻⁉️ ➡️ 🎄🚩```

Entering a random word (e.g. `flag`) results in the following output: `🤯 Program panicked: 👎`. Probably, we need to enter the correct password so the program prints the flag. When taking a closer look at the prompt, I got the feeling that this password could just be a single emoji. As the number of available emojis is still quite limited, I decided to perform a brute force attack and downloaded a [list of allowed unicode emojis](./emojis.json) from a website and created a small script using pwntools:

```python
#!/usr/bin/python
# coding=utf-8
from pwn import *
import json

with open ('emojis.json') as json_file:
    emojis = json.load(json_file)

    for emoji in emojis:
        p = process('./ch19')
        print(p.recvuntil('🔒 ➡️ 🎅🏻⁉️ ➡️ 🎄🚩 '))
        p.sendline(emoji.encode('utf-8'))
        output = p.readall()
        
        if not "👎" in output:
            print("Done: " + emoji)
            print(output)
            break
    
```

After a while, the script printed out the flag. The solution (🔑) was quite obvious. 😜

```
 🔒 ➡️ 🎅🏻⁉️ ➡️ 🎄🚩
[+] Receiving all data: Done (28B)
[*] Process './ch19' stopped with exit code 0 (pid 13015)
Done: 🔑

HV19{*<|:-)____\o/____;-D}
```

**Flag:** HV19{*<|:-)____\o/____;-D}