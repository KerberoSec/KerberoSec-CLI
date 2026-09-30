# 🔐 (Problem Set 2) "Obedient Cat" Challenge

### Challenge Description:
- Category: **General Skills**
- Difficulty: **EASY**
- Write-up Date: **5/26/2026**

<img width="1275" height="453" alt="image" src="https://github.com/user-attachments/assets/ccfe39fe-c5f6-4e14-94b7-c904b529ca49" />

---
### 💡 Solution:

For the CTF challenges with CLI, I will be using Kali Linux CLI.

<img width="369" height="169" alt="image" src="https://github.com/user-attachments/assets/a37fd330-6563-4fa8-aeb3-3676a5cc5b68" />

> Above: Kali Linux Terminal

First, looking at the problem, they provide us with a downloadable file named "file".

Right click the embedded link and click "copy link address" to copy the file link into your clipboard.

<img width="275" height="245" alt="image" src="https://github.com/user-attachments/assets/547a0ed5-fed7-4161-957a-3ea0afd5b60c" />

Then, (according to the hints) to get the file accessible in your shell, you use the `wget` command:

`wget [file link]`

> `wget` command is simply used to download files from the web!
>
> To paste the link you copied from earlier, just right click and click "paste selection"

<img width="738" height="325" alt="image" src="https://github.com/user-attachments/assets/8d754751-8a0e-481d-921a-f7c2a54423a1" />

Press enter and the file will download (below): 

<img width="370" height="323" alt="image" src="https://github.com/user-attachments/assets/cfbd4532-de20-43a2-8c19-6bb9a2ef131b" />

> So where is the downloaded file now?
>
> Do see the file, do the `ls` command
>
>  The `ls` command just lists the contents of a directory!

<img width="603" height="175" alt="image" src="https://github.com/user-attachments/assets/1c10d9f7-ada5-4ef5-a89e-c3a77d9924e8" />

Now, to get the flag from the "flag" file, we have to read/get the contents from that file.

To do that we use the `cat` command.

> The `cat [file]` command, for this situation, just prints and displays the entire content of a file to the terminal.

So type: `cat flag` into the terminal (below):

<img width="775" height="208" alt="image" src="https://github.com/user-attachments/assets/4e093033-fc68-4fea-bfc4-66fb0ed08814" />

Press Enter, then the terminal should display the flag! (below):

<img width="390" height="102" alt="image" src="https://github.com/user-attachments/assets/de260f94-9068-4dbb-8e8e-21d908793666" />

So the **final flag** is: `picoCTF{s4n1ty_v3r1f13d_9b8fa0bc}`! 🎉

> copy and paste (or manually type) the final flag into the submission area to complete the challenge.
