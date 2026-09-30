---
type: resource-note
status: done
created: 2026-02-13
updated: 2026-03-12
tags: [security-writeup, tryhackme, rust, programming]
source: TryHackMe: Learn Rust
platform: tryhackme
room: Learn Rust
slug: learn-rust
path: TryHackMe/00-foundations/learn-rust.md
topic: 00-foundations
domain: [foundations, programming]
skills: [rust-basics, ownership, borrowing, error-handling]
artifacts: [concept-notes, lab-notes]
sanitized: true
---

# Learn Rust

## Summary

* Goal: reverse a simple ciphertext pipeline and print the plaintext in Rust.
* Pipeline (reverse): `rot13 -> base64 decode -> rot13`.
* Result (plaintext): `thm{rust}`.
* Rust angle: keep each intermediate as an *owned* value (`Vec<u8>` / `String`) to reduce lifetime/borrow-checker friction.

## Key Concepts

* Ownership (所有权): a value has one owner; when the owner goes out of scope, memory is freed.
* Borrowing (借用): pass `&T` (shared reference) so a function can read without taking ownership.
* `Vec<u8>` vs `&[u8]`:

  * `Vec<u8>` is an owned, growable byte buffer.
  * `&[u8]` is a borrowed view (slice) into bytes.
* `String` vs `&str`:

  * `String` is owned UTF‑8 text.
  * `&str` is a borrowed view into UTF‑8 text.
* `Result<T, E>` + `?`: propagate errors without manual match boilerplate.

### 2) Reverse pipeline

Ciphertext: `M3I6r2IbMzq9`

Steps:

1. `rot13(ciphertext)` → `Z3V6e2VoZmd9`
2. `base64_decode(step1)` → bytes representing `guz{ehfg}`
3. `rot13(step2_bytes)` → bytes representing `thm{rust}`
4. `utf8(step3_bytes)` → `String`

### 3) Implementation (Rust)

Design rule: **one transformation per line**, store intermediates as owned values.

```rust
use base64::{engine::general_purpose::STANDARD, Engine as _};
use std::error::Error;

fn rot13_bytes(input: &[u8]) -> Vec<u8> {
    input
        .iter()
        .map(|&b| match b {
            b'a'..=b'z' => b'a' + (b - b'a' + 13) % 26,
            b'A'..=b'Z' => b'A' + (b - b'A' + 13) % 26,
            _ => b,
        })
        .collect()
}

fn main() -> Result<(), Box<dyn Error>> {
    let cipher = "M3I6r2IbMzq9";

    // rot13 -> base64 decode -> rot13
    let step1 = rot13_bytes(cipher.as_bytes());
    let step2 = STANDARD.decode(&step1)?; // Vec<u8>
    let step3 = rot13_bytes(&step2);

    let plaintext = String::from_utf8(step3)?;
    println!("{plaintext}"); // thm{rust}
    Ok(())
}
```

#### Cargo.toml

```toml
[dependencies]
base64 = "0.22.1"
```

### 4) Why this avoids borrow-checker pain

Common beginner trap: creating references (`&[u8]`, `&str`) to *temporary* values that get dropped too early.

This pattern avoids it:

* Each intermediate is stored in a named variable (`step1`, `step2`, `step3`).
* The next call borrows it briefly (`&step1`, `&step2`) and returns a new owned value.
* Net effect: minimal lifetimes to reason about; no dangling references.

### 5) Pitfalls

* Base64 decoding returns raw bytes; not everything is valid UTF‑8. Here it is, but in general `String::from_utf8(...)` can fail.
* ROT13 is defined over ASCII letters; for non-ASCII text you’d need different logic.
* Prefer explicit engines (`STANDARD`) instead of deprecated helper functions.

## Takeaways

* Treat low-level transforms as `bytes -> bytes` until the final `bytes -> String` conversion.
* When in doubt in Rust: **own the intermediate**, borrow only for the next function call.

## CN: EN Glossary

* Ownership: 所有权
* Borrowing: 借用
* Lifetime: 生命周期
* Slice: 切片
* Heap allocation: 堆分配
* Trait: 特征
* Error propagation: 错误传播
* Crate: 包/库

## References

```text
Rust Book (References & Borrowing):
https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html

base64 crate docs (v0.22.1):
https://docs.rs/base64/latest/base64/
```

---

## Appendix A: Room content

### A1. What is Rust (high-level framing)

* Rust is a compiled, low-level language positioned as “C++-class performance” with stronger safety guarantees and modern ergonomics.
* Stated goals: **Fast**, **Secure**, **Productive**.
* Security angle: memory safety is enforced by the **ownership model**; unsafe operations are possible but must be explicit (`unsafe`).

### A2. Core safety model: ownership, move, borrow

Ownership rules (as stated in the room):

* Each value has an owner.
* Only one owner at a time.
* When the owner goes out of scope, the value is dropped.
* Values can be moved or borrowed, but ownership remains single.

Implication for beginners coming from Python/JS:

* Many “it runs but is subtly wrong” patterns become **compile-time errors**.
* Iterators / adapters may be **consumed** (moved) by methods; reusing them can trigger “use of moved value” errors.

