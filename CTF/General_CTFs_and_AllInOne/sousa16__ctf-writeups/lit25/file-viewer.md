Write-up:

1. We are given an `app.py`. We see that it has 3 random files, and one of them
tells us to look for the flag outside the directory.

2. Using `/view-file?file=../flag.txt` we are able to retrieve the flag:
`LITCTF{o0ps_f0rg0t_t0_s3cur3_my_dir3ct0ry}`