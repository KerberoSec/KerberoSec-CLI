<h1 align="center"><a href="https://tryhackme.com/room/cloudsecuritypitfalls">Cloud Security Pitfalls</a></h1>
<p align="center">Explore the risks companies face when migrating to the cloud, and learn how to address them in a SOC.<br><br><img width="1200px" src="https://github.com/user-attachments/assets/e78e4395-aa2e-46df-b6da-e06ccb4159c0"><br>
If you find it helpful, consider coming back for research.<br><p align="center"><a href="https://github.com/RosanaFSS"><img src="https://img.shields.io/github/followers/RosanaFSS?label=Follow&style=for-the-badge&logo=github&color=24292e" alt="Follow Rosana on GitHub"></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="https://img.shields.io/badge/COMPLETED-2026%2C%20JAN%2029-444444?style=for-the-badge&logo=calendar-check" alt="Completion Date"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <a href="https://www.linkedin.com/in/rosanafssantos/"><img src="https://img.shields.io/badge/Connect-LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="Connect on LinkedIn"></a></p>

<br>
<h2>Task 1 . Introduction</h2>
<p>Many companies migrate their on-premises resources to the cloud to gain benefits such as cost savings, greater stability, and improved security. However, not all recognize the new risks that come with this transition, often leaving their assets even less protected than before. This beginner-friendly room outlines the risks and common pitfalls companies face when migrating to the cloud, and helps you understand how to protect them as a SOC analyst.</p>

<h3>Learning Objectives</h3>
<p>
  
- Learn the main cloud models: IaaS, PaaS, and SaaS<br>
- Explore security risks coming from the cloud providers<br>
- Understand the core concepts of security in the cloud<br>
- Identify the challenges of monitoring clouds as a SOC</p>

<h3>Prerequisites</h3>
<p>

- Know how the web and web applications work<br>
- Preferably, complete the SOC Level 1 path</p>

<p><em>Answer the question below</em></em></p>

<p>1.1. Continue to the next task!<br>
<code>No answer needed</code></p>
<br>
<h2>Task 2 . What Is Cloud</h2>
<h3>What Is Cloud</h3>
<p>The cloud is a paradigm in which computing resources are hosted and managed by third-party providers and delivered on demand via the Internet. Users can access, configure, and pay for these services as needed, without owning or maintaining the underlying hardware. AWS, Google Drive, and even TryHackMe are all "clouds" of some sort. There are three main cloud service models you should know about: IaaS, PaaS, and SaaS. Let's explore them one by one!</p>

<h3>IaaS</h3>
<p>Managing a server room or data center can be challenging: You are fully responsible for its physical security, hardware stability, software updates, network routing, and many other tasks. Every IT company needs some computing power to run its business, but not every company has the expertise or resources to maintain and properly secure its own servers.<br>

That's the problem Infrastructure as a Service (IaaS) tries to solve. IaaS is a cloud service model where computing infrastructure is provided online on demand. For example, with an IaaS provider like Amazon AWS, Google Cloud, or Microsoft Azure, you can launch any virtual machine in the cloud just by clicking a button in a web GUI, without worrying about power outages and hardware failures.</p>

<h6 align="center"><img width="800px" src="https://github.com/user-attachments/assets/f6ede69e-c753-4f09-9538-4f19b5dba378"><br>This image and all the theoretical content of the present article is TryHackMe´s property.</h6>

<h3>PaaS</h3>
<p>For some companies, IaaS is not enough. For example, software developers don't want to bother with launching virtual machines: all they want is to write the source code, click a button, and see their application up and running, without caring much how and where it actually runs. Such requests are covered with Platform as a Service (PaaS): a cloud service model for simple development and hosting web applications.<br>

Interestingly, TryHackMe also offers PaaS features, as you can create your own private or public rooms and then host them in the cloud, without knowing how it works internally. In turn, TryHackMe uses IaaS (Amazon AWS) to host its infrastructure, including in-room virtual machines. Other PaaS offerings include Vercel, Heroku, and Google App Engine.</p>

<h6 align="center"><img width="800px" src="https://github.com/user-attachments/assets/6459d44c-0a92-4d23-ab67-0f3c4d9b3089"><br>This image and all the theoretical content of the present article is TryHackMe´s property.</h6>

