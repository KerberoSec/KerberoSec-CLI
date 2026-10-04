# Postbook

### Flags 0 and 1
* Create a new post
* The page contains a hidden input text box just above the Create Post button
* Change the id in the input box and create post to get 2 flags.
* One flag is for finding the hidden input box and another is for viewing someone else's post

### Flag 2
* Create a post and then edit it
* The url contains the id of the post. Change the id and edit someone else's post to get the flag.

### Flag 3
* One of the username was user
* Use Intruder in burp suite for attack. Use *user* as Username and password from [password.txt](https://github.com/h-sinha/Hacker101-CTF/blob/master/Postbook/password.txt) which contains a list of 10000 most commonly used passwords
* Using *password* as password gives 302 response which means that we have successfully logged in
* Use this for logging in and get the flag

### Flag 4
* The view post page contains id as a parameter
* Run Intruder and sequentially change id from 10-1000
* Filter out all the responses that contain *Post not found*
* Page 945 gives the flag in response

### Flag 5
* The cookie for user id 3(*eccbc87e4b5ce2fe28308fd9f2a7baf3*) when decoded using md5 gives 3
* Use md5 hash of 1(*c4ca4238a0b923820dcc509a6f75849b*) as cookie for logging in for user id 1

### Flag 6
* The id in the url for deleting page is the md5 hash of the post id
* Use the md5 hash for 1(*c4ca4238a0b923820dcc509a6f75849b*) to send a GET request to delete another post to get the flag

