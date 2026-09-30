# Challenge Name:
 [*who am i?*](https://cybertalents.com/challenges/web/who-am-i)
 
# Challenge Description
Do not Start a fight you can not stop it

Link: [http://34.76.107.218/whoami/](http://34.76.107.218/whoami/)

## Answer
* Open inspect from (ctrl + shift + c) then scroll down ther is an account details
```
			Guest Account:
			-=-=-=-=-=-=-=-
			Username:Guest
		    Password:Guest  
```
* Use above data to Login 
* Using Burbsuit or cookie-editor to see cookies
```
Authentication=bG9naW49R3Vlc3Q%3D
```
* From URL encode "%3d" implies "=" so current cookies equal "bG9naW49R3Vlc3Q=" (Base64 decode)
* Decode base64 using linux command
```bash
echo 'bG9naW49R3Vlc3Q=' | base64 -d
login=Guest
```
* Now we want to change 'Guest' to 'admin' then encode it
```bash
echo 'login=admin' | base64
bG9naW49YWRtaW4K
```
* If you try it using Guest instead of admin you will see that it ends in 'k' but in cookies he remove it then appeand '=' (in URL encode '%3d')
* Change website cookies to what we have generate (bG9naW49YWRtaW4%3D)
* Reload the page
* You got the password!!

 ## The Flag
 > FLag{B@D_4uTh1Nt1C4Ti0n}  
