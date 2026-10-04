```
                        ______
  ____________    _____|\     \              ________    ________    ________    ________  _____             
 /            \  /     / |     |            /        \  /        \  /        \  /        \|\    \            
|\___/\  \\___/||      |/     /|           |\         \/         /||\         \/         /|\\    \           
 \|____\  \___|/|      |\____/ |           | \            /\____/ || \            /\____/ | \\    \          
       |  |     |\     \    | /            |  \______/\   \     | ||  \______/\   \     | |  \|    | ______  
  __  /   / __  | \     \___|/              \ |      | \   \____|/  \ |      | \   \____|/    |    |/      \ 
 /  \/   /_/  | |  \     \                   \|______|  \   \        \|______|  \   \         /            | 
|____________/|  \  \_____\                           \  \___\                \  \___\       /_____/\_____/| 
|           | /   \ |     |                            \ |   |                 \ |   |      |      | |    || 
|___________|/     \|_____|                             \|___|                  \|___|      |______|/|____|/ 
```
Find the TTL used to reach the targeted host in this ICMP exchange. [^1]

Solution
-----------------------------------------------------------------------------------------
After opening this challenge in `wireshark ch7.pcap`, we are presented with *76* ICMP
packets. Now, we want to find out the *Time To Live* (TTL) at the beginning of the ICMP
exchange which is a header in the IP protocol which defines how long a packet can travel
across the network before it will be dropped. This is used to prevent infinite routing
loops by dropping packets in case they take too many hops. The TTL header is given in all
IPv4 packets [^2] and so we want to find out the highest one in our capture. \
Out of curiosity, we open the *Expert Information* in Wireshark and are already given
valuable information about the TTL. Here, we can see messages labeled with a *Warning*
that there was "No response seen to ICMP request" indicating that the host failed to
respond. Here, we can see echo pings that contain at highest the *ttl=12* letting us
guess that the TTL was set to one more. And indeed, we already found out the TTL:
`Echo (ping) request id=0x0200, seq=9728/38, ttl=12 (no response found!)` \
Alternatively, we should have searched for the expression `ip.ttl == 13` and thus find
out that there does no higher TTL indeed.

[^1]: https://www.root-me.org/en/Challenges/Network/IP-Time-To-Live
[^2]: https://datatracker.ietf.org/doc/html/rfc791#autoid-9
