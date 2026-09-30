# Compiled

Download the task file and let's analyze it..

open it in ghidra:

main function
---

<img width="1379" alt="ghidra" src="https://github.com/Lynk4/THM/assets/44930131/b1352f8c-3126-438b-9053-dfead4c677db">

---

The programme prompts the user for a password, which it then keeps in the local_28 variable.
It then determines whether the entered password is equal to __dso_handle. If this is the case, it will print "Try again!" before exiting.
It then compares the input password with _init. If they match, the message "Correct!" appears.
Solution: The password must set the local_28 variable equal to _init. Because the programme records anything between "DoYouEven" and the first occurrence of "CTF," including any characters that are not whitespace, we must enter "DoYouEven_init".

---
<img width="841" alt="Screenshot 2024-03-31 at 3 46 00 AM" src="https://github.com/Lynk4/THM/assets/44930131/0e3c2187-a309-4b0c-8db5-ab7034005dc4">

---
