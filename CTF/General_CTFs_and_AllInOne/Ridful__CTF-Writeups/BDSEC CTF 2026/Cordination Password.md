# Cordination Password

## Challenge info

- **Name:** Cordination Password
- **Category:** OSINT / Steganography
- **Event:** BDSEC CTF
- **File:** `unlock.jpg`

The challenge provides a ZIP archive containing an image called:

```
unlock.jpg
```

The image shows a cartoon lock with the words:

```
Unblock Me
```

<img width="652" height="653" alt="image" src="https://github.com/user-attachments/assets/1ff4d295-c2ba-4325-ae60-fdd031787a69" />

The challenge description mentions leaked personal notes and says that the password must be confirmed by unlocking the image.

The expected flag structure is:

```
BDSEC{Partialflag_password}
```

The password portion also needs to be lowercase.

## First look

A password-protected JPEG immediately suggests tools such as `steghide`, so I started by checking the file itself.

I ran the usual metadata and file-structure checks:

```
file unlock.jpg
exiftool unlock.jpg
strings -a unlock.jpg
```

I also checked whether anything had been appended after the JPEG end marker.

Nothing useful appeared:

- no interesting EXIF metadata
- no JPEG comment
- no obvious appended archive
- no readable embedded password

The image looked like a normal steghide carrier. The missing part was the passphrase.

## The failed brute-force route

Before finding the intended path, I tried several password attacks.

These included:

- `rockyou.txt` with `stegseek`
- a large English wordlist
- numeric combinations from `000000` through `999999`
- names, locations, and variations of words such as `coordination`
- terms related to the challenge author and Knight Squad

None of them worked.

That made the wording of the challenge more important. It said that the password must be **confirmed** by unlocking the image.

The image was not necessarily where the password was hidden. It was more likely an oracle that would confirm a password recovered somewhere else.

## Finding the leaked notes

The challenge description pointed toward the online presence of `pmsiam0`.

OSINT led to a GitHub repository containing personal notes:

```
siamsec404/Personal-notes
```

Inside `Notes.md`, there were three short lines of text and a suspicious sequence labeled as coordinates:

```
1-2-4
2-3-3
1-9-2
2-3-4
1-1-2
1-1-1
2-8-3
1-1-3
2-2-4
1-4-5
1-2-3
1-3-1
1-11-2
1-5-3
1-6-6
3-2-3
3-8-1
```

The repository also contained a ZIP archive with a QR code image.

At this point, the challenge had two separate pieces:

1. A coordinate sequence connected to the notes.
2. A damaged QR code containing another value.

## Decoding the coordinates

The coordinate format is a book cipher:

```
line-word-letter
```

Each triple selects:

1. a line from the note
2. a word from that line
3. a letter from that word

For example:

```
1-2-4
```

means:

- line 1
- word 2
- letter 4

The second word on the first line was `dark`, whose fourth letter is:

```
k
```

Applying the same process to all seventeen coordinates produced:

```
k n i g h t n e v e r s l e e p s
```

So the recovered password was:

```
knightneversleeps
```

## Unlocking the image

I tested the recovered password with `steghide`:

```
steghide extract -sf unlock.jpg -p knightneversleeps
```

This time, the extraction succeeded.

The hidden content was:

```
BDSEC{partialflag1_knightneversleeps}
```

That confirmed that the book-cipher password was correct.

However, `partialflag1` was clearly a placeholder rather than the complete first half of the flag. The QR code from the GitHub repository was the remaining piece.

## Repairing the QR code

The QR code from the repository was not immediately scannable because the image had been split into two halves.

I opened both pieces in GIMP, aligned them, and reattached them to reconstruct the complete QR code.

Once the halves were joined correctly, the repaired image could be scanned normally.

<img width="668" height="665" alt="image" src="https://github.com/user-attachments/assets/aacf3046-43dd-4d9a-94f8-bb7fc2402da7" />

The QR code decoded to:

```
Kn1ghT404_Y0U_are_Hack3r
```

This value replaces the `partialflag1` placeholder from the steghide output.

Combining both recovered parts gives:

```
BDSEC{Kn1ghT404_Y0U_are_Hack3r_knightneversleeps}
```

## Flag

```
BDSEC{Kn1ghT404_Y0U_are_Hack3r_knightneversleeps}
```

## Final thoughts

This was a fun challenge that combined OSINT, a book cipher, image repair, QR decoding, and steganography.

The main mistake was treating the image password as something that needed to be brute-forced. The challenge wording was the real hint: the image was only meant to confirm a password recovered from the leaked notes.

Once the GitHub repository was found, the solution chain became clear:

1. Find the leaked notes.
2. Interpret the coordinates as `line-word-letter`.
3. Recover `knightneversleeps`.
4. Use it to extract the partial flag from the JPEG.
5. Reattach the two QR code halves in GIMP.
6. Scan the repaired QR code.
7. Replace the placeholder and assemble the final flag.

The steghide image was not the complete puzzle. It was the checkpoint that proved the OSINT and cipher work were correct.
