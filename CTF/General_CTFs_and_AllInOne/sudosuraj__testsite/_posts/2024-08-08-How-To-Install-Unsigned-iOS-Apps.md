---
layout: post
title:  How to install unsigned iOS apps
author:  Suraj Sharma
date:  08-08-2024
categories:  [iOS]
tags:  [iOS, Mobile Application, bugbounty]
image:
  path: /assets/img/headers/ios.jpg
  alt: "ios"
---

# How to install unsigned iOS apps

## Pre-requisites
1. PC or laptop (Linux/Windows)
2. Jailbroken iOS Device (required)
3. Filza inatalled (optional)
4. terminal app in iOS device

### Step 1
In the pc, I have unc0ver IPA file, which I am gonna install in jailbreak iOS device, first, run this command to transfer IPA file as zip file into iOS device with SCP command.

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/654125ed-480d-4cfe-827f-d36038dccf3a)

### Step 2
Now, take the root shell of the iOS device using the SSH.

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/a7cd4ca6-67c8-4a19-a120-c5a5efb78322)

## Step 4
Open the directory where we copied the unsigned IPA file as zip file and use the unzip command to unzip.

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/57150221-5c25-4c05-9bab-3fbc4b8026b6)
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/25bc91bd-6ab1-4185-898c-f69bcc7519e8)

Here, after the unzip is done, we can find a new folder named **Payload**, inside that, we can see the **unc0ver.app** folder.

## Step 5
Now open the filza and open the same file location, and copy the **unc0ver.app** to **/Application** directory.

## Step 6
Now, open the terminal app in iOS device and run this command:
```@bash
uicache -a
```
Now you'll be able to see the app icon on home screen!
