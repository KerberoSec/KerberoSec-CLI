1. ```
sudo apt install upx-ucl
```
try doing `ltrace ./challs` or `strings challs`. it results in a corrupted output.
```
2. ```
upx -d challs -o challs_unpacked
```
you can now do: ```
strings challs_unpacked
```
and
```
ltrace ./challs_unpacked
```
3. after decoding the whole program (EVEN GOING TO ASSEMBLY), u can now use a.py to brute force find the 32 bit hex.
```
python a.py
```