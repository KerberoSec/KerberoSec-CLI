# Investigating with Splunk

**Link:** [https://tryhackme.com/room/itsybitsy](https://tryhackme.com/room/investigatingwithsplunk)

**Difficulty:** Medium

**Category:** Event Analysis

**Tools Used:** Splunk

-----

SOC Analyst Johny has observed some anomalous behaviours in the logs of a few windows machines. It looks like the adversary has access to some of these machines and successfully created some backdoor. His manager has asked him to pull those logs from suspected hosts and ingest them into Splunk for quick investigation. Our task as SOC Analyst is to examine the logs and identify the anomalies.

To learn more about Splunk and how to investigate the logs, look at the rooms splunk101 and splunk201.

Room Machine

Before moving forward, deploy the machine. When you deploy the machine, it will be assigned an IP Machine IP: MACHINE_IP. You can visit this IP from the VPN or the Attackbox. The machine will take up to 3-5 minutes to start. All the required logs are ingested in the index main.

<details close>
<summary> <h1>  Investigating with Splunk</h1></summary>
<be>

**Q1: How many events were collected and Ingested in the index main?**

In the App panel click Search & Reporting then search for `index=main`

![Screenshot from 2023-08-17 20-43-55](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/49591baf-6572-47bf-8710-71520f360093)

**Q2: On one of the infected hosts, the adversary was successful in creating a backdoor user. What is the new username?**

Search for Event ID 4720. Use the query `index=main EventID=4720`. This event ID, 4720, is recorded when a new user account is created in Active Directory.

![Screenshot from 2023-08-17 21-46-34](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/c237ec72-262b-4593-a229-20772193cd15)

**Q3: On the same host, a registry key was also updated regarding the new backdoor user. What is the full path of that registry key?**

Just like the way we identified the logged event for new user creation, we can also uncover events associated with registry updates. By modifying the event ID from our previous search to 13, we'll be able to view all the registry updates within the index.
`index=main EventID=4720 username` Replace `username` by the username we found in quetion one.

![Screenshot from 2023-08-17 22-22-28](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/46b20e3f-1c66-468d-a013-d3c8cc364f34)

**Q4: Examine the logs and identify the user that the adversary was trying to impersonate.**

We can probably guess the answer to this.

![Screenshot from 2023-08-17 22-36-40](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/e5d6e681-4420-45a9-88a6-be0ba3059250)

**Q5: What is the command used to add a backdoor user from a remote computer?**

Considering that Windows initiates a process to create a new user, leading to the addition of a log entry with every new process, it's likely that there's another log containing a distinct Event ID that captures the executed command. 
This Event ID is 1.  `index=main EventID=1 username` Replace `username` by the username we found in quetion one.

![Screenshot from 2023-08-17 22-41-48](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/be375086-5ade-404b-b9b7-2a9756527d53)

**Q6: How many times was the login attempt from the backdoor user observed during the investigation?**
 
 Filter for the backdoor user  `index="main" User="A1berto"`

![Screenshot from 2023-08-17 23-09-33](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/99d9fe43-fcb1-478b-a8a2-4997b6deffa8)

**Q7: What is the name of the infected host on which suspicious Powershell commands were executed?**

Simply search `index="main" powershell` and examining the Hostname field.

![Screenshot from 2023-08-17 23-18-20](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/1276d524-1f53-4f35-84d4-571a20e72d29)

**Q8: PowerShell logging is enabled on this device. How many events were logged for the malicious PowerShell execution?**

Filter with the EventID. Windows logs all PowerShell commands with event ID 4103. `index=main EventID=4103`

![Screenshot from 2023-08-17 23-20-43](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/2320fb9f-86ec-4514-8baf-188629911e28)

**Q9: An encoded Powershell script from the infected host initiated a web request. What is the full URL?**
From our previous search, we can examine any of the returned logs to find a Base64 string preceded by the command _C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -noP -sta -w 1 -enc_

![Screenshot from 2023-08-17 23-43-17](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/6ddbad5d-bbd8-4b26-b95a-bb0983f41b88)

Copy the string and past it to cyberchef. To decode the Base64 hash value use “From Base64” and “Decode text” features.

![Screenshot from 2023-08-17 23-46-12](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/ef5f9d6b-7933-4f97-b067-3ccb5e83d005)

As you can see, there’s a second Base64 string in there, so decode it too by following the same process. 

![Screenshot from 2023-08-17 23-49-40](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/239d1fc5-5567-46e3-b5ee-e148e83e74cb)

And finally, let's defang the url. 

**Note**: Don't forget to add the /.news.pfp at the end of the URL.

![Screenshot from 2023-08-17 23-53-27](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/f110cfcb-5c25-4aa2-b6d6-2e75992eaf50)

</details>
