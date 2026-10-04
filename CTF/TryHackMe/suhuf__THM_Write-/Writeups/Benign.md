

## **Introduction**

This is a **Medium** **Splunk** focused room that helps us get familiar with using Splunk to intelligently filter logs, view IOCs, and interact with multiple end user's and network segment's Logs. This room is Host-centric

## **Scenario**

<img width="1288" height="649" alt="image" src="https://github.com/user-attachments/assets/b7ee58da-ce65-4d04-8a22-c15cf6c5b691" />

For this lab we first should open our Splunk instance, click start machine and then when it is ready click follow browser URL (or similar):

Since we are going to be reviewing gathered and not live logs, we select **Search & Reporting** on the left:

<img width="1879" height="851" alt="image" src="https://github.com/user-attachments/assets/4c0a63e0-9c95-47b1-a301-1ebd756bceba" />

We now can see our interface for searching Splunk logs, the first thing we should do, and this is very important, is change the time range for the logs off of the last 24 hours. For starting we can start at all time and see how it goes:

<img width="1876" height="738" alt="image" src="https://github.com/user-attachments/assets/1674957d-f06c-4489-854c-c4134d1592c8" />

Next we need to select a source to look at for logs, to test and make sure everything is working right we can set our source to Windows event logs by choosing "win_event_logs.json".

Paste or type this into the search bar and then select the search looking glass:  **source="win_event_logs.json"**.

<img width="1901" height="869" alt="image" src="https://github.com/user-attachments/assets/71ae38f4-ce3f-42f3-90ad-37150f2e0d88" />

We then should be able to see a large amount of logs available, confirming Splunk is working and reading logs correctly for our analysis. 

<img width="1903" height="855" alt="image" src="https://github.com/user-attachments/assets/6f9023e1-e597-4e0a-8c76-9b2e52bd76f4" />

## **Initial Compromise, Exploitation, & Escalation**

**How many logs are ingested from the month of March, 2022?**

For this we are asked for **All** logs, from all sources that are present for the date **March 2022.**

to do this we first need/should edit the source to include from all sources, this can be done via setting the source to a wildcard (*)

<img width="1903" height="855" alt="image" src="https://github.com/user-attachments/assets/f719691e-371b-4e35-831e-b862ca047551" />

secondly, we need to also filter the logs according to both the set month and year. One way of doing this is by clicking **date_month** in the left side of the **GUI** and selecting our desired month.

<img width="889" height="553" alt="image" src="https://github.com/user-attachments/assets/647c1b29-3066-4a3e-bfa1-e4c5e34c3ebf" /> 

this will add our desired filter to the logs. Do the same thing for the **date_year** field and we can have both our filters enabled on our wide array of logs.

<img width="1902" height="869" alt="image" src="https://github.com/user-attachments/assets/d138156b-5b29-4f8b-bf7e-6f3fb99bb7b2" />

On the left side, **Events** we can see the amount of events (or "logs") present

<img width="1455" height="834" alt="image" src="https://github.com/user-attachments/assets/00c3f6c7-e5ed-48ce-8eba-5aa6fea6f7c5" />

Our answer in this case should be **13959**

**Imposter Alert: There seems to be an imposter account observed in the logs, what is the name of that user?**

To find this we need to see all users names that are present on the logs, looking on the left hand panel can give us ideas on what filters we can use/apply to find things of substance:

When checking **Interesting Fields** we can see a **Username** field that could be in-line for what we need for this investigation:

<img width="284" height="934" alt="image" src="https://github.com/user-attachments/assets/e6dface7-36cd-430f-b75d-775975f841c3" />

If we select this and then choose **rare** it will show all of the Usernames with a (max of 20) and then sort according to rarity:

<img width="1895" height="866" alt="image" src="https://github.com/user-attachments/assets/7a21e8a7-5194-4c1d-8969-51594be1c641" />

There is a huge red flag here in the logs, there is an account that is spoofing that it is the user "Amelia" by using a "1" instead of an "i" and they have one single event logged while the actual user has 1000+ events logged. This is a sign that something is wrong:

<img width="1889" height="814" alt="image" src="https://github.com/user-attachments/assets/0d7daa7d-14d2-4c33-ad67-a861b9c2803a" />

This is also an important example of where it is important to make sure things are being thoroughly checked and combed and not rudimentally/quickly checked as this could be easily missed without checking all usernames present.

Let's check this single log from the suspicious user as well to gain more information

we cna do his by ****[Comeback to this]

<img width="1894" height="909" alt="image" src="https://github.com/user-attachments/assets/80e10ef1-0684-4bea-96e2-3b1a7c635a2b" />

**Which user from the HR department was observed to be running scheduled tasks?**

**Which user from the HR department executed a system process (LOLBIN) to download a payload from a file-sharing host.**

## **C2 Info & Post Exploitation**

**To bypass the security controls, which system process (lolbin) was used to download a payload from the internet?** 

**What was the date that this binary was executed by the infected host? format (YYYY-MM-DD)**

**Which third-party site was accessed to download the malicious payload?**

**What is the name of the file that was saved on the host machine from the C2 server during the post-exploitation phase?**

**The suspicious file downloaded from the C2 server contained malicious content with the pattern THM{..........}; what is that pattern?**

**What is the URL that the infected host connected to?**

