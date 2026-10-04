# Salted Fate: Solution

## Vulnerability

The login endpoint introduces a sleep delay that grows based on how many characters of the submitted password match the real one. This is a timing side-channel.

## Approach

The password is a random 8-digit number. Since the server leaks timing information per character, you can recover it one digit at a time.

For each position (0 to 7):
1. Try all 10 digits at that position while keeping the known prefix fixed.
2. Measure the response time for each candidate.
3. The digit that causes the longest response time is correct.

Repeat until all 8 digits are found, then log in to retrieve the flag.

## Tools

Python with the `requests` library. Multiple timing samples per candidate are taken and outliers are trimmed to reduce network noise.