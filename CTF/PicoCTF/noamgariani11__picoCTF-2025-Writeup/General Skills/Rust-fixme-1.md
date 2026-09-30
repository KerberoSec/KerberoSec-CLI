# Description

Have you heard of Rust? Fix the syntax errors in this Rust file to print the flag!
Download the Rust code here.

# Solution

`wget https://challenge-files.picoctf.net/c_verbal_sleep/3f0e13f541928f420d9c8c96b06d4dbf7b2fa18b15adbd457108e8c80a1f5883/fixme1.tar.gz`

To unpack the fixme1 directory run this command: `tar -xvf fixme1.tar.gz`. Then you can use `cd fixme1` to enter the directory. If you are running Linux and haven't used Rust before you can run `sudo apt install cargo -y` to be able to run the Rust Program. After doing this you can use `cargo run` and see the errors that pop up. Of course you can look at the file before running it to see that there where there are comments in the areas that need to be fixed. To do that just look in the `src` folder within the `fixme1` directory.

There are three lines that need to be fixed:

In line 5 add a semicolon

In line 18 change ret to return

In line 25 change ":?" to "{}"

Then once all of the errors are fixed run `cargo run`, you can also use `cargo run` in intervals each time you add new fix to see the errors change and lessen as you go.

I would suggest doing the Rustlings course if you'd like to learn more about Rust:
https://github.com/rust-lang/rustlings

Flag: `picoCTF{4r3_y0u_4_ru$t4c30n_...}`