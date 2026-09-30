#Subscribers 
https://tryhackme.com/room/velociraptorhp

**Velociraptor**

In this room, we will explore Rapid7's newly acquired tool known as [Velociraptor](https://www.rapid7.com/blog/post/2021/04/21/rapid7-and-velociraptor-join-forces/). 

Per the official Velociraptor [documentation](https://docs.velociraptor.app/docs/overview/), "_Velociraptor is a unique, advanced open-source endpoint monitoring, digital forensic and cyber response platform._ _It was developed by Digital Forensic and Incident Response (DFIR) professionals who needed a powerful and efficient way to hunt for specific artifacts and monitor activities across fleets of endpoints. Velociraptor provides you with the ability to more effectively respond to a wide range of digital forensic and cyber incident response investigations and data breaches_".

This tool was created by Mike Cohen, a former Google employee who worked on tools such as [GRR](https://github.com/google/grr) (GRR Rapid Response) and [Rekall](https://github.com/google/rekall) (Rekall Memory Forensic Framework). Mike joined Rapid7's Detection and Response Team and continues to work on improving Velociraptor. At the date of this entry, the latest release for Velociraptor is [0.6.3](https://www.rapid7.com/blog/post/2022/02/03/velociraptor-version-0-6-3-dig-deeper-with-more-speed-and-scalability/).

**Learning Objectives**

- Learn what is Velociraptor
- Learn how to interact with agents and create collections
- Learn how to interact with the virtual file system
- Learn what is VQL and how to create basic queries
- Use Velociraptor to perform a basic hunt

**Prerequisites**

- [Windows Forensics 1](https://tryhackme.com/room/windowsforensics1)
- [Windows Forensics 2](https://tryhackme.com/room/windowsforensics2)
- [KAPE](https://tryhackme.com/room/kape)

## deployment

Velociraptor is unique because the Velociraptor executable can act as a **server** or a **client** and it can run on **Windows**, **Linux**, and **MacOS**.  Velociraptor is also compatible with cloud file systems, such as **Amazon EFS** and **Google Filestore**. 

Velociraptor can be deployed across thousands, even tens of thousands, client endpoints and runs surprisingly well for an open-source product. 

In this task, we will **NOT** go into detail about how to deploy Velociraptor as a server and agent architecture in an environment. Rather, in the attached virtual machine, you will run the commands to start the first Velociraptor executable as a server and execute a second Velociraptor executable to run as an agent. This is possible thanks to WSL ([Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/about)). This will simulate Velociraptor running as a server in Linux (Ubuntu) and as a client running Windows. WSL (Windows Subsystem for Linux) allows us to run a Linux environment in a Windows machine without the need for a virtual machine.

```
cat command.txt
./velociraptor-v0.5.8-linux-amd64 --config server.config.yaml frontend -v

go to 127.0.0.1

username: thmadmin
password: tryhackme
```

If you wish to interact and deploy Velociraptor locally in your lab, then **[Instant Velociraptor](https://docs.velociraptor.app/docs/deployment/#instant-velociraptor)** is for you. Instant Velociraptor is a fully functional Velociraptor system that is deployed only to your local machine.

Refer to the official [documentation](https://docs.velociraptor.app/docs/deployment/) for more information on deploying Velociraptor as a server/client infrastructure or as Instant Velociraptor.

https://docs.velociraptor.app/docs/deployment/#instant-velociraptor

```
# launch on windows
Velociraptor.exe gui
```

## inspecting clients

These links are specific to client endpoints and will become active once the analyst interacts with these endpoints within the Velociraptor UI. 

Let's add a client to Velociraptor. Remember, since the attached VM is running Windows Subsystem for Linux (WSL), the Velociraptor server is running in Ubuntu, but the client will be Windows. 

Run the commands for 'Add Windows as a client (CMD)' from the commands.txt on the desktop.

To see the client and interact with it, click on the `magnifying glass` with an empty search query (no text in the search bar) or click `Show All`.

﻿Click on the agent to bring you to a semi-detailed view. By default, the view shown is the **overview** for the client. ﻿

**Overview**

In this view, the analyst (you) will see additional information about the client. The additional details are listed below:

- **Client ID**
- **Agent Version**
- **Agent Name**
- **Last Seen At**
- **Last Seen IP**
- **Operating System**
- **Hostname**
- **Release**
- **Architecture**
- **Client Metadata**

**VQL Drilldown**  
In this view, there is additional information about the client, such as Memory and CPU usage over 24 hours timespan, the Active Directory domain if the client is a domain-joined machine and the active local accounts for the client.  

The data is represented in two colors in the Memory and CPU footprint over the past 24 hours.
- **Orange**: Memory usage
- **Blue**: CPU usage

**Shell**

With the shell, commands can be executed remotely on the client machine. Commands can be run in  **PowerShell**, **CMD**, **Bash**, or **VQL**. Depending on the target operating system will determine which the analyst will pick. For example, CMD will not be a viable option if the client machine is running Linux. 

It's straightforward, choose one of the options to run the command in and click `Launch`. 

In the example below, the command `whoami` was executed with PowerShell. The command results are not immediately visible, and the **eyeball** icon needs to be toggled to see the command results.

**Collected**

Here the analyst will see the results from the commands executed previously from Shell. Other actions, such as interacting with the **VFS** (**Virtual File System**), will appear here in Collected. VFS will be discussed later in upcoming tasks.

Clicking on any FlowId will populate the bottom pan with additional details regarding the information collected for that artifact or collection.

The questions in this task will help nudge you to navigate throughout the output returned for each shell execution (e.i. whoami).

In the next task, we'll explore how to create a new collection and review the results in Collected. 

**Interrogate**

Per the [documentation](https://docs.velociraptor.app/docs/gui/clients/), "Interrogate operation. Interrogation normally occurs when the client first enrolls, but you can interrogate any client by clicking the Interrogate button".

To confirm this, click `Interrogate`. Now navigate back to Collected. You will notice that the **Artifact Collection** is **Generic. Client.Info**, which is an additional collection on the list. The first artifact collection in the list is indeed **Generic.Client.Info**. This is the same information displayed under **VQL Drilldown**.  

Refer to the official Velociraptor documentation titled [Inspecting Clients](https://docs.velociraptor.app/docs/gui/clients/) for additional information.

```
What is the hostname for the client?

THM-VELOCIRAPTOR.eu-west-1.compute.internal

What is listed as the agent version?

2021-04-11T22:11:10Z

In the Collected tab, what was the VQL command to query the client user accounts?

LET Generic_Client_Info_Users_0_0=SELECT Name, Description, Mtime AS LastLogin FROM Artifact.Windows.Sys.Users()

In the Collected tab, check the results for the PowerShell whoami command you executed previously. What is the column header that shows the output of the command?

Stdout

In the Shell, run the following PowerShell command Get-Date. What was the PowerShell command executed with VQL to retrieve the result?

powershell -ExecutionPolicy Unrestricted -encodedCommand ZwBlAHQALQBkAGEAdABlAA==

```

## creating new collection

There will be 5 stages in this process.

Select Artifacts
Configure Parameters
Specify Resources
Review
Launch

```
Earlier you created a new artifact collection for Windows.KapeFiles.Targets. You configured the parameters to include Ubuntu artifacts. Review the parameter description for this setting. What is this parameter specifically looking for?

Ubuntu on Windows Subsystem for Linux

Review the output. How many files were uploaded?

20

```

## VFS (virtual file system)

```
Which accessor can access hidden NTFS files and Alternate Data Streams? (**format: xyz accessor)**

ntfs accessor

Which accessor provides file-like access to the registry? (**format: xyz accessor**)

registry accessor

What is the name of the file in $Recycle.Bin?

desktop.ini

There is hidden text in a file located in the Admin's Documents folder. What is the flag?

THM{VkVMT0NJUkFQVE9S}

```

## VQL 

Per the official [documentation](https://docs.velociraptor.app/docs/overview/#vql---the-velociraptor-difference), "_Velociraptor’s power and flexibility comes from the Velociraptor Query Language (VQL). VQL is a framework for creating highly customized artifacts, which allow you to collect, query, and monitor almost any aspect of an endpoint, groups of endpoints, or an entire network. It can also be used to create continuous monitoring rules on the endpoint, as well as automate tasks on the server_".

With many tools that you will encounter in your SOC career, some tools may have their own query language. For example, in Splunk its SPL ([Search Processing Language](https://docs.splunk.com/Splexicon:SPL#:~:text=abbreviation,functions%2C%20arguments%2C%20and%20clauses.)), Elastic has KQL ([Kibana Query Language](https://www.elastic.co/guide/en/kibana/current/kuery-query.html)), Microsoft Sentinel has KQL [too] ([Kusto Query Language](https://docs.microsoft.com/en-us/azure/sentinel/kusto-overview)), etc. 

VQL is the meat and potatoes of Velociraptor. Throughout each task thus far, unbeknownst to you, you have been interacting with VQL. 

To jog your memory, navigate back to **Collected** and inspect **Generic.Client.Info**. Click the Requests tab in the bottom pane. See below image.

Artifacts

Before wrapping up this task, let's touch on **Artifacts** (or VQL Modules). 

Per the [documentation](https://docs.velociraptor.app/docs/vql/artifacts/), "_Velociraptor allows packaging VQL queries inside mini-programs called Artifacts. An artifact is simply a structured YAML file containing a query, with a name attached to it. This allows Velociraptor users to search for the query by name or description and simply run the query on the endpoint without necessarily needing to understand or type the query into the UI_". 

This was a **BRIEF** intro to VQL. It is recommended to review the official [documentation](https://docs.velociraptor.app/docs/vql/) thoroughly to fully understand it and how you can wield its power to execute advanced queries. Also, reference the [VQL Reference](https://docs.velociraptor.app/vql_reference/) and [Extending VQL](https://docs.velociraptor.app/docs/extending_vql/) for further information on VQL.

```
What is followed after the **SELECT** keyword in a standard VQL query?

Column Selectors

What goes after the **FROM**  keyword?

VQL Plugin

What is followed by the **WHERE** keyword?

Filter expression

What can you type in the Notepad interface to view a list of possible completions for a keyword?

?

What plugin would you use to run PowerShell code from Velociraptor?

execve()

```

## forensics analysis VQL plugins

Per the [documentation](https://docs.velociraptor.app/docs/forensic/), "_VQL is not useful without a good set of plugins that make DFIR work possible. Velociraptor’s strength lies in the wide array of VQL plugins and functions that are geared towards making DFIR investigations and detections effective_".

There is a lot of information to cover here regarding VQL plugins. This task aims to give you enough information regarding these plugins so you can construct your VQL query to hunt for artifacts of a popular exploit known as Printnightmare. 

At the date of the entry of this content, below are the categories surrounding forensic analysis:

- **Searching Filenames**
- **Searching Content**
- **NTFS Analysis**
- **Binary Parsing**
- **Evidence of Execution**
- **Event Logs**
- **Volatile Machine State**

Have a skim through **Searching Filenames** and **NTFS Analysis** to provide a solid brain dump to prep you for the questions below and for the next task.

As per [Velociraptor's documentation](https://docs.velociraptor.app/docs/forensic/ntfs/#parsing-the-mft) on NTFS analysis,

```
What plugin would be used for parsing the Master File Table (MFT)?

parse_mft(filename="C:/$MFT", accessor="ntfs")
parse_mft

What filter expression will ensure that no directories are returned in the results?

IsDir

```

## hunt for nightmare

```
What is the name in the Artifact Exchange to detect Printnightmare?

Windows.Detection.PrintNightmare

Per the above instructions, what is your Select clause? (no spaces after commas)

SELECT "C:/" + FullPath AS Full_Path,FileName AS File_Name,parse_pe(file="C:/" + FullPath) AS PE

What is the name of the DLL that was  placed by the attacker?

nightmare.dll

What is the PDB entry?

C:\Users\caleb\source\repos\nightmare\x64\Release\nightmare.pdb

```

https://motasem-notes.net/complete-beginner-guide-to-velociraptor-digital-forensics-tryhackme/

![[Pasted image 20250317162234.png]]
184 points

