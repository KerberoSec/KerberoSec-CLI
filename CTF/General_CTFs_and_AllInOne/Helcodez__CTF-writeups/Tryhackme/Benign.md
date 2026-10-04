# Benign

**Link:** https://tryhackme.com/room/benign

**Difficulty:** Medium

**Category:** Event Analysis

**Tools Used:** Splunk

-----

We will investigate host-centric logs in this challenge room to find suspicious process execution. To learn more about Splunk and how to investigate the logs, look at the rooms splunk101 and splunk201.

<details close>
<summary> <h1> Scenario: Identify and Investigate an Infected Host</h1></summary>
<be>

One of the client’s IDS indicated a potentially suspicious process execution indicating one of the hosts from the HR department was compromised. Some tools related to network information gathering / scheduled tasks were executed which confirmed the suspicion. Due to limited resources, we could only pull the process execution logs with Event ID: 4688 and ingested them into Splunk with the index win_eventlogs for further investigation.

About the Network Information

The network is divided into three logical segments. It will help in the investigation.

IT Department

James
Moin
Katrina
HR department

Haroon
Chris
Diana
Marketing department

Bell
Amelia
Deepak

## Answer the questions below

**Q1: How many logs are ingested from the month of March, 2022?**

In the App panel click Search & Reporting and search for `win_eventlogs` then change the time settings _since  March, 2022_.

![Screenshot from 2023-08-18 00-21-37](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/f7c60aff-f741-4879-a304-732d810030cc)

**Q2: Imposter Alert: There seems to be an imposter account observed in the logs, what is the name of that user?**

When we examine the users of the relevant events from the “UserName” section in the “Field Pane”, we can see that there are 11 different users however, the summary provided only displays the top 10

![image](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/ea49ed08-0bb0-4ba4-b042-0ebc8c0a0ff3)

To view all the user accounts let's filter the list of unique usernames with a count of total number of events containing that username.  `index=win_eventlogs 
| stats count by UserName`

![image](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/7758e440-502c-4e6e-8365-59a3dbda459d)

**Q3: Which user from the HR department was observed to be running scheduled tasks?**

When Windows executes a scheduled task, it uses schtasks.exe to run the command. That means we can simply search for schtasks.exe to dentify the executed scheduled tasks. From there, we can examine the UserName field for someone in HR.

![image](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/4444d4c8-6183-4f54-b53f-7bb853cf92e3)

**Q4: Which user from the HR department executed a system process (LOLBIN) to download a payload from a file-sharing host.**

Since we’re looking at HR users, le's narrowed our search to include only events with HR users then we filter by the CommandLine field. 

`index=win_eventlogs UserName ("haroon" OR "Chris" OR "Diana") 
 | stats count(CommandLine) by CommandLine`

![Screenshot from 2023-08-18 11-54-38](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/9e7196bd-df79-4750-b2fb-a49730e7b7ff)

The first command stoud out. Click `View Event`

![Screenshot from 2023-08-18 12-00-54](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/c78e1a07-4613-4a27-b9a3-1ca4f2aad003)

Here, we can see the user that excuted the command.

**Q5: To bypass the security controls, which system process (lolbin) was used to download a payload from the internet?**

In the same event look for the ProcessName.

![Screenshot from 2023-08-18 12-06-19](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/fa1bddca-9919-4d56-86b2-116620eeadd0)

**Q6: What was the date that this binary was executed by the infected host? format (YYYY-MM-DD)**

![image](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/d3e4ed66-a890-455d-90fb-303e76651510)

**Q7: Which third-party site was accessed to download the malicious payload?**

![image](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/d0c9aa65-c524-44e8-a9bd-2a34fe952256)

**Q8: What is the name of the file that was saved on the host machine from the C2 server during the post-exploitation phase?**

![image](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/f4d7d6ff-09ac-4143-b0fe-f49762a0917f)

**Q9: The suspicious file downloaded from the C2 server contained malicious content with the pattern THM{..........}; what is that pattern?**

Vist the malicious link in the CommandLine to check out what’s there.

![image](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/0cd14e6b-d8a5-4657-8d2f-debdbd097408)

**Q10: What is the URL that the infected host connected to?**

It’s the same URL we used to obtain the flag in question 9.

![image](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/d52dd600-fdfb-4498-9b9a-691b7b0133bd)

</details>
