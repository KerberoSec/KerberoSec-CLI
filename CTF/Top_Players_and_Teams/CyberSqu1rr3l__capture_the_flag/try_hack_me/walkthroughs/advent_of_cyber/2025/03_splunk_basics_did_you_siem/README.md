```
▞▀▖   ▜       ▌   ▛▀▖      ▗            ▛▀▖▗   ▌           ▞▀▖▜▘▛▀▘▙▗▌▞▀▖
▚▄ ▛▀▖▐ ▌ ▌▛▀▖▌▗▘ ▙▄▘▝▀▖▞▀▘▄ ▞▀▖▞▀▘ ▄▄▖ ▌ ▌▄ ▞▀▌ ▌ ▌▞▀▖▌ ▌ ▚▄ ▐ ▙▄ ▌▘▌ ▗▘
▖ ▌▙▄▘▐ ▌ ▌▌ ▌▛▚  ▌ ▌▞▀▌▝▀▖▐ ▌ ▖▝▀▖     ▌ ▌▐ ▌ ▌ ▚▄▌▌ ▌▌ ▌ ▖ ▌▐ ▌  ▌ ▌ ▘ 
▝▀ ▌   ▘▝▀▘▘ ▘▘ ▘ ▀▀ ▝▀▘▀▀ ▀▘▝▀ ▀▀      ▀▀ ▀▘▝▀▘ ▗▄▘▝▀ ▝▀▘ ▝▀ ▀▘▀▀▘▘ ▘ ▘
```
In this THM room, we learn how to ingest and parse custom log data using Splunk.
Splunk is a platform for collecting, storing, and analysing machine data. It provides
various tools for analysing data, including search, correlation, and visualisation. [^1]

What is the attacker IP found attacking and compromising the web server?
-----------------------------------------------------------------------------------------
In this exercise, we are provided with a direct link to a Splunk instance. On the Splunk
interface, we click on the search and reporting application. Next, we want to investigate
all logs with the `index=main` search on the all time frame. In the sourcetype field, we
are prompted with two datasets, the `web_traffic` which contains events related to the
web connections to and from the server, and the `firewall_logs` which contains firewall
logging for allowed and blocked traffic. For now, we are interested in the web traffic
and from the interesting fields, we also investigate the `user_agent`. It becomes clear,
that apart from legitimate user agents, like Mozilla agents, we are counting suspicious
values, like `wget`, `python`, `sqlmap` and `Havij`, all hinting towards a SQL exploit
attack. Further, we can investigate the `client_ip` address to see one standing out in
particular, which is responsible for 45% of requests and proving to be the attack
actor's IP address.

Which day was the peak traffic in the logs? (Format: YYYY-MM-DD)
-----------------------------------------------------------------------------------------
For this question we select the time field and then the top values by time.
The resulting search query to get the peak traffic over time is
`index=main sourcetype=web_traffic| timechart count by time limit=10`.
This leads us to a visualization graph, where we can see that the most traffic of 2,264
events was on October 12, 2025. Alternatively, we can use the search query
`index=main sourcetype=web_traffic | timechart span=1d count | sort by count | reverse`

What is the count of Havij user_agent events found in the logs?
-----------------------------------------------------------------------------------------
With the `path` field, we can discover that the `/etc/password` file has been obtained
in an IDOR exploit.
Since we discovered unusual user agents in the previous tasks, it also makes sense to
filter out common ones and therefore obtain the suspicious ones with: 
`user_agent!=*Mozilla* user_agent!=*Chrome* user_agent!=*Safari* user_agent!=*Firefox*`
In addition to this filtering, we also want to narrow down suspicious IP addresses
with `stats count by client_ip | sort -count | head 5`. This leads us to the IP address,
that we already discovered in the first task.
For this task in particular, we want to filter the messages with `user_agent=*Haviji*`
and discover that the are 993 events from that user agent.

How many path traversal attempts to access sensitive files on the server were observed?
-----------------------------------------------------------------------------------------
In the reconnaissance phase, want to find out what configuration files were explosed by
the attacker with this search: `sourcetype=web_traffic client_ip="<ATTACKER_IP" AND
path IN ("/.env", "/*phpinfo*", "/.git*") | table _time, path, user_agent, status`
However, the attacker appears to have been using low-level tools, such as `curl` and
`wget` and got different error messages that could have lead to further investigation.
For example, some requests resulted in a 401 (Unauthorized), 403 (Forbidden) or 404 (Not
Found), enabling a footprinting overview of the victim.

In the enumeration phase, the attacker performed vulnerability testing on common path
traversal and open redirect vulnerabilities: `sourcetype=web_traffic
client_ip="<ATTACKER_IP>" AND path="\*..\*" OR path="\*redirect\*"`
There are already 1,291 events with the most common one to the `/etc/passwd` file and to
the `evil[.]` site redirect. Further, we can find out automated payload generation
requests with `user_agent IN ("*sqlmap*", "*Havij*") | table _time, path, status`.
In the results for the SQL injection attacks, we can see response status codes 504
(Gateway Timeout) which confirm a successful time-based attack with the `SLEEP(5)`
command. Since the attacker is trying to access files in the `../../` directory, we want
to update our search command to include this with `path="*..\/..\/*" OR path="*redirect*"
| stats count by path` and obtain a count of requests on the path for the password file
`/download?file=../../etc/passwd` for 658 times.

In the exfiltration stage, we can search for attempts to download large, sensitive
files, such as backups and logs with the `path IN ("*backup.zip*", "*logs.tar.gz*")
| table _time path, user_agent` command. Further, we can discover a Remote Code Execution
(RCE) attack with the execution of the shell `/shell.php?cmd=./bunnylock.bin` and search
`path IN ("*bunnylock.bin*", "*shell.php?cmd=*") | table _time, path, user_agent, status`
to get an overview of these attacks.

Finally, we want to have a look at the `firewall_logs` on the compromised server. Here,
we want to prove that the victim server immediately established an outbound connection
to the attacker's command and control (C2) server and can do that with:
`sourcetype=firewall_logs src_ip="<COMPROMISED_IP>" AND dest_ip="<ATTACKER_IP>" AND
action="ALLOWED" | table _time, action, protocol, src_ip, dest_ip, dest_port, reason`

How many bytes were transferred to the C2 server IP from the compromised web server?
-----------------------------------------------------------------------------------------
Upon examining the firewall logs, we come up with a search that filters the communication
from the victim server to the attacker's machine and sums up the bytes for every transfer
in the following command:
`sourcetype=firewall_logs src_ip="<COMPROMISED_IP>" AND dest_ip="<ATTACKER_IP>" AND
action="ALLOWED" | stats sum(bytes_transferred) by src_ip`
This search rewards us with the total bytes of around 126 KB for the total transfer of
sensitve data from the web server.

[^1]: https://tryhackme.com/room/splunkforloganalysis-aoc2025-x8fj2k4rqp