### A3. Tooling and project workflow

Install and toolchain:

* `rustup` manages Rust installs (stable/nightly).
* `cargo` is the package manager / build tool.
* Recommended ecosystem tooling mentioned: `rust-analyzer`, `clippy`, `rustfmt`.

Cargo quick commands:

* `cargo init`: initialise a new project.
* `cargo run`: build + run.
* `cargo build`: build only.
* `cargo build --release`: optimised build (release profile).
* `cargo fmt`: format code.
* `cargo install <pkg>`: install a crate binary (example in room: `cargo install rustscan`).

Project structure after `cargo init`:

* `Cargo.toml`
* `src/main.rs`
* build outputs under `target/` (debug builds under `target/debug/`, release builds under `target/release/`).

### A4. Variables, mutability, constants, shadowing

Key rules:

* Variables are immutable by default.
* Use `mut` to allow mutation.
* Use **shadowing** (`let x = ...; let x = ...;`) to “rebind” and even change types while keeping immutability semantics.
* Constants use `const` (and cannot be shadowed in the same way as variables in the room’s tasks).

### A5. Data types (what the room emphasises)

Integers:

* Unsigned: `u8 u16 u32 u64 u128` (positive only)
* Signed: `i8 i16 i32 i64 i128` (positive/negative)
* Pointer-sized: `usize` / `isize`

Strings:

* `String`: growable, heap-allocated string.
* `&str`: string slice (borrowed view into string data).

### A6. Functions (fn, arguments, return types)

* Define with `fn name(args...) -> ReturnType { ... }`.
* Arguments must be typed.
* Rust returns the **last expression** if it has no trailing semicolon.
* `main` exists for binaries and typically returns `()`.

### A7. Loops and iteration (what shows up in the PDF)

* `loop { ... }`: infinite loop until `break`.
* `while <cond> { ... }`: conditional loop.
* Iterators are emphasised as **lazy**; they do nothing until consumed.

### A8. “Zero-cost abstractions” and iterators

Room claim:

* Iterators are a “zero-cost abstraction” pattern: you write high-level iterator pipelines without paying runtime overhead compared to hand-optimised low-level code.

Example pipeline style (room pattern):

```rust
let a = vec![1, 2, 3];
let sum_sq: i32 = a.iter()
    .map(|&i| i * i)
    .sum();
```

### A9. Easy parallelism with Rayon (as presented)

The room introduces `rayon` as a crate where you can often switch:

* `iter()` → `par_iter()`

Minimal pattern:

```rust
use rayon::prelude::*;

fn sum_of_squares(input: &[i32]) -> i32 {
    input.par_iter().map(|&i| i * i).sum()
}
```

### A10. If-expressions

* `if` works as expected.
* Additionally, `if` can be used as an **expression** to assign values:

```rust
let result = if cond { 15 } else { 200 };
```

### A11. Error handling with `Result<T, E>`

Room framing:

* Operations that can fail often return `Result<T, E>`.
* Three techniques shown:

  1. `.unwrap()`: assume success; panic on error.
  2. `match`: branch on `Ok` / `Err`.
  3. `?` operator: propagate `Err` to the caller; continue on `Ok`.

Pattern:

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut f = File::open("username.txt")?;
    let mut s = String::new();
    f.read_to_string(&mut s)?;
    Ok(s)
}
```

### A12. Room checkpoint answers (extracted directly from the PDF)

Tooling / project:

* Install manager tool: `rustup`
* New project: `cargo init`
* Run: `cargo run`
* Build: `cargo build`
* Format: `cargo fmt`
* Dependency file: `Cargo.toml`
* Macro call marker: `!`
* Release binaries path format: `target/release/`

Mutability / shadowing:

* Make mutable: `mut`
* Define constant: `const`
* Change value of an immutable binding (room answer): **shadowing**

Types:

* Smallest signed integer (room answer): `i16`
* String slice type: `&str`
* Type-hint a variable `x` as a string (room answer format): `x: String`
* Create mutable `u32 tryhackme = 9`:

```rust
let mut tryhackme: u32 = 9;
```

Error handling:

* Return type from opening a file (room answer): `Result`
* Generic Result type (room answer format): `Result<T, E>`
* Propagate errors upwards (room answer): `?`
* Assume always `Ok` (room answer): `unwrap`

Parallel iterator:

* Crate used (room answer): `rayon`
* Make iterator parallel (room answer): `a.par_iter()`

### A13. Mini-lab: reverse pipeline (your ciphertext exercise)

Keep your earlier approach: store intermediates as owned values (`Vec<u8>` / `String`) and chain one transform per line. This keeps ownership/borrowing simple for a first Rust implementation.

---

## Glossary (CN: EN)

* ownership（所有权）
* borrowing（借用）
* move semantics（移动语义）
* lifetime（生命周期）
* `Result<T, E>`（结果类型/错误处理枚举）
* zero-cost abstractions（零成本抽象）
* iterator（迭代器）
* crate（Rust 包/库）
* macro（宏）
* release profile（发布构建配置）
