# use your IDA

额...QAQ ...这题出了个小差错...给各位大师傅 带来的不便还请谅解， 借鉴了下看雪的溢
出思路， 其他的思路是我自己设计用汇编写的， 某几位大师傅还请口下留德。 在处理 flag
的时候的的循环少写了一次， 当时可能出题写代码写累了， 少循环了一次。 造成了某四位多
解的情况。

出题思路是： 前面一个输入函数， 将 flag 读入系统栈， 然后进入一个混淆的伪 flag 验证函
数， 验证函数里面， 提示得很明显，（可以返回到我写的另外一个混淆的伪 flag 函数）， 只要
看懂了， 程序怎么访问 flag 的话， 在 od 中搜索访问 flag 的指令相关指令就行。 然后， 就会
发现其中的奥秘。

剩下的是处理那堆混淆：

和一些大师傅交流过后， 有下面几种思路：

1. python 正则处理 （出题的时候， 也是这么想的）
  将混淆代码去掉， 然后匹配成相应的语句， 逆向过来就行

2. OD 脚本处理
  大师傅给了个 OD 脚本， 还没搞

3. 爆破验证（操作最骚， 最简单）
  查看最终 flag 比较的内存验证， 然后试输入， 比对内存， 获得 flag。

4. angr 跑
  (是时候学习一波了！）

5. 汇编能力够强， 不熟悉 Python,可用 notepad++的正则（当然用 py 更好）， 匹配然
  后逆向写 keygen。

#### 相关脚本：

   发现还是大师傅们写得好， 于是放上了南航师傅的脚本。

** decrypt.py**

```python
#	-*- coding:utf-8	-*-

import re
import ctypes

flag_pattern =  "\[ebx\+([\s\S]+)\]"
operation_pattern = "eax,\ ([\s\S]+)"
file = open("IDA.txt",'r',encoding='utf-8')
operation = []
flag_op = []
for i in range(20):
	flag_op.append([])
for eachline in file:
	operation.append(eachline)

flag = [0xf2,0x6e,0xd1,0xb1,0x7e,0x8b,0x3e,0x8e,0xb1,0x67,0x6e,0xe2,0xf7,0xa8,0x3d,0xce,0x2f,0xb0,0xec,0x0]
length = len(operation)
index = 0
while index < length:
	# this mean that we have a operation about our flag
	if "movzx" in operation[index]:
		# print(operation[index])

		msg = re.findall(flag_pattern, operation[index])[0]
		if 'h' in msg:
			msg = msg[:-1]

		flag_index = int(msg,16)-1
		index += 1
		# first ,we checkout push is in it 
		if "push" in operation[index]:
				while not ("pop"  in operation[index] and "push" not in operation[index+1]):
					index += 1
				# now index is in pop
				index += 1
				
		if "add" in operation[index]:
			num = re.findall(operation_pattern, operation[index])[0]
			if 'h' in num:
				num = num.replace('h','').strip()
			flag_op[flag_index].append("+" + str(int(num,16)))
			# print(index)
			index += 1
		elif "sub" in operation[index]:
			num = re.findall(operation_pattern, operation[index])[0]
			if 'h' in num:
				num = num.replace('h','').strip()
			flag_op[flag_index].append("-" + str(int(num,16)))
			index += 1
		elif "xor" in operation[index]:
			num = re.findall(operation_pattern, operation[index])[0]
			if 'h' in num:
				num = num.replace('h','').strip()
			flag_op[flag_index].append("^" + str(int(num,16)))
			index += 1
		else:
			print("I forget %s!"%operation[index])
		
		# then ,we should check out the next is mov or not, because there are push to obscure
		if "mov" in operation[index]:
			# this mean our operation is finish
			# print("Ohhh no , we skip {}".format(operation[index]))
			continue
		else:
			# this is obsecure with operation
			if "push" in operation[index]:
				while not ("pop"  in operation[index] and "push" not in operation[index+1]):
					index += 1
				# now index is in pop
				index += 1
			# print("we finish pop at {}".format(operation[index]))
			# next ,we check if we need others operations
			if "add" in operation[index]:
				num = re.findall(operation_pattern, operation[index])[0]
				if 'h' in num:
					num = num.replace('h','').strip()
				flag_op[flag_index].append("+" + str(int(num,16)))
			elif "sub" in operation[index]:
				num = re.findall(operation_pattern, operation[index])[0]
				if 'h' in num:
					num = num.replace('h','').strip()
				flag_op[flag_index].append("-" + str(int(num,16)))
			elif "xor" in operation[index]:
				num = re.findall(operation_pattern, operation[index])[0]
				if 'h' in num:
					num = num.replace('h','').strip()
				flag_op[flag_index].append("^" + str(int(num,16)))
				# xor 
				index += 1
			# and next must be "mov"
			elif "mov" in operation[index]:
				continue
			else:
				print("I must be wrong at {}".format(operation[index]))
				index += 1
			if "mov" not in operation[index]:
				if 'push' in operation[index]:
					while not ("pop"  in operation[index] and "push" not in operation[index+1]):
						index += 1
						# now index is in pop
					index += 1
					# this must be mov 
					if "mov" not in operation[index]:
						print("My gold {}".format(operation[index]))
				else:
					print("this has some question {}".format(operation[index]))
				
	else:
		index += 1

print(flag_op[0])
# print(flag_op[1][1] == flag_op[0][1])
for i in range(0,256):
	num = i
	for each_op in flag_op[0]:
		if each_op[0] == '-':
			num = num - int(each_op[1:])
		elif each_op[0] == '+':
			num = num + int(each_op[1:])
		elif each_op[0] == '^':
			# flag[i] ^= int(each_op[1:], 16)
			num = ctypes.c_ubyte(num).value ^ ctypes.c_ubyte(int(each_op[1:])).value	
	# print(num,end= ',')
	if ctypes.c_ubyte(num).value == 0xf2:
		print(i)
		break

for i in range(len(flag_op)):
	flag_op[i].reverse()
	for each_op in flag_op[i]:
		if each_op[0] == '-':
			flag[i] = flag[i] + int(each_op[1:])
		elif each_op[0] == '+':
			flag[i] = flag[i] - int(each_op[1:])
		elif each_op[0] == '^':
			# flag[i] ^= int(each_op[1:], 16)
			flag[i] = ctypes.c_ubyte(flag[i]).value ^ ctypes.c_ubyte(int(each_op[1:])).value

print(flag)
for i in flag:
	print(chr(ctypes.c_ubyte(i).value),end = '')
```

