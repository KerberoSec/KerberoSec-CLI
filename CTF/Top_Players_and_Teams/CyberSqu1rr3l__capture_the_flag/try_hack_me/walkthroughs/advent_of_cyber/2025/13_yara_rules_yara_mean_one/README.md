```
▌ ▌▞▀▖▛▀▖▞▀▖ ▛▀▖   ▜            ▌ ▌▞▀▖▛▀▖▞▀▖                        ▐ 
▝▞ ▙▄▌▙▄▘▙▄▌ ▙▄▘▌ ▌▐ ▞▀▖▞▀▘ ▄▄▖ ▝▞ ▙▄▌▙▄▘▙▄▌ ▛▚▀▖▞▀▖▝▀▖▛▀▖ ▞▀▖▛▀▖▞▀▖▐ 
 ▌ ▌ ▌▌▚ ▌ ▌ ▌▚ ▌ ▌▐ ▛▀ ▝▀▖      ▌ ▌ ▌▌▚ ▌ ▌ ▌▐ ▌▛▀ ▞▀▌▌ ▌ ▌ ▌▌ ▌▛▀ ▝ 
 ▘ ▘ ▘▘ ▘▘ ▘ ▘ ▘▝▀▘ ▘▝▀▘▀▀       ▘ ▘ ▘▘ ▘▘ ▘ ▘▝ ▘▝▀▘▝▀▘▘ ▘ ▝▀ ▘ ▘▝▀▘▝
```
In this THM room, we learn how YARA rules can be used to detect anomalies and malicious
indicators. [^1]

How many images contain the string TBFC?
-----------------------------------------------------------------------------------------
First, we are instructed to run the following YARA rules against the images in the
`/home/ubuntu/Downloads/easter` folder. In here, we now create the `search_string.yar`
rule with the following contents to search for occurences of the "TBFC" keywords.

```yara
rule TBFC_Search_String {
    strings:
        $tbfc = "TBFC"
    condition:
        any of them
}
```
With this, we can apply the `yara -r` command, to get a listing of all files where the
string is found. If we want to have a look at the strings as they were found, we can
print them with the `-s` option.
```
~/Downloads/easter$ yara -r search_string.yar .
TBFC_Search_String ./search_string.yar
TBFC_Search_String ./easter46.jpg
TBFC_Search_String ./embeds
TBFC_Search_String ./easter16.jpg
TBFC_Search_String ./easter10.jpg
TBFC_Search_String ./easter52.jpg
TBFC_Search_String ./easter25.jpg
```
So, we can see that there were *5 images* found with instances of the "TBFC" keyword in
them.

What regex would you use to match a string that begins with `TBFC:` followed by one or
more alphanumeric ASCII characters?
-----------------------------------------------------------------------------------------
As we learned above, we can use the regular expression in YARA for this. To find all 
instances of strings that start with "TBFC:" followed by at least one alphanumeric ASCII
character, we would use the string */TBFC:[A-Za-z0-9]+/* in our YARA rule.

What is the message sent by McSkidy?
-----------------------------------------------------------------------------------------
Upon investigating the `/easter/` directory, we stumble upon the `embeds` file which
contains the *phrase* sent by McSkidy. 

```python
import glob, random

seed = 42
phrase = "Find me in HopSec Island"
words  = phrase.split()
images = sorted(glob.glob("easter*.jpg"))

random.seed(seed)
chosen = random.sample(images, len(words))   # 5 distinct random images
chosen.sort()                                # keep word order increasing by filename

for img, word in zip(chosen, words):
    with open(img, "ab") as f:
        f.write(f"\nTBFC:{word}\n".encode())
    print(f"{img}  <-  TBFC:{word}")
```
This code appends the string `TBFC:` followed by the words from the phrase to the binary
content of the selected image files. Therefore, it finds all image files in the directory
and upon randomly selecting five of them, it sorts them. Note, that appending text to
image files in this steganographic fashion does not alter the image since they usually
ignore extra data after the file's standard image format.

[^1]: https://tryhackme.com/room/yara-aoc2025-q9w1e3y5u7
