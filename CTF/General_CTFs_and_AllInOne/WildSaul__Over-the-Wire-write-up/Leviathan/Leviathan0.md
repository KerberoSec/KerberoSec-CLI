### Level 0
> User: *leviathan0* ; Password: *leviathan0*
```
ssh leviathan0@leviathan.labs.overthewire.org -p 2223 
```
##### Mật khẩu cho level tiếp theo nằm trong file `bookmarks.html` trong thư mục `.backups`:
```
$ cat bookmarks | grep pass
... This will be fixed later, the password for leviathan1 is PPIfmI1qsA" ADD_DATE="1155384634" LAST_CHARSET="ISO-8859-1" ID="rdf:#$2wIU71">password to leviathan1</A>
```
-> mật khẩu: `PPIfmI1qsA`
