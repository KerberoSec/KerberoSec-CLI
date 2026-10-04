---
title: surfer writeup
description: 
date: 2026-03-10 21:00:21+0000
categories:
    - tryhackme
tags:
    - tryhackme
---

- 
- directory fuzzing
```
gobuster dir -u "http://10.48.179.224/" -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 6 -x php,txt,html
```
- 
- 
- 
- 

- this looks interesting
- 

- this means credentials are admin:admin
- 
- 

- ok
- click generate pdf report

- 
- if we can forge request using this we can get flag in that report
- let's capture this request
- 

- modify it to /internal/admin.php endpoint

- 