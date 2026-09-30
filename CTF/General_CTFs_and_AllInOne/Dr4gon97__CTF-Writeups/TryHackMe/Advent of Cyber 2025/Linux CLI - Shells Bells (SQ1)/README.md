# Advent of Cyber 2025: "Linux CLI: Shells Bells" (SQ1 path)

**Category:** Linux / CTF

**Difficulty:** Intermediate (Side Quest path)

**Platform:** TryHackMe

**Room:** [Linux CLI: Shells Bells](https://tryhackme.com/room/linuxcli-aoc2025-o1fpqkvxti)

---

## Introduction

The "Advent of Cyber 2025" event started off with a beginner-friendly room focused on Linux command line basics. However, hiding in plain sight within the room description was a trail for those willing to dig deeper:

> "_For those who consider themselves intermediate and want another challenge, check McSkidy's hidden note in /home/mcskidy/Documents/ to get access to the key for Side Quest 1!_"

While the main task is quite straightforward, I decided to follow this hidden challenge. This writeup documents the journey down the "rabbit hole"" to unlock the Side Quest Key.

## Phase 1: Connection & Log Analysis

I began by connecting to the target machine via SSH using the provided credentials.

```bash
ssh mcskidy@Target-IP
```

**Tip:** Connecting via terminal is standard, but to get a better "feel" for the machine, I also used **FileZilla** with SFTP. Visualizing the directory tree helps spot the odd-one-out file much faster than spamming `ls` in every folder and allowed me to download files quickly if needed.

My first step in enumeration was checking the user's history to understand recent activity. Viewing .bash_history revealed that the user had recently interacted with a hidden file named .guide.txt inside a Guides directory.

```bash
cat .bash_history
```
```
nano README.txt
cd Guides/
nano .guide.txt
cat .guide.txt 
su eddi_knapp
cat /var/log/auth.log 
su eddi_knapp
```

Following this trail, I located and read the file `/var/log/auth.log` and I checked for relevant entries related to McSkidy

```bash
grep "mcskidy" /var/log/auth.log
```

Using `grep` to cut through the noise, I noticed `mcskidy` had been interacting with `websockify` and `tigervncserver` on localhost:5901. This was probably just an internal service for the VM so I left there, to eventually analyze later if I ran out of ideas. Nothing too useful so far.

The first interesting thing I found exploring the file system was `Documents/read-me-please.txt`. It contained a message from McSkidy with a new set of credentials for the user `eddi_knapp`, the same one we found before in `.bash_history`, and three riddles or _"easter eggs"_ that pointed to scattered "Passfrags" (password fragments).

*[Image: read-me-please.txt]*

There wasn't much else to do or find as `mcskidy` so I switched user to `eddi_knapp`:

```bash
su eddi_knapp
# Password: S0mething1Sc0ming
```

---

## Phase 2: The Hunt for Fragments

Now operating as Eddi, I had to decipher the riddles to find the combination for the vault.

### Fragment 1: The Shell

**Riddle:** *"I ride with your session, not with your chest of files. Open the little bag your shell carries when you arrive."*

The reference to _the little bag the shell carries_ should've rung a bell about checking environment variables and configuration files to my mind but I was _too busy_ scanning the home directory. That's where I noticed a backup folder with a very long name, named `fix_passfrag_backups_20251111162432` that caught my attention. 

I opened the `bashrc.bak` file I found inside:

```bash
cat fix_passfrag_backups_20251111162432/bashrc.bak
```

Buried at the end the script was an exported variable containing the first piece of the puzzle:
`export PASSFRAG1="3ast3r"`

### Fragment 2: The Ledger

**Riddle:** *"The tree shows today; the rings remember yesterday. Read the ledger’s older pages."*

"Ledger" and "older pages" shifted my focus to Version Control. I located a hidden `.secret.git` directory containing a git repository with `ls -la`. The current working directory looked like a regular git folder, so I checked the history to see what had been covered up.

```bash
git log
```

The log revealed two commits suspiciously titled **"remove/add sensitive note"**. Someone mistakenly added a secret and then tried to erase their tracks by attempting to delete it.

```git
commit e924698378132991ee08f050251242a092c548fd (HEAD -> master)
Author: mcskiddy <mcskiddy@robco.local>
Date:   Thu Oct 9 17:20:11 2025 +0000

    remove sensitive note

commit d12875c8b62e089320880b9b7e41d6765818af3d
Author: McSkidy <mcskiddy@tbfc.local>
Date:   Thu Oct 9 17:19:53 2025 +0000

    add private note
```

To see exactly what was deleted, I used `git show` on the commit hash.

```bash
git show d12875c8b62e089320880b9b7e41d6765818af3d
```

The diff confirmed my suspicions, revealing the second fragment: `+PASSFRAG2: -1s-`.

### Fragment 3: The Tail

**Riddle:** *"When pixels sleep, their tails sometimes whisper plain words. Listen to the tail."*

The clue pointed towards images ("pixels"), but the system was littered with decoy files designed to be noise and distract me. 
I had to filter out several "image-themed" distractions:

*  **`notes_on_photos.txt`** (found in `/Documents` next to an encrypted note): A generic text file reminding the user to "organize into 3 folders per year".
*  **`README_FOR_IMAGES.txt`** (Desktop): A warning not to distribute personal images.
*  **`IMG_list.txt`** (Downloads): A list of wallpapers and holiday photos that didn't actually exist.
*  **`wget-log`** (~): A file that showed a 403 Forbidden error from a public domain site
as well as various `photo_meta` text files scattered around `/Pictures` that were similarly useless. 

One common tecnique for the last two steps, though, was finding hidden files. I remembered I should've ran `ls -la` much sooner and finally spotted the anomaly in `/Pictures`: a file named `.easter_egg`.

```bash
cat .easter_egg
```

The file content printed an ASCII art of a bunny. True to the riddle, hiding right at the very bottom ("the tail") of the file, was the final fragment: `PASSFRAG3: c0m1Ng`.

*[Image: easter egg bunny]*

---

## Phase 3: Decryption (GPG)

With the three fragments assembled, I constructed the passphrase: **`3ast3r-1s-c0M1nG`**.

I attempted to decrypt the `mcskidy_note.txt.gpg` file found on the Desktop. However, GPG was kinda finicky over SSH, trying to spawn a GUI popup for the pin entry and failing. I had to force it to behave using the loopback mode:

```bash
gpg --pinentry-mode loopback --output mcskidy_note.txt --decrypt mcskidy_note.txt.gpg
```

---

## Phase 4: Fixing the Glitch

The note explained that an internal site on port 8080 was glitching. The fix involved restoring a corrupted wishlist file with a specific inventory list provided by McSkidy.

I edited `/home/socmas/2025/wishlist.txt`, pasting in the required items (Hardware security keys, EDR licenses, etc.). With the file patched, I refreshed the page on firefox to check the result.

Success! The glitching was gone, replaced by a wall of _gibberish_ base64 ciphertext waiting to be cracked. I copied this string via the provided button and saved it locally as `gibberish.txt`.

*[Image: mcskidy gibberish]*

### OpenSSL Decryption

McSkidy didn't leave me guessing. The note provided an **UNLOCK_KEY** (`91J*********************`) and the exact OpenSSL command to use to decrypt it. I fed the "gibberish" into the command:

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -salt -base64 -in gibberish.txt -out decoded_message.txt -pass pass:'91J*********************'
```

The resulting `decoded_message.txt` revealed the flag: `THM{w3l***************}`.

---

## Conclusion

The flag wasn't just a trophy, it was the key to one last gpg file. I went to Eddi's `.secret` directory which was pointed out to me in `mcskidy_note.txt` and I decrypted the last archive.

```bash
cd /home/eddi_knapp/.secret/
gpg --pinentry-mode loopback --output dir.tar.gz --decrypt dir.tar.gz.gpg
# Passphrase: THM{w3l***************}
```

This decrypted the file into a standard tarball. After extracting it with `tar -xzvf dir.tar.gz` and `cd`ing into the extracted folder, I found a single image file, `SQ1.png`. Shown on the image was the phrase **"no\*\*\*\*\*\*\*\*\*\*\*\*"** the secret required to progress to the next Side Quest.
