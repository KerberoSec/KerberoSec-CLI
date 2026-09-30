```
___________                       .___.__                            ____ ___ ____ ___ 
\_   _____/ ____   ____  ____   __| _/|__| ____    ____             |    |   \    |   \
 |    __)_ /    \_/ ___\/  _ \ / __ | |  |/    \  / ___\    ______  |    |   /    |   /
 |        \   |  \  \__(  <_> ) /_/ | |  |   |  \/ /_/  >  /_____/  |    |  /|    |  / 
/_______  /___|  /\___  >____/\____ | |__|___|  /\___  /            |______/ |______/  
        \/     \/     \/           \/         \//_____/
```
Get the validation password from the challenge file `ch1.txt`. [^1]

Solution
-----------------------------------------------------------------------------------------
Having downloaded the encodings format documentation, we find out that this file is
encoded using a form of binary-to-text Unix-to-Unix copy. The header starts in the form
of *begin* followed by the *mode*, the file permissions, and the *filename* to be used
when recreating the binary data. After that follows the length of characters, formatted
characters and a newline character. [^2]
```
begin mode filename
. . . encoded data . . .
“empty” line
end
```
In order, to decode the file `ch1.txt` we can now use online conversion tools, such as
*UUDecode* [^3] or the decode algorithm *uudecode* [^4]. Alternatively, we can also use
the command `uudecode` which can be installed with `apt install sharutils`. Applying the
command `uudecode ch1.txt` on our file, results in the file `root-me_challenge_uudeview`
with the contents: *Very simple ;) PASS = ULTRASIMPLE*

[^1]: https://www.root-me.org/en/Challenges/Cryptanalysis/Encoding-UU
[^2]: https://en.wikipedia.org/wiki/Uuencoding
[^3]: https://www.dcode.fr/uu-encoding
[^4]: https://decode.urih.com/
