# fogot_to_patch (web exploint/osint)

## Setup

Point the DNS for www.fake-wordpress-site.us to the web server.  Copy
installer.php and the archive.zip file to the webserver and then navigate to
installer.php.  Follow the steps.

## Alternate setup

Run the docker file for it.  Once up and running, navigate to
<address>:9500/installer.php and follow directions.  database:  wordpress
user:  wordpress password:  ANOTHERshittyPASSWORD#@!123

## Instructions to contestant

You know that the flag is located at
www.fake-wordpress-site.us/flag.txt.....Now just get the answer.

Hint:  No tools (i.e. kali, or anything else) is required.  By the way, tell us
what you think of the site while you're there.

## Solution

If you look at the source code for the webpage that comes up when you go to the
main page, you'll see a couple of lines that refer to
crayon-syntax-highlighter-2.6.9 which is a popular Wordpress plugin used to
display lines of code.  Unfortunately, all versions prior to 2.7.0 contained a
vulnerability that allowed anyone to post a comment which refered to a file on
the local server and would display the files contents.

To get the flag just leave a comment and enter the following code

```
<pre class="lang:php" data-url="/flag.txt"></pre>
```

## Flag

acsc2017{UpdateYourPlugins}
