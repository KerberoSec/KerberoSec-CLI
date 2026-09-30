# CHALLENGE: RIDDLE REGISTRY

**DIFFICULTY:** EASY

**LINK:** [Riddle Registry](https://play.picoctf.org/practice/challenge/530)

## DESCRIPTION
Hi, intrepid investigator! You've stumbled upon a peculiar PDF filled with what seems like nothing more than garbled nonsense. But beware! Not everything is as it appears. Amidst the chaos lies a hidden treasure: an elusive flag waiting to be uncovered.
Find the PDF file here [Hidden Confidential Document](https://challenge-files.picoctf.net/c_amiable_citadel/aa8b61ad4587052b730bc07906352e33d5a803f25708e2c8c115147039541a76/confidential.pdf) and uncover the flag within the metadata.

## STEPS/SOLUTION

1. Download the file using **wget** command. A pdf is downloaded.
2. Opening the file didn't provide any useful information.
3. The hint suggested to look beyond the surface. So upon researhing, found out that the **metadata** might contain some useful information. 
4. Analysing the **metadata** with `exiftool` command reveals a **base64** encoded string. 
5. Decoding this string using CyberChef reveals the flag
