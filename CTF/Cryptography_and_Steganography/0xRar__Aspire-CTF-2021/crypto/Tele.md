![image](https://user-images.githubusercontent.com/33517160/114091779-c53ab080-98c1-11eb-9706-5e8313ba90d0.png)

- Challenge Name: **`Tele`**
- Points: **`150pts`**
- Challenge:
>> Find the message
>> 
>> Flag format: Aspire{message}
>> 
>>![tele](https://user-images.githubusercontent.com/33517160/114091998-10ed5a00-98c2-11eb-9812-dc9c428821c9.jpg)

## Solution:
This challenge is easy but it was a mix between `stego` & `crypto` i think thats why it has 150pts,
the picture give you a little hint but it wont help because where is the morse code? the first step
of every stego challenge is look for the meta data maybe you will find some comment or something,

i solved it using `exiftool` which is a very
userful tool https://exiftool.org/.

only using `exiftool thefilename.jpg` you will be able to see the meta data
![image](https://user-images.githubusercontent.com/33517160/114092687-d932e200-98c2-11eb-87df-c2a8551445a8.png)

this is our morse code:
`.- / -.. --- - / .... . .-. . / .- -. -.. / .- / -.. .- ... .... / - .... . .-. .`

there is alot of websites that can decode morse code i used https://morsecode.world/international/translator.html

Flag: `Aspire{A DOT HERE AND A DASH THERE}`
