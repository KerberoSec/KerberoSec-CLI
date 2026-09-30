# Safe Opener
##### Tags: `picoCTF 2022` `Reverse Engineering`
### DESCRIPTION
Can you open this safe? I forgot the key to my safe but this [program](https://artifacts.picoctf.net/c/83/SafeOpener.java) is supposed to help me with retrieving the lost key. Can you help me unlock my safe? Put the password you recover into the picoCTF flag format like: picoCTF{password}
### Hiểu đoạn code:
```java
     while (i < 3) {
         System.out.print("Enter password for the safe: ");
         key = keyboard.readLine();

         encodedkey = encoder.encodeToString(key.getBytes());
         System.out.println(encodedkey);

         isOpen = openSafe(encodedkey);
         if (!isOpen) {
             System.out.println("You have  " + (2 - i) + " attempt(s) left");
             i++;
             continue;
         }
         break;
     }

```
##### + Trong đoạn loop này, cho phép người dùng nhập mật khẩu 3 lần, sau đó mã hóa mật khẩu người dùng theo *Base64* và so sánh nó với mật khẩu đúng sử dụng hàm boolean `openSafe`:
```java
 public static boolean openSafe(String password) {
     String encodedkey = "cGwzYXMzX2wzdF9tM18xbnQwX3RoM19zYWYz";

     if (password.equals(encodedkey)) {
         System.out.println("Sesame open");
         return true;
     }
     else {
         System.out.println("Password is incorrect\n");
         return false;
     }
 }
```
##### + Như vậy, điều ta cần làm là mã hóa base64 đoạn mật khẩu đúng trên, sau đó kiểm tra bằng cách sử đụng như mật khẩu khi chạy chương trình *SafeOpener.java*:
```
$ echo 'cGwzYXMzX2wzdF9tM18xbnQwX3RoM19zYWYz' | base64 -d
pl3as3_l3t_m3_1nt0_th3_saf3
$ javac SafeOpener.java
Picked up _JAVA_OPTIONS: -Dawt.useSystemAAFontSettings=on -Dswing.aatext=true
$ java SafeOpener  
Picked up _JAVA_OPTIONS: -Dawt.useSystemAAFontSettings=on -Dswing.aatext=true
Enter password for the safe: pl3as3_l3t_m3_1nt0_th3_saf3
cGwzYXMzX2wzdF9tM18xbnQwX3RoM19zYWYz
Sesame open
```
##### => Lấy được flag thành công: `picoCTF{pl3as3_l3t_m3_1nt0_th3_saf3}`.