<h3>SaaS</h3>
<p>Software as a Service (SaaS) allows users and companies to launch complex applications in the cloud without installing any software on their computers. Slack, Zoom, Gmail, Dropbox, and Google Docs are among the thousands of SaaS offerings. Unlike the previous models, SaaS is always a final product that can be used by a non-technical audience. Let's see a comparison table below for a simpler understanding:</p>

<h6 align="center"><img width="800px" src="https://github.com/user-attachments/assets/eb67694c-3472-444e-86b3-c12f592a9224"><br>This image and all the theoretical content of the present article is TryHackMe´s property.</h6>

<p>It's fun to think about how you can combine the models. For example, if you develop a cat image generator, make it a public web service, and host it in AWS, you'll get SaaS on IaaS (or CataaS). What you should remember is that the "as a service" approach always implies some form of abstraction, where a maintenance burden is taken from you and delegated to a cloud service provider.</p>

<p><em>Answer the questions below</em></em></p>

<p>2.1. Which cloud model allows you to migrate a big on-premises network to the cloud?<br>
<code>IaaS</code></p>
<br>
<p>2.2. Which cloud model do Elastic Cloud and CrowdStrike Falcon fit into? Note: You may need to perform external research to answer this question.<br>
<code>SaaS</code></p>
<br>
<h2>Task 3 . Security OF the Cloud</h2>
<h3>Security OF the Cloud</h3>
<p>Cloud computing is a complex topic, but it is built on top of the same core technologies as traditional on-premises. For instance, AWS often shares insights into its internal architecture (video 1, video 2), where familiar concepts like TCP/IP and Linux play a key role. There is even a saying that "the cloud is just someone else's computer". This is why you must know that clouds are not invulnerable and, just like your computer, are at risk of attacks. Security of the cloud provider's internal infrastructure is often called Security of the cloud:</p>

<h6 align="center"><img width="500px" src="https://github.com/user-attachments/assets/10e86677-b335-4b1b-9abc-463c4fdd8e6d"><br>This image and all the theoretical content of<br>the present article is TryHackMe´s property.</h6>

<h3>Risk of Cloud Vulnerabilities</h3>
<p>Biggest clouds are built with security in mind, and it's extremely rare to see them getting breached. However, it's still possible, and when they occur, attackers often target the provider's largest customers. Treat this as a form of supply chain risk: don't blindly trust the cloud provider, but apply the same defensive principles: segment the network, analyze login activity, and monitor endpoint behavior.<br>

For less popular cloud services, the chance of compromise is much higher. There were many cases where a breach of a local IaaS provider resulted in the deployment of malware on all hosted VMs, or where a breach of SaaS led to the exposure of sensitive data. This is why you should carefully choose your cloud vendor and decide what to entrust them with.</p>

<h6 align="center"><img width="500px" src="https://github.com/user-attachments/assets/3538c519-ace8-4ecc-857f-46ba48be36e0"><br>This image and all the theoretical content of<br>the present article is TryHackMe´s property.</h6>

<h3>Risk of Poor Cloud Visibility</h3>
<p>The risks associated with cloud breaches are amplified by the fact that, as an end user, you have no visibility into the cloud provider's internal environment. For example, between August 8 and August 18, 2025, adversaries used stolen Salesloft (SaaS) OAuth tokens to exfiltrate data from certain SaaS customers' tenants. As an end user, you can't detect it, as the malicious activity occurred entirely within SaaS infrastructure: essentially, "someone else's computer".<br>

No matter how mature your SOC is, using cloud services means entrusting your data to third-party vendors, who will never provide their internal security logs upon request. This is especially critical to maintain control over SaaS usage. Other departments may unknowingly upload sensitive data to untrusted SaaS applications, creating shadow IT risks that can later lead to unexpected breaches.</p>

<h6 align="center"><img width="500px" src="https://github.com/user-attachments/assets/d426bcbf-5c51-4c7b-8736-f36cc8db6d90"><br>This image and all the theoretical content of<br>the present article is TryHackMe´s property.</h6>

<h3>Incidents of the Cloud</h3>

<h6 align="center"><img width="800px" src="https://github.com/user-attachments/assets/27b05cde-2b27-482c-acf6-eed44898bbc1"><br>This image and all the theoretical content of the present article is TryHackMe´s property.</h6>

