## Challenge 🧩

In a haunted graveyard, spirits hide among the numbers. Can you identify the smallest and largest among them before they vanish?

We’ve intercepted codes from an underground organisation with intentions of malicious activity. Intelligence has informed us that most of the numbers are garbage, but the biggest and smallest numbers in the file form co-ordinates of the group’s next attack location.

Identify these 2 numbers, then print out first the minimum and then the maximum. Please be swift, agent: the clock is ticking!
```
Example

Input
3.29 3.09 1.34 2.89

Output
1.34
3.29
```

## Solution 🕵️‍♂️

```python
n = input()

num_list = list(map(float, n.split()))
min_value = min(num_list)
max_value = max(num_list)

print(f"{min_value}\n{max_value}")
```

## Flag 🚩

`HTB{aLL_maX3d_0uT_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx}`
