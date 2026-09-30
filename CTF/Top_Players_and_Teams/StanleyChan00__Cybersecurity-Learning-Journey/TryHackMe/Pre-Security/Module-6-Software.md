# Tryhackme Pre Security: Module 6: Software Basics 

## Data Representation 
As we know, computers communicate through 1s and 0s, called bits. These bits can be used to represent colors.

The process in which we specify colors is explained as follows:

### Representing Colors
All colors come from red, green, and blue. Every color is just a different combination of these 3 colors and by "turning off" or "on" one of these colors, we get a distinctly new color. 

We can understand this concept through bits. Red, green, and blue can each be represented as a bit of `0` for "off" and `1` for "on". 

For example, `000` would be all 3 colors "off". `101` would be red and blue turned "on" while green is "off. 

In combining all these different combinations of "off" or "on" of each color, we would have a total of 8 different color combinations(2 x 2 x 2) with each color specified by it's own set of 3 bits from `000` to `111`.

<img width="591" height="378" alt="Red Green Blue" src="https://github.com/user-attachments/assets/2885d412-3b87-4f81-988c-71b4a615138f" />

#### More Color Variations:

Now, there are obviously a lot more than 8 colors. So to get more of them, we can alter the "shade" of each of these 3 main colors by having the option to tune the individual brightness of each color, thus resulting in more potential color combinations 

The way that is currently used is by having each of these 3 main colors use 8 total bits, resulting in 256 total "shades" of red, 256 total "shades" of green, and 256 total "shades" of blue. 

This now gives us more than 16 million potential color combinations(256 x 256 x 256) each specified by 3 series of 8 bits. Each series of 8 bits is called a **byte** or an octet and each octet gives us the "shade" of each color(red, green, and blue respectively).

As a sample, this color:

<img width="215" height="190" alt="Color" src="https://github.com/user-attachments/assets/5789097e-e3bf-4660-b0f2-3cea3310391b" />

Would look like `10100011 11101010 00101010` in binary. 

#### Hexadecimal Representation of Colors:

Since reading a string of 24 bits is quite impractical, we use hexadecimal digits to make it easier to read(Hexadecimal digits are explained more a couple sections down).

Each Hexadecimal value here represents 4 bits. So to represent a color, we will have a total of 6 hexadecimal digits instead of 24 individual bits.

The hexadecimal digits of `0-9` represent the binary equivalent of `0000` all the way to `1001` while `A-F` represents `1010-1111`

So, `10100011 11101010 00101010` for example would be `A3EA2A`

---

### Binary Representation of Numbers
As we understand already, computers communicate through binary numbers and these binary numbers are read through various means. For example

* Low and High Voltage Signals(Voltage that is defined as high is "1" whereas low voltage would be "0")
* North and South in Magnetic Polarity (Like in Hard Drives)
* Light Presence(Like Fiber optics in which light presence will be "1" or "0" if light is detected or not, or in the modern sense determined by the intensity)

In order to understand how these binary bits are represented as numbers, we have to understand that it operates as a base-2 system, meaning they only work with 2 digits: `0` and `1`.

We understand numbers in human terms as base-10 due to the presence of 10 total digits(0-9). Once we hit 9, we "carry over" to the next "ten" by adding a one and then resetting our current counter back to 0. For example, going from 9-10 would add a 1 in the tens spot while the single digit values would go back to 0, thus "10". This goes on for each decimal point as each "tens" is just the previous "10" multipled by 10.

10 is just ten single digit ones. 100 is just 10 sets of tens. 1,000 is 10 sets of 100 and so on. 

Base-2 Binary works the same way, except it's 2 total digits. 

`0` = 0

`1` = 1

`10` = 2

`11` = 3

and so on. 

If we want to convert a long binary number into decimal, we would visually break it up in the same way a decimal number is broken up: through it's positional value added up together.

In decimal, 314 is not actually 314, but 300 + 10 + 4(the positional values added up together). 

