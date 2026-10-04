# 🚀 Hidden Layers 'Macbeth'
**Category** Miscellaneous  
**Points** 200  
**Difficulty** MEDIUM

## Description
"Fair is foul, and foul is fair, Hover through the fog and filthy air."

A cheerful image named happy sits before you. But all is not what it seems. Can you pierce the veil of fair facades to uncover the foul truth within?

Flag Format: LakshyaCTF{ }

## Files / Resources
* `Peacee.jpeg`
## Tools Used
* steghide
* binwalk

## 🧠 Analysis

- Step 1: Initial Thoughts  
As soon as we saw image, we thought of using `steghide` to extract any hidden file in it. But using `steghide` require a passphrase. We tried to brute force using Macbeth lines as a word list but it failed
    ```bash
    $ steghide extract -sf Peacee.jpeg
    ```

- Step 2: Digging Deeper with Binwalk
    ```bash
    $ binwalk -e ./Peacee.jpeg
    ```
    In this extracted folder we found a folder named `Chaos`
- Step 3: Finding the Hidden Truth  
Inside the `Chaos/` folder, we discovered a hidden file: `.truth.jpg`. Hidden files (starting with .) can be overlooked easily: this was the key!
Opening `.truth.jpg` in a text editor (like VSCode, Sublime Text, or even cat) revealed the flag embedded as plain text.

## 🏁 Flag
```bash
LakshyaCTF{Nothing_iS_F@ir}
```
