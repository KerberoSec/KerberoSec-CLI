Write-up:

1. We are given an `app.py`, and we can see that, comparing to File Viewer, it now
checks the first two characters of the filename to see if they are dots in order to
prevent path traversal. However, we can bypass this with `/view-file?file=./../flag.txt`,
which returns the flag: `LITCTF{d4ng_i_gu3ss_th4t_w4snt_s3cure_enough}`