<p><em>Answer the questions below</em></em></p>

<p>3.1. Is the cloud provider responsible for securing and monitoring its own infrastructure (Yea/Nay)?<br>
<code>Yea</code></p>
<br>
<p>3.2. But should you trust the cloud provider without watching for supply chain threats? (Yea/Nay)<br>
<code>Nay</code></p>
<br>
<h2>Task 4 . Security IN the Cloud</h2>
<h3>Security IN the Cloud</h3>
<p>The previous task was about the security of the cloud: something that the cloud provider takes care of. However, it's still your responsibility to protect resources in the cloud: VMs you host in IaaS, applications you build with PaaS, or credentials to your SaaS accounts. Everything you have in the cloud requires the same level of monitoring and hardening as on-premises systems. Check out the Shared Responsibility Model for more details.</p>

<h6 align="center"><img width="500px" src="https://github.com/user-attachments/assets/5ae66897-cdd7-4f42-baae-256d506b31b9"><br>This image and all the theoretical content of<br>the present article is TryHackMe´s property.</h6>

<h3>Cloud Migration Pitfalls</h3>
<p>There is a misconception that migrating an old, unpatched virtual machine to the cloud somehow makes it new and secure, or that moving files to Google Drive guarantees protection from ransomware. Neither is true. While cloud environments can reduce exposure to certain traditional attack vectors, they also introduce new, cloud-specific threats that are often overlooked by IT teams.<br>

Another issue is that people tend to apply their on-premises security practices to cloud environments. For instance, it is acceptable to use 12-character passwords without MFA in an isolated Active Directory network, but it is critically dangerous in public clouds accessible from anywhere. Cloud security requires a unique approach, which you will learn about in the following rooms.</p>

<h6 align="center"><img width="500px" src="https://github.com/user-attachments/assets/d4b2e732-38db-4b81-84b5-8f8a6eda479a"><br>This image and all the theoretical content of<br>the present article is TryHackMe´s property.</h6>

<h3>Logging IN Clouds</h3>
<p>Since you can't install the SIEM agent in the cloud and collect logs from there the same way as from on-premises, you have to rely on the cloud provider's solution. Some vendors provide comprehensive logging services, such as AWS CloudTrail, which you will learn in the next room. However, in the majority of cases, cloud logging is limited, especially in SaaS, where:<br>

- <strong>Paid Logs</strong>: Logging to SIEM may require an additional payment or license<br>
- <strong>Poor Format</strong>: Log fields may be incomplete, unstructured, or not documented<br>
- <strong>Lack of Integration</strong>: In some cases, solutions don't support logging to SIEM at all</p>

<h3>Incidents IN the Cloud</h3>

<h6 align="center"><img width="800px" src="https://github.com/user-attachments/assets/a567a38a-a1ee-475d-b161-ca4555d0aac1"><br>This image and all the theoretical content of the present article is TryHackMe´s property.</h6>

<p><em>Answer the questions below</em></em></p>

<p>4.1. Does moving an unpatched server to the cloud make it secure again? (Yea/Nay)<br>
<code>Nay</code></p>
<br>
<p>4.2. What is the first major obstacle to integrating most cloud products with a SIEM?<br>
<code>paid logs</code></p>
<br>
<h2>Task 5 . Cloud Security Monitoring</h2>
<h3>What to Protect and Monitor</h3>
<p>The effort required to build monitoring <strong>in</strong> the cloud differs depending on the cloud service model. For example, SaaS is the simplest, as all you have to do is ingest the logs in SIEM via the provider's API and monitor for risky actions, such as when a confidential Google Drive document is made public, an internal GitHub repository is downloaded, or when someone logs in to Notion from a suspicious IP and exports all corporate pages. On the other hand, covering IaaS is a more challenging task, as you need to cover both:<br>

- <strong>Workloads</strong>: Monitor virtual machines or containers, same as in on-premises<br>
- <strong>Cloud Services</strong>: Monitor database queries, storage access, and many more<br>
- <strong>Control Plane</strong>: Monitor logins and actions within the cloud admin console</p>

