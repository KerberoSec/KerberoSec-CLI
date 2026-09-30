# Cyber Advent 2022: Day 8 [<span style="color:red;">Smart Contracts</span>] [Last Christmas I gave you my ETH]

Day 8 of [tryhackme](https://tryhackme.com)'s [Advent of Cyber for 2022](https://tryhackme.com/christmas)! This challenge involves learning about smart contracts and their relation to the blockchain. 

#### Learning Objectives
- Explain what smart contracts are, how they relate to the blockchain, and why they are important.
- Understand how contracts are related, what they are built upon, and standard core functions.
- Understand and exploit a common smart contract vulnerability.

#### What flag is found after attacking the provided EtherStore Contract?

**Preface:** This is not my area of expertise, in fact blockchain technology is where my cyber security skills are the weakest so this challenge took me longer than I'd like to admit. However, by reading through the instructions several times I was able to retrieve the flag successfully. 

As for the method to retrieve the flag, follow the instructions until you get to `Step 4`. From here it feels vague but all that needs to be done is put a value [preferably small since it will consume a lot of memory otherwise, for reference I used `1`], and select the `Attack` contract. 

From there you scroll down to `Deployed Contracts` and click attack and wait for the `console.log` to return the flag. 

**Answer:**
```
flag{411_ur_37h_15_m1n3}
```

## Authors

- [Shanks](https://github.com/HunterShanks)