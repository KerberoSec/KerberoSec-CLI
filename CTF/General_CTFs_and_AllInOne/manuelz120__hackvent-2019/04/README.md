## HV19.04 password policy circumvention

Santa released a new password policy (more than 40 characters, upper, lower, digit, special).

The elves can't remember such long passwords, so they found a way to continue to use their old (bad) password:

```
merry christmas geeks
```

`HV19-PPC.zip`

### Solution 

The zip file contains an *.ahk file. A quick google search reveals, that this file-extension is widely used for [AutoHotkey](https://www.autohotkey.com/), which offers a simple Hotkey-based scripting language for Windows. If we take a look at the code, we see that the phrases of the additional sentence in the challenge description is defined as hotkeys. Therefore, I quickly installed the software, loaded the script and typed these words into a text editor. AutoHotkey applied the logic from the script, and the sentence transformed into the flag (the password that matches the policy).

**Flag:** HV19{R3memb3r, rem3mber: the 24th 0f December}