<h3>Data Sources for Monitoring</h3>
<p>On-premises endpoint monitoring typically relies on EDR, SIEM, and forensic tools. But in the cloud, the tools change drastically. EDRs are often unsupported due to containerized workloads and auto-scaling; SIEM integration with the provider's logging APIs may be difficult; and forensic investigation is constrained by a lack of accessible memory or disk artifacts. The image below illustrates the differences in cloud and on-premises logging:</p>

<h6 align="center"><img width="800px" src="https://github.com/user-attachments/assets/1cdd9e41-708f-44ae-b2a8-34757030f9b4"><br>This image and all the theoretical content of the present article is TryHackMe´s property.</h6>

<h3>Common Cloud Security Tools</h3>
<p>Many specialized solutions begin to pop up to cover what traditional tools can't cover in the clouds. Cloud Access Security Brokers (<strong>CASB</strong>) enforce security policies, Cloud Workload Protection Platforms (<strong>CWPP</strong>) protect against malware, Cloud Security Posture Management (<strong>CSPM</strong>) alert on misconfigurations, and so on. While we encourage you to read about them more, you can still set up monitoring just with SIEM and have a decent SOC coverage:</p>

<h6 align="center"><img width="800px" src="https://github.com/user-attachments/assets/c817ea20-b16f-4e6e-a0a7-6eff861c4f92"><br>This image and all the theoretical content of the present article is TryHackMe´s property.</h6>

<p><em>Answer the questions below</em></em></p>

<p>5.1. What term describes cloud compute resources like VMs or containers?<br>
<code>workloads</code></p>
<br>
<p>5.2. Which of the mentioned cloud security tools do Falco and Tetragon fit into? Note: You may need to perform external research to answer this question.<br>
<code>CWPP</code></p>
<br>
<h2>Task 6 . Challenge</h2>
<h3>Cloud Security Challenge</h3>
<p>In this task, you will explore the differences between cloud service models and repeat the Shared Responsibility Model: what you manage versus what the vendor manages. Visit the static site below, complete the exercises, and get the flags!<br>

- Access: Granted<br>
- URL : Static Site</p>

<p><em>Answer the questions below</em></em></p>

<p>6.1. What is the flag you get after completing the first exercise?<br>
<code>THM{••••••••••••••••••}</code></p>

<h6 align="center"><img width="1200px" src="https://github.com/user-attachments/assets/b896a8f2-9afb-4650-9c1e-09b63cae46ff"></h6>

<br>
<p>6.2. What is the flag you get after completing the second exercise?<br>
<code>THM{••••••••••••••••••••••••••}</code></p>

<h6 align="center"><img width="1200px" src="https://github.com/user-attachments/assets/84b6c67a-a1db-43ad-a646-c058da2c7d5f"><br><br>
                   <img width="1200px" src="https://github.com/user-attachments/assets/f91c0dae-d6ec-4191-98e6-e1cb61d719f4"></h6>

<br>
<h2>Task 7 . Conclusion</h2>
<p>In this room, you explored the differences between IaaS, PaaS, and SaaS cloud service models, uncovered often-overlooked risks, and examined common pitfalls organizations face when migrating to the cloud. You also learned that protecting clouds is not easy, and that there are many challenges in log collection and SOC coverage to ensure proper security monitoring. In the upcoming rooms, you will dive deeper into the technical details using AWS (IaaS) and Entra ID (SaaS) as examples. Hope you enjoyed the room!</p>
<p><em>Answer the questions below</em></em></p>

<p>7.1. Complete the room!<br>
<code>No answer needed</code></p>

<br>
<h1 align="center">Walkthrough Room Completed</h1>

<p align="center"><img width="900px" src="https://github.com/user-attachments/assets/ff0d41b7-b291-41cf-9945-299843d14abb"><br>
                  <img width="900px" src="https://github.com/user-attachments/assets/f5af401e-2b09-464f-b0f0-8fefbe0fe79d"><br>
                  <img width="900px" src="https://github.com/user-attachments/assets/7102046a-3288-4f69-80e1-052c2133c98a"></p>

                
<h1 align="center">My TryHackMe Journey ・ 2026, January</h1>

<div align="center"><h6>

