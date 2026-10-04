Login:
echo PASSWORD > X

sshpass -p $(cat X) ssh banditX@bandit.labs.overthewire.org -p 2220
This command first saves the word PASSWORD into a file named X. Then, sshpass reads that password from the file ($(cat X)) and uses it to provide the password non-interactively when connecting via SSH. Finally, it connects to the remote server as user banditX on host bandit.labs.overthewire.org using port 2220.

lvl 1

special symbol -

can be read using ./
ie. cat ./-

lvl 2

having spaces
--spaces in this filename--
if it was just
spaces in this filename
then
cat spaces\ in\ this\ filename will do the job
since we got --
we need to use ./
By prefixing with ./, you explicitly tell the shell: “This is a file in the current directory.”
cat ./--spaces\ in\ this\ filename--

lvl 3

stored in inhere directory
cd inhere
files are hidden
used ls -a
saw ...Hiding-From-You
cat ...Hiding-From-You

lvl 4

file is in human readable form
we can cat every file but it is time consuming so
used bash script
for i in $(ls); do file ./$i; done
hence found that -file07 has the password

lvl5

hints size 1033 bytes human readable
we can do it manually by using recursive listing
that is ls -R or ls -alR(gives all details of directories and files inside it)

used

find . -readable -size 1033c ! -executable

. stands for current directory

-readable stands for files i can read ie, -rw-r--r-- or similar

c stands for bytes 

! -executable means it should be an executable file ie, there shouldn't be x in file permission

lvl 6

owned by user bandit7
owned by group bandit6
size id 33 bytes

used
find / -user bandit7 -group bandit6 -size 33c 2>/dev/null

/var/lib/dpkg/info/bandit7.password

cat /var/lib/dpkg/info/bandit7.password

lvl 7

password in data.text next to the word millionth
used
wc -l data.txt
found out that it has more than 9k+ words

cat data.txt | grep "millionth"

grep will take the output of the cat data.text and find the word millionth

millionth dfwvzFQi4mU0wfNbFOe9RoWskMLg7eE

lvl 8
 
password is stored in data.txt it' occcurance is only once 
used wc -l data.txt
1001 lines 
sorted by using 
cat data.txt | sort

found the unique by 

cat data.txt | sort | uniq -c 
-c stands for count

lvl 9

password is stored in data.txt it's a human readable string 
preceeded by several '=' characters

used
strings data.txt
showed the human readable strings 

used
strings data.txt | grep '='

lvl 10

password is stored in data.txt it's a base 64 encoding 
confirmed the encoding by seeing
"==" in the end of code

used
cat data.txt | base64 -d 
-d stands for decode

got the password

lvl 11

password is stored in data.txt
rot13 algo is applied to the password

decoded using rot13.com

lvl 12

data.txt the file is in hexdump format
/tmp already exist
cd /temp
made kriz dir
cp data.txt /temp/kriz

xxd used for generating hexdumb
xxd -r used for reversing hexdumb

cat data.txt | xxd -r > hexdump

file hexdump 
showed it is a gzip file

repeat this for every gz files
changed file name
mv hexdump hexdump.gz
extracted by using 
gzip -d hexdump.gz
it is extracted as hexdump

similarly for bz2 files
do all the same steps with some cavets
use 
bzip2 -d hexdump.bz2

similarly for tar files
use 
tar -xvf data5.bin

lvl 13

thiss level don't need a password to enter 14
we used
 ssh bandit14@localhost -p 2220 -i sshkey.private
 -i(identifier) says we don't have a password but private key

entered lvl 14 

 then cat /etc/bandit_pass/bandit14
 got the password for 14

 lvl 14

used 
nc localhost 30000
it ask for teh lvl 14 pswd 
entered the password

nc stands for

got the password for lvl 15

lvl 15

 pass= lvl 14 pass 
 openssl s_client -connect localhost:30001

 openssl s_client -connect localhost:30001 is a command that opens a TLS/SSL connection from your machine to a server running on localhost at port 30001, letting you inspect and debug the handshake.

 s_client: A diagnostic tool in OpenSSL used to connect to SSL/TLS services and show details of the handshake, certificate, and encryption.

 entered the pass
 got the password for lvl 16

