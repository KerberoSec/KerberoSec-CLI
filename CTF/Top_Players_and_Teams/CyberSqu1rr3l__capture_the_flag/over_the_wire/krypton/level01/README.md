```
 _   _                   _                _                 __  _ 
| \ | |_____   _____    | |   __ _  ___ _| | __ _ _   _ __ _\ \| |
| | | / _ \ \ / / _ \   | |  / _` |/ _ \__ |/ _` | | | |__` |\ ` |
| | | \__  \ V /\__  |__| | | | | | (_) || | (_| | |_| |  | |/ . |
|_| |_|___/ \_/ |___/_____| |_| |_|\___/__/ \__, | .__/   |_/_/|_|
                                               |_|\___|           
```
The password for level 2 is in the file *krypton2*. It is encrypted using a simple
rotation. It is also in non-standard ciphertext format. When using alpha characters for
cipher text it is normal to group the letters into five letter clusters, regardless of
word boundaries. This helps obfuscate any patterns. This file has kept the plain text
word boundaries and carried them to the cipher text. [^1]

Solution
----------------------------------------------------------------------------------------
Since the task description already tells us, the ciphertext is located in the
`/krypton/` directory, we move there and discover a folder for every level. In
`/krypton/krypton1` we discover a *README* and *krypton2* file. In here, we can find
the same information on how to solve this level, as in the description text. Since, we
are already familiar with the mechanics of *simple rotation ciphers*, such as ROT13 [^2]
we proceed to use direct decryption using the `rot13` or `caesar` tools on our host
machine. On the krypton server, we can alternatively use 
`tr 'A-Za-z' 'N-ZA-Mn-za-m' <<< $(cat krypton2)`.

[^1]: https://overthewire.org/wargames/krypton/krypton1.html
[^2]: https://en.wikipedia.org/wiki/ROT13