| Date<br><br>   | Room <br><br> |Streak<br><br>   |Global<br>All Time|Brazil<br>All Time|Global<br>Monthly|Brazil<br>Monthly|Points<br><br>|Rooms<br>Completed|Badges<br><br>|
|:------:|:--------------------------------------|:--------:|:------------:|:------------:|:------------:|:------------:|:------------:|:------------:|:------------:|
|29     |Easy 🔗: Cloud Security Pitfalls     |28|      60ᵗʰ  |     3ʳᵈ    |       67ᵗʰ   |        2ⁿᵈ     |    144,704  |    1,075    |    90     |    
|29     |Medium 🚩: First Shift CTF           |28|      61ˢᵗ  |     3ʳᵈ    |       66ᵗʰ   |        2ⁿᵈ     |    144,624  |    1,075    |    90     |
|27     |Medium 🔗: GeoServer: CVE-2025-58360 |26 |     67ᵗʰ  |     3ʳᵈ    |       73ʳᵈ   |        2ⁿᵈ     |    144,174  |    1,074    |    90     |
|26     |Medium 🚩: First Shift CTF, in progress|25|    66ᵗʰ  |     3ʳᵈ    |       73ʳᵈ   |        2ⁿᵈ     |    144,102  |    1,073    |    90     |
|25     |Medium 🔗: MS Entra ID: Zero Trust   |24 |     70ᵗʰ  |     3ʳᵈ    |       79ᵗʰ   |        2ⁿᵈ     |    143,292  |    1,073    |    88     |
|24     |Medium 🚩: First Shift CTF, in progress|23|    70ᵗʰ  |     3ʳᵈ    |       76ᵗʰ   |        2ⁿᵈ     |    143,104  |    1,072    |    88     |
|24     |Easy ⚔️: Health Hazard               |23 |     78ᵗʰ  |     3ʳᵈ    |       94ᵗʰ   |        2ⁿᵈ     |    142,264  |    1,072    |    88     |
|23     |Medium ⚙️: BlackCat                  |22 |     79ᵗʰ  |     3ʳᵈ    |      104ᵗʰ   |        2ⁿᵈ     |    142,189  |    1,072    |    88     |
|22     |Hard 🚩: Azure: Tapper               |21 |     82ⁿᵈ  |     3ʳᵈ    |      176ᵗʰ   |        2ⁿᵈ     |    141,154  |    1,072    |    88     |
|22     |Easy ⚙️: Hidden Hooks                |21 |     82ⁿᵈ  |     3ʳᵈ    |      189ᵗʰ   |        3ʳᵈ     |    141,059  |    1,071    |    88     |
|22     |Medium 🔗: ret2libc                  |21 |     82ⁿᵈ  |     3ʳᵈ    |      193ʳᵈ   |        3ʳᵈ     |    140,979  |    1,071    |    88     |
|20     |Easy 🔗: MS Entra ID: Hybrid Identities|19|    82ⁿᵈ  |     3ʳᵈ    |      184ᵗʰ   |        2ⁿᵈ     |    140,971  |    1,069    |    88     |
|19     |Easy ⚙️: Upload and Conquer          |18 |     81ˢᵗ  |     3ʳᵈ    |      181ˢᵗ   |        2ⁿᵈ     |    140,859  |    1,068    |    88     |
|18     |Easy 🔗: MS Entra ID: Identities     |17 |     83ʳᵈ  |     3ʳᵈ    |      341ˢᵗ   |        3ʳᵈ     |    139,864  |    1,068    |    88     |
|18     |Easy ⚙️: APT28: Initial Access       |17 |     84ᵗʰ  |     3ʳᵈ    |      341ˢᵗ   |        3ʳᵈ     |    139,752  |    1,067    |    88     |
|18     |Easy ⚙️: Hidden Hooks                |17 |           |     3ʳᵈ    |              |                |             |    1,067    |    88     |
|17     |Easy 🔗: MS Entra ID: Introduction   |17 |     83ʳᵈ  |     3ʳᵈ    |      359ᵗʰ   |        3ʳᵈ     |    139,657  |    1,067    |    88     |
|17     |Easy ⚙️: APT28: Credential Access    |17 |           |     3ʳᵈ    |              |                |             |    1,067    |    88     |
|17     |Medium ⚙️: Open Door                 |17 |           |     3ʳᵈ    |              |                |             |     1,067   |    88     |
|17     |Easy 🔗: Offensive Security Intro    |16 |     87ᵗʰ  |     3ʳᵈ    |      504ᵗʰ   |        5ᵗʰ     |    139,099  |    1,067    |    88     |
|16     |Hard 🚩: Spring                      |15 |     87ᵗʰ  |     3ʳᵈ    |      540ᵗʰ   |        4ᵗʰ     |    138,942  |    1,066    |    87     |
|14     |Insane 🚩: Scheme Catcher            |13 |     87ᵗʰ  |     3ʳᵈ    |      534ᵗʰ   |        5ᵗʰ     |    138,822  |    1,065    |    87     |
|13     |Hard 🚩: Breachblocker Unlocker      |12 |     86ᵗʰ  |     3ʳᵈ    |      526ᵗʰ   |        5ᵗʰ     |    138,732  |    1,064    |    87     |
|11     |Medium 🚩: Azure: Eyes Wide Shut     |10 |     86ᵗʰ  |     3ʳᵈ    |      558ᵗʰ   |        5ᵗʰ     |    138,450  |    1,063    |    86     |
|8      |Medium ⚙️: Phishing Unfolding        | 7 |     86ᵗʰ  |     3ʳᵈ    |      508ᵗʰ   |        4ᵗʰ     |    138,372  |    1,062    |    84     |
|8      |Easy ⚙️: Introduction to Phishing    | 7 |     96ᵗʰ  |     3ʳᵈ    |    2,479ᵗʰ   |       32ⁿᵈ     |    137,117  |    1,062    |    84     |
|8      |Medium 🔗: KaffeeSec: SoMeSINT      | 7 |     98ᵗʰ  |     3ʳᵈ    |    2,847ᵗʰ   |       38ᵗʰ     |    137,052  |    1,062    |    84     |
|7      |Hard 🚩: Hack Back                   | 6 |     98ᵗʰ  |     3ʳᵈ    |    2,798ᵗʰ   |       37ᵗʰ     |    136,908  |    1,061    |    84     |
|7      |Hard 🚩: Dead End?                   | 6 |     99ᵗʰ  |     3ʳᵈ    |    2,924ᵗʰ   |       37ᵗʰ     |    136,788  |    1,060    |    84     |
|6      |Easy 🔗: Linux Strength Training     | 5 |     98ᵗʰ  |     3ʳᵈ    |    3,172ⁿᵈ   |       47ᵗʰ     |    136,608  |    1,059    |    84     |
|4      |Medium 🚩: JVM Reverse Engineering   | 3 |     96ᵗʰ  |     3ʳᵈ    |    3,031ˢᵗ   |       46ᵗʰ     |    136,450  |    1,058    |    84     |
|3      |Medium 🚩: Carrotbane of My Existence| 2 |     96ᵗʰ  |     3ʳᵈ    |    3,468ᵗʰ   |       49ᵗʰ     |    136,150  |    1,057    |    84     |
|2      |Easy 🔗: Learn Rust                  | 1 |     96ᵗʰ  |     3ʳᵈ    |    5,152ⁿᵈ   |       67ᵗʰ     |    136,030  |    1,056    |    84     |

</h6></div><br>

<p align="center">Global All Time:     60ᵗʰ<br><img width="250px" src="https://github.com/user-attachments/assets/1f7641b6-5ad9-487d-8058-0557bf52663e"><br>
                                              <img width="1200px" src="https://github.com/user-attachments/assets/80a32b64-23e8-440c-b0bb-b5a56f099e52"><br><br>
                  Brazil All Time:      3ʳᵈ<br><img width="1200px" src="https://github.com/user-attachments/assets/96ef053a-26ad-447d-9d85-d477fd4c042a"><br><br>
                  Global monthly:      67ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/7c3d5e68-3771-41e0-bbab-fdc79432008b"><br><br>
                  Brazil monthly:       2ⁿᵈ<br><img width="1200px" src="https://github.com/user-attachments/assets/283896ca-842e-47dd-8030-e136d9e15f35"></p>

<h1 align="center">Thanks for coming!</h1>
<p align="center">Follow me on <a href="https://medium.com/@RosanaFS">Medium</a>, here on <a href="https://github.com/RosanaFSS/TryHackMe">GitHub</a>, and on <a href="https://www.linkedin.com/in/rosanafssantos/">LinkedIN</a>.</p
<br>

