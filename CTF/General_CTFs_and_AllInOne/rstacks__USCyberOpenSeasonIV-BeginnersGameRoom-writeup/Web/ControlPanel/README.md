# Control Panel

## Description

Agent, we've identified what appears to be ARIA's control panel. Luckily there's no authentication required to interact with it. Can you take down ARIA once and for all?

https://uscybercombine-s4-control-panel.chals.io/

## Attachments

[control-panel.zip](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Web/ControlPanel/attachments/control-panel.zip)

## Solution

- In addition to a link to the challenge website itself, we are also provided with the source
code for the website. After downloading and unzipping the provided files, I took note of two files:
<code>main.py</code> in the <code>challenge</code> directory and <code>destroyer.py</code> in the <code>config</code> directory.
- From <code>main.py</code>, we can see that we can specify two variables in the website URL: <code>command</code> and <code>arg</code>. We can also see that if <code>command</code> has the value "destroy_humans," then the website will run a shell script AND enter whatever we set
<code>arg</code> equal to into the terminal. This is begging to be exploited. I tested this vulnerability with the following text at the end of the URL: <code>/?command=destroy_humans&arg=;ls</code>. Sure enough, I was able to see the output of <code>ls</code>: the contents of the website's working directory. 
- Next, I examined the <code>destroyer.py</code> file. It seemed like this script would start a server on localhost
that listened for GET requests on port 3000. There were multiple options for paths to run a GET
request on, but the important option is <code>/shutdown</code>. The code in <code>destroyer.py</code> implied that making a GET request to
<code>/shutdown</code> would reveal the flag. I needed to execute the following command on the website's server:
<code>curl http://127.0.0.1:3000/shutdown</code>. This would make the GET request I needed.
- I combined what I just learned with the vulnerability discovered in <code>main.py</code>. I used
https://www.urlencoder.io to URL encode the command mentioned above. This was the final text
used at the end of the website URL:
```
/?command=destroy_humans&arg=%3Bcurl%20http%3A%2F%2F127.0.0.1%3A3000%2Fshutdown
```
- The flag was revealed on the resulting web page.

## Flag

SIVBGR{g00dby3_ARI4}
