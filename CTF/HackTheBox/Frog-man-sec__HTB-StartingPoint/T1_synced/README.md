## Synced HackTheBox
#### About This Room
If you are having truble maintaining files and folder between your VPS and local machine, then this Lab will help you with that. It's all about Remot Synchronizing files/ Folders between 2 host. Really cool. 

**`Expertise:`**
- Nmap
- rsync

----

#### Network Enum
`nmap -v -A -sV --privileged -T4 10.129.19.189 -p- -O -sC`

**`Result`**
|PORT|STATE|SERVICE|VERSION|
|---|---|---|---|
|873/tcp|open|rsync|protocol version 31|

we have something called rsync. Upon googling, I've come to know that, this particuler command is used to sync files/ folders between two remote host.

Now it's time to get into the remote host and see what it has.

#### Getting in with Rsync
Luckly we have `rsync` command already in our kali machine. no need to install it.

I googled out this command but got nothing special. So I used the `help` command for it: `rsync -h`

I got one command like this:
```bash
rsync [OPTION]... SRC [SRC]... rsync://[USER@]HOST[:PORT]/DEST
```
what I did basically is view what we have here. For that I've used the following command:
```bash
rsync -vv rsync://10.129.19.189:873/

## result
opening tcp connection to 10.129.19.189 port 873
sending daemon args: --server --sender -vvde.LsfxCIvu . /  (5 args)
public          Anonymous Share
```
We have a directory called **`public`**. Let's see what's inside.
```bash
rsync -vv rsync://10.129.19.189:873/public/

## Result

drwxr-xr-x          4,096 2022/10/25 04:02:23 .
-rw-r--r--             33 2022/10/25 03:32:03 flag.txt
```
we have a file called `flag.txt` which is our flag obviously.

Let's bring that thing to our machine
```bash
rsync -vv -a rsync://10.129.19.189:873/public/flag.txt ./
```
This will bring the file to our local directory (present working directory).
