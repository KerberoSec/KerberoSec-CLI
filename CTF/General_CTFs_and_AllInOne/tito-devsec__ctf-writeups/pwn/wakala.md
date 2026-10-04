# CTF Write-up: WAKALA

**Category:** Pwn / Binary Exploitation
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge provided a Linux binary named `wakala` which simulated a mobile money platform. The goal was to find a hidden flag within the binary.

## Vulnerability Analysis
### What was wrong?
The binary contained an **undocumented debug backdoor**. While the user interface only showed options 1-4, the underlying code explicitly checked for an input of `0`. If `0` was entered, the program entered an "ADMIN DEBUG MODE" and printed the flag.

## Solution
1.  **Static Analysis:** Use `objdump` or a decompiler to inspect the binary's logic.
2.  **Backdoor Discovery:** Analysis of the dispatch logic revealed a comparison against `0`:
    ```c
    int choice = atoi(input);
    if (choice == 0) {
        puts("=== ADMIN DEBUG MODE ===");
        printf("SECRET_KEY: %s\n", flag);
        exit(0);
    }
    ```
3.  **Exploitation:** Connect to the remote service and trigger the hidden path.
    *   Choose option `2` (Check Balance).
    *   When prompted for a sub-option, enter `0`.
4.  **Result:** The server responds with the flag.

## Code Comparison

### Vulnerable Code (with Backdoor)
Leaving debug or administrative shortcuts in production code:
```c
void handle_menu() {
    int choice;
    scanf("%d", &choice);
    if (choice == 0) { // Hidden backdoor
        print_flag();
    }
    // ... rest of the menu
}
```

### Secure Code
Remove all debug code, backdoors, and unadvertised features before compiling for production. Use preprocessor directives to ensure debug code is only included in development builds.
```c
void handle_menu() {
    int choice;
    scanf("%d", &choice);
    #ifdef DEBUG
    if (choice == 0) {
        print_debug_info();
    }
    #endif
    // ... rest of the menu
}
```

## Lessons Learned
*   **Hidden Logic:** Never assume that the only possible inputs are the ones shown in the UI.
*   **Static Analysis:** Tools like `strings`, `objdump`, and `Ghidra` are essential for uncovering hidden functionality in compiled binaries.
*   **Clean Production Code:** Always perform a thorough code review to ensure no debug paths or "shortcuts" remain in the final product.

## Flag
`tzcert{1103b732aefdfa519ae59a698df77115}`
