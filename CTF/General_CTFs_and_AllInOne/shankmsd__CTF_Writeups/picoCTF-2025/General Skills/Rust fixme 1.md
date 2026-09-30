## Challenge 🧩

Have you heard of Rust? Fix the syntax errors in this Rust file to print the flag!

Author: Taylor McCampbell</br>
Points: 100

Hints:

1. Cargo is Rust's package manager and will make your life easier. [See the getting started page here](https://doc.rust-lang.org/book/ch01-03-hello-cargo.html)
2. [println!](https://doc.rust-lang.org/std/macro.println.html)
3. Rust has some pretty great compiler error messages. Read them maybe?

## Solution 🕵️‍♂️

```rust
use xor_cryptor::XORCryptor;

fn main() {
    // Key for decryption
    let key = String::from("CSUCKS"); // Fix 1

    // Encrypted flag values
    let hex_values = ["41", "30", "20", "63", "4a", "45", "54", "76", "01", "1c", "7e", "59", "63", "e1", "61", "25", "7f", "5a", "60", "50", "11", "38", "1f", "3a", "60", "e9", "62", "20", "0c", "e6", "50", "d3", "35"];

    // Convert the hexadecimal strings to bytes and collect them into a vector
    let encrypted_buffer: Vec<u8> = hex_values.iter()
        .map(|&hex| u8::from_str_radix(hex, 16).unwrap())
        .collect();

    // Create decrpytion object
    let res = XORCryptor::new(&key);
    if res.is_err() {
        return; // Fix 2
    }
    let xrc = res.unwrap();

    // Decrypt flag and print it out
    let decrypted_buffer = xrc.decrypt_vec(encrypted_buffer);
    println!(
        "{}", // Fix 3 
        String::from_utf8_lossy(&decrypted_buffer)
    );
}
```

### Fixes & Explanations

1. Semicolon (;): Every statement in Rust needs to end with a semicolon unless it's the final expression in a block.

2. return;: is the correct way to return early from a function.

3. println! format: To print variables, use println!("Your message: {}", var);.

```bash
┌──(user㉿shell)-[~/fixme1/src]
└─$ cargo run
    picoCTF{4r3_y0u_4_ru$t4c30n_n0w?}
```

## Flag 🚩

`picoCTF{4r3_y0u_4_ru$t4c30n_n0w?}`
