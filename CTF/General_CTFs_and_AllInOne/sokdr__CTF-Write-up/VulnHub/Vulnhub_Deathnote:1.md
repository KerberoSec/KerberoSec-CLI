# CTF-Write-up

## Vulnhub: Deathnote: 1

##### URL: https://www.vulnhub.com/entry/deathnote-1,739/

##### Created by _https://www.vulnhub.com/author/hwkds,816/_

![logo](https://user-images.githubusercontent.com/20625004/166140788-8abce583-7943-45dc-b89d-8c4504d931e8.PNG)

Run ``nmap`` ta first to identify open ports.

![nmap](https://user-images.githubusercontent.com/20625004/166147772-58a273ea-c4e9-4949-bc16-e4b4aa202085.PNG)

Access port ``80``.

Nothing lets add it to our host file.

``echo " target ip deathnote.vuln" >> /etc/hosts``

Now access port ``80``.

![port80](https://user-images.githubusercontent.com/20625004/166147863-772ecc8f-5ae9-4a48-b316-ef162bdcc183.PNG)

Digging around we found various web pages.

![hint](https://user-images.githubusercontent.com/20625004/166147935-989400cd-c09e-48f2-85bd-8a6ebd52035b.PNG)

![comment](https://user-images.githubusercontent.com/20625004/166147940-fe26c54a-1d36-49c7-8307-4d0955b05740.PNG)

Lets fire up ``gobuster``.

``gobuster dir -u http://target site -w /path/to/wordlist ``

![gobuster](https://user-images.githubusercontent.com/20625004/166147993-5a3c0b29-e4ab-424b-8cdd-a9156634dc52.PNG)

lest view ``robots.txt``

![robots](https://user-images.githubusercontent.com/20625004/166148040-12e862c1-01f3-468b-b3b2-2b93c291ab8c.PNG)

We understand that the site is using ``wordpress``.

We found some names and hints by viewing the pages. (Users:L, Kira, ryuk) (Hint: notes.txt, iamjustic3)

Lets access the ``wp-login`` page.

![admin](https://user-images.githubusercontent.com/20625004/166148138-7c848bc5-279a-4636-a41f-3c11300a2b47.PNG)

User ``l`` not found lets try with ``kira`` and password ``iamjustic3``.

Success.

![kira](https://user-images.githubusercontent.com/20625004/166148171-0ed612a1-1d66-43eb-b97a-5705ceeabc6c.PNG)

Searching around we found hint ``notes.txt``.

![notes](https://user-images.githubusercontent.com/20625004/166148207-4729d7b9-cf4c-4cae-b0dd-22c51cf53b96.PNG)

![notes1](https://user-images.githubusercontent.com/20625004/166148261-0c6c537d-e55d-47a4-a545-8559957bc6ee.PNG)

It seems to have passwords inside. Lets use ``hydra`` against service ``ssh`` with that list and the users we have.

``hydra -l l -P notes.txt ssh://target IP -vv -I -t4``

![ssh](https://user-images.githubusercontent.com/20625004/166148331-57aaa101-47a0-4518-8972-711f76320d3a.PNG)

Success we found password for user ``l``.

![luser](https://user-images.githubusercontent.com/20625004/166148371-a0a8c750-4588-4788-9edb-6c3a5ea655f8.PNG)

After a lot of search within the machine i found another hint.

![hint1](https://user-images.githubusercontent.com/20625004/166148428-7a9d7606-513d-46c0-88d3-1e3d11674630.PNG)

Use ``https://gchq.github.io/CyberChef/``.

![hex](https://user-images.githubusercontent.com/20625004/166148469-b012cabe-db06-4d87-a76e-6bdbeb0e0651.PNG)

Lets take the output and bake it again it seems to be base64 encoding.

![base64](https://user-images.githubusercontent.com/20625004/166148506-05777074-e668-4e7d-92c9-0f4dce2f75b1.PNG)

We found a password lets use it for user ``kira``.

``su kira``.

![kira1](https://user-images.githubusercontent.com/20625004/166148552-f4a11b09-f697-40f9-966a-906ad4a8fca8.PNG)

Success now we have to escalate further our privileges.

Type ``sudo -l``.

![privileges](https://user-images.githubusercontent.com/20625004/166148597-f5fff98b-15a0-4e27-9916-b765e89dfd44.PNG)

Success we are user ``root`` and on the ``root`` folder you will find the last flag.

