
#Subscribers 
https://tryhackme.com/room/thehiveproject

Welcome to TheHive Project Outline!

This room will cover the foundations of using the TheHive Project, a Security Incident Response Platform.

Specifically, we will be looking at:

- What TheHive is?
- An overview of the platform's functionalities and integrations.
- Installing TheHive for yourself.
- Navigating the UI.
- Creation of a case assessment.

Before we begin, ensure you download the attached file, as it will be needed for Task 5.

## intro 

TheHive Project is a scalable, open-source and freely available Security Incident Response Platform, designed to assist security analysts and practitioners working in SOCs, CSIRTs and CERTs to track, investigate and act upon identified security incidents in a swift and collaborative manner.

Security Analysts can collaborate on investigations simultaneously, ensuring real-time information pertaining to new or existing cases, tasks, observables and IOCs are available to all team members.

More information about the project can be found on [https://thehive-project.org/](https://thehive-project.org/)[](https://thehive-project.org/) & their [GitHub Repo](https://github.com/TheHive-Project/TheHive).

TheHive Project operates under the guide of three core functions:

- **Collaborate:** Multiple analysts from one organisation can work together on the same case simultaneously. Through its live stream capabilities, everyone can keep an eye on the cases in real time.
- **Elaborate:** Investigations correspond to cases. The details of each case can be broken down into associated tasks, which can be created from scratch or through a template engine. Additionally, analysts can record their progress, attach artifacts of evidence and assign tasks effortlessly.
- **Act:** A quick triaging process can be supported by allowing analysts to add observables to their cases, leveraging tags, flagging IOCs and identifying previously seen observables to feed their threat intelligence.

## features 

TheHive allows analysts from one organisation to work together on the same case simultaneously. This is due to the platform's rich feature set and integrations that support analyst workflows. The features include:

- **Case/Task Management:** Every investigation is meant to correspond to a case that has been created. Each case can be broken down into one or more tasks for added granularity and even be turned into templates for easier management. Additionally, analysts can record their progress, attach pieces of evidence or noteworthy files, add tags and other archives to cases.
    
- **Alert Triage:** Cases can be imported from SIEM alerts, email reports and other security event sources. This feature allows an analyst to go through the imported alerts and decide whether or not they are to be escalated into investigations or incident response.
    
- **Observable Enrichment with Cortex:** One of the main feature integrations TheHive supports is Cortex, an observable analysis and active response engine. Cortex allows analysts to collect more information from threat indicators by performing correlation analysis and developing patterns from the cases. More information on [Cortex](https://github.com/TheHive-Project/Cortex/).
    
- **Active Response:** TheHive allows analysts to use Responders and run active actions to communicate, share information about incidents and prevent or contain a threat.
    
- **Custom Dashboards:** Statistics on cases, tasks, observables, metrics and more can be compiled and distributed on dashboards that can be used to generate useful KPIs within an organisation.
    
- **Built-in MISP Integration:** Another useful integration is with [MISP](https://www.misp-project.org/index.html), a threat intelligence platform for sharing, storing and correlating Indicators of Compromise of targeted attacks and other threats. This integration allows analysts to create cases from MISP events, import IOCs or export their own identified indicators to their MISP communities.
    

Other notable integrations that TheHive supports are [DigitalShadows2TH](https://github.com/TheHive-Project/DigitalShadows2TH) & [ZeroFox2TH](https://github.com/TheHive-Project/Zerofox2TH), free and open-source extensions of alert feeders from [DigitalShadows](https://www.digitalshadows.com/) and [ZeroFox](https://www.zerofox.com/) respectively. These integrations ensure that alerts can be added into TheHive and transformed into new cases using pre-defined incident response templates or by adding to existing cases.

## user profiles & permissions

TheHive offers an administrator the ability to create an organization group to identify the analysts and assign different roles based on a list of pre-configured user profiles.

The pre-configured user profiles are:  

- **admin:** full administrative permissions on the platform; can't manage any Cases or other data related to investigations;
- **org-admin:** manage users and all organisation-level configuration, can create and edit Cases, Tasks, Observables and run Analysers and Responders;
- **analyst:** can create and edit Cases, Tasks, Observables and run Analysers & Responders;
- **read-only:** Can only read, Cases, Tasks and Observables details;

Deploy the machine attached to follow along on the next task. Please give it a minimum of 5 minutes to boot up. It would be best if you connected to the portal

```
http://10.10.232.6/index.html

analyst profile credentials: 

Username: analyst@tryhackme.me 
Password: analyst1234
```

```
Which pre-configured account cannot manage any cases?
admin

Which permission allows a user to create, update or delete observables?
manageObservable

Which permission allows a user to execute actions?

manageAction
```

## scenario 

You have captured network traffic on your network after suspicion of data exfiltration being done on the network. This traffic corresponds to FTP connections that were established. Your task is to analyse the traffic and create a case on TheHive to facilitate the progress of an investigation. If you are unfamiliar with using Wireshark, please check out [this room](https://tryhackme.com/room/wireshark) first and come back to complete this task. 

_Source of PCAP file: IntroSecCon CTF 2020_

Once an analyst has logged in to the dashboard, they will be greeted with the screen below. At the top, various menu options are listed that allow the user to create new cases and see their tasks and alerts. A list of active cases will be populated on the centre console when analysts create them.

On clicking the `New Case` tab, a pop-up window opens, providing the analyst with fields to input their case details and tasks. The following options must be indicated on the case to set different categories and filter options:

- **_Severity_:** This showcases the level of impact the incident being investigated has on the environment from low to critical levels.
- **_TLP_:** The Traffic Light Protocol is a set of designations to ensure that sensitive information is shared with the appropriate audience. The range of colours represents a scale between full disclosure of information (_White_) and No disclosure/ Restricted (_Red_). You can find more information about the definitions on the [CISA](https://www.cisa.gov/tlp) website.
- **_PAP_:**  The Permissible Actions Protocol is used to indicate what an analyst can do with the information, whether an attacker can detect the current analysis state or defensive actions in place. It uses a colour scheme similar to TLP and is part of the [MISP taxonomies](https://www.misp-project.org/taxonomies.html#_pap).

With this in mind, we open a new case and fill in the details of our investigation, as seen below. Additionally, we add a few tasks to the case that would guide the investigation of the event.

```
Where are the TTPs imported from?

MITRE ATT&CK

According to the Framework, what type of Detection "Data source" would our investigation be classified under?

network traffic

THM{FILES_ARE_OBSERVABLES}
```

https://motasem-notes.net/how-to-use-thehive-security-incident-response-platform/

![[Pasted image 20250317165544.png]]

