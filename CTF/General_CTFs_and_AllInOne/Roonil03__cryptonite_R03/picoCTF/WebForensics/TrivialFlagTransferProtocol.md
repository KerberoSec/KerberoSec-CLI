#Trivial Flag Transfer Protocol

Since the name was so grand, I decided to check online if the name had a special meaning in the competive programming space. On testing it on Google, I found out that it 
was just a grand name for this challenge and therefore nothing special.
Upon downloading the file for the challenge, I realized that filetype was pcapng. 
*[Image: What is pcapng]*

Using an online pcapng, I wanted to see if the file was corrupted or not. And like always, it was...
*[Image: Corrupt Again]*

Like last time, I input the file into a hex editor to check and see if I am able to decipher anything, but I just was not able to find anything that was useful in that matter.
*[Image: Hex]*

I ended up trying to find the flag within the hex code, which ended up failing. Therefore, I went with trying to find a YouTube video which would explain me the direction I
would need to take in order to find the solution to the problem. The video told me to first research a little on File Transfer Protocol. TFTP is an acronym for Trivial File 
Transfer Protocol and I ended up doing a little bit of research on that topic.

So it turns out that it is a file transfering method, and I would need to extract the TFTP type of files from the pcapng to continue on. For that, most of the internet suggested
that I use wireshark. I watched a YouTube tutorial on how to do the extraction and I extracted some files from the pcapng using wireshark. 
(I am uninstallling NpCap because it was giving multiple suspicious flags from my antiviruses, and I didn't want to endanger my laptop)
*[Image: Files Extracted]*

After extracting the files, I tried to see if I could do anything with the two text documents, since they were encrypted. I tried using the ROT 13 on them, since most of the
codes in this site seem to follow that, and I ended up being right.

TFTPDOESNTENCRYPTOURTRAFFICSOWEMUSTDISGUISEOURFLAGTRANSFER.FIGUREOUTAWAYTOHIDETHEFLAGANDIWILLCHECKBACKFORTHEPLAN

IUSEDTHEPROGRAMANDHIDITWITH-DUEDILIGENCE.CHECKOUTTHEPHOTOS

Well, now time to use steghide to find out how to find the password and then the flag hopefully.

I found the flag.txt in the picture3.bmp and then found the flag. This took way too long to solve.

Answer: 
picoCTF{h1dd3n_1n_pLa1n_51GHT_18375919}

References:
https://pcapng.com/
https://www.youtube.com/watch?v=vQ6YIJpgxCo
https://hexed.it/
https://steghide.sourceforge.net/
https://www.youtube.com/watch?v=Fn__yRYW6Wo
https://en.wikipedia.org/wiki/Trivial_File_Transfer_Protocol
https://mypcfile.com/viewer/pcapng
