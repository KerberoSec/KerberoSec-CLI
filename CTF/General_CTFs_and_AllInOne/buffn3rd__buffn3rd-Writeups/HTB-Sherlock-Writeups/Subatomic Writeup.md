# **Subatomic Writeup**
![image](https://github.com/user-attachments/assets/0930c519-eb34-4c9e-97b6-7f4d35735f0e)

Forela is in need of your assistance. They were informed by an employee that their Discord account had been used to send a message with a link to a file they suspect is malware. The message read: “Hi! I’ve been working on a new game I think you may be interested in it. It combines a number of games we like to play together, check it out!”. The Forela user has tried to secure their Discord account, but somehow the messages keep being sent and they need your help to understand this malware and regain control of their account! Warning: This is a warning that this Sherlock includes software that is going to interact with your computer and files. This software has been intentionally included for educational purposes and is NOT intended to be executed or used otherwise. Always handle such files in isolated, controlled, and secure environments. One the Sherlock zip has been unzipped, you will find a DANGER.txt file. Please read this to proceed.

**Tools:**
  - FlareVM
  - VirusTotal
  - VSCode
  - 7zip Manager

**Learned:**
  - Static Analysis
  - Malicious Libraries
  - C2 Domains
### **Question 1**
What is the Imphash of this malware installer?

Initial analysis we are given an executable for this challenge. First thing I will load this into my sandbox (FlareVM) then upload this to VirusTotal to aid me in my static analysis. In VirusTotal, I can see it pops many AV’s and when I go to the details tab I can see its Imphash

![image](https://github.com/user-attachments/assets/a74cdf5d-a662-4022-b58c-d9cbe456190d)

Answer: b34f154ec913d2d2c435cbd644e91687

### **Question 2**
The malware contains a digital signature. What is the program name specified in the `SpcSpOpusInfo` Data Structure?

Still doing static analysis I found this under the details tab

![image](https://github.com/user-attachments/assets/7c0cb9e8-8486-4927-bd16-20674e41f3d8)

Answer: Windows Update Assistant

### **Question 3**
The malware uses a unique GUID during installation, what is this GUID?

Opening the .exe in 7zip manager I began digging through the folders. First I started with the .nsi file wondering what it is. Looks like it is part of the installer that is installing everything. Digging through there I found its install location in the registry being the software install. There I found it GUID. Doing research I looked at other known GUIDS and after looking at some that is how I knew that was it

![image](https://github.com/user-attachments/assets/ab6b3bbb-8c7e-4edc-a4d1-a1cf6ea99419)

Answer: cfbc383d-9aa0-5771: 9485-7b806e8442d5

### **Question 4**
The malware contains a package.json file with metadata associated with it. What is the ‘License’ tied to this malware?

Digging in this folder further I found another zipped archive named ‘app-32.7z’. I extracted it to investigate.

![image](https://github.com/user-attachments/assets/6041ca28-a106-44a2-94d2-04848d3c93d0)

Inside of that I found a app.asar, and a executable. I am going to do research on the asar file to understand that that is. The asar file works similiar to tar files where it concatenates files together instead of compressing them. I wonder if I can break this up to see the files. I had to download a cmd line utility called ‘electron’ that can help parse these files out. After running this command:

- npx @electron/asar extract app.asar ./temp/

I found what was concatenated! Interesting... I found the package.json within it.

![image](https://github.com/user-attachments/assets/caf9d1b9-93a0-4879-b3c4-dc6102ee3371)

Inside of the package.json I found the license

![image](https://github.com/user-attachments/assets/d1ced6c5-bac3-4289-86e8-dbc5f3dbf451)

Answer: ISC

### **Question 5**
The malware connects back to a C2 address during execution. What is the domain used for C2?

Going back to VirusTotal, under the community tab I read through and saw someone posted its domains it conencts too

![image](https://github.com/user-attachments/assets/b82be8a0-ed13-4ac5-84f1-454e484cfaf0)

Answer: illitmagnetic.site

### **Question 6**
The malware attempts to get the public IP address of an infected system. What is the full URL used to retrieve this information?

Look further into the app.js file we dropped out of the asar file… I will begin looking into it. It is heavily obfuscated

![image](https://github.com/user-attachments/assets/d7e3b62c-2e4b-4ecd-a8f5-e30cc9595c97)

Since it is connecting back to a domain I searched for “https:” and got a hit and that was the answer. My thought behind this since I know addresses typically start with HTTP or HTTPS I presumed that it was going to be one of those

![image](https://github.com/user-attachments/assets/e8459b8a-81d1-4474-9937-d08d1e5b9aa5)

Answer: https://ipinfo.io/json

### **Question 7**
The malware is looking for a particular path to connect back on. What is the full URL used for C2 of this malware?

We found the domain earlier. Continuing in the same file I tried searching for the domain and couldn’t I believe I will have to figure out how to deobfuscate this

After spending some time and research I came arcross this persons way of doing it.

I will follow his steps of downlaod the primo and sqlite3 modules. I ran the file in debug using node.js and it deobfuscated the script…. opening it up I found the network conenction (C2 domain) it makes a connection back to

![image](https://github.com/user-attachments/assets/2d2ee5ed-7137-43ab-82aa-d84eecb33eb9)

Answer: https://illitmagnetic.site/api/

### **Question 8**
The malware has a configured `user_id` which is sent to the C2 in the headers or body on every request. What is the key or variable name sent which contains the user_id value?

In the file searching for user_id I found the variable being duvet_user

Answer: duvet_user

### **Question 9**
The malware checks for a number of hostnames upon execution, and if any are found it will terminate. What hostname is it looking for that begins with `arch`?

Searching for arch I found it

![image](https://github.com/user-attachments/assets/536adcec-0880-4dec-9b65-d06f1557eeb5)

Answer: archibaldpc

### **Question 10**
The malware looks for a number of processes when checking if it is running in a VM; however, the malware author has mistakenly made it check for the same process twice. What is the name of this process?

Searching for ‘task’… I found an array of running tasks it looks for. The one it looks for twice if vmwaretray

Answer: vmwaretray

### **Question 11**
The malware has a special function which checks to see if `C:\Windows\system32\cmd.exe` exists. If it doesn’t it will write a file from the C2 server to an unusual location on disk using the environment variable `USERPROFILE`. What is the location it will be written to?

Here I found the cmd.exe and had ot do some searching before it hit me… I saw the environment being user profile but forgot on a windows system the global call for user profile is %USERPROFILE%

![image](https://github.com/user-attachments/assets/60358aff-7aaf-48cf-b4dd-146e620a7b82)

Answer: %USERPROFILE%\Documents\cmd.exe

### **Question 12**
The malware appears to be targeting browsers as much as Discord. What command is run to locate Firefox cookies on the system?

Searching for ‘Firefox’ I found a function that gets the Firefox cookies

![image](https://github.com/user-attachments/assets/c6776d6c-6045-4b31-9e6c-ab81c5b74547)

Answer: where /r . cookies.sqlite

### **Question 13**
To finally eradicate the malware, Forela needs you to find out what Discord module has been modified by the malware so they can clean it up. What is the Discord module infected by this malware, and what’s the name of the infected file?

Searching for ‘Discord’ I saw a function where it does the injection. On line 318 it starts in the ‘discord_desktop_core-1’ module and from there it infects in on line 319 with the index.js. i spent some time looking at this code as I am not fully aware of the discord folder structure so had to do a bunch of research on Discord myself before finishing this.

Answer: discord_desktop_core-1, index.js

I enjoyed this. It taught me how to setup FlareVM, and I was excited to use it. Super easy tool and I was able to rollback on my FlareVM base snapshot. It helped strengthened my static analysis and I learned how to deobfuscate this code which was super interesting. I wasn’t sure how to do it but seeing how someone else did it taught me what to look for which was a library
