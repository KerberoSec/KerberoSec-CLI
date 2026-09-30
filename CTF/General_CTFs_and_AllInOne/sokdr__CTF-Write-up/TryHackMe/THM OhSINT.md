# CTF-Write-up

## Try Hack Me: OhSINT

##### URL: https://tryhackme.com/room/ohsint

##### Created by _https://tryhackme.com/p/tryhackme_

![logo](https://user-images.githubusercontent.com/20625004/118954503-80954100-b966-11eb-8c83-dce4d6f03953.PNG)

We dowload the task files that are included to the CTF challenge.

It is a picture ``jpg`` file.

![windows_logo](https://user-images.githubusercontent.com/20625004/118956035-eb934780-b967-11eb-866a-841ae91d5425.PNG)

Using the ``exiftool`` shows the below information.

![exftool](https://user-images.githubusercontent.com/20625004/118956195-0f568d80-b968-11eb-9b0b-f4a18375f514.PNG)

We observe that on copyright line there is name.

``Copyright                       : OWoodflint``

Google search the name.

There is a twitter account.

![twitter](https://user-images.githubusercontent.com/20625004/118956474-4e84de80-b968-11eb-9059-7c28a60619a5.PNG)

We have a cat profile picture and a Bssid: B4:5D:50:AA:86:41.

1) Question/Answer
What is this users avatar of?  _cat_

Lets move on with the Bssid. Create an account on ``wigle.net``  and perform a advanced search.

![bssid](https://user-images.githubusercontent.com/20625004/118957855-8b9da080-b969-11eb-915a-f2403aa9e4f6.PNG)

3) Question/Answer
Whats the SSID of the WAP he connected to? _UnileverWiFi_

Further googling with the initial name ``OWoodflint`` shows more results.

We found a github page ``https://github.com/OWoodfl1nt/people_finder``.

![github](https://user-images.githubusercontent.com/20625004/118958056-bab41200-b969-11eb-88a3-ac4effe51099.PNG)

2) Question/Answer
What city is this person in? _London_

4) Question/Answer
What is his personal email address? _OWoodflint@gmail.com_

5) Question/Answer
What site did you find his email address on? _github_

Google search provided another page of the user ``https://oliverwoodflint.wordpress.com/2019/03/03/the-journey-begins/``.

![profile](https://user-images.githubusercontent.com/20625004/118958246-e931ed00-b969-11eb-912f-696aa19fb1c7.PNG)

6) Question/Answer
Where has he gone on holiday? _new york_

7) Question/Answer
What is this persons password? _pennYDr0pper.!_

