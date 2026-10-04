# Granary Seal
| Category | Difficulty|
|:--------:|:---------:|
|  Coding  | Very Easy |

**Skills learned:**
* Python coding

## Description
The palace granaries are the last thing standing between Crownspireand open starvation. Every ration order that reaches the gatehouse passesthrough three hands: the clerk who raises it, the countersigner who clears it, and the courier who carries it. Lysa Harrowmere keeps a custody roll for each of the three roles: the hands the gatehouse has actually watched work, entry by entry, over seasons of ordinary orders. Since the Signet shattered, forged orders have been slipping through on habit alone: clean wax, an eager countersign, a courier too calm for a crisis. The fakes are good, but never perfect: a hand that has never touched the roll, a clerk standing where a countersigner belongs, a courier no custody entry has ever named. Lysa needs a count of how many orders in the current batch survive the old sequence: every hand present, every hand where it belongs.

## Example Code Input & Output
```
The first line contains an integer C: the number of clerks on the custody roll.
The next C lines each contain one clerk's name.

The following line contains an integer CS: the number of countersigners on the custody roll.
The next CS lines each contain one countersigner's name.

The following line contains an integer R: the number of couriers on the custody roll.
The next R lines each contain one courier's name.

The following line contains an integer N: the number of orders in the batch.
Each of the next N lines describes one order as three space-separated names:
  clerk countersigner courier

Print a single integer: the number of orders in which every hand appears on
its role's custody roll.

1 <= C, CS, R <= 20
1 <= N <= 5000
Names consist of lowercase letters and dots, length <= 30
An order survives only if all three hands are on their role's custody roll

Example:

Input:
3
aldric.vowmark
bren.irongate
seyna.saltholm
3
voss.ashglass
tal.greywater
mira.crownwall
3
garren.cinders
lysa.stonepass
Elric.brinemark 
7
aldric.vowmark voss.ashglass garren.cinders
bren.irongate tal.greywater lysa.stonepass
cassian.embervane voss.ashglass garren.cinders
aldric.vowmark forger.oathstone garren.cinders
seyna.saltholm mira.crownwall ghost.saltwind
bren.irongate voss.ashglass elric.brinemark
seyna.saltholm tal.greywater garren.cinders

Expected output:
4

Orders 1, 2, 6, and 7 have all three hands present on their respective
custody rolls: they survive the old sequence.

Order 3 fails because cassian.embervane does not appear on the clerk roll.
Order 4 fails because forger.oathstone does not appear on the countersigner roll.
Order 5 fails because ghost.saltwind does not appear on the courier roll.
```

## Logic
I solved this problem by creating three lists:
* One containing the names of all offical Clerks (clerkList)
* One containing the names of all official Countersigners (CSignerList)
* One containing the names of all official couriers (courierList)

For every order, we must read the list of given names: but we need to verify three things:
* The first name exists in the clerksList
* The second name exists in the CSignerList
* The third name exists in the courierList

All three checks must pass for the order to be valid. For every valid order, increase the number of valid orders (numCorrectOrders).

Start the docker container and begin coding in your browser. **Note: The tool's input() function reads the next full line of input.**

## Code
```python
# Read the number of clerks (C) and convert the input from string to int
# And initialize the empty clerkList
numClerks = int(input())
clerkList = list(range(numClerks))

# For every clerk name, add it to the clerkList
for x in range(numClerks):
    clerkName = input()
    clerkList[x] = clerkName

# Read the number of countersigners (CS) and convert the input from string to int
# And initialize the empty CSignerList
numCSigners = int(input())
CSignerList = list(range(numCSigners))

# For every countersigner name, add it to the CSignerList
for x in range(numCSigners):
    CSname = input()
    CSignerList[x] = CSname

# Read the number of couriers (R) and convert the input from string to int
# And initialize the empty courierList
numCouriers = int(input())
courierList = list(range(numCouriers))

# For every courier name, add it to the courierList
for x in range(numCouriers):
    courierName = input()
    courierList[x] = courierName

# Read the number of orders from input and convert it from string to int
numOrders = int(input())

# Set a counter for the number of correct orders
numCorrectOrders = 0

# For every order we have, read the custody roll and verify that a person
# having each role (clerk, countersigner & courier) is present
for order in range(numOrders):
    custodyRoll = input()

    # Split the list of custody roll name into 3 names for verification
    # The clerk name is first, countersigner name is second, and courier name is third
    cRollNames = custodyRoll.split()
    clerk = cRollNames[0].strip()
    cSigner = cRollNames[1].strip()
    courier = cRollNames[2].strip()

    # Perform the three verification checks at once
    # And if all checks pass, increase the number of correct orders by 1
    if clerk in clerkList and cSigner in CSignerList and courier in courierList:
        numCorrectOrders += 1

# Print the final number of correct orders provided
print(numCorrectOrders)
```

## Flag:
After your code successfully passes all test cases, you will be given the flag.
**HTB{th3_0ld_\*\*\*\*\*\*\*\*_\*\*\*\*\*_\*\*\*\*\*\*\*\*\*}**