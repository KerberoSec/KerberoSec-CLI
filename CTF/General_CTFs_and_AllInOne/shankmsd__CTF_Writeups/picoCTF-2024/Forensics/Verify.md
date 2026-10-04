## Challenge 🧩

People keep trying to trick my players with imitation flags. I want to make sure they get the real thing! I'm going to provide the SHA-256 hash and a decrypt script to help you know that my flags are legitimate.

Author: JEFFERY JOHN</br>
Points: 50

Hints:

1. Checksums let you tell if a file is complete and from the original distributor. If the hash doesn't match, it's a different file.
2. You can create a SHA checksum of a file with sha256sum <file> or all files in a directory with sha256sum <directory>/*.
3. Remember you can pipe the output of one command to another with |. Try practicing with the 'First Grep' challenge if you're stuck!

## Solution 🕵️‍♂️

Exporting file hashes using powershell

```powershell
PS> Get-ChildItem | Get-FileHash | Export-CSV -Path "verify_hash.txt"
```

Compare the hash with given SHA-256 hash to find the file name associated with that hash,
then ssh into the instance to decrypt and get the flag.

```powershell
PS> ssh -p XXXXX ctf-player@rhea.picoctf.net
ctf-player@rhea.picoctf.net's password:
ctf-player@pico-chall$ ./decrypt.sh files/xxxxxxxx
picoCTF{trust_but_verify_xxxxxxxx}
```

## Flag 🚩

`picoCTF{trust_but_verify_xxxxxxxx}`
