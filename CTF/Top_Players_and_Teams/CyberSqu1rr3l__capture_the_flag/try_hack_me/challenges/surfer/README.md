```
.d88888b                    .8888b                   
88.    "'                   88   "                   
`Y88888b. dP    dP 88d888b. 88aaa  .d8888b. 88d888b. 
      `8b 88    88 88'  `88 88     88ooood8 88'  `88 
d8'   .8P 88.  .88 88       88     88.  ... 88       
 Y88888P  `88888P' dP       dP     `88888P' dP       
ooooooooooooooooooooooooooooooooooooooooooooooooooooo
```
In this TryHackMe challenge room, we surf some internal webpages to find the flag. [^1]

Uncover the flag on the hidden application page.
-----------------------------------------------------------------------------------------
First, navigate to the URL using the AttackBox `http://<MACHINE_IP_ADDRESS>`, in which
we are presented with a login screen. At first, we investigate some of the scripts that
are being sent in the Network tab of the developer tools. But in the `validate.js` and
`main.js` files we cannot discover anything useful at first. Due to this room's, name
*surfer*, we now investigate the `http://<MACHINE_IP_ADDRESS>/robots.txt` file with an
interesting entry, to hide in search engines results.
```
User-Agent: *
Disallow: /backup/chat.txt
```
The `http://<MACHINE_IP_ADDRESS>/backup/chat.txt` file must therefore contain some spicy
content for the administrators to hide it from search crawlers. And indeed, the chat log
reveals that the user "admin" likely used the password "admin". This is then confirmed by
successfully logging in with these credentials.

> **Admin:** I have finished setting up the new export2pdf tool.<br>
> **Kate:** Thanks, we will require daily system reports in pdf format.<br>
> **Admin:** Yes, I am updated about that.<br>
> **Kate:** Have you finished adding the internal server.<br>
> **Admin:** Yes, it should be serving flag from now.<br>
> **Kate:** Also Don't forget to change the creds, plz stop using your username as password.<br>
> **Kate:** Hello.. ?

Upon logging in with the admin credentials, we are prompted with a dashboard, which on the
right side lists some recent activities with one post being especially interesting:
>  Internal pages hosted at /internal/admin.php. It contains the system flag.

However, if we try to access `http://<MACHINE_IP_ADDRESS>/internal/admin.php`, we are
prevented from seeing the page since it can be only accessed locally. Also, we have
discovered an option to export a report to a PDF file on the bottom of the dashboard.
The PDF report on its own is not so interesting, however if we investigate the POST
request, we stumble upon the following form data `url: "http://127.0.0.1/server-info.php`
which we want to change now. So, we resent the POST request with the updated body
`url=http%3A%2F%2F127.0.0.1%2Finternal%2Fadmin.php` to show us the desired internal
admin PHP file. This in turn generates a PDF file with the final flag.

[^1]: https://tryhackme.com/room/surfer
