
# about armctf
armctf is a project that provides downloadable vulnerable virtual machines, rebuilt from amd64 to arm64. it's for users to practice ctf challenges on arm-based systems.  

vulnerable machines are sourced from vulnhub and hackmyvm. that's why full credit goes to the original creators.  

## why?
a week ago, a friend asked me if he can find vulnhub-like machines to import and solve on his macbook with m series chip. a few days later i thought about:  

1- not everyone wants to/should pay paid services to solve ctfs. vulnhub and hackmyvm are great resources.  
2- not everyone uses windows systems.  
3- utm'ing is much hassle.  
4- there is no good solution for this. (afaik)  
5- i already have macbook with m series chip.  

so i decided to do it as a side project.  

## important note
don't expect ctfs to be 1:1 in arm64 rebuild. expect some changes, especially suid binaries. some struggles and why they're not included:

1- buffer overflows  
_differ from x86._  

2- binary exploits  
_need source code, which is not possible._  

3- kernel exploits  
_vmware fusion is not supporting linux kernels below 4.idontremember.0. best i can offer something like dirtypipe (cve-2022-0847), copyfail (cve-2026-31431), dirtyfrag (cve-2026-43284, cve-2026-43500) which are available for kernel version 5.10.46-4._  

4- most of cves  
_no arm version, no party._  

5- windows machines  
_didn't even tried windows arm, but will do a research about it._  

## vm resources
all vms has 2 cpu and 2 ram configuration. you can lower these if you are out of resources.  

## downloading 
downloads handled by nextcloud* at germany server and [ctfmirror](https://ctfmirror.com/) at canada server. both servers are mine and download urls given as direct links. you can also download from the [armctf backblaze b2 bucket](https://f003.backblazeb2.com/file/armctfb2/index.html)** at netherlands server.  

*_if you can't reach nextcloud, you're either banned by nextcloud or i'm doing some maintenance. mail me if problem persists._  
**_i know that backblaze b2 buckets are blocked in türkiye, but don't know about another countries._  

## importing
ctfs are prepared on vmware fusion, so sticking with it is a good idea.

let's say, you downloaded `driftingblues3.7z` to `emre` folder.  

![](https://raw.githubusercontent.com/armctf/armctf/main/gitassets/2.jpg)

double click it to extract. (or `7z x driftingblues3.7z`)  

![](https://raw.githubusercontent.com/armctf/armctf/main/gitassets/1.jpg)

there is now `armctf.vmwarevm` machine folder. its name is `armctf.vmwarevm` because it's a template, which i build machines on original snapshot.  

![](https://raw.githubusercontent.com/armctf/armctf/main/gitassets/3.jpg)

open vmware fusion. follow `file > open` or `command + o`. browse your freshly extracted `armctf.vmwarevm` and open it. after importing, library entry is added.  

![](https://raw.githubusercontent.com/armctf/armctf/main/gitassets/4.jpg)
![](https://raw.githubusercontent.com/armctf/armctf/main/gitassets/5.jpg)
![](https://raw.githubusercontent.com/armctf/armctf/main/gitassets/6.jpg)
  
  
before starting the vm, don't forget to configure network. nat, cable bridge or wifi bridge.. your choice.  

![](https://raw.githubusercontent.com/armctf/armctf/main/gitassets/7.jpg)

let's roll!  

## contributing
since rebuilding ctfs are taking a lot of time, i'm actively seeking your help to expand this project.

if you decided to help, you can find base images below. root password is `asd`.  

debian 12 (kernel version 6.1.174-1)  
direct link: https://nc.zurrak.com/public.php/dav/files/CRrq4QDcej3Mazd  
sha256 checksum: `4b86f1d002b40f8f3dc717aa3097bb13420a5e61b067c738cf9005ca7ca456f5`  

debian 11 (kernel version 5.10.46-4) >>> it's for ctfs that has kernel exploiting step  
direct link: https://nc.zurrak.com/public.php/dav/files/pqxYTyTcrTf8jmi  
sha256 checksum: `9d57faa1b4b3c6173bab32a4d999e37200804c59582ff99f27d2af72e8840b60`  

you can always contact me from [here](https://armctf.com/contact.html).

