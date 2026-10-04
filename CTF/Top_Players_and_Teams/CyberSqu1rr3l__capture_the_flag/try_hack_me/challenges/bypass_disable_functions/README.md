```                                                                                            
 _____                        ____  _         _   _        _____             _   _             
| __  |_ _ ___ ___ ___ ___   |    \|_|___ ___| |_| |___   |   __|_ _ ___ ___| |_|_|___ ___ ___ 
| __ -| | | . | .'|_ -|_ -|  |  |  | |_ -| .'| . | | -_|  |   __| | |   |  _|  _| | . |   |_ -|
|_____|_  |  _|__,|___|___|  |____/|_|___|__,|___|_|___|  |__|  |___|_|_|___|_| |_|___|_|_|___|
      |___|_|
```
Practice bypassing disabled dangerous features that run operating system commands or 
start processes. [^1]

Compromise the machine and locate the `flag.txt`.
-----------------------------------------------------------------------------------------
The target website offers a job listing with an *Apply Job* interface, where applicants
can upload their CV as an image. Since we already suspect a file upload vulnerability to
be worth investigating, we upload a random picture and inspect the network traffic. This
way, we are not able to find out the output directory location of the uploaded file
however, and use `gobuster` for that, e.g.
`gobuster dir -u http://<TARGET_IP_ADDRESS> -w /usr/share/wordlists/dirb/common.txt`.
With it, we are able to spot the `/uploads/` directory with our sample test image and
the valuable `phpinfo.php` *PHP Version* page of the webserver configuration. On it, we
can already spot the *Context Document Root* directory that we'll later need for our
payload generation to be `/var/www/html/fa5fba5f5a39d27d8bb7fe5f518e00db`. Now, for the
reverse shell, we can use one of the online tools, such as [^2] and create the
`reverse_shell.sh` script with our attacking machine IP address and a port number of our
choice. Note, that we had to encase the spawn of the network connection with a `bash -c`
to start a new bash session since a direct shell did not work for us. Having done this,
we now want to use `chankro` to obtain the PHP payload, which can be cloned from GitHub
with `git clone https://github.com/TarlogicSecurity/Chankro.git` and use it as such on
our `reverse_shell.sh` bash script.
```
python2 chankro.py --arch 64 --input in.sh --output out.php --path /var/www/html/fa5fba5f5a39d27d8bb7fe5f518e00db
```
Then, we remember that the webserver checks the magic numbers of the file to be uploaded
and not the file ending. So, we refer to a list of known file signatures [^3] and add
*GIF89a* before the PHP script starts. This way, we are able to upload the file to the
server. Before, we want to click on it under the `/uploads/` directory, we want to 
start a listenening service on the port we provided in the reverse shell with
`nc -lnvp <PORT>`. Finally, the webserver connects to the listener upon clicking on
the file and we can browse it's filesystem. This leads us to the flag, which is located
under `cat /home/s4vi/flag.txt`.

[^1]: https://tryhackme.com/room/bypassdisablefunctions
[^2]: https://www.revshells.com/
[^3]: https://en.wikipedia.org/wiki/List_of_file_signatures
