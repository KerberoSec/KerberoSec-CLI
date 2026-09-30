# Dancing
> **Labs: Startin Point**

> **Startin Point Tier: 0**

> **Box difficulty: Very Easy**

## Starting Point Labs

Learn the basics of Penetration Testing: Starting Point is a good place to start if you're new to hack the box or in general just to pen testing. This will get you though the beginning and help you out with tips. These machines/boxes in the start point labs are actually very fun to do. So if you just want to try out what it's all about then try at least the first box.

## Machine: Dancing
> Tags: Windows | Wrong Permission

> Has walkthough pdf available

### CONNECT
Just create a connection to the VPN, remember that this is to a special "starting point" vpn so dont just connect to EU1-Free etc. Wont work. To continue you need to be connected.

### Start VM
Just hit Start VM button

### TASK 1
**Question**
> What does the 3-letter acronym SMB stand for?

**How did i find the information ?**
> Google? But you should know this

**Answer**
```
server message block
```

### TASK 2
**Question**
> What port does SMB use to operate at?

**How did i find the information ?**
> Google? But you should know this. But its funny as SMB can operate on other ports as well (netbios/rpc). I must admit i tried 135,138,139,445 as i could not remember the old ports and 445 is for windows (And i forgot for a moment that this was a windows box!)

**Answer**
```
445
```

### TASK 3
**Question**
> What network communication model does SMB use, architecturally speaking?

**How did i find the information ?**
> Google? But you should know this

**Answer**
```
client-server model
```

### TASK 4
**Question**
> What is the service name for port 445 that came up in our nmap scan?

**How did i find the information ?**
> Shown in nmap scan output

**Answer**
```
microsoft-ds
```

### TASK 5
**Question**
> What is the tool we use to connect to SMB shares from our Linux distribution?

**How did i find the information ?**
> Google? But you should know this

**Answer**
```
smbclient
```

### TASK 6
**Question**
> What is the `flag` or `switch` we can use with the SMB tool to `list` the contents of the share?

**How did i find the information ?**
> Google? But you should know this. You can also just run the command `smbclient` and look at the output. You can also use the man page `man smbclient`.

**Answer**
```
-L
```

### TASK 7
**Question**
> What is the name of the share we are able to access in the end?

**How did i find the information ?**
> Should be found via the `smbclient` command

**Answer**
```
WorkShares
```

### TASK 8
**Question**
> What is the command we can use within the SMB shell to download the files we find?

**How did i find the information ?**
> First you need to connect to the service with `smbclient //ip/share` Once you are in the smb shell you can type `help`

**Answer**
```
get
```

### SUBMIT FLAG
**Question**
> Submit root flag

**How did i find the information ?**
> Via smb shell i looked over the different folders and found flag.txt that i then downloaded

**Answer**
```
HTB{5f61c10dffbc77a704d76016a22f1664}
```
