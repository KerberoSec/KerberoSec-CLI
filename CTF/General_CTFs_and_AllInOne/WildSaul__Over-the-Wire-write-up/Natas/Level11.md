#Level 11
###### user: *natas11* pass: *1KFqoJXi6hRaPluAmk8ESDW4fSysRoIg*
+ Trước tiên hãy phân tích đoạn source code:
#### Hàm `xor_encryp`: được sử dụng để mã hóa hoặc giải mã `$input` với thuật toán XOR:
```PHP
function xor_encrypt($in) {
    $key = '<censored>';
    $text = $in;
    $outText = '';

    // Iterate through each character
    for($i=0;$i<strlen($text);$i++) {
    $outText .= $text[$i] ^ $key[$i % strlen($key)];
    }

    return $outText;
}
```
#### Hàm `loadData`: load và giải mã data từ `Cookie` của người dùng, sử dụng hàm `xor_encrypt` và `base64_decode` để giải mã. Nếu data đó và bgcolor là một giá trị hex màu hợp lệ, nó sẽ cập nhật $mydata với thông tin này.
```PHP
function loadData($def) {
    global $_COOKIE;
    $mydata = $def;
    if(array_key_exists("data", $_COOKIE)) {
    $tempdata = json_decode(xor_encrypt(base64_decode($_COOKIE["data"])), true);
    if(is_array($tempdata) && array_key_exists("showpassword", $tempdata) && array_key_exists("bgcolor", $tempdata)) {
        if (preg_match('/^#(?:[a-f\d]{6})$/i', $tempdata['bgcolor'])) {
        $mydata['showpassword'] = $tempdata['showpassword'];
        $mydata['bgcolor'] = $tempdata['bgcolor'];
        }
    }
    }
    return $mydata;
}
```
#### Hàm `saveData`: nhận một mảng, chuyển dạng văn bản thành JSON, sau đó mã hóa base64 và lưu trong một cookie tên `data`
```PHP
function saveData($d) {
    setcookie("data", base64_encode(xor_encrypt(json_encode($d))));
}
```
###### mật mã XOR là một thuật toán giải mã và mã hóa cơ bản, yêu cầu hai biến để mã hóa/giải mã một thông tin, một biến là chuỗi ký tự thường/mã hóa, một biến là key
###### VD: 
```
xor_cipher(orginal_message, key) -> encrypted_message
xor_cipher(encrypted_message, key) -> original_message
```
###### JSON là một format với 2 thành phần chính là objects (gồm nhiều cặp key:value) và arrays (gồm nhiều objects trong []).
###### VD:
```
PHP Array: $array = array("name" => "John", "age" => 30, "city" => "New York");
-> JSON string: {"name":"John","age":30,"city":"New York"}
```
+ Chức năng chính của đoạn code là duy trì setting của người dùng (ở trong đoạn code là `showpassword` và `bgcolor` thông qua cookies.
+ Quá trình xử lý của đoạn code: sử dụng một `base64__encode` và `json_encode` để tiến hành mã hóa `$defaultdata` thành cookies và `mã hóa XOR` cookies đó với key bị ẩn. Vì vậy muốn tìm được cookie để website hiện pass, ta sẽ xử lý cookies khởi điểm và cookies hiện tại (hay cookies được mã hóa bằng XOR) để tìm ra key:
+ Đầu tiên, tìm cookies dựa trên `$defaultdata`:
![image](https://github.com/WildSaul/Over-the-Wire-write-up/assets/155133173/6fee0b65-1b55-4f52-9042-51622973d1d6)
###### Sử dụng PHP compiler bất kỳ
-> Ta sẽ được cookies: `eyJzaG93cGFzc3dvcmQiOiJubyIsImJnY29sb3IiOiIjZmZmZmZmIn0`
+ Lấy cookie của trang web (sử dụng Inspector)
+ Tiếp theo, tìm key XOR dựa trên 2 cookies:
![image](https://github.com/WildSaul/Over-the-Wire-write-up/assets/155133173/1d3ed40a-946e-419f-b7f6-661e0e1fa08b)
###### Sử dụng [CyberChef](https://gchq.github.io/CyberChef/), một chương trình UI đơn giản cho phép thay đổi base, mã hóa, giải mã các loại data khác nhau.
-> Được key:  `KNHLKNHLKNHLKNHLKNHLKNHLKNHLKNHLKNHLKNHLK`, có thể để ngắn thành `KNHL`.
+ Cuối cùng sử dụng key để mã hóa thông tin của `$defaultdata` với thay đổi nhỏ là trường `showpassword : yes`
![image](https://github.com/WildSaul/Over-the-Wire-write-up/assets/155133173/cd3d3d4d-76de-4847-9c64-3677ceb0e6d2)
-> được cookies: `MGw7JCQ5OC04PT8jOSpqdmk3LT9pYmouLC0nICQ8anZpbS4qLSguKmkz`
+ Thay đổi cookies, refresh page, ta sẽ được pass.

 

