# GameBuzz TryHackMe Writeup

<img width="1905" height="354" alt="image" src="https://github.com/user-attachments/assets/1153979e-8375-455e-bc09-e0a54ce20f37" />

---

## Nmap Scan

```ruby
ffuf -u http://incognito.thm -H "Host: FUZZ.incognito.thm" -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 178
```

```
echo "10.112.176.56 dev.incognito.thm" | sudo tee -a /etc/hosts
```

---

<img width="1919" height="778" alt="image" src="https://github.com/user-attachments/assets/7fc33ccc-b6e8-4e3c-b2d7-dc4cc37ca704" />

## in burp found 

<img width="1916" height="302" alt="image" src="https://github.com/user-attachments/assets/dedca4fb-46b0-44d9-a7e6-b7810fec0dcb" />

## so uploads  in this folder but how to upload file

<img width="1044" height="361" alt="image" src="https://github.com/user-attachments/assets/6e70627c-904e-4af8-8c5b-220f3d13ee83" />

## at end of page found 

<img width="1663" height="545" alt="image" src="https://github.com/user-attachments/assets/e35c185c-add2-4193-aae5-d5f7bb9f2b8c" />

## i changed the etc/hosts to 

```
10.112.176.56 incognito.com
10.112.176.56 dev.incognito.com

```

## and i found robots.txt

<img width="637" height="110" alt="image" src="https://github.com/user-attachments/assets/e24aabf2-0520-4f2b-8b3a-99793bbaeabf" />

## but when open it we get 403

<img width="745" height="211" alt="image" src="https://github.com/user-attachments/assets/dd595bba-f637-4c22-8644-c74237169250" />

## let's fuzz

```
└─$ gobuster dir -w /home/kali/Downloads/wordlists/common.txt -u http://dev.incognito.com/secret/
```

<img width="1066" height="459" alt="image" src="https://github.com/user-attachments/assets/cddefe18-646d-4959-a109-50c9384df381" />

<img width="941" height="173" alt="image" src="https://github.com/user-attachments/assets/bb7732a1-8508-4c29-8a46-2f1e7538fb5b" />

---

## let's try to upload test file 

```
echo 'frankishtien' > test.txt
```

<img width="1096" height="192" alt="image" src="https://github.com/user-attachments/assets/eba8a1bb-1c59-407e-ae22-40f8d4626301" />

<img width="1224" height="480" alt="image" src="https://github.com/user-attachments/assets/a3294612-3621-4200-ad9b-da007d4ee222" />

---

## i write exploit to upload reverse shell 

<img width="518" height="117" alt="image" src="https://github.com/user-attachments/assets/9961a005-9cb1-43f5-b213-087e16e6725a" />

<img width="1113" height="470" alt="image" src="https://github.com/user-attachments/assets/614b8262-7465-45d4-aece-07ebad507303" />

---

## foudn app secret key

<img width="1097" height="358" alt="image" src="https://github.com/user-attachments/assets/137ca31d-180f-493c-8cd5-9f712c258bf4" />

## and wow found that i can switch to dev2 without password

<img width="1004" height="175" alt="image" src="https://github.com/user-attachments/assets/2a00783f-6db6-4652-8985-a944396269c5" />

---

## after some diging found passowrd of dev1

<img width="798" height="168" alt="image" src="https://github.com/user-attachments/assets/d87e7541-d3be-43df-a751-3aa15e6f573a" />

```
john --wordlist=/usr/share/wordlists/rockyou.txt --format=Raw-MD5 dev1.hash.
```

```
dc647eb65e6711e155375218212b3964
```

<img width="1006" height="286" alt="image" src="https://github.com/user-attachments/assets/993bc6f3-bcba-4976-a125-9581201a54aa" />

## but look

```
su dev1
```

<img width="640" height="157" alt="image" src="https://github.com/user-attachments/assets/950bf554-7af9-4bf6-be60-088f084954ec" />

## in mail fo dev1 say 

```
Knock yourself in!
```

> Which is referring to port knocking!

### Now, we can check the /etc/knockd.conf config file:

```
cat /etc/knockd.conf
```

<img width="916" height="356" alt="image" src="https://github.com/user-attachments/assets/5e014392-c330-4915-ad60-0b4bd6d00bbb" />

```
knock 10.112.176.56 5020 6120 7340
```

