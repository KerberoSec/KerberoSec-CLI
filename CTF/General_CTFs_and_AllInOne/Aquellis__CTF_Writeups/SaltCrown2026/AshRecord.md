# Ash Record

| Category |Difficulty|
|:--------:|:--------:|
|  Coding  |  Medium  |

**Skills learned:**
* Python coding

## Description
Aeron's scouts found a riverside hamlet that should have been starving. The
ovens were still warm. The stew pot was fresh. The chairs were set, then
abandoned mid-meal. Elowen Ashglass reads the scene like a staged
confession: soot where it shouldn't cling, drag-marks that don't match
panic, footprints that kept their spacing instead of scattering. This
wasn't a raid: it was a procession, and someone wanted the hamlet
preserved, not burned.

Elowen has recovered residues across the site, each carrying a timestamp
and a material type. She also holds the extraction sequence she suspects
was followed: the order materials would appear in if hands moved people
out calmly, stage by stage, from entry to compliance to departure. She
needs the longest prefix of that sequence she can actually confirm: a
subsequence of residues matching it in order, where no two consecutively
matched residues are closer together than a minimum gap, because no stage
of an orderly extraction happens faster than that.

## Example Code Input & Output
```
The first line contains three space-separated integers: N P min_gap.
N is the number of recovered residues.
P is the length of the suspected extraction sequence.
min_gap is the minimum time difference required between any two consecutively
matched residues.

The second line contains P space-separated strings: the material types in the
extraction sequence, in order.

Each of the next N lines describes one recovered residue as two space-separated
values: an integer timestamp and a material type string.

Residues are not necessarily given in timestamp order.

Print a single integer: the maximum number of consecutive steps from the
beginning of the extraction sequence that can be confirmed by a subsequence
of residues satisfying the time gap constraint.

1 <= N <= 5000
1 <= P <= 12
1 <= min_gap <= 10
1 <= timestamp <= 10000
Material type strings consist of lowercase letters, length <= 10

Example:

Input:
5 4 3
ash rope oil ash
1 ash
4 rope
7 oil
10 ash
11 rope

Expected output:
4

The suspected extraction sequence is: ash, rope, oil, ash.
The minimum time gap between consecutively matched residues is 3.

Confirming the full sequence of 4 steps:
  Step 1: residue at timestamp 1, type ash.
  Step 2: residue at timestamp 4, type rope.  Gap from step 1: 3 >= 3.
  Step 3: residue at timestamp 7, type oil.   Gap from step 2: 3 >= 3.
  Step 4: residue at timestamp 10, type ash.  Gap from step 3: 3 >= 3.

All four steps are confirmed with valid gaps, so the answer is 4.
The residue at timestamp 11 (rope) is not needed for this match.
```

## Logic
I solved this problem by creating:
* An ordered list of **recovered residues** (resList) 
* A sorted list of tuples (pairs), where each tuple holds (int timestamp, string residue) for each **residue and timestamp pair**

For each residue in the resList, do two things:
* Find a tuple where the string residue matches
* Take the matching timestamp and confirm there is at least a minGap difference between the previous timestamp in the extraction sequence and the current one

Both of these checks must pass in order for number of confirmed extraction sequence steps to be increased. For every confirmed steps, increase the number of valid steps (validSteps).

Start the docker container and begin coding in your browser. **Note: The tool's input() function reads the next full line of input.**

## Code
```python
# Read the number of recovered residues (N), length of extraction sequence (P)
# and minimum time gap between steps (min_gap) from input
# Then split the entire list of input into separate values
readNPgap = input()
inputSplit = readNPgap.split()

# Convert the list of input values from string to int
numResidues = int(inputSplit[0])
numSteps = int(inputSplit[1])
minGap = int(inputSplit[2])

# Read the sequence of residues and split them into separate values
residueList = input()
inputSplit = residueList.split()

# Create an empty list and append all separate residues into it
resList = []
for i in inputSplit:
    resList.append(i)

# Create an empty array to hold tuples containing (int timestamp, string residue)
pairs = []

# Read the list of timestamps and residues from input, split them into separate values
# and convert the timestamps from string to int
for _ in range(numResidues):
    readExt = input()
    inputSplit = readExt.split()
    time = int(inputSplit[0])
    res = inputSplit[1]

    # Append each tuple to the list, storing each pair of recovered residues with their timestamps
    pairs.append((time, res))

# Sort the list of tuples by timestamps in ascending order
pairs.sort()

# Create a running total of valid steps in the sequence
validSteps = 0

# Initialize the value of prevTimeStamp to negative infinity (ensures the next real timestamp is greater than this)
prevTimeStamp = -float('inf')

# For each step in the extraction sequence, find the (timestamp, residue) pair that matches the residue
# and has a timestamp at least minGap difference to the previous step
# If both checks pass, then increment the count of validSteps by 1 and update the value of prevTimeStamp
for res in resList:
    for timestamp, recRes in pairs:
        if recRes == res and (timestamp - prevTimeStamp >= minGap):
            validSteps += 1
            prevTimeStamp = timestamp
            break

# Print the final result of confirmed valid steps in the extraction sequence
print(validSteps)
```

## Flag:
After your code successfully passes all test cases, you will be given the flag.
**HTB{th3_h4ml3t_\*\*\*_\*\*\*\*_\*\*\*_\*\*\*\*\*\*}**