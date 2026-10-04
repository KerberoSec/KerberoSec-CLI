![image](https://user-images.githubusercontent.com/33517160/114916427-734bda80-9e2d-11eb-869f-e1c0d538da4d.png)

- Challenge Name: **`Cover`**
- Points: **`150pts`**
- Challenge:
>> Find what is hidden. My cool friend will help you pass.
>>
>> https://ciphercode.dev/files/23e48b8b3bee2aadc707292b52cfa33f/scorpion.jpg?token=eyJ1c2VyX2lkIjozMDYsInRlYW1faWQiOjIwNywiZmlsZV9pZCI6Mjh9.YHh9BA.IspPv3Ca6MwkSEJjJOODmIDL1lc

## Solution:
The image size seems to be a little bit high for a `jpg` image,
this challenge solved with the tool [Stegseek](https://github.com/RickdeJager/stegseek/releases/tag/v0.5)

`stegseek scorpion.jpg`

![image](https://user-images.githubusercontent.com/33517160/114917182-55cb4080-9e2e-11eb-9a09-753790e70322.png)

after using stegseek stegseek will exctract another `jpg` the image contains the flag

![image](https://user-images.githubusercontent.com/33517160/114917573-c7a38a00-9e2e-11eb-80f2-a291467d02c1.png)

Flag: `Aspire{Chill}`
