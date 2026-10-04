# Benign

**Link:** https://tryhackme.com/room/autopsy2ze0

**Difficulty:** Medium

**Category:** Event Analysis

**Tools Used:** Autopsy

-----

<details close >
<summary> <h1> Windows 10 Disk Image</h1></summary>
<be>

Before answering the questions, open the `Tryhackme.aut` file in autopsy. 

![Screenshot from 2023-10-10 09-20-24](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/033aa0a5-d48c-43d7-8621-3293eb49e25c)

## Answer the questions below

**Q1: What is the MD5 hash of the E01 image?**

In the right panel click `HASAN2.E01` then `file metadata`. 

![Screenshot from 2023-10-10 09-25-10](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/b8abb967-c71a-4513-9105-d8145caafa42)

**Q2: What is the computer account name?**

On the left panel click the `Operating System Operation` then `system`.

![Screenshot from 2023-10-10 09-51-15](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/75d127f8-5cea-4bb0-8294-945b89361121)

**Q3: List all the user accounts. (alphabetical order)**

First, open `HASAN2.E01`, then navigate to `vol3 (NTFS / exFAT (0x07): 104448-126759028)`. Inside this volume, locate the Users folder, where you'll find the eight user accounts.

![Screenshot from 2023-10-10 09-46-01](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/dfbb87c1-68ef-480f-9f32-2f703e9f1ce5)

**Q4: Who was the last user to log into the computer?**

Select the timeline tool and navigate to the list tab. Scroll all the way down.

![Screenshot from 2023-10-10 10-04-41](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/7f156959-a4ce-413d-8ba9-8180e8a57c90)

**Q5: What was the IP address of the computer?**

Check `Look@LAN` in `Program Files(x86)` files.

![Screenshot from 2023-10-10 10-45-28](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/13c39e87-9772-48f5-b172-01e66861842d)

**Q6: What was the MAC address of the computer? (XX-XX-XX-XX-XX-XX)**

In the same file, you'll find the MAC address.

![Screenshot from 2023-10-10 10-55-18](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/c5537af2-4ab3-4e00-81dd-602c16222164)

**Q7: What is the name of the network card on this computer?**

Search for `Networkcards` in the keyword search.

![Screenshot from 2023-10-10 12-32-37](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/6490e739-e80d-44b3-bede-7df59fa80228)

**Q8: What is the name of the network monitoring tool?**

Search for `network monitoring` in the keyword search. 

![Screenshot from 2023-10-10 12-42-35](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/86b28869-cc0b-4668-bc26-9ad519b3decc)

**Q9: A user bookmarked a Google Maps location. What are the coordinates of the location?**

Search for `Google Maps` in the keyword search then look for `Web Bookmarks Artificate`. 

![Screenshot from 2023-10-10 11-12-13](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/a67cbbbe-8821-470f-9d22-70a47058468c)

**Q10: A user has his full name printed on his desktop wallpaper. What is the user's full name?**

Check Joshwa's download file.

![Screenshot from 2023-10-10 12-59-39](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/d35fe7e0-6022-45a2-8c12-da0cef296df5)

**Q10: A user had a file on her desktop. It had a flag but she changed the flag using PowerShell. What was the first flag?**

After checking some of the user’s Desktops, I located the flag within the Shreya user’s Desktop directory.

![Screenshot from 2023-10-10 13-09-56](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/b6cca7ef-6b2d-4f4f-a8c2-030ee044eed0)

 Now go to the `\shreya\APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt`

![Screenshot from 2023-10-10 13-17-25](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/d398451b-f9fd-4985-a4c3-1ddfd5056574)

**Q11: The same user found an exploit to escalate privileges on the computer. What was the message to the device owner?**

Go back to the Desktop, there you'll find a file named `exploit.ps1`.

![Screenshot from 2023-10-10 13-23-18](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/0d244038-17e2-4e0a-9cf2-118b08180c5b)

**Q12: 2 hack tools focused on passwords were found in the system. What are the names of these tools? (alphabetical order)**

We can find one of the hacking tools in the H4S4N’s Downloads folder.

![Screenshot from 2023-10-10 13-46-45](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/d38085ae-63ee-4458-9e59-3371b9467b95)

The second one can be found in `C:\ProgramData\Microsoft\Windows Defender\Scans\History`

![Screenshot from 2023-10-10 13-53-21](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/2e3c5d5e-4dab-4ae6-9baf-d296e2c14d7b)

**Q13: There is a YARA file on the computer. Inspect the file. What is the name of the author?**

When I first looked for files with the extension `.yar`, I came across one called `kiwi_passwords.yar.Ink`. Oddly, the author's name wasn't in this file.

![Screenshot from 2023-10-10 14-07-31](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/930b8404-4b14-4d51-a447-3a133ff96221)

 But later, when I directly searched for the file named kiwi_passwords.yar, I found the author's name linked to it.

![Screenshot from 2023-10-10 14-10-03](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/a7778064-3498-4891-822a-fb7883e62c96)

**Q14: One of the users wanted to exploit a domain controller with an MS-NRPC based exploit. What is the filename of the archive that you found? (include the spaces in your answer)**

If we look up MS-NRPC exploits, there are many results for the exploit known as Zerologon. Now search Zerologon in the keyword search.

![Screenshot from 2023-10-10 14-18-15](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/6be07c58-bd5d-4ebe-9169-6e895e43756c)

</details>

