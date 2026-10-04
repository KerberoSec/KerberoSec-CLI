```
▙ ▌   ▐            ▌   ▛▀▖▗                           ▞▀▖            ▐      ▞▀▖▜             
▌▌▌▞▀▖▜▀ ▌  ▌▞▀▖▙▀▖▌▗▘ ▌ ▌▄ ▞▀▘▞▀▖▞▀▖▌ ▌▞▀▖▙▀▖▌ ▌ ▄▄▖ ▚▄ ▞▀▖▝▀▖▛▀▖▄▄▖▜▀ ▝▀▖ ▌  ▐ ▝▀▖▌ ▌▞▀▘▞▀▖
▌▝▌▛▀ ▐ ▖▐▐▐ ▌ ▌▌  ▛▚  ▌ ▌▐ ▝▀▖▌ ▖▌ ▌▐▐ ▛▀ ▌  ▚▄▌     ▖ ▌▌ ▖▞▀▌▌ ▌   ▐ ▖▞▀▌ ▌ ▖▐ ▞▀▌▌ ▌▝▀▖▛▀ 
▘ ▘▝▀▘ ▀  ▘▘ ▝▀ ▘  ▘ ▘ ▀▀ ▀▘▀▀ ▝▀ ▝▀  ▘ ▝▀▘▘  ▗▄▘     ▝▀ ▝▀ ▝▀▘▘ ▘    ▀ ▝▀▘ ▝▀  ▘▝▀▘▝▀▘▀▀ ▝▀▘
```
In this THM roob, we discover how to scan network ports and uncover what is hidden behind
them. [^1]

What evil message do you see on top of the website?
-----------------------------------------------------------------------------------------
Upon scanning the target IP address with `nmap`, we discover that there are two ports
open. A SSH port for remote machine access and a HTTP port for a website. Therefore, we
open the website by visiting the target IP address in the browser and obtain the evil
message next to the crossed out title "TBFC QA" and a note by the King Malhare.

What is the first key part found on the FTP server?
-----------------------------------------------------------------------------------------
With the regular `nmap` command, we scanned only 1000 ports, but there are actually 65535
ports which are scanned with the `nmap -p-` command. Further, we can utilize the banner
script which prints out anything sent by the listening service within five seconds. This
is especially useful to find out what is likely behind a port with service names and
version numbers. [^2]
```
$ nmap -p- --script=banner <TARGET_MACHINE_IP>

PORT      STATE SERVICE
22/tcp    open  ssh
80/tcp    open  http
21212/tcp open  trinket-agent
|_banner: 220 (vsFTPd 3.0.5)
25251/tcp open  unknown
|_banner: TBFC maintd v0.2\x0AType HELP for commands.
```
Besides the web server and the secure shell, we thus discovered a FTP service on port
"21212", that could potentially allow file transfers. Also, the port "25251" is worth
investigating in the next task, since it is hosting an unkown service that appears be a
custom service.
The next step is, to connect to the FTP server with `ftp <TARGET_MACHINE_IP> 21212`
to discover any interesting files. And indeed, we can discover a file "tbfc_qa_key1" with
`ls` that upon downloading with `get` reveals the first key to us.

What is the second key part found in the TBFC app?
-----------------------------------------------------------------------------------------
Now, it is time to investigate the custom TBFC application on port "25251". In these
instances, we can utilize Netcat `nc`, which acts as a universal tool to interact with
network services. The command `nc -v <TARGET_MACHINE_IP> 25251` prompts us with an option
to enter commands and after getting `HELP` we get suspicious of the `GET KEY` command.
And indeed, with the `GET KEY` command we can get the second key.

What is the third key part found in the DNS records?
-----------------------------------------------------------------------------------------
Until now we have only scanned TCP ports, but there are 65535 ports accessible for UDP
as well and therefore worth investigating. Again, we can use `nmap` for port scanning
with the `nmap -sU <TARGET_MACHINE_IP>` command in UDP. This results in only one port
that was discovered, the port "53" with a domain service. This is associated with the
DNS protocol and we can therefore use `dig`, the domain information groper command. It
is commonly used to troubleshoot domain resolution issues and obtain information about
DNS records. [^3]

We run `dig` with the DNS `@server`, that is the target machine IP address in our case
and the type of the DNS record to retrieve, in our case TXT. Further, we want to obtain
only concise output with the essential information with the `+short` query option and
the `key3.tbfc.local` domain name: `dig @<TARGET_IP_ADDRESS> TXT key3.tbfc.local +short`

Which port was the MySQL database running on?
-----------------------------------------------------------------------------------------
We can log in to the secret admin console on the hijacked TBFC QA website with the three
key parts joined together. Since we now have access to the console, we can simply list
the open ports in the OS instead of scanning them from outside, with the command
`ss -tunlp`. Here, we discover the open port "3306" which is a default MySQL database
port.

Finally, what's the flag you found in the database?
-----------------------------------------------------------------------------------------
Since databases typically require a password for remote clients only, and not from
the localhost, we can see the database content with the following `mysql` commands.
This yields us a "flags" table that in turn contains the final flag.

```
$ mysql -D tbfcqa01 -e "show tables;"
$ mysql -D tbfcqa01 -e "select * from flags;" 
```

[^1]: https://tryhackme.com/room/networkservices-aoc2025-jnsoqbxgky
[^2]: https://nmap.org/nsedoc/scripts/banner.html
[^3]: https://www.ditig.com/dig-cheat-sheet
