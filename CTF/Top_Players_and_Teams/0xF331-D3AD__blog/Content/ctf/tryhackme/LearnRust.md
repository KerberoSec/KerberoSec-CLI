
# Learn Rust

## *What is Rust?*

- What other language is Rust similar to in terms of performance?

> c++

- What famous company switched from Go to Rust, mentioned in this task?

> Discord

- Microsoft Security Centre reports what percentage of CVE's they assign are memory safety issues? Include the % sign.

> 70%

- What is Rust's version of NPM or PyPi?

> cargo

---

## *Installing & Tooling*

- What is the tool we used to install Rust called?

> rustup

- How do we install the package rustscan using cargo?

> cargo install rustscan

- What command do we run to format our code?

> cargo fmt

---

## *Hello, World!*

- How do we initialise a new Rust project?

> cargo init

- What character represents a macro?

> !

- What does every Rust project need as a file?

> main.rs

- If we wanted to add a dependency to our Rust project, what file would we edit?

> Cargo.toml

- How do we run our Rust project?

> cargo run

- How do we build the project RustScan with the release profile (most optimised)?

> cargo build --release

- What folder are the release binaries stored in?

> target/release/

- How many release profiles does Rust have using optimisation level?

> 4

---

## *Variables*

- In question 1, does this code compile? T(rue) or F(alse)

> F

- What is the error code returned by question 1?

> E0308

- Does the code in question 2 compile? T(rue) or F(alse)

> F

- What is the error message returned?

> cannot assign twice to immutable variable

---

## *Constant Variables*

- How do we define a constant in Rust?

> const

- Can we shadow a constant? T(rue) or F(alse)

> F

- What do we use to change the type of an immutable variable once it has been defined?

> shadowed

- Will the code "CONST word = "yes"" compile? T(rue) or F(alse)

> F

- We have "let word = "hello"", how do we get the length of the variable?

> word.len()

---

## *Data Structures*

- Given the number -6, is this signed or unsigned?

> signed

- Given the number 65536, what is the smallest unsigned datatype we can fit this into?

> u32

- What's the smallest sized signed integer in rust?

> i16

- Create a mutable u32 variable called "tryhackme" and assign it the number 9

> let mut tryhackme: u32 = 9

- What data type is used to represent a string slice?

> &str

- Let's say you had a variable, X. You wanted to typehint the variable as a string. What would you write? Include X in the variable but not the let or = parts.

> X: string

---

## *Functions*

- Will question 1 return 8172192? T(rue) or F(alse)

> F

- Will example 2 run? T(rue) or F(alse)

> F

- What type should we give to the argument for question 3?

> &str

- The last expression in a function (the return) needs to have a semicolon. T(rue) or F(alse)

> F

- Every function need to return something. T(rue) or F(alse)

> F

- Functions in Rust can be nested within other functions. T(rue) or F(alse)

> T

- What keyword do we use to return early from a function?

> return

- You nest a function named main, inside another function named main. Will this run? T(rue) or F(alse)

> T

---

## *Loops*

- How do we break out of a loop?

> break

- Simplest keyword to make an infinite loop?

> loop

- Turn let a = [10, 20]; into something we can iterate over.

> a.iter()

- While loops can also be infinite. T(rue) or F(alse).

> T

---

## *Zero Cost Abstractions*

- Iterators are lazy. T(rue) or F(alse).

> T

- For loops are explicitly mentioned in the Rust book as zero cost abstractions. T(rue) or F(alse).

> F

- Zero Cost Abstractions are common in high level languages like Python or JavaScript T(rue) or F(alse).

> F

---

## *Rayon*

- What crate do we use to easily make an iter multi threaded?

> rayon

- How do we tell Rust to include an external crate into our program? What file do we place this information in?

> cargo.toml

- Turn a.iter() into a multi threaded parallel iter using Rayon

> a.par_iter()

- What website do we go to for Crates?

> crates.io

---

## *If Statements*

- We can assign variables based on an if statement on one line T(rue) or F(alse)

> T

---

## *Error Handling*

- What is the data type returned from opening a file?

> Result

- Write the datatype of a generic Result with type hints

> Result T, E>

- We're in a function and we get given a Result enum. If the Result is okay we want to continue working on it in this function. If the result is Err we want to return to the parent function with Err. What should we use?

> ?

- We're certain our result will always return Ok, what should we use?

> unwrap

---

## *Challenge*

- Challenge 1

The project has following structure:

```
.
├── Cargo.lock
├── Cargo.toml
├── chal.txt
├── src
│   └── main.rs
```

[x] Cargo.toml:

```
[package]
name = "challenge"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
base64 = "0.13.0"

```

[x] chal.txt

```
M3I6r2IbMzq9

```

[x] main.rs

```rust
use std::fs::File;
use std::io::Read;

fn read_file(path: String) -> String{
    let f = File::open(path);
    let mut f = match f {
        Ok(file) => file,
        Err(_) => panic!("Couldn't open file."),
    };

    let mut s = String::new();

    s = match f.read_to_string(&mut s) {
        Ok(_) => s,
        Err(_) => panic!("Couldn't read the file!"),
    };

    return s;
}

fn rot(s: String, steps: u8) -> String {
    let mut out: String = "".to_string();
    for c in s.chars() {
        let code: u8 = c as u8;
        let mut rotated: char = c;

        if code >= 65 && code <= 90 {
            let mut rotated_code: u8 = (code + steps) % 91;
            rotated_code = if rotated_code < 65 {
                rotated_code + 65
            } else {
                rotated_code
            };
            rotated = rotated_code as char;
        } else if code >= 97 && code <= 122 {
            let mut rotated_code: u8 = (code + steps) % 123;
            rotated_code = if rotated_code < 97 {
                rotated_code + 97
            } else {
                rotated_code
            };
            rotated = rotated_code as char;
        }
        out.push(rotated);
    }
    return out;
}

fn base64_decode(s: String) -> String{
    let decoded_bytes = base64::decode(s).unwrap();
    return String::from_utf8(decoded_bytes).unwrap();
}

fn main() {
    let encoded = read_file("./chal.txt".to_string());
    println!("Encoded: {}", encoded);
    let rotated = rot("M3I6r2IbMzq9".to_string(), 13);
    let base64decoded = base64_decode(rotated);
    let answer = rot (base64decoded, 13);
    println!("Decoded: {}", answer);
}
```

> thm{rust}
