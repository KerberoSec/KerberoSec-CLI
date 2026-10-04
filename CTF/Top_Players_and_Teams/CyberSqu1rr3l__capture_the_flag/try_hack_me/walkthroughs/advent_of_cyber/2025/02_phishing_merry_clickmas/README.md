```
▛▀▖▌  ▗    ▌  ▗            ▙▗▌             ▞▀▖▜ ▗    ▌            
▙▄▘▛▀▖▄ ▞▀▘▛▀▖▄ ▛▀▖▞▀▌ ▄▄▖ ▌▘▌▞▀▖▙▀▖▙▀▖▌ ▌ ▌  ▐ ▄ ▞▀▖▌▗▘▛▚▀▖▝▀▖▞▀▘
▌  ▌ ▌▐ ▝▀▖▌ ▌▐ ▌ ▌▚▄▌     ▌ ▌▛▀ ▌  ▌  ▚▄▌ ▌ ▖▐ ▐ ▌ ▖▛▚ ▌▐ ▌▞▀▌▝▀▖
▘  ▘ ▘▀▘▀▀ ▘ ▘▀▘▘ ▘▗▄▘     ▘ ▘▝▀▘▘  ▘  ▗▄▘ ▝▀  ▘▀▘▝▀ ▘ ▘▘▝ ▘▝▀▘▀▀
```
In this TryHackMe room, we learn how to use the Social-Engineer Toolkit (SET) [^2] to
send phishing emails. [^1]

What is the password used to access the TBFC portal?
-----------------------------------------------------------------------------------------
The python server to listen for credentials and fake TBFC protal login page are already
available to us in the `~/Rooms/AoC2025/Day02` directory. Here, we can start up the honey
pot server with `./server.py` and wait for incoming requests with the credentials from
TBFC employees. 

To start the Social-Engineer Toolkit for the phishing email creation, enter `setoolkit`
and select 1) for the Social-Engineering Attacks followed by 5) for the Mass Mailer
Attack. There are two options on the mass e-mailer, we can either choose to send an email
to one individual person or to all addresses in a specified list. In this example, start
by sending an email to the single email address `factory@wareville[.]thm`.

- *phishing>* Send email to: **factory@wareville[.]thm** (the target e-mail address)
- *phishing>* **2** (use your own server or open relay)
- *phishing>* From address: **updates@flyingdeer[.]thm** (the sender who is known to the target)
- *phishing>* The FROM NAME the user will see: **Flying Deer**
- *phishing>* SMTP email server address: **<TBFC_MAIL_SERVER_TARGET_IP>** (skip the open-relay credentials)
- *phishing>* Port number for the SMTP server [25]: **25** (leave it at the default value)
- *phishing>* Flag this message as high priority: **no** (can be set to a high priority too)
- *phishing>* Do you want to attach a(n inline) file: **n**
- *phishing>* Email subject: **Shipping Schedule Changes**
- *phishing>* Send the message as html or plain? 'h' or 'p' [p]: **p**
- *phishing>* Enter the body of the message, and type END when finished: (create a convincing message like below)

> Dear TBFC-Team,
>
> I hope this message finds you well.
>
> We are writing to inform you of an upcoming change to our shipping schedule. Due to
> unforeseen circumstances, there have been adjustments to the delivery timeline, and we
> want to make sure you have the most up-to-date information.
>
> For the full details, including the revised schedule and any other important updates,
> please refer to the following link: http://<ATTACK_BOX_IP>:8000
> 
> We apologize for any inconvenience this may cause and appreciate your understanding and
> flexibility. If you have any questions or require further clarification, please don’t
> hesitate to reach out.
>
> Thank you for your continued partnership.
>
> Best regards, <br>
> Rudolf <br>
> Head of Shipment <br>
> Flying Deer Shipping Company <br>
> updates@flyingdeer[.]thm <br>
> END

After a few minutes, we are rewarded with the username `admin` and password to log in to
the undisclosed TBFC portal.

What is the total number of toys expected for delivery?
-----------------------------------------------------------------------------------------
In this task, browse the `http://<TARGET_IP_ADDRESS>` website from within the AttackBox
and access the mailbox for the `factory` user with the previously harvested `admin`
password. And indeed, the password has been reused and we can successfully log in.
Besides our phishing mail, there is another e-mail from `marta` with the total number of
units that are requested to be manufactured and shipped.

[^1]: https://tryhackme.com/room/phishing-aoc2025-h2tkye9fzU
[^2]: https://github.com/trustedsec/social-engineer-toolkit
