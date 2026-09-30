![Hex](https://user-images.githubusercontent.com/33517160/113944955-14270e00-980e-11eb-8ef8-d34a37e56f6d.png)

- Challenge Name: **`Primer - Hex`**
- Points: **`50pts`**
- Challenge:
>> Obtain the flag from the following hex data.
>>
>>  51584e7761584a6c653046795a534235623355675953426b5a585a766447566c4947396d4948526f5a53426d6157356c49474679644342765a6942696158527a494746755a4342696558526c637a3939

## Solution:
We know its a Hex encoded string but when we decode it we get a base64 encoded string so its a double encoding,
this is what we get when we decode the hex 

`QXNwaXJle0FyZSB5b3UgYSBkZXZvdGVlIG9mIHRoZSBmaW5lIGFydCBvZiBiaXRzIGFuZCBieXRlcz99`

you can decode them using **cyberchef**

https://gchq.github.io/CyberChef/#recipe=From_Hex('Auto')From_Base64('A-Za-z0-9%2B/%3D',true)&input=NTE1ODRlNzc2MTU4NGE2YzY1MzA0Njc5NWE1MzQyMzU2MjMzNTU2NzU5NTM0MjZiNWE1ODVhNzY2NDQ3NTY2YzQ5NDczOTZkNDk0ODUyNmY1YTUzNDI2ZDYxNTczNTZjNDk0NzQ2Nzk2NDQzNDI3NjVhNjk0MjY5NjE1ODUyN2E0OTQ3NDY3NTVhNDM0MjY5NjU1ODUyNmM2MzdhMzkzOQ

after decoding the base64 we get our flag

Flag: `Aspire{Are you a devotee of the fine art of bits and bytes?}`
