# NSA backdoors ...
... are hopefully only present in CTF challenges. This repository contains a blog post about my experience solving the [NSA backdoor](https://play.picoctf.org/practice/challenge/283?category=2&page=5) challenge of this year's [picoCTF](https://picoctf.org/competitions/2022-spring.html). The post is wrapped into a [Pluto notebook](https://github.com/fonsp/Pluto.jl). Pluto notebooks are a free and open source notebook programming environment written in, and for, the [Julia programming language](https://julialang.org/).

If you want to read the *non-interactive* version of this post, simply open `nsa_backdoor.html` in your browser.

To view the interactive version, [download the Julia binary](https://julialang.org/downloads/) and add it to your `PATH`. Then, run the `julia` command, press `]` to enter the package manager, enter `add Pluto`, and finally `^C` to get back to the Julia repl. Finally, open `nsa_backdoor.jl` by running 
```
julia> import Pluto
julia> Pluto.run()
```
and navigating to wherever you `git clone`d this repo to.
