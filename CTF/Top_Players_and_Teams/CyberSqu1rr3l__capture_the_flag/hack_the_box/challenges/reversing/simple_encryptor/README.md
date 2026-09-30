```
 ____  _  _      ____  _     _____   _____ _      ____ ____ ___  _ ____ _____ ____  ____ 
/ ___\/ \/ \__/|/  __\/ \   /  __/  /  __// \  /|/   _Y  __\\  \///  __Y__ __Y  _ \/  __\
|    \| || |\/|||  \/|| |   |  \    |  \  | |\ |||  / |  \/| \  / |  \/| / \ | / \||  \/|
\___ || || |  |||  __/| |_/\|  /_   |  /_ | | \|||  \_|    / / /  |  __/ | | | \_/||    /
\____/\_/\_/  \|\_/   \____/\____\  \____\\_/  \|\____|_/\_\/_/   \_/    \_/ \____/\_/\_\
```
On our regular checkups of our secret flag storage server we found out that we were hit
by ransomware! The original flag data is nowhere to be found, but luckily we not only
have the encrypted file but also the encryption program itself. [^1]

Can you decrypt the flag using the encryption program?
-----------------------------------------------------------------------------------------
First, we verify that the downloaded ZIP file has the correct SHA-256 check sum with the
sha256sum -c command. Then, we extract the ZIP archive with the given password and open
up a Ghidra [^2] instance to analyze the `encrypt` binary. In the main function, we can
now identify the steps from the original flag to the encrypted one. In order, to read the
code more easily, we now reaname the variables and types with guessed names.

```c
undefined8 main(void) {
  int random_value;
  time_t current_time;
  long in_FS_OFFSET;
  uint current_time_seed;
  uint random_shift;
  long i;
  FILE *original_flag_file_stream;
  size_t file_size;
  void *file_data;
  FILE *encrypted_flag_file_stream;
  long local_10;
  
  local_10 = *(long *)(in_FS_OFFSET + 0x28);
  original_flag_file_stream = fopen("flag", "rb");
  fseek(original_flag_file_stream, 0, 2);
  file_size = ftell(original_flag_file_stream);
  fseek(original_flag_file_stream, 0, 0);
  file_data = malloc(file_size);
  fread(file_data,file_size, 1, original_flag_file_stream);
  fclose(original_flag_file_stream);
  current_time = time((time_t *)0x0);
  current_time_seed = (uint) current_time;
  srand(current_time_seed);
  for (i = 0; i < (long) file_size; i = i + 1) {
    random_value = rand();
    *(byte *)((long)file_data + i) = *(byte *)((long)file_data + i) ^ (byte)random_value;
    random_shift = rand();
    random_shift = random_shift & 7;
    *(byte *)((long)file_data + i) =
         *(byte *)((long)file_data + i) << (sbyte)random_shift |
         *(byte *)((long)file_data + i) >> 8 - (sbyte)random_shift;
  }
  encrypted_flag_file_stream = fopen("flag.enc", "wb");
  fwrite(&current_time_seed, 1, 4, encrypted_flag_file_stream);
  fwrite(file_data, 1, file_size, encrypted_flag_file_stream);
  fclose(encrypted_flag_file_stream);
  if (local_10 != *(long *)(in_FS_OFFSET + 0x28)) {
    __stack_chk_fail(); /* WARNING: Subroutine does not return */
  }
  return 0;
}
```
The for loop now contains the encryption mechanism and luckily, the random seed, i.e.
the current time at encryption, was saved to the encrypted file. Therefore, we can write
a decryption script now, that first reads the random seed and then reverses the XOR and
rotation encryption. Please refer to the script `decrypt.c` to see, how the reversed
decryption now works. We can compile this with `gcc` and then run the executable to get
the original flag `flag.dec`.

[^1]: https://app.hackthebox.com/challenges/Simple%2520Encryptor?tab=play_challenge
[^2]: https://ghidra-sre.org/
