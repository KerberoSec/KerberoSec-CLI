
# osint1 (osint)

# Intructions to contestant
You're a blade runner trying to find a rogue replicant.  You are conducting open source research trying to find just where Tyrell may be hiding information.  It looks like Tyrell may be hosting a server in France.  What's the finger print of its SSH server?

WARNING:  NO HACKING/SCANNING OF ANY KIND IS REQUIRED TO GET THE ANSWER TO THIS FLAG.  USE ONLY OPEN SOURCE RESEARCH TO FIND THE SERVER
Hint:  submit the answer in acsc2017{<ANSWER>} fortmat

# Solution
A search of shodan.io for the word "Tyrell" brings up a total of 7 results.  Only one of those systems is in France.  The term Tyrell relates to its answer for NETBIOS but when we look at its SSH service running on ports 443 and 2222 we see that the fingerprint is 7e:3f:11:49:6d:cc:5b:66:1e:eb:fc:78:cc:4e:9a:85

# Flag:  acsc2017{7e:3f:11:49:6d:cc:5b:66:1e:eb:fc:78:cc:4e:9a:85}
