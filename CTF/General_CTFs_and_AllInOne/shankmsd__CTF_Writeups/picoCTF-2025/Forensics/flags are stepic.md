## Challenge 🧩

A group of underground hackers might be using this legit site to communicate. Use your forensic techniques to uncover their message

Author: Ricky</br>
Points: 100

Hint: In the country that doesn't exist, the flag persists.

## Solution 🕵️‍♂️

When checking the source code of the page, one variable caught my eye: definitely worth a closer look.

```javascript
...
{ name: "Upanzi, Republic The",img: "flags/upz.png", style:"width: 120px!important; height: 90px!important;" },
...
```

After running file through different tools, got to know the python package called `stepic` for hiding arbitrary data within images by slightly modifying the colors.

```bash
┌──(user㉿shell)-[~]
└─$ stepic --decode --image-in=upz.png
picoCTF{fl4g_h45_fl4gxxxxxxxx} 
```

### Tool Used

> `stepic`

## Flag 🚩

`picoCTF{fl4g_h45_fl4gxxxxxxxx}`
