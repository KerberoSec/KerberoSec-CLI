# Bandit Level 4

In this challenge the password is stored in the only human readable file in the `inhere` directory.

Entering the directory we are greeted with 10 files named `-file0<number>`. To find this we can use the `file` command which will return the filetype.
> `file ./-file0<number>`

To make this faster, we can use the wildcard character `?`, which the shell interprets as "any single chacracter". This allows us to check all of our files in one command.
> `file ./-file0*`

That command returns this:

As we can see there is one file that is made up of ASCII text.

Opening this file reveals the password: `lrIWWI6bB37kxfiCQZqUdOIYfr6eEeqR`
