# Invisible Programming

We're given a file `hello_world.cpp`, which doesn't even print `Hello World!` at all!

<details>
  <summary>hello_world.cpp</summary>   
  
   ```
   #include		  	  <iostream> 
using 		 	  namespace std;  
int main			  	 () 
{		 	 		
	cout				 		<<"The flag is d4rk{You_thought_this_will_be that_much_easy}c0de\n"; 
	return 	  		  0; 
		  		} 
			 	  
	  			
		 	 	
	 					
		 	   
		    	
			 		 
		  		
	 					
		 	 	
		    
		 		 	
		  		
	 					
		  		 
			 	 	
		 			 
	 					
			 			
		   	
			 	  
		 	   
	 					
			 			
		 	   
		   	
			 	  
		  	 	
		 	 	
			    
		    	
		   		
		  		
		 	 	
					 	
		   		
		    
		  	  
		  	 	

   ```
   </details>

There's a flag in plain sight, but alas it was not so easy.

There seems to be many redundant spaces and tabs, as well as 40 lines of line feed after the code. What could this mean?

After googling a bit, it seems to resemble WhiteSpace esolang.

Trying to execute it throws some syntax errors, so I quickly gave up on that.

I wrote a script to parse the spaces and tabs as binary, like this:

```
function decoder(str) {
    var flag = '';

    str.replace(/.{7}/g, function (strByte) {
        var binStr = strByte.replace(/ /g, '0').replace(/    /g, '1');
        var charCode = parseInt(binStr, 2);
        result += String.fromCharCode(charCode);
    });

    return flag;
}
```

And then ran it in my browser's console, getting `&3t_hav_m_fun_wth_whtepac}cde`

It seems to be missing some numbers as well as the start of the flag, so lets optimize the `hello_world.cpp` by deleting irrelevant characters.

We get `d49k}Sft_hav_m_fun_wth_whtepac}cde`.

By comparing the two strings, it seems to be saying `Let's have some fun with whitespaces", so let's bruteforce the flag.

And there we go! After substituting in the numbers, we have the flag:

<details>
  <summary>FLAG</summary>   
  
   `d4rk{L3t'5_hav3_50m3_fun_w1th_wh1te5pac35}c0de`
   </details>
