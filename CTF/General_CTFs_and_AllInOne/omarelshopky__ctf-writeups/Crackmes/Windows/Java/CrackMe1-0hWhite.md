# Crackmes

## CrackMe1: 0hWhite

**Platform:** *Windows* | **Language:** *Java*
                        |
**Arch:** *java*        | **Difficulty:** *1.0*   

### Description
An extremely simple crackme for beginners!
If you've managed to crack the program, feel free to post a comment/solution :)

### Explanation
Ok, so there's simply just a 8-digit key that you must figure out in order to unlock the program. But, if you have some reverse engineering skills it should be pretty easy to unlock the program without a key ;)

### Answer
* Download the [**file**](https://crackmes.one/static/crackme/5f0c333633c5d42a7c6679b1.zip), then extract it with the password 'crackmes.one'
* Execute the jar file to see its behavior, which shows us its output:
```sh
    Enter an 8 digit code: [You Enter digits]
    Press any key to continue . . .
```
* We need to decompile the java app to read its code and know what is the password
>*Note that you can download [jd-gui](http://java-decompiler.github.io/) or use the [online decomplier](http://www.javadecompilers.com/)*

Decompiling will give us this code
```java
package me.ohwhite.crackme1;

import java.util.ArrayList;
import java.util.Scanner;

public class eahUaRpTUmfhN {
  static ArrayList<Integer> nums = new ArrayList<>();
  
  static ArrayList<String> strings = new ArrayList<>();
  
  public static void main(String[] SqbnompFlDpDc) {
    app();
    initAdd();
    System.out.println(strings.get(0));
    Scanner in = new Scanner(System.in);
    try {
      int userInput = in.nextInt();
      if (userInput != ((Integer)nums.get(0)).intValue())
        return; 
    } catch (Exception sqOKMTghgGjWK) {
      System.exit(-7);
    } 
    System.out.println(strings.get(1));
  }
  
  public static void initAdd() {
    nums.add(Integer.valueOf(5256));
  }
  
  public static void app() {
    strings.add("Enter an 8 digit code: ");
    strings.add("You have successfully logged in!");
  }
}
```
* The decompiling process randomizes the variables and functions names so let's rename them to better understand the code
```java
package me.ohwhite.crackme1;

import java.util.ArrayList;
import java.util.Scanner;

public class Main {
  static ArrayList<Integer> nums = new ArrayList<>();
  
  static ArrayList<String> strings = new ArrayList<>();
  
  public static void main(String[] args) {
    app();
    initAdd();
    System.out.println(strings.get(0));
    Scanner in = new Scanner(System.in);
    try {
      int userInput = in.nextInt();
      if (userInput != ((Integer)nums.get(0)).intValue())
        return; 
    } catch (Exception e) {
      System.exit(-7);
    } 
    System.out.println(strings.get(1));
  }
  
  public static void initAdd() {
    nums.add(Integer.valueOf(5256));
  }
  
  public static void app() {
    strings.add("Enter an 8 digit code: ");
    strings.add("You have successfully logged in!");
  }
}
```
* As we can see, at first he built two lists one to hold the output's strings, and the other for hold integers with adding '5256' to it at the beginning *initAdd()*
* Then he takes the user input, compares it with the first element in the numbers list which is '5256'
* Try it as a password
```sh
Enter an 8 digit code:
5256
You have successfully logged in!
Press any key to continue . . .
```
* You got the password!!

### The Password
 > 5256
