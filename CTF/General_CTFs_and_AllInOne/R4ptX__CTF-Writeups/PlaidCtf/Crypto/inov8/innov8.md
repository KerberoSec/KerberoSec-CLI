Let's explore the subject.
d8 is the build of chromiun v8 (see that on the dockerfile)
And node is another engine.
```for bit in secretbits:
    if bit == '0':
        output += [float(i) for i in subprocess.check_output('./d8 gen.js', shell=True).decode().split()]
    else:
        output += [float(i) for i in subprocess.check_output('node gen.js', shell=True).decode().split()]

```
Here when bit is null, it uses the js engine of chromiun v8 for generate 24 number and when it isn't null it uses node js to generate the 24 next sequence.

We can find that on some engine math.import() could be predictable.
https://github.com/PwnFunction/v8-randomness-predictor

And if we can determined what bit is 0 and what bit is 1, we can get the flag.
We try on the first 24 sequence, it doesn't work.
So chromiun isn't predictable.
However the next 24 sequence (node engine) is predictable.

IT'S WIN!

You could find the solution made by mathac here.

Run it and you get the flag and the password for the part 2.
