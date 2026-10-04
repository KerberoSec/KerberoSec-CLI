<div align = "center"><h1> :satellite: FrontFace </h1></div>
<div align = "center"><h4> :beginner: Your own initial recon for pentest!<h4></div><br>

# :mega: About
FrontFace is a initial recon tool made for pentesting TryHackme and HackTheBox challenges.

<div align = "center"><img src="https://i.imgur.com/xNPl8lC.png" alt="frontface"></div>

# :question: Why?
- It saves time
- Get rid of repetitive commands by automating it
- Organized, so you can eyeball stuff
- Customizable, throw in full port scan, change the wordlist and more

## :question: How?
To run FrontFace
```bash
chmod +x frontface.sh
./frontface.sh [IP] 
```

# :pushpin: What does it do?
- It runs nmap to scan for open ports
- Runs service and version enumeration against those open ports
- If there's _http_ service, runs gobuster
- Cats out the results
- Cheers you up!

## :pushpin: Note
It relies on the following tools:
- Seclists for wordlists
- Nmap
- Gobuster<br>
- _Full port scan is disabled by default, uncomment the code to enable it_

# :hammer: Todo
- Add support for smb enumeration
- Add support for ftp enumueration

Thanks for reading, Contributions of any kind is welcomed!