Binary would be the same way but each positional value would be by times 2 instead of times 10. 

For example:

`11001010` has 8 total bits. 

From the right, the first bit's positional value is `2^0 = 1`(However, the value here is `0`, so we can imagine it as turned "off" and not needing to add it to anything) while the last bit(the first one from the left) has the positional value of `2^7 = 128`.

So to convert this binary into decimal, we just add up all the values that are turned "on" through the ones. Here, it would be `128 + 64 + 0 + 0 + 8 + 0 + 2 + 0` = `202`. 

Thus `11001010` = `202`

### Hexadecimal 

Since binary is a nightmare to read on it's own, we can use hexadecimal numbers, as base-16, to condense it down and make it easier on our eyes to read.

As stated already, hexadecimal digits go from `0-9`, then from `A-F` and represent the decimal numbers of 0-15(0-9 and 10-15 respectively). 

It is slightly more complex than binary since we can't simply imagine each positional value as "turned on/off". Instead, we multiple the value of each digit by its positional value(as base-16) and add everything up together.

For Example: `9BDF`

The `9` in this case would be $9 * 16^3 = 36,864$.

`B` Would be $11 * 16^2 = 2816$

`D` Would be $13 * 16^1 = 208$

`F` Would be $15 * 16^0 = 15$

Thus `9BDF` = 39,903

**Octal** digits would be base-8 and represent `0-7` using those same values as its digits(no letters like hexadecimal). The process is the exact same with each positional value being $8^x$

## Data Encoding

Encoding is the process of turning these binary values into characters by agreeing on which values are used to represent which characters. Thus, it's how these hardware signals are able to be converted into readable characters that we can actually interact with.

Reading a file using a different encoding than the original user who made it is how we get gibberish on our end reading it.

One of the earliest encoding protocols was the **American Standard Code for Information Interchange(ASCII)**

### ASCII

ASCII is an encoding from 1963 which used 7 bits, and thus only had 128 usable characters. 

It's an American system, so it covered basic English letters, digits, punctuation and some other command hardware characters(like Tab, DEL, etc).

It also had it mapped out in order sequentially . So the upper case letters `A`,`B`, and `C`, for example, would be mapped out in hexadecimal as 41, 42, and 43 respectively.

Extended ASCII opened up more character space via an 8th bit which now expanded the limit to 256 characters vs 128. This allowed for the "ISO/IEC 8859" standard, which mapped out 15 different variations of these extra 128 usable characters to various language sets.

However despite this, it was still limited as you could not use different variations of this standard within the same document as only one of these variational maps could be used at a time. 

### Unicode 

To solve these limitations, Unicode was developed which supports over a million characters from languages, to emojis, and more, all fitting within the same universal standard. 

So rather than mapping characters to each byte, Unicode maps each character to **"Code Points"**, which are written as `U+XXX`

Now, there are 3 different formats of Unicode, each with their unique pros and cons and use for different purposes. There is UTF-8, UTF-16, and UTF-32.

UTF-8 uses a variable width system meaning that it maps the code points to 1-4 bytes dynamically. English and the original ASCII set all use 1 byte. 2 bytes are for Greek, Hebrew, Arabic, etc. 3 bytes for Asian characters. 4 Bytes for emojis and more. 

So the character being used by UTF-8 dictates how many bits it is using for that specific character. 

UTF-32 on the other hand uses 4 bytes for every single character. Comparing these two formats, we can see that UTF-32 would then have the downside of wasting so much space and storage. However, it comes with the upside of being much faster as it does not have to spend the CPU power in determining which set of bytes represent which character. It's simply that the 100th character for example starts at the 400th byte. 

UTF-8 in contrast takes more processing power as it has to start from the beginning of each byte to identify where each character starts and ends from and see how wide each character is. (UTF-8 has a standard in which the start of the bytes tells the system how many bytes the character uses).

