# Truth
> Kuronushi traveled far away from his country to learn something about himself. He never sure about his identity. Untill One day, he met a sage who gave him a book of truth. The sage said " To understand about yourself,Erase the title and find the Bigger case"

> Submit the flag on this format ARA2023{} Separate the sentences with _

## About the Challenge
Given a PDF file that is locked using a password (You can get the file here)

## How to Solve?
To solve this problem, I use `pdfcrack` to bruteforce the PDF using the `rockyou.txt` wordlist

*[Image: pdfcrack]*

The password for the PDF is `subarukun` and when I open the file, the PDF contains a kind of story that has 4 pages

*[Image: content]*

And then in the question there is a hint `Erase the title and find the Bigger case`. So I removed the title and searched for words that were capitalized

*[Image: capital]*

If only the capital letters are taken, a flag will be formed

```
ARA2023{SOUNDS_LIKE_FANDAGO}
```