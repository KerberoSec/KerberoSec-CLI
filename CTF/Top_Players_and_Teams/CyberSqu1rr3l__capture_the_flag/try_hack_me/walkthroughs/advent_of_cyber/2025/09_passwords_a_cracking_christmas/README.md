```
▛▀▖                     ▌        ▞▀▖ ▞▀▖         ▌  ▗        ▞▀▖▌     ▗    ▐            
▙▄▘▝▀▖▞▀▘▞▀▘▌  ▌▞▀▖▙▀▖▞▀▌▞▀▘ ▄▄▖ ▙▄▌ ▌  ▙▀▖▝▀▖▞▀▖▌▗▘▄ ▛▀▖▞▀▌ ▌  ▛▀▖▙▀▖▄ ▞▀▘▜▀ ▛▚▀▖▝▀▖▞▀▘
▌  ▞▀▌▝▀▖▝▀▖▐▐▐ ▌ ▌▌  ▌ ▌▝▀▖     ▌ ▌ ▌ ▖▌  ▞▀▌▌ ▖▛▚ ▐ ▌ ▌▚▄▌ ▌ ▖▌ ▌▌  ▐ ▝▀▖▐ ▖▌▐ ▌▞▀▌▝▀▖
▘  ▝▀▘▀▀ ▀▀  ▘▘ ▝▀ ▘  ▝▀▘▀▀      ▘ ▘ ▝▀ ▘  ▝▀▘▝▀ ▘ ▘▀▘▘ ▘▗▄▘ ▝▀ ▘ ▘▘  ▀▘▀▀  ▀ ▘▝ ▘▝▀▘▀▀
```
In this THM room from the Advent of Cyber 2025 event, we learn how to crack
password-based encrypted files. [^1]

What is the flag inside the encrypted PDF?
-----------------------------------------------------------------------------------------
Both the `flag.pdf` and `flag.zip` files are located on the desktop. Just to make sure
the file types actually match with the real ones, we can use the `file` command. Next, we
choose to pick one of the following tools based on the file type:

- PDF document: pdfcrack, john (via pdf2john)
- ZIP archive: fcrackzip, john (via zip2john)
- General: john (very flexible) and hashcat (GPU acceleration, more advanced)

For the first flag, we have a PDF document, so we can use the `pdfcrack` command and the
common wordlist `rockyou.txt`: `pdfcrack -f flag.pdf -w /usr/share/wordlists/rockyou.txt`
This tool already yields the found user password *naughtylist* which we can then use to
`open` the file in the PDF viewer of our choice.

What is the flag inside the encrypted zip file?
-----------------------------------------------------------------------------------------
For the ZIP archive, we choose to use `john` and therefore first create a hash for John
to work with: `zip2john flag.zip > ziphash.txt` Now, we can apply `john` on this hash:
`john -w=/usr/share/wordlists/rockyou.txt ziphash.txt`
This dictionary attack rewards us with the password *winter4ever* which we then use to
`unzip` the archive and read the flag in the text file.

Have a look around the VM to get access to the key for Side Quest 2.
-----------------------------------------------------------------------------------------
At first we are unsure as to whether we are interested in detecting suspicious GPU events
with `nvidia-smi` or if we want to decrypt another encrypted password file. But then, we
discover the hidden `.Passwords.kdbx` file in the home directory, which is a *Keepass
password database 2.x KDBX*. Therefore, it is our objective to crack this password, in an
attempted dictionary attack. Upon research [^4], we find out that we want to use the
`keepass2john` command to first extract the hash for `john` to work with. Note, that
instead of downloading it, e.g. with
`git clone https://github.com/ivanmrsulja/keepass2john.git` [^3], we should use the
desktop binary (no network connection): `~/Desktop/john/run/keepass2john.Passwords.kdbx >
keepass_hash.txt`

With this hashed text file, we can now operate `john` using the common `rockyou.txt`
wordlist that we already used before: 
`john --format=keepass --wordlist=/usr/share/wordlists/rockyou.txt keepass_hash.txt`
And indeed, after a while, we are given the cracked password *harrypotter* which helps us
unlock the Keepass database in the KeepassXC application. This database contains exactly
one key in root with a `sq2.png` attachment that contains the flag for the second side
quest. [^2]

[^1]: https://tryhackme.com/room/attacks-on-ecrypted-files-aoc2025-asdfghj123
[^2]: https://tryhackme.com/room/sq2-aoc2025-JxiOKUSD9R
[^3]: https://github.com/ivanmrsulja/keepass2john
[^4]: https://thinglab.org/2025/02/cracking_keepass/
