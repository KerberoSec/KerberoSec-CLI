# Pretty Hard Programming

* Problem:

  If you can guess the admin's password you can get a key 
  [Problem](https://2013.picoctf.com/problems/php1/): [Source](https://2013.picoctf.com/problems/php1/index.phps)

* Solution:

  Viewing the source, we see that it verifys if password is the same as secretkey. There's a function `extract($_GET)` that gets the password. However, this does not only updates password, it also updates any field specified. Hence we can craft our query to let password and secret_key equal to the same thing, for example `?password=1&secret_key=1`. This will reveal the flag

* Answer:

  php_means_youre_going_to_have_a_bad_time
