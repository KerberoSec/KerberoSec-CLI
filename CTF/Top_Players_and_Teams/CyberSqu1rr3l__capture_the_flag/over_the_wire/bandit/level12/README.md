```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __ ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   /  (_  | 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `7 |/ /  
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  |_|___|
```
The password for the next level is stored in the file `data.txt`, where all lowercase 
(a-z) and uppercase (A-Z) letters have been rotated by 13 positions. [^1]

Solution
----------------------------------------------------------------------------------------
The proposed rotation by 13 positions is a simple Caesar/ROT-13 alphabetic shift. We can
apply either of these solutions.
```bash
echo 'Gur cnffjbeq vf 7k16JArUVv5LxVuJfsSVdbbtaHGlw9D4' | rot13
echo 'Gur cnffjbeq vf 7k16JArUVv5LxVuJfsSVdbbtaHGlw9D4' | caesar
tr 'A-Za-z' 'N-ZA-Mn-za-m' <<< 'Gur cnffjbeq vf 7k16JArUVv5LxVuJfsSVdbbtaHGlw9D4'
```
However, the first two don't come pre-installed on most systems and need to be installed
via `apt install bsdgames`; whereas the third alphabet shift from A to N and so on is a
reliable way to solve this basic encryption.

[^1]: https://overthewire.org/wargames/bandit/bandit12.html
