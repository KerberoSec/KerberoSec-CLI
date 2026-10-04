# Win12 License Checker

## The Challenge

After the deprecation of Windows 10, the IT department has decided to upgrade all
systems to Macrohard Linux 12. However, they have encountered an issue with license
verification. The customer support of Macrohard GmbH provided them a program to
validate their license. Can you help them understand why their key is not working?

## Description

You are provided with a binary named `win12_license_checker`. When executed, it
prompts for a license key input. However, any input provided results in a rejection
message. Your task is to analyze the binary, understand the license verification
mechanism, and craft a valid license key that will be accepted by the program.

## Writeup

Open the binary in your decompiler of choice, you quickly understand it's Written
in Rust™️. After finding the main entrypoint you can search for a successful message
and start reverse engineering the transformation applied to your input.
!Decompilation of the scrambling code
We can export the `ENCODED_FLAG` variable and reverse the operations executed to
decode the flag.
Once found the code that scrambles the flag, the challenge is also easily solvable
with an LLM like [ChatGPT](https://chatgpt.com/share/6901d8dd-b234-8012-bd6b-b2eeba67d7d2).
