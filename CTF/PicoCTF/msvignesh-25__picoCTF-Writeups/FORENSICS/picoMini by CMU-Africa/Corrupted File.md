# CHALLENGE: Corrupted File

**DIFFICULTY:** EASY

**LINK:** [Corrupted File](https://play.picoctf.org/practice/challenge/519?category=4&originalEvent=77&page=1)

## DESCRIPTION 
This file seems broken... or is it? Maybe a couple of bytes could make all the difference. Can you figure out how to bring it back to life?
Download the [file](https://challenge-files.picoctf.net/c_amiable_citadel/ee2ab6d61392fc085e2a8c2ae3a947597ffac5a9aac88f7b887813b0c2c010fb/file)

## STEPS/SOLUTION
The solution is discussed here after doing the challenge on picoCTF's brower webshell tool, as I'm a Windows user. Hence after changing the file format to JPEG (process will be told later in the solution/discussion), I've downloaded the file to my PC.

1. Opened the browser webshell and by using the `wget https://challenge-files.picoctf.net/c_amiable_citadel/ee2ab6d61392fc085e2a8c2ae3a947597ffac5a9aac88f7b887813b0c2c010fb/file` command, downloaded the file.
2. The filename will be **file** (Name will be different, if you have already downloaded files from the website, as many challenges have the same filename). Hence, to get the filetype of the downloaded file, we'll be using the command **file file**.
3. The command will return *data*. I didn't get much information from this, so proceeded to read the hint.
4. The hint asked me to check the file header. I learnt that the file header is actually the first few bytes that show up when you use a **hex dump utility** to display the raw binary data of a file.
5. I learnt that **xxd** is a good tool to view the file bytes of a file.
6. Before using the command, I read the next hint, which was just **JPEG**.
7. I learnt that if a file has its **SOI** (Start of Image) as **FFD8** and its **EOI** (End of Image) as **FFD9**, then the file is a valid JPEG file. So I proceeded to check the file bytes of the file I was provided.
8. The command is, `<xxd -l 16 file>`. This will show the starting few bytes of the file header. And of-course, it didn't start with FFD8. And the command to check the last few bytes of the file header is, `<xxd -s -2 -l 2 file>`. And of-course, it wasn't FFD9. So I explored how to manipulate the file header bytes on my own.
9. Found that the command is, `<printf '\xFF\xD8\xFF\xE0' | dd of=file bs=1 seek=0 conv=notrunc>`. And the command to change the last few bytes is, `<printf '\xFF\xD9' >> file>`.
10. These two commands would change the file bytes, so that file would now become a valid JPEG file. To verify this, I again used the command, `file file` and it returned, file: JPEG image data, JFIF standard 1.01, aspect ratio, density 1x1, segment length 16, baseline, precision 8, 800x500, components 3.
11. Now rename the file to .jpg format, so that you can the open the image. The command is `mv file file.jpg`.
12. Now this is the last step. Linux users need to use the command, xdg-open file.jpg to open the image and the flag will be available.
13. Users on the browser webshell won't be able to use the command, so an alternate option is to use the command, `sz file.jpg /rz`. The file will be downloaded to the PC and then opening the file will show you the required flag.
