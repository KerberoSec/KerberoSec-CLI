# CTF-OverTheWire

My solutions to: [OverTheWire](http://overthewire.org/wargames/ "OverTheWire's Homepage")

## Encrytion / Decryption

Each "Level_Passwords" file will be encode with `openssl enc -aes-256-cbc -salt -in Level_Passwords.txt -out Level_Passwords.out`
If you really want the passwords, you will have to decrypt each file with `openssl enc -d -aes-256-cbc -in Level_Passwords.out`

## Info

This repo is for me to keep track of progress / passwords. I plan to password protect any files that will openly spoil the CTF (Game). I shall include password `SpoilIt4Moi` if you want to check or validate the next box.

I am new to CTF's so this is a learning opportunity; after every section I will leave a write-up PDF/ MD file.

## Irony

If you have completed Bandit, *hint* for this repo.

## OverTheWire Wargames

The wargames offered by the OverTheWire community can help you to learn and practice security concepts in the form of fun-filled games.
To find out more about a certain wargame, just visit its page linked from the menu on the left.

If you have a problem, a question or a suggestion, you can join us on IRC.

Each shell game has its own SSH port

Information about how to connect to each game using SSH, is provided in the top left corner of the page. Keep in mind that every game uses a different SSH port.

`Online`

* Bandit -> Completed
* Natas -> Current
* Leviathan ->  Completed
* Krypton -> Completed
* Narnia
* Behemoth
* Utumno
* Maze
* Vortex
* Semtex
* Manpage
* Drifter