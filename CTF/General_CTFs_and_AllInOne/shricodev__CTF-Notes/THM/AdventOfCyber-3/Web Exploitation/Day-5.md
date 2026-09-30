## TASK-1  What flag did you get when you disabled the plugin?

Start up the machine, and on the home page you can see a login button. Click on the button and login with these credentials.<br>
```
Username: McSkidy

Password: password
```
On the forum, click on any topic and add a comment as ```<h1>hello world</h1>```. You will see that your injected HTML is rendered without filtration.
Now, we know that the site is not filtering any special characters.<br>

Head on to settings, and try to change your password, the url looks something like this ```https://ip/settings/?newpass=blabla```.<br>
A GET request is sent for changing password of the user. This is a very bad practice which we can utilize in this case for changing password of the users via XSS.<br>

Add this piece of code as a comment in the grich post. ```<script>fetch('/settings?new_password=h4ck3d');</script>```.So, anyone who visits his post their password changes to h4ck3d.

Since this code has executed in your browser as well, your password is changed too. Try to login with the previous credentials and login fails.<br>
Login with passsword as h4ck3d and login succeeds. Log out again, and try to login to grinch account, if grinch has visted his post then his password should be changed too.

In the settings page you will see the button to turn off the plugin. Simply, turn it off and the flag is popped in the screen.<br>```THM{REDACTED}```

<h3><b>That's it for Day- 5</b></h3>
