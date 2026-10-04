- https://tryhackme.com/room/linuxstrengthtraining

#Linux 

FIND FILE
`find DIR/PATH/ -type f -name FILENAME`
- find /home/Sam/ -type f -name sales.txt

FIND FOLDER FILE
`find DIR/PATH -type d -name FILENAME`
- find /home/Sam/ -type d -name pictures

FIND FILE BASED ON SIZE
`find DIR/PATH -type f -size N`
- find /home/Sam -type f size 10x
- x = c for bytes, k for kilobytes, M for megabytes, G for gigabytes

FIND FILES BASED ON USERNAME 
`find DIR/PATH -type f -user USERNAME`
- find /etc/server -type f -user jan

FIND FILES BASED ON GROUP NAME
`findDIR/PATH -type f -group GROUPNAME`
- find /etc/server -type f -group teamster

FIND FILES MODIFIED AFTER DATE
`find DIR/PATH -type f -newermt "date & time" `
- find / type -f -newermt '6/30/2020 0:00:00'

FIND FILES BASED ON DATE MODIFIED
`find DIR/PATH -type f -newermt [start date] !-newermt [end date]`
- find / -type f -newermt 2013-09-12 ! -newermt 2013-09-14

based on date accessed
- find / -type f -newerat 2017-09-12 ! -newerat 2017-09-14

FIND FILES WITH SPECIFIC WORD
- `grep -iRl '/folderA/flag`

http://explainshell.com/

## task 2

```
-group

find /home/francis -type f -user francis -size 52k

ssh topson@$ip
topson

cd /home/topson/chatlogs
grep -iRl 'keyword'
2019-10-11

ls 2019-10-11

```

## task 3

```

mv * /home/francis/logs

scp /home/james/Desktop/script.py 192.168.10.5:home/john/scripts

mv -logs -newlogs

cp encryption \keys /home/john/logs

cat ./corperateFiles/RecordsFinances/readME_hint.txt 

bash hello.sh
cat "file\ with\ spaces"
cat 'file with spaces'

cd /home/topson/channels/
find a directory call `telephone numbers`
cd /home/topson/corperateFiles/xch/"telephone numbers"

file with a modified date of 2016-09-12 from the /workflows

cd /home/topson/workflows/

~/corperateFiles/RecordsFinances

cat < -MoveMe.txt
cd -- "-march folder"/

mv -- '-MoveMe.txt' -- '-march folder'/

~/corperateFiles/RecordsFinances/-march folder$ ./-runME.sh 

Flag{234@i4s87u5hbn$3}

```

## task 4

Hashing

Hashing refers to taking any data input, such as a password and calculating its hash equivalent. The hash equivalent is a long string which cannot be reversed since the act of hashing is known as a one-way function.

```
echo -n 'mypassword123' | md5sum

john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt hash1.txt

secret123

ssh sarah@10.10.196.87
rainbowtree1230x

What is the hash type stored in the file hashA.txt

find . -type f -name hashA.txt
~/system AB/server_mail/server settings/

cat hashA.txt copy and paste in new tab nano hashA.txt

md4

crack hashA.txt
john --format="raw-md4" --wordlist=/usr/share/wordlists/rockyou.txt hashA.txt 

admin

  
What is the hash type stored in the file hashB.txt

find . -type f -name hashB.txt
./oldLogs/settings/craft/hashB.txt

cat hashB.txt copy and paste in nano hashB.txt

SHA-1

Find a wordlist  with the file extention of '.mnf' and use it to crack the hash with the filename hashC.txt. What is the password?

find . -type f -name *.mnf
ls |grep ww.mnf

scp 'sarah@10.10.196.97:/home/sarah/system\ AB/db/ww.mnf' ~/Desktop/

scp ww.mnf sarah@10.10.196.87:~/Desktop

ww.mnf

hashC.txt = SHA-256

john --format="raw-sha256" --wordlist=ww.mnf hashC.txt 

unacvaolipatnuggi

hashB.txt = sha1
john --format="raw-sha1" --wordlist=/usr/share/wordlists/rockyou.txt hashB.txt 

letmein

```

## Task 5

Encoding base64

```
echo 'example' | base64 

cat encoded.txt | base64 -d > new.txt

  
what is the name of the tool which allows us to decode base64 strings?

base64

  
find a file called encoded.txt. What is the special answer?

find . -type f -name encoded.txt
cat encoded.txt | base64 -d
cat encoded.txt | base64 -d | grep 'special'
ent.txt
find . -type f -name ent.txt
cat ./logs/zhc/ent.txt
copy and paste in nano special.txt

haiti bfddc35c8f9c989545119988f79ccc77 = md5 => md4

john --format="raw-md4" --wordlist=/usr/share/wordlists/rockyou.txt special.txt

john

```

## task 6

Encryption using GPG

Encryption refers to the process of concealing sensitive data by converting it to an unintelligible format. The only way to reverse the process is to use a key; this is known as decryption.

