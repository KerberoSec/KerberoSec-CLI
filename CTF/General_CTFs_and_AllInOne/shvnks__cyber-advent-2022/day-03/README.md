# Cyber Advent 2022: Day 3 [<span style="color:red;">OSINT</span>] [Nothing escapes detective McRed]

Day 3 of [tryhackme](https://tryhackme.com)'s [Advent of Cyber for 2022](https://tryhackme.com/christmas)! This challenge involves learning about OSINT techniques. 

### Learning Objectives
- What is OSINT, and what techniques can extract useful information against a website or target?
- Using dorks to find specific information on the Google search engine
- Extracting hidden directories through the Robots.txt file
- Domain owner information through WHOIS lookup
- Searching data from hacked databases
- Acquiring sensitive information from publicly available GitHub repositories

#### What is the name of the Registrar for the domain santagift.shop?

By going to the [WHOIS](https://who.is/whois/github.com) lookup website, we enter either of the provided domains: `santagift.shop` or `qa.santagift.shop` and you will see that the Registar name is NameCheap Inc.

**Answer:**
```
NAMECHEAP INC
```

#### Find the website's source code (repository) on github.com and open the file containing sensitive credentials. Can you find the flag?

Reading through the [Github's README](https://github.com/muhammadthm/SantaGiftShop/blob/main/README.md), leads you to the [config.php](https://github.com/muhammadthm/SantaGiftShop/blob/main/config.php) file which is where you will find the flag on `line 2`.
**Answer:**
```
{THM_OSINT_WORKS}
```

#### What is the name of the file containing passwords?

Coincidentally, the same [config.php](https://github.com/muhammadthm/SantaGiftShop/blob/main/config.php) file from above also contains the passwords.

**Answer:**
```
config.php
```

#### What is the name of the QA server associated with the website?

The answer can be deduced either from the [README](https://github.com/muhammadthm/SantaGiftShop/blob/main/README.md), where they mention the 2 main domains: `santagift.shop` or `qa.santagift.shop`, which you can use deductive reasoning. In addition if you checkout the [config.php](https://github.com/muhammadthm/SantaGiftShop/blob/main/config.php) you will see on `line 20`, a comment that states:
> Incase of QA, it will be qa.santagift.shop

Thus we have found the answer.

**Answer:**
```
qa.santagift.shop
```

#### What is the DB_PASSWORD that is being reused between the QA and PROD environments?

Within the [config.php](https://github.com/muhammadthm/SantaGiftShop/blob/main/config.php) file we can use `ctrl+f` to find the `DB_PASSWORD` for both the QA and PROD environments. You will see the answer on `line 31`.

**Answer:**
```
S@nta2022
```

## Authors

- [Shanks](https://github.com/HunterShanks)