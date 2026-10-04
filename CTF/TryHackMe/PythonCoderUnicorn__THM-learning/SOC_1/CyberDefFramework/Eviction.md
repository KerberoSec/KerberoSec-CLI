
https://tryhackme.com/r/room/eviction

a classified intelligence report that informs her that an APT group (APT28) might be trying to attack organizations similar to E-corp. To act on this intelligence, she must use the MITRE ATT&CK Navigator to identify the TTPs used by the APT group, to ensure it has not already intruded into the network, and to stop it if it has.

https://static-labs.tryhackme.cloud/sites/eviction/

```
What is a technique used by the APT to both perform recon and gain initial access?

spearphishing link

Sunny identified that the APT might have moved forward from the recon phase. Which accounts might the APT compromise while developing resources?

resource development > email account 

E-corp has found that the APT might have gained initial access using social engineering to make the user execute code for the threat actor. Sunny wants to identify if the APT was also successful in execution. What two techniques of user execution should Sunny look out for? (Answer format: <technique 1> and <technique 2>)

execution phase > user execution > Malicious file and malicious link

If the above technique was successful, which scripting interpreters should Sunny search for to identify successful execution? (Answer format: <technique 1> and <technique 2>)

execution > command & scripting > Powershell and Windows Command shell

While looking at the scripting interpreters identified in Q4, Sunny found some obfuscated scripts that changed the registry. Assuming these changes are for maintaining persistence, which registry keys should Sunny observe to track these changes?

persistence > registry run keys

Sunny identified that the APT executes system binaries to evade defences. Which system binary's execution should Sunny scrutinize for proxy execution?

defense evasion > system binary proxy execution > rundll32

Sunny identified tcpdump on one of the compromised hosts. Assuming this was placed there by the threat actor, which technique might the APT be using here for discovery?

discovery > network sniffing

It looks like the APT achieved lateral movement by exploiting remote services. Which remote services should Sunny observe to identify APT activity traces?

lateral movement > exploit remote services > smb/windows admin shares

It looked like the primary goal of the APT was to steal intellectual property from E-corp's information repositories. Which information repository can be the likely target of the APT?

collection > data from info repo > sharepoint

Although the APT had collected the data, it could not connect to the C2 for data exfiltration. To thwart any attempts to do that, what types of proxy might the APT use? (Answer format: <technique 1> and <technique 2>)

command & control > proxy > external proxy and multi-hop proxy

```