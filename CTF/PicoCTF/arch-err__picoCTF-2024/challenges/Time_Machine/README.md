# Time_Machine
*What was I last working on? I remember writing a note to help me remember... You can download the challenge files here:*
- `challenge.zip`

## Solution
1. The chall is called time machine and we're given a git repo. We're just supposed to "wind back time" (check out an older commit) and get the flag. We could just use this classical oneliner though:
2. `git grep -n "picoCTF{" $(git rev-list --all)`
3. Uh, wait, no... I was completely wrong, the flag was just in the commit name... `git log --oneline | grep -Po "picoCTF{.*}"`

## Flag
**Flag:** `picoCTF{t1m3m@ch1n3_d3161c0f}`
