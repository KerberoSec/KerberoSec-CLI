# KalmarCTF 2023
###### tags: `CTF`

## Misc
### Sanity Check
```!
Have you read the rules?
```

rule 頁面拉到最下面

`kalmar{i_have_read_the_rules_and_each_player_has_their_own_account}`

## forensics
### sewing-waste-and-agriculture-leftovers
```!
UDP - UNRELIABLE datagram protocol.
```
附件: `swaal.pcap.gz`
附件解開後是一個 pcap 檔案

使用 wireshark 打開後，發現裡面都是 UDP，且都有 data

![](https://i.imgur.com/bfB0CkZ.png)

仔細 walkthrough 一下資料部分，發現似乎是一個一個 byte 傳 flag 資訊，但是因為題目與 UDP 有關係所以有些部分變成 `\x00` 代表資料遺失

而仔細觀察後，在封包 7 與 67 皆發現 flag format 中的 `{` 字元，推測在傳完 flag 之後後續又再繼續傳 flag 資料，且也從此資訊知道 flag 長度為 60

以下是我寫的程式腳本，主要就是一直讀資料，假如不是 `\x00` 的話就代表這個位置的資料沒有遺失，也就已知 flag 在這個位置的資料

: :spoiler solve.py
```python
import pyshark

flag = [0 for _ in range(60)]

caps = pyshark.FileCapture('./swaal.pcap')

for i,cap in enumerate(caps):
    data = cap.DATA.data
    if(data != '00'):
        flag[i%60] = bytes.fromhex(data)

print(b"".join(flag))
```
: :

`kalmar{if_4t_first_you_d0nt_succeed_maybe_youre_us1ng_udp}`

### cards
```
Follow the shuffle.
```
附件: `cards.pcap.gz`
附件解開後是一個 pcap 檔案

丟進 wireshark 分析後，發現基本上就是 ftp 以及 data 的東西，很明顯的是明文傳輸

![](https://i.imgur.com/vDdB9Xa.png =400x)

與上題類似，data 部分都是一個一個 byte，但是初步看不出有甚麼規律

檢視 ftp 部分，發現一開始的部分是使用者登入 (且有多個登入紀錄)，接著進行更換目錄的動作後，進入被動模式並進行 `flagpart.txt` 檔案的下載，而該檔案僅有一 byte，但是每次讀的內容不一樣?

![](https://i.imgur.com/XsusJFJ.png =400x)

![](https://i.imgur.com/Kwz4zGQ.png =400x)

![](https://i.imgur.com/hX3mUnB.png =400x)

經過反覆確認後，發現他們是在不同資料夾下的 `flagpart.txt` 同名檔案，因此內容不一樣是正常的，而經嘗試後推敲出 `flagpart.txt` 資料所在的資料夾順序與 flag 的位置有關，因此嘗試依據位置拿出資料

而很不幸的，wireshark 中顯示的 current working directory 資訊並非是直接在封包中可看到，所以沒辦法在 pyshark 用簡單的方式來取出 cwd 資訊，因此我只好利用工人智慧的方式一個一個找，在 wireshark 的 filter `ftp.response.code==150 or data` 下查看資料會方便一些

以下是我找到的對應關係

: :spoiler
```
342 k
343 a
344 l
345 m
346 a
347 r
348 {
349 s
350 h
351 u
352 f
353 f
354 l
355 e
356 _
357 s
358 h
359 u
360 f
361 f
362 1
363 e
364 _
365 c
366 a
367 n
368 _
369 y
370 o
371 u
372 _
373 k
374 3
375 3
376 p
377 _
378 t
379 r
380 4
381 c
382 k
383 _
384 o
385 f
386 _
387 w
388 h
389 e
390 r
391 e
392 _
393 t
394 h
395 3
396 _
397 c
398 a
399 r
400 d
401 s
402 _
403 a
404 r
405 e
406 _
407 s
408 h
409 u
410 f
411 f
412 l
413 3
414 d
415 _
416 n
417 0
418 w
419 }
420 \x0a
```
: :

接起來後就是 flag

`kalmar{shuffle_shuff1e_can_you_k33p_tr4ck_of_where_th3_cards_are_shuffl3d_n0w}`

## Web
### (X) Ez ⛳
```!
Heard 'bout that new 🏌️-webserver? Apparently HTTPS just works(!), but seems like someone managed to screw up the setup, woops. The flag.txt is deleted until I figure out that HTTPS and PHP stuff #hacker-proof
```
[網址](https://caddy.chal-kalmarc.tf)
附件: `source-dummy-flag.zip`

以下參考別人的解法

解開資料夾後，以下是資料夾架構

```
⛳-server
├── docker-compose.yaml
└── files
    ├── Caddyfile
    ├── php.caddy.chal-kalmarc.tf
    │   ├── flag.txt
    │   └── index.php
    ├── static.caddy.chal-kalmarc.tf
    │   └── logo_round.svg
    └── www.caddy.chal-kalmarc.tf
        └── index.html
```

可以看到在 `php.caddy.chal-kalmarc.tf` 下有一個 `flag.txt`，這應該就是我們要找的目標

以下是 `docker-compose.yaml` 的內容

: :spoiler docker-compose.yaml
```yaml
version: '3.7'

services:
  caddy:
    image: caddy:2.4.5-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./files/Caddyfile:/etc/caddy/Caddyfile:ro
      - ./files:/srv
      - caddy_data:/data
      - caddy_config:/config
    command: sh -c "apk add --update openssl nss-tools && rm -rf /var/cache/apk/ && openssl req -x509 -batch -newkey rsa:2048 -nodes -keyout /etc/ssl/private/caddy.key -days 365 -out /etc/ssl/certs/caddy.pem -subj '/C=DK/O=Kalmarunionen/CN=*.caddy.chal-kalmarc.tf' && mkdir -p backups/ && cp -r *.caddy.chal-kalmarc.tf backups/ && rm php.caddy.chal-kalmarc.tf/flag.txt && sleep 1 && caddy run"

volumes:
  caddy_data:
    external: true
  caddy_config:
```
: :

可以看到，會將相關網頁資料夾都複製進 `backup/` 目錄後，將原本網頁上的 `flag.txt` 刪除

以下是 Caddyfile

: :spoiler Caddyfile
```nginx=
{
    admin off
    local_certs  # Let's not spam Let's Encrypt
}

caddy.chal-kalmarc.tf {
    redir https://www.caddy.chal-kalmarc.tf
}

#php.caddy.chal-kalmarc.tf {
#    php_fastcgi localhost:9000
#}

flag.caddy.chal-kalmarc.tf {
    respond 418
}

*.caddy.chal-kalmarc.tf {
    encode zstd gzip
    log {
        output stderr
        level DEBUG
    }

    # block accidental exposure of flags:
    respond /flag.txt 403

    tls /etc/ssl/certs/caddy.pem /etc/ssl/private/caddy.key {
        on_demand
    }

    file_server {
        root /srv/{host}/
    }
}
```
: :

可以看到，在任意存取該網域的情況下，最終結果會被當成檔案伺服器來解釋，因此基本的 html 等可以正常顯示在瀏覽器中，但是 php 之類的不會執行

另外也可以看到，假如我們要存取 `/flag.txt` 的話，伺服器會直接回傳 403 以阻止我們觀看

而在這邊的漏洞是 Caddyfile 中第 33 行的 `root /srv/{host}/`，這邊具有 path traversal 的問題，只要我們封包 header 中給的 host 從 `php.caddy.chal-kalmarc.tf` 修改為 `backups/php.caddy.chal-kalmarc.tf` 的話，就可以存取 backups 資料夾中的檔案了

而接下來還有一個問題，存取路徑不能為 `/flag.txt`，而我們也可以利用一般網頁預防 path traversal 的特性改為存取 `../flag.txt`，即可突破限制存取 `flag.txt` 的檔案了

以下是 payload，主要修改了橘色的部分

![](https://i.imgur.com/e1yxaWz.png =400x)

`kalmar{th1s-w4s-2x0d4ys-wh3n-C4ddy==2.4}`