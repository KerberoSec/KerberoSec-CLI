# Revil Writeup Draft: 

 

# Basic Introduction (***Review**): 
 

This is a write-up of the **REvil** challenge on **TryHackme**. ***** This challenge is based on samples of an infamous **RAAS** ransomware & group named Revil and highlights [……………..] 

In this lab we are going to be using a digital forensics tool created by Mandiant called **“Redline”.** 

 

 

 

# **Scenario/SITREP** 

<img width="792" height="237" alt="image" src="https://github.com/user-attachments/assets/1915dd63-ac92-4c9f-b1f4-51995425ae4c" />

 
Our initial scenario has already given red flags that point to a compromise, specifically a ransomware compromise in this case. All of or the majority of files on an endpoint being renamed to an unfamiliar extension and then being inaccessible is an Indicator of a successful ransomware attack. 

 

# Foothold, Initial Compromise, and Finding a Lead: 

 

In this lab, we are already given a file under the **analysis** folder that already has a Redline report on the compromised system; This should be named **AnalysisSession1.mans**: 

<img width="810" height="739" alt="image" src="https://github.com/user-attachments/assets/dfee0a9b-8865-4b91-bfad-e6ae2228605c" />
 
 
 
 

We are going to open this file and wait for Redline to load and display the contents of the report in a digestible **GUI** format: 

<img width="810" height="739" alt="image" src="https://github.com/user-attachments/assets/ada98969-4744-45e1-9fc5-acebfdc3adc0" />

 

Here we can see that the contents of the report are sorted and organized according to it’s respective attributes. Our first task for our analysis is: 

 

**What is the compromised employee's full name?**

We can quickly check the left panel and look for what might help us identify employees associated with the endpoint; 

<img width="209" height="650" alt="image" src="https://github.com/user-attachments/assets/a8481c09-2038-4f9f-8cea-8afd95363f26" />

 

The **Users** tab seems relevant for our analysis, and we can check the contents: 

<img width="605" height="498" alt="image" src="https://github.com/user-attachments/assets/6985fa9b-0af7-41d7-9497-e4b1b770b138" />

 

 

We can see the employee’s user account name and by context alone we can already answer the previously asked question regarding what is the compromised user’s full name. However we can also establish some evidence of compromise if we investigate the actions of the user.  

 

If we check the **File Syste**m we can isolate what action such as file creations, file additions, and other things were done to the users’ personal directory: 

<img width="1654" height="770" alt="image" src="https://github.com/user-attachments/assets/a4c681f1-d59a-4c9b-9c08-d64248f0e250" />

 

 
After checking the file system interactions within the **C:\Users\John Coleman** directory path we can find multiple Indicators that point towards compromise  

 <img width="590" height="23" alt="image" src="https://github.com/user-attachments/assets/c34139c0-333b-487c-aa7a-1358e23d641c" />

The "decryptor.exe" executable that is present on John Coleman's Desktop is one red flag. “Decryptors” are associated with ransomware attacks and are sometimes present on the infected user's system. It is possible, however, that the user downloaded a “Decryptor” after already being compromised and tried to fix the issue. We shoud investigate further before making a solid conclusion on the .exe.  

<img width="900" height="613" alt="image" src="https://github.com/user-attachments/assets/45ced0de-36b2-4ccc-a0b0-42a889631ea7" />

There are multiple .lock files present on the user’s desktop, this is an usual file extension and is also specifically associated with the actions of REvil: Revil · RansomLook [Add link]
 
 
 
 
 
Check: 

REvil Ransomware: Recover data encrypted by REvil ransomware remediation [link here]

 

*******Expand on this later ()******** 

 

**What is the operating system of the compromised host?** 

 

For this question, we can easily go back to **Redline** and check the "**System Information**" Tab to find the OS of our subject host.  

<img width="1393" height="708" alt="image" src="https://github.com/user-attachments/assets/ac868c85-194b-4a4a-a3fd-868b80720260" />

Our provided answer should be;  Windows 7 Home Premium 7601 Service Pack 1 

 

 

**What is the name of the malicious executable that the user opened?** 

When checking downloads, in the **File Download History** panel we can see that only 2 downloads are present: One is Tor Browser from an official URL and the Other is "**WinRAR**" from an unofficial and very strange URL:  

<img width="1902" height="805" alt="image" src="https://github.com/user-attachments/assets/b1d6620a-acd1-4011-99e2-fcbc3e06d441" />

 

Now via this alone we could conclude that the malicious Download was the WinRAR file via contextual clues alone, however we should practice having an investigative mindset for the real-world and establish more proof that this was indeed the malicious Download: 

 