UTF-16 would be like the "middle ground" which uses either 2 or 4 bytes. 

## Python: Simple Demo

I am familiar with Python so I won't go over all the concepts here. However, the lesson went over variables, while loops, as well as if/else conditional statements.

It then allowed us to use a VM to play with some Python code as a lab. This time, we had the system pick out a random number between 1 and 20.

Then we allowed the user to input some text as a string to guess the random number the system picked. 

We converted that string into an integer, then nested some conditional statements based off the users guess in relation to the system's number inside a while loop such that the "game" would continue until they correctly guessed the number.

The finished code, along with my comments on what the code does, looks like the below. 

<img width="1208" height="746" alt="Python Code" src="https://github.com/user-attachments/assets/f82d2535-879c-4498-b42e-f76e19ebf999" />

A sample output of the "game" looks like this:

<img width="884" height="367" alt="Python Output" src="https://github.com/user-attachments/assets/fdc4f8fa-e9fb-4fbe-9c82-a21193cd8e19" />

(Note, the lesson along with the JavaScript lesson also briefly went over input validation, although the code is not in the picture above)

## JavaScript: Simple Demo

Same as with Python, I won't go over all the concepts but the lesson also went over variables, constant variables, while loops, as well as if/else statements. 

It then created the same "game" as the previous lesson but in JavaScript. The code, along with my notes, looks like the below:

<img width="1699" height="781" alt="JavaScript Code" src="https://github.com/user-attachments/assets/679f7222-4269-4ee1-9587-ec2fa80d170f" />

## DataBase SQL Basics

A database is just a storehouse of data/information. 

In it, data is stored as a table with columns and rows. The rows represent new pieces of data while columns represent the types of data stored.

We can imagine it as a café storing data of all the orders that's been placed at their shop. 

The table would look like this:

|Order #| Item |Price| Time  |
|:-----:|:----:|:---:|:-----:|
|   1   |Coffee|$2.00|11:00am|
|   2   |Tea   |$1.50|11:05am|
|   3   |Muffin|$2.50|11:10am|

Each row would be a new data record set while each column gives us more information/properties about that data  

In this case, we can see 3 orders that were entered in by the café. We can also see what was ordered as well as the the price and time in which it was ordered. 

This is all stored on the café's database so they can keep track of their orders and can do an analysis on their orders like:

* "How many coffees did we sell today?"
* "What was sold the least today?"
* "What was the highest price selling item?"
* "How much revenue did Coffee bring us today?"
* And much more

### Structured Query Language(SQL)

SQL is the language used for databases. Writing SQL queries is how we analyze that data. By 

Here are some commands we learend this lesson:

`SELECT` - This is how we view/read the data within the database. By typing the names of the columns we want to see after this command, we can then list all said attributes of each record that we commanded. For example `SELECT item, price FROM orders;` would then list the data that looks like this:

| Item |Price|
|:----:|:---:|
|Coffee|$2.00|
|Tea   |$1.50|
|Muffin|$2.50|

Typing `SELECT *` would list all the columns as `*` means all columns. 

`FROM` - This command, like in the example above, extracts data from the exact table that we want. `FROM orders;` for example takes it from the orders table or data set. 

`ORDER BY` - This is how we sort the data. For example, `SELECT * FROM orders ORDER BY price` would sort the data we want to see according to the price. By default, it sorts in ascending order, so the lowest price would be first and highest last. `ORDER BY price DESC` would sort it in descending order. Listing multiple criteria would order it in priority of the first item, then the second, and so on. 

`WHERE` - This is how we filter the data through conditional statements. Whatever criteria gets met here is what gets listed. For example `SELECT Orders WHERE drink = 'coffee';` would filter out all the records in which ONLY the drinks were coffee. 

We can also combine commands together. for example, we can filter by orders after 9:00 and sort it in descending order by price:

`SELECT * FROM orders WHERE time > '09:00' ORDER BY price DESC;`
