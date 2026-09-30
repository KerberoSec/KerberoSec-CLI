# HeartBleed

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/heartbleed/heartbleed01.png" width="150" height="150">

LINK = [https://tryhackme.com/room/heartbleed](https://tryhackme.com/room/heartbleed)

### FYI
This writeup don't include any passwords/cracked hashes/flags

# Description
SSL issues are still lurking in the wild. Can you exploit this web servers OpenSSL?

# Steps

The server is running a vulnerable version of OpenSSL detailled in [CVE-2014-0160](https://nvd.nist.gov/vuln/detail/CVE-2014-0160)

You can download [HERE](https://gist.github.com/eelsivart/10174134) the exploit for this vulnerabilitie (_The exploit works with Python 2.7_)

* ```python2.7 CVE-2014-0160.py <ip-virtual-machine> 443```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/heartbleed/heartbleed02.png" width="50%">

Get the flag!! 😎
