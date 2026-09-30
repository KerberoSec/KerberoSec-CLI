|Machine Name|Difficulty|OS|
|-|-|-|
|Movie|Medium|GNU/Linux|

## searching victim's ip address in my LAN network
![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/dd9a8a04-9664-4654-948a-d5b95e7bf0f2)

lets grab the target ip address using regex with `grep`.

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/73f3df94-d01e-4e5c-812f-8ecf99071acc)

and, here we go.

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/5ad30cdd-8eed-4878-ba1a-63e5e5e64125)

## passive recon
*i wanna tell something that i hate the new name of reconnaissance, footprinting is suck :>*

here is my `nmap` result that scanned using `rustscan` for the fastest version. i also do `nmap` if `rustscan` has lack when doing scan. i wont share what commands i used for pentest, because, internet has large of resources to obtain from. (selfish time).

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/c9faad91-bd7b-4018-ac1e-11918db6bfbc)

i do evilscan (simply like `nc -zv $victim 1-65535`) as well.

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/15a3b950-2326-40e7-9e55-4261b3fe76ee)

well, there must be static site running on 80 port as always. and lets see how the site looks like.

## 80/tcp

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/4aad95b1-2683-49f8-856a-28f7c3dc6aaf)

just a simple AVI to MP4 conversion site. nothing interesting, but here i got a domain name for the site after uploading `.avi`.

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/90069351-8a1f-4910-9db1-f310784a1e02)

i will put it on `/etc/hosts`.

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/ff36a14d-97c1-445d-97de-77193361c69b)

i wanna record the website behavior to my burpsuite. ill be back after bruteforcing the site's directory.

## directory iteration

i did bruteforce to the directory using the fabulous automation, named it `feroxbuster`. preatty easy to use.

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/14405eb7-c9e8-41e4-9602-5cf38e7b74d6)

as you seen in the picture above, there bunch of interesting directory to explore around such as, `sitemap.xml`, `login.php`, `upload.php`, etc. 

## command injection found
since this website created as mp4 conversion, and file upload thing. i fired up my browser and looked for the vulnerability, then i found this

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/2fa7be96-4cc6-47d1-809d-ee577d986eee)

i had to try that thing with burpsuite and rename the `filename` parameter to ping my local machine and have a test with `tcpdump` if the command injection works.

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/c8173897-2d3f-49e1-a418-00355ad62e80)

and i dont know why the response comes back bringing bunch of pings to the local machine, lets make our reverse shell to get into the system.

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/243df01f-0485-4e72-a4ce-3e9da5b74cf7)

## shell as www-data
put the reverse shell down on `filename` parameter, and then send the request.
![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/5193b977-cc06-4d19-b003-01ed445f6a4e)

after that the shell comes up with the user as `www-data`.

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/2c143c2f-7675-42e4-9ad8-82b234a6b469)

## getting root.txt
in the following image, i see the sudoers listing up as `root` to execute `qrencode`. which has the ability to convert the string into PNG like this image given below.

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/eea5ec6f-c6e4-48c9-adf9-367a60eb6f12)

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/8ab34f45-2ca4-474a-9d3a-89729c14247c)

after that, i ran the `qrencode` to obtain the `root.txt` file while my eyes seeing the help text messages given by running `qrencode -h` lol.

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/df628c1c-3a73-435f-9448-c4f196eb07f3)

and i searched for qr code converter, like in the following image given i have the content of `root.txt`. 

![image](https://github.com/Satpamnesia/hackmyvm.eu/assets/44630640/b5d87660-64b5-47a1-a386-5c0a05da8abd)

and yep, we rooted the machine.

