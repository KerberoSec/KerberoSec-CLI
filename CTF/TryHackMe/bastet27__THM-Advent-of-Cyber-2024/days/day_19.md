# 🎄 TryHackMe Advent of Cyber 2024: Day 19: Game Hacking

## Objectives 🎯
- Understand how to interact with an executable's API.
- Learn how to intercept and modify internal APIs using Frida.
- Gain experience hacking a game with the help of Frida.

## Steps 🚀
1. **Setup:**
   - Start the machine and access the VM for the task.
   - Navigate to `/home/ubuntu/Desktop/TryUnlockMe` and launch the game using `./TryUnlockMe`.

2. **Level 1: Cracking the OTP Lock**
   - Start the game and interact with the penguin to trigger the `_Z7set_otpi` function.
   - Use Frida to trace the `set_otp` function and log its argument.
   - Enter the extracted OTP to unlock the first level.

3. **Level 2: Billionaire Item Purchase**
   - Explore the next stage and locate the penguin with the costly item.
   - Trace the `_Z17validate_purchaseiii` function to manipulate the item price.
   - Log the parameters to identify the item ID, price, and player's coins.
   - Set the price parameter to `0` using Frida and purchase the item for free.

4. **Level 3: Biometrics Override**
   - Trace the `_Z16check_biometricsPKc` function to bypass the biometrics check.
   - Log the string parameter and the return value of the function.
   - Use Frida to replace the return value with `True` (`1`) to bypass the check.

5. **Flags Collection:**
   - Extract the flags for each level:
     - OTP flag.
     - Billionaire item flag.
     - Biometric flag.

## Key Findings 🔑
- The game logic relies on library functions that can be intercepted and manipulated using Frida.
- By modifying arguments and return values, it is possible to bypass game challenges and achieve objectives.

## Lessons Learned 🌟
### Tools and Techniques 🛠️
- **Frida:** A dynamic instrumentation toolkit to analyze and manipulate running applications.
- **JavaScript Hooks:** Used for intercepting and modifying library function calls in real-time.
- **Memory Debugging:** Techniques for inspecting and modifying application parameters.

## Final Thoughts 🎁
This task provided a hands-on experience with game hacking using Frida. It highlighted the importance of securing library function calls and validating arguments in applications.

### Answers ✅
1. **What is the OTP flag?**  
   `THM{one_tough_password}`
2. **What is the billionaire item flag?**  
   `THM{credit_card_undeclined}`
3. **What is the biometric flag?**  
   `THM{dont_smash_your_keyboard}`

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | **Game Hacking**                        |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
