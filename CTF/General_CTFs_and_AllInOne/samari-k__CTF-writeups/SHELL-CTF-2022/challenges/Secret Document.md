# Secret Document

Category: Forensics

> "shell is the key if you did'nt get it xorry"

---

We got a file `Secret-Document.dat` which was not really readable.

After ome brainstorming I just realized what the hint in the challenge description meant. I needed to xor the file with the key "shell". I came across this cool tool: https://github.com/hellman/xortool and used it to retrieve the original file which appeared to be a png image containing the flag.

