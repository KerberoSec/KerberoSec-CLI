# Basic Injection
## About

### General Information

__Challenge__: See if you can leak the whole database. The flag is in there somwhere…

__Challege Category__: WEB

__Challenge Difficulty__: Easy

__Skills__: Basic SQL Injection

View the website [here.](https://web.ctflearn.com/web4/)

## Solution

Let's view the website first:

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Basic%20Injection/1.png)

Inspecting the view source:

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Basic%20Injection/2.png)

Ahh! So it gives us the hint to try names like Hiroki, Noah, Luke. Well, I tried the names, and it didn't gave me any output unless our input was the name Luke. It gave me this...

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Basic%20Injection/3.png)

Well I guess this challenge is pretty simple as we spot the SQLi vulnerability in just a minute. So all we gotta do is extract the database with that one-liner command we learnt previously. ```' OR 1=1;#``` And this will flush the whole database.

![Image4](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Basic%20Injection/4.png)

Here is our __flag__: th4t_is_why_you_n33d_to_sanitiz3_inputs 
