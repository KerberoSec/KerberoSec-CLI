# PHP2

* Problem:

  We found a [simple web page](https://2013.picoctf.com/problems/php2/) that seems to want us to authenticate, but we can't figure out how... can you? 

* Solution:

  We can view the source code and it says `<!-- source: index.phps -->`, hence we [visit the source code](https://2013.picoctf.com/problems/php2/index.phps). In there we found the authentication method. The php script basically says it will deny any query string including admin(ignore cases), but underneath it says it will pass the authentication if the string is urldecoded to admin, hence we can enter our query `?id=%2561%2564%256d%2569%256e`

  NOTE that "%" needs to be URL encoded, the urlencode for `%` is `%25`

* Answer:
  
  b4cc845aa05ed9b0ce823cb04f253e27 
