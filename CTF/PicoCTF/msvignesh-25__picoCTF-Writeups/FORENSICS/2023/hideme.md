# CHALLENGE: HIDEME

**DIFFICULTY:** MEDIUM

**LINK:** [hideme](https://play.picoctf.org/practice/challenge/350?category=4&originalEvent=72&page=1)

## DESCRIPTION 
Every file gets a flag.
The SOC analyst saw one image been sent back and forth between two people. They decided to investigate and found out that there was more than what meets the eye [here](https://artifacts.picoctf.net/c/256/flag.png).

## STEPS/SOLUTION

This challenge requires creating a new directory in your terminal, because the image contains embedded files that will be extracted into a folder. This makes it easier to identify the newly created directory during extraction.
1. Download the image file in the picoCTF webshell by using, `wget https://artifacts.picoctf.net/c/256/flag.png`, or directly click the link to download the file into your own machine.
2. You can download the image from webshell directly into your own machine using sz flag.png \rz. But the image is picoCTF's logo. Now proceed to the following steps.
3. As the tag of this challenge in the picoCTF challenge platform is, **Steganography**, zsteg command was initially tried. This command is useful to check if any files are hidden in a given file.
   Command: `zsteg flag.png`. (The filename may vary if multiple `flag.png` files were previously downloaded.)
4. The command returns hex data, and by examining the output, it becomes clear that an additional file is embedded inside the PNG. To actually extract embedded files, the `binwalk` tool must be used. `binwalk` is used to search binary files for embedded or hidden data.
5. `binwalk flag.png` command would return that an archive file is embedded into the given image. This confirms that extraction is required and can be extracted using, `binwalk -e flag.png`.
6. The extracted files will be placed inside a newly created directory. Use the `ls` command to identify this directory. Enter the directory and you will find a zip file, another directory, and a zlib file. The zlib file relates to compression/decompression algorithms (general information only: not required for solving the challenge).
7. The zip file is useless. Enter the directory instead.
8. Inside this directory, another directory and a png file can be found. Again inside this directory, no meaningful/useful data or files can be found. So now again try downloading this image into your own machine using sz <file.png> \rz command.
9. This image would reveal the flag and submit it to complete the challenge.
