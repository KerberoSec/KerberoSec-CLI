# Behind The Scenes: Very Easy

* the given ZIP file contains a challenge file that contains the flag

* checking the format using ```file``` shows that it is a 64-bit executable

* running the challenge executable shows that we need a password as an argument

* checking using ```strings``` does not give anything

* we need to do reverse engineering using a tool like ```ghidra```

* launch Ghidra, create a new (non-shared) project with any name, and load the 'Code Browser' tool from the 'tool chest'

* in the Code Browser window, navigate to File > Import File: and import the challenge file: this shows the binary format and language, click on 'OK' and analyze with default settings

* from the 'Symbol Tree' pane, expand the 'Functions' part to view the ```main``` function and double-click it: this shows the decompiled code: which can be checked further using ChatGPT:

    ```c
    void main(void)

    {
    long in_FS_OFFSET;
    sigaction local_a8;
    undefined8 local_10;
    
    local_10 = *(undefined8 *)(in_FS_OFFSET + 0x28);
    memset(&local_a8,0,0x98);
    sigemptyset(&local_a8.sa_mask);
    local_a8.__sigaction_handler.sa_handler = segill_sigaction;
    local_a8.sa_flags = 4;
    sigaction(4,&local_a8,(sigaction *)0x0);
    do {
        invalidInstructionException();
    } while( true );
    }
    ```

    * the initial lines are for the stack canary and can be ignored: it is compiler-generated and not relevant to the program logic

    * ```memset``` starts at address of ```local_a8``` and writes '0' for '0x98' bytes (152 bytes, in decimal): this is done just to clear the structure

    * the next few lines refer Linux signals, but the core logic of the program is unchanged

    * the main infinite loop mentions ```invalidInstructionException()```, which is used by Ghidra to denote instructions like ```UD2``` (or other undefined opcodes), which cause an invalid opcode exception and stops the normal flow: following which the signal 'SIGILL' is sent to program

    * this is used as a form of control-flow obfuscation to prevent static analysis

* in Ghidra, click on the ```invalidInstructionException()``` function from the decompiled code: this shows the program listing, where we can see further code is not disassembled properly (instead of Assembly instructions, we see question marks '??')

* highlight the rest of the code in the listing view (everything after the UD2 instruction), and right-click and click on 'Disassemble': this disassembles rest of the code

* now we can scroll further in the Assembly instructions and check for the program logic

* we can see functions like ```<EXTERNAL>::strlen``` and ```<EXTERNAL>::strncmp``` are called: this could be responsible for the string comparison

* clicking on the multiple occurrences of ```strncmp``` function gives us these string snippets: ```Itz```, ```_0n```, ```Ly_```, ```UD2```

* this gives us the possible password: ```Itz_0nLy_UD2``` - this works and we get the flag for the challenge

* alternatively, we can also use other disassembly tools like Cutter: where we can use the Hexdump view: this also shows the password string
