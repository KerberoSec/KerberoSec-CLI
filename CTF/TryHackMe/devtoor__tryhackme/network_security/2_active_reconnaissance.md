<!-- TOC -->

- [Active Reconnaissance](#active-reconnaissance)
    - [Web Browser](#web-browser)
    - [Telnet](#telnet)
    - [Netcat](#netcat)
    - [Commands](#commands)

<!-- /TOC -->

# Active Reconnaissance

[Active Reconnaissance Room](https://tryhackme.com/room/activerecon)

Learn how to use simple tools such as traceroute, ping, telnet, and a web browser to gather information.

## Web Browser

| Operating System | Developer Tools Shortcut |
| :----: | :----: |
| Linux or MS Windows | `Ctrl` + `Shift` + `I` |
| macOS | `⌥` + `⌘` + `I` |

Add-ons for Firefox and Chrome:

- `FoxyProxy` lets you quickly change the proxy server you are using to access the target website. This browser extension is convenient when you are using a tool such as Burp Suite or if you need to switch proxy servers regularly. You can get FoxyProxy for Firefox from [here](https://addons.mozilla.org/en-US/firefox/addon/foxyproxy-standard).
- `User-Agent Switcher and Manager` gives you the ability to pretend to be accessing the webpage from a different operating system or different web browser. In other words, you can pretend to be browsing a site using an iPhone when in fact, you are accessing it from Mozilla Firefox. You can download User-Agent Switcher and Manager for Firefox [here](https://addons.mozilla.org/en-US/firefox/addon/user-agent-string-switcher).
- `Wappalyzer` provides insights about the technologies used on the visited websites. Such extension is handy, primarily when you collect all this information while browsing the website like any other user. You can find Wappalyzer for Firefox [here](https://addons.mozilla.org/en-US/firefox/addon/wappalyzer).

## Telnet

Using `http` protocol:

```bash
telnet <IP> <PORT>
GET / HTTP/1.1
host: <telnet>
```

## Netcat

Using `http` protocol:

```bash
nc <IP> <PORT>
GET / HTTP/1.1
host: <netcat>
```

| Option | Meaning |
| :----: | :----: |
| `-l` | Listen mode |
| `-p` | Specify the Port number |
| `-n` | Numeric only; no resolution of hostnames via DNS |
| `-v` | Verbose output (optional, yet useful to discover any bugs) |
| `-vv` | Very Verbose (optional) |
| `-k` | Keep listening after client disconnects |

>: The option `-p` should appear just before the port number you want to listen on.
>: The option `-n` will avoid DNS lookups and warnings.
>: Port numbers less than 1024 require root privileges to listen on.

## Commands

| Command | Example |
| :----: | :----: |
| `ping` on Linux or macOS | `ping -c 10 <MACHINE_IP>` |
| `ping` on MS Windows | `ping -n 10 <MACHINE_IP>` |
| `traceroute` on Linux or macOS | `traceroute <MACHINE_IP>` |
| `tracert` on MS Windows | `tracert <MACHINE_IP>` |
| `telnet` | `telnet <MACHINE_IP> <PORT_NUMBER>` |
| `netcat` as client | `nc <MACHINE_IP> <PORT_NUMBER>` |
| `netcat` as server | `nc -lvpn <PORT_NUMBER>` |
