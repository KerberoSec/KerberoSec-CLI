# Milk's Best Friend

### Prompt

There's nothing I love more than oreos, lions, and winning. 

https://mega.nz/#!DC5F2KgR!P8UotyST_6n2iW5BS1yYnum8KnU0-2Amw2nq3UoMq0Y 

Have Fun :)

### Approach

- Ran ```binwalk``` on the provided image, and discovered an embedded ```.RAR``` file.

- Then ran the following command to extract the embedded .RAR file. Then extracted the RAR to obtain some more files.

  ```
  binwalk --dd='.*' oreo.jpg
  ```

  [![https://imgur.com/yqSYS5Q.png](https://imgur.com/yqSYS5Q.png)](https://imgur.com/yqSYS5Q.png)

- I then ran ```strings``` on both newly extracted files, ```a``` was just a misdirection, scrolling down ```b``` revealed the flag.

  [![https://imgur.com/FvTfL9N.png](https://imgur.com/FvTfL9N.png)](https://imgur.com/FvTfL9N.png)

  [![https://imgur.com/romaR53.png](https://imgur.com/romaR53.png)](https://imgur.com/romaR53.png)

- Classified as 'Medium' difficulty, but should've been 'Easy' IMO.

- Flag obtained : ```flag{eat_more_oreos}```
