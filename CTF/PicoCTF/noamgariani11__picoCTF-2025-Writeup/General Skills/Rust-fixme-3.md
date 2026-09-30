# Description

Have you heard of Rust? Fix the syntax errors in this Rust file to print the flag!
Download the Rust code here.

# Solution

`wget https://challenge-files.picoctf.net/c_verbal_sleep/dcdaf491b35c1d0f5075e9583edbbb7aaea1dffb6ad32bc000e4d87b5200ff7b/fixme3.tar.gz`

Same steps as the previous rust challenge: `tar -xvf fixme3.tar.gz` then `cd fixme3` and `cargo run` to test the file for errors with the source file in the src folder. After running `cargo run` you can see there is a call to an unsafe function which Rust only allows if you put unsafe{} around it. It mentions it in the comment above the function.

Just uncomment lines 22 and 34 to put the unsafe around the unsafe function. 

Then run `cargo run` to get the flag.

Flag: `picoCTF{n0w_y0uv3_f1x3d_1h3m_...}`