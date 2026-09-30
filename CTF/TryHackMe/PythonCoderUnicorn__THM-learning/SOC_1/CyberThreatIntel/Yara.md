- https://tryhackme.com/room/yara

#SecurityOperations #ThreatIntel 

Yara can identify information based on both binary and textual patterns, such as hexadecimal and strings contained within a file.

Yara rules are frequently written to determine if a file is malicious or not, based upon the features: or patterns: it presents.

```
10.10.205.61
cmnatic : yararules!
ssh Port 22
```

## Intro 

using a Yara rule requires 2 arguments 
- the rule file we create
- name of file/ directory/ process ID to use the rule for

every rule must have a name and condition

for "myrule.yar" ` yara myrule.yar directoryName/ `

```
touch somefile
touch myfirstrule.yar
nano myfirstrule.yar

rule examplerule {
	condition: true
}

# test the yara rule
yara myfirstrule.yar somefile   # returns file name if it exists

```

##  Expand rules

- https://yara.readthedocs.io/en/stable/writingrules.html

META
- descriptive info of the rule, can use `desc` to summarize what your rule checks for
STRINGS
- use strings to search for specific text or hexadecimal in files/ programs
```yaml
rule helloworld_checker{
	strings:
		$hello_world = "Hello World!"
		$hello_world_lowercase = "hello world"
		$hello_world_uppercase = "HELLO WORLD"

	condition:
		any of them
}
```

conditionals
```yaml
rule helloworld_checker{
	strings:
		$hello_world = "Hello World!"

	condition:
        #hello_world <= 10
		$hello_world and filesize < 10KB 

}
```

## Yara modules

Cuckoo

Cuckoo Sandbox is an automated malware analysis environment. This module allows you to generate Yara rules based upon the behaviours discovered from Cuckoo Sandbox. As this environment executes malware, you can create rules on specific behaviours such as runtime strings and the like.
- https://cuckoosandbox.org/

Knowing how to create custom Yara rules is useful, but luckily you don't have to create many rules from scratch to begin using Yara to search for evil. There are plenty of GitHub [resources](https://github.com/InQuest/awesome-yara) and open-source tools (along with commercial products) that can be utilized to leverage Yara in hunt operations and/or incident response engagements.

LOKI

LOKI is tool for indicators of compromise
- file name IOC check
- Yara rule check
- Hash check
- C2 back connect check
- https://github.com/Neo23x0/Loki/blob/master/README.md

THOR lite is multi platform IOC and Yara scanner

FENRIR
- https://github.com/Neo23x0/Fenrir

YAYA 
_yet another yara automation_
runs only on Linux (on THM VM)

## LOKI

As a security analyst, you may need to research various threat intelligence reports, blog postings, etc. and gather information on the latest tactics and techniques used in the wild, past or present. Typically in these readings, IOCs (hashes, IP addresses, domain names, etc.) will be shared so rules can be created to detect these threats in your environment, along with Yara rules.

```
cd tools/
	Loki yarGen
cd Loki/
python loki.py -h

cd loki/signature-base/yara/

cd ~/suspicious-files/file1/
python ~/tools/Loki/loki.py

```

```
Scan file 1. Does Loki detect this file as suspicious/malicious or benign?

suspicious

What Yara rule did it match on?

webshell_metaslsoft

What does Loki classify this file as?

web shell

Based on the output, what string within the Yara rule did it match on?

str1

What is the name and version of this hack tool?

b374k 2.2 

Inspect the actual Yara file that flagged file 1. Within this rule, how many strings are there to flag this file?

cd ~/tools/Loki/signature-base/yara 
ls | grep webshell

5 files, nano thor-webshells.yar = 1

file2 = benign
nano file2/1ndex.php
b374k 3.2.3

```

## create Yara rules

```
strings 1ndex.php | wc -l

cd ~/tools/yarGen/
python3 yarGen.py --update

python3 yarGen.py -m /home/cmnatic/suspicious-files/file2 --excludegood -o /home/cmnatic/suspicious-files/file2.yar

```

A brief explanation of the parameters above:

- `-m` is the path to the files you want to generate rules for
- `--excludegood` force to exclude all goodware strings (_these are strings found in legitimate software and can increase false positives_)
- `-o` location & name you want to output the Yara rule

**Further Reading on creating Yara rules and using yarGen**:

- [https://www.bsk-consulting.de/2015/02/16/write-simple-sound-yara-rules/](https://www.bsk-consulting.de/2015/02/16/write-simple-sound-yara-rules/)  
- [https://www.bsk-consulting.de/2015/10/17/how-to-write-simple-but-sound-yara-rules-part-2/](https://www.bsk-consulting.de/2015/10/17/how-to-write-simple-but-sound-yara-rules-part-2/)
- [https://www.bsk-consulting.de/2016/04/15/how-to-write-simple-but-sound-yara-rules-part-3/](https://www.bsk-consulting.de/2016/04/15/how-to-write-simple-but-sound-yara-rules-part-3/)

```
  
From within the root of the suspicious files directory, what command would you run to test Yara and your Yara rule against file 2?

yara 1ndex.php file2/file2.yar

flagged= yay

  
Test the Yara rule with Loki, does it flag file 2? (Yay/Nay)
yay

zepto

```

- https://medium.com/@haircutfish/tryhackme-yara-room-d279ccb5cbb3
- 

## Valhalla

**Valhalla** is an online Yara feed created and hosted by [Nextron-Systems](https://www.nextron-systems.com/valhalla/) 
we should denote that we can conduct searches based on a keyword, tag, ATT&CK technique, sha256, or rule name.

- rule name
- rule description
- rule date
- ref link

```
Enter the SHA256 hash of file 1 into Valhalla. Is this file attributed to an APT group? (Yay/Nay)

sha156sum file1/ind3x.php
5479f8cd1375364770df36e5a18262480a8f9d311e8eedb2c2390ecb233852ad

yay

file2/1ndex.php

  
Do the same for file 2. What is the name of the first Yara rule to detect file 2?

53fe44b4753874f079a936325d1fdc9b1691956a29c3aaf8643cdbd49f5984bf

webshell_b374k_rule1

  
Examine the information for file 2 from Virus Total (VT). The Yara Signature Match is from what scanner?

thor apt scanner

  
Enter the SHA256 hash of file 2 into Virus Total. Did every AV detect this as malicious? (Yay/Nay)

33/61 vendors = malicious = nay

  
Besides .PHP, what other extension is recorded for this file?

.txt,sys, exe, html = exe

  
What JavaScript library is used by file 2?

https://github.com/b374k/b374k
index.php

*****
zepto

Is this Yara rule in the default Yara file Loki uses to detect these type of hack tools? (Yay/Nay)

nay

```

