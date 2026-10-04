#  Scavenger Hun

# Descripción
There is some interesting information hidden around this site [http://mercury.picoctf.net:5080/](http://mercury.picoctf.net:5080/). Can you find it?
# Pistas
You should have enough hints to find the files, don't run a brute forcer.
# Solución

```bash
Mirando el codigo fuente de la pagina:

<!-- Here's the first part of the flag: picoCTF{t -->

Mirando el CSS:

/* CSS makes the page look nice, and yes, it also has part of the flag. Here's part 2: h4ts_4_l0 */

Mirando el robots.txt:

# Part 3: t_0f_pl4c
# I think this is an apache server... can you Access the next flag?

Mirando el .htaccess:

# Part 4: 3s_2_lO0k
# I love making websites on my Mac, I can Store a lot of information there.

Mirando el .DS_Store:

Congrats! You completed the scavenger hunt. Part 5: _35844447}

```

# Bandera

picoCTF{th4ts_4_l0t_0f_pl4c3s_2_lO0k_35844447}