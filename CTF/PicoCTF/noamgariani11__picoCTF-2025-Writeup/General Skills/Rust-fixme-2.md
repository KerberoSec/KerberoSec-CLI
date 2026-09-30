# Description

The Rust saga continues? I ask you, can I borrow that, pleeeeeaaaasseeeee?
Download the Rust code here.

# Solution

`wget https://challenge-files.picoctf.net/c_verbal_sleep/babfbee79718a6363826ba86300173ffde6d81577e9dd07d4130c53a7eecf6c3/fixme2.tar.gz`

Same steps as the previous rust challenge: `tar -xvf fixme2.tar.gz` then `cd fixme2` and `cargo run` to test the file for errors with the source file in the src folder. 

The first comment is on line 3 which can be fixed by putting `&mut` for borrowed string to be `borrowed_string: &mut String`.

```
fn decrypt(encrypted_buffer:Vec<u8>, borrowed_string: &mut String){ // How do we pass values to a function that we want to change?
```

Next error is the decryption object on line 14. This can be fixed by putting the "Decrypt flag and print it out" section into the if statement and setting xrc to res `let Ok(xrc) = res` as the condition for the if statement.

```
    let res = XORCryptor::new(&key);
    if let Ok(xrc) = res {
        // Decrypt flag and print it out
        let decrypted_buffer = xrc.decrypt_vec(encrypted_buffer);
        borrowed_string.push_str(&String::from_utf8_lossy(&decrypted_buffer));
        println!("{}", borrowed_string);
    }
```

Lastly, lines 34-35 are just fixed by adding `mut` and `&mut` respectively.

```
    let mut party_foul = String::from("Using memory unsafe languages is a: "); // Is this variable changeable?
    decrypt(encrypted_buffer, &mut party_foul); // Is this the correct way to pass a value to a function so that it can be changed?
```

Then once all of the errors are fixed run `cargo run` to get the flag.

Here is the full code for reference:
```
use xor_cryptor::XORCryptor;

fn decrypt(encrypted_buffer:Vec<u8>, borrowed_string: &mut String){ // How do we pass values to a function that we want to change?

    // Key for decryption
    let key = String::from("CSUCKS");

    // Editing our borrowed value
    borrowed_string.push_str("PARTY FOUL! Here is your flag: ");

    // Create decrpytion object
    let res = XORCryptor::new(&key);
    if let Ok(xrc) = res {
        // Decrypt flag and print it out
        let decrypted_buffer = xrc.decrypt_vec(encrypted_buffer);
        borrowed_string.push_str(&String::from_utf8_lossy(&decrypted_buffer));
        println!("{}", borrowed_string);
    }
}

fn main() {
    // Encrypted flag values
    let hex_values = ["41", "30", "20", "63", "4a", "45", "54", "76", "01", "1c", "7e", "59", "63", "e1", "61", "25", "0d", "c4", "60", "f2", "12", "a0", "18", "03", "51", "03", "36", "05", "0e", "f9", "42", "5b"];

    // Convert the hexadecimal strings to bytes and collect them into a vector
    let encrypted_buffer: Vec<u8> = hex_values.iter()
        .map(|&hex| u8::from_str_radix(hex, 16).unwrap())
        .collect();

    let mut party_foul = String::from("Using memory unsafe languages is a: "); // Is this variable changeable?
    decrypt(encrypted_buffer, &mut party_foul); // Is this the correct way to pass a value to a function so that it can be changed?
}
```

Flag: `picoCTF{4r3_y0u_h4v1n5_fun_...}`