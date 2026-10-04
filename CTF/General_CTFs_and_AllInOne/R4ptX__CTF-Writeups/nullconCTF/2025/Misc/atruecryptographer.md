# atruecryptographer: misc

## Challenge Description

> You know what I like most? Nullcon aftermovies and Kerckhoffs's principle! But since I'm a true cryptographer and a 1337 h4xx0r, I can even provide you my password without you ever finding my secrets: `U"gkXYg;^#qXxJ(jm*jKik|N/gezj7)z`
>
> My question is: Are you a true cryptographer, too? Prove it by finding my secret!”\*

## Recon

* Initial inspection of the provided file in a hex editor didn’t reveal anything obvious.
* The challenge name, **“a true cryptographer,”** hinted at **TrueCrypt** containers.

## Solution

1. Go to [truecrypt.org](https://www.truecrypt.org/) and download/install **TrueCrypt**.

2. Open TrueCrypt and **Select File** → choose the challenge file.

3. Click **Mount**.

4. When prompted for a password, enter:

   ```
   U"gkXYg;^#qXxJ(jm*jKik|N/gezj7)z
   ```

5. TrueCrypt mounts the volume as a drive.

6. Browse the mounted drive to retrieve the **flag**.

## Notes

* The key insight was recognizing the play on words in the challenge title leading to TrueCrypt.
* No additional steganography or format tricks were required: just the correct tool and the provided password.
