source : [here](https://youtu.be/4L7r-Y_OSyE?si=JSR-MUgam6b4bqKE)

## Environment Variable

__What are Environment Variables?__  
- Allows you to store data in memory that can be easily acessed by any program or script running from the shell.

__Store information about the shell session and the working environment__  
```VAR_NAME=VALUE```

__How to see the exisiting Env Variable in Linux?__
- ```printenv```
- ```env```

__How to see a specific env variable?__
- ```printenv Home```
- ```echo $HOME```
- ```echo $USERNAME```

__There are two environment variable types in the bash shell:__  

- ```Global Variables```  
- ```Local Variables```

---

## Local ENV variables

__How to create local user-defined variables that are visible wihtin your shell process. This is temporary set and uses for testing purposes. If user logged out from terminal or system then it will removed.__

- ```MY_VAR=Hello```  
- ```echo $MY_VAR```    
The vaule can be change.  

```MYVAR="Hello World"```  
```unset MYVAR```  
```export MYVAR="hello world"```  
```env | grep MYVAR```  
```env```  
```printenv MYVAR```  

---

## Set ENV Var Using Profile

__This is permanent set and if user logged out from terminal or system then it will not remove form system.__

Set Env variable permanent for a user.
- Edit ```~/.profile (ubuntu)```
- Edit ```~/.bash_profile (centos)```

And set variables
- ```export MYVAR=VALUE```
- ```source ~/.profile (to apply immediately)```

Example:

```ls -lt ~/.bash_profile``` (this command is for CentOS)  
```ls -lt ~/.profile``` (this command is for Ubuntu)  

```vi ~/.bash_profile```  
press ```i``` for INSERT  
```export NEWVAR=Linux```  

press ```Shift+:``` then press ```wq``` and ```ENTER``` for save and exit.  

```cat ~/.bash_profile```  
```echo $NEWVAR```  
```source ~/.bash_profile``` (This command means what user changed, you must proceed to apply)  
```env | grep NEWVAR```  

user now can still access this if he logged out from terminal and relogin it. But one thing that if user open a new tab for terminal then if he typed ```echo $NEWVAR``` but it will not show anything cause it have to set into ```.bashrc``` . It will work for new login shell or terminal. for fixing this issue press command  

```ls -lt ~/.bashrc```  
```vi ~/.bashrc```  
```export NEWVAR=Linux``` then save it  
```source ~/.bashrc```  
```echo $NEWVAR```  

__Warning: Important thing is if user work on a company/production server. If he tried to do this type editing then first he need to backup to the previous file then make this type edit.__

---

## Set Environment Variable for all the users. (Sudo access needed/Admin level)
- ```Edit /etc/profile/```  

and set variables  
- ```export MYVAR=VALUE```  
- ```source /etc/profile/```  

Example:  
```echo $GVAR```  
```vi /etc/profile``` (catch the eyes to readonly)  
```sudo vi /etc/profile```    

__Global Variables__  
```export GVAR=GLOBAL_VALUE``` (save it)  
```source /etc/profile```  
```echo $GVAR```  

