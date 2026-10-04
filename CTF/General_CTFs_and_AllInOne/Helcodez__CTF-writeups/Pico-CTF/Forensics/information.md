# information

**Points:** 10

**Description:**  Files can always be changed in a secret way. Can you find the flag? cat.jpg

## Solution 

### Approach

I downloaded the provided JPG file and attempted to check if there were any 
readable strings within it, but unfortunately, I couldn't find any. So I decided to check hint, which suggested checking the file's details. To do this, I used the `cat` command, but the contents were unreadable. 

![Screenshot from 2023-09-03 14-26-50](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/2ddb550d-ab3f-4e96-ba63-ca34923b72c2)

So, I decided to use an online [software](https://29a.ch/photo-forensics/#strings) tool for further analysis.

There I found waht could be a base64 text.

![Screenshot from 2023-09-03 14-30-26](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/9781e406-a881-46f6-9023-f7ff80d0eb46)

So I decided to decode it using Cyber Chef, and it revealed the flag.

![Screenshot from 2023-09-03 14-31-13](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/21882c95-e099-4a13-b6c1-d5713e6321b4)
