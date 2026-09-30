# Bandit Level 11

In this level the password is stored in the file `data.txt` where all lowercase and uppercase letters have been rotated by 13 positions.

To decode the ceaser cipher we need to use the command `tr`. This is a command that can translate characters in strings.
> `tr <original_pattern> <new_pattern>`

We need to shift both uppercase and lowercase characters. Our original characters are `A-Za-z`, because we have both uppercase and lowercase letters. Shift by 13 gives us the pattern `N-ZA-Mn-za-m`. So `A` maps to `N`, `B` to `O` etc.
> `cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'`

This command reveals the password: `JVNBBFSmZwKKOP0XbFXOoW8chDz5yVRv`
