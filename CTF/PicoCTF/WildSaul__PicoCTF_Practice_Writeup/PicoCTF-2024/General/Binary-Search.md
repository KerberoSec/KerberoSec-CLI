# Binary Search
##### Tags: `General Skills`
### DESCRIPTION
Want to play a game? As you use more of the shell, you might be interested in how they work! Binary search is a classic algorithm used to quickly find an item in a sorted list. Can you find the flag? You'll have 1000 possibilities and only 10 guesses.
Cyber security often has a huge amount of data to look through: from logs, vulnerability reports, and forensics. Practicing the fundamentals manually might help you in the future when you have to write your own tools!
You can download the challenge files here:
[challenge.zip](https://artifacts.picoctf.net/c_atlas/20/challenge.zip)
Additional details will be available after launching your challenge instance.
##### Một bài về thuật toán tìm kiếm Binary Search.
> Về cơ bản, lần đoán đầu tiên sẽ là 500, nếu như chương trình ra `lower` hoặc `higher` thì sẽ 'đoán' số bằng trung bình tổng của số vừa đoán cộng số nhỏ nhất/lớn nhất trong khoảng.
```
500 -> higher
750 -> lower
625 -> lower
...                                 
```
##### => Lấy flag thành công!
