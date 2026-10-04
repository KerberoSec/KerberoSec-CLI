# 🔐 (Problem Set 2) "Wave a flag" Challenge

### Challenge Description:
- Category: **General Skills**
- Difficulty: **EASY**
- Write-up Date: **5/28/2026**

<img width="1143" height="514" alt="image" src="https://github.com/user-attachments/assets/aeb613cc-d75a-4668-91c3-48502e71de7b" />

---
### 💡 Solution:

So the problem provides us with a downloadable file, so we use the `wget [file]` command.

Hover your cursor over the file link, right click, copy link address, then use the `wget` command (below);

<img width="767" height="297" alt="image" src="https://github.com/user-attachments/assets/20746bdf-ef3b-4261-a153-22521ac55a43" />

Now, we can see the "warm" file that we downloaded in our directory → use `ls` to see the contents of the directory (below);

<img width="386" height="384" alt="image" src="https://github.com/user-attachments/assets/b32ad0a9-e050-404b-9aa5-de8771eef555" />

So let's see what's inside the file. w

You can do this by using the `cat [file]` command to see the contents inside the "warm" file. 

Tyoe in `cat warm` into your terminal and press Enter.

Woah. There is alot of stuff in this file (below):

<img width="763" height="879" alt="image" src="https://github.com/user-attachments/assets/588c0b9a-9812-445d-870f-ba35b75c78d9" />

Looking at the hints, it says to use the `./warm` command to run the program (below):

<img width="690" height="125" alt="image" src="https://github.com/user-attachments/assets/f4ffebc2-16f7-4894-adf8-87caef114c2f" />

But wait, it says "permission denied", meaning we do not have permission to execute this program.

However, according to the hint, you'll first have to make it executable with: `chmod +x warm`

>The `chmod` command ("change mode") is the utility used to modify file and directory permissions.
>: +: An operator that adds a specific permission.
>: x: Represents the execute permission

<img width="765" height="97" alt="image" src="https://github.com/user-attachments/assets/a0b3a79c-c7ee-412e-8408-17b1df805bae" />

Great, now we can do `./warm` again!

Once the program runs, it says to pass `-h` into the program so we can just do that:

<img width="760" height="199" alt="image" src="https://github.com/user-attachments/assets/20048283-9440-4d59-bf32-5545942eca31" />

After, press Enter.

We should get the flag! (below);

<img width="800" height="167" alt="image" src="https://github.com/user-attachments/assets/b07aa4f3-1d28-4cd8-8cae-43f285544c41" />

So the **final flag** is: `picoCTF{b1scu1ts_4nd_gr4vy_ac5832c}`! 🎉

> copy and paste (or manually type) the final flag into the submission area to complete the challenge.

