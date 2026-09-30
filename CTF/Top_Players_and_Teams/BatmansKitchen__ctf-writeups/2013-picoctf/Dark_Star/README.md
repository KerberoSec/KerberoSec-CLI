# Dark Star

* Problem:

  Sure are a lot of stars out there... but there's a lot of empty space for things to hide in, too.
The disk image can be found on the shell machines at `/problems/dark_star.img` and the contents of the image are available in `/problems/dark_star/`

* Solution:

  The hint is a misguidance...
First scp the image from the server using
`scp user7434@shell.picoctf.com:/problems/dark_star.img .`
Enter the password: DCEE1v9m6T
Mount the .img file, we see nothing special there.
run `foremost dark_star.img` on the image
Now we see somthing interesting, there are files that we haven't seen before
cd into output/png, we can see the png file containing the answer

* Answer:

  stars hide your fires
