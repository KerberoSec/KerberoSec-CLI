# 🔐 (Problem Set 2) "convertme.py" Challenge

### Challenge Description:
- Category: **General Skills**
- Difficulty: **EASY**
- Write-up Date: **6/2/2026**

<img width="679" height="344" alt="image" src="https://github.com/user-attachments/assets/b8396400-0b0d-439d-bf7a-0a7b6459cf74" />

---
### 💡 Solution:

First, we are given a python script download link. 

When given a download source, we always use the `wget` command in the linux terminal like usual (below):

> Copy link address, paste it in terminal (right click)

<img width="760" height="590" alt="image" src="https://github.com/user-attachments/assets/4b21e329-7bbf-4682-bdd8-aee27c9e61a8" />

> from the `ls` command, we can see the file downloaded to our directory.
>
> FYI: The `.py` at the end of the file name indicates that it is a python script!

Now, once we have the python script downloaded, lets try opening it and reading the code

We can do this by doing the `nano [script]` command (below):

<img width="757" height="134" alt="image" src="https://github.com/user-attachments/assets/a5b85fa5-0318-4739-90fc-a384e74ec7ec" />

> The `nano` command allows you to manipulate, change, and read code in the terminal (it can also create files too!).

the image below shows the python code in the terminal IDE... Theres alot, I know.

<img width="758" height="864" alt="image" src="https://github.com/user-attachments/assets/fae13976-6d6c-4c6f-9f89-437211c6aeb5" />

But basically, the python script just generates a random number from 10 to 101, then prompts you (the user) to turn the decimal number to binary (1s and 0s).

If correct, then it would display the flag!

So, to run the python script, we just use the `python [file]` command (below):

<img width="753" height="193" alt="image" src="https://github.com/user-attachments/assets/af30b4ff-95c7-4c34-a9f9-ff82dc84f1e9" />

Once you run it (above), it would prompt you to convert the randomly generated number to binary.

> In my case, it is 21. Your number should be different.

To convert, you can look it up or use: https://www.rapidtables.com/convert/number/ascii-hex-bin-dec-converter.html

> Enter your number (in my case `21`) into the "Decimal (Bytes)" section, and copy the converted binary under the "Binary (bytes)" section.

Then once copied, you enter the binary number into the input (then press enter):

<img width="753" height="302" alt="image" src="https://github.com/user-attachments/assets/1cd55c4b-d07b-40fe-aa37-3ef67554b2e0" />

So the **final flag** is: `picoCTF{4ll_y0ur_b4535_762f748e}`! 🎉

> copy and paste (or manually type) the final flag into the submission area to complete the challenge.

