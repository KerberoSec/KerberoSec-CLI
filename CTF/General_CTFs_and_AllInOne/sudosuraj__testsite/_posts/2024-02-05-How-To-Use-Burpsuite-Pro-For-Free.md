---
layout: post
title:  How To Use Burpsuite Pro For Free
author:  0xbug
date:  2024-02-05
categories:  [bugbounty]
tags:  [bugbounty, bugbountytips]
image:
  path: /assets/img/headers/Burp-Suite-logo.png
  alt: Burpsuite Pro
---
#  How To Use Burpsuite Pro For Free
Hello Friend!  
In this bug bounty tip, I will walk you through how you can use burpsuite pro for free in Linux or Windows environment.  
**(Note: This is for education purpose only)**  
##  What is Burpsuite Pro and why we need this?
Burp Suite is a popular web application security testing tool used by both professional security researchers and developers. It comes in two main versions: Burp Suite Community Edition (free) and Burp Suite Professional (paid). While both versions offer valuable functionalities, Burp Suite Professional boasts several additional features that cater to more advanced security testing needs.  
##  Download and Installation
Just clone [this github repo](https://github.com/sudosuraz/Burpy)  
```bash
git clone https://github.com/sudosuraz/Burpy.git  
cd Burpy  
```
##  Setup in Linux environment
```bash
sudo su
bash Linux_setup.sh  
```
Now, change the license name to as your desire, and activate license, click on run button.  
Copy this licese key.  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/7da39eef-fdd7-4d56-91ec-136d06ac9c01)  
Paste it here in burpsuite, and click on next, click on manual activation as follow!  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/a9f1aeab-1195-4e5d-abfc-61b647985798)  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/e3c66783-6989-44d0-845d-4a4966d77714)  
Now, copy this request and paste it in the loader as follow, and after that copy the response from the loader and paste in the
burpsuiite pro license activation wizard.  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/ff1b3988-2f88-42a5-b75c-92d2d511fd7c)  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/108d2619-2cfc-42a4-8b0e-862f0e3ac2b8)  
click on next.
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/a392db33-5f3b-43d8-988b-89d38d7b5ead)  
Now, we have successfully activated our license.  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/f34fa03c-35de-4fb4-825e-1f684b746511)

To make things easier, copy this run command and make an alias in **.bashrc** file.  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/b9b83a97-9598-40ca-9cde-000fa37b1866)
```bash
alias burpy='"/usr/lib/jvm/java-17-openjdk-amd64/bin/java" "--add-opens=java.desktop/javax.swing=ALL-UNNAMED" "--add-opens=java.base/java.lang=ALL-UNNAMED" "--add-opens=java.base/jdk.internal.org.objectweb.asm=ALL-UNNAMED" "--add-opens=java.base/jdk.internal.org.objectweb.asm.tree=ALL-UNNAMED" "--add-opens=java.base/jdk.internal.org.objectweb.asm.Opcodes=ALL-UNNAMED" "-javaagent:/usr/share/burpsuite/loader.jar" "-noverify" "-jar" "/usr/share/burpsuite/burpsuite_pro_v2023-12-1.jar" '
```  
Enjoy!!!  

 
