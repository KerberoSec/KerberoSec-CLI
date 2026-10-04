
#Subscribers 

https://tryhackme.com/r/room/capabasics

https://www.youtube.com/watch?v=RxHnXrGoiBc

One of the challenges when analyzing potentially malicious software is that we risk our machine or environment being compromised when we run it unless we have a sandbox or a completely isolated environment where we can test all we want. Generally speaking, there are two types of analysis: <span style="color:#a0f958">dynamic analysis and static analysis.</span> This room will focus on conducting static analysis using a tool called CAPA.

<span style="color:#a0f958">CAPA (Common Analysis Platform for Artifacts) i</span>s a tool developed by the FireEye Mandiant team. It is designed to **identify the capabilities** present in executable files like Portable Executables (PE), ELF binaries, .NET modules, shellcode, and even sandbox reports. It does so by analyzing the file and applying a set of rules that **describe common behaviours**, allowing it to determine what the **program is capable of doing**, such as **network communication**, **file manipulation**, **process injection**, and many more.

The beauty of CAPA is that it encapsulates years of reverse engineering knowledge into an automated tool, making it accessible even to those who may not be experts in reverse engineering. This can be incredibly useful for analysts and security professionals, allowing them to quickly understand potentially malicious software's functionality without manually reverse engineering the code.

This tool is particularly useful in malware analysis and threat hunting, where understanding a binary's capabilities is crucial for incident response and defensive measures.

> [!info] Note that inside this VM, we have installed CAPA so you can get a feel for running the tool and experiment further with the different command parameters. However, it takes a long time to finish using the attached VM. Hence, we have pre-processed the reports such as the following:

- **cryptbot.txt**
- **cryptbot_vv.txt**
- **cryptbot_vv.json**

And placed them under the directory `C:\Users\Administrator\Desktop\capa.` Almost all the files we will use in this room are in the said directory.

In this task, we will see how to use CAPA.  Running the tool is as easy as 1..2..3.  First, open a PowerShell, noting that it might take a while before the prompt appears. Next is to make sure that you are in the correct directory (`C:\Users\Administrator\Desktop\capa`); then you need to run `capa` or `capa.exe`, then point to the binary, and that’s it!

In this example, we will use **cryptbot.bin;** please note that the results of this file will be discussed throughout the succeeding task.

After running the command, wait for the result, which may take several minutes. **We don't intend this to finish but rather to let you get a feel for running the tool**, so we suggest that you continue the task while CAPA is running or stop the processing. There are alternative ways to proceed with the analysis of the results. See the command below.

```powershell
PS C:\Users\Administrator\Desktop\capa> capa.exe .\cryptbot.bin
```

```
capa -h --help
capa -v --verbose
```

```
PS C:\Users\Administrator\Desktop\capa> Get-Content .\cryptbot.txt
```

```
What command-line option would you use if you need to check what other parameters you can use with the tool? Use the shortest format.

-h

What command-line options are used to find detailed information on the malware's capabilities? Use the shortest format.

-v

What command-line options do you use to find very verbose information about the malware's capabilities? Use the shortest format.

-vv

What PowerShell command will you use to read the content of a file?

GET-CONTENT

```

## CAPA results: part 1

```
What is the sha256 of cryptbot.bin?
ae7bc6b6f6ecb206a7b957e4bb86e0d11845c5b2d9f7a00a482bef63b567ce4c  

What is the Technique Identifier of Obfuscated Files or Information?
t1027

What is the Sub-Technique Identifier of Obfuscated Files or Information::Indicator Removal from Tools?
t1027.005

When CAPA tags a file with this MAEC value, it indicates that it demonstrates behaviour similar to, but not limited to, Activating persistence mechanisms?
launcher

When CAPA tags a file with this MAEC value, it indicates that the file demonstrates behaviour similar to, but not limited to, Fetching additional payloads or resources from the internet?
downloader

```

## capa: part 2

```
What serves as a catalogue of malware objectives and behaviours?
malware behavior catalogue

Which field is based on ATT&CK tactics in the context of malware behaviour?
objective

What is the Identifier of "Create Process" micro-behavior?
c0017

What is the behaviour with an Identifier of B0009?
Virtual Machine Detection

Malware can be used to obfuscate data using base64 and XOR. What is the related micro-behavior for this?
c0026
encode data

Which micro-behavior refers to "Malware is capable of initiating HTTP communications"?
HTTP Communication

```

## capa: part 3

```
Which top-level Namespace contains a set of rules specifically designed to detect behaviours, including obfuscation, packing, and anti-debugging techniques exhibited by malware to evade analysis?

anti-analysis

Which namespace contains rules to detect virtual machine (VM) environments? Note that this is not the TLN or Top-Level Namespace.

anti-vm/vm-detection

Which Top-Level Namespace contains rules related to behaviours associated with maintaining access or persistence within a compromised system? This namespace is focused on understanding how malware can establish and maintain a presence within a compromised environment, allowing it to persist and carry out malicious activities over an extended period.

persistence

Which namespace addresses techniques such as String Encryption, Code Obfuscation, Packing, and Anti-Debugging Tricks, which conceal or obscure the true purpose of the code?

obfuscation

Which Top-Level Namespace Is a staging ground for rules that are not quite polished?

nursery

```

## capa: part 4

```
What rule yaml file was matched if the Capability or rule name is check HTTP status code?

check-hhtp-status-code.yml

What is the name of the Capability if the rule YAML file is reference-anti-vm-strings.yml?

reference anti VM strings

Which TLN or Top-Level Namespace includes the Capability or rule name run PowerShell expression?

load-code

Check the conditions inside the check-for-windows-sandbox-via-registry.yml rule file from this link. What is the value of the API that ends in Ex is it looking for?

RegOpenKeyEx

```

## more info

```
Which parameter allows you to output the result of CAPA into a .json file?
-j

What tool allows you to interactively explore CAPA results in your web browser?
capa web explorer

Which feature of this CAPA Web Explorer allows you to filter options or results?
global search box

```

