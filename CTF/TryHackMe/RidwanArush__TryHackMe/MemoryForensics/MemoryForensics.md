#  Memory Forensics: Afsomali

![TryHackMe](https://assets.tryhackme.com/img/banners/default_tryhackme.png)

# Horudhac
Tani, waa faahfaahin kooban oo ku saabsan qolka [**Memory Forensics**](https://tryhackme.com/room/memoryforensics) ee **TryHackMe** 

![TryHackMe](https://tryhackme-images.s3.amazonaws.com/room-icons/2f9dce95cf880c6d070d4a7ac92d4cfb.png)

# Tusmo
- Task 1  Introduction
- Task 2  Login
- Task 3  Analysis
- Task 4  TrueCrypt
- Tixraac erayada

# Diyaargarow
> Soo dajiso dhamaan feylasha

- [x] Snapshot14.vmem
- [x] Snapshot19.vmem 
- [x] Snapshot6.vmem
- [ ] Ku shubo  `Volatility` Comuterkaaga , haddii uusan kuugu jirin.

## Task 1  Introduction

* ######	Have understood the task and can continue to the questions!

>: HAAAAAHEEEEY!

## Task 2  Login

* ###### What is John's password?

Ugu horeyn si aad xog u hesho, isla markaana wax badan u ogaato,  adeegso `imageinfo` sidaan hoos ku xusan:

	volatility -f Snapshot6.vmem imageinfo

Falcelis:	
``` Bash:
	Volatility Foundation Volatility Framework 2.6.1
	INFO    : volatility.debug    : Determining profile based on KDBG search...
			  Suggested Profile(s) : Win7SP1x64, Win7SP0x64, Win2008R2SP0x64, Win2008R2SP1x64_24000, Win2008R2SP1x64_23418, Win2008R2SP1x64, Win7SP1x64_24000, Win7SP1x64_23418
						 AS Layer1 : WindowsAMD64PagedMemory (Kernel AS)
						 AS Layer2 : FileAddressSpace (/home/hiigsi/Downloads/Snapshot6.vmem)
						  PAE type : No PAE
							   DTB : 0x187000L
							  KDBG : 0xf80002c4a0a0L
			  Number of Processors : 1
		 Image Type (Service Pack) : 1
					KPCR for CPU 0 : 0xfffff80002c4bd00L
				 KUSER_SHARED_DATA : 0xfffff78000000000L
			   Image date and time : 2020-12-27 06:20:05 UTC+0000
		 Image local date and time : 2020-12-26 22:20:05 -0800
```

**Fiiro gaar ah** 
Si joogto ah, ayaan ugu adegsaneynaa:  `Win7SP1x64`  

Si aan u helno qarsoodiga John, waa in aan marka hore **Xash** kala soo baxnaa, annagoo adeegsaneyna `hashdump` sidaan hoos ku xusan:

				volatility -f Snapshot6.vmem --profile Win7SP1x64 hashdump --output-file=hash
Falcelis:
```
vol.py -f Snapshot6.vmem --profile Win7SP1x64 hashdump --output-file=hash
Volatility Foundation Volatility Framework 2.6.1
Outputting to: hash
```

Waxaa sameysmay fayl  magaciisu yahay `hash` oo ay ku jiraan dhamaan xashashka qosoodiyaada computerkaas. _Talo: Si aan waqtiga u dhaqaaleysano, reebo xaska John kaliya, inta kalena iska tir tir  :)_

Xash:
```Bash:
└─$ cat hash         
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
John:1001:aad3b435b51404eeaad3b435b51404ee:47fbd6536d7868c873d5ea455f2fc0c9:::
HomeGroupUser$:1002:aad3b435b51404eeaad3b435b51404ee:91c34c06b7988e216c3bfeb9530cabfb:::
```

Haddaba adeegso `John the Ripper` si aan u jabino. 

		john hash --wordlist=/usr/share/wordlists/rockyou.txt --format=NT

Falcelis:	
```Bash:
	Using default input encoding: UTF-8
	Loaded 1 password hash (NT [MD4 128/128 SSE2 4x3])
	Warning: no OpenMP support for this hash type, consider --fork=2
	Press 'q' or Ctrl-C to abort, almost any other key for status
	charmander999    (John)
	1g 0:00:00:01 DONE (2021-08-20 23:41) 0.8474g/s 7780Kp/s 7780Kc/s 7780KC/s charmcez..charmaise
	Use the "--show --format=NT" options to display all of the cracked passwords reliably
	Session completed 
```

> **Warcelin**: char******999  

## Task 3  Analysis

### 3.1
* ###### When was the machine last shutdown?

Si aan u helno, goorta uu John damiyey computerkiisa waxaan adeegsaneynaa `shutdowntime`:

		volatility -f Snapshot19.vmem shutdowntime --profile=Win7SP1x64
	
Falcelis:
```Bash: 
	Volatility Foundation Volatility Framework 2.6.1
	Registry: SYSTEM
	Key Path: ControlSet001\Control\Windows
	Key Last updated: 2020-12-27 22:50:12 UTC+0000
	Value Name: ShutdownTime
	Value: 2020-12-27 22:50:12 UTC+0000
```

> **Warcelin**:	2020-**-** **:**:12

### 3.2
* ###### What did John write?

Haddaba, si aan u helno waxa uu John qorey, waa in markaan aan adeegsanaa `consoles`:

		volatility -f Snapshot19.vmem consoles --profile=Win7SP1x64
	
Falcelis:
```Bash:
	Volatility Foundation Volatility Framework 2.6.1
	**************************************************
	ConsoleProcess: conhost.exe Pid: 2488
	Console: 0xffa66200 CommandHistorySize: 50
	HistoryBufferCount: 1 HistoryBufferMax: 4
	OriginalTitle: %SystemRoot%\System32\cmd.exe
	Title: Administrator: C:\Windows\System32\cmd.exe
	AttachedProcess: cmd.exe Pid: 1920 Handle: 0x60
	----
	CommandHistory: 0x21e9c0 Application: cmd.exe Flags: Allocated, Reset
	CommandCount: 7 LastAdded: 6 LastDisplayed: 6
	FirstCommand: 0 CommandCountMax: 50
	ProcessHandle: 0x60
	Cmd #0 at 0x1fe3a0: cd /
	Cmd #1 at 0x1f78b0: echo THM{You_found_me} > test.txt
	Cmd #2 at 0x21dcf0: cls
	Cmd #3 at 0x1fe3c0: cd /Users
	Cmd #4 at 0x1fe3e0: cd /John
	Cmd #5 at 0x21db30: dir
	Cmd #6 at 0x1fe400: cd John
	----
	Screen 0x200f70 X:80 Y:300
	Dump:      
	C:\>cd /Users     
	C:\Users>cd /John    
	The system cannot find the path specified.     
	C:\Users>dir            
	 Volume in drive C has no label.
	 Volume Serial Number is 1602-421F                
	 Directory of C:\Users                                 
	12/27/2020  02:20 AM    <DIR>          .   
	12/27/2020  02:20 AM    <DIR>          ..  
	12/27/2020  02:21 AM    <DIR>          John 
	04/12/2011  08:45 AM    <DIR>          Public 
				   0 File(s)              0 bytes        
				   4 Dir(s)  54,565,433,344 bytes free   
	C:\Users>cd John                         
	C:\Users\John>
```

> **Warcelin**:	You_*****_me

## Task 4  TrueCrypt
* ###### What is the TrueCrypt passphrase?

Halkan, waxaan adeegsaneynaa `truecryptpassphrase` si aan u helno eray qasoodiga ah, sidaan hoos ku xusan:

		volatility -f Snapshot14.vmem truecryptpassphrase --profile=Win7SP1x64
	
Falcelis:
```Bash:
	Volatility Foundation Volatility Framework 2.6.1
	Found at 0xfffff8800512bee4 length 11: forgetmenot
```

> **Warcelin** for*****not

#### Tixraac erayada:

|#|Eray|Ujeedo|
|----|----|----|
|1.|Falcelis|Output|
|2.|Qarsoodi|Password|
|3.|Xash|Hash|
|4.|Gal|Folder|
|5.|Dajis|Download|
|6.|KuShub|Install|
|7.|jabis|Crack|

