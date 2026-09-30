All of the below challenges require the contestant to download the VM.  Currently the VM can be found at https://drive.google.com/open?id=1PRVmf8SQfFMajRUrXPgQ-KvKDY-fgDTQ (we'll need to host this somewhere else when it's time for the contest).

Users:  Root <password>  (will change when we finalize it all)
acsc2017 <password>

Problems:

1.  What is the current version of the Kernal currently installed?  
3.10.0-514.el7.x86_64  
uname -r  

2.  What version of perl is currently installed?  
 4:5.16.3-291.el7  
 yum list installed | grep perl  
 
 
3.  What is the MAC address of the VM  
00:0c:29:45:7a:34  
ifconfig  

4.  What time did yum update the last file?  Use the format MMM DD HH:MM:SS  
Jul 16 04:00:06  
grep Updated: /var/log/yum.log | tail -5   

6.  When running a program, what is the first file searched to execute the program?  
/usr/local/sbin  
echo $PATH  

9.  The flag is stored in the file called "readme" in the users home directory.  
boJ9jbbUNNfktd78OOpsqOltutMc3MY1  
cat ~/Documents/readme  

10.  The flag is stored in the file called "-" in the users home directory  
CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9  
cat ~/Documents/-   OR   cat ./-  

12.  The flag is stored in the file called "spaces in this filename" in the users home directory  
UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK  
cat spaces\ in\ this\ filename   

13.  The flag is stored in the file located in the "WhereIsIt" folder in the users home directory  
pIwrPrtPN36QITSp3EQaw936yaFoFgAB  
ls -l WhereIsIt  
cat .hidddenfile  

14.  The flag is stored in the human readable file located in the "WhichFile" folder int he users home directory  
koReBOKuIDDepwhWk7jZC0RTdopnAYKh  
ls -l WhichFile  
file *  
cat file18  

15.  the flag is located in the list.txt file next to the word "glistens"  
IEAMLoU7M05vlfNIhojUzeHn3KhsLsUJ  
cat list.txt | grep glistens  

16.  The flag is the only line in once.txt that is displayed once  
UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR  
cat once.txt | sort | uniq -u  

17.  The flag human readable text next to a "=" sign in eo.txt  
truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk  
strings eo.txt | grep =  

18.  The flag is the only line that has changed between passwrd.old and passwrd.new  
vjCAPvOdX6LFCWkuzTXQixnb4naLFsR  
diff passwrd.old passwrd.new  

19.  The flag is the only line in "MssingLetter" that doesn't contain a "z"  
7dHDa5wpPxnb4naLFsRT7gBxu81TCaeu  
cat MssingLetter | grep -v z  

20.  The flag is the piece of text that is displayed the most times in the third column of ListOfLists  
9SsF5MwhZUTB6FneH4lRmPXOwWteZ2s6  
cat ListOfLists | cut -d "," -f3 | sort | uniq -c | sort -n | tail -1  

21.  The flag is the character in the 10th position in the fourth column of ListOfLists that is displayed most often  
b  
cat ListOfLists | cut -d "," -f4 | cut -b 10 | sort | uniq -c | sort -n | tail -1  

22.  A program is running automatically every minute that gets the flag....find it  
3z96iN7exS00f8VyOYIOeEueZOVn631B  
cat /etc/cron.d/pushtheflag  
cat /usr/local/bin/pushtheflag.sh  
cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv  

22.  Inside the home directory there is a file that is a symbolic link.  The flag is the MD5 hash of the full path to the actual file.  
de1f35687ae6e88b2ed7d56aa83504b3  
ls -l  
echo -n "/usr/share/ctf/flag" | md5sum  

23.  The flag is the size (in bytes) of the physical harddrive for the machine  
17501782016  
lsblk --bytes  

24.  Somewhere within the /etc directory there is a file with the md5 hash of "8bd2ab7fa2f80c1af4c1ff05f85f0035".  What is the name of the file?  
ssh_config  
find /etc -type f -exec md5sum {} \; | grep 8bd2ab7fa2f80c1af4c1ff05f85f0035  

25.  The flag is located in a file called hidden_flag on a part of the drive this is not currently accessible  
acsc2017{IMountedThedPartition}  
lvdisplay  
mount /dev/cl/mypartition /mypartition  
cat /mypartition/hidden_flag  

