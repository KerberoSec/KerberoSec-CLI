#### Description

People keep trying to trick my players with imitation flags. I want to make sure they get the real thing! I'm going to provide the SHA-256 hash and a decrypt script to help you know that my flags are legitimate. `ssh -p 60542 ctf-player@rhea.picoctf.net` Using the password `1ad5be0d`. Accept the fingerprint with `yes`, and `ls` once connected to begin. Remember, in a shell, passwords are hidden!

- Checksum: 5848768e56185707f76c1d74f34f4e03fb0573ecc1ca7b11238007226654bcda
- To decrypt the file once you've verified the hash, run `./decrypt.sh files/<file>`.

```bash
sha256sum files/* | grep "5848768e56185707f76c1d74f34f4e03fb0573ecc1ca7b11238007226654bcda"
```

![[Pasted image 20241130132155.png]]

```flag
picoCTF{trust_but_verify_8eee7195}
```