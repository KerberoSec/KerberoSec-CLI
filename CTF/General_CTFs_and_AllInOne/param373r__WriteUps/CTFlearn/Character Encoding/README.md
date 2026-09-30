# Character Encoding
## About

### General Information

__Challenge__: In the computing industry, standards are established to facilitate information interchanges among American coders. Unfortunately, I've made communication a little bit more difficult. Can you figure this one out? ```41 42 43 54 46 7B 34 35 43 31 31 5F 31 35 5F 55 35 33 46 55 4C 7D```

__Challege Category__: CRYPTO

__Challenge Difficulty__: Easy

__Skills__: Observation, Converting Number Systems (Octal, Hexa, Binary, Decimal)

## Solution

As you can see, we have the flag in this format: ```41 42 43 54 46 7B 34 35 43 31 31 5F 31 35 5F 55 35 33 46 55 4C 7D```

Now, am not sure in case you noticed it, that the flag is converted to hex chars, and all we got to do is convert this string into ascii. So, go to this [site](https://www.rapidtables.com/convert/number/hex-to-ascii.html), which I generally use to convert my strings into other formats.

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Character%20Encoding/1.png)

__Flag__: ABCTF{45C11_15_U53FUL}
