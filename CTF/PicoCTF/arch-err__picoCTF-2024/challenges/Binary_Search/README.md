# Binary_Search
*Want to play a game? As you use more of the shell, you might be interested in how they work! Binary search is a classic algorithm used to quickly find an item in a sorted list. Can you find the flag? You'll have 1000 possibilities and only 10 guesses. Cyber security often has a huge amount of data to look through: from logs, vulnerability reports, and forensics. Practicing the fundamentals manually might help you in the future when you have to write your own tools! You can download the challenge files here:*
- `challenge.zip`
*`ssh -p 63767 ctf-player@atlas.picoctf.net` Using the password `83dcefb7`. Accept the fingerprint with `yes`, and `ls` once connected to begin. Remember, in a shell, passwords are hidden!*

## Solution
1. So, we're supposed to guess a number. Since we're told whether our guess was higher or lower that the right number we can apply the [binary-search algorithm](https://en.wikipedia.org/wiki/Binary_search) to find the number.
2. `sshpass -p 83dcefb7 ssh -p 63767 ctf-player@atlas.picoctf.net`
3. This winning round I guessed `500, 250, 125, 200, 225, 210, 215, 213`, and `213` was right.

## Flag
**Flag:** `picoCTF{g00d_gu355_ee8225d0}`
