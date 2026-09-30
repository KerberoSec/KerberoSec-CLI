# HTTP: Cookies

### Statement
PS: Bob really love cookies!

The main logic behind this challenge is the `cookie`. We have some feature to add email address and we need to be admin to view the saved email addresses.

<img  alt="image" src="https://github.com/user-attachments/assets/cfcecd97-b339-4434-beed-45bba562dbc9" />

I grab the request in the burp and started playing with it.

<img  alt="image" src="https://github.com/user-attachments/assets/bdd505fa-1f84-4bc6-95a9-b92d71c293f3" />

umhmm, interesting. 

more interesting ..?

<img alt="image" src="https://github.com/user-attachments/assets/5d863433-ec11-4801-a360-f8b60dde1aa7" />

Lets change the cookie.

<img  alt="image" src="https://github.com/user-attachments/assets/7c392e71-8bac-438a-8027-a530a765f189" />

```bash

curl -b "ch7=admin" "http://challenge01.root-me.org/web-serveur/ch7/?c=visiteur"

```

See yaa : )

