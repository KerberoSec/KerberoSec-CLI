# ItsyBitsy

**Link:** https://tryhackme.com/room/itsybitsy

**Difficulty:** Medium

**Category:** Event Analysis

**Tools Used:** ELK

-----

In this challenge room, we will take a simple challenge to investigate an alert by IDS regarding a potential C2 communication.

<details close>
<summary> <h1> Scenario: Investigate a potential C2 communication alert</h1></summary>
<be>

## Scenario

During normal SOC monitoring, Analyst John observed an alert on an IDS solution indicating a potential C2 communication from a user Browne from the HR department. A suspicious file was accessed containing a malicious pattern THM:{ ________ }. A week-long HTTP connection logs have been pulled to investigate. Due to limited resources, only the connection logs could be pulled out and are ingested into the connection_logs index in Kibana.

Our task in this room will be to examine the network connection logs of this user, find the link and the content of the file, and answer the questions.

## Answer the questions below

**Q1: How many events were returned for the month of March 2022?**

In the `Discover` tab change the date to `Feb 28, 20022 @ 00:00:00.000` -> `Mar 31, 2022 @ 00:00:00.000`

![Screenshot from 2023-08-17 11-11-28](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/eea6ae77-6f1c-4ca6-93a4-c7c9d9c71d71)

**Q2: What is the IP associated with the suspected user in the logs?**

Click the `source_ip` in the left panel. 

![Screenshot from 2023-08-17 11-19-54](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/02d5f1cb-4497-4c27-bfbf-5dc41e3ce320)

**Q3: The user’s machine used a legit windows binary to download a file from the C2 server. What is the name of the binary?**

Filter by the suspicious IP address we found in the previous question. After that, take a look at the `user_agent` field in one of the logs.

![Screenshot from 2023-08-17 11-48-32](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/d4fbaf9e-ef32-4b0f-bd0b-0baf9a1451ca)

**Q4: The infected machine connected with a famous filesharing site in this period, which also acts as a C2 server used by the malware authors to communicate. What is the name of the filesharing site?**

In the same log document, look for the `host`. 

![Screenshot from 2023-08-17 11-55-38](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/815dc18c-99c1-459c-85b7-248e9eaab33f)

**Q5: What is the full URL of the C2 to which the infected host is connected?**

Again, in the same log document look for the `uri`. add the `uri` to the `host` 

`host/uri`

**Q6: A file was accessed on the filesharing site. What is the name of the file accessed?**

In an HTTP log, the file name isn't explicitly mentioned, but we do have a hint about the file extension. In the GET request, the "resp_mime_types" field has the value "text/plain". This suggests that we're dealing with a .txt file.

To find the filename, we need to dig a bit deeper into the Command and Control (C2) system. Luckily, it's hosted on a public website, so we can simply use a browser to visit it. Viste `Host/uri`

![Screenshot from 2023-08-17 12-20-41](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/f028874d-e317-46cc-9a93-db3ea51f922d)

There we can find the filename and the flag.
</details>
