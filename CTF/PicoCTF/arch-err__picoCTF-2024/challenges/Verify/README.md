# Verify
*People keep trying to trick my players with imitation flags. I want to make sure they get the real thing! I'm going to provide the SHA-256 hash and a decrypt script to help you know that my flags are legitimate.*

`ssh -p 52256 ctf-player@rhea.picoctf.net`

Using the password `1db87a14`. Accept the fingerprint with `yes`, and `ls` once connected to begin. Remember, in a shell, passwords are hidden!

- Checksum: 55b983afdd9d10718f1db3983459efc5cc3f5a66841e2651041e25dec3efd46a
- To decrypt the file once you've verified the hash, run `./decrypt.sh files/<file>`.

## Solution
1. Follow the instructions given
2. `for i in *; do sha256sum $i | grep "55b983";done`
3. `./decrypt.sh files/2cdcb2de`

## Flag
**Flag:** `picoCTF{trust_but_verify_2cdcb2de}`
