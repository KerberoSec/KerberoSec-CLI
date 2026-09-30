# Secret_of_the_Polyglot
*The Network Operations Center (NOC) of your local institution picked up a suspicious file, they're getting conflicting information on what type of file it is. They've brought you in as an external expert to examine the file. Can you extract all the information from this strange file?*

## Solution
1. I'm given a link to a file, [artifacts.picoctf.net/c_titan/7/flag2of2-final.pdf](https://artifacts.picoctf.net/c_titan/7/flag2of2-final.pdf). Already, this looks interesting; `flag2of2-final`, does that mean that there is a `flag1of2`?
2. After wodnloading it I realized that if you open it in a pdf viewer, eg. `zathura`, you view it as a pdf and get the last half of the flag. If you instead open it in, let's say, `nsxiv` (image viewer), you view it as a png and get the first half of the flag?! Incredibly interesting file, I'll have to investigate this file further!

## Flag
**Flag:** `picoCTF{f1u3n7_1n_pn9_&_pdf_53b741d6}`
