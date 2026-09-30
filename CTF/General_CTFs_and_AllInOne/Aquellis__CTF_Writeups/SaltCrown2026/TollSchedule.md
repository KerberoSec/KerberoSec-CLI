# Toll Schedule

| Category | Difficulty|
|:--------:|:---------:|
|  Coding  |    Easy   |

**Skills learned:**
* Python coding

## Description
Stonepass doesn't close for weather anymore. It closes on words
borrowed from weather: "raiders," "avalanches," "public order": while the
schedule underneath keeps quietly playing favourites: one banner's convoys
glide through, another's stack up in the snow until daylight dies. Elric
Ashspar has spent weeks sketching the checkpoint's hardware and is certain of
one thing: the mechanism isn't broken. It's tuned. To prove it, Elric first
needs the number nobody at the gate wants published: the least total time this
 exact column of convoys could possibly spend waiting, under any legal
assignment of clearances to convoys. Each convoy reaches the pass at a known
time; each clearance opens at a known time and can seat exactly one convoy, no
 earlier than its arrival. Elric must find the assignment that minimises the
column's total wait: the clean baseline the real schedule will be measured
against.

## Example Code Input & Output
```
The first line contains two space-separated integers: N and G.
N is the number of convoys.
G is the number of available checkpoint clearances (G >= N).

The second line contains N space-separated integers: the arrival time of each
convoy (in any order).

The third line contains G space-separated integers: the opening time of each
checkpoint clearance (in any order).

A convoy may only be assigned to a clearance that opens at or after the
convoy's arrival time. Each convoy must be assigned to exactly one clearance.
Each clearance can handle at most one convoy. It is guaranteed that a valid
assignment exists.

Print a single integer: the minimum total waiting time across all convoys,
where the waiting time for a convoy is its clearance's opening time minus
the convoy's arrival time.

1 <= N <= 1200
N <= G <= 1500
1 <= arrival time <= 200
1 <= clearance opening time <= 220
It is guaranteed that every convoy can be assigned to a distinct clearance

Example:

Input:
4 4
2 4 6 9
3 5 8 11

Expected output:
6

The four convoys arrive at times 2, 4, 6, and 9.
The four checkpoint clearances open at times 3, 5, 8, and 11.

One valid assignment that achieves the minimum total wait:
  Convoy arriving at 2 -> clearance opening at 3.  Wait: 1.
  Convoy arriving at 4 -> clearance opening at 5.  Wait: 1.
  Convoy arriving at 6 -> clearance opening at 8.  Wait: 2.
  Convoy arriving at 9 -> clearance opening at 11. Wait: 2.

Total waiting time: 1 + 1 + 2 + 2 = 6.
```

## Logic
I solved this problem by creating two sorted lists:
* One containing the times of each **convoy arrival** (convoyArrivals)
* One containing the times of each **checkpoint clearance opening** (checkPointOpens)

For each convoy arrival, do four things:
* Iterate through checkPointOpens to find the first open checkpoint open **at the same time or after** the convoy arrived
* **Pop** the convoy's assigned checkpoint time from the checkPointOpens list (each convoy must take a unique checkpoint)
* Calculate how long the convoy waited for the checkpoint clearance to open and add it to the running total (totalWaitTime)

## Code
```python
# Read the number of convoys (N) and number of checkpoint clearances (G) from input
readNG = input()

# Split the input into the two separate string values then convert them to int
splitInput = readNG.split()
numConvoys = int(splitInput[0])
numCheckpoints = int(splitInput[1])

# Read all of the convoy arrival times from input, then split them into individual elements
arrivalTimes = input()
splitInput = arrivalTimes.split()

# Create an empty list to hold int values of all convoy arrival times
convoyArrivals = []

# For every time in the arrivalTimes list, convert it to int 
# and append it to the convoyArrivals list
for time in splitInput:
    convoyArrivals.append(int(time))

# Read all of the checkpoint opening times from input, then split them into individual elements
openTimes = input()
splitInput = openTimes.split()

# Create an empty list to hold int values of checkpoint opening times
checkPointOpens = []

# For every time in the openTimes list, convert it to int
# and append it to the checkPointOpens list
for time in splitInput:
    checkPointOpens.append(int(time))

# Sort both lists into ascending order
convoyArrivals.sort()
checkPointOpens.sort()

# Create the counter for total time convoys spent waiting for an open checkpoint
totalWaitTime = 0

# For every convoy that arrives, check for a checkpoint opening
# time that is greater than or equal to the convoy arrival time
for convoy in convoyArrivals:
    for index in range(len(checkPointOpens)):

        # Start at the beginning of the list of checkpoint open times
        opentime = checkPointOpens[index]

        # Add the convoy's waiting time to the running total
        # and remove the checkpoint open time that is taken by the convoy
        if opentime >= convoy:
            totalWaitTime += opentime - convoy
            checkPointOpens.pop(index)
            break

# print the total waiting time among all convoys
print(totalWaitTime)
```

## Flag:
After your code successfully passes all test cases, you will be given the flag.
**HTB{th3_p4ss_\*\*\*\*\*\*\*_\*\*\*_\*\*\*\*\*\*}**