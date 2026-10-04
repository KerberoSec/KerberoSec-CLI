# level 11

```
ssh bandit11@bandit.labs.overthewire.org -p 2220
```

> ### The password for the next level is stored in the file data.txt, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions

```
cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

<img width="658" height="74" alt="image" src="https://github.com/user-attachments/assets/70c30dfd-d3b8-4d04-afdd-9f240bb27056" />

<img width="1439" height="386" alt="image" src="https://github.com/user-attachments/assets/6799292a-4c1b-47f4-8e28-c11767154484" />

```
7x16WNeHIi5YkIhWsfFIqoognUTyj9Q4
```

