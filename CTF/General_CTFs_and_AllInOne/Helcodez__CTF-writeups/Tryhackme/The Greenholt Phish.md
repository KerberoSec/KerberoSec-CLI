# The Greenholt Phish

**Link:** [https://tryhackme.com/room/benign](https://tryhackme.com/room/phishingemails5fgjlzxc)

**Difficulty:** Easy

**Category:** Phishing

**Tools Used:** Thunderbird mail

-----

<details close>
<summary> <h1> Just another day as a SOC Analyst </h1></summary>
<be>

![image](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/e97875c0-42fe-40f3-b65e-3035d15ef737)

A Sales Executive at Greenholt PLC received an email that he didn't expect to receive from a customer. He claims that the customer never uses generic greetings such as "Good day" and didn't expect any amount of money to be transferred to his account. The email also contains an attachment that he never requested. He forwarded the email to the SOC (Security Operations Center) department for further investigation. 

Investigate the email sample to determine if it is legitimate. 

Deploy the Machine

Deploy the machine attached to this task; it will be visible in the split-screen view once it is ready.

If you don't see a virtual machine automatically appear, click the Show Split View button.

Tip: Open the EML file with Thunderbird. To do so, right-click on the challenge.eml file and select Open With Other Application. From there, scroll down to select Thunderbird Mail and click Open.

Right-click window on the eml file Application selection for Thunderbird

## Answer the questions below

**Q1: What date was the email received? (answer format: M/DD/YY)**

The date is on the right corner.

![Screenshot from 2023-08-18 20-24-20](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/02edd400-6b64-4efd-8551-8b02738bf8a4)

**Q2: Who is the email from?**

![Screenshot from 2023-08-18 20-27-50](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/8a9be9d6-9fc6-4052-a2ff-f7259f903e53)

**Q3: What is his email address?**

![Screenshot from 2023-08-18 20-32-10](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/6b2e6bb8-f7ad-49d4-8898-5d4e28db25f9)

**Q4: What email address will receive a reply to this email?**

![Screenshot from 2023-08-18 21-11-16](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/dc6d1aa7-72e2-4b39-bc0e-57587f69164b)

**Q5: What is the Originating IP?**

To get more information, click “More” in the header and select “View Source” from the menu. 

![Screenshot from 2023-08-18 21-07-59](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/b7436d60-5636-46db-b8fb-1a20936b3194)

![Screenshot from 2023-08-18 21-13-49](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/99006597-edce-4ea1-a274-b2f3a25c5532)

**Q6: Who is the owner of the Originating IP? (Do not include the "." in your answer.)**

To get the name of the organization perform a WHOIS lookup.

![Screenshot from 2023-08-18 21-18-34](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/1718785d-47d4-449f-853c-270cd5f4f641)

**Q7: What is the SPF record for the Return-Path domain?**

Search `info@mutawamarine.com` in an SPF Record Check

![Screenshot from 2023-08-18 21-27-32](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/5203b966-70f9-4b76-a7c6-4a04c02954f3)

**Q8: What is the DMARC record for the Return-Path domain?**

Search for the same domain but instead of an SPF Record Check we'll be using a DMARC Check Tool.

![Screenshot from 2023-08-18 21-30-08](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/40da17f0-0007-4df4-80c4-3c317a27d12e)

**Q9: What is the name of the attachment?**

Back to the source file now, and look for the filename. 

![Screenshot from 2023-08-18 21-33-02](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/193e5306-b876-434c-863b-55b8b0383759)

**Q10: What is the SHA256 hash of the file attachment?**

Download the file we found in the previous question.  

![Screenshot from 2023-08-18 21-36-09](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/359ab2b1-f968-49e2-9fb3-2eb19d0458a3)

Then use SHA256 in a terminal to display the checksum. 

![Screenshot from 2023-08-18 21-42-35](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/c1afe1d3-6e2b-49e9-8913-84054d6e38cb)

**Q11: What is the attachments file size? (Don't forget to add "KB" to your answer, NUM KB)**

Copy the hash and paste it into Virustotal.

![Screenshot from 2023-08-18 21-46-49](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/811e3034-f745-463b-b5e1-bc9a06170448)

**Q12: What is the actual file extension of the attachment?**

![Screenshot from 2023-08-18 21-52-47](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/ec31f685-6ecb-40d2-bf91-22a03bc27d59)
