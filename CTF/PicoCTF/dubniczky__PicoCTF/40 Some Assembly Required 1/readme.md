Target http://mercury.picoctf.net:36152/index.html

Download suspicious file

```
curl http://mercury.picoctf.net:36152/JIFxzHyW8W -o data.bin
```

Get strings from binary

```
strings data.bin
```

The flag is at the end