Let's find the exact time the WinRAR application was run on the system and the actions that proceeded: 

We are going to select **File System**, on the **Left Panel**, **Checkmark** all the things under the John Coleman user tree, and then search for "WinRAR" in the search bar: 

<img width="1898" height="937" alt="image" src="https://github.com/user-attachments/assets/494f4268-798b-4da2-bb62-7aa920c51247" />

 
 

 

And we select the first WinRAR download and are able to find the suspicious highly suspicious URL and port number

Our answer should be  

**hxxp[:]//192[.]168[.]75[.]129[:]4748/Documents/WinRAR2021[.]exe** 

 

*Note the URL is de-fanged here the answer might only accept fanged URLs, to re-fang the URL replace the hxxp with http, and remove the brackets ([]). 

 

** Another note, the URL is a request to an Private IP address, and we can confirm that the machine had access to the external internet. This is a sign that there is a compromise present in the company’s internal network that is distributing this malware & possibly others. 

 

**What is the MD5 hash of the binary?** 

We should check the download folder of John Coleman for this binary in order to find its details such as its MD5 Hash. 

We are going to go to **File System** and search for **WinRar** 

 <img width="625" height="500" alt="image" src="https://github.com/user-attachments/assets/983a21e1-5d49-4345-9a4f-b064fe3b978d" />

We can click on the highlighted column and get more details: 

 

When checking the details area we can find a section that says **MD5** That contains the Exe’s MD5 hash: 

<img width="518" height="105" alt="image" src="https://github.com/user-attachments/assets/acafacd3-9ec7-473f-9a44-6e08b532deae" />

 

Our answer should be: **890a58f200dfff23165df9e1b088e58f** 

 

**What is the size of the binary in kilobytes?** 

On the same area we saw earlier we can find the size in the **File Metadata** tab: 

<img width="618" height="582" alt="image" src="https://github.com/user-attachments/assets/6c68f8a7-05ef-4327-9ee8-758477c12fa8" />

 

 

Under size we can see the size as 164 kb, 

 

Our answer should be **164** 

 

**What is the extension to which the user's files got renamed?** 

For this we can backtrack back to the **File System** tab and checkmark the folders that are under the 

**John Coleman** user directory. We then can apply this filter on **Full Path; Contains .txt** then click **add**  

**Filter** and after that sort by **File Name** 

<img width="434" height="250" alt="image" src="https://github.com/user-attachments/assets/9ba992b3-a542-4d66-a2cb-d5e118ece64a" />

<img width="625" height="296" alt="image" src="https://github.com/user-attachments/assets/a8be9f7e-8915-4d82-8b78-7140714452dd" />
 

 

 
 

Here we can find the exact time the malicious .exe was accessed after extraction: 

**2021-08-02    19:42:16Z** 

We should now use this information to see what events happened very shortly after this time and identify anything that seems connected to the user's plight: 

 

 

 
**Partly finished draft ends here**

**Notes and Other stuff**
 

 

Initial WinRAR Malicious download time: 

 

2021: 08: 02   19:21:50 

 

It was first ran at: 

19:42:16Z 

Security ID:      S-1-5-21-1353384816-572941898-2751933278-1000 

 

 

Tor browser Download (After) for exfiltration 

2021: 08: 02 19 47 02 

2021: 08: 02 19 47 35 

 

What is the full URL that the user visited to download the malicious binary? (include the binary as well) 

We can check the Final Download History tab and specifically look at the WinRAR download for more information 

 

 

What is the size of the binary in kilobytes? 

 

What is the extension to which the user's files got renamed? 

 

What is the number of files that got renamed and changed to that extension? 

 

What is the full path to the wallpaper that got changed by an attacker, including the image name?   

 

The attacker left a note for the user on the Desktop; provide the name of the note with the extension.   

 

The attacker created a folder "Links for United States" under C:\Users\John Coleman\Favorites\ and left a file there. Provide the name of the file. 

 

There is a hidden file that was created on the user's Desktop that has 0 bytes. Provide the name of the hidden file. 

 

The user downloaded a decryptor hoping to decrypt all the files, but he failed. Provide the MD5 hash of the decryptor file.   

In the ransomware note, the attacker provided a URL that is accessible through the normal browser in order to decrypt one of the encrypted files for free. The user attempted to visit it. Provide the full URL path. 

 

What are some three names associated with the malware which infected this host? (enter the names in alphabetical order). 

 

 

 

 

 

 

 
 
 

 

 
 
 

 
 
 

 

 

 
