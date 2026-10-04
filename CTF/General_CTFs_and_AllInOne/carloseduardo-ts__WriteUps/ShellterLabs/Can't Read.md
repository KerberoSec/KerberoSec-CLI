# Christmas Challenges: Can't Read

This is a challenge proposed in the: https://shellterlabs.com/pt/questions/christmas-challenge-2017/cant-read/  
Each group  (x,x,x) is a tuple rgb equivalent to one pixel, now, we need to transform the tuples in corresponding colors.   For this, I did following code in python:

```python
from PIL import Image 

filename = input("Filename: ")
arq = open(filename, "r")
rep = arq.read().replace(", ",",").replace("(","").replace(")","")
lines = rep.split("\n")

h = len(lines)
w = len(lines[0].split(" "))

im = Image.new("RGB", (w, h))
pix = im.load()
for x in range(h-1):
	tuplas = lines[x].split(" ") 
	for y in range(w-1):
		r = tuplas[y].split(",")[0]
		g = tuplas[y].split(",")[1]
		b = tuplas[y].split(",")[2]
		pix[y,x] = (int(r),int(g),int(b))
im.save("asdf.png", "PNG")
```

See more write-ups in: https://www.youtube.com/playlist?list=PLlq-hlhs91wqtRtIgQRxmqvgqTDZn6Qhu
