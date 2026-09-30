# #7: Identify Threat based on a report, using OpenCTI

@trooper

A multinational technology company has been the target of several cyber attacks over the past few months. The attackers have successfully stolen sensitive intellectual property and caused disruptions to the company’s operations. A threat advisory report describing similar attacks has been shared, and as a CTI analyst my task is to identify the Tactics, Techniques, and Procedures (TTPs) used by the threat group and gather as much information as possible about their identity and motive. For this task, I will use the OpenCTI platform and the MITRE ATT&CK Navigator, linked to the details below.

**APT X Report:** 

APT X_USBFerry.pdf

We can easily find the type of phishing campaign APT X uses as part of their TTPs, and also the name of the malware used by APT X by either reading the document or searching it.

Phishing campaign: `spear-phishing emails`

Malware name: `USBferry`: this can also be found by reading through the report.

But what is the STIX ID of this malware? STIX (Structured Threat Information Expression) is a language and serialization format used to exchange cyber threat intelligence (CTI).

For this, I open the OpenCTI instance and log in using the provided credentials.

Once logged in, I click into the **Search** box and type `USBferry`, which is the malware name identified in the report.

I select Malware, and it shows the complete details about this malware, including the STIX ID: `malware--5d0ea014-1ce9-5d5c-bcc7-f625a07907d0`

If I want to know which technique APT X used for initial access via USB, I go to the MITRE ATT&CK website, select **Tactics → Enterprise**, and then click **Initial Access**.

On this page, I search for “USB” or “Removable Media” to locate the relevant technique. The result shows the technique associated with removable media (as observed below).

The identity of APT X is also discoverable in the OpenCTI search results when I search the malware name.

To find how many attack pattern techniques are associated with the APT, I search **Tropic Trooper** in the OpenCTI search bar.

I select the entry listed under **Intrusion Set**, then go to the **Knowledge** tab:

Under **Distribution of relations**, I can see the number of known Attack Patterns associated with this intrusion set; in this case the count is `39`.

On the same page, I navigate to **Tool** under the Arsenal section to view tools linked to APT X:

To find which sub-technique is used under **Valid Accounts**, I return to the MITRE ATT&CK Navigator at [https://attack.mitre.org](https://attack.mitre.org/) and search for **Tropic Trooper**, and select the result in the **Groups** category.

Then in that page search for “Tropic Trooper” and I can reach the desired page at https://attack.mitre.org/groups/G0081/

This takes me to the group page at `https://attack.mitre.org/groups/G0081/`. There, I search for **Valid Accounts** to identify the sub-technique used by the group.

To get information about the tactics, I click the Technique ID: `T1078`.

I can see the technique’s associations with tactics on the right-hand side. This technique maps to:

```
Initial Access, Persistence, Defense Evasion, and Privilege Escalation
```

To find techniques APT X is known for using under tactic collections, I return to the OpenCTI interface. After searching for **Tropic Trooper** and selecting the **Intrusion Sets** entry, I open the **Knowledge** tab.

There, I click **Attack Patterns** under Arsenal and identify the collection technique used:

Collection: `Automated Collection`.