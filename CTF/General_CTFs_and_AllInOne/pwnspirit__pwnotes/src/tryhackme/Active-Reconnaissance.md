# Active Reconnaissance
**Learn how to use simple tools such as traceroute, ping, telnet, and a web browser to gather information.**

![img](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

Active reconnaissance is the process of gathering information about a target system, network, or application by directly interacting with it. This typically involves sending requests or signals to the target to observe its responses. Examples include scanning for open ports, testing vulnerabilities, or using tools like **nmap**, **ping**, or **Nikto**.

### Web Browser 
An Web browser is all we need to gather information besides using command line tools. In this module about **``web browser``** section i learned about various tools like **FroxyProxy** **Wappalyzer** **User-Agent Switcher and Manager** and about **browser developer tools**.

- **froxyproxy** :- Quickly switch proxy servers for accessing target websites. Ideal for tools like Burp Suite or frequent proxy changes. 
- **Wappalyzer** :- Identifies technologies used on visited websites, useful for gathering info while browsing. 
- **User-Agent Switcher and Manager** :- Allows you to mimic accessing a webpage from a different OS or browser, like pretending to use an **iPhone** while on **Firefox**. 

![img](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

### ``Ping``
The `ping` command checks if a device or website is reachable on a network by sending small data packets and measuring how long it takes for them to return. It’s like saying “Hello, are you there?” and waiting for a response.

> [!IMPORTANT]
> *_Below are some screenshots for ping command which answers the given questions in the room_*

* Deploy the VM for this task and using the AttackBox terminal, issue the command `ping -c 10 10.10.166.101`. How many ping replies did you get back?

![Screenshot from 2024-12-24 06-59-36](https://github.com/user-attachments/assets/83303701-5a3b-49b7-a27e-35c43c99c642)

![img](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

### Traceroute
Traceroute is a network tool that shows the path data takes to travel from your device to a target server. It lists all the routers (hops) the data passes through and shows how long it takes to reach each one. It's useful for diagnosing network issues or delays.

> [!NOTE]
> *_note that the route taken by the packets might change as many routers use dynamic routing protocols that adapt to network changes._*

![img](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

### Telnet
Telnet (teletype Network) is a network protocol that allows users to connect to and control remote computers over the internet or a local network, using a text-based command-line interface. It is mostly used for **testing** and **troubleshooting** but is **outdated** and insecure due to a lack of **encryption**.

Here is the screenshot for the answer in the room. I'm using ``nmap`` instead of ``telnet`` cuz it has some problem while using, the purpose is same :D

![Screenshot from 2024-12-24 07-38-29](https://github.com/user-attachments/assets/f6b6e77e-721d-4857-bdbd-d47ab41e5bed)

![img](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

### ``Netcat``
Netcat (nc) is a versatile **command-line** networking tool used for reading, writing, and analyzing data across network connections. It can function as a port scanner, chat server, file transfer tool, or even a simple backdoor. It’s often called the "***Swiss Army knife***" of networking.

-----

| Option | Meaning                                                    |
| ------ | ---------------------------------------------------------- |
| -l     | Listen mode                                                |
| -p     | Specify the Port number                                    |
| -n     | Numeric only; no resolution of hostnames via DNS           |
| -v     | Verbose output (optional, yet useful to discover any bugs) |
| -vv    | Very Verbose (optional)                                    |
| -k     | Keep listening after client disconnects                    |
> [!NOTES]
>* the option `-p` should appear just before the port number you want to listen on.
>* the option `-n` will avoid DNS lookups and warnings.
>*  port numbers less than 1024 require root privileges to listen on.

IDk why ``nc`` netcat is not working..

![Screenshot from 2024-12-24 07-48-30](https://github.com/user-attachments/assets/3bfc94e0-1796-49c7-bd3d-1dbc62055c80)

![img](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)
### Putting It All Together
In this room I have learned about active recon using different tools including ``netcat``, ``telnet``, ``traceroute``, ``ping`` and recon using ``web browser``. Here are some cheats from the room.
*Commands and how to use them with examples*

| Command          | Example                                   |
| ---------------- | ----------------------------------------- |
| ping             | `ping -c 10 10.10.6.12` on Linux or macOS |
| ping             | `ping -n 10 10.10.6.12` on MS Windows     |
| traceroute       | `traceroute 10.10.6.12` on Linux or macOS |
| tracert          | `tracert 10.10.6.12` on MS Windows        |
| telnet           | `telnet 10.10.6.12 PORT_NUMBER`           |
| netcat as client | `nc 10.10.6.12 PORT_NUMBER`               |
| netcat as server | `nc -lvnp PORT_NUMBER`                    |
#### Developer Tools Shortcuts

| Operating System    | Shortcut             |
| ------------------- | -------------------- |
| Linux or MS Windows | Ctrl + Shift + I     |
| macOS               | Option + Command + I |

![img](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)
