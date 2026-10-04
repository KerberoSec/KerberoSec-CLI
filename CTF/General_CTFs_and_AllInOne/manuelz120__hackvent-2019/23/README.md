## HV19.23 Internet Data Archive

Today's flag is available in the Internet Data Archive (IDA).

### Resources

[http://whale.hacking-lab.com:23023/](http://whale.hacking-lab.com:23023/)

### Solution

For this challenge, we get a website which allows us to download classic hackvent challenges in a personalized, password protected zip file. Moreover, there is an option to download the flag-challenge, but it is not enabled before 2020. My first guess was to tamper some request parameters, to download a zip file with the flag, but the input validation seems to be pretty strong. After a while, I realized that the /tmp (http://whale.hacking-lab.com:23023/tmp) folder of the application is browsable and contains some interesting files. Apart from the zip archives created by other users, I found a phpinfo.php file, as well as a very old zip archive from the user santa (http://whale.hacking-lab.com:23023/tmp/Santa-data.zip). Downloading the file shows that it contains the flag file. Still we are not able to extract it because we do not know the password.

For each zip-file we create, we get a unique, 12 character long alphanumeric password. This seems to be too long for a pure brute force attack. After a while of googling around, I stumbled across an interesting article about cracking the IDA Pro Installer (https://devco.re/blog/2019/06/21/operation-crack-hacking-IDA-Pro-installer-PRNG-from-an-unusual-way-en/). The IDA Pro installer passwords in this article follow the same pattern as the web application in this challenge. Moreover, the title of this challenge (Internet Data Archive) is an acronym for IDA. Therefore, I decided to reimplement the password cracking algorithm shown in the article in PHP 7.4.1 (taking the same version as mentioned in the phpinfo file). To speed up the cracking process, my password generator only outputs the potential zip-passwords, which get piped into [john](https://www.openwall.com/john/) later on. The script looks as follows:

```php
<?php
$chars = "abcdefghijkmpqrstuvwxyzABCDEFGHJKLMPQRSTUVWXYZ23456789";
for ($seed = 0; $seed <= 1577098880; $seed += 1)         
{
    srand($seed);
    $pw = "";
    for($i=0; $i<12; ++$i)
    {
        $key = rand(0, 53);
        $pw = $pw . $chars[$key];
    }
    print $pw . "\n";
}
?>
```

Using this approach, I was able to crack the password within a few seconds:

```
manuel@ManuelErika:/mnt/d/Dokumente/hackvent-2019/23$ php crack.php | john --stdin santa.hash
Using default input encoding: UTF-8
Loaded 1 password hash (ZIP, WinZip [PBKDF2-SHA1 256/256 AVX2 8x])
Will run 8 OpenMP threads
Press Ctrl-C to abort, or send SIGUSR1 to john process for status
Kwmq3Sqmc5sA     (Santa-data.zip/flag.txt)
1g 0:00:01:01  0.01619g/s 70300p/s 70300c/s 70300C/s suKcApykm6ST..Ekjreg8U85fm
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```

**Flag:** HV19{Cr4ckin_Passw0rdz_like_IDA_Pr0}
