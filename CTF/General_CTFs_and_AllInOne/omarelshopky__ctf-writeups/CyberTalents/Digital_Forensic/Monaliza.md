# Challenge Name:
 [*Monaliza*](https://cybertalents.com/challenges/forensics/monaliza)
 
# Challenge Description
We cannot identify this suspicious user behavior, but we know he is a big fan of Monaliza

Link: [https://hubchallenges.s3-eu-west-1.amazonaws.com/Forensics/monaliza.7z](https://hubchallenges.s3-eu-west-1.amazonaws.com/Forensics/monaliza.7z)

## Answer
* Download the file
* Unzip it as follow
```sh
7z e monaliza.7z
```
* We want to know file type so run file then cat to see it's content
```sh
file monaliza.mem
cat monaliza.mem
```
* There are alot of lines in this file we can't see it all of course
* Grep specific pattern from this file content
```sh
strings monaliza.mem | grep "Flag{"
```
* If we try this flag the website say that it is wrong so, use Volatility to scan memory image
* For performing analysis using Volatility we need to first set a profile to tell Volatility what operating system the dump came from
```sh
./vol.py imageinfo -f monaliza.mem
```
* View all running process when the memory dump was taken
```sh
./vol.py --profile=WinXPSP2x86 pslist -f ~/Downloads/monaliza.mem 
```
* He was using microsoft paint during memory image so lets take dump to this process to scan it
```sh
./vol.py --profile=WinXPSP2x86 -f ~/Downloads/monaliza.mem memdump -p 800 -D .
```
* Change file extintion from dmp to data so we can open it with gimp
```sh
mv 800.dmp 800.data
```
* Use gimp to open the file
```sh
gimp 800.data
```
* Change offset, width and height until you see readable text
> Offset = 65913
> Width = 737
> Height = 6446
* You got the Flag

 ## The Flag
 > Flag{P@!nting_i5_4wes0m3}
