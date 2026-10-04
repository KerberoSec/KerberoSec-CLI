# Shodan.io

### Introduction 

**Autonomous System Numbers**

An ASN is a global identifier of a range of IP addresses. Large companies will likely have 
their own ASN for all the IP addresses they own.

[ASN lookup tool](https://www.ultratools.com/tools/asnInfo)

### Filters

[Filter list](https://www.shodan.io/search/filters)

### Google & Filtering

ASN:AS15169

What is the top operating system for MYSQL servers in Google's ASN?

5.6.40-84.0-log (no longer accurate)

What is the 2nd most popular country for MYSQL servers in Google's ASN?

Netherlands

Under Google's ASN, which is more popular for nginx, HTTP or HTTPS?

HTTP (no longer accurate)

Under Google's ASN, what is the most popular city?

Moutain View (no longer accurate)

Under Google's ASN in Los Angeles, what is the top operating system according to Shodan?

PAN-OS (no longer accurate)

Using the Webcam search from the explore page, does Google's ASN have any webcams? Yay / nay.

Nay (potentially not accurate)

### Shodan Monitor

https://monitor.shodan.io/dashboard

### Shodan Dorking

has_screenshot:true encrypted attention

Uses optical character recognition and remote desktop to find machines compromised by 
ransomware on the internet.

screenshot.label:ics

vuln:CVE-2014-0160 Internet connected machines vulenrable to heartbleed. 

Solar Winds Supply Chain Attack by using Favicons:

http.favicon.hash:-1776962843

https://github.com/topics/shodan-dorks

### Browser Extension

Shodan.io browser extension gives results for the current webpage
