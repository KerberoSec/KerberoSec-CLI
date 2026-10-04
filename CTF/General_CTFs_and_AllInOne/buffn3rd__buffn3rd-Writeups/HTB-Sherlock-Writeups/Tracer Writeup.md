# **Tracer Writeup**
![image](https://github.com/user-attachments/assets/51d97e5b-da22-4913-99aa-a8efb33340f2)

A junior SOC analyst on duty has reported multiple alerts indicating the presence of PsExec on a workstation. They verified the alerts and escalated the alerts to tier II. As an Incident responder you triaged the endpoint for artefacts of interest. Now please answer the questions regarding this security event so you can report it to your incident manager.

**Tools:**
  - Windows Event Viewer

**Learned:**
  - Windows Event Log Analysis
  - Timeline Analysis
  - Intrusion Analysis

### **Question 1**
The SOC Team suspects that an adversary is lurking in their environment and are using PsExec to move laterally. A junior SOC Analyst specifically reported the usage of PsExec on a WorkStation. How many times was PsExec executed by the attacker on the system?

Appears we have a partial image from a drive. To start I am going to go to the winsevt logs and look at system and security logs. In the systems log I can see the PsExec.exe was installed. I counted how many logs were there for PsExec.exe which told me how many times it was excuted and it was 9. The reason I thought this is since event ID '7045' on system logs is when the system installs a service it is known with PsExec installs temp services which in term would mean each time the TA used PsExec it would reintiate installing a new service.

![image](https://github.com/user-attachments/assets/95989991-75b8-45ee-ad7a-ae83148b4c24)

**Answer:** 9
### **Question 2**
What is the name of the service binary dropped by PsExec tool allowing attacker to execute remote commands?

This can be found in the system log above. A service binary is an executeable file.

![image](https://github.com/user-attachments/assets/08538f3d-9b19-4558-b020-6f7fc7b49b68)

**Answer:** psexesvc.exe
### **Question 3**
Now we have confirmed that PsExec ran multiple times, we are particularly interested in the 5th Last instance of the PsExec. What is the timestamp when the PsExec Service binary ran?

Remember to open up the log and go to the 'Details' tab for the UTC timestamp. This is the actual date/time the event occured. The logged time is when the log was created on the system.

![image](https://github.com/user-attachments/assets/22f2ef13-84d2-4a64-9dfe-b73b4ac6f8d9)

**Answer:** 07/09/2023 12:06:54
### **Question 4**
Can you confirm the hostname of the workstation from which attacker moved laterally?
	
Leveraging the security logs is important here. I am curious about account log ons which tells me that the TA got access to another account. What I am going to look for is event id '4668' which is when a logon was attempted with explicit creds.

![image](https://github.com/user-attachments/assets/af0d997b-3e71-412c-8086-87fea379bdda)

**Answer:** Forela-Wkstn001
### **Question 5**
What is full name of the Key File dropped by 5th last instance of the Psexec?

Don't forget to leverage the other logs. I was able to find the answer in the sysmon logs which those are ssytem monitoring logs. These can show you a plethora of events even file creation. I opened the sysmon logs up then filtered on event ID '11' then searched for that key using the 'Find' feature and was able to find it

![image](https://github.com/user-attachments/assets/4ee60e2d-116a-4ccf-8d1b-e8246fb4eaf8)

**Answer:** PSEXEC-FORELA-WKSTN001-95F03CFE.key
### **Question 6**
Can you confirm the timestamp when this key file was created on disk?

Open up the 'Detail' part of the log and you will find when the event occured.

![image](https://github.com/user-attachments/assets/51cda6b0-f4a1-45a4-8e52-6c4a484102be)

**Answer:** 07/09/2023 12:06:55
### **Question 7**
What is the full name of the Named Pipe ending with the "stderr" keyword for the 5th last instance of the PsExec?

I was able to find the answer using the sysmon logs. I did some google searching on what event ID would show a pipe was created and event ID '18' showed it. Filter on that event ID to find it

![image](https://github.com/user-attachments/assets/57cbe592-5ada-4630-b561-edcbc82177d4)

**Answer:** \PSEXESVC-FORELA-WKSTN001-3056-stderr

Overall, this challenge helped me with intrusion analysis as well as timeline analysis. By correlating logs across several collection points I was able to build the timeline out of the event and what the TA did.
