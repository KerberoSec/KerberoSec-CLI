---
layout: post
title:  "RHCE Review"
description: Red Hat Certified Engineer (RHCE) certification preparation, resources and exam tips used to successfully pass the exam.  
tags: sysadmin
---

_"An RHCE certification is earned by a Red Hat Certified System Administrator (RHCSA) who has demonstrated the knowledge, skill, and ability required of a senior system administrator responsible for Red Hat Enterprise Linux systems."_

## Exam Details
The RHCE, Red Hat Certified Engineer, is an exam that covers primarily server-side technologies such as NFS, Apache web server, and MariaDB. The exam is hands-on meaning test takers must complete tasks on a server to earn points. One can imagine the exam itself as a manager dropping off a list of system administration tasks that must be completed in 3.5 hours. By the end of that time, the servers then graded based on what was successfully configured AFTER a reboot. The passing score is a 210/300.

## Background
Prior to passing the RHCE certification, I was Linux system administrator for 2.5 years. In this time, I had no prior knowledge, passed the RHCSA, and setup various systems such as Nagios, Spacewalk, BareOS/Bacula, and Splunk.

## Study Resources
### Home Lab
For the RHCSA, I was able to study the objectives using a few virtual machines on my laptop. However, the RHCE objectives require many services that together would make up a small network. Running this many virtual machines would scale past the limits of my laptop, so I decided to purchase a used Dell Optiplex for the purpose of studying for the RHCE. This was the BEST investment I made during this process. As I configured services such as DNS and NTP, I configured my home router to use these services rather than Google's DNS. This made my studying more practical and I could see my DNS activity as I surfed the internet. As I studied more, my Dell Optiplex reached up to 9 servers with various systems like Samba, iSCSI, and SMTP. All of these servers could be actively used within my home network and made the studying feel more practical.

### CertDepot
One of the best websites out there while studying for the RHCE was [CertDepot](https://certdepot.net). The individual running this site took all of the exam objectives and wrote tutorials on how to complete them in a step-by-step fashion. This was a great reference and some people could probably use this as their only study source and pass. Almost as valuable as the tutorials are the comments people leave at the bottom of each tutorial. People ask questions and show their errors as they attempt to complete the objective. Taking a look through the comments can be valuable to see what kind of errors can be expected and how to resolve them.

### Asghar Ghori
Along with the previous two resources, I read Asghar Ghori's book, [RHCSA & RHCE Red Hat Enterprise Linux 7](http://a.co/d/5Zd7Umj). Rather than just memorizing the commands from CertDepot, understanding the underlying concepts was essential for me and that is what the book assisted with. Examples of the commands were in the book, however, information about the services and concepts could be found throughout the book explaining the real world use case. The author did a great job with the book and was a great resource while preparing for the exam.

## Exam Tips
### Learn the man pages
3.5 hours may seem like a decent amount of time, but the time flies by and nervousness can cause exam takers to forget configurations and commands. With that being said, there are man pages that are ESSENTIAL for quick reference when commands are forgotten:
* man targetcli
* man iscsiadm
* man nmcli-examples
* man teamd.conf
* man firewalld.richlanguage
* cat /usr/share/doc/postfix-\*/README_FILES/STANDARD_CONFIGURATION_README
* cat /usr/share/doc/httpd-\*/httpd-vhosts.conf

Knowing where to find the man pages and documentation can be more important than memorizing the actual commands. Trying to remember every detail is challenging, however, the man pages and documentation can assist tremendously!

### Copy and paste
To avoid errors in configuration, try to copy and paste whenever possible. If a virtual host configuration is needed, simply copy and paste the template from the documentation and edit the values carefully to match the task. This will help avoid unnecessary troubleshooting later when a space is missing or an argument is spelled wrong! Every minute is precious, so do not waste it on simple mistakes that could have been avoided by copying.

### Reboot often
The exam is graded after the systems are rebooted, so configurations must be persistent. Be sure to reboot after every few tasks to ensure the configurations are done correctly and last after a reboot. Or worse, ensure they do not break your system after a reboot. The last thing anyone wants to hear is that they received a 0/300 due to a machine not being bootable. To avoid this, reboot often and fix changes as needed.

## Final Thoughts
Red Hat has an incredible exam environment that truly makes test takers know their stuff. This is no multiple choice exam that people can simply slide by. I would highly recommend others who are interested in Linux to study and attempt the exams. I use nearly all of my knowledge gained from the exams in my job and it has made me a better system administrator.

*[Image: rhce-cert]*{:class="img-responsive"}
