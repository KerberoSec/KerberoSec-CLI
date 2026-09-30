# Masterminds 

**Link:** [https://tryhackme.com/room/mastermindsxlq](https://tryhackme.com/room/mastermindsxlq)

**Difficulty:** Medium

**Category:** Network Forensics

**Tools Used:** Brim

-----

Three machines in the Finance department at Pfeffer PLC were compromised. We suspect the initial source of the compromise happened through a phishing attempt and by an infected USB drive. The Incident Response team managed to pull the network traffic logs from the endpoints. Use Brim to investigate the network traffic for any indicators of an attack and determine who stands behind the attacks. 

NOTE: DO NOT directly interact with any domains and IP addresses in this challenge. 

Deploy the machine attached to this task; it will be visible in the split-screen view once it is ready.

If you don't see a virtual machine load then click the Show Split View button.

![image](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/cf4a71a3-2f77-430f-8b1e-50f4b4e46855)

<details close>
<summary> <h1>[Infection 1]</h1></summary>
<br>

Start by loading the Infection1 packet capture in Brim to investigate the compromise event for the first machine. All the PCAPs can be found here: /home/ubuntu/Desktop/PCAPs

Note: For questions that require multiple answers, please separate the answers with a comma.

Launch Brim and import the Infection1 file 

![Screenshot from 2023-08-02 13-24-54](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/0529491c-ab95-48bc-b16b-9fe9903a34ec)

## Answer the questions below

**Q1: Provide the victim's IP address.**

This one is quite easy because there is only one IP Source in the .pcap file.

![Screenshot from 2023-08-02 13-29-17](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/f44a50ba-dcf3-41bf-911d-8ad69633d6f9)

**Q2: The victim attempted to make HTTP connections to two suspicious domains with the status '404 Not Found'. Provide the hosts/domains requested.**

```_path=="http" |cut id.orig_h, host, status_code, status_msg | status_code==404| uniq -c ```

![Screenshot from 2023-08-02 13-41-37](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/ed723cc2-051f-4412-86af-bbe89df98ab1)

**Q3: The victim made a successful HTTP connection to one of the domains and received the response_body_len of 1,309 (uncompressed content size of the data transferred from the server). Provide the domain and the destination IP address.**

```_path=="http" |cut id.orig_h, id.resp_h, host, status_code, status_msg, response_body_len | status_code==200| uniq -c ```

![Screenshot from 2023-08-02 13-49-39](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/0a8c3557-e4ed-4778-bdc1-0e514766f8b2)

**Q4: How many unique DNS requests were made to cab[.]myfkn[.]com domain (including the capitalized domain)?**

**_Note: Do not forget to include the lowercase domain._**

Since there aren't a lot of DNS queries, I just used the default query.  

![Screenshot from 2023-08-02 16-35-58](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/80e88c81-616f-4024-8597-6982d69a6e17)

**Q5: Provide the URI of the domain bhaktivrind[.]com that the victim reached out over HTTP.**

Search for the `bhaktivrindcom` and right-click to open the details, there you can find the URI.

![Screenshot from 2023-08-02 16-46-28](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/01d45db1-ef24-4f1b-bdb9-1597d29a1396)

You can also use this query ``_path==”http” host==”bhaktivrind.com”``

**Q6: Provide the IP address of the malicious server and the executable that the victim downloaded from the server.**

Since we're focusing on the "download" action, it's likely that the victim used a web browser to make an HTTP request. To address this situation, we should filter and analyze all the HTTP requests.

``_path==”http” uri matches *.exe``

</details>

<details close>
<summary> <h1>[Infection 2]</h1></summary>
<br>

Please, navigate to the Infection2 packet capture in Brim to investigate the compromise event for the second machine.

Note: For questions that require multiple answers, please separate the answers with a comma.

## Answer the questions below

**Q1: Provide the IP address of the victim machine.**

As we are trying to find the victim machine IP address, let's query the to “id.orig_h”

``_path=="http" | cut id.orig_h | uniq -c``

![Screenshot from 2023-08-02 18-24-45](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/3b5e020b-f8d5-410e-b856-6dfa497d7c56)

**Q2: Provide the IP address the victim made the POST connections to.**

We can use this query ``method=="POST" | 192.168.75.146``  to get all the POST requests the victim made or use the default `HTTP POST requests` query.

![Screenshot from 2023-08-02 18-54-00](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/d7099aac-7fae-41ee-a8fd-3be1f55cae97)

**Q3: How many POST connections were made to the IP address in the previous question?**

Use the same query as the previous question and add `count()`. `method=="POST" | 192.168.75.146 | count()`

![Screenshot from 2023-08-02 18-58-54](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/f8d9f6f4-b256-4d31-aa92-aaf6310dfc03)

**Q4: Provide the domain where the binary was downloaded from.**

`_path=="http" | uri matches *.exe` Use this query to find the same of the exe file.  

![Screenshot from 2023-08-02 19-05-23](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/79b20da2-ab13-44ec-860a-1bbd537101a6)

**Q5: Provide the name of the binary including the full URI.**

Under the host  you can find the URI.

![Screenshot from 2023-08-02 20-03-22](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/1e7919c9-6b6e-4031-8d2b-683278507089)

**Q6: Provide the IP address of the domain that hosts the binary.**

In the same place, you can find the IP address.

![Screenshot from 2023-08-02 20-05-37](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/773b43f2-3c78-4f18-87cb-5e39b25da7cf)

**Q7: There were 2 Suricata "A Network Trojan was detected" alerts. What were the source and destination IP addresses?**

To filter the 2 Suricata we can use the default query 

![Screenshot from 2023-08-02 20-29-57](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/6ea6ccf9-dfa9-44b2-b80e-e878c33de94c)

![Screenshot from 2023-08-02 20-34-32](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/e4eb50b4-d1b1-4b5d-973e-092002743d09)

**Q8: Taking a look at .top domain in HTTP requests, provide the name of the stealer (Trojan that gathers information from a system) involved in this packet capture using URLhaus Database.**

First, we need to filter the HTTP packet and then look for the one that had the `.top` to do so we'll be using this query
`_path=="HTTP" | cut host`

![Screenshot from 2023-08-02 21-11-00](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/9c618967-a755-4413-8032-59e1c0d07814)

Now that we have our domain copy it here https://urlhaus.abuse.ch/browse.php?search=

![Screenshot from 2023-08-02 21-15-32](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/2d9d3413-4f0c-4e6f-aaa4-6942908224ff)

</details>

<details close>
<summary> <h1>[Infection 3]</h1></summary>
<br>

Please, load the Infection3 packet capture in Brim to investigate the compromise event for the third machine.

Note: For questions that require multiple answers, please separate the answers with a comma.

## Answer the questions below

**Q1: Provide the IP address of the victim machine.**

Same thing as the other two similar questions. Check the `id.orig_h`
`_path=="http" |  uniq -c`

![Screenshot from 2023-08-02 21-23-11](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/349acdd3-3da3-4f7f-abc1-82a382ac9963)

**Q2: Provide three C2 domains from which the binaries were downloaded (starting from the earliest to the latest in the timestamp)**

Let's query the .exe files
 
 `*.exe | uniq -c | sort ts`

**Q3: Provide the IP addresses for all three domains in the previous question.**

Stay where  you are now right and open to detail, you can find the IP addresses in the `id.resp_p` field.

**Q4: How many unique DNS queries were made to the domain associated from the first IP address from the previous answer?**

`_path=="dns" | count() by query | query=="efhoahegue.ru"|sort -r`

**Q5: How many binaries were downloaded from the above domain in total?**

`_path=="http" | host=="efhoahegue.ru" | * .exe | count()`

**Q6: Provided the user-agent listed to download the binaries.**

Just type `user-agent | .exe` in the search bar. 

![Screenshot from 2023-08-02 23-32-51](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/b4549eb9-1fca-4d18-a7fb-ce6f81236a1e)

**Q7: Provided the user-agent listed to download the binaries.**

_`path=="dns" | count()`

**Q8: With some OSINT skills, provide the name of the worm using the first domain you have managed to collect from Question 2. (Please use quotation marks for Google searches, don't use .ru in your search, and DO NOT interact with the domain directly).**

Search on Google and check the first article.

![Screenshot from 2023-08-02 23-27-25](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/c8e8cd6c-9b7c-4475-947c-2f9bccfffeb4)

</details>
