# Solve

Each line in `hashes.txt` is an MD5 hash of one character from the flag. The trick is that each character was hashed together with its position (0-based index) in the flag.

So for position `i`, the hash is `MD5(str(i) + char)`.

To solve it, loop through each hash, try every printable character prepended with the current index, and check if the MD5 matches. The matching characters spell out the flag.
