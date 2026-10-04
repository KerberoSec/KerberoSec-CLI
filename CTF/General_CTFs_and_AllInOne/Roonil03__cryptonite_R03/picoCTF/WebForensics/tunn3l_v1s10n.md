#tunne3l v1s1on
On opening the file, I came across the error that I am unable to read the file. Either the file is corrupted or encrypted with a key, which I have no idea. All I know is that
my VS code is unable to read the contents of the file, and even after attempting to read it, it results in some sort of gibberish.
*[Image: VS Attempt Read]*
*[Image: VS Attempt]*

Time to explore the internet and learn how this works. After some initial digging, I found out that the hex of the file may be corrupted. I checked out a YouTube video to 
figure out how the file is to be converted. They stated that the file should be a .bmp file due to the way the initial hex is decoded. Therefore I changed the file type and tried 
opening the file to get another corrupted error.
*[Image: Picture Corrupt]*

After going online and finding a hex converter, I copied and changed the file to get the following picture. It was finally opening, but the message stated that the picture didn't
currently have the flag. Spending some more time on this problem was certainly start to hurt my brain, therefore I sought to the YouTube video once more. The video stated
we probably need to change the width of the image to see it completely and then we can find the flag.
*[Image: notflag]*

After learning how to convert some of the values and changing the resolution of the image, I found the flag and then got the correct answer. Albeit, I did use the help of 
YouTube in trying to figure out this problem, I did enjoy solving this problem.
*[Image: flag]*

##Answer:
picoCTF{qu1t3_a_v13w_2020}

##References:
https://www.youtube.com/watch?v=d63buMlAUHM
https://tomeko.net/online_tools/text_to_base64.php?lang=en
https://hexed.it/
