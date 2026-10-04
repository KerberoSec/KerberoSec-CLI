# MD5Play 2
##### Just understand the code ;)

This one's easy. We find that the code takes an md5 param and a value with the following rules:
- Must be an MD5    
- Length = 3
- Non-numeric
- floatval of MD5 must be equal to md5 value

Now, you should know that PHP truncates floatval, so it's simple to find the answer.

Just have to generate a string that returns a floatval of 0 while giving a hash, like `cq1`.        
Simply put, PHP logic: `0 = fa294db4407136207cc7d17009c5c07e`

<details>
<summary>FLAG</summary> 

`radar{s0m3_bug5_1s_fun}`
</summary>