```
'secret data' => 'QFnvZbCSffGzrauFXx9icxsN9UHHuU+sCL0sGcUCPGKyRquc9ldAfFIpVI+m8mc/'
password: pass

nano secret.txt 

ENCRYPT = AES-256
gpg --cipher-algo AES-256 --symmetric secret.txt
password= pass

DECRYPT AES-256
gpg secret.txt.gpg 

  
You wish to encrypt a file called history_logs.txt using the AES-128 scheme. What is the full command to do this?

gpg --cipher-algo AES-128 --symmetric history_logs.txt

  
What is the command to decrypt the file you just encrypted?

gpg history_logs.txt.gpg

  
Find an encrypted file called layer4.txt, its password is bob. Use this to locate the flag. What is the flag?

find . -type f -name layer4.txt

gpg layer4.txt = bob => layer5.txt

Find a file called layer3.txt, its password is james.
find . -type f -name layer3.txt
./oldLogs/2014-02-15/layer3.txt
~/oldLogs/2014-02-15/

Find a file called layer2.txt, its password is tony.
find . -type f -name layer2.txt
cd ./oldLogs/settings/

gpg layer2.txt

haiti MS4gRmluZCBhIGZpbGUgY2FsbGVkIGxheWVyMS50eHQsIGl0cyBwYXNzd29yZCBpcyBoYWNrZWQu

HMAC-SHA1
bigcrypt

cat layer5.2.txt | base64 -d

Find a file called layer1.txt, its password is hacked
find . -type f -name layer1.txt
./logs/zmn/layer1.txt

gpg layer1.txt 

Flag{B07$f854f5ghg4s37}

```

## task 7

cracking encrypted gpg files

```
you have a gpg file but no password

in Kali/Parrot there is gpg2john
sudo gpg2john     (https://github.com/openwall/john)

gpg2john secret.txt.gpg > hash
john --wordlist=/usr/share/woordlists/rockyou.txt --format=gpg hash

  
Find an encrypted file called personal.txt.gpg and find a wordlist called data.txt. Use tac to reverse the wordlist before brute-forcing it against the encrypted file. What is the password to the encrypted file?

find . -type f -name personal.txt.gpg
./oldLogs/units/personal.txt.gpg

find . -type f -name data.txt
./logs/zmn/old stuff/-mvLp/data.txt

scp 'sarah@10.10.196.87:/home/sarah/oldLogs/units/personal.txt.gpg' ~/Desktop/

scp 'sarah@10.10.196.87:/home/sarah/logs/zmn/old stuff/-mvLp/data.txt' ~/Desktop/

tac data.txt

gpg2john personal.txt.gpg > personal
john --wordlist=data.txt --format=gpg personal 

valamanezivonia

What is written in this now decrypted file?

gpg personal.txt.gpg
paste in password

getting stronger in linux

```

## task 8

SQL 
SQL is a language for storing, manipulating and retrieving data from databases. Therefore, it is important to firmly grasp the concept of how to read data from databases in Linux

```
service mysql start | stop

CONNECT TO REMOTE SQL DATABASE
mysql -u <username> -p -h <host IP>

OPEN MYSQL FILE LOCALLY
mysql -u <username. -p <password>

source <filename>
source employees.sql

SHOW DATABASES;

USE <database name>;

SHOW TABLES; (of database)

DESCRIBE <database name>;

SELECT * FROM <table name>;
SELECT * FROM  employees;

  
Find a file called employees.sql and read the SQL database. (Sarah and Sameer can log both into mysql using the password: password). Find the flag contained in one of the tables. What is the flag?

mysql -u sarah -p      to sign in as sarah
password

hint= first name Lobel

describe employees;
select * from employees where first_name ='Lobel';

Flag{13490AB8}

```

## final 

```
  
Go to the /home/shared/chatlogs directory and read the first chat log named: LpnQ. Use this to help you to proceed to the next task.

/home/shared/chatlogs
cat LpnQ
sarah, lucy, sameer, james (root)

What is Sameer's SSH password?

2020-08-13

grep -iRl sameer

shared/chatlogs/Pqmr        /home/shared/sql/  : danepon
shared/chatlogs/LpnQ
shared/chatlogs/KfnP
	home/shared/sql/conf    : ebq

less KfnP | grep -i sameer
sameer: thegreatestpasswordever000

  
What is the password for the sql database back-up copy

grep -iRl ebq

serverLx/case/.git/objects/pack/pack-16bd4132555aee53f9ea7acb51e3af7c8b410597.pack

cat JKpN | less
aG9tZS9zYW1lZXIvSGlzdG9yeSBMQi9sYWJtaW5kL2xhdGVzdEJ1aWxkL2NvbmZpZ0JEQgo=

base64 -d

ssh sameer@10.10.19687 
thegreatestpasswordever000

home/sameer/History LB/labmind/latestBuild/configBDB
~/History LB/labmind/latestBuild/configBDB

grep -iRl ebq
pLmjwi 
LmqAQl 
Ulpsmt == wordlists

cat pLmjwi | grep ebq

I combined the three files first to make it easier for me.
cat pLmjwi LmqAQl Ulpsmt >> wordlist.txt
grep -r ebq wordlist.txt > ebq.txt

ebqattle

cd /home/shared/sql
gpg 2020-08-13.zip.gpg => ebqattle

unzip 2020-08-13.zip
2020-08-13/

mysql -u sameer -p
password

  
Find the SSH password of the user James. What is the password?

source employees.sql
select * from employees where first_name like 'james';

vuimaxcullings

  
SSH as james and change the user to root?

ssh james@10.10.196.87
vuimaxcullings

sudo cat /root/root.txt

Flag{6$8$hyJSJ3KDJ3881}

```

